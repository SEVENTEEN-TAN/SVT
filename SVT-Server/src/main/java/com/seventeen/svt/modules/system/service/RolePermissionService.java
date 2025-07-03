package com.seventeen.svt.modules.system.service;

import com.mybatisflex.core.service.IService;
import com.seventeen.svt.modules.system.entity.PermissionInfo;
import com.seventeen.svt.modules.system.entity.RolePermission;

import java.util.List;

/**
* 针对表【role_permission(角色权限关联表)】的数据库操作Service
*/
public interface RolePermissionService extends IService<RolePermission> {

    /**
     * 根据角色ID获取权限配置列表
     * @param roleId 角色ID
     * @return 权限列表
     */
    List<PermissionInfo> selectPermissionListByRoleId(String roleId);

    /**
     * 批量插入角色权限关联
     * @param permissionIds 权限ID列表
     * @param roleId 角色ID
     */
    void batchInsertRolePermission(List<String> permissionIds, String roleId);
}
