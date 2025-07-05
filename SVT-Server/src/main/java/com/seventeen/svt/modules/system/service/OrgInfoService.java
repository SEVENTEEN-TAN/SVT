package com.seventeen.svt.modules.system.service;

import com.mybatisflex.core.service.IService;
import com.seventeen.svt.modules.system.entity.OrgInfo;

/**
* 针对表【org_info(机构表)】的数据库操作Service
*/
public interface OrgInfoService extends IService<OrgInfo> {

    /**
     * 根据机构ID获取机构详情
     * @param orgId 机构ID
     * @return 机构详情
     */
    OrgInfo selectOrgInfoByOrgId(String orgId);
}
