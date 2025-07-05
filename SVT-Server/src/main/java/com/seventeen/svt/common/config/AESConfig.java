package com.seventeen.svt.common.config;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;



/**
 * AES加密配置类
 * 统一管理AES加密相关配置
 * 
 * @author SEVENTEEN
 * @since 2025-06-17
 */
@Slf4j
@Data
@Configuration
@ConfigurationProperties(prefix = "svt.security.aes")
public class AESConfig {

    /**
     * 是否启用AES加密
     */
    private boolean enabled = true;

    /**
     * AES密钥
     */
    private String key = "SVT-DEFAULT-AES-KEY-256BITS-FOR-DEV";

    /**
     * 加密算法
     */
    private String algorithm = "AES/CBC/PKCS5Padding";

    /**
     * 密钥长度（位）
     */
    private int keyLength = 256;

    /**
     * 最大数据大小（字节）
     */
    private long maxDataSize = 10485760L; // 10MB

    /**
     * 是否启用调试模式
     */
    private boolean debug = false;

    /**
     * 密钥缓存过期时间（毫秒）
     */
    private long keyCacheExpiry = 3600000L; // 1小时

    /**
     * 时间戳验证容差（毫秒）
     */
    private long timestampTolerance = 600000L; // 10分钟



    /**
     * 是否使用默认密钥
     */
    public boolean isUsingDefaultKey() {
        return "SVT-DEFAULT-AES-KEY-256BITS-FOR-DEV".equals(key);
    }

    /**
     * 获取安全配置摘要（不包含敏感信息）
     */
    public String getConfigSummary() {
        return String.format(
            "AES[enabled=%s, algorithm=%s, keyLength=%d, maxDataSize=%dMB]",
            enabled, algorithm, keyLength, maxDataSize / 1024 / 1024
        );
    }

    /**
     * 动态启用AES加密
     */
    public void enableAES() {
        if (!enabled) {
            this.enabled = true;
            log.info("✅ AES加密已动态启用");
        }
    }

    /**
     * 动态禁用AES加密
     */
    public void disableAES() {
        if (enabled) {
            this.enabled = false;
            log.warn("⚠️ AES加密已动态禁用");
        }
    }

    /**
     * 获取密钥字节长度
     */
    public int getKeyByteLength() {
        return keyLength / 8;
    }

    /**
     * 检查数据大小是否超限
     */
    public boolean isDataSizeValid(long dataSize) {
        return dataSize <= maxDataSize;
    }

    /**
     * 检查时间戳是否在容差范围内
     */
    public boolean isTimestampValid(long timestamp) {
        long now = System.currentTimeMillis();
        long diff = Math.abs(now - timestamp);
        return diff <= timestampTolerance;
    }
} 