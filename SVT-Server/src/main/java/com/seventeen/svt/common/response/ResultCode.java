package com.seventeen.svt.common.response;

/**
 * 响应状态码
 */
public class ResultCode {
    /**
     * 成功
     */
    public static final int SUCCESS = 200;

    /**
     * 失败
     */
    public static final int FAILURE = 500;

    /**
     * 未授权
     */
    public static final int UNAUTHORIZED = 401;

    /**
     * 禁止访问
     */
    public static final int FORBIDDEN = 403;

    /**
     * 不存在
     */
    public static final int NOT_FOUND = 404;

    /**
     * 请求参数错误
     */
    public static final int BAD_REQUEST = 400;

    /**
     * 冲突
     */
    public static final int CONFLICT = 409;

    /**
     * 请求参数验证失败
     */
    public static final int VALIDATE_FAILED = 422;

    /**
     * 请求过多
     */
    public static final int TOO_MANY_REQUESTS = 429;
} 