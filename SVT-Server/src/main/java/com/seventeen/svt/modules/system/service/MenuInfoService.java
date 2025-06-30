package com.seventeen.svt.modules.system.service;

import com.mybatisflex.core.service.IService;
import com.seventeen.svt.common.page.PageQuery;
import com.seventeen.svt.common.page.PageResult;
import com.seventeen.svt.common.util.TreeUtils;
import com.seventeen.svt.modules.system.dto.request.*;
import com.seventeen.svt.modules.system.dto.response.MenuDetailDTO;
import com.seventeen.svt.modules.system.dto.response.RoleDetailDTO;
import com.seventeen.svt.modules.system.entity.MenuInfo;

import java.util.List;

/**
* 针对表【menu_info(菜单表)】的数据库操作Service
*/
public interface MenuInfoService extends IService<MenuInfo> {

    /**
     * 获取所有菜单树
     * @return 菜单树
     */
    List<TreeUtils.MenuTreeVO> getAllMenuTree();

    /**
     * 更新菜单状态
     * @param updateMenuStatusDTO 更新菜单状态DTO
     */
    void updateMenuStatus(UpdateMenuStatusDTO updateMenuStatusDTO);

    /**
     * 更新菜单排序
     * @param updateMenuSortDTO 更新菜单排序DTO
     */
    void updateMenuSort(UpdateMenuSortDTO updateMenuSortDTO);

    /**
     * 编辑菜单
     * @param insertOrUpdateMenuDTO 编辑菜单DTO
     */
    void insertOrUpdateMenu(InsertOrUpdateMenuDTO insertOrUpdateMenuDTO);

    /**
     * 获取菜单详情
     * @param menuIdStr 菜单ID
     * @return 菜单详情
     */
    MenuDetailDTO getMenuDetail(String menuIdStr);

    /**
     * 删除菜单
     * @param menuIdStr 删除菜单DTO
     */
    void deleteMenu(String menuIdStr);

    /**
     * 获取菜单角色列表
     * @param menuIdConditionDTO 菜单ID
     * @return 菜单角色列表
     */
    List<RoleDetailDTO> getMenuRoleList(MenuConditionDTO menuIdConditionDTO);
}
