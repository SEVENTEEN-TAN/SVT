package com.seventeen.svt.modules.system.service.impl;

import com.mybatisflex.core.query.QueryWrapper;
import com.mybatisflex.spring.service.impl.ServiceImpl;
import com.seventeen.svt.common.constant.SystemConstant;
import com.seventeen.svt.modules.system.entity.RoleInfo;
import com.seventeen.svt.modules.system.mapper.RoleInfoMapper;
import com.seventeen.svt.modules.system.service.RoleInfoService;
import org.springframework.stereotype.Service;

import static com.seventeen.svt.modules.system.entity.table.Tables.ROLE_INFO;

/**
* 针对表【role_info(角色表)】的数据库操作Service实现
*/
@Service
public class RoleInfoServiceImpl extends ServiceImpl<RoleInfoMapper, RoleInfo>
    implements RoleInfoService{

    @Override
    public RoleInfo selectRoleInfoByRoleId(String roleId) {
        QueryWrapper sqlWrapper = QueryWrapper.create()
                .select(ROLE_INFO.ALL_COLUMNS)
                .from(ROLE_INFO)
                .where(ROLE_INFO.ROLE_ID.eq(roleId).and(ROLE_INFO.STATUS.eq(SystemConstant.Status.NORMAL)));
        return mapper.selectOneByQuery(sqlWrapper);
    }
}




