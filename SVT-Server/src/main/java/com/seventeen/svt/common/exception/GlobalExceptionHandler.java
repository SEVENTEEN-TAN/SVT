package com.seventeen.svt.common.exception;

import com.seventeen.svt.common.response.Result;
import com.seventeen.svt.common.response.ResultCode;
import com.seventeen.svt.common.util.MessageUtils;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import javax.naming.NoPermissionException;

/**
 * 全局异常处理
 */
@Slf4j
@RestControllerAdvice
@Order(0) // 确保优先级最高
public class GlobalExceptionHandler {

    /**
     * 处理自定义异常
     */
    @ExceptionHandler(BusinessException.class)
    public Result<?> handleBusinessException(BusinessException e) {
        log.error("业务异常: {}", e.getMessage(), e);
        return Result.fail(e.getCode(), e.getMessage());
    }

    /**
     * 处理权限不足异常
     */
    @ExceptionHandler(AccessDeniedException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public Result<?> handleAccessDeniedException(AccessDeniedException e) {
        log.error("权限不足: {}", e.getMessage(), e);
        return Result.fail(ResultCode.FORBIDDEN, MessageUtils.getMessage("system.forbidden"));
    }

    /**
     * 处理权限不足异常
     */
    @ExceptionHandler(NoPermissionException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public Result<?> noPermissionExceptionException(NoPermissionException e) {
        log.error("权限不足: {}", e.getMessage(), e);
        return Result.fail(ResultCode.FORBIDDEN, MessageUtils.getMessage("system.forbidden"));
    }

    /**
     * 处理认证异常
     */
    @ExceptionHandler(AuthenticationException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public Result<?> handleAuthenticationException(AuthenticationException e) {
        log.error("认证异常: {}", e.getMessage(), e);
        String message = MessageUtils.getMessage("system.unauthorized");
        if (e instanceof BadCredentialsException) {
            message = MessageUtils.getMessage("auth.login.wrongcredentials");
        }
        return Result.fail(ResultCode.UNAUTHORIZED, message);
    }

    /**
     * 处理参数校验异常
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Result<?> handleMethodArgumentNotValidException(MethodArgumentNotValidException e) {
        log.error("参数校验异常: {}", e.getMessage(), e);
        return Result.fail(ResultCode.BAD_REQUEST, MessageUtils.getMessage("system.badrequest"));
    }

    /**
     * 处理绑定异常
     */
    @ExceptionHandler(BindException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Result<?> handleBindException(BindException e) {
        log.error("参数绑定异常: {}", e.getMessage(), e);
        return Result.fail(ResultCode.BAD_REQUEST, MessageUtils.getMessage("system.badrequest"));
    }

    /**
     * 处理参数校验异常
     */
    @ExceptionHandler(ConstraintViolationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Result<Void> handleValidationException(ConstraintViolationException e) {
        log.error("处理参数校验异常: {}", e.getMessage(), e);
        return Result.fail(ResultCode.VALIDATE_FAILED, MessageUtils.getMessage("system.badrequest"));
    }

    /**
     * 处理请求体解析异常
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Result<Void> handleHttpMessageNotReadableException(HttpMessageNotReadableException e) {
        log.error("处理请求体解析异常: {}", e.getMessage(), e);
        return Result.fail(ResultCode.FAILURE,MessageUtils.getMessage("system.badrequest"));
    }

    /**
     * 处理其他异常
     */
    @ExceptionHandler(TypeConversionException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public Result<?> typeConversionException(Exception e) {
        log.error("类型转换异常: {}", e.getMessage(), e);
        return Result.fail(ResultCode.FAILURE, MessageUtils.getMessage("system.servererror"));
    }

    /**
     * 处理其他异常
     */
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public Result<?> handleException(Exception e) {
        log.error("系统异常: {}", e.getMessage(), e);
        return Result.fail(ResultCode.FAILURE, MessageUtils.getMessage("system.servererror"));
    }
} 