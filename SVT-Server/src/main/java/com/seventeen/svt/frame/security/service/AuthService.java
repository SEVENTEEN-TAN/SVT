package com.seventeen.svt.frame.security.service;

import com.seventeen.svt.common.response.Result;
import com.seventeen.svt.frame.security.dto.LoginRequestDTO;
import com.seventeen.svt.frame.security.vo.TokenVO;

/**
 * 认证服务接口
 */
public interface AuthService {

    /**
     * 用户登录
     */
    TokenVO login(LoginRequestDTO loginRequest);

    /**
     * 用户登出
     * @param requestUserId
     * @return
     */
    Result<?> logout(String requestUserId);
}
