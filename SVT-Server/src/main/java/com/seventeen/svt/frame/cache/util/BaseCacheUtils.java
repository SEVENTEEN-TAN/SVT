package com.seventeen.svt.frame.cache.util;

import lombok.extern.slf4j.Slf4j;

/**
 * 基础缓存工具类
 * 提供通用的Redis异常处理和优雅降级功能
 * 
 * 设计原则：
 * - 缓存操作失败不应该影响主业务流程
 * - Redis故障时优雅降级到本地缓存
 * - 统一的异常处理和日志记录
 */
@Slf4j
public abstract class BaseCacheUtils {

    /**
     * 安全执行Redis操作
     * @param operation Redis操作
     * @param operationName 操作名称（用于日志记录）
     * @return 操作是否成功
     */
    protected static boolean safeRedisOperation(Runnable operation, String operationName) {
        try {
            operation.run();
            return true;
        } catch (Exception e) {
            log.warn("Redis operation [{}] failed, degrading to local cache only. Error: {}", 
                     operationName, e.getMessage());
            // 在DEBUG级别记录详细的异常信息
            log.debug("Redis operation [{}] exception details:", operationName, e);
            return false;
        }
    }

    /**
     * 安全执行Redis获取操作
     * @param operation Redis获取操作
     * @param operationName 操作名称（用于日志记录）
     * @return 获取结果，失败时返回null
     */
    protected static <T> T safeRedisGet(java.util.function.Supplier<T> operation, String operationName) {
        try {
            return operation.get();
        } catch (Exception e) {
            log.warn("Redis get operation [{}] failed, using local cache only. Error: {}", 
                     operationName, e.getMessage());
            // 在DEBUG级别记录详细的异常信息
            log.debug("Redis get operation [{}] exception details:", operationName, e);
            return null;
        }
    }

    /**
     * 检查是否为Redis只读异常
     * @param e 异常对象
     * @return 是否为只读异常
     */
    protected static boolean isRedisReadOnlyException(Exception e) {
        return e.getMessage() != null && 
               (e.getMessage().contains("READONLY") || 
                e.getMessage().contains("read only replica"));
    }

    /**
     * 检查是否为Redis连接异常
     * @param e 异常对象
     * @return 是否为连接异常
     */
    protected static boolean isRedisConnectionException(Exception e) {
        return e.getClass().getSimpleName().contains("Connection") ||
               (e.getMessage() != null && e.getMessage().contains("connection"));
    }

    /**
     * 获取友好的异常描述
     * @param e 异常对象
     * @return 友好的异常描述
     */
    protected static String getFriendlyErrorMessage(Exception e) {
        if (isRedisReadOnlyException(e)) {
            return "Redis configured as read-only replica";
        } else if (isRedisConnectionException(e)) {
            return "Redis connection failed";
        } else {
            return "Redis operation failed: " + e.getMessage();
        }
    }
} 