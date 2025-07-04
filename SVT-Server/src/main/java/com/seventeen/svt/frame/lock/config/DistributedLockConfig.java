package com.seventeen.svt.frame.lock.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.lang.management.ManagementFactory;
import java.net.InetAddress;

/**
 * 分布式锁配置类
 * 
 * @author seventeen
 * @since 2024-01-04
 */
@Data
@Component
@ConfigurationProperties(prefix = "svt.distributed-lock")
public class DistributedLockConfig {
    
    /**
     * 锁等待超时时间(秒)
     */
    private long waitTimeout = 30;
    
    /**
     * 锁持有时间(秒) 
     */
    private long leaseTime = 10;
    
    /**
     * 重试间隔时间(毫秒)
     */
    private long retryInterval = 100;
    
    /**
     * 最大重试次数
     */
    private int maxRetryCount = 300; // 30秒 / 100ms = 300次
    
    /**
     * 过期锁清理间隔(秒)
     */
    private long cleanupInterval = 60;
    
    /**
     * 是否启用强制释放(达到最大重试次数后)
     */
    private boolean enableForceRelease = true;
    
    /**
     * 服务器标识(用于持有者信息)
     */
    private String serverIdentifier = getDefaultServerIdentifier();
    
    /**
     * 获取默认服务器标识
     */
    private String getDefaultServerIdentifier() {
        try {
            String hostAddress = InetAddress.getLocalHost().getHostAddress();
            String processName = ManagementFactory.getRuntimeMXBean().getName();
            return hostAddress + ":" + processName;
        } catch (Exception e) {
            return "unknown-server:" + System.currentTimeMillis();
        }
    }
    
    /**
     * 获取完整的持有者信息(包含线程ID)
     */
    public String getHolderInfo() {
        return serverIdentifier + ":thread-" + Thread.currentThread().getId();
    }
}
