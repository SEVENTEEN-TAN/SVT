package com.seventeen.svt.frame.cache.util;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.seventeen.svt.common.util.RedisUtils;
import com.seventeen.svt.frame.cache.entity.UserDetailCache;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.ObjectUtils;

import java.util.concurrent.TimeUnit;

/**
 * 用户详情缓存工具类
 * 采用二级缓存: Caffeine + Redis
 * 过期时间与JWT保持一致
 * <p>
 * 优化说明：
 * - 添加了Redis异常处理机制
 * - 实现了优雅降级策略
 * - 缓存操作失败不会影响主业务流程
 */
@Slf4j
@Component
public class UserDetailCacheUtils {

    private final RedisUtils redisUtils;
    private final Cache<String, UserDetailCache> userDetailLocalCache;

    @Value("${jwt.expiration}")
    private long expirationSeconds;

    private static final String USER_DETAIL_KEY_PREFIX = "les:user:";

    public UserDetailCacheUtils(RedisUtils redisUtils) {
        this.redisUtils = redisUtils;
        this.userDetailLocalCache = Caffeine.newBuilder()
                .expireAfterWrite(expirationSeconds, TimeUnit.SECONDS) // 可以考虑与JWT过期时间关联
                .removalListener((key, value, cause) ->
                        log.info("Key {} was removed from UserDetailCache, cause: {}", key, cause))
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

    /**
     * 获取用户详情缓存
     *
     * @param userId 用户ID
     * @return UserDetailCache
     */
    public UserDetailCache getUserDetail(String userId) {
        // 从本地缓存获取
        UserDetailCache userDetail = userDetailLocalCache.getIfPresent(userId);
        if (ObjectUtils.isEmpty(userDetail)) {
            userDetail = safeRedisGet(() -> (UserDetailCache) redisUtils.get(USER_DETAIL_KEY_PREFIX + userId), "getUserDetail");
            if (!ObjectUtils.isEmpty(userDetail)) {
                userDetailLocalCache.put(userId, userDetail);
            }
        }
        return userDetail;
    }

    /**
     * 添加或更新用户详情缓存
     *
     * @param userId     用户ID
     * @param userDetail 用户详情
     */
    public void putUserDetail(String userId, UserDetailCache userDetail) {
        userDetailLocalCache.put(userId, userDetail);
        safeRedisOperation(() -> redisUtils.set(USER_DETAIL_KEY_PREFIX + userId, userDetail, expirationSeconds), "putUserDetail");
    }

    /**
     * 删除用户详情缓存
     * 优化：即使Redis操作失败，也要确保本地缓存被清理
     *
     * @param userId 用户ID
     */
    public void removeUserDetail(String userId) {
        userDetailLocalCache.invalidate(userId);
        safeRedisOperation(() -> redisUtils.del(USER_DETAIL_KEY_PREFIX + userId), "removeUserDetail");
    }
}