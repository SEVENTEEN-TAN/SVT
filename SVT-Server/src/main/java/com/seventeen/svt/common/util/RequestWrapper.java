package com.seventeen.svt.common.util;

import jakarta.servlet.ReadListener;
import jakarta.servlet.ServletInputStream;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import org.springframework.util.StreamUtils;

import java.io.*;
import java.nio.charset.StandardCharsets;

/**
 * 请求包装器
 * 用于缓存请求体,支持多次读取
 */
public class RequestWrapper extends HttpServletRequestWrapper {
    /**
     * 最大请求体大小 10MB
     */
    private static final int MAX_BODY_SIZE = 10 * 1024 * 1024;

    private final byte[] content;
    private final String characterEncoding;

    public RequestWrapper(HttpServletRequest request) throws IOException {
        super(request);
        // 获取字符编码,默认UTF-8
        String encoding = request.getCharacterEncoding();
        this.characterEncoding = encoding != null ? encoding : StandardCharsets.UTF_8.name();

        // 读取请求体
        byte[] bytes = StreamUtils.copyToByteArray(request.getInputStream());
        // 检查请求体大小
        if (bytes.length > MAX_BODY_SIZE) {
            throw new IllegalStateException("Request body is too large, max size is " + MAX_BODY_SIZE + " bytes");
        }
        this.content = bytes;
    }

    @Override
    public ServletInputStream getInputStream() {
        final ByteArrayInputStream byteArrayInputStream = new ByteArrayInputStream(content);
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
            public void setReadListener(ReadListener readListener) {
                throw new UnsupportedOperationException("setReadListener is not supported");
            }

            @Override
            public int read() {
                return byteArrayInputStream.read();
            }

            @Override
            public int read(byte[] b, int off, int len) {
                return byteArrayInputStream.read(b, off, len);
            }

            @Override
            public void close() {
                try {
                    byteArrayInputStream.close();
                } catch (IOException e) {
                    // ignore
                }
            }
        };
    }

    @Override
    public BufferedReader getReader() throws UnsupportedEncodingException {
        return new BufferedReader(new InputStreamReader(getInputStream(), characterEncoding));
    }

    /**
     * 获取请求体内容
     */
    public String getBody() {
        try {
            return new String(content, characterEncoding);
        } catch (UnsupportedEncodingException e) {
            // 如果字符编码不支持,使用UTF-8
            return new String(content, StandardCharsets.UTF_8);
        }
    }

    /**
     * 获取请求体字节数组
     */
    public byte[] getContentAsByteArray() {
        return content;
    }

    /**
     * 获取请求体大小
     */
    public int getContentLength() {
        return content.length;
    }

    @Override
    public String getCharacterEncoding() {
        return this.characterEncoding;
    }
} 