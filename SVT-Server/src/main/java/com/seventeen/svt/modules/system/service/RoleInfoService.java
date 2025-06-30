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
     * 获取角色用户列表
     *
     * @param roleId 角色ID
     * @return 角色用户列表
     */
    List<UserDetailDTO> getRoleUserList(String roleId);
}
