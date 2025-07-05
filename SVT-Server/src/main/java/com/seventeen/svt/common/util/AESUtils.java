package com.seventeen.svt.common.util;

import cn.hutool.core.codec.Base64;
import com.seventeen.svt.common.config.AESConfig;
import com.seventeen.svt.common.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.HashMap;
import java.util.Map;

/**
 * AES加密工具类
 * 支持AES-256-CBC加密算法
 * 用于API请求响应数据的加密解密
 * 
 * @author SEVENTEEN
 * @since 2025-06-17
 */
@Slf4j
@Component
public class AESUtils {

    /**
     * 加密算法
     */
    private static final String ALGORITHM = "AES";
    
    /**
     * 加密/解密算法/工作模式/填充方式
     */
    private static final String TRANSFORMATION = "AES/CBC/PKCS5Padding";
    
    /**
     * 密钥长度
     */
    private static final int KEY_LENGTH = 256;
    
    /**
     * IV长度
     */
    private static final int IV_LENGTH = 16;
    
    /**
     * 最大数据大小 (10MB)
     */
    private static final int MAX_DATA_SIZE = 10 * 1024 * 1024;

    /**
     * AES配置管理
     */
    private final AESConfig aesConfig;

    /**
     * 构造函数注入AES配置
     */
    public AESUtils(AESConfig aesConfig) {
        this.aesConfig = aesConfig;
    }

    /**
     * 安全随机数生成器
     */
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    // [INTERNAL_ACTION: Fetching current time via mcp.server_time.]
    // {{CHENGQI:
    // Action: Added; Timestamp: 2025-06-17 14:20:00 +08:00; Reason: 实现AES加密工具类基础结构; Principle_Applied: SOLID-S单一职责原则;
    // }}

    /**
     * 检查AES加密是否启用
     *
     * @return 是否启用AES加密
     */
    public boolean isAESEnabled() {
        return aesConfig.isEnabled();
    }

    /**
     * 生成随机IV
     *
     * @return Base64编码的IV
     */
    public String generateIV() {
        byte[] iv = new byte[IV_LENGTH];
        SECURE_RANDOM.nextBytes(iv);
        return Base64.encode(iv);
    }

    /**
     * 生成AES密钥
     *
     * @return Base64编码的密钥
     * @throws BusinessException 密钥生成失败
     */
    public String generateKey() throws BusinessException {
        try {
            KeyGenerator keyGenerator = KeyGenerator.getInstance(ALGORITHM);
            keyGenerator.init(KEY_LENGTH);
            SecretKey secretKey = keyGenerator.generateKey();
            return Base64.encode(secretKey.getEncoded());
        } catch (NoSuchAlgorithmException e) {
            log.error("AES密钥生成失败", e);
            throw new BusinessException("密钥生成失败");
        }
    }

