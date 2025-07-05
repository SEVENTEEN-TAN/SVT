package com.seventeen.svt.frame.swagger;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;

/**
 * Swagger 配置
 */
@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                // 基本信息配置
                .info(new Info()
                        .title("SVT管理系统 API文档")
                        .description("API文档包含接口说明及认证方式")
                        .version("1.0")
                        .contact(new Contact()
                                .name("技术团队")
                                .email("example@example.com")))
                // 安全配置 - 使用全局参数模式
                .components(new Components()
                        .addSecuritySchemes("Bearer", new SecurityScheme()
                                .type(SecurityScheme.Type.APIKEY)
                                .in(SecurityScheme.In.HEADER)
                                .name("Authorization")
                                .description("请输入JWT Token，格式: Bearer {token}")
                        ))
                // 全局安全要求 - 强制所有接口需要认证
                .addSecurityItem(new SecurityRequirement().addList("Bearer"))
                // 添加全局服务器配置
                .servers(Arrays.asList(
                        new Server().url("/").description("本地环境"),
                        new Server().url("https://test-api.example.com").description("测试环境")
                ));
    }

    /**
     * 所有API接口分组
     */
    @Bean
    public GroupedOpenApi allApi() {
        return GroupedOpenApi.builder()
                .group("所有接口")
                .packagesToScan("com.seventeen.svt")
                .addOpenApiCustomizer(openApi -> {
                    // 强制要求这些接口必须有Authorization头
                    SecurityRequirement securityRequirement = new SecurityRequirement().addList("Bearer");
                    openApi.getPaths().forEach((path, pathItem) -> {
                        pathItem.readOperations().forEach(operation -> {
                            operation.addSecurityItem(securityRequirement);
                        });
                    });
                })
                .build();
    }

    /**
     * 公开接口分组 - 无需认证
     * 包含登录等不需要Authorization头的接口
     */
    @Bean
    public GroupedOpenApi publicApi() {
        return GroupedOpenApi.builder()
                .group("🔓 公开接口")
                .pathsToMatch("/public/**")
                .build();
    }

    /**
     * 认证管理接口 - 需要认证
     * 包含用户登出、获取用户信息等需要Authorization头的接口
     */
    @Bean
    public GroupedOpenApi authManagementApi() {
        return GroupedOpenApi.builder()
                .group("🔒 认证管理")
                .pathsToMatch("/auth/**")
                .addOpenApiCustomizer(openApi -> {
                    // 强制要求这些接口必须有Authorization头
                    SecurityRequirement securityRequirement = new SecurityRequirement().addList("Bearer");
                    openApi.getPaths().forEach((path, pathItem) -> {
                        pathItem.readOperations().forEach(operation -> {
                            operation.addSecurityItem(securityRequirement);
                        });
                    });
                })
                .build();
    }

    /**
     * 测试接口分组 - 需要认证
     * 包含系统测试和Swagger测试等开发调试接口
     */
    @Bean
    public GroupedOpenApi testApi() {
        return GroupedOpenApi.builder()
                .group("🧪 测试接口")
                .pathsToMatch("/test/**", "/swagger-test/**")
                .addOpenApiCustomizer(openApi -> {
                    // 强制要求这些接口必须有Authorization头
                    SecurityRequirement securityRequirement = new SecurityRequirement().addList("Bearer");
                    openApi.getPaths().forEach((path, pathItem) -> {
                        pathItem.readOperations().forEach(operation -> {
                            operation.addSecurityItem(securityRequirement);
                        });
                    });
                })
                .build();
    }
}