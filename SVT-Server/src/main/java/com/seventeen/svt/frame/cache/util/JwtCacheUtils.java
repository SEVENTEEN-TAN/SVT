package com.seventeen.svt.frame.cache.util;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;

import com.seventeen.svt.frame.cache.entity.JwtCache;
import com.seventeen.svt.frame.security.constants.SessionStatusHeader;
import com.seventeen.svt.frame.security.utils.JwtUtils;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.util.concurrent.TimeUnit;

/**
 * JWT缓存工具 - 简化版本
 * 采用Caffeine本地缓存，配合Session Sticky负载均衡策略
 * 
 * 设计说明：
 * - 使用纯本地缓存，避免分布式一致性问题
 * - 配合Session Sticky确保用户请求固定路由到同一实例
 * - 最大容量1000，服务重启时用户需要重新登录
 * - 简化的智能续期机制：只处理正常和过期两种状态
 * 
 * @since v1.2 (2025-07-01) - 简化版本
 */
@Slf4j
@Component
public class JwtCacheUtils {

    private final JwtUtils jwtUtils;
    private Cache<String, JwtCache> userLocalCache;
    private Cache<String, String> blacklistCache;

    @Value("${jwt.expiration}")
    private long expirationSeconds;

    /**
     * 是否启用智能续期机制
     */
    @Value("${jwt.smart-renewal.enabled:true}")
    private boolean smartRenewalEnabled;

    /**
     * 活跃度周期时间 (秒)
     * 用户在此时间内无操作将被视为不活跃
     */
    @Value("${jwt.smart-renewal.activity-cycle-seconds:600}")
    private int activityCycleSeconds;

    /**
     * 活跃度续期阈值 (百分比)
     * 在活跃度周期的后X%时间内有操作将触发续期
     */
    @Value("${jwt.smart-renewal.activity-renewal-threshold:20}")
    private int activityRenewalThreshold;

    public JwtCacheUtils(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }
    
    @PostConstruct
    private void initCaches() {
        log.info("Initializing JWT caches (Simplified Version):");
        log.info("  - Token expiration: {} seconds ({} minutes)", expirationSeconds, expirationSeconds / 60);
        log.info("  - Smart renewal enabled: {}", smartRenewalEnabled);

        if (smartRenewalEnabled) {
            log.info("  - Activity cycle: {} seconds ({} minutes)", activityCycleSeconds, activityCycleSeconds / 60);
            log.info("  - Activity renewal threshold: {}% (last {} seconds)",
                    activityRenewalThreshold, (activityCycleSeconds * activityRenewalThreshold / 100));
        }

        // JWT用户缓存
        this.userLocalCache = Caffeine.newBuilder()
                .maximumSize(1000)
                .removalListener((key, value, cause) ->
                        log.debug("JWT cache removed for user: {}, cause: {}", key, cause))
                .recordStats()
                .build();

        // JWT黑名单缓存
        this.blacklistCache = Caffeine.newBuilder()
                .expireAfterWrite(expirationSeconds, TimeUnit.SECONDS)
                .removalListener((key, value, cause) ->
                        log.debug("Blacklist token removed: {}, cause: {}", key, cause))
                .build();

        log.info("JWT caches initialized successfully");
    }

    /**
     * 获取缓存统计信息
     */
    public String getCacheStats() {
        return String.format("JWT Cache Stats - Size: %d, Hit Rate: %.2f%%, Blacklist Size: %d",
                userLocalCache.estimatedSize(),
                userLocalCache.stats().hitRate() * 100,
                blacklistCache.estimatedSize());
    }
    
    /**
     * 创建JWT缓存对象
     */
    public JwtCache createJwtCache(String token, String userId, String ipAddress) {
        long currentTime = System.currentTimeMillis();

        return JwtCache.builder()
                .token(token)
                .userId(userId)
                .loginIp(ipAddress)
                .createdTime(jwtUtils.getIssuedAtDateFromToken(token))
                .expirationTime(jwtUtils.getExpirationDateFromToken(token))
                .lastActivityTime(currentTime)
                .activityCycleStartTime(currentTime)
                .activityRenewalCount(0)
                .build();
    }
    
    public JwtCache getJwt(String userId) {
        JwtCache jwtCache = userLocalCache.getIfPresent(userId);
        if (jwtCache != null) {
            log.debug("JWT found in local cache for user: {}", userId);
        } else {
            log.debug("JWT not found in local cache for user: {}", userId);
        }
        return jwtCache;
    }
    
