package com.seventeen.svt.modules.system.service;

import com.mybatisflex.core.service.IService;
import com.seventeen.svt.modules.system.dto.response.OrgDetailDTO;
import com.seventeen.svt.modules.system.dto.response.RoleDetailDTO;
import com.seventeen.svt.modules.system.entity.UserOrgRole;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

/**
 * 用户-机构-角色关联服务接口
 */
public interface UserOrgRoleService extends IService<UserOrgRole> {

    /**
     * 获取用户可访问的机构列表
     *
     * @param userId 用户ID
     * @return 机构列表
     */
    List<OrgDetailDTO> getUserOrgListByUserId(String userId);

    /**
     * 获取用户在指定机构下的角色列表
     *
     * @param userId 用户ID
     * @param orgId 机构ID
     * @return 角色列表
     */
    List<RoleDetailDTO> getUserRoleListByUserId(String userId, String orgId);
}