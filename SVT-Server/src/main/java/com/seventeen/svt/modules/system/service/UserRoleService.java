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

    /**
     * 根据用户ID查询用户角色ID列表
     *
     * @param userId 用户ID
     * @return 角色ID列表
     */
    List<String> getUserRoleIdsByUserId(String userId);

    /**
     * 删除用户的所有角色关联
     *
     * @param userId 用户ID
     */
    void deleteUserRolesByUserId(String userId);

    /**
     * 为用户添加角色关联
     *
     * @param userId 用户ID
     * @param roleIds 角色ID列表
     */
    void addUserRoles(String userId, List<String> roleIds);

    /**
     * 删除角色的所有用户关联
     *
     * @param roleId 角色ID
     */
    void deleteRoleUsersByRoleId(String roleId);

    /**
     * 为角色添加用户关联
     *
     * @param roleId 角色ID
     * @param userIds 用户ID列表
     */
    void addRoleUsers(String roleId, List<String> userIds);
}
