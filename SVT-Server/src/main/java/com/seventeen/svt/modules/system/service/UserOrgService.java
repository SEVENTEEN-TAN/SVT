package com.seventeen.svt.modules.system.service;

import com.mybatisflex.core.service.IService;
import com.seventeen.svt.modules.system.entity.UserOrg;
import com.seventeen.svt.modules.system.dto.response.GetUserOrgDTO;

/**
* 针对表【user_org(用户机构关联表)】的数据库操作Service
*/
public interface UserOrgService extends IService<UserOrg> {

    /**
     * 根据用户ID查询用户机构列表
     * @param userId 用户ID
     * @return 用户机构列表
     */
    GetUserOrgDTO getUserOrgListByUserId(String userId);
}
