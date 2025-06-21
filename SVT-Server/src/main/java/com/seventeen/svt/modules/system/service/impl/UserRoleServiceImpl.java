package com.seventeen.svt.modules.system.service.impl;

import com.mybatisflex.core.query.QueryWrapper;
import com.mybatisflex.spring.service.impl.ServiceImpl;
import com.seventeen.svt.common.constant.SystemConstant;
import com.seventeen.svt.modules.system.entity.UserRole;
import com.seventeen.svt.modules.system.mapper.UserRoleMapper;
import com.seventeen.svt.modules.system.service.UserRoleService;
import com.seventeen.svt.modules.system.dto.response.GetUserRoleDTO;
import org.springframework.stereotype.Service;

import java.util.List;

import static com.seventeen.svt.modules.system.entity.table.Tables.ROLE_INFO;
import static com.seventeen.svt.modules.system.entity.table.Tables.USER_ROLE;

/**
* 针对表【user_role(用户角色关联表)】的数据库操作Service实现
*/
@Service
public class UserRoleServiceImpl extends ServiceImpl<UserRoleMapper, UserRole>
    implements UserRoleService{

    @Override
    public GetUserRoleDTO getUserRoleListByUserId(String userId) {
        QueryWrapper queryWrapper = QueryWrapper.create()
                .select(ROLE_INFO.ALL_COLUMNS)
                .from(USER_ROLE).as("ur")
                .leftJoin(ROLE_INFO).as("ri")
                .on(ROLE_INFO.ROLE_ID.eq(USER_ROLE.ROLE_ID)
                        .and(ROLE_INFO.STATUS.eq(SystemConstant.Status.NORMAL)))
                .where(USER_ROLE.USER_ID.eq(userId))
                .orderBy(ROLE_INFO.ROLE_SORT, true);
        List<GetUserRoleDTO.UserRoleInfo> userRoleInfos = mapper.selectListByQueryAs(queryWrapper, GetUserRoleDTO.UserRoleInfo.class);
        return GetUserRoleDTO.builder().userRoleInfos(userRoleInfos).build();
    }
}




