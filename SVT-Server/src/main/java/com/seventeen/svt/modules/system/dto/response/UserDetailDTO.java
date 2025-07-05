package com.seventeen.svt.modules.system.dto.response;

import com.seventeen.svt.frame.cache.util.OrgInfoCacheUtils;
import com.seventeen.svt.frame.cache.util.UserInfoCacheUtils;
import com.seventeen.svt.modules.system.entity.OrgInfo;
import com.seventeen.svt.modules.system.entity.UserInfo;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserDetailDTO implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    @Schema(description = "用户ID")
    private String userId;

    @Schema(description = "登录ID")
    private String loginId;

    @Schema(description = "用户中文名称")
    private String userNameZh;

    @Schema(description = "用户英文名称")
    private String userNameEn;

    @Schema(description = "状态")
    private String status;

    @Schema(description = "创建者")
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

    @Schema(description = "用户角色列表（显示用）")
    private String roleNames;

    @Schema(description = "用户机构列表（显示用）")
    private String orgNames;
}
