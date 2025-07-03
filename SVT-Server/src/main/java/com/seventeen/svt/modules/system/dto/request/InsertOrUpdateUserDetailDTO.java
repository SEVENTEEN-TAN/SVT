package com.seventeen.svt.modules.system.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.io.Serial;
import java.io.Serializable;
import java.util.List;

/**
 * 用户新增/编辑DTO
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "用户新增/编辑DTO")
public class InsertOrUpdateUserDetailDTO implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    @Schema(description = "用户ID（编辑时必填）")
    private String userId;

    @Schema(description = "登录ID", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "登录ID不能为空")
    @Size(min = 3, max = 32, message = "登录ID长度必须在3-32位之间")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "登录ID只能包含字母、数字和下划线")
    private String loginId;

    @Schema(description = "密码（新增时必填，编辑时选填）")
    @Size(min = 6, max = 20, message = "密码长度必须在6-20位之间")
    private String password;

    @Schema(description = "用户中文名称", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "用户中文名称不能为空")
    @Size(max = 50, message = "用户中文名称长度不能超过50位")
    private String userNameZh;

    @Schema(description = "用户英文名称")
    @Size(max = 50, message = "用户英文名称长度不能超过50位")
    private String userNameEn;

    @Schema(description = "状态（0：启用，1：停用）", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "状态不能为空")
    @Pattern(regexp = "^[01]$", message = "状态值只能是0或1")
    private String status;

    @Schema(description = "备注")
    @Size(max = 500, message = "备注长度不能超过500位")
    private String remark;

    @Schema(description = "角色ID列表")
    private List<String> roleIds;

    @Schema(description = "机构ID列表")
    private List<String> orgIds;

    @Schema(description = "主机构ID")
    private String primaryOrgId;
}