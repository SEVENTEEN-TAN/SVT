package com.seventeen.svt.modules.system.entity;

import com.mybatisflex.annotation.Column;
import com.mybatisflex.annotation.Table;
import com.seventeen.svt.common.annotation.dbkey.DistributedId;
import com.seventeen.svt.common.annotation.field.AutoFill;
import com.seventeen.svt.common.annotation.field.FillType;
import com.seventeen.svt.common.annotation.field.OperationType;
import com.seventeen.svt.frame.listener.FlexInsertListener;
import com.seventeen.svt.frame.listener.FlexUpdateListener;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

@Table(value = "org_info", comment = "机构表",
        onInsert = FlexInsertListener.class, onUpdate = FlexUpdateListener.class)
@Data
public class OrgInfo implements Serializable {

    @DistributedId
    @Column(value = "org_id", comment = "机构ID")
    private String orgId;

    @Column(value = "org_key", comment = "机构关键字")
    private String orgKey;

    @Column(value = "org_name_zh", comment = "机构中文名称")
    private String orgNameZh;

    @Column(value = "org_name_en", comment = "机构英文名称")
    private String orgNameEn;

    @Column(value = "parent_id", comment = "父机构ID")
    private String parentId;

    @Column(value = "org_type", comment = "机构类型（1：总部，2：分部，3：支部，4：组）")
    private String orgType;

    @Column(value = "org_sort", comment = "机构排序")
    private String orgSort;

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
    @Column(value = "create_time", comment = "创建时间")
    private LocalDateTime createTime;

    @AutoFill(type = FillType.USER_ID, operation = OperationType.UPDATE)
    @Column(value = "update_by", comment = "更新者")
    private String updateBy;

    @AutoFill(type = FillType.ORG_ID, operation = OperationType.UPDATE)
    @Column(value = "update_org_id", comment = "更新者机构ID")
    private String updateOrgId;

    @AutoFill(type = FillType.TIME, operation = OperationType.UPDATE)
    @Column(value = "update_time", comment = "更新时间")
    private LocalDateTime updateTime;

    @Column(value = "remark", comment = "备注")
    private String remark;

    @Serial
    @Column(ignore = true)
    private static final long serialVersionUID = 1L;
}