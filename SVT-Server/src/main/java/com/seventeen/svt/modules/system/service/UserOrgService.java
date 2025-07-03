package com.seventeen.svt.modules.system.service;

import com.mybatisflex.core.service.IService;
import com.seventeen.svt.modules.system.dto.response.OrgDetailDTO;
import com.seventeen.svt.modules.system.entity.UserOrg;

import java.util.List;

/**
 * 针对表【user_org(用户机构关联表)】的数据库操作Service
 */
public interface UserOrgService extends IService<UserOrg> {

    /**
     * 根据用户ID查询用户机构列表
     *
     * @param userId 用户ID
     * @return 用户机构列表
     */
    List<OrgDetailDTO> getUserOrgListByUserId(String userId);

    /**
     * 根据用户ID查询用户机构ID列表
     *
     * @param userId 用户ID
     * @return 机构ID列表
     */
    List<String> getUserOrgIdsByUserId(String userId);

    /**
     * 删除用户的所有机构关联
     *
     * @param userId 用户ID
     */
    void deleteUserOrgsByUserId(String userId);

    /**
     * 为用户添加机构关联
     *
     * @param userId 用户ID
     * @param orgIds 机构ID列表
     * @param primaryOrgId 主机构ID
     */
    void addUserOrgs(String userId, List<String> orgIds, String primaryOrgId);
}
