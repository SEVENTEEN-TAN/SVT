package com.seventeen.svt.modules.system.service.impl;

import com.mybatisflex.core.query.QueryWrapper;
import com.mybatisflex.spring.service.impl.ServiceImpl;
import com.seventeen.svt.common.constant.SystemConstant;
import com.seventeen.svt.modules.system.entity.MenuInfo;
import com.seventeen.svt.modules.system.entity.RoleMenu;
import com.seventeen.svt.modules.system.mapper.RoleMenuMapper;
import com.seventeen.svt.modules.system.service.RoleMenuService;
import org.springframework.stereotype.Service;

import java.util.List;

import static com.seventeen.svt.modules.system.entity.table.Tables.MENU_INFO;
import static com.seventeen.svt.modules.system.entity.table.Tables.ROLE_MENU;

/**
 * 针对表【role_menu(菜单角色关联表)】的数据库操作Service实现
 */
@Service
public class RoleMenuServiceImpl extends ServiceImpl<RoleMenuMapper, RoleMenu>
        implements RoleMenuService {

    /**
     * 根据角色ID获取菜单列表
     *
     * @param roleId 角色ID
     * @return 菜单列表
     */
    @Override
    public List<MenuInfo> selectMenuListByRoleId(String roleId) {
        QueryWrapper queryWrapper = QueryWrapper.create()
                .select(MENU_INFO.ALL_COLUMNS)
                .from(ROLE_MENU.as("rm"))
                .leftJoin(MENU_INFO).as("mi")
                .on(ROLE_MENU.MENU_ID.eq(MENU_INFO.MENU_ID))
                .where(ROLE_MENU.ROLE_ID.eq(roleId)
                        .and(MENU_INFO.STATUS.eq(SystemConstant.Status.NORMAL))
                        .and(MENU_INFO.DEL_FLAG.eq(SystemConstant.DelFlag.EXIST)))
                .orderBy(MENU_INFO.MENU_SORT, true);
        return mapper.selectListByQueryAs(queryWrapper, MenuInfo.class);
    }

    /**
     * 根据角色ID删除角色菜单关联
     *
     * @param roleId 角色ID
     */
    @Override
    public void deleteRoleMenuByRoleId(String roleId) {
        QueryWrapper queryWrapper = QueryWrapper.create()
                .from(ROLE_MENU)
                .where(ROLE_MENU.ROLE_ID.eq(roleId));
        mapper.deleteByQuery(queryWrapper);
    }

    /**
     * 根据菜单ID删除角色菜单关联
     *
     * @param menuId 菜单ID
     */
    @Override
    public void deleteRoleMenuByMenuId(String menuId) {
        QueryWrapper queryWrapper = QueryWrapper.create()
                .from(ROLE_MENU)
                .where(ROLE_MENU.MENU_ID.eq(menuId));
        mapper.deleteByQuery(queryWrapper);
    }

    /**
     * 批量插入角色菜单关联
     *
     * @param RoleIdList 角色ID列表
     * @param menuId     菜单ID
     */
    @Override
    public void batchInsertRoleMenu(List<String> RoleIdList, String menuId) {
        List<RoleMenu> roleMenuList = RoleIdList.stream().map(roleId -> {
            RoleMenu roleMenu = new RoleMenu();
            roleMenu.setRoleId(roleId);
            roleMenu.setMenuId(menuId);
            return roleMenu;
        }).toList();
        mapper.insertBatch(roleMenuList);
    }
}




