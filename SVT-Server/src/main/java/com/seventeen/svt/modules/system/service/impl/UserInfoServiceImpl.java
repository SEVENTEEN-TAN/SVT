package com.seventeen.svt.modules.system.service.impl;

import cn.hutool.core.util.ObjectUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.crypto.digest.BCrypt;
import com.mybatisflex.core.paginate.Page;
import com.mybatisflex.core.query.QueryWrapper;
import com.mybatisflex.core.update.UpdateChain;
import com.mybatisflex.spring.service.impl.ServiceImpl;
import com.seventeen.svt.common.constant.SystemConstant;
import com.seventeen.svt.common.exception.BusinessException;
import com.seventeen.svt.common.page.PageQuery;
import com.seventeen.svt.common.page.PageResult;
import com.seventeen.svt.common.util.MessageUtils;
import com.seventeen.svt.common.util.RequestContextUtils;
import com.seventeen.svt.common.util.TransactionUtils;
import com.seventeen.svt.common.util.TreeUtils;
import com.seventeen.svt.frame.cache.entity.UserDetailCache;
import com.seventeen.svt.frame.cache.util.UserDetailCacheUtils;
import com.seventeen.svt.modules.system.dto.request.GetUserDetailsDTO;
import com.seventeen.svt.modules.system.dto.request.InsertOrUpdateUserDetailDTO;
import com.seventeen.svt.modules.system.dto.request.UserConditionDTO;
import com.seventeen.svt.modules.system.dto.response.UserDetailDTO;
import com.seventeen.svt.modules.system.entity.*;
import com.seventeen.svt.modules.system.mapper.UserInfoMapper;
import com.seventeen.svt.modules.system.service.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static com.seventeen.svt.modules.system.entity.table.Tables.*;

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
    private final UserRoleService userRoleServiceImpl;
    private final UserOrgService userOrgServiceImpl;

    @Autowired
    public UserInfoServiceImpl(UserDetailCacheUtils userDetailCacheUtils,
                               OrgInfoService orgInfoServiceImpl, RoleInfoService roleInfoServiceImpl,
                               RolePermissionService rolePermissionServiceImpl, RoleMenuService roleMenuServiceImpl,
                               UserRoleService userRoleServiceImpl, UserOrgService userOrgServiceImpl) {
        this.userDetailCacheUtils = userDetailCacheUtils;
        this.orgInfoServiceImpl = orgInfoServiceImpl;
        this.roleInfoServiceImpl = roleInfoServiceImpl;
        this.rolePermissionServiceImpl = rolePermissionServiceImpl;
        this.roleMenuServiceImpl = roleMenuServiceImpl;
        this.userRoleServiceImpl = userRoleServiceImpl;
        this.userOrgServiceImpl = userOrgServiceImpl;
    }

    @Override
    public UserInfo getUserById(String loginId) {
        if (StrUtil.isBlank(loginId)) {
            return  null;
        }
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

    // ==================== 用户管理扩展方法实现 ====================

    /**
     * 根据用户ID获取用户详情
     *
     * @param userId 用户ID
     * @return 用户详情
     */
    @Override
    public UserInfo selectUserInfoByUserId(String userId) {
        QueryWrapper sqlWrapper = QueryWrapper.create()
                .select(USER_INFO.ALL_COLUMNS)
                .from(USER_INFO)
                .where(USER_INFO.USER_ID.eq(userId).and(USER_INFO.DEL_FLAG.eq(SystemConstant.DelFlag.EXIST)));
        return mapper.selectOneByQuery(sqlWrapper);
    }

    /**
     * 获取用户列表
     *
     * @return PageResult<UserDetailDTO> 用户列表
     */
    @Override
    public PageResult<UserDetailDTO> getUserList(PageQuery<UserConditionDTO> getUserListConditionDTO) {
        UserConditionDTO condition = getUserListConditionDTO.getCondition();

        QueryWrapper queryWrapper = QueryWrapper.create()
                .select(USER_INFO.ALL_COLUMNS)
                .from(USER_INFO)
                .where(USER_INFO.DEL_FLAG.eq(SystemConstant.DelFlag.EXIST)
                        .and(USER_INFO.STATUS.eq(condition.getStatus(), StrUtil.isNotBlank(condition.getStatus())))
                        .and(USER_INFO.LOGIN_ID.eq(condition.getLoginId(), StrUtil.isNotBlank(condition.getLoginId())))
                        .and(USER_INFO.USER_NAME_ZH.like(condition.getUserNameZh(), StrUtil.isNotBlank(condition.getUserNameZh())))
                        .and(USER_INFO.USER_NAME_EN.like(condition.getUserNameEn(), StrUtil.isNotBlank(condition.getUserNameEn())))
                        .and(USER_INFO.CREATE_BY.eq(condition.getCreateBy(), StrUtil.isNotBlank(condition.getCreateBy())))
                        .and(USER_INFO.CREATE_ORG_ID.eq(condition.getCreateOrgId(), StrUtil.isNotBlank(condition.getCreateOrgId())))
                        .and(USER_INFO.CREATE_TIME.ge(condition.getCreateTimeStart(), StrUtil.isNotBlank(condition.getCreateTimeStart())))
                        .and(USER_INFO.CREATE_TIME.le(condition.getCreateTimeEnd(), StrUtil.isNotBlank(condition.getCreateTimeEnd())))
                )
                .orderBy(USER_INFO.CREATE_TIME, false);

        // 如果查询条件包含角色ID或机构ID，需要关联查询
        if (StrUtil.isNotBlank(condition.getRoleId()) || StrUtil.isNotBlank(condition.getOrgId())) {
            if (StrUtil.isNotBlank(condition.getRoleId())) {
                queryWrapper.innerJoin(USER_ROLE).on(USER_INFO.USER_ID.eq(USER_ROLE.USER_ID))
                        .and(USER_ROLE.ROLE_ID.eq(condition.getRoleId()))
                        .and(USER_ROLE.DEL_FLAG.eq(SystemConstant.DelFlag.EXIST));
            }
            if (StrUtil.isNotBlank(condition.getOrgId())) {
                queryWrapper.innerJoin(USER_ORG).on(USER_INFO.USER_ID.eq(USER_ORG.USER_ID))
                        .and(USER_ORG.ORG_ID.eq(condition.getOrgId()))
                        .and(USER_ORG.DEL_FLAG.eq(SystemConstant.DelFlag.EXIST));
            }
        }

        Page<UserDetailDTO> getUserListDTOPage = mapper.paginateAs(getUserListConditionDTO.getPageNumber(), 
                getUserListConditionDTO.getPageSize(), queryWrapper, UserDetailDTO.class);
        
        // 为每个用户添加角色和机构信息
        PageResult<UserDetailDTO> pageResult = PageResult.from(getUserListDTOPage);
        if (pageResult.getRecords() != null) {
            for (UserDetailDTO user : pageResult.getRecords()) {
                fillUserRoleAndOrgInfo(user);
            }
        }
        
        return pageResult;
    }

    /**
     * 获取所有启用的用户列表
     *
     * @return List<UserDetailDTO> 用户列表
     */
    @Override
    public List<UserDetailDTO> getActiveUserList() {
        QueryWrapper queryWrapper = QueryWrapper.create()
                .select(USER_INFO.ALL_COLUMNS)
                .from(USER_INFO)
                .where(USER_INFO.DEL_FLAG.eq(SystemConstant.DelFlag.EXIST)
                        .and(USER_INFO.STATUS.eq(SystemConstant.Status.NORMAL)))
                .orderBy(USER_INFO.CREATE_TIME, false);
        return mapper.selectListByQueryAs(queryWrapper, UserDetailDTO.class);
    }

    /**
     * 获取用户详情
     *
     * @param userId 用户ID
     * @return 用户详情
     */
    @Override
    public UserDetailDTO getUserDetail(String userId) {
        QueryWrapper queryWrapper = QueryWrapper.create()
                .select(USER_INFO.ALL_COLUMNS)
                .from(USER_INFO)
                .where(USER_INFO.USER_ID.eq(userId)
                        .and(USER_INFO.DEL_FLAG.eq(SystemConstant.DelFlag.EXIST)));
        return mapper.selectOneByQueryAs(queryWrapper, UserDetailDTO.class);
    }

    /**
     * 新增/编辑用户
     *
     * @param editUserDetailDTO 编辑用户DTO
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void insertOrUpdateUser(InsertOrUpdateUserDetailDTO editUserDetailDTO) {
        String userId = editUserDetailDTO.getUserId();

        // 验证登录ID唯一性
        if (!validateLoginId(editUserDetailDTO.getLoginId(), userId)) {
            throw new BusinessException("登录ID已存在");
        }

        //如果存在则更新，否则插入
        if (StrUtil.isNotEmpty(userId)) {
            // 检查用户是否存在
            UserInfo existingUser = selectUserInfoByUserId(userId);
            if (existingUser == null) {
                throw new BusinessException("用户不存在");
            }

            UpdateChain<UserInfo> updateChain = UpdateChain.of(UserInfo.class)
                    .set(UserInfo::getLoginId, editUserDetailDTO.getLoginId())
                    .set(UserInfo::getUserNameZh, editUserDetailDTO.getUserNameZh())
                    .set(UserInfo::getUserNameEn, editUserDetailDTO.getUserNameEn())
                    .set(UserInfo::getStatus, editUserDetailDTO.getStatus())
                    .set(UserInfo::getRemark, editUserDetailDTO.getRemark());

            // 如果提供了新密码，则更新密码
            if (StrUtil.isNotBlank(editUserDetailDTO.getPassword())) {
                updateChain.set(UserInfo::getPassword, BCrypt.hashpw(editUserDetailDTO.getPassword()));
            }

            updateChain.where(UserInfo::getUserId).eq(userId).update();

        } else {
            // 新增用户
            if (StrUtil.isBlank(editUserDetailDTO.getPassword())) {
                throw new BusinessException("新增用户时密码不能为空");
            }

            UserInfo userInfo = new UserInfo();
            userInfo.setLoginId(editUserDetailDTO.getLoginId());
            userInfo.setPassword(BCrypt.hashpw(editUserDetailDTO.getPassword()));
            userInfo.setUserNameZh(editUserDetailDTO.getUserNameZh());
            userInfo.setUserNameEn(editUserDetailDTO.getUserNameEn());
            userInfo.setStatus(editUserDetailDTO.getStatus());
            userInfo.setRemark(editUserDetailDTO.getRemark());
            mapper.insertSelective(userInfo);
            
            // 获取新插入的用户ID
            userId = userInfo.getUserId();
        }

        // 分配角色和机构
        if (editUserDetailDTO.getRoleIds() != null && !editUserDetailDTO.getRoleIds().isEmpty()) {
            assignUserRoles(userId, editUserDetailDTO.getRoleIds());
        }
        if (editUserDetailDTO.getOrgIds() != null && !editUserDetailDTO.getOrgIds().isEmpty()) {
            assignUserOrgs(userId, editUserDetailDTO.getOrgIds(), editUserDetailDTO.getPrimaryOrgId());
        }
    }

    /**
     * 更新用户状态
     *
     * @param userId 用户ID
     * @param status 状态（0：启用，1：停用）
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateUserStatus(String userId, String status) {
        // 检查用户是否存在
        UserInfo existingUser = selectUserInfoByUserId(userId);
        if (existingUser == null) {
            throw new BusinessException("用户不存在");
        }

        UpdateChain.of(UserInfo.class)
                .set(UserInfo::getStatus, status)
                .where(UserInfo::getUserId).eq(userId)
                .update();
    }

    /**
     * 删除用户
     *
     * @param userId 用户ID
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteUser(String userId) {
        // 检查用户是否存在
        UserInfo existingUser = selectUserInfoByUserId(userId);
        if (existingUser == null) {
            throw new BusinessException("用户不存在");
        }

        // 逻辑删除
        UpdateChain.of(UserInfo.class)
                .set(UserInfo::getDelFlag, SystemConstant.DelFlag.DELETED)
                .where(UserInfo::getUserId).eq(userId)
                .update();

        // 同时删除用户角色和机构关联
        userRoleServiceImpl.deleteUserRolesByUserId(userId);
        userOrgServiceImpl.deleteUserOrgsByUserId(userId);
    }

    /**
     * 批量更新用户状态
     *
     * @param userIds 用户ID列表
     * @param status 状态（0：启用，1：停用）
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void batchUpdateStatus(List<String> userIds, String status) {
        if (userIds == null || userIds.isEmpty()) {
            throw new BusinessException("用户ID列表不能为空");
        }

        UpdateChain.of(UserInfo.class)
                .set(UserInfo::getStatus, status)
                .where(USER_INFO.USER_ID.in(userIds))
                .update();
    }

    /**
     * 批量删除用户
     *
     * @param userIds 用户ID列表
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void batchDelete(List<String> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            throw new BusinessException("用户ID列表不能为空");
        }

        // 批量逻辑删除
        UpdateChain.of(UserInfo.class)
                .set(UserInfo::getDelFlag, SystemConstant.DelFlag.DELETED)
                .where(USER_INFO.USER_ID.in(userIds))
                .update();

        // 批量删除用户角色和机构关联
        userIds.forEach(userId -> {
            userRoleServiceImpl.deleteUserRolesByUserId(userId);
            userOrgServiceImpl.deleteUserOrgsByUserId(userId);
        });
    }

    /**
     * 分配用户角色
     *
     * @param userId 用户ID
     * @param roleIds 角色ID列表
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void assignUserRoles(String userId, List<String> roleIds) {
        // 先删除现有角色关联
        userRoleServiceImpl.deleteUserRolesByUserId(userId);

        // 添加新的角色关联
        if (roleIds != null && !roleIds.isEmpty()) {
            userRoleServiceImpl.addUserRoles(userId, roleIds);
        }
    }

    /**
     * 分配用户机构
     *
     * @param userId 用户ID
     * @param orgIds 机构ID列表
     * @param primaryOrgId 主机构ID
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void assignUserOrgs(String userId, List<String> orgIds, String primaryOrgId) {
        // 先删除现有机构关联
        userOrgServiceImpl.deleteUserOrgsByUserId(userId);

        // 添加新的机构关联
        if (orgIds != null && !orgIds.isEmpty()) {
            userOrgServiceImpl.addUserOrgs(userId, orgIds, primaryOrgId);
        }
    }

    /**
     * 获取用户角色列表
     *
     * @param userId 用户ID
     * @return 角色ID列表
     */
    @Override
    public List<String> getUserRoleIds(String userId) {
        return userRoleServiceImpl.getUserRoleIdsByUserId(userId);
    }

    /**
     * 获取用户机构列表
     *
     * @param userId 用户ID
     * @return 机构ID列表
     */
    @Override
    public List<String> getUserOrgIds(String userId) {
        return userOrgServiceImpl.getUserOrgIdsByUserId(userId);
    }

    /**
     * 重置用户密码
     *
     * @param userId 用户ID
     * @param newPassword 新密码
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void resetPassword(String userId, String newPassword) {
        // 检查用户是否存在
        UserInfo existingUser = selectUserInfoByUserId(userId);
        if (existingUser == null) {
            throw new BusinessException("用户不存在");
        }

        UpdateChain.of(UserInfo.class)
                .set(UserInfo::getPassword, BCrypt.hashpw(newPassword))
                .where(UserInfo::getUserId).eq(userId)
                .update();
    }

    /**
     * 验证登录ID唯一性
     *
     * @param loginId 登录ID
     * @param userId 用户ID（编辑时排除自身）
     * @return 是否可用
     */
    @Override
    public boolean validateLoginId(String loginId, String userId) {
        if (StrUtil.isBlank(loginId)) {
            return false;
        }

        QueryWrapper queryWrapper = QueryWrapper.create()
                .select(USER_INFO.USER_ID)
                .from(USER_INFO)
                .where(USER_INFO.LOGIN_ID.eq(loginId)
                        .and(USER_INFO.DEL_FLAG.eq(SystemConstant.DelFlag.EXIST))
                        .and(USER_INFO.USER_ID.ne(userId, StrUtil.isNotEmpty(userId))));

        UserInfo existingUser = mapper.selectOneByQuery(queryWrapper);
        return existingUser == null;
    }

    /**
     * 为用户填充角色和机构信息
     *
     * @param user 用户DTO
     */
    private void fillUserRoleAndOrgInfo(UserDetailDTO user) {
        try {
            // 获取用户角色
            List<com.seventeen.svt.modules.system.dto.response.RoleDetailDTO> roles = 
                userRoleServiceImpl.getUserRoleListByUserId(user.getUserId());
            if (roles != null && !roles.isEmpty()) {
                String roleNames = roles.stream()
                        .map(com.seventeen.svt.modules.system.dto.response.RoleDetailDTO::getRoleNameZh)
                        .filter(java.util.Objects::nonNull)
                        .collect(java.util.stream.Collectors.joining(", "));
                user.setRoleNames(roleNames);
            }

            // 获取用户机构
            List<com.seventeen.svt.modules.system.dto.response.OrgDetailDTO> orgs = 
                userOrgServiceImpl.getUserOrgListByUserId(user.getUserId());
            if (orgs != null && !orgs.isEmpty()) {
                String orgNames = orgs.stream()
                        .map(com.seventeen.svt.modules.system.dto.response.OrgDetailDTO::getOrgNameZh)
                        .filter(java.util.Objects::nonNull)
                        .collect(java.util.stream.Collectors.joining(", "));
                user.setOrgNames(orgNames);
            }
        } catch (Exception e) {
            log.warn("填充用户角色机构信息失败: {}", e.getMessage());
            // 不影响主要功能，忽略异常
        }
    }


}




