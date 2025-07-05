package com.seventeen.svt.modules.system.service;

import com.mybatisflex.core.service.IService;
import com.seventeen.svt.modules.system.entity.MenuInfo;
import com.seventeen.svt.modules.system.entity.RoleMenu;

import java.util.List;

/**
* 针对表【role_menu(菜单角色关联表)】的数据库操作Service
*/
public interface RoleMenuService extends IService<RoleMenu> {

    /**
     * 根据角色ID获取菜单列表
     * @param roleId 角色ID
     * @return 菜单列表
     */
    List<MenuInfo> selectMenuListByRoleId(String roleId);

    /**
     * 根据角色ID删除角色菜单关联
     * @param roleId 角色ID
     */
    void deleteRoleMenuByRoleId(String roleId);

    /**
     * 根据菜单ID删除角色菜单关联
     * @param menuId 菜单ID
     */
    void deleteRoleMenuByMenuId(String menuId);

    /**
     * 批量插入角色菜单关联
     * @param RoleIdList 角色ID列表
     * @param menuId 菜单ID
     */
    void batchInsertRoleMenu(List<String> RoleIdList, String menuId);
}
