package com.seventeen.svt.common.util;

import org.jasypt.encryption.pbe.PooledPBEStringEncryptor;
import org.jasypt.encryption.pbe.config.SimpleStringPBEConfig;
import org.springframework.stereotype.Component;

/**
 * Jasypt加密工具类
 * 提供便捷的配置文件敏感信息加密功能
 * 
 * 使用方式：
 * 1. 设置环境变量 JASYPT_ENCRYPTOR_PASSWORD
 * 2. 调用 encryptProperty() 方法获取密文
 * 3. 在配置文件中使用 ENC(密文)
 * 
 * @author SEVENTEEN
 * @since 2025-06-18
 */
@Component
public class JasyptEncryptionUtils {

    private final PooledPBEStringEncryptor encryptor;

    public JasyptEncryptionUtils() {
        this.encryptor = createEncryptor();
    }

    /**
     * 创建加密器（与JasyptConfig保持一致的配置）
     */
    private PooledPBEStringEncryptor createEncryptor() {
        PooledPBEStringEncryptor encryptor = new PooledPBEStringEncryptor();
        SimpleStringPBEConfig config = new SimpleStringPBEConfig();
        
        // 从环境变量获取密钥
        String password = System.getenv("JASYPT_ENCRYPTOR_PASSWORD");
        if (password == null || password.trim().isEmpty()) {
            throw new IllegalArgumentException("未设置JASYPT_ENCRYPTOR_PASSWORD环境变量");
        }

        config.setPassword(password);
        
        // 使用与JasyptConfig相同的配置
        config.setAlgorithm("PBEWITHHMACSHA512ANDAES_256");
        config.setKeyObtentionIterations("1000");
        config.setPoolSize("1");
        config.setSaltGeneratorClassName("org.jasypt.salt.RandomSaltGenerator");
        config.setIvGeneratorClassName("org.jasypt.iv.RandomIvGenerator");
        config.setStringOutputType("base64");
        
        encryptor.setConfig(config);
        return encryptor;
    }

    /**
     * 加密配置属性
     * 
     * @param plainText 明文
     * @return 加密后的密文（不包含ENC()）
     */
    public String encryptProperty(String plainText) {
        if (plainText == null || plainText.trim().isEmpty()) {
            throw new IllegalArgumentException("待加密的文本不能为空");
        }
        return encryptor.encrypt(plainText);
    }

    /**
     * 解密配置属性
     * 
     * @param encryptedText 密文
     * @return 解密后的明文
     */
    public String decryptProperty(String encryptedText) {
        if (encryptedText == null || encryptedText.trim().isEmpty()) {
            throw new IllegalArgumentException("待解密的文本不能为空");
        }
        return encryptor.decrypt(encryptedText);
    }

    /**
     * 获取用于配置文件的完整格式
     * 
     * @param plainText 明文
     * @return ENC(密文) 格式
     */
    public String getEncryptedConfigValue(String plainText) {
        return "ENC(" + encryptProperty(plainText) + ")";
    }

    /**
     * 批量加密常用配置项
     * 用于快速生成配置文件所需的加密值
     */
    public void printCommonEncryptedValues() {
        System.out.println("=== SVT 常用配置项加密结果 ===");
        
        // 示例配置项（请替换为实际值）
        String[][] configs = {
            {"数据库密码", "your_db_password"},
            {"Redis密码", "your_redis_password"},
            {"JWT密钥", "your_jwt_secret_key_at_least_32_chars"},
            {"AES密钥", "your_aes_key_32_characters_long"},
            {"SM4密钥", "your_sm4_key_16_chars"}  // 如果还需要的话
        };
        
        for (String[] config : configs) {
            String name = config[0];
            String value = config[1];
            String encrypted = encryptProperty(value);
            
            System.out.println(name + ":");
            System.out.println("  明文: " + value);
            System.out.println("  密文: " + encrypted);
            System.out.println("  配置: ENC(" + encrypted + ")");
            System.out.println("---");
        }
        
        System.out.println("使用方法：将上述 ENC(...) 值复制到对应的配置文件中");
        System.out.println("环境变量：JASYPT_ENCRYPTOR_PASSWORD 必须设置为加密时使用的密钥");
    }

    /**
     * 验证加密解密功能
     */
    public boolean validateEncryption() {
        try {
            String testText = "test_encryption_" + System.currentTimeMillis();
            String encrypted = encryptProperty(testText);
            String decrypted = decryptProperty(encrypted);
            
            boolean isValid = testText.equals(decrypted);
            System.out.println("加密功能验证: " + (isValid ? "通过" : "失败"));
            return isValid;
        } catch (Exception e) {
            System.err.println("加密功能验证失败: " + e.getMessage());
            return false;
        }
    }
} 