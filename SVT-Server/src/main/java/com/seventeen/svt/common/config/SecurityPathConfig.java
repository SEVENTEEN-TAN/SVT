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
            // ========== 业务API白名单（有 /api 前缀）==========
            "/api/auth/login",           // 认证登录接口（业务API）

            // ========== 第三方管理平台（无 /api 前缀）==========
            "/doc.html",                 // Knife4j 接口文档
            "/doc.html/**",              // Knife4j 相关资源
            "/swagger-ui.html",          // Swagger UI 主页
            "/swagger-ui/**",            // Swagger UI 资源
            "/webjars/**",               // WebJars 资源（Swagger、Knife4j 依赖）
            "/v3/api-docs/**",           // OpenAPI 文档接口（Springdoc 提供）
            "/swagger-resources/**",     // Swagger 资源配置
            "/druid/**",                 // Druid 数据源监控
            "/actuator/**",              // Spring Boot Actuator 监控

            // ========== 系统路径 ==========
            "/error",                    // 错误页面
            "/favicon.ico",              // 网站图标

            // ========== 前端SPA静态资源和路由（无 /api 前缀）==========
            "/",                         // 根路径
            "/index.html",               // 主页面
            "/assets/**",                // 静态资源目录（JS、CSS、图片等）
            "/*.js",                     // 根目录下的JS文件
            "/*.css",                    // 根目录下的CSS文件
            "/*.png",                    // 图片文件
            "/*.jpg",                    // 图片文件
            "/*.svg",                    // SVG图标
            "/*.ico"                     // ICO图标
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