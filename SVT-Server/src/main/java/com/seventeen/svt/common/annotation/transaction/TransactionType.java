package com.seventeen.svt.common.annotation.transaction;

/**
 * 事务类型枚举
 */
public enum TransactionType {
    /**
     * 自动根据方法名决定事务类型
     */
    AUTO,
    
    /**
     * 只读事务
     */
    READ_ONLY,
    
    /**
     * 写事务
     */
    REQUIRED,
    
    /**
     * 无事务
     */
    NONE
} 