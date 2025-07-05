package com.seventeen.svt.frame.security.dto.request;

import com.seventeen.svt.common.annotation.audit.SensitiveLog;
import com.seventeen.svt.common.annotation.audit.SensitiveStrategy;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.io.Serializable;

/**
 * 登录请求参数
 */
@Data
@Schema(description = "登录请求参数")
public class LoginRequestDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    @Schema(description = "登录ID", example = "admin", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "登录ID不能为空")
    private String loginId;

    @Schema(description = "密码", example = "123456", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "密码不能为空")
    @SensitiveLog(strategy = SensitiveStrategy.PASSWORD)
    private String password;
} 