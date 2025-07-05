package com.seventeen.svt.modules.system.entity;

import com.mybatisflex.annotation.Column;
import com.mybatisflex.annotation.Table;
import com.seventeen.svt.common.annotation.field.AutoFill;
import com.seventeen.svt.common.annotation.field.FillType;
import com.seventeen.svt.common.annotation.field.OperationType;
import lombok.Data;

/**
 * 用户-机构-角色关联实体
 * 实现用户在不同机构下可以拥有不同角色的多对多关系
 */
@Data
@Table(value = "user_org_role", comment = "用户-机构-角色关联表")
public class UserOrgRole {

    /**
     * 用户ID
     */
    @Column(value = "user_id", comment = "用户ID")
    private String userId;

    /**
     * 机构ID
     */
    @Column(value = "org_id", comment = "机构ID")
    private String orgId;

    /**
     * 角色ID
     */
    @Column(value = "role_id", comment = "角色ID")
    private String roleId;

    /**
     * 是否默认角色（0：否，1：是）
     */
    @Column(value = "is_default", comment = "是否默认角色")
    private String isDefault;

    /**
     * 状态（0：正常，1：停用）
     */
    @Column(value = "status", comment = "状态")
    private String status;

    /**
     * 删除标志（0：存在，1：删除）
     */
    @Column(value = "del_flag", comment = "删除标志")
    private String delFlag;

    /**
     * 创建者
     */
    @AutoFill(type = FillType.USER_ID, operation = OperationType.INSERT)
    @Column(value = "create_by", comment = "创建者")
    private String createBy;

    /**
     * 创建者机构ID
     */
    @AutoFill(type = FillType.ORG_ID, operation = OperationType.INSERT)
    @Column(value = "create_org_id", comment = "创建者机构ID")
    private String createOrgId;

    /**
     * 创建时间
     */
    @AutoFill(type = FillType.TIME, operation = OperationType.INSERT)
    @Column(value = "create_time", comment = "创建时间")
    private String createTime;

    /**
     * 更新者
     */
    @AutoFill(type = FillType.USER_ID, operation = OperationType.UPDATE)
    @Column(value = "update_by", comment = "更新者")
    private String updateBy;

    /**
     * 更新者机构ID
     */
    @AutoFill(type = FillType.ORG_ID, operation = OperationType.UPDATE)
    @Column(value = "update_org_id", comment = "更新者机构ID")
    private String updateOrgId;

    /**
     * 更新时间
     */
    @AutoFill(type = FillType.TIME, operation = OperationType.UPDATE)
    @Column(value = "update_time", comment = "更新时间")
    private String updateTime;

    /**
     * 备注
     */
    @Column(value = "remark", comment = "备注")
    private String remark;
}