    public void putJwt(String userId, JwtCache jwtCache) {
        userLocalCache.put(userId, jwtCache);
        log.debug("JWT cached for user: {}, expires at: {}", userId, jwtCache.getExpirationTime());
    }
    
    public void removeJwt(String userId) {
        JwtCache jwt = getJwt(userId);
        if (jwt != null) {
            invalidJwt(jwt.getToken());
        }
        userLocalCache.invalidate(userId);
        log.debug("Successfully removed JWT cache for user: {}", userId);
    }
    
    public void invalidJwt(String token) {
        blacklistCache.put(token, "INVALID");
        log.debug("Token added to blacklist: {}", token.substring(0, Math.min(10, token.length())) + "...");
    }
    
    public boolean isBlackToken(String token) {
        boolean isBlacklisted = blacklistCache.getIfPresent(token) != null;
        if (isBlacklisted) {
            log.debug("Token found in blacklist");
        }
        return isBlacklisted;
    }
    
    public boolean checkIpChange(String userId, String currentIp) {
        JwtCache jwt = getJwt(userId);
        return jwt != null && !currentIp.equals(jwt.getLoginIp());
    }

    public boolean checkTokenChange(String userId, String token) {
        JwtCache jwt = getJwt(userId);
        return jwt != null && token != null && !token.equals(jwt.getToken());
    }

    /**
     * 检查是否需要活跃度续期
     * 在活跃度周期的续期窗口内（后X%时间）返回true
     */
    public boolean needsActivityRenewal(String userId) {
        if (!smartRenewalEnabled) {
            log.debug("智能续期未启用 - User: {}", userId);
            return false;
        }

        JwtCache jwt = getJwt(userId);
        if (jwt == null || jwt.getActivityCycleStartTime() == null) {
            log.warn("JWT缓存不存在或活跃度周期未初始化 - User: {}", userId);
            return false;
        }

        long currentTime = System.currentTimeMillis();
        long cycleStartTime = jwt.getActivityCycleStartTime();
        long cycleDuration = activityCycleSeconds * 1000L;
        long renewalWindow = (long)(cycleDuration * activityRenewalThreshold / 100.0);

        long elapsedTime = currentTime - cycleStartTime;
        boolean inRenewalWindow = elapsedTime >= (cycleDuration - renewalWindow);

        log.debug("续期检查 - User: {}, 已用时: {}ms, 周期: {}ms, 需要续期: {}", 
                 userId, elapsedTime, cycleDuration, inRenewalWindow);

        return inRenewalWindow;
    }

    /**
     * 执行活跃度续期，带Token生命周期限制
     */
    public ActivityRenewalResult renewActivityWithTokenLimit(String userId) {
        JwtCache jwt = getJwt(userId);
        if (jwt == null) {
            return ActivityRenewalResult.failed("JWT cache not found");
        }

        if (jwtUtils.isTokenExpired(jwt.getToken()) || isBlackToken(jwt.getToken())) {
            log.warn("Cannot renew activity for expired/blacklisted token, user: {}", userId);
            removeJwt(userId);
            return ActivityRenewalResult.failed("Token expired or blacklisted");
        }

        long currentTime = System.currentTimeMillis();
        long tokenExpiryTime = jwt.getExpirationTime().getTime();
        long normalActivityExpiryTime = currentTime + activityCycleSeconds * 1000L;

        // 正常续期
        jwt.setActivityCycleStartTime(currentTime);
        jwt.setLastActivityTime(currentTime);
        jwt.setActivityRenewalCount((jwt.getActivityRenewalCount() == null ? 0 : jwt.getActivityRenewalCount()) + 1);
        putJwt(userId, jwt);

        boolean limitedByToken = normalActivityExpiryTime > tokenExpiryTime;
        long remainingTime = limitedByToken ? (tokenExpiryTime - currentTime) : (activityCycleSeconds * 1000L);

        log.debug("活跃度续期成功 - User: {}, 续期次数: {}, 受Token限制: {}", 
                userId, jwt.getActivityRenewalCount(), limitedByToken);
        
        return ActivityRenewalResult.success(remainingTime, limitedByToken);
    }

