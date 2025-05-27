package com.seventeen.svt.common.util;

import org.slf4j.MDC;

import java.util.UUID;

/**
 * TraceId工具类
 */
public class TraceIdUtils {
    
    public static final String TRACE_ID = "traceId";
    public static final String USER_ID = "userId";
    
    /**
     * 生成traceId
     */
    public static String generateTraceId() {
        return UUID.randomUUID().toString().replace("-", "");
    }
    
    /**
     * 设置traceId
     */
    public static void setTraceId(String traceId) {
        MDC.put(TRACE_ID, traceId);
    }
    
    /**
     * 获取traceId
     */
    public static String getTraceId() {
        return MDC.get(TRACE_ID);
    }
    
    /**
     * 设置userId
     */
    public static void setUserId(String userId) {
        MDC.put(USER_ID, userId);
    }
    
    /**
     * 获取userId
     */
    public static String getUserId() {
        return MDC.get(USER_ID);
    }
    
    /**
     * 清除MDC
     */
    public static void clear() {
        MDC.remove(TRACE_ID);
        MDC.remove(USER_ID);
    }

} 