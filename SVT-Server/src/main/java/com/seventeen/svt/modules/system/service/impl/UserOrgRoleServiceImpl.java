package com.seventeen.svt.modules.system.service.impl;

import com.mybatisflex.core.query.QueryWrapper;
import com.mybatisflex.spring.service.impl.ServiceImpl;
import com.seventeen.svt.common.constant.SystemConstant;
import com.seventeen.svt.modules.system.dto.response.OrgDetailDTO;
import com.seventeen.svt.modules.system.dto.response.RoleDetailDTO;
import com.seventeen.svt.modules.system.entity.UserOrgRole;
import com.seventeen.svt.modules.system.mapper.UserOrgRoleMapper;
import com.seventeen.svt.modules.system.service.UserOrgRoleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

import static com.seventeen.svt.modules.system.entity.table.Tables.*;

/**
 * 用户-机构-角色关联服务实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserOrgRoleServiceImpl extends ServiceImpl<UserOrgRoleMapper, UserOrgRole> implements UserOrgRoleService {


    /**
     * 获取用户可访问的机构列表
     *
     * @param userId 用户ID
     * @return 机构列表
     */
    @Override
    public List<OrgDetailDTO> getUserOrgListByUserId(String userId) {
        QueryWrapper queryWrapper = QueryWrapper.create()
                .select(ORG_INFO.ALL_COLUMNS)
                .from(USER_ORG_ROLE).as("uor")
                .leftJoin(ORG_INFO).as("oi")
                .on(ORG_INFO.ORG_ID.eq(USER_ORG_ROLE.ORG_ID).and(ORG_INFO.STATUS.eq(SystemConstant.Status.NORMAL)))
                .where(USER_ORG_ROLE.USER_ID.eq(userId).and(USER_ORG_ROLE.DEL_FLAG.eq(SystemConstant.DelFlag.EXIST)));
        return mapper.selectListByQueryAs(queryWrapper, OrgDetailDTO.class);
    }


    /**
     * 获取用户在指定机构下的角色列表
     *
     * @param userId 用户ID
     * @param orgId 机构ID
     * @return 角色列表
     */
    @Override
    public List<RoleDetailDTO> getUserRoleListByUserId(String userId, String orgId) {
        QueryWrapper queryWrapper = QueryWrapper.create()
                .select(ROLE_INFO.ALL_COLUMNS)
                .from(USER_ORG_ROLE).as("uor")
                .leftJoin(ROLE_INFO).as("ri")
                .on(ROLE_INFO.ROLE_ID.eq(USER_ORG_ROLE.ROLE_ID).and(ROLE_INFO.STATUS.eq(SystemConstant.Status.NORMAL)))
                .where(USER_ORG_ROLE.USER_ID.eq(userId).and(USER_ORG_ROLE.ORG_ID.eq(orgId)));
        return mapper.selectListByQueryAs(queryWrapper, RoleDetailDTO.class);
    }
}