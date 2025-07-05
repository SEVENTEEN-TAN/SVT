package com.seventeen.svt.common.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.seventeen.svt.common.config.AESConfig;
import com.seventeen.svt.common.util.AESUtils;
import com.seventeen.svt.common.util.RequestWrapper;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpServletResponseWrapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

/**
 * AES加密解密过滤器
 * 处理API请求的AES加密解密
 * 
 * 执行顺序：
 * 1. 检查是否启用AES加密
 * 2. 请求解密：检查请求头X-Encrypted，解密请求体
 * 3. 响应加密：检查是否需要加密响应
 * 
 * @author SEVENTEEN
 * @since 2025-06-17
 */
@Slf4j
@Component
@Order(10) // 在RequestWrapperFilter(50)之前执行
@RequiredArgsConstructor
public class AESCryptoFilter implements Filter {

    private final AESConfig aesConfig;
    private final AESUtils aesUtils;
    private final ObjectMapper objectMapper;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) 
            throws IOException, ServletException {
        
        // 检查是否启用AES加密
        if (!aesConfig.isEnabled()) {
            log.debug("AES加密未启用，跳过处理");
            chain.doFilter(request, response);
            return;
        }

        if (request instanceof HttpServletRequest && response instanceof HttpServletResponse) {
            HttpServletRequest httpRequest = (HttpServletRequest) request;
            HttpServletResponse httpResponse = (HttpServletResponse) response;
            
            log.debug("处理请求: {} {}", httpRequest.getMethod(), httpRequest.getRequestURI());
            
            // 检查是否是API请求
            if (!isApiRequest(httpRequest.getRequestURI())) {
                log.debug("非API请求，跳过AES处理: {}", httpRequest.getRequestURI());
                chain.doFilter(request, response);
                return;
            }

            try {
                // 处理请求解密
                ServletRequest processedRequest = processRequest(httpRequest);
                
                // 创建响应包装器用于加密响应
                AESResponseWrapper responseWrapper = new AESResponseWrapper(httpResponse);
                log.debug("创建AES响应包装器");
                
                // 继续过滤器链
                chain.doFilter(processedRequest, responseWrapper);
                
                // 处理响应加密
                log.debug("开始处理响应加密");
                processResponse(httpRequest, httpResponse, responseWrapper);
                
            } catch (Exception e) {
                log.error("AES加密解密处理失败: {}", e.getMessage(), e);
                handleError(httpResponse, "数据加密解密失败", 500);
            }
        } else {
            chain.doFilter(request, response);
        }
    }

    /**
     * 处理请求解密
     */
    private ServletRequest processRequest(HttpServletRequest request) throws IOException {
        String encryptedHeader = request.getHeader("X-Encrypted");
        
        // 检查是否为加密请求
        if (!"true".equalsIgnoreCase(encryptedHeader)) {
            return request;
        }

        // 只处理POST、PUT、PATCH请求
        String method = request.getMethod();
        if (!isEncryptableMethod(method)) {
            return request;
        }

        try {
            // 创建请求包装器以支持多次读取
            RequestWrapper requestWrapper = new RequestWrapper(request);
            String requestBody = requestWrapper.getBody();
            
            if (!StringUtils.hasText(requestBody)) {
                log.debug("请求体为空，跳过解密");
                return requestWrapper;
            }

            log.debug("检测到加密请求，开始解密处理");
            
            // 解析加密数据
            @SuppressWarnings("unchecked")
            Map<String, Object> encryptedData = objectMapper.readValue(requestBody, Map.class);
            
            // 验证加密数据格式
            if (!isValidEncryptedData(encryptedData)) {
                log.warn("加密数据格式无效");
                return requestWrapper;
            }

            // 执行解密
            String decryptedJson = aesUtils.decryptFromAPI(encryptedData);
            
            // 创建新的请求包装器包含解密后的数据
            AESRequestWrapper aesRequestWrapper = new AESRequestWrapper(requestWrapper, decryptedJson);
            
            log.debug("请求数据解密成功，原始长度: {}, 解密后长度: {}", 
                    requestBody.length(), decryptedJson.length());
            
            return aesRequestWrapper;
            
        } catch (Exception e) {
            log.error("请求解密失败: {}", e.getMessage(), e);
            // 调试模式下允许继续处理
            if (aesConfig.isDebug()) {
                log.warn("调试模式：解密失败，使用原始请求");
                return new RequestWrapper(request);
            }
            throw new RuntimeException("请求数据解密失败", e);
        }
    }

    /**
     * 处理响应加密
     */
    private void processResponse(HttpServletRequest request, HttpServletResponse response, 
                               AESResponseWrapper responseWrapper) throws IOException {
        
        String encryptedHeader = request.getHeader("X-Encrypted");
        log.debug("检查请求头 X-Encrypted: {}", encryptedHeader);
        
        // 只对加密请求的响应进行加密
        if (!"true".equalsIgnoreCase(encryptedHeader)) {
            log.debug("非加密请求，返回原始响应");
            responseWrapper.copyToOriginalResponse();
            return;
        }

        // 🔧 调试模式检查：如果启用调试模式，直接返回明文响应
        if (aesConfig.isDebug()) {
            log.info("AES调试模式已启用，返回明文响应（未加密）");
            responseWrapper.copyToOriginalResponse();
            return;
        }

        try {
            String responseContent = responseWrapper.getContent();
            log.debug("获取响应内容，长度: {}", responseContent != null ? responseContent.length() : 0);
            
            if (!StringUtils.hasText(responseContent)) {
                log.debug("响应内容为空，返回原始响应");
                responseWrapper.copyToOriginalResponse();
                return;
            }

            log.debug("开始加密响应数据，原始长度: {}", responseContent.length());
            log.debug("响应内容预览: {}", responseContent.length() > 200 ? responseContent.substring(0, 200) + "..." : responseContent);
            
            // 执行加密
            Map<String, Object> encryptedResponse = aesUtils.encryptForAPI(responseContent);
            String encryptedJson = objectMapper.writeValueAsString(encryptedResponse);
            
            // 设置响应头（必须在写入响应之前设置）
            if (!response.isCommitted()) {
                response.setHeader("X-Encrypted", "true");
                response.setContentType("application/json;charset=UTF-8");
                response.setContentLength(encryptedJson.getBytes(StandardCharsets.UTF_8).length);
                log.info("AES_FILTER: Set response headers - X-Encrypted=true");
            } else {
                log.warn("AES_FILTER: Response already committed, cannot set headers");
            }
            
            // 写入加密后的响应
            try (PrintWriter writer = response.getWriter()) {
                writer.write(encryptedJson);
                writer.flush();
            }
            
            log.debug("响应数据加密成功，加密后长度: {}", encryptedJson.length());
            
        } catch (Exception e) {
            log.error("响应加密失败: {}", e.getMessage(), e);
            // 调试模式下返回原始响应
            if (aesConfig.isDebug()) {
                log.warn("调试模式：加密失败，返回原始响应");
                responseWrapper.copyToOriginalResponse();
            } else {
                handleError(response, "响应数据加密失败", 500);
            }
        }
    }

    /**
     * 检查是否是API请求
     */
    private boolean isApiRequest(String uri) {
        // 排除静态资源和监控页面
        if (uri.contains("/druid/") || 
            uri.contains("/swagger") || 
            uri.contains("/v3/api-docs") || 
            uri.contains("/doc.html") ||
            uri.matches(".+\\.(js|css|html|jpg|jpeg|png|gif|ico|svg|woff|ttf|eot)$")) {
            return false;
        }
        return true;
    }

    /**
     * 检查是否是可加密的请求方法
     */
    private boolean isEncryptableMethod(String method) {
        return "POST".equalsIgnoreCase(method) || 
               "PUT".equalsIgnoreCase(method) || 
               "PATCH".equalsIgnoreCase(method);
    }

    /**
     * 验证加密数据格式
     */
    private boolean isValidEncryptedData(Map<String, Object> data) {
        return data != null && 
               data.containsKey("encrypted") && 
               data.containsKey("data") && 
               data.containsKey("iv") &&
               Boolean.TRUE.equals(data.get("encrypted"));
    }

    /**
     * 处理错误响应
     */
    private void handleError(HttpServletResponse response, String message, int status) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json;charset=UTF-8");
        
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("code", status);
        errorResponse.put("message", message);
        errorResponse.put("success", false);
        
        String errorJson = objectMapper.writeValueAsString(errorResponse);
        
        try (PrintWriter writer = response.getWriter()) {
            writer.write(errorJson);
            writer.flush();
        }
    }

    /**
     * AES请求包装器
     */
    private static class AESRequestWrapper extends RequestWrapper {
        private final String decryptedBody;
        private final byte[] decryptedBodyBytes;

        public AESRequestWrapper(HttpServletRequest request, String decryptedBody) throws IOException {
            super(request);
            this.decryptedBody = decryptedBody;
            this.decryptedBodyBytes = decryptedBody.getBytes(StandardCharsets.UTF_8);
        }

        @Override
        public ServletInputStream getInputStream() {
            final java.io.ByteArrayInputStream byteArrayInputStream = new java.io.ByteArrayInputStream(this.decryptedBodyBytes);
            return new ServletInputStream() {
                @Override
                public boolean isFinished() {
                    return byteArrayInputStream.available() == 0;
                }

                @Override
                public boolean isReady() {
                    return true;
                }

                @Override
                public void setReadListener(ReadListener listener) {
                    // Not implemented
                }

                @Override
                public int read() {
                    return byteArrayInputStream.read();
                }
            };
        }
        
        @Override
        public java.io.BufferedReader getReader() {
            return new java.io.BufferedReader(new java.io.InputStreamReader(this.getInputStream(), StandardCharsets.UTF_8));
        }

        @Override
        public String getBody() {
            return decryptedBody;
        }
    }

    /**
     * AES响应包装器
     */
    private static class AESResponseWrapper extends HttpServletResponseWrapper {
        private final java.io.ByteArrayOutputStream byteArrayOutputStream = new java.io.ByteArrayOutputStream();
        private final java.io.StringWriter stringWriter = new java.io.StringWriter();
        private final PrintWriter writer = new PrintWriter(stringWriter);
        private final HttpServletResponse originalResponse;
        private boolean usingOutputStream = false;
        private boolean usingWriter = false;

        public AESResponseWrapper(HttpServletResponse response) {
            super(response);
            this.originalResponse = response;
        }

        @Override
        public PrintWriter getWriter() throws IOException {
            if (usingOutputStream) {
                throw new IllegalStateException("getOutputStream() has already been called on this response");
            }
            usingWriter = true;
            return writer;
        }

        @Override
        public ServletOutputStream getOutputStream() throws IOException {
            if (usingWriter) {
                throw new IllegalStateException("getWriter() has already been called on this response");
            }
            usingOutputStream = true;
            return new ServletOutputStream() {
                @Override
                public boolean isReady() {
                    return true;
                }

                @Override
                public void setWriteListener(WriteListener listener) {
                    // Not implemented
                }

                @Override
                public void write(int b) throws IOException {
                    byteArrayOutputStream.write(b);
                }

                @Override
                public void write(byte[] b) throws IOException {
                    byteArrayOutputStream.write(b);
                }

                @Override
                public void write(byte[] b, int off, int len) throws IOException {
                    byteArrayOutputStream.write(b, off, len);
                }
            };
        }

        public String getContent() {
            writer.flush();
            if (usingOutputStream) {
                return new String(byteArrayOutputStream.toByteArray(), StandardCharsets.UTF_8);
            } else {
                return stringWriter.toString();
            }
        }

        public void copyToOriginalResponse() throws IOException {
            String content = getContent();
            if (StringUtils.hasText(content)) {
                originalResponse.setContentLength(content.getBytes(StandardCharsets.UTF_8).length);
                try (PrintWriter originalWriter = originalResponse.getWriter()) {
                    originalWriter.write(content);
                    originalWriter.flush();
                }
            }
        }
    }
} 