package com.seventeen.svt.frame.lock.mapper;

import com.mybatisflex.core.BaseMapper;
import com.seventeen.svt.frame.lock.entity.DistributedLock;
import org.apache.ibatis.annotations.*;

import java.util.Date;

/**
 * 分布式锁Mapper
 * 
 * @author seventeen
 * @since 2024-01-04
 */
@Mapper
public interface DistributedLockMapper extends BaseMapper<DistributedLock> {
    
    /**
     * 尝试插入锁记录
     */
    @Insert("INSERT INTO distributed_lock (lock_key, lock_value, holder_info, created_time, expire_time, retry_count) " +
            "VALUES (#{lockKey}, #{lockValue}, #{holderInfo}, #{createdTime}, #{expireTime}, #{retryCount})")
    int insertLock(DistributedLock lock);
    
    /**
     * 根据锁键和锁值删除锁
     */
    @Delete("DELETE FROM distributed_lock WHERE lock_key = #{lockKey} AND lock_value = #{lockValue}")
    int deleteByKeyAndValue(@Param("lockKey") String lockKey, @Param("lockValue") String lockValue);
    
    /**
     * 删除过期的锁
     */
    @Delete("DELETE FROM distributed_lock WHERE expire_time < #{currentTime}")
    int deleteExpiredLocks(@Param("currentTime") Date currentTime);
    
    /**
     * 强制释放达到最大重试次数的锁
     */
    @Delete("DELETE FROM distributed_lock WHERE retry_count >= #{maxRetryCount}")
    int forceReleaseMaxRetryLocks(@Param("maxRetryCount") int maxRetryCount);
    
    /**
     * 增加重试次数
     */
    @Update("UPDATE distributed_lock SET retry_count = retry_count + 1 WHERE lock_key = #{lockKey}")
    int incrementRetryCount(@Param("lockKey") String lockKey);
    
    /**
     * 查询锁信息
     */
    @Select("SELECT * FROM distributed_lock WHERE lock_key = #{lockKey}")
    DistributedLock selectByLockKey(@Param("lockKey") String lockKey);
    
    /**
     * 查询所有锁信息(用于监控)
     */
    @Select("SELECT * FROM distributed_lock ORDER BY created_time DESC")
    java.util.List<DistributedLock> selectAllLocks();
    
    /**
     * 统计锁数量
     */
    @Select("SELECT COUNT(*) FROM distributed_lock")
    int countLocks();
    
    /**
     * 统计过期锁数量
     */
    @Select("SELECT COUNT(*) FROM distributed_lock WHERE expire_time < #{currentTime}")
    int countExpiredLocks(@Param("currentTime") Date currentTime);
}
