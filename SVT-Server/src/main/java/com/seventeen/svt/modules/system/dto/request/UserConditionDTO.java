package com.seventeen.svt.modules.system.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;

/**
 * 用户查询条件DTO
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "用户查询条件DTO")
public class UserConditionDTO implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    @Schema(description = "用户ID")
    private String userId;

    @Schema(description = "登录ID")
    private String loginId;

    @Schema(description = "用户中文名称")
    private String userNameZh;

    @Schema(description = "用户英文名称")
    private String userNameEn;

    @Schema(description = "状态（0：启用，1：停用）")
    private String status;

    @Schema(description = "创建者")
    private String createBy;

    @Schema(description = "创建机构ID")
    private String createOrgId;

    @Schema(description = "创建时间开始")
    private String createTimeStart;

    @Schema(description = "创建时间结束")
    private String createTimeEnd;

    @Schema(description = "角色ID（查询拥有指定角色的用户）")
    private String roleId;

    @Schema(description = "机构ID（查询属于指定机构的用户）")
    private String orgId;
}