package com.seventeen.svt.common.util;

import cn.hutool.core.util.ObjectUtil;
import com.seventeen.svt.common.annotation.audit.SensitiveLog;
import com.seventeen.svt.common.annotation.audit.SensitiveStrategy;
import com.seventeen.svt.common.config.SensitiveConfig;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.lang.reflect.Field;
import java.util.Collection;
import java.util.Map;

@Slf4j
@Component
public class SensitiveUtil {
    
    private static SensitiveConfig sensitiveConfig;
    
    @Autowired
    public void setSensitiveConfig(SensitiveConfig sensitiveConfig) {
        SensitiveUtil.sensitiveConfig = sensitiveConfig;
    }

    /**
     * 对象脱敏处理（增强版）
     *
     * @param obj 需要脱敏的对象
     */
    public static void desensitize(Object obj) {
        // 配置开关控制
        if (sensitiveConfig != null && !sensitiveConfig.isEnabled()) {
            log.debug("敏感数据脱敏功能已禁用，跳过处理");
            return;
        }
        
        if (obj == null) {
            return;
        }

        try {
            // 处理集合类型
            if (obj instanceof Collection) {
                for (Object item : (Collection<?>) obj) {
                    desensitize(item);
                }
                return;
            }

            // 处理Map类型
            if (obj instanceof Map) {
                for (Object value : ((Map<?, ?>) obj).values()) {
                    desensitize(value);
                }
                return;
            }

            // 处理数组类型
            if (obj.getClass().isArray()) {
                for (Object item : (Object[]) obj) {
                    desensitize(item);
                }
                return;
            }

            // 获取所有字段(包括父类)
            for (Field field : getAllFields(obj.getClass())) {
                // 设置字段可访问
                field.setAccessible(true);

                // 获取字段值
                Object value = field.get(obj);
                if (value == null) {
                    continue;
                }

                // 处理带有@SensitiveLog注解的字段
                if (field.isAnnotationPresent(SensitiveLog.class)) {
                    SensitiveStrategy strategy = field.getAnnotation(SensitiveLog.class).strategy();
                    
                    // 扩展：支持多种数据类型
                    if (value instanceof String) {
                        // 字符串类型直接脱敏
                        String sensitiveValue = desensitizeValue((String) value, strategy);
                        field.set(obj, sensitiveValue);
                    } else if (value instanceof Number) {
                        // 数字类型脱敏（如手机号的Long格式）
                        String numberStr = value.toString();
                        String maskedValue = desensitizeValue(numberStr, strategy);
                        
                        // 根据原类型转换回去，保持数字格式（用0替换*）
                        String numericMasked = maskedValue.replaceAll("[^0-9]", "0");
                        if (value instanceof Long) {
                            field.set(obj, Long.valueOf(numericMasked));
                        } else if (value instanceof Integer) {
                            field.set(obj, Integer.valueOf(numericMasked));
                        }
                    } else if (value instanceof Collection) {
                        // 集合类型递归脱敏
                        desensitize(value);
                    } else if (value instanceof Map) {
                        // Map类型递归脱敏  
                        desensitize(value);
                    }
                } else if (!isBasicType(value.getClass())) {
                    // 递归处理非基本类型字段
                    desensitize(value);
                }
            }
        } catch (Exception e) {
            log.warn("Desensitization failed: {}", e.getMessage());
        }
    }

    /**
     * 获取类的所有字段(包括父类)
     */
    private static Field[] getAllFields(Class<?> clazz) {
        return ObjectUtil.defaultIfNull(clazz.getDeclaredFields(), new Field[0]);
    }

    /**
     * 判断是否为基本类型或其包装类
     */
    private static boolean isBasicType(Class<?> clazz) {
        return clazz.isPrimitive() ||
                clazz == String.class ||
                clazz == Boolean.class ||
                clazz == Character.class ||
                clazz == Byte.class ||
                clazz == Short.class ||
                clazz == Integer.class ||
                clazz == Long.class ||
                clazz == Float.class ||
                clazz == Double.class;
    }

