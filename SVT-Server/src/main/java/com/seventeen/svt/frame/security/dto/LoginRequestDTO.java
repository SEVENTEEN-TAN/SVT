package com.seventeen.svt.frame.security.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 登录请求参数
 */
@Data
@Schema(description = "登录请求参数")
public class LoginRequestDTO {

    @Schema(description = "登录ID", example = "admin", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "登录ID不能为空")
    private String loginId;

    @Schema(description = "密码", example = "123456", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "密码不能为空")
    private String password;
} 