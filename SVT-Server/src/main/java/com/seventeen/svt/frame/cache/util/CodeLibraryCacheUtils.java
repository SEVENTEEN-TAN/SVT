package com.seventeen.svt.frame.cache.util;

import cn.hutool.core.util.ObjectUtil;
import cn.hutool.extra.spring.SpringUtil;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.seventeen.svt.modules.system.entity.CodeLibrary;
import com.seventeen.svt.modules.system.service.CodeLibraryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * 码值缓存工具类
 * 采用本地缓存: Caffeine
 * 过期时间7天
 * <p>
 * 优化说明（v1.1）：
 * - 移除Redis依赖，使用纯本地缓存
 * - 增加缓存容量，优化缓存配置
 * - 简化缓存逻辑，提高性能
 * - 缓存操作失败不会影响主业务流程
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CodeLibraryCacheUtils {

    private static final Cache<String, List<CodeLibrary>> codeLibraryCache;

    static {
        codeLibraryCache = Caffeine.newBuilder()
                .maximumSize(200) // 增加缓存容量
                .expireAfterWrite(7, TimeUnit.DAYS) // 保持7天过期时间
                .removalListener((key, value, cause) ->
                        log.debug("Key {} was removed from CodeLibrary cache, cause: {}", key, cause))
                .recordStats()
                .build();
    }

    /**
     * 获取码值缓存
     *
     * @param codeType 码值编号
     * @return CodeLibrary列表
     */
    public static List<CodeLibrary> getCodeLibrary(String codeType) {
        if (ObjectUtil.isEmpty(codeType)) {
            return null;
        }
        
        // 从本地缓存获取
        List<CodeLibrary> codeLibraries = codeLibraryCache.getIfPresent(codeType);
        if (ObjectUtil.isEmpty(codeLibraries)) {
            // 从数据库获取并缓存
            codeLibraries = SpringUtil.getBean("codeLibraryServiceImpl", CodeLibraryService.class)
                    .selectCodeLibraryByCodeType(codeType);
            if (ObjectUtil.isNotEmpty(codeLibraries)) {
                putCodeLibraryToLocal(codeType, codeLibraries);
            }
        }
        return codeLibraries;
    }

    /**
     * 添加码值到本地缓存
     */
    private static void putCodeLibraryToLocal(String codeType, List<CodeLibrary> codeLibrary) {
        if (ObjectUtil.isNotEmpty(codeLibrary)) {
            codeLibraryCache.put(codeType, codeLibrary);
        }
    }

    /**
     * 获取码值名称
     *
     * @param codeType  码值编号
     * @param codeValue 码值项
     * @return String 码值名称，如果找不到则返回codeValue本身
     */
    public static String getCodeName(String codeType, String codeValue) {
        // 添加null检查，防止NullPointerException
        if (codeValue == null || codeType == null) {
            return codeValue;
        }

        List<CodeLibrary> codeLibrary = getCodeLibrary(codeType);
        if (ObjectUtil.isNotEmpty(codeLibrary)) {
            return codeLibrary.stream()
                    .filter(item -> codeValue.equals(item.getCodeValue()))
                    .findFirst()
                    .map(CodeLibrary::getCodeName)
                    .orElse(codeValue); // 如果找不到对应码值，返回原值
        }
        // 如果整个码值类型都找不到，返回原值
        return codeValue;
    }

    /**
     * 添加或更新码值缓存
     *
     * @param codeType    码值类型
     * @param codeLibrary 码值详情
     */
    public static void putCodeLibrary(String codeType, List<CodeLibrary> codeLibrary) {
        putCodeLibraryToLocal(codeType, codeLibrary);
        log.debug("码值信息已缓存: codeType={}, count={}", codeType, 
                codeLibrary != null ? codeLibrary.size() : 0);
    }

    /**
     * 删除码值缓存
     *
     * @param codeType 码值类型
     */
    public static void removeCodeLibrary(String codeType) {
        codeLibraryCache.invalidate(codeType);
        log.debug("码值缓存已删除: codeType={}", codeType);
    }

    /**
     * 获取缓存统计信息
     */
    public static String getCacheStats() {
        return String.format("CodeLibrary Cache - Size: %d, Hit Rate: %.2f%%",
                codeLibraryCache.estimatedSize(),
                codeLibraryCache.stats().hitRate() * 100);
    }
}