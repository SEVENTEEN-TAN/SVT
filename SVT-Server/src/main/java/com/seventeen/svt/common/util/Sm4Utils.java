package com.seventeen.svt.common.util;

import cn.hutool.core.util.HexUtil;
import cn.hutool.crypto.SmUtil;
import cn.hutool.crypto.symmetric.SM4;
import cn.hutool.extra.spring.SpringUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * SM4加密工具类
 */
@Component
public class Sm4Utils {
    private static final Logger logger = LoggerFactory.getLogger(Sm4Utils.class);
    private static SM4 sm4;

    static {
        try {
            initSm4();
        } catch (Exception e) {
            logger.error("SM4初始化失败: {}", e.getMessage());
            throw new RuntimeException("SM4初始化失败", e);
        }
    }

    private static void initSm4() {
        String sm4Key = SpringUtil.getProperty("sm4.key");
        if (sm4Key == null) {
            throw new IllegalArgumentException("SM4 key must not be null.");
        }
        
        // 去除空格
        sm4Key = sm4Key.replaceAll(" ", "");
        
        // 处理密钥长度，确保是16字节（128位）
        byte[] keyBytes;
        try {
            // 将十六进制字符串转换为字节数组
            keyBytes = HexUtil.decodeHex(sm4Key);
            
            // 如果密钥长度小于16字节，补0
            if (keyBytes.length < 16) {
                byte[] paddedKey = new byte[16];
                System.arraycopy(keyBytes, 0, paddedKey, 0, keyBytes.length);
                // 剩余的位置默认为0
                keyBytes = paddedKey;
            }
            // 如果密钥长度大于16字节，截取前16字节
            else if (keyBytes.length > 16) {
                byte[] truncatedKey = new byte[16];
                System.arraycopy(keyBytes, 0, truncatedKey, 0, 16);
                keyBytes = truncatedKey;
            }
            
            logger.debug("SM4 key length: {} bytes", keyBytes.length);
            sm4 = SmUtil.sm4(keyBytes);
        } catch (Exception e) {
            logger.error("SM4密钥初始化失败: {}", e.getMessage());
            throw new RuntimeException("SM4密钥初始化失败: " + e.getMessage(), e);
        }
    }

    /**
     * 加密
     *
     * @param content 待加密内容
     * @return 加密后的内容
     */
    public static String encrypt(String content) {
        try {
            if (content == null) {
                return null;
            }
            // 使用ECB模式加密（不使用向量）
            return sm4.encryptHex(content);
        } catch (Exception e) {
            logger.error("加密失败: {}, content: {}", e.getMessage(), content);
            throw new RuntimeException("加密失败: " + e.getMessage(), e);
        }
    }

    /**
     * 解密
     *
     * @param encryptContent 加密内容
     * @return 解密后的内容
     */
    public static String decrypt(String encryptContent) {
        try {
            if (encryptContent == null) {
                return null;
            }
            return sm4.decryptStr(encryptContent);
        } catch (Exception e) {
            logger.error("解密失败: {}, encryptContent: {}", e.getMessage(), encryptContent);
            throw new RuntimeException("解密失败: " + e.getMessage(), e);
        }
    }

    /**
     * 验证密码
     *
     * @param password 明文密码
     * @param encryptPassword 加密密码
     * @return 是否匹配
     */
    public static boolean verifyPassword(String password, String encryptPassword) {
        try {
            if (password == null || encryptPassword == null) {
                return false;
            }
            
            // 加密明文密码进行比较
            String encryptedInput = encrypt(password);
            logger.debug("Password verification - Encrypted input: {}, Stored encrypted: {}", 
                        encryptedInput, encryptPassword);
            if (encryptedInput != null) {
                return encryptedInput.equals(encryptPassword);
            }
        } catch (Exception e) {
            logger.error("密码验证失败: {}", e.getMessage());
            return false;
        }
        return false;
    }

    /**
     * 重新初始化SM4
     */
    public static void reinitialize() {
        initSm4();
    }
} 