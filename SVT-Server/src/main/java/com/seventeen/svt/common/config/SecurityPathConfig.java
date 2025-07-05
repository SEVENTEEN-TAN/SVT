package com.seventeen.svt.common.config;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * 安全路径配置
 * 集中管理需要放行的API路径
 */
@Slf4j
@Component
public class SecurityPathConfig {

    @Value("${server.servlet.context-path:}")
    private String contextPath;

    // 定义静态数组，稍后会由非静态数组填充
    private static String[] PERMIT_ALL_PATHS_STATIC;
    
    // 定义不含上下文路径的数组，用于Spring Security的请求匹配
    private static String[] PERMIT_ALL_PATHS_WITHOUT_CONTEXT;

    /**
     * 初始化静态路径数组
     * 使用@PostConstruct确保在依赖注入完成后执行
     */
    @PostConstruct
    public void init() {
//        log.info("初始化安全路径配置，上下文路径: [{}]", contextPath);
        
        // 定义基础路径数组（不包含上下文路径）
        String[] basePaths = {
            "/auth/login",           // 认证相关接口
            "/doc.html",             // Knife4j接口文档
            "/doc.html/**",          // Knife4j相关资源
            "/swagger-ui.html",      // Swagger UI
            "/swagger-ui/**",        // Swagger UI资源
            "/webjars/**",           // Swagger相关资源
            "/v3/api-docs/**",       // OpenAPI文档
            "/swagger-resources/**", // Swagger资源
            "/druid/**",             // Druid监控
            "/actuator/**",          // Spring Boot Actuator监控
            "/error",                // 错误页面
            "/favicon.ico"           // 网站图标
        };
        
        // 保存不含上下文路径的原始配置
        PERMIT_ALL_PATHS_WITHOUT_CONTEXT = basePaths.clone();
        
        // 使用上下文路径填充静态数组
        PERMIT_ALL_PATHS_STATIC = new String[basePaths.length];
        for (int i = 0; i < basePaths.length; i++) {
            PERMIT_ALL_PATHS_STATIC[i] = contextPath + basePaths[i];
//            log.info("配置放行路径: {}", PERMIT_ALL_PATHS_STATIC[i]);
        }
    }

    /**
     * 获取包含上下文路径的完整放行路径
     * 用于JWT过滤器中匹配完整的请求URI
     */
    public static String[] getPermitAllPaths() {
        return PERMIT_ALL_PATHS_STATIC;
    }
    
    /**
     * 获取不含上下文路径的放行路径
     * 用于Spring Security的authorizeRequests配置
     */
    public static String[] getPermitAllPathsWithoutContext() {
        return PERMIT_ALL_PATHS_WITHOUT_CONTEXT;
    }
} 