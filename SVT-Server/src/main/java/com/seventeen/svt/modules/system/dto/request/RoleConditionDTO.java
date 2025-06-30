package com.seventeen.svt.modules.system.dto.request;


import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;

/**
 * 获取角色列表DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoleConditionDTO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Schema(description = "角色ID", example = "000000")
    private String roleId;

    @Schema(description = "角色编码", example = "admin")
    private String roleCode;

    @Schema(description = "角色中文名称", example = "管理员")
    private String roleNameZh;

    @Schema(description = "角色英文名称", example = "Administrator")
    private String roleNameEn;

    @Schema(description = "状态", example = "0")
    private String status;

}
