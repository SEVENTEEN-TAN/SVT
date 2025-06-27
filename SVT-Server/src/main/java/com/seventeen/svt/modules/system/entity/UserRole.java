package com.seventeen.svt.modules.system.entity;

import com.mybatisflex.annotation.Column;
import com.mybatisflex.annotation.Table;
import com.seventeen.svt.common.annotation.field.AutoFill;
import com.seventeen.svt.common.annotation.field.FillType;
import com.seventeen.svt.common.annotation.field.OperationType;
import com.seventeen.svt.frame.handler.StringToDateTimeTypeHandler;
import com.seventeen.svt.frame.listener.FlexInsertListener;
import com.seventeen.svt.frame.listener.FlexUpdateListener;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Table(value = "user_role", comment = "用户角色关联表",
        onInsert = FlexInsertListener.class, onUpdate = FlexUpdateListener.class)
@Data
public class UserRole implements Serializable {

    @Column(value = "user_id", comment = "用户ID")
    private String userId;

    @Column(value = "role_id", comment = "角色ID")
    private String roleId;

    @Column(value = "status", comment = "状态（0：正常，1：停用）")
    private String status;

    @Column(value = "del_flag", comment = "删除标志（0：存在，1：删除）", isLogicDelete = true)
    private String delFlag;

    @AutoFill(type = FillType.USER_ID, operation = OperationType.INSERT)
    @Column(value = "create_by", comment = "创建者")
    private String createBy;

    @AutoFill(type = FillType.ORG_ID, operation = OperationType.INSERT)
    @Column(value = "create_org_id", comment = "创建者机构ID")
    private String createOrgId;

    @AutoFill(type = FillType.TIME, operation = OperationType.INSERT)
    @Column(value = "create_time", comment = "创建时间", typeHandler = StringToDateTimeTypeHandler.class)
    private String createTime;

    @AutoFill(type = FillType.USER_ID, operation = OperationType.UPDATE)
    @Column(value = "update_by", comment = "更新者")
    private String updateBy;

    @AutoFill(type = FillType.ORG_ID, operation = OperationType.UPDATE)
    @Column(value = "update_org_id", comment = "更新者机构ID")
    private String updateOrgId;

    @AutoFill(type = FillType.TIME, operation = OperationType.UPDATE)
    @Column(value = "update_time", comment = "更新时间", typeHandler = StringToDateTimeTypeHandler.class)
    private String updateTime;

    @Column(value = "remark", comment = "备注")
    private String remark;

    @Serial
    @Column(ignore = true)
    private static final long serialVersionUID = 1L;
}