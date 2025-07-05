package com.seventeen.svt.frame.cache.util;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.seventeen.svt.frame.cache.entity.UserDetailCache;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.ObjectUtils;

import jakarta.annotation.PostConstruct;
import java.util.concurrent.TimeUnit;

/**
 * 用户详情缓存工具类
 * 采用本地缓存: Caffeine
 * 过期时间与JWT保持一致
 * <p>
 * 优化说明（v1.1）：
 * - 移除Redis依赖，使用纯本地缓存
 * - 简化缓存架构，提高性能
 * - 适合Session Sticky负载均衡环境
 */
@Slf4j
@Component
public class UserDetailCacheUtils {

    private Cache<String, UserDetailCache> userDetailLocalCache;

    @Value("${jwt.expiration}")
    private long expirationSeconds;

    @PostConstruct
    private void initCache() {
        log.info("Initializing UserDetailCache with expiration: {} seconds ({} hours)", 
                expirationSeconds, expirationSeconds / 3600);
        
        this.userDetailLocalCache = Caffeine.newBuilder()
                .maximumSize(1000)  // 增加最大容量
                .expireAfterWrite(expirationSeconds, TimeUnit.SECONDS)
                .removalListener((key, value, cause) ->
                        log.debug("Key {} was removed from UserDetailCache, cause: {}", key, cause))
                .recordStats()
                .build();
                
        log.info("UserDetailCache initialized successfully");
    }

    /**
     * 获取用户详情缓存
     *
     * @param userId 用户ID
     * @return UserDetailCache
     */
    public UserDetailCache getUserDetail(String userId) {
        if (ObjectUtils.isEmpty(userId)) {
            return null;
        }
        return userDetailLocalCache.getIfPresent(userId);
    }

    /**
     * 添加或更新用户详情缓存
     *
     * @param userId     用户ID
     * @param userDetail 用户详情
     */
    public void putUserDetail(String userId, UserDetailCache userDetail) {
        if (!ObjectUtils.isEmpty(userId) && !ObjectUtils.isEmpty(userDetail)) {
            userDetailLocalCache.put(userId, userDetail);
            log.debug("User detail cached for user: {}", userId);
        }
    }

    /**
     * 删除用户详情缓存
     *
     * @param userId 用户ID
     */
    public void removeUserDetail(String userId) {
        if (!ObjectUtils.isEmpty(userId)) {
            userDetailLocalCache.invalidate(userId);
            log.debug("User detail cache removed for user: {}", userId);
        }
    }

    /**
     * 获取缓存统计信息
     */
    public String getCacheStats() {
        return String.format("UserDetail Cache - Size: %d, Hit Rate: %.2f%%",
                userDetailLocalCache.estimatedSize(),
                userDetailLocalCache.stats().hitRate() * 100);
    }
}