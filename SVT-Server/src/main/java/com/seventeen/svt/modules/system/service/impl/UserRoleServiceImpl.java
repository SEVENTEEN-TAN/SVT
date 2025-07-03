package com.seventeen.svt.modules.system.service.impl;

import com.mybatisflex.core.query.QueryWrapper;
import com.mybatisflex.core.update.UpdateChain;
import com.mybatisflex.spring.service.impl.ServiceImpl;
import com.seventeen.svt.common.constant.SystemConstant;
import com.seventeen.svt.modules.system.dto.response.RoleDetailDTO;
import com.seventeen.svt.modules.system.entity.UserRole;
import com.seventeen.svt.modules.system.mapper.UserRoleMapper;
import com.seventeen.svt.modules.system.service.UserRoleService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static com.seventeen.svt.modules.system.entity.table.Tables.ROLE_INFO;
import static com.seventeen.svt.modules.system.entity.table.Tables.USER_ROLE;

/**
 * 针对表【user_role(用户角色关联表)】的数据库操作Service实现
 */
@Service
public class UserRoleServiceImpl extends ServiceImpl<UserRoleMapper, UserRole>
        implements UserRoleService {

    @Override
    public List<RoleDetailDTO> getUserRoleListByUserId(String userId) {
        QueryWrapper queryWrapper = QueryWrapper.create()
                .select(ROLE_INFO.ALL_COLUMNS)
                .from(USER_ROLE).as("ur")
                .leftJoin(ROLE_INFO).as("ri")
                .on(ROLE_INFO.ROLE_ID.eq(USER_ROLE.ROLE_ID)
                        .and(ROLE_INFO.STATUS.eq(SystemConstant.Status.NORMAL)))
                .where(USER_ROLE.USER_ID.eq(userId)
                        .and(USER_ROLE.DEL_FLAG.eq(SystemConstant.DelFlag.EXIST)))
                .orderBy(ROLE_INFO.ROLE_SORT, true);
        return mapper.selectListByQueryAs(queryWrapper, RoleDetailDTO.class);
    }

    /**
     * 根据用户ID查询用户角色ID列表
     *
     * @param userId 用户ID
     * @return 角色ID列表
     */
    @Override
    public List<String> getUserRoleIdsByUserId(String userId) {
        QueryWrapper queryWrapper = QueryWrapper.create()
                .select(USER_ROLE.ROLE_ID)
                .from(USER_ROLE)
                .where(USER_ROLE.USER_ID.eq(userId)
                        .and(USER_ROLE.DEL_FLAG.eq(SystemConstant.DelFlag.EXIST)));
        
        List<UserRole> userRoles = mapper.selectListByQuery(queryWrapper);
        return userRoles.stream().map(UserRole::getRoleId).toList();
    }

    /**
     * 删除用户的所有角色关联
     *
     * @param userId 用户ID
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteUserRolesByUserId(String userId) {
        UpdateChain.of(UserRole.class)
                .set(UserRole::getDelFlag, SystemConstant.DelFlag.DELETED)
                .where(USER_ROLE.USER_ID.eq(userId))
                .update();
    }

    /**
     * 为用户添加角色关联
     *
     * @param userId 用户ID
     * @param roleIds 角色ID列表
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void addUserRoles(String userId, List<String> roleIds) {
        if (roleIds != null && !roleIds.isEmpty()) {
            for (String roleId : roleIds) {
                UserRole userRole = new UserRole();
                userRole.setUserId(userId);
                userRole.setRoleId(roleId);
                userRole.setStatus(SystemConstant.Status.NORMAL);
                mapper.insertSelective(userRole);
            }
        }
    }

    /**
     * 删除角色的所有用户关联
     *
     * @param roleId 角色ID
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteRoleUsersByRoleId(String roleId) {
        UpdateChain.of(UserRole.class)
                .set(UserRole::getDelFlag, SystemConstant.DelFlag.DELETED)
                .where(USER_ROLE.ROLE_ID.eq(roleId))
                .update();
    }

    /**
     * 为角色添加用户关联
     *
     * @param roleId 角色ID
     * @param userIds 用户ID列表
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void addRoleUsers(String roleId, List<String> userIds) {
        if (userIds != null && !userIds.isEmpty()) {
            for (String userId : userIds) {
                UserRole userRole = new UserRole();
                userRole.setUserId(userId);
                userRole.setRoleId(roleId);
                userRole.setStatus(SystemConstant.Status.NORMAL);
                mapper.insertSelective(userRole);
            }
        }
    }
}




