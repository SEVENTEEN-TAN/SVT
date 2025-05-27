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
* 针对表【menu_role(菜单角色关联表)】的数据库操作Service实现
*/
@Service
public class RoleMenuServiceImpl extends ServiceImpl<RoleMenuMapper, RoleMenu>
    implements RoleMenuService {

    @Override
    public List<MenuInfo> selectMenuListByRoleId(String roleId) {
        QueryWrapper queryWrapper = QueryWrapper.create()
                .select(MENU_INFO.ALL_COLUMNS)
                .from(ROLE_MENU.as("rm"))
                .leftJoin(MENU_INFO).as("mi")
                    .on(ROLE_MENU.MENU_ID.eq(MENU_INFO.MENU_ID)
                            .and(MENU_INFO.STATUS.eq(SystemConstant.Status.NORMAL)))
                .where(ROLE_MENU.ROLE_ID.eq(roleId))
                .orderBy(MENU_INFO.MENU_SORT, true);
        return mapper.selectListByQueryAs(queryWrapper,MenuInfo.class);
    }
}




