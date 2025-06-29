package com.seventeen.svt.modules.system.dto.response;

import com.seventeen.svt.frame.cache.util.OrgInfoCacheUtils;
import com.seventeen.svt.frame.cache.util.UserInfoCacheUtils;
import com.seventeen.svt.modules.system.entity.OrgInfo;
import com.seventeen.svt.modules.system.entity.UserInfo;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GetMenuDetail implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    @Schema(description = "菜单ID")
    private String menuId;

    @Schema(description = "父菜单ID")
    private String parentId;

    @Schema(description = "菜单中文名称")
    private String menuNameZh;

    @Schema(description = "菜单英文名称")
    private String menuNameEn;

    @Schema(description = "菜单路径")
    private String menuPath;

    @Schema(description = "菜单图标")
    private String menuIcon;

    @Schema(description = "菜单排序")
    private String menuSort;

    @Schema(description = "状态")
    private String status;

    @Schema(description = "创建者ID")
    private String createBy;

    @Schema(description = "创建者中文名称")
    private String createByNameZh;

    public String getCreateByNameZh() {
        return UserInfoCacheUtils.getUserFieldValue(createBy, UserInfo::getUserNameZh);
    }

    @Schema(description = "创建者英文名称")
    private String createByNameEn;

    public String getCreateByNameEn() {
        return UserInfoCacheUtils.getUserFieldValue(createBy, UserInfo::getUserNameEn);
    }

    @Schema(description = "创建者机构ID")
    private String createOrgId;

    @Schema(description = "创建者机构中文名称")
    private String createOrgNameZh;

    public String getCreateOrgNameZh() {
        return OrgInfoCacheUtils.getOrgFieldValue(createOrgId, OrgInfo::getOrgNameZh);
    }

    @Schema(description = "创建者机构英文名称")
    private String createOrgNameEn;

    public String getCreateOrgNameEn() {
        return OrgInfoCacheUtils.getOrgFieldValue(createOrgId, OrgInfo::getOrgNameEn);
    }

    @Schema(description = "创建时间")
    private String createTime;

    @Schema(description = "更新者")
    private String updateBy;

    @Schema(description = "更新者中文名称")
    private String updateByNameZh;

    public String getUpdateByNameZh() {
        return UserInfoCacheUtils.getUserFieldValue(updateBy, UserInfo::getUserNameZh);
    }

    @Schema(description = "更新者英文名称")
    private String updateByNameEn;

    public String getUpdateByNameEn() {
        return UserInfoCacheUtils.getUserFieldValue(updateBy, UserInfo::getUserNameEn);
    }

    @Schema(description = "更新者机构ID")
    private String updateOrgId;

    @Schema(description = "更新者机构中文名称")
    private String updateOrgNameZh;

    public String getUpdateOrgNameZh() {
        return OrgInfoCacheUtils.getOrgFieldValue(updateOrgId, OrgInfo::getOrgNameZh);
    }

    @Schema(description = "更新者机构英文名称")
    private String updateOrgNameEn;

    public String getUpdateOrgNameEn() {
        return OrgInfoCacheUtils.getOrgFieldValue(updateOrgId, OrgInfo::getOrgNameEn);
    }

    @Schema(description = "更新时间")
    private String updateTime;

    @Schema(description = "备注")
    private String remark;

    @Schema(description = "角色菜单关联列表")
    private List<RoleInfo> roleList;

    @Data
    public static class RoleInfo implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;

        @Schema(description = "角色ID")
        private String roleId;

        @Schema(description = "角色中文名称")
        private String roleNameZh;

        @Schema(description = "角色英文名称")
        private String roleNameEn;
    }
}
