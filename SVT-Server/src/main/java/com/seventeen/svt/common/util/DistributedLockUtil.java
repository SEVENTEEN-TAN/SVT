package com.seventeen.svt.common.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * 分布式锁工具类
 */
@Slf4j
@Component
public class DistributedLockUtil {

    /**
     * 获取分布式锁
     *
     * @param lockKey   锁的key
     * @param waitTime  等待时间
     * @param leaseTime 持有锁的时间
     * @param timeUnit  时间单位
     * @return 锁的值, 如果获取失败返回null
     */
    public static String tryLock(String lockKey, long waitTime, long leaseTime, TimeUnit timeUnit) {
        String lockValue = UUID.randomUUID().toString();
        long waitMillis = timeUnit.toMillis(waitTime);
        long startTime = System.currentTimeMillis();

        do {
            // 尝试获取锁
            if (RedisUtils.set(lockKey, lockValue, leaseTime)) {
                return lockValue;
            }

            // 等待一段时间后重试
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return null;
            }

            // 检查是否超时
            if (System.currentTimeMillis() - startTime > waitMillis) {
                return null;
            }
        } while (true);
    }

    /**
     * 释放分布式锁
     *
     * @param lockKey   锁的key
     * @param lockValue 锁的值
     */
    public static void unlock(String lockKey, String lockValue) {
        try {
            // 获取当前锁的值
            Object currentValue = RedisUtils.get(lockKey);
            // 如果值匹配,则删除锁
            if (lockValue.equals(currentValue)) {
                RedisUtils.del(lockKey);
            }
        } catch (Exception e) {
            log.error("释放分布式锁失败, lockKey: {}", lockKey, e);
        }
    }

    /**
     * 获取分布式锁的key
     *
     * @param tableName 表名
     * @return 锁的key
     */
    public static String getLockKey(String tableName) {
        return "db_key:lock:" + tableName;
    }
}
