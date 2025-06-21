package com.seventeen.svt.frame.security.controller;

import cn.hutool.core.util.StrUtil;
import com.github.xiaoymin.knife4j.annotations.ApiOperationSupport;
import com.seventeen.svt.common.response.Result;
import com.seventeen.svt.common.util.RequestContextUtils;
import com.seventeen.svt.common.util.MessageUtils;
import com.seventeen.svt.frame.security.dto.LoginRequestDTO;
import com.seventeen.svt.frame.security.service.AuthService;
import com.seventeen.svt.frame.security.vo.TokenVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 认证控制器
 */
@Tag(name = "认证管理", description = "认证相关接口")
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "登录", description = "用户登录获取token", security = {})
    @PostMapping("/login")
    @ApiOperationSupport(order = 0)
    public Result<TokenVO> login(@Valid @RequestBody LoginRequestDTO loginRequest) {
        return Result.success(MessageUtils.getMessage("auth.login.success"), authService.login(loginRequest));
    }


    @Operation(summary = "登出", description = "用户登出")
    @GetMapping("/logout")
    @ApiOperationSupport(order = 999)
    public Result<?> logout() {
        String requestUserId = RequestContextUtils.getRequestUserId();
        if (StrUtil.isNotEmpty(requestUserId)){
            authService.logout(requestUserId);
        }
        return Result.success(MessageUtils.getMessage("auth.logout.success"));
    }
} 