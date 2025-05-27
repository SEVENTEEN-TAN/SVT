package com.seventeen.svt.modules.system.service;

import com.mybatisflex.core.service.IService;
import com.seventeen.svt.modules.system.entity.AuditLog;

/**
* 针对表【audit_log(审计日志表)】的数据库操作Service
*/
public interface AuditLogService extends IService<AuditLog> {

    /**
     * 异步保存审计日志
     * @param auditLog 审计日志
     */
    void asyncSave(AuditLog auditLog);

    /**
     * 删除审计日志
     * @param auditId 审计日志ID
     */
    void deleteAuditTest(String auditId);
}
