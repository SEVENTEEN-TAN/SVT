package com.seventeen.svt.frame.aspect;

import com.seventeen.svt.common.annotation.transaction.AutoTransaction;
import com.seventeen.svt.common.annotation.transaction.TransactionType;
import com.seventeen.svt.common.config.transaction.TransactionPrefixConfig;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.TransactionTemplate;

import java.lang.reflect.Method;

/**
 * 自动事务切面
 * 处理@AutoTransaction注解
 */
@Aspect
@Component
@Slf4j
@Order(100) // 确保优先级高于默认事务切面
public class AutoTransactionAspect {

    @Autowired
    private PlatformTransactionManager transactionManager;
    
    @Autowired
    private TransactionPrefixConfig prefixConfig;

    /**
     * 定义切点：所有带有@AutoTransaction注解的方法
     */
    @Pointcut("@annotation(com.seventeen.svt.common.annotation.transaction.AutoTransaction)")
    public void autoTransactionMethod() {}

    /**
     * 环绕通知，处理自动事务
     */
    @Around("autoTransactionMethod()")
    public Object aroundAutoTransaction(ProceedingJoinPoint joinPoint) throws Throwable {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        
        // 获取自动事务注解
        AutoTransaction autoTransaction = method.getAnnotation(AutoTransaction.class);
        if (autoTransaction == null) {
            return joinPoint.proceed();
        }
        
        // 确定事务类型
        TransactionType type = determineTransactionType(method, autoTransaction);
        
        // 创建事务模板
        TransactionTemplate transactionTemplate = createTransactionTemplate(autoTransaction, type);
        
        // 执行事务
        return executeInTransaction(joinPoint, transactionTemplate, type);
    }

    /**
     * 确定事务类型
     */
    private TransactionType determineTransactionType(Method method, AutoTransaction autoTransaction) {
        TransactionType type = autoTransaction.type();
        
        // 如果是自动类型，根据方法名确定
        if (type == TransactionType.AUTO) {
            String methodName = method.getName();
            
            // 检查方法名前缀
            for (String prefix : prefixConfig.getReadonly()) {
                if (methodName.startsWith(prefix)) {
                    return TransactionType.READ_ONLY;
                }
            }
            
            for (String prefix : prefixConfig.getRequired()) {
                if (methodName.startsWith(prefix)) {
                    return TransactionType.REQUIRED;
                }
            }
            
            for (String prefix : prefixConfig.getNone()) {
                if (methodName.startsWith(prefix)) {
                    return TransactionType.NONE;
                }
            }
            
            // 默认为只读
            return TransactionType.READ_ONLY;
        }
        
        return type;
    }

    /**
     * 创建事务模板
     */
    private TransactionTemplate createTransactionTemplate(AutoTransaction autoTransaction, TransactionType type) {
        TransactionTemplate transactionTemplate = new TransactionTemplate(transactionManager);
        
        // 设置事务属性
        transactionTemplate.setPropagationBehavior(autoTransaction.propagation().value());
        transactionTemplate.setIsolationLevel(autoTransaction.isolation().value());
        
        if (autoTransaction.timeout() > 0) {
            transactionTemplate.setTimeout(autoTransaction.timeout());
        }
        
        // 根据事务类型设置只读属性
        if (type == TransactionType.READ_ONLY) {
            transactionTemplate.setReadOnly(true);
        } else if (type == TransactionType.REQUIRED) {
            transactionTemplate.setReadOnly(false);
        } else if (type == TransactionType.NONE) {
            transactionTemplate.setPropagationBehavior(org.springframework.transaction.TransactionDefinition.PROPAGATION_NEVER);
        } else {
            transactionTemplate.setReadOnly(autoTransaction.readOnly());
        }
        
        return transactionTemplate;
    }

    /**
     * 在事务中执行方法
     */
    private Object executeInTransaction(ProceedingJoinPoint joinPoint, TransactionTemplate transactionTemplate, TransactionType type) {
        if (type == TransactionType.NONE) {
            try {
                return joinPoint.proceed();
            } catch (Throwable e) {
                if (e instanceof RuntimeException) {
                    throw (RuntimeException) e;
                } else {
                    throw new RuntimeException(e);
                }
            }
        }
        
        return transactionTemplate.execute(new TransactionCallback<Object>() {
            @Override
            public Object doInTransaction(TransactionStatus status) {
                try {
                    return joinPoint.proceed();
                } catch (Throwable e) {
                    if (e instanceof RuntimeException) {
                        throw (RuntimeException) e;
                    } else {
                        throw new RuntimeException(e);
                    }
                }
            }
        });
    }
} 