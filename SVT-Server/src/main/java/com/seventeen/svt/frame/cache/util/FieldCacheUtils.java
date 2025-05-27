package com.seventeen.svt.frame.cache.util;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.stats.CacheStats;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.lang.reflect.Field;
import java.util.concurrent.TimeUnit;

/**
 * 字段缓存工具类
 * - 初始容量100
 * - 最大容量1000
 * - 过期时间1天
 */
@Slf4j
@Component
public class FieldCacheUtils {

    private static final Cache<Class<?>, Field[]> fieldCache;

    static {
        fieldCache = Caffeine.newBuilder()
                .initialCapacity(100)                // 初始容量
                .maximumSize(1000)                   // 最大容量
                .expireAfterWrite(1, TimeUnit.DAYS) // 写入后过期时间
                .recordStats()                       // 开启统计
                .removalListener((key, value, cause) ->
                        log.debug("Key {} was removed from field cache, cause: {}", key, cause))
                .build();
    }

    /**
     * 获取类的所有字段(带缓存)
     */
    public static Field[] getFields(Class<?> clazz) {
        return fieldCache.get(clazz, Class::getDeclaredFields);
    }

    /**
     * 清除指定类的字段缓存
     */
    public static void invalidate(Class<?> clazz) {
        fieldCache.invalidate(clazz);
        log.debug("Invalidated field cache for class: {}", clazz.getName());
    }

    /**
     * 清除所有字段缓存
     */
    public static void invalidateAll() {
        fieldCache.invalidateAll();
        log.debug("Invalidated all field cache");
    }

    /**
     * 获取缓存统计信息
     */
    public static CacheStats getStats() {
        return fieldCache.stats();
    }

    /**
     * 获取缓存大小
     */
    public static long getSize() {
        return fieldCache.estimatedSize();
    }
}
