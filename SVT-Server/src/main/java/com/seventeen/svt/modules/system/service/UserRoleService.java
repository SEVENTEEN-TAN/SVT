package com.seventeen.svt.modules.system.service;

import com.mybatisflex.core.service.IService;
import com.seventeen.svt.modules.system.dto.response.RoleDetailDTO;
import com.seventeen.svt.modules.system.entity.UserRole;

import java.util.List;

/**
 * 针对表【user_role(用户角色关联表)】的数据库操作Service
 */
public interface UserRoleService extends IService<UserRole> {

    /**
     * 根据用户ID查询用户角色列表
     *
     * @param userId 用户ID
     * @return 用户角色列表
     */
    List<RoleDetailDTO> getUserRoleListByUserId(String userId);
}
