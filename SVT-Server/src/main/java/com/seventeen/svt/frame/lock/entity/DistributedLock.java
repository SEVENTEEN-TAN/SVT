package com.seventeen.svt.frame.lock.entity;

import com.mybatisflex.annotation.Column;
import com.mybatisflex.annotation.Table;
import com.seventeen.svt.frame.listener.FlexInsertListener;
import com.seventeen.svt.frame.listener.FlexUpdateListener;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

/**
 * 分布式锁实体类
 * 
 * @author seventeen
 * @since 2024-01-04
 */
@Table(value = "distributed_lock", comment = "分布式锁表",
        onInsert = FlexInsertListener.class, onUpdate = FlexUpdateListener.class)
@Data
public class DistributedLock implements Serializable {

    @Column(value = "lock_key", comment = "锁键")
    private String lockKey;
    
    @Column(value = "lock_value", comment = "锁值")
    private String lockValue;
    
    @Column(value = "holder_info", comment = "持有者信息")
    private String holderInfo;
    
    @Column(value = "created_time", comment = "创建时间")
    private Date createdTime;
    
    @Column(value = "expire_time", comment = "过期时间")
    private Date expireTime;
    
    @Column(value = "retry_count", comment = "重试次数")
    private Integer retryCount;

    @Serial
    @Column(ignore = true)
    private static final long serialVersionUID = 1L;
    
    /**
     * 检查是否过期
     */
    public boolean isExpired() {
        return expireTime != null && expireTime.before(new Date());
    }
    
    /**
     * 检查是否达到最大重试次数
     */
    public boolean isMaxRetryReached(int maxRetryCount) {
        return retryCount != null && retryCount >= maxRetryCount;
    }
}
