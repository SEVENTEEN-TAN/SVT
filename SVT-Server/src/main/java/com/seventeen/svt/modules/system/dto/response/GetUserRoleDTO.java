package com.seventeen.svt.modules.system.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "用户权限列表")
public class GetUserRoleDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    @Schema(description = "权限列表")
    private List<UserRoleInfo> userRoleInfos;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UserRoleInfo implements Serializable {

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

        @Schema(description = "备注")
        private String remark;
    }
}
