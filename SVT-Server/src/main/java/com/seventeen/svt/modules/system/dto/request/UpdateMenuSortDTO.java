package com.seventeen.svt.modules.system.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;

/**
 * 更新菜单排序DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateMenuSortDTO implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    @Schema(description = "菜单ID", example = "000000", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "菜单ID不能为空")
    private String menuId;

    @Schema(description = "排序", example = "0", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "排序不能为空")
    private Integer sort;
}
