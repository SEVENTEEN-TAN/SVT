package com.seventeen.svt.modules.system.service.impl;

import cn.hutool.core.util.ObjectUtil;
import cn.hutool.core.util.StrUtil;
import com.mybatisflex.core.paginate.Page;
import com.mybatisflex.core.query.QueryWrapper;
import com.mybatisflex.core.update.UpdateChain;
import com.mybatisflex.spring.service.impl.ServiceImpl;
import com.seventeen.svt.common.constant.SystemConstant;
import com.seventeen.svt.common.exception.BusinessException;
import com.seventeen.svt.common.page.PageQuery;
import com.seventeen.svt.common.page.PageResult;
import com.seventeen.svt.common.util.TreeUtils;
import com.seventeen.svt.modules.system.dto.request.*;
import com.seventeen.svt.modules.system.dto.response.MenuDetailDTO;
import com.seventeen.svt.modules.system.dto.response.RoleDetailDTO;
import com.seventeen.svt.modules.system.entity.MenuInfo;
import com.seventeen.svt.modules.system.mapper.MenuInfoMapper;
import com.seventeen.svt.modules.system.service.MenuInfoService;
import com.seventeen.svt.modules.system.service.RoleMenuService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

import static com.seventeen.svt.modules.system.entity.table.Tables.*;

/**
 * 针对表【menu_info(菜单表)】的数据库操作Service实现
 */
