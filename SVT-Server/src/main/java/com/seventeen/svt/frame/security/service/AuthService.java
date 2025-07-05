package com.seventeen.svt.frame.security.service;

import com.seventeen.svt.frame.security.dto.request.LoginRequestDTO;
import com.seventeen.svt.frame.security.dto.response.TokenDTO;

/**
 * 认证服务接口
 */
public interface AuthService {

    /**
     * 用户登录
     */
    TokenDTO login(LoginRequestDTO loginRequest);

    /**
     * 用户登出
     *
     */
    void logout(String requestUserId);
}
