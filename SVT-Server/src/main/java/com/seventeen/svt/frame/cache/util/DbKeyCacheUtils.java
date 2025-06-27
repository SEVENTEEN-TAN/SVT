package com.seventeen.svt.frame.cache.util;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.seventeen.svt.modules.system.entity.DbKey;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * DBKey本地缓存工具类
 * - 初始容量100
 * - 最大容量1000
 * - 过期时间1天
 */
@Slf4j
@Component
public class DbKeyCacheUtils {

    /**
     * 配置缓存
     */
    private static final Cache<String, DbKey> configCache;

    /**
     * ID缓存
     */
    private static final Cache<String, List<String>> idCache;

    static {
        // 配置缓存
        configCache = Caffeine.newBuilder()
                .initialCapacity(100)
                .maximumSize(1000)
                .expireAfterWrite(1, TimeUnit.DAYS)
                .recordStats()
                .build();

        // ID缓存
        idCache = Caffeine.newBuilder()
                .initialCapacity(100)
                .expireAfterWrite(1, TimeUnit.DAYS)
                .recordStats()
                .build();
    }

    /**
     * 获取配置缓存
     */
    public static DbKey get(String tableName) {
        return configCache.getIfPresent(tableName);
    }

    /**
     * 设置配置缓存
     */
    public static void put(String tableName, DbKey dbKey) {
        configCache.put(tableName, dbKey);
    }

    /**
     * 删除配置缓存
     */
    public static void remove(String tableName) {
        configCache.invalidate(tableName);
    }

    /**
     * 获取ID缓存
     */
    public static List<String> getIds(String tableName) {
        return idCache.getIfPresent(tableName);
    }

    /**
     * 设置ID缓存
     */
    public static void putIds(String tableName, List<String> ids) {
        idCache.put(tableName, ids);
    }

    /**
     * 删除ID缓存
     */
    public static void removeIds(String tableName) {
        idCache.invalidate(tableName);
    }

    /**
     * 清空所有缓存
     */
    public static void clear() {
        configCache.invalidateAll();
        idCache.invalidateAll();
    }

    /**
     * 获取配置缓存统计信息
     */
    public static String configCacheStats() {
        return configCache.stats().toString();
    }

    /**
     * 获取ID缓存统计信息
     */
    public static String idCacheStats() {
        return idCache.stats().toString();
    }
}