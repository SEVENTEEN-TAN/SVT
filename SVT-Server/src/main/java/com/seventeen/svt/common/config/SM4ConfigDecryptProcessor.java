package com.seventeen.svt.common.config;

import com.seventeen.svt.common.util.SM4Utils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.context.EnvironmentAware;
import org.springframework.core.Ordered;
import org.springframework.core.PriorityOrdered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.Environment;
import org.springframework.core.env.MutablePropertySources;
import org.springframework.core.env.PropertySource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * SM4配置解密处理器
 * 使用BeanFactoryPostProcessor在Spring容器初始化前解密配置
 * 
 * @author seventeen
 */
@Component
public class SM4ConfigDecryptProcessor implements BeanFactoryPostProcessor, EnvironmentAware, PriorityOrdered {
    
    private static final Logger logger = LoggerFactory.getLogger(SM4ConfigDecryptProcessor.class);
    
    /**
     * SM4加密值的正则表达式
     * 匹配格式: SM4(密文)
     */
    private static final Pattern SM4_PATTERN = Pattern.compile("SM4\\(([^)]+)\\)");
    
    /**
     * 环境变量中的密钥名称
     */
    private static final String SM4_KEY_ENV = "SM4_KEY";
    
    private ConfigurableEnvironment environment;
    
    @Override
    public void setEnvironment(Environment environment) {
        this.environment = (ConfigurableEnvironment) environment;
    }
    
    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) throws BeansException {
        logger.info("开始处理SM4加密配置");
        
        // 获取SM4密钥
        String sm4Key = getSecretKey();
        if (!StringUtils.hasText(sm4Key)) {
            logger.error("未找到SM4密钥，请设置环境变量 {}", SM4_KEY_ENV);
            throw new IllegalStateException("SM4密钥未配置");
        }
        
        // 处理所有配置属性
        processAllProperties(sm4Key);
        
        logger.info("SM4配置解密处理完成");
    }
    
    /**
     * 获取SM4密钥
     */
    private String getSecretKey() {
        // 尝试从环境变量获取
        String key = System.getenv(SM4_KEY_ENV);
        if (StringUtils.hasText(key)) {
            logger.debug("从环境变量获取SM4密钥");
            return key;
        }
        
        // 尝试从系统属性获取
        key = System.getProperty("sm4.key");
        if (StringUtils.hasText(key)) {
            logger.debug("从系统属性获取SM4密钥");
            return key;
        }
        
        return null;
    }
    
    /**
     * 处理所有配置属性
     */
    private void processAllProperties(String sm4Key) {
        MutablePropertySources propertySources = environment.getPropertySources();
        Map<String, Object> decryptedProperties = new HashMap<>();
        
        // 收集所有需要解密的属性
        for (PropertySource<?> propertySource : propertySources) {
            if (propertySource.getName().contains("application")) {
                logger.debug("处理属性源: {}", propertySource.getName());
                
                // 检查特定的配置项
                checkAndDecrypt("spring.datasource.password", sm4Key, decryptedProperties);
                // Redis已移除，不再需要解密Redis密码
                checkAndDecrypt("jwt.secret", sm4Key, decryptedProperties);
                checkAndDecrypt("svt.security.aes.key", sm4Key, decryptedProperties);
            }
        }
        
        // 如果有解密的值，添加到环境中
        if (!decryptedProperties.isEmpty()) {
            PropertySource<?> decryptedSource = new PropertySource<Map<String, Object>>("sm4Decrypted", decryptedProperties) {
                @Override
                public Object getProperty(String name) {
                    return this.source.get(name);
                }
            };
            propertySources.addFirst(decryptedSource);
            logger.info("添加解密属性源，包含 {} 个配置项", decryptedProperties.size());
        }
    }
    
    /**
     * 检查并解密特定的配置项
     */
    private void checkAndDecrypt(String propertyName, String sm4Key, Map<String, Object> decryptedProperties) {
        String value = environment.getProperty(propertyName);
        if (value != null) {
            String decryptedValue = decryptIfNecessary(value, sm4Key, propertyName);
            if (!value.equals(decryptedValue)) {
                decryptedProperties.put(propertyName, decryptedValue);
                logger.info("成功解密配置项: {}", propertyName);
            }
        }
    }
    
    /**
     * 如果值是SM4加密格式，则解密
     */
    private String decryptIfNecessary(String value, String sm4Key, String propertyName) {
        if (value == null) {
            return null;
        }
        
        Matcher matcher = SM4_PATTERN.matcher(value);
        if (matcher.matches()) {
            String encryptedValue = matcher.group(1);
            try {
                // 使用CBC模式解密
                String decrypted = SM4Utils.decryptCBC(encryptedValue, sm4Key);
                logger.trace("成功解密配置项: {}", propertyName);
                return decrypted;
            } catch (Exception e) {
                logger.error("解密配置项 {} 失败: {}", propertyName, e.getMessage());
                // 根据环境决定是否抛出异常
                if (isProductionEnvironment()) {
                    throw new IllegalStateException("配置解密失败: " + propertyName, e);
                } else {
                    // 开发环境返回原值
                    logger.warn("开发环境下解密失败，使用原值");
                    return value;
                }
            }
        }
        
        return value;
    }
    
    /**
     * 判断是否为生产环境
     */
    private boolean isProductionEnvironment() {
        String[] activeProfiles = environment.getActiveProfiles();
        for (String profile : activeProfiles) {
            if (profile.contains("prod") || profile.contains("production")) {
                return true;
            }
        }
        return false;
    }
    
    @Override
    public int getOrder() {
        // 设置最高优先级，确保在其他BeanFactoryPostProcessor之前执行
        return Ordered.HIGHEST_PRECEDENCE;
    }
}