package com.seventeen.svt.frame.cache.util;

import cn.hutool.core.util.ObjectUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.extra.spring.SpringUtil;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.seventeen.svt.common.util.RedisUtils;
import com.seventeen.svt.modules.system.entity.UserInfo;
import com.seventeen.svt.modules.system.service.UserInfoService;
import io.micrometer.common.util.StringUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;
import java.util.function.Function;

/**
 * 机构信息缓存工具类
 * 采用本地缓存: Caffeine
 * 过期时间1小时
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class UserInfoCacheUtils {

    private static final Cache<String, UserInfo> userInfoCache;

    static {
        userInfoCache = Caffeine.newBuilder()
                .maximumSize(100) // 设置最大容量为100条
                .expireAfterWrite(1, TimeUnit.HOURS)
                .removalListener((key, value, cause) ->
                        log.info("Key {} was removed from Caffeine cache, cause: {}", key, cause))
                .recordStats()
                .build();
    }

    // region Redis缓存配置

    // Redis key前缀
    private static final String CODE_KEY_PREFIX = "les:user:";
    private static final Long expiration = Integer.valueOf(60 * 60).longValue();
    // endregion

    /**
     * 安全执行Redis操作
     *
     * @param operation     Redis操作
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
     *
     * @param operation     Redis获取操作
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
     * 获取用户信息缓存
     *
     * @param userId 用户ID
     * @return UserInfo
     */
    public static UserInfo getuserInfo(String userId) {
        if (StrUtil.isEmpty(userId)) {
            return null;
        }
        // 尝试从本地获取
        UserInfo UserInfo = userInfoCache.getIfPresent(userId);
        if (ObjectUtil.isEmpty(UserInfo)) {
            // 尝试从Redis获取
            Object cachedData = safeRedisGet(() -> RedisUtils.get(CODE_KEY_PREFIX + userId), "getUserInfo");
            if (cachedData instanceof UserInfo) {
                // 使用类型安全的转换
                if (ObjectUtil.isNotEmpty(cachedData)) {
                    UserInfo = (UserInfo) cachedData;
                    // 同步到本地缓存
                    putUserInfoToLocal(userId, UserInfo);
                }
            } else {
                // 处理获取的数据不是List的情况
                log.warn("从Redis获取的数据不是userInfo类型，key: {}", CODE_KEY_PREFIX + userId);
                //从数据库获取 然后添加到缓存
                UserInfo = SpringUtil.getBean("userInfoServiceImpl", UserInfoService.class)
                        .getUserById(userId);
                putUserInfo(userId, UserInfo);
            }
        }
        log.debug("尝试获取{}用户信息:{}", userId, UserInfo);
        return UserInfo;
    }

    /**
     * 添加码值到本地缓存
     */
    private static void putUserInfoToLocal(String userId, UserInfo UserInfo) {
        if (ObjectUtil.isEmpty(UserInfo)) {
            UserInfo = new UserInfo();
        }
        userInfoCache.put(userId, UserInfo);
    }


    /**
     * 添加或更新用户缓存
     *
     * @param userId   用户ID
     * @param UserInfo 用户详情
     */
    public static void putUserInfo(String userId, UserInfo UserInfo) {
        log.debug("尝试添加/更新{}用户信息:{}", userId, UserInfo);
        // 本地缓存
        putUserInfoToLocal(userId, UserInfo);
        // Redis缓存
        safeRedisOperation(() -> RedisUtils.set(CODE_KEY_PREFIX + userId, UserInfo, expiration), "putUserInfo");
    }

    /**
     * 删除用户缓存
     *
     * @param userId 用户ID
     */
    public static void removeUserInfo(String userId) {
        log.debug("尝试删除{}用户缓存", userId);
        // 本地删除（优先执行，确保本地状态正确）
        userInfoCache.invalidate(userId);
        // Redis删除
        safeRedisOperation(() -> RedisUtils.del(CODE_KEY_PREFIX + userId), "removeUserInfo");

        log.debug("Successfully removed UserInfo cache for id: {}", userId);
    }

    /**
     * 获取指定机构的指定字段的值
     *
     * @param userId 用户ID
     * @param getter 字段获取器，使用Lambda表达式如 UserInfo::getUserNameZh
     * @param <T> 字段值类型
     * @return 字段值，如果机构不存在或字段为null则返回null
     */
    public static <T> T getUserFieldValue(String userId, Function<UserInfo, T> getter) {

        if (StringUtils.isBlank(userId)) {
            return null;
        }

        UserInfo userInfo = getuserInfo(userId);
        if (ObjectUtil.isEmpty(userInfo)) {
            return null;
        }

        try {
            return getter.apply(userInfo);
        } catch (Exception e) {
            log.warn("获取机构字段值失败, userId: {}, error: {}", userId, e.getMessage());
            return null;
        }
    }
}
