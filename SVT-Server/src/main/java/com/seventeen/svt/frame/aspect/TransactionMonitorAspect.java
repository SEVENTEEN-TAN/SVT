package com.seventeen.svt.frame.aspect;

import com.seventeen.svt.common.config.transaction.TransactionMonitorConfig;
import com.seventeen.svt.common.util.TransactionUtils;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.TransactionStatus;

import java.lang.reflect.Method;

/**
 * 事务监控切面
 * 用于监控事务执行状态和性能
 */
@Aspect
@Component
@Slf4j
@Order(200) // 确保优先级低于自动事务切面
public class TransactionMonitorAspect {

    @Autowired
    private TransactionMonitorConfig monitorConfig;

    /**
     * 定义切点：所有带有@AutoTransaction注解的方法
     */
    @Pointcut("@annotation(com.seventeen.svt.common.annotation.transaction.AutoTransaction)")
    public void autoTransactionMethod() {}

    /**
     * 环绕通知，监控事务执行
     */
    @Around("autoTransactionMethod()")
    public Object aroundTransaction(ProceedingJoinPoint joinPoint) throws Throwable {
        // 如果未启用监控，直接执行
        if (!monitorConfig.isEnabled()) {
            return joinPoint.proceed();
        }

        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        String methodName = method.getName();
        String className = method.getDeclaringClass().getSimpleName();
        
        // 获取当前事务状态
        TransactionStatus status = TransactionUtils.getCurrentTransactionStatus();
        boolean isNewTransaction = status != null && status.isNewTransaction();
        
        // 记录开始时间
        long startTime = System.currentTimeMillis();
        
        try {
            // 记录事务开始
            log.info("事务开始 - 类: {}, 方法: {}, 是否新事务: {}", 
                    className, methodName, isNewTransaction);
            
            // 执行目标方法
            Object result = joinPoint.proceed();
            
            // 计算执行时间
            long executionTime = System.currentTimeMillis() - startTime;
            
            // 记录事务完成
            log.info("事务完成 - 类: {}, 方法: {}, 执行时间: {}ms", 
                    className, methodName, executionTime);
            
            return result;
            
        } catch (Throwable e) {
            // 计算执行时间
            long executionTime = System.currentTimeMillis() - startTime;
            
            // 记录事务异常
            log.error("事务异常 - 类: {}, 方法: {}, 执行时间: {}ms, 异常: {}", 
                    className, methodName, executionTime, e.getMessage());
            
            throw e;
        }
    }
} 