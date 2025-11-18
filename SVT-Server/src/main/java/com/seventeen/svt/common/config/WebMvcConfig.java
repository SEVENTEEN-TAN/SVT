package com.seventeen.svt.common.config;

import com.seventeen.svt.common.interceptor.TraceIdInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.PathMatchConfigurer;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC 配置
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    /**
     * 跨域配置
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders(
                    "X-Encrypted", 
                    "Content-Type",
                    // 🔧 修复：添加JWT智能续期机制响应头
                    "X-Session-Status",
                    "X-Session-Remaining", 
                    "X-Session-Warning",
                    "X-Trace-Id"
                ) // 暴露自定义响应头
                .allowCredentials(true)
                .maxAge(3600);
    }

    /**
     * 静态资源配置
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Swagger UI资源路径
        registry.addResourceHandler("/swagger-ui/**")
                .addResourceLocations("classpath:/META-INF/resources/webjars/springfox-swagger-ui/");
        // Knife4j资源路径
        registry.addResourceHandler("/doc.html")
                .addResourceLocations("classpath:/META-INF/resources/");
        registry.addResourceHandler("/webjars/**")
                .addResourceLocations("classpath:/META-INF/resources/webjars/");
        // Druid监控页面资源路径
        registry.addResourceHandler("/druid/**")
                .addResourceLocations("classpath:/META-INF/resources/druid/");
        registry.addResourceHandler("/druid/css/**")
                .addResourceLocations("classpath:/META-INF/resources/druid/css/");
        registry.addResourceHandler("/druid/js/**")
                .addResourceLocations("classpath:/META-INF/resources/druid/js/");
        registry.addResourceHandler("/druid/img/**")
                .addResourceLocations("classpath:/META-INF/resources/druid/img/");

        // ========================================
        // 前端SPA静态资源配置
        // ========================================
        // 配置前端构建文件的静态资源路径
        // 前端构建文件应放在 src/main/resources/static 目录下
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true);
    }

    /**
     * 配置路径匹配规则
     * 只为我们自己的 @RestController 添加 /api 前缀，排除第三方库
     *
     * <p><b>路径效果：</b></p>
     * <ul>
     *   <li>业务 API: /auth/login → /api/auth/login</li>
     *   <li>业务 API: /system/menu/* → /api/system/menu/*</li>
     *   <li>第三方 API: /v3/api-docs/** → 保持原样（Springdoc）</li>
     *   <li>第三方 API: /druid/** → 保持原样（Druid）</li>
     *   <li>@Controller (SpaForwardController): 路径不受影响</li>
     *   <li>静态资源处理: 不受影响</li>
     * </ul>
     *
     * <p><b>实现前后端路径分离：</b></p>
     * <ul>
     *   <li>业务 API: /api/** (需要JWT认证)</li>
     *   <li>第三方管理页面: /doc.html, /druid/** 等 (白名单放行)</li>
     *   <li>前端路由: /* (由SpaForwardController转发到index.html)</li>
     *   <li>静态资源: /assets/**, /*.js, /*.css 等 (直接返回)</li>
     * </ul>
     */
    @Override
    public void configurePathMatch(PathMatchConfigurer configurer) {
        configurer.addPathPrefix("/api", c -> {
            // 只对我们自己包下的 @RestController 添加前缀
            // 排除 Springdoc (OpenAPI)、Druid 等第三方库的 Controller
            if (c.isAnnotationPresent(RestController.class)) {
                String packageName = c.getPackage().getName();
                // 只匹配我们自己的包：com.seventeen.svt
                // 排除第三方库的包（如 org.springdoc, com.alibaba.druid 等）
                return packageName.startsWith("com.seventeen.svt");
            }
            return false;
        });
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new TraceIdInterceptor())
                .addPathPatterns("/**")
                .excludePathPatterns("/error");
    }
} 