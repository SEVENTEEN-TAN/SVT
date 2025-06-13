package com.seventeen.svt.frame.cache.util;


import cn.hutool.core.util.ObjectUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.extra.spring.SpringUtil;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.seventeen.svt.common.util.RedisUtils;
import com.seventeen.svt.common.util.RequestContextUtils;
import com.seventeen.svt.frame.cache.entity.JwtCache;
import com.seventeen.svt.frame.security.utils.JwtUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

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
@RequiredArgsConstructor
public class JwtCacheUtils {

    // region Caffeine缓存配置
    private static final Cache<String, JwtCache> userLocalCache;

    static {
        userLocalCache = Caffeine.newBuilder()
                .maximumSize(80)
                .expireAfterWrite(5, TimeUnit.MINUTES)
                .removalListener((key, value, cause) ->
                        log.info("Key {} was removed from Caffeine cache, cause: {}", key, cause))
                .recordStats()
                .build();
    }
    // endregion

    // region Redis缓存配置

    //JWT前缀
    private static final String JWT_KEY_PREFIX = "les:jwt:";
    //黑名单
    private static final String JWT_BLACKLIST_KEY = JWT_KEY_PREFIX + "blacklist:";

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
     * 初始化initJwt
     *
     * @param token  用户Token
     * @param userId 用户ID
     * @return JwtCache
     */
    public static JwtCache initJwt(String token, String userId) {
        JwtUtils jwtUtils = SpringUtil.getBean("jwtUtils", JwtUtils.class);
        long refreshTime = Long.parseLong(SpringUtil.getProperty("jwt.refresh"));
        return JwtCache.builder()
                .token(token)
                .userId(userId)
                .loginIp(RequestContextUtils.getIpAddress())
                .createdTime(jwtUtils.getIssuedAtDateFromToken(token))
                .expirationTime(jwtUtils.getExpirationDateFromToken(token))
                .refreshTime(System.currentTimeMillis() + refreshTime * 1000)
                .build();
    }


    /**
     * 获取Jwt缓存信息(获取缓存)
     */
    public static JwtCache getJwt(String userId) {
        //尝试从本地获取
        JwtCache jwtCache = userLocalCache.getIfPresent(userId);
        if (ObjectUtil.isEmpty(jwtCache)) {
            //尝试从云端获取
            jwtCache = safeRedisGet(() -> (JwtCache) RedisUtils.get(JWT_KEY_PREFIX + userId), "getJwt");
            if (ObjectUtil.isNotEmpty(jwtCache)) {
                putJwtToLocal(userId, jwtCache); // 本地同步
            }
        }
        return jwtCache;
    }

    /**
     * 添加JWT到本地缓存
     */
    private static void putJwtToLocal(String userId, JwtCache jwtCache) {
        userLocalCache.put(userId, jwtCache);
    }

    /**
     * 添加或更新用户缓存(登录)
     */
    public static void putJwt(String userId, JwtCache jwtCache) {
        long expiration = Long.parseLong(SpringUtil.getProperty("jwt.expiration"));
        //在本地存放
        putJwtToLocal(userId, jwtCache);
        //云端同步
        safeRedisOperation(() -> RedisUtils.set(JWT_KEY_PREFIX + userId, jwtCache, expiration), "putJwt");
    }

    /**
     * 删除用户缓存(登出)
     * 优化：即使Redis操作失败，也要确保本地缓存被清理
     */
    public static void removeJwt(String userId) {
        //Token添加到黑名单
        JwtCache jwt = getJwt(userId);
        if (ObjectUtil.isNotEmpty(jwt)) {
            safeRedisOperation(() -> invalidJwt(jwt.getToken()), "invalidJwt");
        }
        //本地删除（优先执行，确保本地状态正确）
        userLocalCache.invalidate(userId);
        //云端删除
        safeRedisOperation(() -> RedisUtils.del(JWT_KEY_PREFIX + userId), "removeJwt");
        
        log.debug("Successfully removed JWT cache for user: {}", userId);
    }

