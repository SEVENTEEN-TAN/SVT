package com.seventeen.svt.frame.cache.util;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;

import com.seventeen.svt.frame.cache.entity.JwtCache;
import com.seventeen.svt.frame.security.utils.JwtUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.util.concurrent.TimeUnit;

/**
 * JWT缓存工具 - 本地缓存版本
 * 采用Caffeine本地缓存，配合Session Sticky负载均衡策略
 * 
 * 设计说明：
 * - 使用纯本地缓存，避免分布式一致性问题
 * - 配合Session Sticky确保用户请求固定路由到同一实例
 * - 最大容量200，过期时间与JWT token一致
 * - 服务重启时用户需要重新登录（这是合理的安全策略）
 */
@Slf4j
@Component
public class JwtCacheUtils {

    private final JwtUtils jwtUtils;
    private Cache<String, JwtCache> userLocalCache;
    private Cache<String, String> blacklistCache;

    @Value("${jwt.expiration}")
    private long expirationSeconds;

    @Value("${jwt.refresh-threshold-seconds}")
    private long refreshThresholdSeconds;

    public JwtCacheUtils(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }
    
    @PostConstruct
    private void initCaches() {
        log.info("Initializing JWT caches with expiration: {} seconds, refresh threshold: {} seconds", 
                 expirationSeconds, refreshThresholdSeconds);
        
        // JWT用户缓存 - 无大小限制，仅按时间过期
        this.userLocalCache = Caffeine.newBuilder()
                .expireAfterWrite(expirationSeconds, TimeUnit.SECONDS)
                .removalListener((key, value, cause) ->
                        log.debug("JWT cache removed for user: {}, cause: {}", key, cause))
                .recordStats()
                .build();
        
        // JWT黑名单缓存 - 无大小限制，仅按时间过期
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
    
    public JwtCache createJwtCache(String token, String userId, String ipAddress) {
        return JwtCache.builder()
                .token(token)
                .userId(userId)
                .loginIp(ipAddress)
                .createdTime(jwtUtils.getIssuedAtDateFromToken(token))
                .expirationTime(jwtUtils.getExpirationDateFromToken(token))
                .refreshTime(System.currentTimeMillis() + refreshThresholdSeconds * 1000)
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
            // 将token加入黑名单
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
    
    public boolean needsRefresh(String userId) {
        JwtCache jwt = getJwt(userId);
        return jwt != null && System.currentTimeMillis() > jwt.getRefreshTime();
    }
    
    public void renewJwt(String userId) {
        JwtCache jwt = getJwt(userId);
        if (jwt != null) {
            jwt.setRefreshTime(System.currentTimeMillis() + refreshThresholdSeconds * 1000);
            putJwt(userId, jwt);
            log.debug("JWT refreshed for user: {}", userId);
        }
    }
} 