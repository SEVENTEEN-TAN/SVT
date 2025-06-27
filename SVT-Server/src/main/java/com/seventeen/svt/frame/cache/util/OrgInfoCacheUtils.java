package com.seventeen.svt.frame.cache.util;

import cn.hutool.core.util.ObjectUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.extra.spring.SpringUtil;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.seventeen.svt.common.util.RedisUtils;
import com.seventeen.svt.modules.system.entity.OrgInfo;
import com.seventeen.svt.modules.system.service.OrgInfoService;
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
public class OrgInfoCacheUtils {

    private static final Cache<String, OrgInfo> orgInfoCache;

    static {
        orgInfoCache = Caffeine.newBuilder()
                .maximumSize(100) // 设置最大容量为100条
                .expireAfterWrite(1, TimeUnit.HOURS)
                .removalListener((key, value, cause) ->
                        log.info("Key {} was removed from Caffeine cache, cause: {}", key, cause))
                .recordStats()
                .build();
    }

    // region Redis缓存配置

    // Redis key前缀
    private static final String CODE_KEY_PREFIX = "les:org:";
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
     * 获取机构信息缓存
     *
     * @param orgId 机构ID
     * @return OrgInfo
     */
    public static OrgInfo getOrgInfo(String orgId) {
        if (StrUtil.isEmpty(orgId)) {
            return null;
        }
        // 尝试从本地获取
        OrgInfo orgInfo = orgInfoCache.getIfPresent(orgId);
        if (ObjectUtil.isEmpty(orgInfo)) {
            // 尝试从Redis获取
            Object cachedData = safeRedisGet(() -> RedisUtils.get(CODE_KEY_PREFIX + orgId), "getOrgInfo");
            if (cachedData instanceof OrgInfo) {
                // 使用类型安全的转换
                if (ObjectUtil.isNotEmpty(cachedData)) {
                    orgInfo = (OrgInfo) cachedData;
                    // 同步到本地缓存
                    putOrgInfoToLocal(orgId, orgInfo);
                }
            } else {
                // 处理获取的数据不是List的情况
                log.warn("从Redis获取的数据不是OrgInfo类型，key: {}", CODE_KEY_PREFIX + orgId);
                //从数据库获取 然后添加到缓存
                orgInfo = SpringUtil.getBean("orgInfoServiceImpl", OrgInfoService.class)
                        .selectOrgInfoByOrgId(orgId);
                // 同步到本地缓存
                putOrgInfo(orgId, orgInfo);
            }
        }
        log.debug("尝试获取{}机构信息:{}", orgId, orgInfo);
        return orgInfo;
    }

    /**
     * 添加码值到本地缓存
     */
    private static void putOrgInfoToLocal(String orgId, OrgInfo orgInfo) {
        if (ObjectUtil.isEmpty(orgInfo)) {
            orgInfo = new OrgInfo();
        }
        orgInfoCache.put(orgId, orgInfo);
    }


    /**
     * 添加或更新机构缓存
     *
     * @param orgId   机构ID
     * @param orgInfo 机构详情
     */
    public static void putOrgInfo(String orgId, OrgInfo orgInfo) {
        log.debug("尝试添加/更新{}机构信息:{}", orgId, orgInfo);
        // 本地缓存
        putOrgInfoToLocal(orgId, orgInfo);
        // Redis缓存
        safeRedisOperation(() -> RedisUtils.set(CODE_KEY_PREFIX + orgId, orgInfo, expiration), "putOrgInfo");
    }

    /**
     * 删除机构缓存
     *
     * @param orgId 机构ID
     */
    public static void removeOrgInfo(String orgId) {
        log.debug("尝试删除{}机构缓存", orgId);
        // 本地删除（优先执行，确保本地状态正确）
        orgInfoCache.invalidate(orgId);
        // Redis删除
        safeRedisOperation(() -> RedisUtils.del(CODE_KEY_PREFIX + orgId), "removeOrgInfo");

        log.debug("Successfully removed OrgInfo cache for id: {}", orgId);
    }


    /**
     * 获取指定机构的指定字段的值
     *
     * @param orgId 机构ID
     * @param getter 字段获取器，使用Lambda表达式如 OrgInfo::getOrgNameZh
     * @param <T> 字段值类型
     * @return 字段值，如果机构不存在或字段为null则返回null
     */
    public static <T> T getOrgFieldValue(String orgId, Function<OrgInfo, T> getter) {

        if (StringUtils.isBlank(orgId)) {
            return null;
        }

        OrgInfo orgInfo = getOrgInfo(orgId);
        if (ObjectUtil.isEmpty(orgInfo)) {
            return null;
        }

        try {
            return getter.apply(orgInfo);
        } catch (Exception e) {
            log.warn("获取机构字段值失败, orgId: {}, error: {}", orgId, e.getMessage());
            return null;
        }
    }



}
