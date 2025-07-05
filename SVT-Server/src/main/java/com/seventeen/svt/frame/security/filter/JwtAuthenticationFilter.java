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
import com.seventeen.svt.frame.security.constants.SessionStatusHeader;
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
 *
 * 版本历史：
 * - v1.0: 基础JWT认证功能，包含完整的安全检查流程
 * - v1.1 (2025-06-30): 添加智能续期机制和会话状态管理
 *
 * 认证流程 (9步安全检查)：
 * 1. 验证Token是否为系统颁发的合法Token
 * 2. 检查Token是否在黑名单中
 * 3. 检查JWT缓存是否存在（服务重启安全策略）
 * 4. 检查IP地址变化
 * 5. 检查Token变化（单点登录）
 * 6. 🔧 会话活跃度过期检查（修复：优先检查过期）
 * 7. 🔧 智能活跃度续期检查（修复：在未过期时才续期）
 * 8. 会话状态计算和响应头设置
 * 9. 更新用户最后活动时间
 *
 * 新增功能：
 * - 基于用户活跃度的智能续期机制
 * - 时间对齐策略，确保不突破Token生命周期
 * - 会话状态响应头，支持前端状态感知
 * - 渐进式用户提醒机制
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
                // 🔧 安全改进：首先验证Token是否为系统颁发的合法Token
                boolean isValidSystemToken = jwtUtils.isValidSystemToken(tokenStr);

                // 恶意Token或格式错误的Token，不加入黑名单，直接拒绝
                if (!isValidSystemToken) {
                    log.warn("Invalid or malformed token detected, rejecting without blacklisting");
                    throw new BusinessException(HttpStatus.UNAUTHORIZED.value(), MessageUtils.getMessage("system.unauthorized"));
                }
                
                // Token签名验证通过，继续业务验证
                String loginId = jwtUtils.getUserIdFromToken(tokenStr);
                
                if (loginId != null && !jwtUtils.isTokenExpired(tokenStr)) {
                    
                    // 1. 检查黑名单
                    if (jwtCacheUtils.isBlackToken(tokenStr)) {
                        log.warn("🚫 [JWT智能续期测试] Token在黑名单中 - User: {}", loginId);
                        throw new BusinessException(HttpStatus.UNAUTHORIZED.value(), MessageUtils.getMessage("auth.login.tokeninvalid"));
                    }

                    // 2. 检查JWT缓存是否存在 - 不存在则认证失败（服务重启后安全策略）
                    JwtCache existingCache = jwtCacheUtils.getJwt(loginId);
                    if (existingCache == null) {
                        log.warn("❌ [JWT智能续期测试] JWT缓存不存在 - User: {}, 认证失败", loginId);
                        // 🔧 安全改进：系统颁发的Token认证失败时，加入黑名单
                        jwtCacheUtils.invalidJwt(tokenStr);
                        throw new BusinessException(HttpStatus.UNAUTHORIZED.value(), MessageUtils.getMessage("auth.login.expired"));
                    }

                    // 3. 缓存存在，执行正常的安全检查
                    String currentIp = RequestContextUtils.getIpAddress();
                    
                    // 检查IP变化
                    if (jwtCacheUtils.checkIpChange(loginId, currentIp)) {
                        log.warn("🔄 [JWT智能续期测试] IP地址变化 - User: {}, 旧IP: {}, 新IP: {}", 
                            loginId, existingCache.getLoginIp(), currentIp);
                        jwtCacheUtils.removeJwt(loginId);
                        throw new BusinessException(HttpStatus.UNAUTHORIZED.value(), MessageUtils.getMessage("auth.login.ipchange"));
                    }

                    // 检查Token变化
                    if (jwtCacheUtils.checkTokenChange(loginId, tokenStr)) {
                        log.warn("🔄 [JWT智能续期测试] Token变化检测 - User: {}", loginId);
                        jwtCacheUtils.removeJwt(loginId);
                        throw new BusinessException(HttpStatus.UNAUTHORIZED.value(), MessageUtils.getMessage("auth.login.tokeninvalid"));
                    }

                    // 4. 🔧 修复：先检查会话是否因活跃度过期
                    boolean isExpiredByActivity = jwtCacheUtils.isSessionExpiredByActivity(loginId);
                    
                    if (isExpiredByActivity) {
                        log.warn("⏰ [JWT智能续期测试] 会话因活跃度过期 - User: {}", loginId);
                        jwtCacheUtils.removeJwt(loginId);
                        throw new BusinessException(HttpStatus.UNAUTHORIZED.value(),
                            MessageUtils.getMessage("auth.login.expired"));
                    }

                    // 5. 智能活跃度续期检查（只有在未过期的情况下才检查续期）
                    boolean needsRenewal = jwtCacheUtils.needsActivityRenewal(loginId);
                    
                    if (needsRenewal) {
                        JwtCacheUtils.ActivityRenewalResult renewalResult =
                            jwtCacheUtils.renewActivityWithTokenLimit(loginId);

                        if (!renewalResult.isSuccess()) {
                            log.error("❌ [JWT智能续期测试] 活跃度续期失败 - User: {}, 原因: {}",
                                    loginId, renewalResult.getMessage());
                            jwtCacheUtils.removeJwt(loginId);
                            throw new BusinessException(HttpStatus.UNAUTHORIZED.value(),
                                MessageUtils.getMessage("auth.login.expired"));
                        }

                        if (renewalResult.isLimitedByToken()) {
                            log.warn("⚠️ [JWT智能续期测试] 续期受Token生命周期限制 - User: {}, 剩余时间: {}ms", 
                                loginId, renewalResult.getRemainingTime());
                        } else {
                        }
                    }

                    // 6. 获取会话状态并设置响应头
                    JwtCacheUtils.SessionStatusInfo statusInfo = jwtCacheUtils.getSessionStatus(loginId);
                    response.setHeader(SessionStatusHeader.SESSION_STATUS, statusInfo.getStatus());
                    response.setHeader(SessionStatusHeader.SESSION_REMAINING,
                                      String.valueOf(statusInfo.getRemainingTime()));

                    if (statusInfo.getMessage() != null) {
                        response.setHeader(SessionStatusHeader.SESSION_WARNING, statusInfo.getMessage());
                    }
                    

                    // 7. 检查会话是否过期
                    if (SessionStatusHeader.STATUS_EXPIRED.equals(statusInfo.getStatus())) {
                        log.warn("⚠️ [JWT智能续期测试] 会话已过期 - User: {}", loginId);
                        jwtCacheUtils.removeJwt(loginId);
                        throw new BusinessException(HttpStatus.UNAUTHORIZED.value(),
                            MessageUtils.getMessage("auth.login.expired"));
                    }

                    // 8. 更新最后活动时间
                    jwtCacheUtils.updateLastActivity(loginId);

                    // 9. 设置认证上下文
                    String username = jwtUtils.getUsernameFromToken(tokenStr);
                    CustomAuthentication customAuthentication = new CustomAuthentication(loginId, username);
                    SecurityContextHolder.getContext().setAuthentication(customAuthentication);
                    TraceIdUtils.setUserId(loginId);
                    log.debug(MessageUtils.getMessage("log.auth.success", loginId));
                } else {
                    // Token过期或用户ID为空
                    if (loginId != null) {
                        log.debug(MessageUtils.getMessage("log.token.expired", loginId));
                        // 🔧 安全改进：系统颁发的过期Token，加入黑名单
                        jwtCacheUtils.invalidJwt(tokenStr);
                    } else {
                        log.debug("Token parsing failed for system-issued token");
                        // Token解析失败但签名有效，可能是内部错误，加入黑名单
                        jwtCacheUtils.invalidJwt(tokenStr);
                    }
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