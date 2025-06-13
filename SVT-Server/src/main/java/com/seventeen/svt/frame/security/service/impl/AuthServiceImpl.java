package com.seventeen.svt.frame.security.service.impl;

import cn.hutool.core.util.ObjectUtil;
import com.seventeen.svt.common.config.Sm4PasswordEncoder;
import com.seventeen.svt.common.exception.BusinessException;
import com.seventeen.svt.common.response.Result;
import com.seventeen.svt.common.util.MessageUtils;
import com.seventeen.svt.common.util.RequestContextUtils;
import com.seventeen.svt.frame.cache.entity.JwtCache;
import com.seventeen.svt.frame.cache.entity.UserDetailCache;
import com.seventeen.svt.frame.cache.util.JwtCacheUtils;
import com.seventeen.svt.frame.cache.util.UserDetailCacheUtils;
import com.seventeen.svt.frame.security.config.CustomAuthentication;
import com.seventeen.svt.frame.security.dto.LoginRequestDTO;
import com.seventeen.svt.frame.security.service.AuthService;
import com.seventeen.svt.frame.security.utils.JwtUtils;
import com.seventeen.svt.frame.security.vo.TokenVO;
import com.seventeen.svt.modules.system.entity.UserInfo;
import com.seventeen.svt.modules.system.service.UserInfoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserInfoService userInfoService;
    private final JwtUtils jwtUtils;
    private final Sm4PasswordEncoder sm4PasswordEncoder;

    @Override
    public TokenVO login(LoginRequestDTO loginRequest) {
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

        // 验证密码 TODO: 注意当前使用的是明文
        if (!sm4PasswordEncoder.matches(loginRequest.getPassword(), customAuthentication.getPassword())) {
            throw new BusinessException(MessageUtils.getMessage("auth.login.wrongcredentials"));
        }

        // 生成访问令牌
        String accessToken = jwtUtils.generateToken(customAuthentication);

        //保持单点 将旧的JWT失效
        JwtCacheUtils.removeJwt(userInfo.getUserId());

        // 初始化存储Token信息
        JwtCache jwtCache = JwtCacheUtils.initJwt(accessToken, userInfo.getUserId());
        JwtCacheUtils.putJwt(userInfo.getUserId(), jwtCache);

        //创建当前用户详情的缓存
        UserDetailCache userDetailCache = UserDetailCache.builder()
                .userId(userInfo.getUserId())
                .userNameZh(userInfo.getUserNameZh())
                .userNameEn(userInfo.getUserNameEn())
                .loginIp(RequestContextUtils.getIpAddress())
                .loginTime(LocalDateTime.now()).build();
        UserDetailCacheUtils.putUserDetail(userInfo.getUserId(),userDetailCache);

        // 构建并返回TokenDTO
        return TokenVO.builder()
                .accessToken(accessToken)
                .accessTokenExpireIn(jwtUtils.getTokenRemainingTime(accessToken))
                .build();
    }

    @Override
    public Result<?> logout(String requestUserId) {
        JwtCacheUtils.removeJwt(requestUserId);
        UserDetailCacheUtils.removeUserDetail(requestUserId);
        return Result.success(MessageUtils.getMessage("auth.logout.success"));
    }
}
