package com.seventeen.svt.modules.system.entity;

import com.mybatisflex.annotation.Column;
import com.mybatisflex.annotation.Table;
import com.seventeen.svt.common.annotation.dbkey.DistributedId;
import com.seventeen.svt.frame.listener.FlexInsertListener;
import com.seventeen.svt.frame.listener.FlexUpdateListener;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

@Table(value = "audit_log", comment = "审计日志表",
        onInsert = FlexInsertListener.class, onUpdate = FlexUpdateListener.class)
@Data
public class AuditLog implements Serializable {

    @DistributedId
    @Column(value = "audit_id", comment = "审计ID")
    private String auditId;

    @Column(value = "operation_time", comment = "操作时间")
    private LocalDateTime operationTime;

    @Column(value = "operation_ip", comment = "操作IP")
    private String operationIp;

    @Column(value = "operator_id", comment = "操作人ID")
    private String operatorId;

    @Column(value = "operator_org_id", comment = "操作机构ID")
    private String operatorOrgId;

    @Column(value = "role_id", comment = "操作角色ID")
    private String roleId;

    @Column(value = "request_params", comment = "请求参数")
    private String requestParams;

    @Column(value = "response_result", comment = "响应结果")
    private String responseResult;

    @Column(value = "operation_url", comment = "操作URL")
    private String operationUrl;

    @Column(value = "operation_desc", comment = "操作描述")
    private String operationDesc;

    @Column(value = "operation_result", comment = "操作结果(0:成功,1:失败)")
    private String operationResult;

    @Column(value = "error_msg", comment = "错误信息")
    private String errorMsg;

    @Serial
    @Column(ignore = true)
    private static final long serialVersionUID = 1L;
}