    /**
     * 将指定用户的Token失效(登出后操作)
     *
     * @param token 加入黑名单的Token
     */
    public static void invalidJwt(String token) {
        long expiration = Long.parseLong(SpringUtil.getProperty("jwt.expiration"));
        //添加到黑名单
        safeRedisOperation(() -> RedisUtils.set(JWT_BLACKLIST_KEY + token, "1", expiration), "invalidJwt");
    }

    /**
     * 判断是否在黑名单
     *
     * @param token 用户Token
     * @return 是否黑名单
     */
    public static boolean isBlackToken(String token) {
        Boolean result = safeRedisGet(() -> RedisUtils.hasKey(JWT_BLACKLIST_KEY + token), "isBlackToken");
        return result != null && result;
    }

    /**
     * 判断是否IP一致
     *
     * @param userId 用户ID
     * @return 是否一致
     */
    public static boolean checkIpChange(String userId) {
        //获取当前的IP
        String ipAddress = RequestContextUtils.getIpAddress();
        JwtCache jwt = getJwt(userId);
        if (ObjectUtil.isNotEmpty(jwt)) {
            return !ipAddress.equals(jwt.getLoginIp());
        }
        return true;
    }

    /**
     * 判断Token是否一致
     *
     * @param userId 用户ID
     * @return 是否一致
     */
    public static boolean checkTokenChange(String userId, String token) {
        //获取当前的IP
        JwtCache jwt = getJwt(userId);
        if (ObjectUtil.isNotEmpty(jwt) && StrUtil.isNotEmpty(token)) {
            return !token.equals(jwt.getToken());
        }
        return true;
    }

    /**
     * 判断是否超时
     *
     * @param userId 用户ID
     * @return 是否活跃
     */
    public static boolean checkActive(String userId) {
        JwtCache jwt = getJwt(userId);
        if (ObjectUtil.isNotEmpty(jwt)) {
            Long refreshTime = jwt.getRefreshTime();
            return System.currentTimeMillis() > refreshTime;
        }
        return true;
    }

    /**
     * 给Token续期更新 : 此处需要根据配置项中的阈值来判断是否同步云端,否则只同步在本地
     *
     * @param userId 用户ID
     */
    public static void renewJwt(String userId) {
        long refreshTime = Long.parseLong(SpringUtil.getProperty("jwt.refresh"));

        JwtCache jwt = getJwt(userId);
        if (ObjectUtil.isNotEmpty(jwt)) {
            jwt.setRefreshTime(System.currentTimeMillis() + refreshTime * 1000);
            updateJwt(userId, jwt);
        }
    }

    /**
     * 更新Jwt : 此处需要根据配置项中的阈值来判断是否同步云端,否则只同步在本地
     *
     * @param userId
     * @param jwtCache
     */
    public static void updateJwt(String userId, JwtCache jwtCache) {
        double threshold = Double.parseDouble(SpringUtil.getProperty("jwt.threshold"));
        long refreshTime = Long.parseLong(SpringUtil.getProperty("jwt.refresh"));
        JwtCache jwt = getJwt(userId);
        threshold = threshold > 1.0 ? 1.0 : Math.max(threshold, 0.0);
        if (ObjectUtil.isNotEmpty(jwt)) {
            //在本地存放
            putJwtToLocal(userId, jwtCache);
            if ((jwt.getRefreshTime() - System.currentTimeMillis()) <= refreshTime * 1000 * (1 - threshold)) {
                //云端同步
                safeRedisOperation(() -> {
                    long remainingExpiration = RedisUtils.getExpire(JWT_KEY_PREFIX + userId);
                    RedisUtils.set(JWT_KEY_PREFIX + userId, jwtCache, remainingExpiration);
                }, "updateJwt");
            }
        }
    }

} 