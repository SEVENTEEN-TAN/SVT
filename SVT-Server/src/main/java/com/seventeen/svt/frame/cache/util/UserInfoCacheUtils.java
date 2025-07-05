package com.seventeen.svt.frame.cache.util;

import cn.hutool.core.util.ObjectUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.extra.spring.SpringUtil;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.seventeen.svt.modules.system.entity.UserInfo;
import com.seventeen.svt.modules.system.service.UserInfoService;
import io.micrometer.common.util.StringUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;
import java.util.function.Function;

/**
 * 用户信息缓存工具类
 * 采用本地缓存: Caffeine
 * 过期时间1小时
 * <p>
 * 优化说明（v1.1）：
 * - 移除Redis依赖，使用纯本地缓存
 * - 增加缓存容量，优化缓存配置
 * - 简化缓存逻辑，提高性能
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class UserInfoCacheUtils {

    private static final Cache<String, UserInfo> userInfoCache;

    static {
        userInfoCache = Caffeine.newBuilder()
                .maximumSize(500) // 增加缓存容量
                .expireAfterWrite(2, TimeUnit.HOURS) // 延长过期时间
                .removalListener((key, value, cause) ->
                        log.debug("Key {} was removed from UserInfo cache, cause: {}", key, cause))
                .recordStats()
                .build();
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
        
        // 特殊处理系统用户，避免无效数据库查询
        if ("System".equals(userId)) {
            log.debug("系统用户无需查询数据库: userId={}", userId);
            return null;
        }
        
        // 从本地缓存获取
        UserInfo userInfo = userInfoCache.getIfPresent(userId);
        if (ObjectUtil.isEmpty(userInfo)) {
            // 从数据库获取并缓存
            userInfo = SpringUtil.getBean("userInfoServiceImpl", UserInfoService.class)
                    .getUserById(userId);
            if (ObjectUtil.isNotEmpty(userInfo)) {
                putUserInfoToLocal(userId, userInfo);
            }
        }
        return userInfo;
    }

    /**
     * 添加用户信息到本地缓存
     */
    private static void putUserInfoToLocal(String userId, UserInfo userInfo) {
        if (ObjectUtil.isNotEmpty(userInfo)) {
            userInfoCache.put(userId, userInfo);
        }
    }

    /**
     * 添加或更新用户缓存
     *
     * @param userId   用户ID
     * @param userInfo 用户详情
     */
    public static void putUserInfo(String userId, UserInfo userInfo) {
        putUserInfoToLocal(userId, userInfo);
        log.debug("用户信息已缓存: userId={}", userId);
    }

    /**
     * 删除用户缓存
     *
     * @param userId 用户ID
     */
    public static void removeUserInfo(String userId) {
        userInfoCache.invalidate(userId);
        log.debug("用户缓存已删除: userId={}", userId);
    }

    /**
     * 获取指定用户的指定字段的值
     *
     * @param userId 用户ID
     * @param getter 字段获取器，使用Lambda表达式如 UserInfo::getUserName
     * @param <T> 字段值类型
     * @return 字段值，如果用户不存在则返回userId本身
     */
    public static <T> T getUserFieldValue(String userId, Function<UserInfo, T> getter) {
        if (StringUtils.isBlank(userId)) {
            return null;
        }

        UserInfo userInfo = getuserInfo(userId);
        if (ObjectUtil.isEmpty(userInfo)) {
            // 如果查不到用户，返回userId本身作为显示值（如System等系统用户）
            return (T) userId;
        }

        try {
            return getter.apply(userInfo);
        } catch (Exception e) {
            log.warn("获取用户字段值失败, userId: {}, error: {}", userId, e.getMessage());
            // 异常时也返回userId本身，保证界面显示
            return (T) userId;
        }
    }

    /**
     * 获取缓存统计信息
     */
    public static String getCacheStats() {
        return String.format("UserInfo Cache - Size: %d, Hit Rate: %.2f%%",
                userInfoCache.estimatedSize(),
                userInfoCache.stats().hitRate() * 100);
    }
}