@Service
public class MenuInfoServiceImpl extends ServiceImpl<MenuInfoMapper, MenuInfo>
        implements MenuInfoService {

    private final RoleMenuService roleMenuServiceImpl;

    @Autowired
    public MenuInfoServiceImpl(RoleMenuService roleMenuServiceImpl) {
        this.roleMenuServiceImpl = roleMenuServiceImpl;
    }

    /**
     * 获取所有菜单树
     *
     * @return 菜单树
     */
    @Override
    public List<TreeUtils.MenuTreeVO> getAllMenuTree() {
        QueryWrapper sqlWrapper = QueryWrapper.create()
                .select(MENU_INFO.ALL_COLUMNS)
                .from(MENU_INFO)
                .where(MENU_INFO.DEL_FLAG.eq(SystemConstant.DelFlag.EXIST));
        List<MenuInfo> menuInfos = mapper.selectListByQuery(sqlWrapper);
        return TreeUtils.buildMenuTree(menuInfos, null);
    }

    /**
     * 更新菜单状态
     *
     * @param updateMenuStatusDTO 更新菜单状态DTO
     */
    @Override
    public void updateMenuStatus(UpdateMenuStatusDTO updateMenuStatusDTO) {
        UpdateChain.of(MenuInfo.class)
                .set(MenuInfo::getStatus, updateMenuStatusDTO.getStatus())
                .where(MenuInfo::getMenuId).in(updateMenuStatusDTO.getMenuIds())
                .update();
    }

    /**
     * 更新菜单排序
     *
     * @param updateMenuSortDTO 更新菜单排序DTO
     */
    @Override
    public void updateMenuSort(UpdateMenuSortDTO updateMenuSortDTO) {
        UpdateChain.of(MenuInfo.class)
                .set(MenuInfo::getMenuSort, updateMenuSortDTO.getSort())
                .where(MenuInfo::getMenuId).eq(updateMenuSortDTO.getMenuId())
                .update();
    }

    /**
     * 编辑菜单
     *
     * @param insertOrUpdateMenuDTO 编辑菜单DTO
     */
    @Override
    public void insertOrUpdateMenu(InsertOrUpdateMenuDTO insertOrUpdateMenuDTO) {
        String menuId = insertOrUpdateMenuDTO.getMenuId();

        //检查菜单路径是否重复
        QueryWrapper queryWrapper = QueryWrapper.create()
                .select(MENU_INFO.ALL_COLUMNS)
                .from(MENU_INFO)
                .where(MENU_INFO.MENU_PATH.eq(insertOrUpdateMenuDTO.getMenuPath())
                        .and(MENU_INFO.MENU_ID.ne(menuId))
                        .and(MENU_INFO.DEL_FLAG.eq(SystemConstant.DelFlag.EXIST)));
        if (ObjectUtil.isNotEmpty(mapper.selectListByQuery(queryWrapper))) {
            throw new BusinessException("菜单路径已存在");
        }

        //如果存在则更新，否则插入
        if (StrUtil.isNotEmpty(menuId)) {
            UpdateChain.of(MenuInfo.class)
                    .set(MenuInfo::getParentId, insertOrUpdateMenuDTO.getParentId())
                    .set(MenuInfo::getMenuNameZh, insertOrUpdateMenuDTO.getMenuNameZh())
                    .set(MenuInfo::getMenuNameEn, insertOrUpdateMenuDTO.getMenuNameEn())
                    .set(MenuInfo::getMenuPath, insertOrUpdateMenuDTO.getMenuPath())
                    .set(MenuInfo::getMenuIcon, insertOrUpdateMenuDTO.getMenuIcon())
                    .set(MenuInfo::getMenuSort, insertOrUpdateMenuDTO.getMenuSort())
                    .set(MenuInfo::getRemark, insertOrUpdateMenuDTO.getRemark())
                    .where(MenuInfo::getMenuId).eq(menuId)
                    .update();
        } else {
            MenuInfo menuInfo = new MenuInfo();
            menuInfo.setParentId(insertOrUpdateMenuDTO.getParentId());
            menuInfo.setMenuNameZh(insertOrUpdateMenuDTO.getMenuNameZh());
            menuInfo.setMenuNameEn(insertOrUpdateMenuDTO.getMenuNameEn());
            menuInfo.setMenuPath(insertOrUpdateMenuDTO.getMenuPath());
            menuInfo.setMenuIcon(insertOrUpdateMenuDTO.getMenuIcon());
            menuInfo.setMenuSort(insertOrUpdateMenuDTO.getMenuSort());
            menuInfo.setRemark(insertOrUpdateMenuDTO.getRemark());
            mapper.insertSelective(menuInfo);
            menuId = menuInfo.getMenuId();
        }

        //调整对角色的关联
        if (ObjectUtil.isNotEmpty(insertOrUpdateMenuDTO.getRoleIds())) {
            roleMenuServiceImpl.deleteRoleMenuByMenuId(menuId);
            roleMenuServiceImpl.batchInsertRoleMenu(insertOrUpdateMenuDTO.getRoleIds(), menuId);
        }
    }

    /**
     * 获取菜单详情
     *
     * @param menuIdStr 菜单ID
     * @return 菜单详情
     */
    @Override
    public MenuDetailDTO getMenuDetail(String menuIdStr) {
        //获取菜单详情
        QueryWrapper sqlWrapper = QueryWrapper.create()
                .select(MENU_INFO.ALL_COLUMNS)
                .from(MENU_INFO)
                .where(MENU_INFO.MENU_ID.eq(menuIdStr).and(MENU_INFO.DEL_FLAG.eq(SystemConstant.DelFlag.EXIST)));
        MenuInfo menuInfo = mapper.selectOneByQuery(sqlWrapper);
        MenuDetailDTO menuDetail = new MenuDetailDTO();
        if (ObjectUtil.isNotEmpty(menuInfo)) {
            BeanUtils.copyProperties(menuInfo, menuDetail);
        }
        return menuDetail;
    }

    /**
     * 获取菜单角色列表
     *
     * @param menuIdConditionDTO 菜单ID
     * @return 菜单角色列表
     */
    @Override
    public List<RoleDetailDTO> getMenuRoleList(MenuConditionDTO menuIdConditionDTO) {
        String menuId = menuIdConditionDTO.getMenuId();
        QueryWrapper queryWrapper = QueryWrapper.create()
                .select(ROLE_INFO.ALL_COLUMNS)
                .from(MENU_INFO.as("mi"))
                .leftJoin(ROLE_MENU).as("rm").on(ROLE_MENU.MENU_ID.eq(MENU_INFO.MENU_ID))
                .leftJoin(ROLE_INFO).as("ri").on(ROLE_INFO.ROLE_ID.eq(ROLE_MENU.ROLE_ID))
                .where(MENU_INFO.MENU_ID.eq(menuId).and(MENU_INFO.DEL_FLAG.eq(SystemConstant.DelFlag.EXIST))
                        .and(ROLE_INFO.DEL_FLAG.eq(SystemConstant.DelFlag.EXIST))
                        .and(ROLE_INFO.STATUS.eq(SystemConstant.Status.NORMAL)));
        return mapper.selectListByQueryAs(queryWrapper, RoleDetailDTO.class);
    }

    /**
     * 删除菜单
     * @param menuIdStr 菜单ID
     */
    @Override
    public void deleteMenu(String menuIdStr) {
       QueryWrapper queryWrapper = QueryWrapper.create()
                .from(MENU_INFO)
                .where(MENU_INFO.MENU_ID.eq(menuIdStr));
        mapper.deleteByQuery(queryWrapper);
    }


}




