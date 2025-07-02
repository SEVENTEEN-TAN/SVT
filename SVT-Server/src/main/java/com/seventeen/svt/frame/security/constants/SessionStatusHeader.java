package com.seventeen.svt.frame.security.constants;

/**
 * 会话状态响应头常量定义 (简化版本)
 * 用于前后端会话状态通信
 * 
 * @author SVT Team
 * @since v1.2 (2025-07-01) - 简化版本
 */
public class SessionStatusHeader {
    
    /**
     * 会话状态响应头
     * 值: NORMAL, EXPIRED
     */
    public static final String SESSION_STATUS = "X-Session-Status";
    
    /**
     * 会话剩余时间响应头 (毫秒)
     */
    public static final String SESSION_REMAINING = "X-Session-Remaining";
    
    /**
     * 会话警告消息响应头
     * 用于传递过期原因：JWT_TOKEN_EXPIRED, ACTIVITY_EXPIRED
     */
    public static final String SESSION_WARNING = "X-Session-Warning";
    
    // 状态值常量 (简化版本)
    public static final String STATUS_NORMAL = "NORMAL";
    public static final String STATUS_EXPIRED = "EXPIRED";
    
    // 过期原因常量
    public static final String EXPIRED_REASON_JWT_TOKEN = "JWT_TOKEN_EXPIRED";
    public static final String EXPIRED_REASON_ACTIVITY = "ACTIVITY_EXPIRED";
    
    private SessionStatusHeader() {
        // 工具类，禁止实例化
    }
}
