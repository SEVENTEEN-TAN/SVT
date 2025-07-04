package com.seventeen.svt.frame.lock;

import com.seventeen.svt.frame.lock.config.DistributedLockConfig;
import com.seventeen.svt.frame.lock.entity.DistributedLock;
import com.seventeen.svt.frame.lock.mapper.DistributedLockMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * 基于数据库的分布式锁管理器
 * 
 * @author seventeen
 * @since 2024-01-04
 */
@Slf4j
@Component
public class DatabaseDistributedLockManager {

    @Autowired
    private DistributedLockMapper lockMapper;

    @Autowired
    private DistributedLockConfig lockConfig;

    /**
     * 尝试获取分布式锁(使用默认配置)
     *
     * @param lockKey 锁键
     * @return 锁值，获取失败返回null
     */
    public String tryLock(String lockKey) {
        return tryLock(lockKey, lockConfig.getWaitTimeout(), lockConfig.getLeaseTime(), TimeUnit.SECONDS);
    }

    /**
     * 尝试获取分布式锁
     *
     * @param lockKey   锁键
     * @param waitTime  等待时间
     * @param leaseTime 持有时间
     * @param timeUnit  时间单位
     * @return 锁值，获取失败返回null
     */
    public String tryLock(String lockKey, long waitTime, long leaseTime, TimeUnit timeUnit) {
        String lockValue = UUID.randomUUID().toString();
        long waitMillis = timeUnit.toMillis(waitTime);
        long leaseMillis = timeUnit.toMillis(leaseTime);
        long startTime = System.currentTimeMillis();
        int retryCount = 0;

        log.debug("尝试获取分布式锁: {}, 等待时间: {}ms, 持有时间: {}ms",
                lockKey, waitMillis, leaseMillis);

        do {
            try {
                // 1. 先清理过期锁
                cleanupExpiredLocks();

                // 2. 尝试获取锁
                if (attemptLock(lockKey, lockValue, leaseMillis)) {
                    log.debug("成功获取分布式锁: {}, 锁值: {}, 重试次数: {}",
                            lockKey, lockValue, retryCount);
                    return lockValue;
                }

                // 3. 增加重试次数
                retryCount++;
                lockMapper.incrementRetryCount(lockKey);

                // 4. 检查是否达到最大重试次数
                if (retryCount >= lockConfig.getMaxRetryCount() && lockConfig.isEnableForceRelease()) {
                    log.warn("达到最大重试次数，强制释放锁: {}, 重试次数: {}", lockKey, retryCount);
                    forceReleaseLock(lockKey);
                    // 强制释放后再次尝试
                    if (attemptLock(lockKey, lockValue, leaseMillis)) {
                        log.warn("强制释放后成功获取锁: {}, 锁值: {}", lockKey, lockValue);
                        return lockValue;
                    }
                }

                // 5. 等待后重试
                Thread.sleep(lockConfig.getRetryInterval());

            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.warn("获取分布式锁被中断: {}", lockKey);
                return null;
            } catch (Exception e) {
                log.error("获取分布式锁异常: {}", lockKey, e);
                return null;
            }

            // 6. 检查是否超时
        } while (System.currentTimeMillis() - startTime < waitMillis);

        log.warn("获取分布式锁超时: {}, 等待时间: {}ms, 重试次数: {}",
                lockKey, waitMillis, retryCount);
        return null;
    }

    /**
     * 尝试插入锁记录
     */
    private boolean attemptLock(String lockKey, String lockValue, long leaseMillis) {
        try {
            DistributedLock lock = new DistributedLock();
            lock.setLockKey(lockKey);
            lock.setLockValue(lockValue);
            lock.setHolderInfo(lockConfig.getHolderInfo());
            lock.setCreatedTime(new Date());
            lock.setExpireTime(new Date(System.currentTimeMillis() + leaseMillis));
            lock.setRetryCount(0);

            int result = lockMapper.insertLock(lock);
            return result > 0;

        } catch (DuplicateKeyException e) {
            // 锁已被占用，这是正常情况
            log.debug("锁已被占用: {}", lockKey);
            return false;
        } catch (Exception e) {
            log.error("插入锁记录失败: {}", lockKey, e);
            return false;
        }
    }

    /**
     * 释放分布式锁
     */
    public boolean unlock(String lockKey, String lockValue) {
        try {
            int result = lockMapper.deleteByKeyAndValue(lockKey, lockValue);
            boolean success = result > 0;

            if (success) {
                log.debug("成功释放分布式锁: {}, 锁值: {}", lockKey, lockValue);
            } else {
                log.warn("释放分布式锁失败，锁可能已过期或被其他线程释放: {}, 锁值: {}", lockKey, lockValue);
            }

            return success;
        } catch (Exception e) {
            log.error("释放分布式锁异常: {}, 锁值: {}", lockKey, lockValue, e);
            return false;
        }
    }

    /**
     * 强制释放锁(达到最大重试次数时)
     */
    private void forceReleaseLock(String lockKey) {
        try {
            DistributedLock existingLock = lockMapper.selectByLockKey(lockKey);
            if (existingLock != null && existingLock.isMaxRetryReached(lockConfig.getMaxRetryCount())) {
                lockMapper.deleteByKeyAndValue(lockKey, existingLock.getLockValue());
                log.warn("强制释放达到最大重试次数的锁: {}, 重试次数: {}",
                        lockKey, existingLock.getRetryCount());
            }
        } catch (Exception e) {
            log.error("强制释放锁失败: {}", lockKey, e);
        }
    }

    /**
     * 清理过期锁
     */
    public void cleanupExpiredLocks() {
        try {
            int deletedCount = lockMapper.deleteExpiredLocks(new Date());
            if (deletedCount > 0) {
                log.debug("清理了 {} 个过期锁", deletedCount);
            }
        } catch (Exception e) {
            log.error("清理过期锁失败", e);
        }
    }

    /**
     * 定时清理任务
     */
    @Scheduled(fixedRateString = "#{${svt.distributed-lock.cleanup-interval:60} * 1000}")
    public void scheduledCleanup() {
        cleanupExpiredLocks();

        // 清理达到最大重试次数的锁
        if (lockConfig.isEnableForceRelease()) {
            try {
                int forcedCount = lockMapper.forceReleaseMaxRetryLocks(lockConfig.getMaxRetryCount());
                if (forcedCount > 0) {
                    log.warn("强制清理了 {} 个达到最大重试次数的锁", forcedCount);
                }
            } catch (Exception e) {
                log.error("强制清理锁失败", e);
            }
        }
    }

    /**
     * 获取锁键(用于分布式ID生成)
     */
    public static String getLockKey(String cacheKey) {
        return "dbkey:" + cacheKey;
    }

    /**
     * 获取锁统计信息
     */
    public String getLockStats() {
        try {
            int totalLocks = lockMapper.countLocks();
            int expiredLocks = lockMapper.countExpiredLocks(new Date());
            return String.format("总锁数: %d, 过期锁数: %d", totalLocks, expiredLocks);
        } catch (Exception e) {
            log.error("获取锁统计信息失败", e);
            return "统计信息获取失败";
        }
    }
}