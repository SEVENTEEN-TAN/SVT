package com.seventeen.svt.common.config;

import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.support.ReloadableResourceBundleMessageSource;
import org.springframework.context.support.ResourceBundleMessageSource;

/**
 * 消息配置类
 */
@Configuration
public class MessageConfig {

    /**
     * 配置消息源
     * @return MessageSource
     */
    @Bean
    public MessageSource messageSource() {
        ResourceBundleMessageSource messageSource = new ResourceBundleMessageSource();
        messageSource.setBasename("config/messages");
        messageSource.setDefaultEncoding("UTF-8");
        return messageSource;
    }

    /**
     * 配置可重新加载的消息源
     * @return MessageSource
     */
    @Bean
    @Primary
    public MessageSource reloadableMessageSource() {
        ReloadableResourceBundleMessageSource messageSource = new ReloadableResourceBundleMessageSource();
        messageSource.setBasename("classpath:config/messages");
        messageSource.setCacheSeconds(60); // 缓存时间，开发环境可以设短一些，便于测试
        messageSource.setDefaultEncoding("UTF-8");
        return messageSource;
    }
} 