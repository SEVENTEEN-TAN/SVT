package com.seventeen.svt.frame.aspect;

import cn.hutool.core.util.ObjectUtil;
import cn.hutool.json.JSONUtil;
import com.seventeen.svt.common.annotation.audit.Audit;
import com.seventeen.svt.common.util.RequestContextUtils;
import com.seventeen.svt.common.util.SensitiveUtil;
import com.seventeen.svt.frame.cache.entity.UserDetailCache;
import com.seventeen.svt.frame.cache.util.UserDetailCacheUtils;
import com.seventeen.svt.frame.dbkey.DistributedIdGenerator;
import com.seventeen.svt.modules.system.entity.AuditLog;
import com.seventeen.svt.modules.system.service.AuditLogService;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Slf4j
@Aspect
@Component
public class AuditAspect {

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private UserDetailCacheUtils userDetailCacheUtils;

    @Autowired
    private DistributedIdGenerator distributedIdGenerator;

    @Around("@annotation(audit)")
    public Object around(ProceedingJoinPoint point, Audit audit) throws Throwable {
        // 获取原始参数
        Object[] args = point.getArgs();
        
        // 创建审计日志对象 - 先记录基本信息
        AuditLog auditLog = new AuditLog();
        auditLog.setOperationTime(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS")));
        auditLog.setOperationDesc(audit.description());
        auditLog.setOperationIp(RequestContextUtils.getIpAddress());
        auditLog.setOperationUrl(RequestContextUtils.getRequestUrl());

        // 记录请求参数
        if (audit.recordParams() && args != null && args.length > 0) {
            Object[] logArgs = args;
            if (audit.sensitive()) {
                // 深拷贝参数进行脱敏处理
                logArgs = ObjectUtil.cloneByStream(args);
                for (Object arg : logArgs) {
                    SensitiveUtil.desensitize(arg);
                }
            }
            auditLog.setRequestParams(JSONUtil.toJsonStr(logArgs));
        }

        Object result = null;
        try {
            // 先执行目标方法
            result = point.proceed();
            
            // 方法执行成功后，尝试获取用户信息
            populateUserInfo(auditLog, result, point.getSignature().getName());

            // 记录响应结果
            if (audit.recordResult() && result != null) {
                Object logResult = result;
                if (audit.sensitive()) {
                    // 深拷贝结果进行脱敏处理
                    logResult = ObjectUtil.cloneByStream(result);
                    SensitiveUtil.desensitize(logResult);
                }
                auditLog.setResponseResult(JSONUtil.toJsonStr(logResult));
            }

            auditLog.setOperationResult("0");
            return result;

        } catch (Exception e) {
            // 方法执行失败，尝试获取用户信息（但不会从结果中获取）
            populateUserInfo(auditLog, null, point.getSignature().getName());
            
            // 记录异常信息
            auditLog.setOperationResult("1");
            if (audit.recordException()) {
                String errorMsg = e.getMessage();
                // 限制错误消息长度，避免数据库字段截断
                if (errorMsg != null && errorMsg.length() > 950) {
                    errorMsg = errorMsg.substring(0, 950) + "...[截断]";
                }
                auditLog.setErrorMsg(errorMsg);
            }
            throw e;

        } finally {
            // 异步保存审计日志
            auditLogService.asyncSave(auditLog);
        }
    }

    /**
     * 填充用户信息到审计日志
     * @param auditLog 审计日志对象
     * @param result 方法执行结果
     * @param methodName 方法名称
     */
    private void populateUserInfo(AuditLog auditLog, Object result, String methodName) {
        try {
            // 其他方法，尝试从当前上下文获取用户信息
            String requestUserId = RequestContextUtils.getRequestUserId();
            UserDetailCache userDetail = userDetailCacheUtils.getUserDetail(requestUserId);
            if (ObjectUtil.isNotEmpty(userDetail)) {
                auditLog.setOperatorId(userDetail.getUserId());
                auditLog.setOperatorOrgId(userDetail.getOrgId());
                auditLog.setRoleId(userDetail.getRoleId());
            }
        } catch (Exception e) {
            // 无法获取用户信息的情况，记录为UNKNOWN
            log.debug("无法获取用户信息，记录为UNKNOWN: {}", e.getMessage());
            auditLog.setOperatorId("UNKNOWN");
            auditLog.setOperatorOrgId("UNKNOWN");
            auditLog.setRoleId("UNKNOWN");
        }
    }
}