    /**
     * 获取会话状态信息 (简化版本)
     * 只返回两种状态：正常或过期（带过期原因）
     */
    public SessionStatusInfo getSessionStatus(String userId) {
        JwtCache jwt = getJwt(userId);
        if (jwt == null) {
            return SessionStatusInfo.expired(ExpiredReason.JWT_TOKEN_EXPIRED);
        }

        long currentTime = System.currentTimeMillis();

        // 1. 检查JWT Token是否过期
        long tokenExpiryTime = jwt.getExpirationTime().getTime();
        if (currentTime >= tokenExpiryTime) {
            log.debug("JWT Token expired for user: {}", userId);
            return SessionStatusInfo.expired(ExpiredReason.JWT_TOKEN_EXPIRED);
        }

        // 2. 检查活跃度是否过期
        if (isSessionExpiredByActivity(userId)) {
            log.debug("Session expired by activity for user: {}", userId);
            return SessionStatusInfo.expired(ExpiredReason.ACTIVITY_EXPIRED);
        }

        // 3. 检查是否需要更新活跃度缓存（在阈值内才更新）
        if (needsActivityRenewal(userId)) {
            ActivityRenewalResult result = renewActivityWithTokenLimit(userId);
            log.debug("Activity renewal attempt for user: {}, success: {}", userId, result.isSuccess());
        }

        // 4. 返回正常状态
        long activityExpiryTime = jwt.getActivityCycleStartTime() + activityCycleSeconds * 1000L;
        long activityRemainingTime = activityExpiryTime - currentTime;
        return SessionStatusInfo.normal(activityRemainingTime);
    }

    /**
     * 检查会话是否因活跃度过期
     */
    public boolean isSessionExpiredByActivity(String userId) {
        if (!smartRenewalEnabled) {
            return false;
        }

        JwtCache jwt = getJwt(userId);
        if (jwt == null || jwt.getActivityCycleStartTime() == null) {
            return true;
        }

        long currentTime = System.currentTimeMillis();
        long cycleStartTime = jwt.getActivityCycleStartTime();
        long cycleDuration = activityCycleSeconds * 1000L;

        long elapsedTime = currentTime - cycleStartTime;
        boolean expired = elapsedTime > cycleDuration;

        if (expired) {
            log.debug("Session expired by activity for user: {}, elapsed: {}ms, cycle: {}ms",
                     userId, elapsedTime, cycleDuration);
        }

        return expired;
    }

    /**
     * 更新用户最后活动时间
     */
    public void updateLastActivity(String userId) {
        JwtCache jwt = getJwt(userId);
        if (jwt != null) {
            jwt.setLastActivityTime(System.currentTimeMillis());
            putJwt(userId, jwt);
        }
    }

    /**
     * 活跃度续期结果
     */
    @Getter
    public static class ActivityRenewalResult {
        private final boolean success;
        private final String message;
        private final long remainingTime;
        private final boolean limitedByToken;

        private ActivityRenewalResult(boolean success, String message, long remainingTime, boolean limitedByToken) {
            this.success = success;
            this.message = message;
            this.remainingTime = remainingTime;
            this.limitedByToken = limitedByToken;
        }

        public static ActivityRenewalResult success(long remainingTime, boolean limitedByToken) {
            return new ActivityRenewalResult(true, "Success", remainingTime, limitedByToken);
        }

        public static ActivityRenewalResult failed(String message) {
            return new ActivityRenewalResult(false, message, 0, false);
        }

    }

    /**
     * 会话状态信息 (简化版本)
     */
    @Getter
    public static class SessionStatusInfo {
        private final String status;
        private final long remainingTime;
        private final String message;
        private final ExpiredReason expiredReason;

        private SessionStatusInfo(String status, long remainingTime, String message, ExpiredReason expiredReason) {
            this.status = status;
            this.remainingTime = remainingTime;
            this.message = message;
            this.expiredReason = expiredReason;
        }

        public static SessionStatusInfo normal(long remainingTime) {
            return new SessionStatusInfo("NORMAL", remainingTime, null, null);
        }

        public static SessionStatusInfo expired(ExpiredReason reason) {
            return new SessionStatusInfo("EXPIRED", 0, reason.getMessage(), reason);
        }

    }

    /**
     * 过期原因枚举
     */
    @Getter
    public enum ExpiredReason {
        JWT_TOKEN_EXPIRED(SessionStatusHeader.EXPIRED_REASON_JWT_TOKEN),
        ACTIVITY_EXPIRED(SessionStatusHeader.EXPIRED_REASON_ACTIVITY);

        private final String message;

        ExpiredReason(String message) {
            this.message = message;
        }

    }
}