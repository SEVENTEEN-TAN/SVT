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
            userDetail = (UserDetailCache) RedisUtils.get(USER_DETAIL_KEY_PREFIX + userId);
            if (ObjectUtil.isNotEmpty(userDetail)) {
                // 同步到本地缓存
                putUserDetail(userId, userDetail);
            }
        }
        log.debug("尝试获取{}用户详情信息:{}", userId, userDetail);
        return userDetail;
    }

    /**
     * 添加或更新用户详情缓存
     *
     * @param userId     用户ID
     * @param userDetail 用户详情
     */
    public static void putUserDetail(String userId, UserDetailCache userDetail) {
        removeUserDetail(userId);
        log.debug("尝试添加/更新{}用户详情信息:{}", userId, userDetail);
        // 本地缓存
        userDetailLocalCache.put(userId, userDetail);
        // Redis缓存
        String expiration = SpringUtil.getProperty("jwt.expiration");
        RedisUtils.set(USER_DETAIL_KEY_PREFIX + userId, userDetail, Long.parseLong(expiration));
    }

    /**
     * 删除用户详情缓存
     *
     * @param userId 用户ID
     */
    public static void removeUserDetail(String userId) {
        log.debug("尝试删除{}用户详情信息", userId);
        // 本地删除
        userDetailLocalCache.invalidate(userId);
        // Redis删除
        RedisUtils.del(USER_DETAIL_KEY_PREFIX + userId);
    }

}