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

        // 创建审计日志对象
        AuditLog auditLog = new AuditLog();
        auditLog.setOperationTime(LocalDateTime.now());
        auditLog.setOperationDesc(audit.description());

        // 获取请求信息
        auditLog.setOperationIp(RequestContextUtils.getIpAddress());
        auditLog.setOperationUrl(RequestContextUtils.getRequestUrl());

        // 获取当前用户信息
        String requestUserId = RequestContextUtils.getRequestUserId();
        UserDetailCache userDetail = userDetailCacheUtils.getUserDetail(requestUserId);
        if (ObjectUtil.isNotEmpty(userDetail)) {
            auditLog.setOperatorId(userDetail.getUserId());
            auditLog.setOperatorOrgId(userDetail.getOrgId());
            auditLog.setRoleId(userDetail.getRoleId());
        }

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

        try {
            // 执行目标方法
            Object result = point.proceed();

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
            // 记录异常信息
            auditLog.setOperationResult("1");
            if (audit.recordException()) {
                auditLog.setErrorMsg(e.getMessage());
            }
            throw e;

        } finally {
            // 异步保存审计日志,传递已设置好的创建人信息
            auditLogService.asyncSave(auditLog);
        }
    }
}