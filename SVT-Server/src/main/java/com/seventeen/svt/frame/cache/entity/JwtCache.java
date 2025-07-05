package com.seventeen.svt.frame.cache.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Date;

/**
 * JWT缓存实体类 (简化版本)
 *
 * 设计说明：
 * - 移除废弃的续期机制字段
 * - 专注于活跃度管理的核心字段
 * - 保持序列化兼容性
 * 
 * @since v1.2 (2025-07-01) - 简化版本
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JwtCache implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 当前Token
     */
    private String token;

    /**
     * 登录ID(用户ID)
     */
    private String userId;

    /**
     * 登录IP
     */
    private String loginIp;

    /**
     * 创建时间
     */
    private Date createdTime;

    /**
     * 过期时间
     */
    private Date expirationTime;

    /**
     * 最后活动时间 (毫秒时间戳)
     * 用于跟踪用户最后一次操作的时间
     */
    private Long lastActivityTime;

    /**
     * 活跃度周期开始时间 (毫秒时间戳)
     * 用于计算当前活跃度周期的起始时间
     */
    private Long activityCycleStartTime;

    /**
     * 活跃度续期次数 (统计用途)
     * 记录用户在当前会话中进行活跃度续期的次数
     */
    private Integer activityRenewalCount;
}
