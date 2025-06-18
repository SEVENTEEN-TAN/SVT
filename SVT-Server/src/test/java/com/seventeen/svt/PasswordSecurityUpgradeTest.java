package com.seventeen.svt;

import org.jasypt.encryption.pbe.PooledPBEStringEncryptor;
import org.jasypt.encryption.pbe.config.SimpleStringPBEConfig;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;

/**
 * SVT 密码安全升级测试工具
 * 
 * 功能覆盖：
 * 1. Jasypt配置文件加密测试
 * 2. Argon2密码哈希测试
 * 3. 生成实际部署所需的加密值
 * 
 * 使用方法：
 * 1. 运行测试生成所需的加密值
 * 2. 将结果复制到配置文件中
 * 
 * @author Sun Wukong
 * @since 2025-06-18
 */
public class PasswordSecurityUpgradeTest {

    // Jasypt加密密钥（与JasyptConfig保持一致）
    private static final String JASYPT_PASSWORD = "SVT_JASYPT_KEY_2025";

    /**
     * 创建Jasypt加密器
     */
    private PooledPBEStringEncryptor createJasyptEncryptor() {
        PooledPBEStringEncryptor encryptor = new PooledPBEStringEncryptor();
        SimpleStringPBEConfig config = new SimpleStringPBEConfig();
        
        // 使用与JasyptConfig相同的设置
        config.setPassword(JASYPT_PASSWORD);
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
     * 创建Argon2密码编码器
     */
    private Argon2PasswordEncoder createArgon2Encoder() {
        // 使用与SVTArgon2PasswordEncoder相同的参数
        return new Argon2PasswordEncoder(16, 32, 1, 4096, 3);
    }

    /**
     * 测试1：Jasypt配置文件加密功能
     */
    @Test
    public void testJasyptConfigEncryption() {
        System.out.println("=== Jasypt 配置文件加密测试 ===");
        
        PooledPBEStringEncryptor encryptor = createJasyptEncryptor();
        
        // 定义需要加密的配置项（请替换为实际值）
        String[][] configs = {
            {"数据库密码", "Tsq19971108!"},
            {"Redis密码", "123456"},
            {"JWT密钥", "SVT-DEV-JWT-SECRET-CHANGE-ME-5678-VERY-LONG-AND-SECURE"},
            {"AES密钥", "wJ/6sgrWER8T14S3z1esg39g7sL8f8b+J5fCg6a5fGg="}
        };
        
        System.out.println("使用的加密密钥: " + JASYPT_PASSWORD);
        System.out.println("加密算法: PBEWITHHMACSHA512ANDAES_256");
        System.out.println();
        
        for (String[] config : configs) {
            String name = config[0];
            String plainText = config[1];
            
            try {
                // 加密
                String encrypted = encryptor.encrypt(plainText);
                
                // 验证解密
                String decrypted = encryptor.decrypt(encrypted);
                boolean isValid = plainText.equals(decrypted);
                
                System.out.println("【" + name + "】");
                System.out.println("  原文: " + plainText);
                System.out.println("  密文: " + encrypted);
                System.out.println("  配置: ENC(" + encrypted + ")");
                System.out.println("  验证: " + (isValid ? "✓ 通过" : "✗ 失败"));
                System.out.println();
                
            } catch (Exception e) {
                System.err.println("【" + name + "】加密失败: " + e.getMessage());
            }
        }
        
        System.out.println("=== 使用说明 ===");
        System.out.println("1. 将上述 ENC(...) 值复制到对应的配置文件中");
        System.out.println("2. 设置环境变量: JASYPT_ENCRYPTOR_PASSWORD=" + JASYPT_PASSWORD);
        System.out.println("3. 生产环境请使用更强的密钥替换默认密钥");
        System.out.println();
    }

    /**
     * 测试2：Argon2密码哈希功能
     */
    @Test
    public void testArgon2PasswordHashing() {
        System.out.println("=== Argon2 密码哈希测试 ===");
        
        Argon2PasswordEncoder encoder = createArgon2Encoder();
        
        // 测试密码示例
        String[] testPasswords = {
            "admin123",
            "user123456",
            "Test@123",
            "MySecurePassword2025!",
            "临时密码123"
        };
        
        System.out.println("Argon2参数配置:");
        System.out.println("  算法: Argon2id");
        System.out.println("  盐值长度: 16字节");
        System.out.println("  哈希长度: 32字节");
        System.out.println("  并行度: 1");
        System.out.println("  内存使用: 4096KB");
        System.out.println("  迭代次数: 3");
        System.out.println();
        
        for (String password : testPasswords) {
            try {
                // 生成哈希
                String hashedPassword = encoder.encode(password);
                
                // 验证密码
                boolean isValid = encoder.matches(password, hashedPassword);
                
                // 测试错误密码
                boolean isInvalid = encoder.matches(password + "wrong", hashedPassword);
                
                System.out.println("【密码测试】");
                System.out.println("  原始密码: " + password);
                System.out.println("  Argon2哈希: " + hashedPassword);
                System.out.println("  验证正确密码: " + (isValid ? "✓ 通过" : "✗ 失败"));
                System.out.println("  验证错误密码: " + (isInvalid ? "✗ 意外通过" : "✓ 正确拒绝"));
                System.out.println("  哈希长度: " + hashedPassword.length() + " 字符");
                System.out.println();
                
            } catch (Exception e) {
                System.err.println("密码 [" + password + "] 哈希失败: " + e.getMessage());
            }
        }
        
        System.out.println("=== 使用说明 ===");
        System.out.println("1. 数据库中现有用户密码需要重新哈希");
        System.out.println("2. 新用户注册时会自动使用Argon2哈希");
        System.out.println("3. 密码格式: $argon2id$v=19$m=4096,t=3,p=1$...");
        System.out.println();
    }

    /**
     * 测试3：生成实际部署配置
     */
    @Test
    public void generateProductionConfig() {
        System.out.println("=== 生产环境配置生成 ===");
        
        PooledPBEStringEncryptor encryptor = createJasyptEncryptor();
        
        // 实际配置项（请替换为真实值）
        System.out.println("请将以下值替换为实际的生产环境配置：");
        System.out.println();
        
        String[][] productionConfigs = {
            {"spring.datasource.password", "your_production_db_password"},
            {"spring.data.redis.password", "your_production_redis_password"},
            {"jwt.secret", "your_production_jwt_secret_key_32_chars_minimum"},
            {"svt.security.aes.key", "your_production_aes_key_exactly_32_chars"}
        };
        
        System.out.println("application-prod.yml 配置示例：");
        System.out.println("```yaml");
        
        for (String[] config : productionConfigs) {
            String key = config[0];
            String value = config[1];
            String encrypted = encryptor.encrypt(value);
            
            System.out.println(key + ": ENC(" + encrypted + ")");
        }
        
        System.out.println("```");
        System.out.println();
        System.out.println("环境变量设置：");
        System.out.println("export JASYPT_ENCRYPTOR_PASSWORD=\"" + JASYPT_PASSWORD + "\"");
        System.out.println();
        System.out.println("⚠️  生产环境安全提醒：");
        System.out.println("1. 请使用强密钥替换默认的JASYPT_ENCRYPTOR_PASSWORD");
        System.out.println("2. 密钥长度建议32位以上，包含大小写字母、数字、特殊字符");
        System.out.println("3. 不要在代码或日志中暴露密钥");
        System.out.println();
    }

    /**
     * 测试4：完整功能验证
     */
    @Test
    public void fullFunctionalityTest() {
        System.out.println("=== 完整功能验证测试 ===");
        
        // 1. Jasypt功能验证
        System.out.println("1. Jasypt加密功能验证...");
        PooledPBEStringEncryptor jasyptEncryptor = createJasyptEncryptor();
        String testText = "test_value_" + System.currentTimeMillis();
        
        try {
            String encrypted = jasyptEncryptor.encrypt(testText);
            String decrypted = jasyptEncryptor.decrypt(encrypted);
            boolean jasyptValid = testText.equals(decrypted);
            System.out.println("   Jasypt功能: " + (jasyptValid ? "✓ 正常" : "✗ 异常"));
        } catch (Exception e) {
            System.out.println("   Jasypt功能: ✗ 异常 - " + e.getMessage());
        }
        
        // 2. Argon2功能验证
        System.out.println("2. Argon2密码哈希验证...");
        Argon2PasswordEncoder argon2Encoder = createArgon2Encoder();
        String testPassword = "test_password_123";
        
        try {
            String hashed = argon2Encoder.encode(testPassword);
            boolean argon2Valid = argon2Encoder.matches(testPassword, hashed);
            System.out.println("   Argon2功能: " + (argon2Valid ? "✓ 正常" : "✗ 异常"));
        } catch (Exception e) {
            System.out.println("   Argon2功能: ✗ 异常 - " + e.getMessage());
        }
        
        // 3. 环境检查
        System.out.println("3. 环境配置检查...");
        String envPassword = System.getenv("JASYPT_ENCRYPTOR_PASSWORD");
        System.out.println("   环境变量JASYPT_ENCRYPTOR_PASSWORD: " + 
            (envPassword != null && !envPassword.trim().isEmpty() ? "✓ 已设置" : "⚠ 未设置（将使用默认值）"));
        
        System.out.println();
        System.out.println("=== 测试完成 ===");
        System.out.println("如果所有功能显示正常，说明密码安全升级配置正确！");
    }
} 