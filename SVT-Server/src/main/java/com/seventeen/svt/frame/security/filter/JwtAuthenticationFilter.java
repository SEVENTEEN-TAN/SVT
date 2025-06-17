package com.seventeen.svt.frame.security.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.seventeen.svt.common.config.SecurityPathConfig;
import com.seventeen.svt.common.exception.BusinessException;
import com.seventeen.svt.common.response.Result;
import com.seventeen.svt.common.util.MessageUtils;
import com.seventeen.svt.common.util.RequestContextUtils;
import com.seventeen.svt.common.util.TraceIdUtils;
import com.seventeen.svt.frame.cache.entity.JwtCache;
import com.seventeen.svt.frame.cache.util.JwtCacheUtils;
import com.seventeen.svt.frame.security.config.CustomAuthentication;
import com.seventeen.svt.frame.security.utils.JwtUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JWT认证过滤器
 */
@Slf4j
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;
    private final JwtCacheUtils jwtCacheUtils;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    public JwtAuthenticationFilter(JwtUtils jwtUtils, JwtCacheUtils jwtCacheUtils) {
        this.jwtUtils = jwtUtils;
        this.jwtCacheUtils = jwtCacheUtils;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            // 检查请求路径是否在放行名单中
            String requestPath = request.getRequestURI();
            if (isPermitAllPath(requestPath)) {
                log.debug(MessageUtils.getMessage("log.path.permit"), requestPath);
                filterChain.doFilter(request, response);
                return;
            }
            
            String tokenStr = getJwtFromRequest(request);

            if (tokenStr == null) {
                log.debug(MessageUtils.getMessage("log.token.missing"));
                throw new BusinessException(HttpStatus.UNAUTHORIZED.value(), MessageUtils.getMessage("system.unauthorized"));
            }

            if (SecurityContextHolder.getContext().getAuthentication() == null) {
                String loginId = jwtUtils.getUserIdFromToken(tokenStr);
                
                if (loginId != null && !jwtUtils.isTokenExpired(tokenStr)) {
                    if (jwtCacheUtils.isBlackToken(tokenStr)) {
                        log.debug(MessageUtils.getMessage("log.token.blacklist"));
                        throw new BusinessException(HttpStatus.UNAUTHORIZED.value(), MessageUtils.getMessage("auth.login.tokeninvalid"));
                    }

                    if (jwtCacheUtils.needsRefresh(loginId)) {
                        jwtCacheUtils.renewJwt(loginId);
                    }
                    
                    String currentIp = RequestContextUtils.getIpAddress();
                    if (jwtCacheUtils.checkIpChange(loginId, currentIp)) {
                        log.debug(MessageUtils.getMessage("log.user.ipchange"));
                        jwtCacheUtils.removeJwt(loginId);
                        throw new BusinessException(HttpStatus.UNAUTHORIZED.value(), MessageUtils.getMessage("auth.login.ipchange"));
                    }

                    if (jwtCacheUtils.checkTokenChange(loginId, tokenStr)) {
                        log.debug(MessageUtils.getMessage("log.token.mismatch"));
                        throw new BusinessException(HttpStatus.UNAUTHORIZED.value(), MessageUtils.getMessage("auth.login.tokeninvalid"));
                    }

                    String username = jwtUtils.getUsernameFromToken(tokenStr);
                    CustomAuthentication customAuthentication = new CustomAuthentication(loginId, username);
                    SecurityContextHolder.getContext().setAuthentication(customAuthentication);
                    TraceIdUtils.setUserId(loginId);
                    log.debug(MessageUtils.getMessage("log.auth.success", loginId));
                } else {
                    log.debug(MessageUtils.getMessage("log.token.expired", loginId));
                    throw new BusinessException(HttpStatus.UNAUTHORIZED.value(), MessageUtils.getMessage("auth.login.expired"));
                }
            }
        } catch (Exception e) {
            handleException(response, e);
            return;
        }

        filterChain.doFilter(request, response);
    }

    /**
     * 判断请求路径是否在放行名单中
     * @param requestPath 请求路径
     * @return 是否放行
     */
    private boolean isPermitAllPath(String requestPath) {
        for (String pattern : SecurityPathConfig.getPermitAllPaths()) {
            if (pathMatcher.match(pattern, requestPath)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 从请求中获取JWT Token
     */
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    private void handleException(HttpServletResponse response, Exception e) throws IOException {
        int status = HttpStatus.INTERNAL_SERVER_ERROR.value();
        String message = MessageUtils.getMessage("system.servererror");

        if (e instanceof BusinessException be) {
            status = be.getCode();
            message = be.getMessage();
        } else {
            log.error("Unhandled exception in JwtAuthenticationFilter", e);
        }

        response.setContentType("application/json;charset=UTF-8");
        response.setStatus(status);
        Result<?> result = Result.fail(status, message);
        ObjectMapper objectMapper = new ObjectMapper();
        response.getWriter().write(objectMapper.writeValueAsString(result));
    }
} 