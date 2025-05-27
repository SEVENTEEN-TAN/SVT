package com.seventeen.svt.common.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Component;

import java.text.MessageFormat;
import java.util.Locale;
import java.util.MissingResourceException;
import java.util.ResourceBundle;

/**
 * 消息工具类
 * 用于获取配置文件中的消息
 */
@Slf4j
@Component
public class MessageUtils {

    private static MessageSource messageSource;
    private static final String MESSAGE_FILE = "config.messages";
    private static ResourceBundle resourceBundle;

    static {
        try {
            resourceBundle = ResourceBundle.getBundle(MESSAGE_FILE);
        } catch (MissingResourceException e) {
            log.error("无法加载消息资源文件: " + MESSAGE_FILE, e);
        }
    }

    /**
     * 设置MessageSource，由Spring在启动时注入
     * @param source MessageSource实例
     */
    public MessageUtils(MessageSource source) {
        messageSource = source;
    }

    /**
     * 使用Spring的MessageSource获取消息
     * @param code 消息代码
     * @param args 参数
     * @return 格式化后的消息
     */
    public static String getMessage(String code, Object... args) {
        if (messageSource != null) {
            try {
                return messageSource.getMessage(code, args, LocaleContextHolder.getLocale());
            } catch (Exception e) {
                log.warn("无法从MessageSource获取消息: " + code, e);
                // 如果MessageSource获取失败，尝试使用ResourceBundle
            }
        }
        
        return getMessageFromBundle(code, args);
    }

    /**
     * 使用ResourceBundle获取消息
     * @param code 消息代码
     * @param args 参数
     * @return 格式化后的消息
     */
    private static String getMessageFromBundle(String code, Object... args) {
        if (resourceBundle == null) {
            try {
                resourceBundle = ResourceBundle.getBundle(MESSAGE_FILE);
            } catch (MissingResourceException e) {
                log.error("无法加载消息资源文件: " + MESSAGE_FILE, e);
                return code; // 如果无法加载资源文件，返回消息代码
            }
        }
        
        try {
            String message = resourceBundle.getString(code);
            if (args != null && args.length > 0) {
                return MessageFormat.format(message, args);
            }
            return message;
        } catch (MissingResourceException e) {
            log.warn("未找到消息代码: " + code);
            return code; // 如果未找到消息，返回消息代码
        } catch (Exception e) {
            log.error("格式化消息时出错: " + code, e);
            return code; // 如果格式化错误，返回消息代码
        }
    }

    /**
     * 使用ResourceBundle获取消息，指定Locale
     * @param code 消息代码
     * @param locale 区域设置
     * @param args 参数
     * @return 格式化后的消息
     */
    public static String getMessage(String code, Locale locale, Object... args) {
        if (messageSource != null) {
            try {
                return messageSource.getMessage(code, args, locale);
            } catch (Exception e) {
                log.warn("无法从MessageSource获取消息: " + code, e);
                // 如果MessageSource获取失败，尝试使用ResourceBundle
            }
        }
        
        try {
            ResourceBundle bundle = ResourceBundle.getBundle(MESSAGE_FILE, locale);
            String message = bundle.getString(code);
            if (args != null && args.length > 0) {
                return MessageFormat.format(message, args);
            }
            return message;
        } catch (MissingResourceException e) {
            log.warn("未找到消息代码: " + code);
            return code; // 如果未找到消息，返回消息代码
        } catch (Exception e) {
            log.error("格式化消息时出错: " + code, e);
            return code; // 如果格式化错误，返回消息代码
        }
    }
} 