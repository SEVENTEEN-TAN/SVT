package com.seventeen.svt.frame.security.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.seventeen.svt.common.config.SecurityPathConfig;
import com.seventeen.svt.common.exception.BusinessException;
import com.seventeen.svt.common.response.Result;
import com.seventeen.svt.common.util.MessageUtils;
import com.seventeen.svt.common.util.TraceIdUtils;
import com.seventeen.svt.frame.cache.entity.JwtCache;
import com.seventeen.svt.frame.cache.util.JwtCacheUtils;
import com.seventeen.svt.frame.security.config.CustomAuthentication;
import com.seventeen.svt.frame.security.utils.JwtUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
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
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;
    private final JwtCacheUtils jwtCacheUtils;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        try {
            // 检查请求路径是否在放行名单中
            String requestPath = request.getRequestURI();
            if (isPermitAllPath(requestPath)) {
                log.debug(MessageUtils.getMessage("log.path.permit"), requestPath);
                chain.doFilter(request, response);
                return;
            }
            
            String tokenStr = getJwtFromRequest(request);

            if (tokenStr == null) {
                log.debug(MessageUtils.getMessage("log.token.missing"));
                throw new BusinessException(HttpStatus.UNAUTHORIZED.value(), MessageUtils.getMessage("system.unauthorized"));
            }

            if (SecurityContextHolder.getContext().getAuthentication() == null) {

                // 从Token中获取用户ID
                String loginId = jwtUtils.getUserIdFromToken(tokenStr);
                
                if (loginId != null) {
                    // 检查Token是否在黑名单中
                    if (jwtCacheUtils.isBlackToken(tokenStr)) {
                        log.debug(MessageUtils.getMessage("log.token.blacklist"));
                        throw new BusinessException(HttpStatus.UNAUTHORIZED.value(), MessageUtils.getMessage("auth.login.tokeninvalid"));
                    }

                    // 检查用户是否超时未活动
                    if (jwtCacheUtils.checkActive(loginId)) {
                        log.debug(MessageUtils.getMessage("log.user.inactive"));
                        jwtCacheUtils.removeJwt(loginId);//退出用户缓存
                        throw new BusinessException(HttpStatus.UNAUTHORIZED.value(), MessageUtils.getMessage("auth.login.inactive"));
                    }

                    // 从Redis中获取Token信息并验证
                    JwtCache jwtCache = jwtCacheUtils.getJwt(loginId);
                    if (jwtCache != null && !jwtUtils.isTokenExpired(tokenStr)) {  // 缓存中存在Token 且 未过期
                        if (jwtCacheUtils.checkIpChange(loginId)) {
                            log.debug(MessageUtils.getMessage("log.user.ipchange"));
                            jwtCacheUtils.removeJwt(loginId);//退出用户缓存
                            throw new BusinessException(HttpStatus.UNAUTHORIZED.value(), MessageUtils.getMessage("auth.login.ipchange"));
                        }

                        if (jwtCacheUtils.checkTokenChange(loginId,tokenStr)) {
                            log.debug(MessageUtils.getMessage("log.token.mismatch"));
                            throw new BusinessException(HttpStatus.UNAUTHORIZED.value(), MessageUtils.getMessage("auth.login.tokeninvalid"));
                        }

                        // 从JWT中获取用户信息
                        String userId = jwtUtils.getUserIdFromToken(tokenStr);
                        String username = jwtUtils.getUsernameFromToken(tokenStr);

                        CustomAuthentication customAuthentication = new CustomAuthentication(userId, username);
                        jwtCacheUtils.renewJwt(loginId); //续期

                        SecurityContextHolder.getContext().setAuthentication(customAuthentication);
                        // 设置用户ID到MDC中，用于日志输出
                        TraceIdUtils.setUserId(userId);
                        log.debug(MessageUtils.getMessage("log.auth.success", loginId));
                    } else {
                        log.debug(MessageUtils.getMessage("log.token.expired", loginId));
                        throw new BusinessException(HttpStatus.UNAUTHORIZED.value(), MessageUtils.getMessage("auth.login.expired"));
                    }
                } else {
                    log.debug(MessageUtils.getMessage("log.token.nouserid"));
                    throw new BusinessException(HttpStatus.UNAUTHORIZED.value(), MessageUtils.getMessage("auth.login.tokeninvalid"));
                }
            }

        } catch (Exception e) {
            log.debug(e.getMessage(),e);
            if (e instanceof BusinessException businessException) {
                // 设置响应格式为JSON
                response.setContentType("application/json;charset=UTF-8");
                response.setStatus(businessException.getCode());

                // 创建统一响应格式
                Result<?> result = Result.fail(businessException.getCode(), businessException.getMessage());

                // 使用Jackson将Result对象转换为JSON字符串
                ObjectMapper objectMapper = new ObjectMapper();
                String jsonResponse = objectMapper.writeValueAsString(result);

                // 写入响应
                response.getWriter().write(jsonResponse);
                return; // 结束过滤器链
            } else {
                // 处理其他异常
                response.setContentType("application/json;charset=UTF-8");
                response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());

                Result<?> result = Result.fail(HttpStatus.INTERNAL_SERVER_ERROR.value(), MessageUtils.getMessage("system.servererror"));

                ObjectMapper objectMapper = new ObjectMapper();
                String jsonResponse = objectMapper.writeValueAsString(result);

                response.getWriter().write(jsonResponse);
                return; // 结束过滤器链
            }
        }

        chain.doFilter(request, response);
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
} 