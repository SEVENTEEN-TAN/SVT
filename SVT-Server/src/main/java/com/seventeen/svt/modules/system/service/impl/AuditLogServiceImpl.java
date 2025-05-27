package com.seventeen.svt.modules.system.service.impl;


import com.mybatisflex.core.query.QueryWrapper;
import com.mybatisflex.spring.service.impl.ServiceImpl;
import com.seventeen.svt.common.util.TransactionUtils;
import com.seventeen.svt.modules.system.entity.AuditLog;
import com.seventeen.svt.modules.system.mapper.AuditLogMapper;
import com.seventeen.svt.modules.system.service.AuditLogService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import static com.seventeen.svt.modules.system.entity.table.Tables.AUDIT_LOG;

/**

* 针对表【audit_log(审计日志表)】的数据库操作Service实现
*/
@Service
@Slf4j
public class AuditLogServiceImpl extends ServiceImpl<AuditLogMapper, AuditLog>
    implements AuditLogService{

    @Async("auditLogExecutor")
    @Override
    public void asyncSave(AuditLog auditLog) {
        try {
            this.save(auditLog);
        } catch (Exception e) {
            log.error("异步保存审计日志失败: {}", e.getMessage(), e);
        }
    }

    @Override
    public void deleteAuditTest(String auditId) {
        log.debug(TransactionUtils.getTransactionStatus());
        QueryWrapper sqlWrapper = QueryWrapper.create()
                .from(AUDIT_LOG)
                .where(AUDIT_LOG.AUDIT_ID.eq(auditId));
        mapper.deleteByQuery(sqlWrapper);
    }

}




