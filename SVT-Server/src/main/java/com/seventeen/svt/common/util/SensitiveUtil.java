package com.seventeen.svt.common.util;

import cn.hutool.core.util.ObjectUtil;
import com.seventeen.svt.common.annotation.audit.SensitiveLog;
import com.seventeen.svt.common.annotation.audit.SensitiveStrategy;
import lombok.extern.slf4j.Slf4j;

import java.lang.reflect.Field;
import java.util.Collection;
import java.util.Map;

@Slf4j
public class SensitiveUtil {

    /**
     * 对象脱敏处理
     *
     * @param obj 需要脱敏的对象
     */
    public static void desensitize(Object obj) {
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
                    if (value instanceof String) {
                        // 字符串类型直接脱敏
                        String sensitiveValue = desensitizeValue((String) value,
                                field.getAnnotation(SensitiveLog.class).strategy());
                        field.set(obj, sensitiveValue);
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
                return value;
        }
    }
}