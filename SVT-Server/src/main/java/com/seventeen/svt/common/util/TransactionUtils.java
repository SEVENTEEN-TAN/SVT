package com.seventeen.svt.common.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/**
 * 事务工具类
 */
@Component
public class TransactionUtils {

    private static PlatformTransactionManager transactionManager;

    @Autowired
    public void setTransactionManager(PlatformTransactionManager transactionManager) {
        TransactionUtils.transactionManager = transactionManager;
    }

    /**
     * 判断当前是否存在事务
     * @return 是否存在事务
     */
    public static boolean isTransactionActive() {
        return TransactionSynchronizationManager.isActualTransactionActive();
    }
    
    /**
     * 判断当前事务是否为只读事务
     * @return 是否为只读事务
     */
    public static boolean isCurrentTransactionReadOnly() {
        return TransactionSynchronizationManager.isCurrentTransactionReadOnly();
    }
    
    /**
     * 获取当前事务名称
     * @return 当前事务名称，如果不在事务中则返回null
     */
    public static String getCurrentTransactionName() {
        return TransactionSynchronizationManager.getCurrentTransactionName();
    }
    
    /**
     * 获取当前事务状态
     * @return 当前事务状态对象，如果不在事务中则返回null
     */
    public static TransactionStatus getCurrentTransactionStatus() {
        if (!isTransactionActive() || transactionManager == null) {
            return null;
        }
        return transactionManager.getTransaction(null);
    }
    
    /**
     * 获取事务状态信息
     * @return 事务状态描述
     */
    public static String getTransactionStatus() {
        if (!isTransactionActive()) {
            return "无事务";
        }
        
        StringBuilder status = new StringBuilder();
        status.append("事务活动中 | ");
        
        if (isCurrentTransactionReadOnly()) {
            status.append("只读事务 | ");
        } else {
            status.append("读写事务 | ");
        }
        
        String name = getCurrentTransactionName();
        if (name != null) {
            status.append("事务名称: ").append(name);
        } else {
            status.append("未命名事务");
        }
        
        return status.toString();
    }
} 