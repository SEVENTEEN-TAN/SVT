package com.seventeen.svt.modules.system.service;

import com.mybatisflex.core.service.IService;
import com.seventeen.svt.common.page.PageQuery;
import com.seventeen.svt.common.page.PageResult;
import com.seventeen.svt.frame.cache.entity.UserDetailCache;
import com.seventeen.svt.modules.system.dto.request.GetUserDetailsDTO;
import com.seventeen.svt.modules.system.dto.request.InsertOrUpdateUserDetailDTO;
import com.seventeen.svt.modules.system.dto.request.UserConditionDTO;
import com.seventeen.svt.modules.system.dto.response.UserDetailDTO;
import com.seventeen.svt.modules.system.entity.UserInfo;

import java.util.List;

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
     * 添加用户
     * @param userInfo 用户信息
     */
    void addUser(UserInfo userInfo);

    /**
     * 根据用户ID查询用户详情
     * @param userDetailsDTO 用户详情DTO
     * @return 用户详情
     */
    UserDetailCache getUserDetails(GetUserDetailsDTO userDetailsDTO);

    /**
     * 删除用户
     * @param userId 用户ID
     */
    void deleteUserTest(String userId);

    // ==================== 用户管理扩展接口 ====================

    /**
     * 根据用户ID获取用户详情
     *
     * @param userId 用户ID
     * @return 用户详情
     */
    UserInfo selectUserInfoByUserId(String userId);

    /**
     * 获取用户列表（分页）
     *
     * @param getUserListConditionDTO 查询条件
     * @return 用户列表
     */
    PageResult<UserDetailDTO> getUserList(PageQuery<UserConditionDTO> getUserListConditionDTO);

    /**
     * 获取所有启用的用户列表
     *
     * @return 用户列表
     */
    List<UserDetailDTO> getActiveUserList();

    /**
     * 获取用户详情
     *
     * @param userId 用户ID
     * @return 用户详情
     */
    UserDetailDTO getUserDetail(String userId);

    /**
     * 新增/编辑用户
     *
     * @param editUserDetailDTO 编辑用户DTO
     */
    void insertOrUpdateUser(InsertOrUpdateUserDetailDTO editUserDetailDTO);

    /**
     * 更新用户状态
     *
     * @param userId 用户ID
     * @param status 状态（0：启用，1：停用）
     */
    void updateUserStatus(String userId, String status);

    /**
     * 删除用户
     *
     * @param userId 用户ID
     */
    void deleteUser(String userId);

    /**
     * 批量更新用户状态
     *
     * @param userIds 用户ID列表
     * @param status 状态（0：启用，1：停用）
     */
    void batchUpdateStatus(List<String> userIds, String status);

    /**
     * 批量删除用户
     *
     * @param userIds 用户ID列表
     */
    void batchDelete(List<String> userIds);

    /**
     * 分配用户角色
     *
     * @param userId 用户ID
     * @param roleIds 角色ID列表
     */
    void assignUserRoles(String userId, List<String> roleIds);

    /**
     * 分配用户机构
     *
     * @param userId 用户ID
     * @param orgIds 机构ID列表
     * @param primaryOrgId 主机构ID
     */
    void assignUserOrgs(String userId, List<String> orgIds, String primaryOrgId);

    /**
     * 获取用户角色列表
     *
     * @param userId 用户ID
     * @return 角色ID列表
     */
    List<String> getUserRoleIds(String userId);

    /**
     * 获取用户机构列表
     *
     * @param userId 用户ID
     * @return 机构ID列表
     */
    List<String> getUserOrgIds(String userId);

    /**
     * 重置用户密码
     *
     * @param userId 用户ID
     * @param newPassword 新密码
     */
    void resetPassword(String userId, String newPassword);

    /**
     * 验证登录ID唯一性
     *
     * @param loginId 登录ID
     * @param userId 用户ID（编辑时排除自身）
     * @return 是否可用
     */
    boolean validateLoginId(String loginId, String userId);
}
