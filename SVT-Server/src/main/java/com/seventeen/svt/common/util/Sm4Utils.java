package com.seventeen.svt.common.util;

import cn.hutool.crypto.SmUtil;
import cn.hutool.crypto.symmetric.SM4;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * SM4加密工具类 (重构为标准的Spring Bean)
 */
@Slf4j
@Component
public class Sm4Utils {

    @Value("${svt.security.sm4.key}")
    private String sm4Key;

    private SM4 sm4;

    @PostConstruct
    public void init() {
        log.info("Initializing SM4 utility...");
        if (!StringUtils.hasText(sm4Key)) {
            log.error("SM4 key is not configured. Please check 'svt.security.sm4.key' in your application properties.");
            throw new IllegalArgumentException("SM4 key cannot be null or empty.");
        }

        try {
            // SM4密钥要求16字节 (128位)
            byte[] keyBytes = sm4Key.getBytes("UTF-8");
            if (keyBytes.length != 16) {
                log.warn("SM4 key length is not 16 bytes. It will be truncated or padded. For production, a 16-byte key is recommended.");
                byte[] newKey = new byte[16];
                System.arraycopy(keyBytes, 0, newKey, 0, Math.min(keyBytes.length, 16));
                keyBytes = newKey;
            }
            this.sm4 = SmUtil.sm4(keyBytes);
            log.info("SM4 utility initialized successfully.");
        } catch (Exception e) {
            log.error("Failed to initialize SM4 utility", e);
            throw new RuntimeException("Failed to initialize SM4 utility", e);
        }
    }

    /**
     * 加密
     * @param content 待加密内容
     * @return 加密后的Hex字符串
     */
    public String encrypt(String content) {
        if (!StringUtils.hasText(content)) {
            return null;
        }
        try {
            return sm4.encryptHex(content);
        } catch (Exception e) {
            log.error("SM4 encryption failed for content", e);
            // 在生产环境中，可能不希望向上抛出原始异常
            return null; 
        }
    }

    /**
     * 解密
     * @param encryptContent 加密的Hex字符串
     * @return 解密后的内容
     */
    public String decrypt(String encryptContent) {
        if (!StringUtils.hasText(encryptContent)) {
            return null;
        }
        try {
            return sm4.decryptStr(encryptContent);
        } catch (Exception e) {
            log.error("SM4 decryption failed for encrypted content", e);
            // 解密失败通常应返回null或抛出特定异常
            return null;
        }
    }

    /**
     * 验证密码 (加密后比较)
     * @param rawPassword 明文密码
     * @param encryptedPassword 数据库中存储的加密密码
     * @return 是否匹配
     */
    public boolean verifyPassword(String rawPassword, String encryptedPassword) {
        if (!StringUtils.hasText(rawPassword) || !StringUtils.hasText(encryptedPassword)) {
            return false;
        }
        String encryptedInput = encrypt(rawPassword);
        return encryptedPassword.equals(encryptedInput);
    }
} 