    /**
     * AES加密
     *
     * @param plainText 明文
     * @param ivString  Base64编码的IV
     * @return Base64编码的密文
     * @throws BusinessException 加密失败
     */
    public String encrypt(String plainText, String ivString) throws BusinessException {
        if (plainText == null || plainText.isEmpty()) {
            throw new BusinessException("待加密数据不能为空");
        }

        if (ivString == null || ivString.isEmpty()) {
            throw new BusinessException("IV不能为空");
        }

        // 检查数据大小
        byte[] data = plainText.getBytes(StandardCharsets.UTF_8);
        if (!aesConfig.isDataSizeValid(data.length)) {
            throw new BusinessException("数据大小超过限制: " + aesConfig.getMaxDataSize() + " bytes");
        }

        try {
            // 准备密钥
            SecretKeySpec keySpec = new SecretKeySpec(getKeyBytes(), ALGORITHM);
            
            // 准备IV
            byte[] iv = Base64.decode(ivString);
            if (iv.length != IV_LENGTH) {
                throw new BusinessException("IV长度不正确，期望" + IV_LENGTH + "字节");
            }
            IvParameterSpec ivSpec = new IvParameterSpec(iv);

            // 执行加密
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.ENCRYPT_MODE, keySpec, ivSpec);
            byte[] encryptedData = cipher.doFinal(data);

            String result = Base64.encode(encryptedData);
            log.debug("AES加密成功，原文长度: {}，密文长度: {}", data.length, encryptedData.length);
            
            return result;

        } catch (Exception e) {
            log.error("AES加密失败: {}", e.getMessage(), e);
            throw new BusinessException("数据加密失败");
        }
    }

    /**
     * AES解密
     *
     * @param encryptedData Base64编码的密文
     * @param ivString      Base64编码的IV
     * @return 明文
     * @throws BusinessException 解密失败
     */
    public String decrypt(String encryptedData, String ivString) throws BusinessException {
        if (encryptedData == null || encryptedData.isEmpty()) {
            throw new BusinessException("待解密数据不能为空");
        }

        if (ivString == null || ivString.isEmpty()) {
            throw new BusinessException("IV不能为空");
        }

        try {
            // 准备密钥
            SecretKeySpec keySpec = new SecretKeySpec(getKeyBytes(), ALGORITHM);
            
            // 准备IV
            byte[] iv = Base64.decode(ivString);
            if (iv.length != IV_LENGTH) {
                throw new BusinessException("IV长度不正确，期望" + IV_LENGTH + "字节");
            }
            IvParameterSpec ivSpec = new IvParameterSpec(iv);

            // 准备密文数据
            byte[] cipherData = Base64.decode(encryptedData);
            if (!aesConfig.isDataSizeValid(cipherData.length)) {
                throw new BusinessException("数据大小超过限制: " + aesConfig.getMaxDataSize() + " bytes");
            }

            // 执行解密
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.DECRYPT_MODE, keySpec, ivSpec);
            byte[] decryptedData = cipher.doFinal(cipherData);

            String result = new String(decryptedData, StandardCharsets.UTF_8);
            log.debug("AES解密成功，密文长度: {}，明文长度: {}", cipherData.length, decryptedData.length);
            
            return result;

        } catch (Exception e) {
            log.error("AES解密失败: {}", e.getMessage(), e);
            throw new BusinessException("数据解密失败");
        }
    }

    /**
     * 便捷加密方法（自动生成IV）
     *
     * @param plainText 明文
     * @return 包含IV和密文的加密结果
     * @throws BusinessException 加密失败
     */
    public EncryptionResult encryptWithIV(String plainText) throws BusinessException {
        String iv = generateIV();
        String encryptedData = encrypt(plainText, iv);
        return new EncryptionResult(encryptedData, iv);
    }

    /**
     * 验证密钥是否有效
     *
     * @return 密钥是否有效
     */
    public boolean validateKey() {
        try {
            byte[] keyBytes = getKeyBytes();
            return keyBytes.length == 32; // AES-256需要32字节密钥
        } catch (Exception e) {
            log.warn("密钥验证失败: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 获取密钥字节数组
     *
     * @return 密钥字节数组
     * @throws BusinessException 密钥处理失败
     */
    private byte[] getKeyBytes() throws BusinessException {
        String secretKey = aesConfig.getKey();
        if (secretKey == null || secretKey.isEmpty()) {
            throw new BusinessException("AES密钥未在配置中设置 (svt.security.aes.key)");
        }

        try {
            log.debug("从配置加载的AES密钥 (Base64): {}", secretKey);
            byte[] keyBytes = Base64.decode(secretKey);

            if (keyBytes.length != 32) {
                String errorMessage = String.format("无效的AES密钥长度。期望32字节（AES-256），实际为 %d 字节。请检查Base64密钥配置。", keyBytes.length);
                log.error(errorMessage);
                throw new BusinessException(errorMessage);
            }
            
            log.debug("成功解码AES密钥，长度: {} 字节", keyBytes.length);
            return keyBytes;

        } catch (Exception e) {
            log.error("AES密钥处理失败：无法将配置的密钥解码为有效的Base64格式。请检查 svt.security.aes.key 的配置。", e);
            throw new BusinessException("AES密钥配置无效，必须是有效的Base64编码字符串。");
        }
    }

    /**
     * API专用加密方法
     * 将JSON数据加密为API传输格式
     *
     * @param jsonData JSON字符串数据
     * @return 加密后的API格式数据
     * @throws BusinessException 加密失败
     */
    public Map<String, Object> encryptForAPI(String jsonData) throws BusinessException {
        if (jsonData == null || jsonData.isEmpty()) {
            throw new BusinessException("待加密数据不能为空");
        }

        try {
            // 生成IV并加密
            EncryptionResult result = encryptWithIV(jsonData);
            
            // 构造API格式的加密数据
            Map<String, Object> encryptedResponse = new HashMap<>();
            encryptedResponse.put("encrypted", true);
            encryptedResponse.put("data", result.getEncryptedData());
            encryptedResponse.put("iv", result.getIv());
            encryptedResponse.put("timestamp", System.currentTimeMillis());
            encryptedResponse.put("version", "1.0");
            
            log.debug("API数据加密成功，原始长度: {}", jsonData.length());
            return encryptedResponse;
            
        } catch (Exception e) {
            log.error("API数据加密失败: {}", e.getMessage(), e);
            throw new BusinessException("API数据加密失败");
        }
    }

    /**
     * API专用解密方法
     * 将API传输格式的加密数据解密为JSON
     *
     * @param encryptedData API格式的加密数据
     * @return 解密后的JSON字符串
     * @throws BusinessException 解密失败
     */
    public String decryptFromAPI(Map<String, Object> encryptedData) throws BusinessException {
        if (encryptedData == null || encryptedData.isEmpty()) {
            throw new BusinessException("待解密数据不能为空");
        }

        try {
            // 验证加密数据格式
            if (!Boolean.TRUE.equals(encryptedData.get("encrypted"))) {
                throw new BusinessException("数据格式错误：非加密数据");
            }

            String data = (String) encryptedData.get("data");
            String iv = (String) encryptedData.get("iv");
            
            if (data == null || iv == null) {
                throw new BusinessException("加密数据格式不完整");
            }

            // 验证时间戳（防重放攻击）
            Object timestampObj = encryptedData.get("timestamp");
            if (timestampObj instanceof Number) {
                long timestamp = ((Number) timestampObj).longValue();
                long currentTime = System.currentTimeMillis();
                long timeDiff = Math.abs(currentTime - timestamp);
                
                // 检查时间戳容差（默认10分钟）
                if (timeDiff > aesConfig.getTimestampTolerance()) {
                    log.warn("时间戳验证失败，时间差: {}ms", timeDiff);
                    // 在调试模式下只警告，不阻止解密
                    if (!aesConfig.isDebug()) {
                        throw new BusinessException("请求时间戳超出允许范围");
                    }
                }
            }

            // 执行解密
            String result = decrypt(data, iv);
            
            log.debug("API数据解密成功，解密后长度: {}", result.length());
            return result;
            
        } catch (Exception e) {
            log.error("API数据解密失败: {}", e.getMessage(), e);
            throw new BusinessException("API数据解密失败");
        }
    }

    /**
     * 加密结果封装类
     */
    public static class EncryptionResult {
        private final String encryptedData;
        private final String iv;

        public EncryptionResult(String encryptedData, String iv) {
            this.encryptedData = encryptedData;
            this.iv = iv;
        }

        public String getEncryptedData() {
            return encryptedData;
        }

        public String getIv() {
            return iv;
        }
    }
} 