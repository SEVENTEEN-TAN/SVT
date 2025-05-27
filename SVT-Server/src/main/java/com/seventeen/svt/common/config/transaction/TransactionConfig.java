package com.seventeen.svt.common.config.transaction;

import org.springframework.aop.Advisor;
import org.springframework.aop.aspectj.AspectJExpressionPointcut;
import org.springframework.aop.support.DefaultPointcutAdvisor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.transaction.interceptor.NameMatchTransactionAttributeSource;
import org.springframework.transaction.interceptor.RollbackRuleAttribute;
import org.springframework.transaction.interceptor.RuleBasedTransactionAttribute;
import org.springframework.transaction.interceptor.TransactionInterceptor;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/**
 * 全局事务管理配置
 * 根据方法名前缀自动应用适当的事务属性
 */
@Configuration
@EnableTransactionManagement
public class TransactionConfig {

    private static final String AOP_POINTCUT_EXPRESSION = "execution(* com.seventeen.svt.modules.*.service..*.*(..))";
    
    @Autowired
    private TransactionPrefixConfig prefixConfig;

    /**
     * 事务拦截器
     */
    @Bean
    public TransactionInterceptor txAdvice(TransactionManager transactionManager) {
        // 只读事务，不做更新操作
        RuleBasedTransactionAttribute readOnlyTx = new RuleBasedTransactionAttribute();
        readOnlyTx.setReadOnly(true);
        readOnlyTx.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRED);

        // 当前存在事务就使用当前事务，当前不存在事务就创建一个新的事务
        RuleBasedTransactionAttribute requiredTx = new RuleBasedTransactionAttribute();
        requiredTx.setRollbackRules(Collections.singletonList(new RollbackRuleAttribute(Exception.class)));
        requiredTx.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRED);
        
        // 事务管理规则，声明具备事务管理的方法名
        Map<String, org.springframework.transaction.interceptor.TransactionAttribute> txMap = new HashMap<>(16);
        
        // 从配置中获取只读事务方法前缀
        for (String prefix : prefixConfig.getReadonly()) {
            txMap.put(prefix + "*", readOnlyTx);
        }
        
        // 从配置中获取读写事务方法前缀
        for (String prefix : prefixConfig.getRequired()) {
            txMap.put(prefix + "*", requiredTx);
        }
        
        NameMatchTransactionAttributeSource source = new NameMatchTransactionAttributeSource();
        source.setNameMap(txMap);
        
        return new TransactionInterceptor(transactionManager, source);
    }

    /**
     * 切面拦截规则 决定了拦截哪些方法
     */
    @Bean
    public Advisor txAdviceAdvisor(TransactionInterceptor txAdvice) {
        AspectJExpressionPointcut pointcut = new AspectJExpressionPointcut();
        pointcut.setExpression(AOP_POINTCUT_EXPRESSION);
        return new DefaultPointcutAdvisor(pointcut, txAdvice);
    }
} 