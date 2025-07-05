package com.seventeen.svt.frame.cache.util;

import cn.hutool.core.util.ObjectUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.extra.spring.SpringUtil;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
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
 * 过期时间2小时
 * <p>
 * 优化说明（v1.1）：
 * - 移除Redis依赖，使用纯本地缓存
 * - 增加缓存容量，优化缓存配置
 * - 简化缓存逻辑，提高性能
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OrgInfoCacheUtils {

    private static final Cache<String, OrgInfo> orgInfoCache;

    static {
        orgInfoCache = Caffeine.newBuilder()
                .maximumSize(500) // 增加缓存容量
                .expireAfterWrite(2, TimeUnit.HOURS) // 延长过期时间
                .removalListener((key, value, cause) ->
                        log.debug("Key {} was removed from OrgInfo cache, cause: {}", key, cause))
                .recordStats()
                .build();
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
        
        // 从本地缓存获取
        OrgInfo orgInfo = orgInfoCache.getIfPresent(orgId);
        if (ObjectUtil.isEmpty(orgInfo)) {
            // 从数据库获取并缓存
            orgInfo = SpringUtil.getBean("orgInfoServiceImpl", OrgInfoService.class)
                    .selectOrgInfoByOrgId(orgId);
            if (ObjectUtil.isNotEmpty(orgInfo)) {
                putOrgInfoToLocal(orgId, orgInfo);
            }
        }
        return orgInfo;
    }

    /**
     * 添加机构信息到本地缓存
     */
    private static void putOrgInfoToLocal(String orgId, OrgInfo orgInfo) {
        if (ObjectUtil.isNotEmpty(orgInfo)) {
            orgInfoCache.put(orgId, orgInfo);
        }
    }

    /**
     * 添加或更新机构缓存
     *
     * @param orgId   机构ID
     * @param orgInfo 机构详情
     */
    public static void putOrgInfo(String orgId, OrgInfo orgInfo) {
        putOrgInfoToLocal(orgId, orgInfo);
        log.debug("机构信息已缓存: orgId={}", orgId);
    }

    /**
     * 删除机构缓存
     *
     * @param orgId 机构ID
     */
    public static void removeOrgInfo(String orgId) {
        orgInfoCache.invalidate(orgId);
        log.debug("机构缓存已删除: orgId={}", orgId);
    }

    /**
     * 获取指定机构的指定字段的值
     *
     * @param orgId 机构ID
     * @param getter 字段获取器，使用Lambda表达式如 OrgInfo::getOrgNameZh
     * @param <T> 字段值类型
     * @return 字段值，如果机构不存在则返回orgId本身
     */
    public static <T> T getOrgFieldValue(String orgId, Function<OrgInfo, T> getter) {
        if (StringUtils.isBlank(orgId)) {
            return null;
        }

        OrgInfo orgInfo = getOrgInfo(orgId);
        if (ObjectUtil.isEmpty(orgInfo)) {
            // 如果查不到机构，返回orgId本身作为显示值（如000000等系统机构）
            return (T) orgId;
        }

        try {
            return getter.apply(orgInfo);
        } catch (Exception e) {
            log.warn("获取机构字段值失败, orgId: {}, error: {}", orgId, e.getMessage());
            // 异常时也返回orgId本身，保证界面显示
            return (T) orgId;
        }
    }

    /**
     * 获取缓存统计信息
     */
    public static String getCacheStats() {
        return String.format("OrgInfo Cache - Size: %d, Hit Rate: %.2f%%",
                orgInfoCache.estimatedSize(),
                orgInfoCache.stats().hitRate() * 100);
    }
}