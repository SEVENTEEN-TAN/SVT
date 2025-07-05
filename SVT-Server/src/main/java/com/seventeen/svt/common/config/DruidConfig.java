package com.seventeen.svt.common.config;

import com.alibaba.druid.spring.boot3.autoconfigure.DruidDataSourceAutoConfigure;
import com.alibaba.druid.support.jakarta.StatViewServlet;
import com.alibaba.druid.support.jakarta.WebStatFilter;
import com.alibaba.druid.support.spring.stat.BeanTypeAutoProxyCreator;
import com.alibaba.druid.support.spring.stat.DruidStatInterceptor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.aop.Advisor;
import org.springframework.aop.support.DefaultPointcutAdvisor;
import org.springframework.aop.support.JdkRegexpMethodPointcut;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.AutoConfigureAfter;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Druid监控配置类
 * 整合了Web监控和Spring监控功能
 */
@Slf4j
@Configuration
@ConditionalOnWebApplication
@AutoConfigureAfter(DruidDataSourceAutoConfigure.class)
public class DruidConfig {

    @Value("${server.servlet.context-path:/}")
    private String contextPath;

    /**
     * 配置Druid监控页面
     */
    @Bean
    public ServletRegistrationBean<StatViewServlet> statViewServlet() {
        log.info("初始化Druid监控页面");
        
        ServletRegistrationBean<StatViewServlet> bean = new ServletRegistrationBean<>();
        bean.setServlet(new StatViewServlet());
        bean.addUrlMappings("/druid/*");
        
        // 设置控制台管理用户
        bean.addInitParameter("loginUsername", "druid");
        bean.addInitParameter("loginPassword", "druid");
        // 是否能够重置数据
        bean.addInitParameter("resetEnable", "false");
        // 设置IP白名单，空表示允许所有
        bean.addInitParameter("allow", "");
        
        log.info("Druid监控页面配置完成，访问路径: {}/druid/", contextPath);
        return bean;
    }

    /**
     * 配置Druid监控过滤器
     */
    @Bean
    public FilterRegistrationBean<WebStatFilter> webStatFilter() {
        log.info("初始化Druid监控过滤器");
        
        FilterRegistrationBean<WebStatFilter> bean = new FilterRegistrationBean<>();
        bean.setFilter(new WebStatFilter());
        
        // 添加过滤规则
        bean.addUrlPatterns("/*");
        // 忽略过滤的格式
        bean.addInitParameter("exclusions", "*.js,*.gif,*.jpg,*.png,*.css,*.ico,/druid/*");
        // 开启session统计
        bean.addInitParameter("sessionStatEnable", "true");
        // 设置最大Session数
        bean.addInitParameter("sessionStatMaxCount", "1000");
        // 是否监控单个URL调用信息
        bean.addInitParameter("profileEnable", "true");
        
        log.info("Druid监控过滤器配置完成");
        return bean;
    }

    /**
     * 配置Druid监控Spring Bean
     */
    @Bean
    public DruidStatInterceptor druidStatInterceptor() {
        return new DruidStatInterceptor();
    }

    /**
     * 配置切入点
     */
    @Bean
    public JdkRegexpMethodPointcut druidStatPointcut() {
        JdkRegexpMethodPointcut pointcut = new JdkRegexpMethodPointcut();
        // 监控所有的Service和Mapper
        pointcut.setPatterns("com.seventeen.svt.modules.*.service.*", "com.seventeen.svt.modules.*.mapper.*");
        return pointcut;
    }

    /**
     * 配置Spring监控切面
     */
    @Bean
    public Advisor druidStatAdvisor() {
        return new DefaultPointcutAdvisor(druidStatPointcut(), druidStatInterceptor());
    }

    /**
     * 配置监控Controller类型
     */
    @Bean
    public BeanTypeAutoProxyCreator druidControllerProxyCreator() {
        BeanTypeAutoProxyCreator creator = new BeanTypeAutoProxyCreator();
        creator.setInterceptorNames("druidStatInterceptor");
        creator.setTargetBeanType(org.springframework.stereotype.Controller.class);
        return creator;
    }

    /**
     * 配置监控Repository类型
     */
    @Bean
    public BeanTypeAutoProxyCreator druidRepositoryProxyCreator() {
        BeanTypeAutoProxyCreator creator = new BeanTypeAutoProxyCreator();
        creator.setInterceptorNames("druidStatInterceptor");
        creator.setTargetBeanType(org.springframework.stereotype.Repository.class);
        return creator;
    }
} 