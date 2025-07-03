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

@Table(value = "code_library", comment = "码值库表",
        onInsert = FlexInsertListener.class, onUpdate = FlexUpdateListener.class)
@Data
public class CodeLibrary implements Serializable {

    @Column(value = "code_type", comment = "码值类型")
    private String codeType;

    @Column(value = "code_value", comment = "码值")
    private String codeValue;

    @Column(value = "code_name", comment = "码值名称")
    private String codeName;

    @Column(value = "code_sort", comment = "显示顺序")
    private Integer codeSort;

    @Column(value = "code_desc", comment = "码值描述")
    private String codeDesc;

    @Column(value = "attribute1", comment = "拓展字段1")
    private String attribute1;

    @Column(value = "attribute2", comment = "拓展字段2")
    private String attribute2;

    @Column(value = "attribute3", comment = "拓展字段3")
    private String attribute3;

    @Column(value = "attribute4", comment = "拓展字段4")
    private String attribute4;

    @Column(value = "attribute5", comment = "拓展字段5")
    private String attribute5;

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