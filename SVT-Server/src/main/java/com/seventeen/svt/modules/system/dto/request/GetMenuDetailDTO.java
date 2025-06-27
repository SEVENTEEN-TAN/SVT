package com.seventeen.svt.modules.system.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 获取菜单详情请求DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GetMenuDetailDTO {

    /**
     * 菜单ID
     */
    @Schema(description = "菜单ID", example = "000000", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "菜单ID不能为空")
    private String menuId;
}
