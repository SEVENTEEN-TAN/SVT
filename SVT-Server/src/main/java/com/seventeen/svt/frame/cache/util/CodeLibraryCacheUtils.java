package com.seventeen.svt.frame.cache.util;

import cn.hutool.core.util.ObjectUtil;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.seventeen.svt.common.util.RedisUtils;
import com.seventeen.svt.modules.system.entity.CodeLibrary;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * 码值缓存工具类
 * 采用二级缓存: Caffeine + Redis
 * 过期时间与JWT保持一致
 * 
 * 优化说明：
 * - 添加了Redis异常处理机制
 * - 实现了优雅降级策略
 * - 修复了方法命名错误
 * - 缓存操作失败不会影响主业务流程
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CodeLibraryCacheUtils {

    // region Caffeine缓存配置
    private static final Cache<String, List<CodeLibrary>> codeLibraryCache;

    static {
        codeLibraryCache = Caffeine.newBuilder()
                .maximumSize(100) // 设置最大容量为100条
                .expireAfterWrite(7, TimeUnit.DAYS)
                .removalListener((key, value, cause) ->
                        log.info("Key {} was removed from Caffeine cache, cause: {}", key, cause))
                .recordStats()
                .build();
    }
    // endregion

    // region Redis缓存配置

    // Redis key前缀
    private static final String CODE_KEY_PREFIX = "les:code:";
    private static final Long expiration = Integer.valueOf(60 * 60 * 24 * 7).longValue();
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
     * 获取码值缓存
     * @param codeType 码值编号
     * @return CodeLibrary
     */
    public static List<CodeLibrary> getCodeLibrary(String codeType) {
        // 尝试从本地获取
        List<CodeLibrary> codeLibrarys = codeLibraryCache.getIfPresent(codeType);
        if (ObjectUtil.isEmpty(codeLibrarys)) {
            // 尝试从Redis获取
            Object cachedData = safeRedisGet(() -> RedisUtils.get(CODE_KEY_PREFIX + codeType), "getCodeLibrary");
            if (cachedData instanceof List<?>) {
                // 使用类型安全的转换
                @SuppressWarnings("unchecked") // Suppress the unchecked warning
                List<CodeLibrary> tempList = (List<CodeLibrary>) cachedData;
                codeLibrarys = tempList;
                if (ObjectUtil.isNotEmpty(codeLibrarys)) {
                    // 同步到本地缓存
                    putCodeLibraryToLocal(codeType, codeLibrarys);
                }
            } else if (cachedData != null) {
                // 处理获取的数据不是List的情况
                log.warn("从Redis获取的数据不是List类型，key: {}", CODE_KEY_PREFIX + codeType);
            }
        }
        log.debug("尝试获取{}码值信息:{}",codeType,codeLibrarys);
        return codeLibrarys;
    }

    /**
     * 添加码值到本地缓存
     */
    private static void putCodeLibraryToLocal(String codeType, List<CodeLibrary> codeLibrary) {
        codeLibraryCache.put(codeType, codeLibrary);
    }

    /**
     * 获取码值缓存
     * @param codeType 码值编号
     * @param codeValue 码值项
     * @return String 码值名称
     */
    public static String getCodeName(String codeType,String codeValue) {
        List<CodeLibrary>  codeLibrary = getCodeLibrary(codeType);
        if (ObjectUtil.isNotEmpty(codeLibrary)) {
            return codeLibrary.stream()
                    .filter(item -> codeValue.equals(item.getCodeValue()))
                    .findFirst()
                    .map(CodeLibrary::getCodeName)
                    .orElse(null);
        }
        return null;
    }

    /**
     * 添加或更新码值缓存
     * @param codeType 码值ID
     * @param codeLibrary 码值详情
     */
    public static void putCodeLibrary(String codeType, List<CodeLibrary> codeLibrary) {
        log.debug("尝试添加/更新{}码值信息:{}",codeType,codeLibrary);
        // 本地缓存
        putCodeLibraryToLocal(codeType, codeLibrary);
        // Redis缓存
        safeRedisOperation(() -> RedisUtils.set(CODE_KEY_PREFIX + codeType, codeLibrary, expiration), "putCodeLibrary");
    }

    /**
     * 删除码值缓存
     * 优化：即使Redis操作失败，也要确保本地缓存被清理
     * @param codeType 码值ID
     */
    public static void removeCodeLibrary(String codeType) {
        log.debug("尝试删除{}码值缓存",codeType);
        // 本地删除（优先执行，确保本地状态正确）
        codeLibraryCache.invalidate(codeType);
        // Redis删除
        safeRedisOperation(() -> RedisUtils.del(CODE_KEY_PREFIX + codeType), "removeCodeLibrary");
        
        log.debug("Successfully removed code library cache for type: {}", codeType);
    }

}