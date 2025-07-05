package com.seventeen.svt.common.util;

import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.security.Security;
import java.util.Arrays;
import java.util.Base64;

/**
 * SM4加密工具类
 * 用于配置文件中敏感信息的加密解密
 * 支持ECB和CBC两种模式
 */
public class SM4Utils {
    
    private static final Logger logger = LoggerFactory.getLogger(SM4Utils.class);
    
    private static final String ALGORITHM = "SM4";
    private static final String ECB_TRANSFORMATION = "SM4/ECB/PKCS5Padding";
    private static final String CBC_TRANSFORMATION = "SM4/CBC/PKCS5Padding";
    private static final String PROVIDER = "BC";
    private static final int IV_LENGTH = 16; // SM4的IV长度为16字节
    
    static {
        // 添加BouncyCastle提供者
        if (Security.getProvider(PROVIDER) == null) {
            Security.addProvider(new BouncyCastleProvider());
        }
    }
    
    /**
     * SM4加密（ECB模式）
     * 
     * @param plainText 明文
     * @param key 密钥(必须是16字节)
     * @return Base64编码的密文
     */
    public static String encrypt(String plainText, String key) {
        try {
            validateKey(key);
            
            Cipher cipher = Cipher.getInstance(ECB_TRANSFORMATION, PROVIDER);
            SecretKeySpec keySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, keySpec);
            
            byte[] encrypted = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(encrypted);
        } catch (Exception e) {
            logger.error("SM4加密失败", e);
            throw new RuntimeException("SM4加密失败", e);
        }
    }
    
    /**
     * SM4解密（ECB模式）
     * 
     * @param cipherText Base64编码的密文
     * @param key 密钥(必须是16字节)
     * @return 明文
     */
    public static String decrypt(String cipherText, String key) {
        try {
            validateKey(key);
            
            Cipher cipher = Cipher.getInstance(ECB_TRANSFORMATION, PROVIDER);
            SecretKeySpec keySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, keySpec);
            
            byte[] encrypted = Base64.getDecoder().decode(cipherText);
            byte[] decrypted = cipher.doFinal(encrypted);
            return new String(decrypted, StandardCharsets.UTF_8);
        } catch (Exception e) {
            logger.error("SM4解密失败", e);
            throw new RuntimeException("SM4解密失败", e);
        }
    }
    
    /**
     * SM4加密（CBC模式）
     * 自动生成随机IV，返回格式：Base64(IV + 密文)
     * 
     * @param plainText 明文
     * @param key 密钥(必须是16字节)
     * @return Base64编码的(IV+密文)
     */
    public static String encryptCBC(String plainText, String key) {
        try {
            validateKey(key);
            
            // 生成随机IV
            byte[] iv = new byte[IV_LENGTH];
            new SecureRandom().nextBytes(iv);
            
            Cipher cipher = Cipher.getInstance(CBC_TRANSFORMATION, PROVIDER);
            SecretKeySpec keySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), ALGORITHM);
            IvParameterSpec ivSpec = new IvParameterSpec(iv);
            cipher.init(Cipher.ENCRYPT_MODE, keySpec, ivSpec);
            
            byte[] encrypted = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));
            
            // 将IV和密文组合
            byte[] combined = new byte[IV_LENGTH + encrypted.length];
            System.arraycopy(iv, 0, combined, 0, IV_LENGTH);
            System.arraycopy(encrypted, 0, combined, IV_LENGTH, encrypted.length);
            
            return Base64.getEncoder().encodeToString(combined);
        } catch (Exception e) {
            logger.error("SM4 CBC加密失败", e);
            throw new RuntimeException("SM4 CBC加密失败", e);
        }
    }
    
    /**
     * SM4解密（CBC模式）
     * 输入格式：Base64(IV + 密文)
     * 
     * @param cipherText Base64编码的(IV+密文)
     * @param key 密钥(必须是16字节)
     * @return 明文
     */
    public static String decryptCBC(String cipherText, String key) {
        try {
            validateKey(key);
            
            byte[] combined = Base64.getDecoder().decode(cipherText);
            
            // 检查长度
            if (combined.length < IV_LENGTH) {
                throw new IllegalArgumentException("密文长度不足");
            }
            
            // 提取IV和密文
            byte[] iv = Arrays.copyOfRange(combined, 0, IV_LENGTH);
            byte[] encrypted = Arrays.copyOfRange(combined, IV_LENGTH, combined.length);
            
            Cipher cipher = Cipher.getInstance(CBC_TRANSFORMATION, PROVIDER);
            SecretKeySpec keySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), ALGORITHM);
            IvParameterSpec ivSpec = new IvParameterSpec(iv);
            cipher.init(Cipher.DECRYPT_MODE, keySpec, ivSpec);
            
            byte[] decrypted = cipher.doFinal(encrypted);
            return new String(decrypted, StandardCharsets.UTF_8);
        } catch (Exception e) {
            logger.error("SM4 CBC解密失败", e);
            throw new RuntimeException("SM4 CBC解密失败", e);
        }
    }
    
    /**
     * 验证密钥长度
     * 
     * @param key 密钥
     */
    private static void validateKey(String key) {
        if (key == null || key.getBytes(StandardCharsets.UTF_8).length != 16) {
            throw new IllegalArgumentException("SM4密钥必须是16字节");
        }
    }
    
    /**
     * 判断字符串是否为SM4加密格式
     * 
     * @param value 待判断的值
     * @return 是否为SM4加密格式
     */
    public static boolean isEncrypted(String value) {
        return value != null && value.startsWith("SM4(") && value.endsWith(")");
    }
    
    /**
     * 提取SM4加密的密文部分
     * 
     * @param encryptedValue SM4(密文)格式的字符串
     * @return 密文
     */
    public static String extractCipherText(String encryptedValue) {
        if (!isEncrypted(encryptedValue)) {
            return encryptedValue;
        }
        return encryptedValue.substring(4, encryptedValue.length() - 1);
    }
}