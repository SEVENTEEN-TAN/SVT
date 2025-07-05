package com.seventeen.svt.modules.system.service.impl;

import com.mybatisflex.core.query.QueryWrapper;
import com.mybatisflex.spring.service.impl.ServiceImpl;
import com.seventeen.svt.common.constant.SystemConstant;
import com.seventeen.svt.modules.system.entity.OrgInfo;
import com.seventeen.svt.modules.system.mapper.OrgInfoMapper;
import com.seventeen.svt.modules.system.service.OrgInfoService;
import org.springframework.stereotype.Service;

import static com.seventeen.svt.modules.system.entity.table.Tables.ORG_INFO;

/**
* 针对表【org_info(机构表)】的数据库操作Service实现
*/
@Service
public class OrgInfoServiceImpl extends ServiceImpl<OrgInfoMapper, OrgInfo>
    implements OrgInfoService{

    @Override
    public OrgInfo selectOrgInfoByOrgId(String orgId) {
        QueryWrapper sqlWrapper = QueryWrapper.create()
                .select(ORG_INFO.ALL_COLUMNS)
                .from(ORG_INFO)
                .where(ORG_INFO.ORG_ID.eq(orgId).and(ORG_INFO.STATUS.eq(SystemConstant.Status.NORMAL)));
        return mapper.selectOneByQuery(sqlWrapper);
    }
}




