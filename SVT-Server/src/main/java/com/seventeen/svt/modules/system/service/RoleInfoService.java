package com.seventeen.svt.modules.system.service;

import com.mybatisflex.core.service.IService;
import com.seventeen.svt.common.page.PageQuery;
import com.seventeen.svt.common.page.PageResult;
import com.seventeen.svt.modules.system.dto.request.InsertOrUpdateRoleDetailDTO;
import com.seventeen.svt.modules.system.dto.request.RoleConditionDTO;
import com.seventeen.svt.modules.system.dto.response.RoleDetailDTO;
import com.seventeen.svt.modules.system.dto.response.UserDetailDTO;
import com.seventeen.svt.modules.system.entity.RoleInfo;

import java.util.List;

/**
 * 针对表【role_info(角色表)】的数据库操作Service
 */
public interface RoleInfoService extends IService<RoleInfo> {

    /**
     * 根据角色ID获取角色详情
     *
     * @param roleId 角色ID
     * @return 角色详情
     */
    RoleInfo selectRoleInfoByRoleId(String roleId);

    /**
     * 根据角色ID列表获取角色信息列表
     *
     * @param roleIds 角色ID列表
     * @return 角色信息列表
     */
    List<RoleInfo> selectRoleInfoByRoleIds(List<String> roleIds);

    /**
     * 获取角色列表
     *
     * @return PageResult<GetRoleListDTO>角色列表
     */
    PageResult<RoleDetailDTO> getRoleList(PageQuery<RoleConditionDTO> getRoleListConditionDTO);

    /**
     * 获取启用的角色列表
     *
     * @return List<GetRoleListDTO> 角色列表
     */
    List<RoleDetailDTO> getActiveRoleList();

    /**
     * 获取角色详情
     *
     * @param roleId 角色ID
     * @return 角色详情
     */
    RoleDetailDTO getRoleDetail(String roleId);

    /**
     * 编辑角色
     *
     * @param editRoleDetailDTO 编辑角色DTO
     */
    void insertOrUpdateRole(InsertOrUpdateRoleDetailDTO editRoleDetailDTO);

    /**
     * 更新角色状态
     *
     * @param roleId 角色ID
     * @param status 状态（0：启用，1：停用）
     */
    void updateRoleStatus(String roleId, String status);

    /**
     * 删除角色
     *
     * @param roleId 角色ID
     */
    void deleteRole(String roleId);

    /**
     * 批量更新角色状态
     *
     * @param roleIds 角色ID列表
     * @param status 状态（0：启用，1：停用）
     */
    void batchUpdateStatus(List<String> roleIds, String status);

//    /**
//     * 批量删除角色
//     *
//     * @param roleIds 角色ID列表
//     */
//    void batchDelete(List<String> roleIds);
//
//    /**
//     * 获取角色关联的用户ID列表
//     *
//     * @param roleId 角色ID
//     * @return 用户ID列表
//     */
//    List<String> getRoleUserList(String roleId);
//
//    /**
//     * 获取角色关联的用户详细信息列表
//     *
//     * @param roleId 角色ID
//     * @return 用户详细信息列表
//     */
//    List<UserDetailDTO> getRoleUserDetailList(String roleId);

//    /**
//     * 获取角色关联的权限列表
//     *
//     * @param roleId 角色ID
//     * @return 权限详细信息列表
//     */
//    List<com.seventeen.svt.modules.system.dto.response.PermissionDetailDTO> getRolePermissionList(String roleId);

//    /**
//     * 分配角色权限
//     *
//     * @param roleId 角色ID
//     * @param permissionIds 权限ID列表
//     */
//    void assignRolePermissions(String roleId, List<String> permissionIds);
//
//    /**
//     * 获取所有权限列表
//     *
//     * @return 权限详细信息列表
//     */
//    List<com.seventeen.svt.modules.system.dto.response.PermissionDetailDTO> getAllPermissions();
//
//    /**
//     * 分配角色用户
//     *
//     * @param roleId 角色ID
//     * @param userIds 用户ID列表
//     */
//    void assignRoleUsers(String roleId, List<String> userIds);
}
