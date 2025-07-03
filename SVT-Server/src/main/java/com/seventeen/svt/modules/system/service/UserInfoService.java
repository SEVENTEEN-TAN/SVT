package com.seventeen.svt.modules.system.service;

import com.mybatisflex.core.service.IService;
import com.seventeen.svt.frame.cache.entity.UserDetailCache;
import com.seventeen.svt.modules.system.dto.request.GetUserDetailsDTO;
import com.seventeen.svt.modules.system.entity.UserInfo;

/**
 * 针对表【user_info(用户表)】的数据库操作Service
 */
public interface UserInfoService extends IService<UserInfo> {

    /**
     * 根据登录ID查询用户信息
     *
     * @param loginId 用户ID
     * @return 用户信息
     */
    UserInfo getUserById(String loginId);

    /**
     * 根据用户ID查询用户详情
     *
     * @param userDetailsDTO 用户详情DTO
     * @return 用户详情
     */
    UserDetailCache getUserDetails(GetUserDetailsDTO userDetailsDTO);

    /**
     * 删除用户
     *
     * @param userId 用户ID
     */
    void deleteUserTest(String userId);
}
