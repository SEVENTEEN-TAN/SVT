package com.seventeen.svt.modules.system.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "用户机构列表")
public class GetUserOrgVO {

    @Schema(description = "机构列表")
    private List<UserOrgInfo> orgInfos;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UserOrgInfo{

        @Schema(description = "机构ID")
        private String orgId;

        @Schema(description = "机构Key)")
        private String orgKey;

        @Schema(description = "机构中文名称")
        private String orgNameZh;

        @Schema(description = "机构英文名称")
        private String orgNameEn;

        @Schema(description = "上一级机构ID")
        private String parentId;

        @Schema(description = "机构类型")
        private String orgType;

        @Schema(description = "备注")
        private String remark;

    }

}
