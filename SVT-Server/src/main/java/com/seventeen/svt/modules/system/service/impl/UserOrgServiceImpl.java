package com.seventeen.svt.modules.system.service.impl;

import com.mybatisflex.core.query.QueryWrapper;
import com.mybatisflex.spring.service.impl.ServiceImpl;
import com.seventeen.svt.common.constant.SystemConstant;
import com.seventeen.svt.modules.system.entity.UserOrg;
import com.seventeen.svt.modules.system.mapper.UserOrgMapper;
import com.seventeen.svt.modules.system.service.UserOrgService;
import com.seventeen.svt.modules.system.dto.response.GetUserOrgVO;
import org.springframework.stereotype.Service;

import java.util.List;

import static com.seventeen.svt.modules.system.entity.table.Tables.ORG_INFO;
import static com.seventeen.svt.modules.system.entity.table.Tables.USER_ORG;

/**
* 针对表【user_org(用户机构关联表)】的数据库操作Service实现
*/
@Service
public class UserOrgServiceImpl extends ServiceImpl<UserOrgMapper, UserOrg>
    implements UserOrgService{

    @Override
    public GetUserOrgVO getUserOrgListByUserId(String userId) {
        QueryWrapper queryWrapper = QueryWrapper.create()
                .select(ORG_INFO.ALL_COLUMNS)
                .from(USER_ORG).as("uo")
                .leftJoin(ORG_INFO).as("oi")
                .on(ORG_INFO.ORG_ID.eq(USER_ORG.ORG_ID)
                        .and(ORG_INFO.STATUS.eq(SystemConstant.Status.NORMAL)))
                .where(USER_ORG.USER_ID.eq(userId))
                .orderBy(ORG_INFO.ORG_SORT, true);
        List<GetUserOrgVO.UserOrgInfo> userOrgInfos = mapper.selectListByQueryAs(queryWrapper, GetUserOrgVO.UserOrgInfo.class);
        return  GetUserOrgVO.builder().orgInfos(userOrgInfos).build();
    }
}




