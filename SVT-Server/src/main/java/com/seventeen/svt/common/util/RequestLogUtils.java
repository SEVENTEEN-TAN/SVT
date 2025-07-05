package com.seventeen.svt.common.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

/**
 * 请求日志工具类
 */
@Slf4j
public class RequestLogUtils {
    private static final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 记录请求日志
     */
    public static void logRequest() {
        try {
            HttpServletRequest request = getRequest();
            if (request == null) {
                return;
            }
            logRequest(request);
        } catch (Exception e) {
            log.error("记录请求日志失败", e);
        }
    }

    /**
     * 记录请求日志
     */
    public static void logRequest(HttpServletRequest request) {
        try {
            // 记录请求基本信息
            StringBuilder logBuilder = new StringBuilder("\n");
            logBuilder.append("-------------------- Request Begin --------------------\n");
            logBuilder.append(String.format("Request URL    : %s %s\n", request.getMethod(), request.getRequestURL()));
            logBuilder.append(String.format("Request URI    : %s\n", request.getRequestURI()));
            
            // 记录查询参数
            String queryString = request.getQueryString();
            if (queryString != null) {
                logBuilder.append(String.format("Query String   : %s\n", queryString));
            }

            // 记录请求头
            Map<String, String> headers = new HashMap<>();
            Enumeration<String> headerNames = request.getHeaderNames();
            while (headerNames.hasMoreElements()) {
                String headerName = headerNames.nextElement();
                String headerValue = request.getHeader(headerName);
                headers.put(headerName, headerValue);
            }
            logBuilder.append(String.format("Request Headers: %s\n", headers));

            // 记录请求参数
            Map<String, String[]> parameters = request.getParameterMap();
            if (!parameters.isEmpty()) {
                logBuilder.append(String.format("Request Params : %s\n", parameters));
            }

            // 记录请求体
            if (request instanceof RequestWrapper) {
                RequestWrapper wrapper = (RequestWrapper) request;
                String body = wrapper.getBody();
                if (body != null && !body.isEmpty()) {
                    // 先进行脱敏处理
                    String desensitizedBody = SensitiveUtil.desensitizeJsonString(body);
                    
                    logBuilder.append("Request Body   : ");
                    // 尝试格式化JSON
                    try {
                        Object json = objectMapper.readValue(desensitizedBody, Object.class);
                        logBuilder.append(objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(json));
                    } catch (Exception e) {
                        // 如果不是JSON格式,直接输出脱敏后的内容
                        logBuilder.append(desensitizedBody);
                    }
                    logBuilder.append("\n");
                }
                // 记录请求体大小
                logBuilder.append(String.format("Content Length : %d bytes\n", wrapper.getContentLength()));
            }

            // 记录客户端信息
            logBuilder.append(String.format("Client IP      : %s\n", RequestContextUtils.getIpAddress()));
            logBuilder.append(String.format("User Agent     : %s\n", request.getHeader("User-Agent")));
            logBuilder.append("-------------------- Request End   --------------------");

            // 输出日志
            log.info(logBuilder.toString());
        } catch (Exception e) {
            log.error("记录请求日志失败", e);
        }
    }

    /**
     * 获取当前请求
     */
    public static HttpServletRequest getRequest() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        return attributes != null ? attributes.getRequest() : null;
    }
} 