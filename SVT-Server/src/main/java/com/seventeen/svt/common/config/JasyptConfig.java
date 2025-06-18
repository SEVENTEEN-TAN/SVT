package com.seventeen.svt.common.config;

import com.ulisesbocchio.jasyptspringboot.annotation.EnableEncryptableProperties;
import org.jasypt.encryption.StringEncryptor;
import org.jasypt.encryption.pbe.PooledPBEStringEncryptor;
import org.jasypt.encryption.pbe.config.SimpleStringPBEConfig;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Jasypt配置文件加密配置类
 * 
 * 功能说明：
 * 1. 启用配置文件属性加密功能
 * 2. 使用AES-256加密算法
 * 3. 支持通过环境变量设置加密密钥
 * 4. 提供高性能的连接池加密器
 * 
 * 使用方式：
 * - 加密: 调用测试文件 PasswordSecurityUpgradeTest
 * - 配置文件中使用: ENC(加密后的字符串)
 * 
 * 环境变量：
 * - JASYPT_ENCRYPTOR_PASSWORD: 加密密钥
 * 
 * @author SEVENTEEN
 * @since 2025-06-18
 */
@Configuration
@EnableEncryptableProperties
public class JasyptConfig {

    /**
     * 自定义字符串加密器
     * 使用AES-256算法提供高强度加密
     */
    @Bean(name = "jasyptStringEncryptor")
    public StringEncryptor stringEncryptor() {
        PooledPBEStringEncryptor encryptor = new PooledPBEStringEncryptor();
        SimpleStringPBEConfig config = new SimpleStringPBEConfig();
        
        // 设置加密密钥，从环境变量获取
        String password = System.getenv("JASYPT_ENCRYPTOR_PASSWORD");
        if (password == null || password.trim().isEmpty()) {
            throw new IllegalStateException("JASYPT_ENCRYPTOR_PASSWORD environment variable is required");
        }
        config.setPassword(password);
        
        // 使用PBEWITHHMACSHA512ANDAES_256算法（推荐）
        config.setAlgorithm("PBEWITHHMACSHA512ANDAES_256");
        
        // 设置密钥获取迭代次数（提高安全性）
        config.setKeyObtentionIterations("1000");
        
        // 设置连接池大小（提高性能）
        config.setPoolSize("1");
        
        // 设置盐值生成器
        config.setSaltGeneratorClassName("org.jasypt.salt.RandomSaltGenerator");
        
        // 设置初始化向量生成器
        config.setIvGeneratorClassName("org.jasypt.iv.RandomIvGenerator");
        
        // 设置字符串输出类型
        config.setStringOutputType("base64");
        
        encryptor.setConfig(config);
        return encryptor;
    }
}