    /**
     * 根据策略对字符串进行脱敏
     */
    private static String desensitizeValue(String value, SensitiveStrategy strategy) {
        if (ObjectUtil.isEmpty(value)) {
            return value;
        }

        switch (strategy) {
            case DEFAULT:
                // 默认策略: 保留首尾字符，中间用*替换
                if (value.length() <= 2) {
                    return "*".repeat(value.length());
                } else if (value.length() <= 4) {
                    return value.charAt(0) + "*".repeat(value.length() - 2) + value.charAt(value.length() - 1);
                } else {
                    return value.substring(0, 2) + "*".repeat(value.length() - 4) + value.substring(value.length() - 2);
                }

            case ID_CARD:
                // 身份证号: 保留前6位和后4位
                return value.replaceAll("(\\d{6})\\d{8}(\\w{4})", "$1********$2");

            case PHONE:
                // 手机号: 保留前3位和后4位
                return value.replaceAll("(\\d{3})\\d{4}(\\d{4})", "$1****$2");

            case PASSWORD:
                // 密码: 全部替换为*
                return "********";

            case BANK_CARD:
                // 银行卡: 保留前4位和后4位
                return value.replaceAll("(\\d{4})\\d+(\\d{4})", "$1********$2");

            case EMAIL:
                // 邮箱: 保留首字符和@后内容
                return value.replaceAll("(\\w?)(\\w+)(\\w)(@\\w+\\.[a-z]+(\\.[a-z]+)?)", "$1****$3$4");

            case NAME:
                // 姓名: 保留姓氏
                return value.replaceAll("([\\u4e00-\\u9fa5]{1})([\\u4e00-\\u9fa5]{1,})", "$1**");

            default:
                // 兜底处理：如果没有匹配的策略，使用默认策略
                return desensitizeValue(value, SensitiveStrategy.DEFAULT);
        }
    }

    /**
     * JSON字符串脱敏处理（新增）
     * 用于对JSON格式的请求体和响应体进行脱敏
     *
     * @param jsonString JSON字符串
     * @return 脱敏后的JSON字符串
     */
    public static String desensitizeJsonString(String jsonString) {
        // 配置开关控制
        if (sensitiveConfig != null && !sensitiveConfig.isEnabled()) {
            log.debug("敏感数据脱敏功能已禁用，返回原始JSON");
            return jsonString;
        }
        
        if (jsonString == null || jsonString.trim().isEmpty()) {
            return jsonString;
        }
        
        try {
            // 使用正则表达式进行简单脱敏，避免复杂的JSON解析
            String result = jsonString
                // 密码类字段脱敏
                .replaceAll("(?i)(\"?(?:password|pwd|pass|payPassword|confirmPassword)\"?\\s*[:=]\\s*\"?)[^,\\s\"\\}]+", "$1\"****\"")
                // 手机号脱敏 
                .replaceAll("(?i)(\"?(?:phone|mobile|tel)\"?\\s*[:=]\\s*\"?)(1[3-9]\\d)(\\d{4})(\\d{4})", "$1$2****$4")
                // 邮箱脱敏
                .replaceAll("(?i)(\"?(?:email|mail)\"?\\s*[:=]\\s*\"?)([^@\"\\s]{1,2})[^@\"\\s]*(@[^\"\\s,\\}]+)", "$1$2***$3")
                // 身份证号脱敏
                .replaceAll("(?i)(\"?(?:idcard|id_card|identity)\"?\\s*[:=]\\s*\"?)(\\d{6})\\d{8}(\\d{4})", "$1$2********$3")
                // 姓名脱敏（中文）
                .replaceAll("(?i)(\"?(?:name|realName|userName)\"?\\s*[:=]\\s*\"?)([\\u4e00-\\u9fa5])([\\u4e00-\\u9fa5]+)", "$1$2**");
            
            log.debug("JSON字符串脱敏完成，原始长度: {}, 脱敏后长度: {}", 
                     jsonString.length(), result.length());
            return result;
            
        } catch (Exception e) {
            log.warn("JSON字符串脱敏处理失败: {}", e.getMessage());
            return "[敏感信息已屏蔽]";
        }
    }
}