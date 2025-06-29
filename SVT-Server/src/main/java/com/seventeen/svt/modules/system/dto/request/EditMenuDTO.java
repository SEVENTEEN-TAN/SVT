package com.seventeen.svt.modules.system.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;
import java.util.List;

/**
 * 编辑菜单DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EditMenuDTO implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    @Schema(description = "菜单ID", example = "000000")
    private String menuId;

    @Schema(description = "父菜单ID", example = "000000")
    private String parentId;

    @Schema(description = "菜单中文名称", example = "系统管理")
    private String menuNameZh;

    @Schema(description = "菜单英文名称", example = "System Management")
    private String menuNameEn;

    @Schema(description = "菜单路径", example = "/system")
    private String menuPath;

    @Schema(description = "菜单图标", example = "setting")
    private String menuIcon;

    @Schema(description = "显示顺序", example = "1")
    private String menuSort;

    @Schema(description = "状态", example = "0")
    private String status;

    @Schema(description = "备注", example = "备注")
    private String remark;

    @Schema(description = "关联角色ID列表", example = "000000,000001")
    private List<String> roleIds;
}
