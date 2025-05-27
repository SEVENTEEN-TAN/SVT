package com.seventeen.svt.modules.system.service;

import com.mybatisflex.core.service.IService;
import com.seventeen.svt.modules.system.entity.RoleInfo;

/**
* 针对表【role_info(角色表)】的数据库操作Service
*/
public interface RoleInfoService extends IService<RoleInfo> {

    /**
     * 根据角色ID获取角色详情
     * @param roleId 角色ID
     * @return 角色详情
     */
    RoleInfo selectRoleInfoByRoleId(String roleId);
}
