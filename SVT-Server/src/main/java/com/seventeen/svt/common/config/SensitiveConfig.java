package com.seventeen.svt.common.config;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;

/**
 * 敏感数据脱敏配置类
 * 统一管理脱敏相关配置
 * 
 * @author SEVENTEEN
 * @since 2025-06-19
 */
@Slf4j
@Data
@Configuration
@ConfigurationProperties(prefix = "svt.security.sensitive")
public class SensitiveConfig {

    /**
     * 脱敏功能总开关
     * dev环境建议设置为false便于调试
     * prod环境强制设置为true保护数据安全
     */
    private boolean enabled = true;

    /**
     * 配置初始化
     */
    @PostConstruct
    public void init() {
        log.info("敏感数据脱敏配置初始化完成: enabled={}", enabled);
        if (!enabled) {
            log.warn("⚠️ 敏感数据脱敏功能已禁用！请确保在开发环境使用");
        } else {
            log.info("✅ 敏感数据脱敏功能已启用，将对日志和审计记录进行脱敏处理");
        }
    }

    /**
     * 动态启用脱敏功能
     */
    public void enableSensitive() {
        if (!enabled) {
            this.enabled = true;
            log.info("✅ 敏感数据脱敏功能已动态启用");
        }
    }

    /**
     * 动态禁用脱敏功能
     */
    public void disableSensitive() {
        if (enabled) {
            this.enabled = false;
            log.warn("⚠️ 敏感数据脱敏功能已动态禁用");
        }
    }
} 