package com.seventeen.svt.modules.system.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "获取用详情")
public class GetUserDetailsDTO {

    @Schema(description = "机构ID", example = "000000", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "机构ID不能为空")
    private String orgId;

    @Schema(description = "角色ID", example = "999999", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "角色ID不能为空")
    private String roleId;
}
