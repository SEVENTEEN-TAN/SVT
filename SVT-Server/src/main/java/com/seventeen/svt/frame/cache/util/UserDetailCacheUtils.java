package com.seventeen.svt.frame.cache.util;

import cn.hutool.core.util.ObjectUtil;
import cn.hutool.extra.spring.SpringUtil;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.seventeen.svt.common.util.RedisUtils;
import com.seventeen.svt.frame.cache.entity.UserDetailCache;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

/**
 * 用户详情缓存工具类
 * 采用二级缓存: Caffeine + Redis
 * 过期时间与JWT保持一致
 * 
 * 优化说明：
 * - 添加了Redis异常处理机制
 * - 实现了优雅降级策略
 * - 缓存操作失败不会影响主业务流程
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class UserDetailCacheUtils {

    // region Caffeine缓存配置
    private static final Cache<String, UserDetailCache> userDetailLocalCache;

    static {
        userDetailLocalCache = Caffeine.newBuilder()
                .expireAfterWrite(10, TimeUnit.HOURS)
                .removalListener((key, value, cause) ->
                        log.info("Key {} was removed from Caffeine cache, cause: {}", key, cause))
                .recordStats()
                .build();
    }
    // endregion

    // region Redis缓存配置
    // Redis key前缀
    private static final String USER_DETAIL_KEY_PREFIX = "les:user:";
    // endregion

    /**
     * 安全执行Redis操作
     * @param operation Redis操作
     * @param operationName 操作名称
     */
    private static void safeRedisOperation(Runnable operation, String operationName) {
        try {
            operation.run();
        } catch (Exception e) {
            log.warn("Redis operation [{}] failed, degrading to local cache only. Error: {}", 
                     operationName, e.getMessage());
        }
    }

    /**
     * 安全执行Redis获取操作
     * @param operation Redis获取操作
     * @param operationName 操作名称
     * @return 获取结果，失败时返回null
     */
    private static <T> T safeRedisGet(java.util.function.Supplier<T> operation, String operationName) {
        try {
            return operation.get();
        } catch (Exception e) {
            log.warn("Redis get operation [{}] failed, using local cache only. Error: {}", 
                     operationName, e.getMessage());
            return null;
        }
    }

    /**
     * 获取用户详情缓存
     *
     * @param userId 用户ID
     * @return UserDetailCache
     */
    public static UserDetailCache getUserDetail(String userId) {

        // 尝试从本地获取
        UserDetailCache userDetail = userDetailLocalCache.getIfPresent(userId);
        if (ObjectUtil.isEmpty(userDetail)) {
            // 尝试从Redis获取
            userDetail = safeRedisGet(() -> (UserDetailCache) RedisUtils.get(USER_DETAIL_KEY_PREFIX + userId), "getUserDetail");
            if (ObjectUtil.isNotEmpty(userDetail)) {
                // 同步到本地缓存
                putUserDetailToLocal(userId, userDetail);
            }
        }
        log.debug("尝试获取{}用户详情信息:{}", userId, userDetail);
        return userDetail;
    }

    /**
     * 添加用户详情到本地缓存
     */
    private static void putUserDetailToLocal(String userId, UserDetailCache userDetail) {
        userDetailLocalCache.put(userId, userDetail);
    }

    /**
     * 添加或更新用户详情缓存
     *
     * @param userId     用户ID
     * @param userDetail 用户详情
     */
    public static void putUserDetail(String userId, UserDetailCache userDetail) {
        log.debug("尝试添加/更新{}用户详情信息:{}", userId, userDetail);
        // 本地缓存
        putUserDetailToLocal(userId, userDetail);
        // Redis缓存
        String expiration = SpringUtil.getProperty("jwt.expiration");
        safeRedisOperation(() -> RedisUtils.set(USER_DETAIL_KEY_PREFIX + userId, userDetail, Long.parseLong(expiration)), "putUserDetail");
    }

    /**
     * 删除用户详情缓存
     * 优化：即使Redis操作失败，也要确保本地缓存被清理
     *
     * @param userId 用户ID
     */
    public static void removeUserDetail(String userId) {
        log.debug("尝试删除{}用户详情信息", userId);
        // 本地删除（优先执行，确保本地状态正确）
        userDetailLocalCache.invalidate(userId);
        // Redis删除
        safeRedisOperation(() -> RedisUtils.del(USER_DETAIL_KEY_PREFIX + userId), "removeUserDetail");
        
        log.debug("Successfully removed user detail cache for user: {}", userId);
    }

}