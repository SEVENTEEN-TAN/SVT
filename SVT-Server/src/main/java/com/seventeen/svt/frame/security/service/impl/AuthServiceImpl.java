package com.seventeen.svt.frame.security.service.impl;

import cn.hutool.core.util.ObjectUtil;
import com.seventeen.svt.common.exception.BusinessException;
import com.seventeen.svt.common.response.Result;
import com.seventeen.svt.common.util.MessageUtils;
import com.seventeen.svt.common.util.RequestContextUtils;
import com.seventeen.svt.frame.cache.entity.JwtCache;
import com.seventeen.svt.frame.cache.entity.UserDetailCache;
import com.seventeen.svt.frame.cache.util.JwtCacheUtils;
import com.seventeen.svt.frame.cache.util.UserDetailCacheUtils;
import com.seventeen.svt.frame.security.config.CustomAuthentication;
import com.seventeen.svt.frame.security.dto.request.LoginRequestDTO;
import com.seventeen.svt.frame.security.dto.response.TokenDTO;
import com.seventeen.svt.frame.security.service.AuthService;
import com.seventeen.svt.frame.security.utils.JwtUtils;
import com.seventeen.svt.modules.system.entity.UserInfo;
import com.seventeen.svt.modules.system.service.UserInfoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserInfoService userInfoService;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;
    private final JwtCacheUtils jwtCacheUtils;
    private final UserDetailCacheUtils userDetailCacheUtils;

    @Override
    public TokenDTO login(LoginRequestDTO loginRequest) {
        // 加载用户信息
        UserInfo userInfo = userInfoService.getUserById(loginRequest.getLoginId());
        if (ObjectUtil.isEmpty(userInfo)) {
            throw new BusinessException(MessageUtils.getMessage("auth.login.wrongcredentials"));
        }

        // 判断用户状态
        if (!"0".equals(userInfo.getStatus())) {
            throw new BusinessException(MessageUtils.getMessage("auth.login.disabled"));
        }

        // 返回UserDetails对象
        CustomAuthentication customAuthentication = new CustomAuthentication(userInfo.getUserId(), userInfo.getUserNameZh(), userInfo.getPassword());

        // 验证密码
        if (!passwordEncoder.matches(loginRequest.getPassword(), customAuthentication.getPassword())) {
            throw new BusinessException(MessageUtils.getMessage("auth.login.wrongcredentials"));
        }

        // 生成访问令牌
        String accessToken = jwtUtils.generateToken(customAuthentication);

        //保持单点 将旧的JWT失效
        jwtCacheUtils.removeJwt(userInfo.getUserId());

        // 初始化存储Token信息
        JwtCache jwtCache = jwtCacheUtils.createJwtCache(accessToken, userInfo.getUserId(), RequestContextUtils.getIpAddress());
        jwtCacheUtils.putJwt(userInfo.getUserId(), jwtCache);

        //创建当前用户详情的缓存
        UserDetailCache userDetailCache = UserDetailCache.builder()
                .userId(userInfo.getUserId())
                .userNameZh(userInfo.getUserNameZh())
                .userNameEn(userInfo.getUserNameEn())
                .loginIp(RequestContextUtils.getIpAddress())
                .loginTime(LocalDateTime.now()).build();
        userDetailCacheUtils.putUserDetail(userInfo.getUserId(), userDetailCache);

        // 构建并返回TokenDTO
        return TokenDTO.builder()
                .accessToken(accessToken)
                .accessTokenExpireIn(jwtUtils.getTokenRemainingTime(accessToken))
                .build();
    }

    @Override
    public void logout(String requestUserId) {
        jwtCacheUtils.removeJwt(requestUserId);
        userDetailCacheUtils.removeUserDetail(requestUserId);
        Result.success(MessageUtils.getMessage("auth.logout.success"));
    }
}
