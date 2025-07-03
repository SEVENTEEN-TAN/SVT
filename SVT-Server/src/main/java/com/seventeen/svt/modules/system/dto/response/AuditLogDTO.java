package com.seventeen.svt.modules.system.dto.response;

import com.seventeen.svt.frame.cache.util.OrgInfoCacheUtils;
import com.seventeen.svt.frame.cache.util.UserInfoCacheUtils;
import com.seventeen.svt.modules.system.entity.OrgInfo;
import com.seventeen.svt.modules.system.entity.UserInfo;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "审计日志DTO")
public class AuditLogDTO {

    @Schema(description = "审计ID")
    private String auditId;

    @Schema(description = "操作时间")
    private String operationTime;

    @Schema(description = "操作IP")
    private String operationIp;

    @Schema(description = "操作人ID")
    private String operatorId;

    @Schema(description = "操作人名称")
    private String operatorNameZh;

    public String getOperatorNameZh() {
        return UserInfoCacheUtils.getUserFieldValue(operatorId, UserInfo::getUserNameZh);
    }

    @Schema(description = "操作人英文名称")
    private String operatorNameEn;

    public String getOperatorNameEn() {
        return UserInfoCacheUtils.getUserFieldValue(operatorId, UserInfo::getUserNameEn);
    }

    @Schema(description = "操作机构ID")
    private String operatorOrgId;

    @Schema(description = "操作机构中文名称")
    private String operatorOrgNameZh;

    public String getOperatorOrgNameZh() {
        return OrgInfoCacheUtils.getOrgFieldValue(operatorOrgId, OrgInfo::getOrgNameZh);
    }

    @Schema(description = "操作机构英文名称")
    private String operatorOrgNameEn;

    public String getOperatorOrgNameEn() {
        return OrgInfoCacheUtils.getOrgFieldValue(operatorOrgId, OrgInfo::getOrgNameEn);
    }

    @Schema(description = "角色ID")
    private String roleId;

    @Schema(description = "角色中文名称")
    private String roleNameZh;

    public String getRoleNameZh() {
//       TODO:  return RoleInfoCacheUtils.getRoleFieldValue(roleId, RoleInfo::getRoleNameZh);
        return null;
    }

    @Schema(description = "角色英文名称")
    private String roleNameEn;

    public String getRoleNameEn() {
//       TODO:  return RoleInfoCacheUtils.getRoleFieldValue(roleId, RoleInfo::getRoleNameEn);
        return null;
    }

    @Schema(description = "请求参数")
    private String requestParams;

    @Schema(description = "响应结果")
    private String responseResult;

    @Schema(description = "操作URL")
    private String operationUrl;

    @Schema(description = "操作描述")
    private String operationDesc;

    @Schema(description = "操作结果(0:成功,1:失败)")
    private String operationResult;

    @Schema(description = "错误信息")
    private String errorMsg;
}
