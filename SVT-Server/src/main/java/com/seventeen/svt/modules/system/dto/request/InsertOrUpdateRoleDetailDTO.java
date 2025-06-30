package com.seventeen.svt.modules.system.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class InsertOrUpdateRoleDetailDTO implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    @Schema(description = "角色ID")
    private String roleId;

    @Schema(description = "角色编码")
    private String roleCode;

    @Schema(description = "角色中文名称")
    private String roleNameZh;

    @Schema(description = "角色英文名称")
    private String roleNameEn;

    @Schema(description = "显示顺序")
    private String roleSort;

    @Schema(description = "状态")
    private String status;

    @Schema(description = "备注")
    private String remark;

}
