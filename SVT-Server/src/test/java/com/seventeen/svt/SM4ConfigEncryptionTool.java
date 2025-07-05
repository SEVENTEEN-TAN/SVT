package com.seventeen.svt;

import com.seventeen.svt.common.util.SM4Utils;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * SM4配置加密工具
 * 用于生成配置文件中敏感信息的SM4加密密文（CBC模式）
 * 
 * @author seventeen
 */
public class SM4ConfigEncryptionTool {
    
    // SM4加密密钥 (16字节/128位)
    private static final String SM4_KEY = "SVT2025SM4KEY128"; // 必须是16字节
    
    @BeforeAll
    public static void setup() {
        System.out.println("========================================");
        System.out.println("SM4配置加密工具（CBC模式）");
        System.out.println("密钥: " + SM4_KEY);
        System.out.println("========================================\n");
    }
    
    /**
     * 生成所有需要的配置加密值
     */
    @Test
    public void generateAllEncryptedConfigs() {
        Map<String, String> configs = new LinkedHashMap<>();
        configs.put("数据库密码", "Tsq19971108!");
        configs.put("Redis密码", "123456");
        configs.put("JWT密钥", "SVT-DEV-JWT-SECRET-CHANGE-ME-5678-VERY-LONG-AND-SECURE");
        configs.put("AES密钥", "wJ/6sgrWER8T14S3z1esg39g7sL8f8b+J5fCg6a5fGg=");
        
        System.out.println("配置项加密结果:");
        System.out.println("=====================================\n");
        
        for (Map.Entry<String, String> entry : configs.entrySet()) {
            encryptAndPrint(entry.getKey(), entry.getValue());
        }
        
        System.out.println("\n=====================================");
        System.out.println("使用说明:");
        System.out.println("1. 设置环境变量: export SM4_KEY=" + SM4_KEY);
        System.out.println("2. 在配置文件中使用 SM4(密文) 格式");
        System.out.println("3. Spring Boot启动时会自动解密");
    }
    
    /**
     * 加密单个配置项并打印结果
     */
    private void encryptAndPrint(String name, String value) {
        try {
            // 使用CBC模式加密
            String encrypted = SM4Utils.encryptCBC(value, SM4_KEY);
            
            // 验证解密
            String decrypted = SM4Utils.decryptCBC(encrypted, SM4_KEY);
            boolean verified = value.equals(decrypted);
            
            System.out.println("配置项: " + name);
            System.out.println("明文: " + value);
            System.out.println("密文: SM4(" + encrypted + ")");
            System.out.println("验证: " + (verified ? "✓ 成功" : "✗ 失败"));
            System.out.println("----------------------------------------\n");
        } catch (Exception e) {
            System.err.println("加密 " + name + " 时出错: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * 测试单个值的加密
     */
    @Test
    public void encryptSingleValue() {
        String value = "test-password-123";
        System.out.println("\n单个值加密测试:");
        System.out.println("=====================================");
        encryptAndPrint("测试密码", value);
    }
    
    /**
     * 生成YAML配置示例
     */
    @Test
    public void generateYamlExample() {
        System.out.println("\n配置文件示例:");
        System.out.println("=====================================\n");
        
        // 生成加密值
        String dbPassword = SM4Utils.encryptCBC("Tsq19971108!", SM4_KEY);
        String redisPassword = SM4Utils.encryptCBC("123456", SM4_KEY);
        String jwtSecret = SM4Utils.encryptCBC("SVT-DEV-JWT-SECRET-CHANGE-ME-5678-VERY-LONG-AND-SECURE", SM4_KEY);
        String aesKey = SM4Utils.encryptCBC("wJ/6sgrWER8T14S3z1esg39g7sL8f8b+J5fCg6a5fGg=", SM4_KEY);
        
        System.out.println("# application-dev.yml");
        System.out.println("spring:");
        System.out.println("  datasource:");
        System.out.println("    password: SM4(" + dbPassword + ")");
        System.out.println("  data:");
        System.out.println("    redis:");
        System.out.println("      password: SM4(" + redisPassword + ")");
        System.out.println("");
        System.out.println("svt:");
        System.out.println("  security:");
        System.out.println("    aes:");
        System.out.println("      key: SM4(" + aesKey + ")");
        System.out.println("");
        System.out.println("jwt:");
        System.out.println("  secret: SM4(" + jwtSecret + ")");
    }
}