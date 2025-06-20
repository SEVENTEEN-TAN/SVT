package com.seventeen.svt.frame.security.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.io.Serializable;

/**
 * Token响应DTO
 */
@Data
@Builder
@Schema(description = "Token响应DTO")
public class TokenVO implements Serializable {

    private static final long serialVersionUID = 1L;
    
    @Schema(description = "访问令牌")
    private String accessToken;

    @Schema(description = "访问令牌过期时间(秒)")
    private Long accessTokenExpireIn;

} 