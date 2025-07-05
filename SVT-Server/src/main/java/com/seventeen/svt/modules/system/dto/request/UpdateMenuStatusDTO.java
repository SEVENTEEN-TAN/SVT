package com.seventeen.svt.modules.system.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;
import java.util.List;

/**
 * 更新菜单状态DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateMenuStatusDTO implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    @Schema(description = "菜单ID列表", example = "000000,000001", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "菜单ID不能为空")
    private List<String> menuIds;

    @Schema(description = "状态", example = "0", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "状态不能为空")
    private String status;
}
