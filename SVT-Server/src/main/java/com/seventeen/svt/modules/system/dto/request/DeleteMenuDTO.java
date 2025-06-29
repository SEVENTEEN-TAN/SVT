package com.seventeen.svt.modules.system.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 删除菜单DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeleteMenuDTO {

    /**
     * 菜单ID
     */
    @Schema(description = "菜单ID", example = "000000", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "菜单ID不能为空")
    private String menuId;
}
