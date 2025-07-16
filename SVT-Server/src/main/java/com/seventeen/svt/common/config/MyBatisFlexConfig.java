package com.seventeen.svt.common.config;

import com.mybatisflex.core.config.ConfigurationCustomizer;
import com.seventeen.svt.frame.handler.BigDecimalTypeHandler;
import com.seventeen.svt.frame.handler.LocalDateTimeTypeHandler;
import com.seventeen.svt.frame.handler.NumberTypeHandler;
import com.seventeen.svt.frame.handler.StringToDateTimeTypeHandler;
import org.apache.ibatis.type.TypeHandlerRegistry;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * MyBatis-Flex 配置类
 * 用于注册全局类型处理器
 */
@Configuration
public class MyBatisFlexConfig {

    /**
     * 配置全局类型处理器
     */
    @Bean
    public ConfigurationCustomizer configurationCustomizer() {
        return configuration -> {
            TypeHandlerRegistry typeHandlerRegistry = configuration.getTypeHandlerRegistry();
            
            // 注册自定义类型处理器
            typeHandlerRegistry.register(BigDecimal.class, BigDecimalTypeHandler.class);
            typeHandlerRegistry.register(LocalDateTime.class, LocalDateTimeTypeHandler.class);
            typeHandlerRegistry.register(Number.class, NumberTypeHandler.class);
            typeHandlerRegistry.register(String.class, StringToDateTimeTypeHandler.class);
        };
    }
}