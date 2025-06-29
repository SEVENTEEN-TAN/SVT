package com.seventeen.svt.modules.system.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 获取角色列表DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GetRoleListDTO {

    @Schema(description = "角色ID", example = "000000", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "角色ID不能为空")
    private String roleId;

    @Schema(description = "角色编码", example = "admin", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "角色编码不能为空")
    private String roleCode;

    @Schema(description = "角色中文名称", example = "管理员", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "角色中文名称不能为空")
    private String roleNameZh;

    @Schema(description = "角色英文名称", example = "Administrator", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "角色英文名称不能为空")
    private String roleNameEn;

    @Schema(description = "状态", example = "0", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "状态不能为空")
    private String status;

    @Schema(description = "备注", example = "备注")
    private String remark;

    @Schema(description = "显示顺序", example = "1")
    private String roleSort;
}
