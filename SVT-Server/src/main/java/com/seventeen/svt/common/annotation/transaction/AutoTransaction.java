package com.seventeen.svt.common.annotation.transaction;

import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;

import java.lang.annotation.*;

/**
 * 自动事务注解
 * 用于显式定义方法的事务行为，覆盖默认的命名约定
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Inherited
@Documented
public @interface AutoTransaction {

    /**
     * 事务类型
     */
    TransactionType type() default TransactionType.AUTO;
    
    /**
     * 事务传播行为
     */
    Propagation propagation() default Propagation.REQUIRED;
    
    /**
     * 事务隔离级别
     */
    Isolation isolation() default Isolation.DEFAULT;
    
    /**
     * 超时时间（秒）
     */
    int timeout() default -1;
    
    /**
     * 是否只读
     */
    boolean readOnly() default false;
    
    /**
     * 事务管理器名称
     */
    String transactionManager() default "";
    
    /**
     * 需要回滚的异常类
     */
    Class<? extends Throwable>[] rollbackFor() default {};
    
    /**
     * 不需要回滚的异常类
     */
    Class<? extends Throwable>[] noRollbackFor() default {};
} 