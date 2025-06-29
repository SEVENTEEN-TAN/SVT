package com.seventeen.svt.modules.system.service.impl;

import cn.hutool.core.util.ObjectUtil;
import cn.hutool.core.util.StrUtil;
import com.mybatisflex.core.query.QueryWrapper;
import com.mybatisflex.core.update.UpdateChain;
import com.mybatisflex.spring.service.impl.ServiceImpl;
import com.seventeen.svt.common.constant.SystemConstant;
import com.seventeen.svt.common.exception.BusinessException;
import com.seventeen.svt.common.exception.GlobalExceptionHandler;
import com.seventeen.svt.common.util.TreeUtils;
import com.seventeen.svt.modules.system.dto.request.*;
import com.seventeen.svt.modules.system.dto.response.GetMenuDetail;
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
     * @param editMenuDTO 编辑菜单DTO
     */
    @Override
    public void editMenu(EditMenuDTO editMenuDTO) {
        String menuId = editMenuDTO.getMenuId();

        //检查菜单路径是否重复
        QueryWrapper queryWrapper = QueryWrapper.create()
                .select(MENU_INFO.ALL_COLUMNS)
                .from(MENU_INFO)
                .where(MENU_INFO.MENU_PATH.eq(editMenuDTO.getMenuPath())
                        .and(MENU_INFO.MENU_ID.ne(menuId))
                        .and(MENU_INFO.DEL_FLAG.eq(SystemConstant.DelFlag.EXIST)));
        if (ObjectUtil.isNotEmpty(mapper.selectListByQuery(queryWrapper))) {
            throw new BusinessException("菜单路径已存在");
        }

        //如果存在则更新，否则插入
        if (StrUtil.isNotEmpty(menuId)) {
            UpdateChain.of(MenuInfo.class)
                    .set(MenuInfo::getParentId, editMenuDTO.getParentId())
                    .set(MenuInfo::getMenuNameZh, editMenuDTO.getMenuNameZh())
                    .set(MenuInfo::getMenuNameEn, editMenuDTO.getMenuNameEn())
                    .set(MenuInfo::getMenuPath, editMenuDTO.getMenuPath())
                    .set(MenuInfo::getMenuIcon, editMenuDTO.getMenuIcon())
                    .set(MenuInfo::getMenuSort, editMenuDTO.getMenuSort())
                    .set(MenuInfo::getRemark, editMenuDTO.getRemark())
                    .where(MenuInfo::getMenuId).eq(menuId)
                    .update();
        } else {
            MenuInfo menuInfo = new MenuInfo();
            menuInfo.setParentId(editMenuDTO.getParentId());
            menuInfo.setMenuNameZh(editMenuDTO.getMenuNameZh());
            menuInfo.setMenuNameEn(editMenuDTO.getMenuNameEn());
            menuInfo.setMenuPath(editMenuDTO.getMenuPath());
            menuInfo.setMenuIcon(editMenuDTO.getMenuIcon());
            menuInfo.setMenuSort(editMenuDTO.getMenuSort());
            menuInfo.setRemark(editMenuDTO.getRemark());
            mapper.insertSelective(menuInfo);
            menuId = menuInfo.getMenuId();
        }

        //调整对角色的关联
        if (ObjectUtil.isNotEmpty(editMenuDTO.getRoleIds())) {
            roleMenuServiceImpl.deleteRoleMenuByMenuId(menuId);
            roleMenuServiceImpl.batchInsertRoleMenu(editMenuDTO.getRoleIds(), menuId);
        }
    }

    /**
     * 获取菜单详情
     *
     * @param getMenuDetailDTO 菜单ID
     * @return 菜单详情
     */
    @Override
    public GetMenuDetail getMenuDetail(GetMenuDetailDTO getMenuDetailDTO) {
        //获取菜单详情
        QueryWrapper sqlWrapper = QueryWrapper.create()
                .select(MENU_INFO.ALL_COLUMNS)
                .from(MENU_INFO)
                .where(MENU_INFO.MENU_ID.eq(getMenuDetailDTO.getMenuId()).and(MENU_INFO.DEL_FLAG.eq(SystemConstant.DelFlag.EXIST)));
        MenuInfo menuInfo = mapper.selectOneByQuery(sqlWrapper);
        GetMenuDetail menuDetail = new GetMenuDetail();
        if (ObjectUtil.isNotEmpty(menuInfo)) {
            BeanUtils.copyProperties(menuInfo, menuDetail);
        }
        //获取角色列表
        QueryWrapper queryWrapper = QueryWrapper.create()
                .select(ROLE_MENU.ROLE_ID, ROLE_INFO.ROLE_NAME_ZH, ROLE_INFO.ROLE_NAME_EN)
                .from(ROLE_MENU)
                .join(ROLE_INFO).as("ri")
                .on(ROLE_INFO.ROLE_ID.eq(ROLE_MENU.ROLE_ID)
                        .and(ROLE_INFO.STATUS.eq(SystemConstant.Status.NORMAL))
                        .and(ROLE_INFO.DEL_FLAG.eq(SystemConstant.DelFlag.EXIST)))
                .where(ROLE_MENU.MENU_ID.eq(getMenuDetailDTO.getMenuId()));
        List<GetMenuDetail.RoleInfo> roleInfos = mapper.selectListByQueryAs(queryWrapper, GetMenuDetail.RoleInfo.class);
        if (ObjectUtil.isNotEmpty(roleInfos)) {
            menuDetail.setRoleList(roleInfos);
        }
        return menuDetail;
    }

    @Override
    public void deleteMenu(DeleteMenuDTO deleteMenuDTO) {
       QueryWrapper queryWrapper = QueryWrapper.create()
                .from(MENU_INFO)
                .where(MENU_INFO.MENU_ID.eq(deleteMenuDTO.getMenuId()));
        mapper.deleteByQuery(queryWrapper);
    }
}




