package com.seventeen.svt.modules.system.service.impl;

import cn.hutool.core.util.ObjectUtil;
import cn.hutool.core.util.StrUtil;
import com.mybatisflex.core.query.QueryWrapper;
import com.mybatisflex.spring.service.impl.ServiceImpl;
import com.seventeen.svt.common.exception.BusinessException;
import com.seventeen.svt.common.util.MessageUtils;
import com.seventeen.svt.common.util.RequestContextUtils;
import com.seventeen.svt.common.util.TransactionUtils;
import com.seventeen.svt.common.util.TreeUtils;
import com.seventeen.svt.frame.cache.entity.UserDetailCache;
import com.seventeen.svt.frame.cache.util.UserDetailCacheUtils;
import com.seventeen.svt.modules.system.dto.request.GetUserDetailsDTO;
import com.seventeen.svt.modules.system.entity.*;
import com.seventeen.svt.modules.system.mapper.UserInfoMapper;
import com.seventeen.svt.modules.system.service.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

import static com.seventeen.svt.modules.system.entity.table.Tables.USER_INFO;

/**
 * 针对表【user_info(用户表)】的数据库操作Service实现
 */
@Service
@Slf4j
public class UserInfoServiceImpl extends ServiceImpl<UserInfoMapper, UserInfo>
        implements UserInfoService {

    private final UserDetailCacheUtils userDetailCacheUtils;
    private final OrgInfoService orgInfoServiceImpl;
    private final RoleInfoService roleInfoServiceImpl;
    private final RolePermissionService rolePermissionServiceImpl;
    private final RoleMenuService roleMenuServiceImpl;

    @Autowired
    public UserInfoServiceImpl(UserDetailCacheUtils userDetailCacheUtils,
                               OrgInfoService orgInfoServiceImpl, RoleInfoService roleInfoServiceImpl,
                               RolePermissionService rolePermissionServiceImpl, RoleMenuService roleMenuServiceImpl) {
        this.userDetailCacheUtils = userDetailCacheUtils;
        this.orgInfoServiceImpl = orgInfoServiceImpl;
        this.roleInfoServiceImpl = roleInfoServiceImpl;
        this.rolePermissionServiceImpl = rolePermissionServiceImpl;
        this.roleMenuServiceImpl = roleMenuServiceImpl;
    }

    @Override
    public UserInfo getUserById(String loginId) {
        QueryWrapper queryWrapper = QueryWrapper.create()
                .select(USER_INFO.ALL_COLUMNS)
                .from(USER_INFO)
                .where(USER_INFO.USER_ID.eq(loginId));
        return mapper.selectOneByQuery(queryWrapper);
    }

    @Override
    public void addUser(UserInfo userInfo) {
        mapper.insertSelective(userInfo);
    }

    @Value("${app.version}")
    private String appVersion;

    @Override
    public UserDetailCache getUserDetails(GetUserDetailsDTO userDetailsDTO) {

        if (StrUtil.isEmpty(userDetailsDTO.getOrgId()) || StrUtil.isEmpty(userDetailsDTO.getRoleId())) {
            throw new BusinessException(MessageUtils.getMessage("auth.login.expired"));
        }

        String requestUserId = RequestContextUtils.getRequestUserId();
        UserDetailCache userDetail = userDetailCacheUtils.getUserDetail(requestUserId);
        if (ObjectUtil.isEmpty(userDetail)) {
            throw new BusinessException(MessageUtils.getMessage("auth.login.expired"));
        }

        userDetail.setServerVersion(appVersion);

        //获取用户选择的机构详情
        OrgInfo orgInfo = orgInfoServiceImpl.selectOrgInfoByOrgId(userDetailsDTO.getOrgId());

        if (ObjectUtil.isNotEmpty(orgInfo)) {
            //更新到缓存对象
            userDetail.setOrgId(orgInfo.getOrgId());
            userDetail.setOrgNameZh(orgInfo.getOrgNameZh());
            userDetail.setOrgNameEn(orgInfo.getOrgNameEn());
        }

        //获取用户选择的角色详情
        RoleInfo roleInfo = roleInfoServiceImpl.selectRoleInfoByRoleId(userDetailsDTO.getRoleId());
        if (ObjectUtil.isNotEmpty(roleInfo)) {

            //更新到缓存对象
            userDetail.setRoleId(roleInfo.getRoleId());
            userDetail.setRoleNameZh(roleInfo.getRoleNameZh());
            userDetail.setRoleNameEn(roleInfo.getRoleNameEn());

            //获取用户选择的角色权限详情
            List<PermissionInfo> permissionInfos = rolePermissionServiceImpl.selectPermissionListByRoleId(roleInfo.getRoleId());
            List<String> permissionList = permissionInfos.stream().map(PermissionInfo::getPermissionKey).toList();

            if (ObjectUtil.isNotEmpty(permissionList)) {
                //更新到缓存对象
                userDetail.setPermissionKeys(permissionList);
            }

            //获取用户选择的额角色菜单
            List<MenuInfo> menuInfos = roleMenuServiceImpl.selectMenuListByRoleId(roleInfo.getRoleId());
            List<TreeUtils.MenuTreeVO> menuTreeVOS = TreeUtils.buildMenuTree(menuInfos, null);

            if (ObjectUtil.isNotEmpty(menuTreeVOS)) {
                //更新到缓存对象
                userDetail.setMenuTrees(menuTreeVOS);
            }
        }

        //更新到缓存中
        userDetailCacheUtils.putUserDetail(requestUserId, userDetail);

        return userDetail;
    }

    @Override
    public void deleteUserTest(String userId) {
        log.debug(TransactionUtils.getTransactionStatus());
        QueryWrapper queryWrapper = QueryWrapper.create()
                .from(USER_INFO)
                .where(USER_INFO.USER_ID.eq(userId));
        mapper.deleteByQuery(queryWrapper);
    }


}




