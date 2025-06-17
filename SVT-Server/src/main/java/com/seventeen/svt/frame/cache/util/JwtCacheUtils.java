package com.seventeen.svt.frame.cache.util;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.seventeen.svt.common.util.RedisUtils;
import com.seventeen.svt.frame.cache.entity.JwtCache;
import com.seventeen.svt.frame.security.utils.JwtUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.ObjectUtils;

import java.util.concurrent.TimeUnit;

/**
 * Jwt的缓存工具
 * 此处采用二级缓存: Caffeine + Redis
 * 注意: Caffeine的初始化有固定大小本地没有会尝试从云端同步
 * - 最大容量80
 * - 过期时间5分钟
 * 
 * 优化说明：
 * - 添加了Redis异常处理机制
 * - 实现了优雅降级策略
 * - 缓存操作失败不会影响主业务流程
 */
@Slf4j
@Component
public class JwtCacheUtils {

    private final JwtUtils jwtUtils;
    private final RedisUtils redisUtils;
    private final Cache<String, JwtCache> userLocalCache;

    @Value("${jwt.expiration}")
    private long expirationSeconds;

    @Value("${jwt.refresh-threshold-seconds}")
    private long refreshThresholdSeconds;

    private static final String JWT_KEY_PREFIX = "les:jwt:";
    private static final String JWT_BLACKLIST_KEY = JWT_KEY_PREFIX + "blacklist:";

    public JwtCacheUtils(JwtUtils jwtUtils, RedisUtils redisUtils) {
        this.jwtUtils = jwtUtils;
        this.redisUtils = redisUtils;
        this.userLocalCache = Caffeine.newBuilder()
                .maximumSize(80)
                .expireAfterWrite(5, TimeUnit.MINUTES)
                .removalListener((key, value, cause) ->
                        log.info("Key {} was removed from Caffeine cache, cause: {}", key, cause))
                .recordStats()
                .build();
    }

    private void safeRedisOperation(Runnable operation, String operationName) {
        try {
            operation.run();
        } catch (Exception e) {
            log.warn("Redis operation [{}] failed, degrading to local cache only. Error: {}", operationName, e.getMessage());
        }
    }

    private <T> T safeRedisGet(java.util.function.Supplier<T> operation, String operationName) {
        try {
            return operation.get();
        } catch (Exception e) {
            log.warn("Redis get operation [{}] failed, using local cache only. Error: {}", operationName, e.getMessage());
            return null;
        }
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
        if (ObjectUtils.isEmpty(jwtCache)) {
            jwtCache = safeRedisGet(() -> (JwtCache) redisUtils.get(JWT_KEY_PREFIX + userId), "getJwt");
            if (!ObjectUtils.isEmpty(jwtCache)) {
                userLocalCache.put(userId, jwtCache);
            }
        }
        return jwtCache;
    }
    
    public void putJwt(String userId, JwtCache jwtCache) {
        userLocalCache.put(userId, jwtCache);
        safeRedisOperation(() -> redisUtils.set(JWT_KEY_PREFIX + userId, jwtCache, expirationSeconds), "putJwt");
    }
    
    public void removeJwt(String userId) {
        JwtCache jwt = getJwt(userId);
        if (!ObjectUtils.isEmpty(jwt)) {
            safeRedisOperation(() -> invalidJwt(jwt.getToken()), "invalidJwt");
        }
        userLocalCache.invalidate(userId);
        safeRedisOperation(() -> redisUtils.del(JWT_KEY_PREFIX + userId), "removeJwt");
        log.debug("Successfully removed JWT cache for user: {}", userId);
    }
    
    public void invalidJwt(String token) {
        safeRedisOperation(() -> redisUtils.set(JWT_BLACKLIST_KEY + token, "1", expirationSeconds), "invalidJwt");
    }
    
    public boolean isBlackToken(String token) {
        Boolean result = safeRedisGet(() -> redisUtils.hasKey(JWT_BLACKLIST_KEY + token), "isBlackToken");
        return result != null && result;
    }
    
    public boolean checkIpChange(String userId, String currentIp) {
        JwtCache jwt = getJwt(userId);
        return !ObjectUtils.isEmpty(jwt) && !currentIp.equals(jwt.getLoginIp());
    }

    public boolean checkTokenChange(String userId, String token) {
        JwtCache jwt = getJwt(userId);
        return !ObjectUtils.isEmpty(jwt) && token != null && !token.equals(jwt.getToken());
    }
    
    public boolean needsRefresh(String userId) {
        JwtCache jwt = getJwt(userId);
        return !ObjectUtils.isEmpty(jwt) && System.currentTimeMillis() > jwt.getRefreshTime();
    }
    
    public void renewJwt(String userId) {
        JwtCache jwt = getJwt(userId);
        if (!ObjectUtils.isEmpty(jwt)) {
            jwt.setRefreshTime(System.currentTimeMillis() + refreshThresholdSeconds * 1000);
            putJwt(userId, jwt);
        }
    }
} 