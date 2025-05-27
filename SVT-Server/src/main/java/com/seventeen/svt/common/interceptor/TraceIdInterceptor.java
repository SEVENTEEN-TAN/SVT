package com.seventeen.svt.common.interceptor;

import com.seventeen.svt.common.util.RequestLogUtils;
import com.seventeen.svt.common.util.RequestWrapper;
import com.seventeen.svt.common.util.TraceIdUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * TraceId拦截器
 */
public class TraceIdInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 包装请求,支持多次读取请求体
        RequestWrapper requestWrapper = new RequestWrapper(request);
        
        // 生成traceId
        String traceId = TraceIdUtils.generateTraceId();
        // 设置traceId
        TraceIdUtils.setTraceId(traceId);
        // 设置响应头
        response.setHeader("X-Trace-Id", traceId);
        
        // 记录请求信息
        RequestLogUtils.logRequest(requestWrapper);
        
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        // 清除MDC
        TraceIdUtils.clear();
    }
} 