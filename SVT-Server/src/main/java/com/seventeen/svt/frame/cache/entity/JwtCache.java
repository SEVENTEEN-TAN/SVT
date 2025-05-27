package com.seventeen.svt.frame.cache.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@Builder
@NoArgsConstructor  // 添加无参构造函数
@AllArgsConstructor // 如果使用了@Builder,需要添加全参构造函数
public class JwtCache {
    /**
     * 当前Token
     */
    private String token;

    /**
     * 刷新时间
     */
    private Long refreshTime;

    /**
     * 登录ID(用户ID)
     */
    private String userId;


    /**
     * 登录IP
     */
    private String loginIp;

    /**
     * 创建时间
     */
    private Date createdTime;

    /**
     * 过期时间
     */
    private Date expirationTime;
}
