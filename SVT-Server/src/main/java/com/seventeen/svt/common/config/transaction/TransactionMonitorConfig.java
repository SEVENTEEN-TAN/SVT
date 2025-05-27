package com.seventeen.svt.common.config.transaction;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * 事务监控配置
 */
@Component
@ConfigurationProperties(prefix = "transaction.monitor")
@Data
public class TransactionMonitorConfig {
    
    /**
     * 是否启用事务监控
     */
    private boolean enabled = false;
} 