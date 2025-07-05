package com.seventeen.svt.modules.system.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;
import java.util.List;

/**
 * 用户机构角色分配DTO
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "用户机构角色分配DTO")
public class UserOrgRoleAssignDTO implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    @Schema(description = "用户ID", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "用户ID不能为空")
    private String userId;

    @Schema(description = "机构角色关联列表", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotEmpty(message = "机构角色关联列表不能为空")
    private List<OrgRoleRelation> orgRoleRelations;

    /**
     * 机构角色关联
     */
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Schema(description = "机构角色关联")
    public static class OrgRoleRelation implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;

        @Schema(description = "机构ID", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank(message = "机构ID不能为空")
        private String orgId;

        @Schema(description = "角色ID列表", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotEmpty(message = "角色ID列表不能为空")
        private List<String> roleIds;
    }
}