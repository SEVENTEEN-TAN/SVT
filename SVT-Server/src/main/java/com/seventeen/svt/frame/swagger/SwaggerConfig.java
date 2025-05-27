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
                        .title("风险管理系统 API文档")
                        .description("API文档包含接口说明及认证方式")
                        .version("1.0")
                        .contact(new Contact()
                                .name("技术团队")
                                .email("tech@example.com")))
                // 安全配置
                .components(new Components()
                        .addSecuritySchemes("Bearer", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .in(SecurityScheme.In.HEADER)
                                .name("Authorization")
                                .description("请输入JWT Token，格式: Bearer {token}")
                        ))
                // 默认的全局安全要求
                .addSecurityItem(new SecurityRequirement().addList("Bearer"))
                // 添加全局服务器配置
                .servers(Arrays.asList(
                        new Server().url("/").description("本地环境"),
                        new Server().url("https://test-api.example.com").description("测试环境")
                ));
    }

//    // 用于标记不需要认证的接口
//    @Bean
//    public GroupedOpenApi publicApi() {
//        return GroupedOpenApi.builder()
//                .group("public-api")
//                .pathsToMatch("/api/auth/**", "/api/public/**") // 这里添加不需要认证的路径
//                .build();
//    }
//
//    // 需要认证的接口
//    @Bean
//    public GroupedOpenApi privateApi() {
//        return GroupedOpenApi.builder()
//                .group("private-api")
//                .pathsToMatch("/api/**")
//                .addOpenApiCustomizer(openApi -> openApi.addSecurityItem(  // 注意这里改成了Customizer
//                        new SecurityRequirement().addList("Bearer")))
//                .build();
//    }
}