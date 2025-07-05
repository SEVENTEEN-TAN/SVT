package com.seventeen.svt.common.filter;

import com.seventeen.svt.common.util.RequestWrapper;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * 请求包装过滤器
 * 仅对API请求进行包装，用于记录API请求参数
 */
@Component
@Order(50)
public class RequestWrapperFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        if (request instanceof HttpServletRequest) {
            HttpServletRequest httpRequest = (HttpServletRequest) request;
            String requestURI = httpRequest.getRequestURI();
            
            // 判断是否是API请求
            if (isApiRequest(requestURI)) {
                // 包装API请求
                RequestWrapper requestWrapper = new RequestWrapper((HttpServletRequest) request);
                chain.doFilter(requestWrapper, response);
            } else {
                // 非API请求，直接放行
                chain.doFilter(request, response);
            }
        } else {
            chain.doFilter(request, response);
        }
    }
    
    /**
     * 判断是否是API请求
     * @param uri 请求URI
     * @return 是否是API请求
     */
    private boolean isApiRequest(String uri) {
        // 排除Druid相关请求
        if (uri.contains("/druid/")) {
            return false;
        }
        
        // 排除静态资源
        if (uri.matches(".+\\.(js|css|html|jpg|jpeg|png|gif|ico|svg|woff|ttf|eot)$")) {
            return false;
        }
        
        // 排除Swagger相关请求
        if (uri.contains("/swagger") || uri.contains("/v2/api-docs") || uri.contains("/doc.html")) {
            return false;
        }
        
        // 其他请求视为API请求
        return true;
    }
} 