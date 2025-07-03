package com.seventeen.svt.modules.system.controller;

import com.github.xiaoymin.knife4j.annotations.ApiOperationSupport;
import com.seventeen.svt.common.annotation.audit.Audit;
import com.seventeen.svt.common.annotation.permission.RequiresPermission;
import com.seventeen.svt.common.page.PageQuery;
import com.seventeen.svt.common.page.PageResult;
import com.seventeen.svt.common.response.Result;
import com.seventeen.svt.modules.system.dto.request.InsertOrUpdateUserDetailDTO;
import com.seventeen.svt.modules.system.dto.request.UserConditionDTO;
import com.seventeen.svt.modules.system.dto.response.UserDetailDTO;
import com.seventeen.svt.modules.system.service.UserInfoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * 用户管理控制器
 */
@Tag(name = "用户管理", description = "用户管理")
@Slf4j
@RestController
@RequestMapping("/system/user")
public class UserManagementController {

    private final UserInfoService userInfoServiceImpl;

    @Autowired
    public UserManagementController(UserInfoService userInfoServiceImpl) {
        this.userInfoServiceImpl = userInfoServiceImpl;
    }

    /**
     * 获取用户列表
     *
     * @return 用户列表
     */
    @PostMapping("/get-user-list")
    @Operation(summary = "获取用户列表", description = "获取用户列表")
    @ApiOperationSupport(order = 1)
//    @RequiresPermission("system:user:list")
    public Result<?> getUserList(@RequestBody PageQuery<UserConditionDTO> getUserListConditionDTO) {
        PageResult<UserDetailDTO> userListPage = userInfoServiceImpl.getUserList(getUserListConditionDTO);
        return Result.success(userListPage);
    }

    /**
     * 获取活跃用户列表
     *
     * @return 活跃用户列表
     */
    @PostMapping("/get-active-user-list")
    @Operation(summary = "获取活跃用户列表", description = "获取活跃用户列表")
    @ApiOperationSupport(order = 2)
    public Result<?> getActiveUserList() {
        List<UserDetailDTO> userList = userInfoServiceImpl.getActiveUserList();
        return Result.success(userList);
    }

    /**
     * 获取用户详情
     *
     * @return 用户详情
     */
    @PostMapping("/get-user-detail")
    @Operation(summary = "获取用户详情", description = "获取用户详情")
    @ApiOperationSupport(order = 3)
//    @RequiresPermission("system:user:view")
    public Result<?> getUserDetail(@RequestBody UserConditionDTO userConditionDTO) {
        UserDetailDTO userDetail = userInfoServiceImpl.getUserDetail(userConditionDTO.getUserId());
        return Result.success(userDetail);
    }

    /**
     * 新增/编辑用户
     *
     * @param insertOrUpdateUserDetailDTO 用户信息
     * @return 操作结果
     */
    @PostMapping("/insert-or-update-user")
    @Operation(summary = "新增/编辑用户", description = "新增/编辑用户,如果有userId则编辑，否则新增")
    @ApiOperationSupport(order = 4)
//    @RequiresPermission("system:user:edit")
    @Audit(description = "用户管理新增/编辑用户")
    public Result<?> insertOrUpdateUser(@Valid @RequestBody InsertOrUpdateUserDetailDTO insertOrUpdateUserDetailDTO) {
        userInfoServiceImpl.insertOrUpdateUser(insertOrUpdateUserDetailDTO);
        return Result.success();
    }

    /**
     * 更新用户状态
     *
     * @param userConditionDTO 用户条件DTO（包含userId和status）
     * @return 操作结果
     */
    @PostMapping("/update-user-status")
    @Operation(summary = "更新用户状态", description = "启用或停用用户")
    @ApiOperationSupport(order = 5)
//    @RequiresPermission("system:user:status")
    @Audit(description = "用户管理更新用户状态")
    public Result<?> updateUserStatus(@RequestBody UserConditionDTO userConditionDTO) {
        userInfoServiceImpl.updateUserStatus(userConditionDTO.getUserId(), userConditionDTO.getStatus());
        return Result.success();
    }

    /**
     * 删除用户
     *
     * @param userConditionDTO 用户条件DTO（包含userId）
     * @return 操作结果
     */
    @PostMapping("/delete-user")
    @Operation(summary = "删除用户", description = "删除指定用户")
    @ApiOperationSupport(order = 6)
//    @RequiresPermission("system:user:delete")
    @Audit(description = "用户管理删除用户")
    public Result<?> deleteUser(@RequestBody UserConditionDTO userConditionDTO) {
        userInfoServiceImpl.deleteUser(userConditionDTO.getUserId());
        return Result.success();
    }

    /**
     * 批量更新用户状态
     *
     * @param userIds 用户ID列表
     * @param status 状态值
     * @return 操作结果
     */
    @PostMapping("/batch-update-status")
    @Operation(summary = "批量更新用户状态", description = "批量启用或停用用户")
    @ApiOperationSupport(order = 7)
//    @RequiresPermission("system:user:status")
    @Audit(description = "用户管理批量更新用户状态")
    public Result<?> batchUpdateStatus(@RequestParam List<String> userIds, 
                                       @RequestParam @Parameter(description = "状态：0-启用，1-停用") String status) {
        userInfoServiceImpl.batchUpdateStatus(userIds, status);
        return Result.success();
    }

    /**
     * 批量删除用户
     *
     * @param userIds 用户ID列表
     * @return 操作结果
     */
    @PostMapping("/batch-delete")
    @Operation(summary = "批量删除用户", description = "批量删除用户")
    @ApiOperationSupport(order = 8)
//    @RequiresPermission("system:user:delete")
    @Audit(description = "用户管理批量删除用户")
    public Result<?> batchDelete(@RequestParam List<String> userIds) {
        userInfoServiceImpl.batchDelete(userIds);
        return Result.success();
    }

    /**
     * 分配用户角色
     *
     * @param userId 用户ID
     * @param roleIds 角色ID列表
     * @return 操作结果
     */
    @PostMapping("/assign-user-roles")
    @Operation(summary = "分配用户角色", description = "为用户分配角色")
    @ApiOperationSupport(order = 9)
//    @RequiresPermission("system:user:role")
    @Audit(description = "用户管理分配用户角色")
    public Result<?> assignUserRoles(@RequestParam String userId, @RequestParam List<String> roleIds) {
        userInfoServiceImpl.assignUserRoles(userId, roleIds);
        return Result.success();
    }

    /**
     * 分配用户机构
     *
     * @param userId 用户ID
     * @param orgIds 机构ID列表
     * @param primaryOrgId 主机构ID
     * @return 操作结果
     */
    @PostMapping("/assign-user-orgs")
    @Operation(summary = "分配用户机构", description = "为用户分配机构")
    @ApiOperationSupport(order = 10)
//    @RequiresPermission("system:user:org")
    @Audit(description = "用户管理分配用户机构")
    public Result<?> assignUserOrgs(@RequestParam String userId, 
                                    @RequestParam List<String> orgIds,
                                    @RequestParam(required = false) String primaryOrgId) {
        userInfoServiceImpl.assignUserOrgs(userId, orgIds, primaryOrgId);
        return Result.success();
    }

    /**
     * 获取用户角色列表
     *
     * @param userConditionDTO 用户条件DTO（包含userId）
     * @return 角色ID列表
     */
    @PostMapping("/get-user-roles")
    @Operation(summary = "获取用户角色", description = "获取指定用户的角色列表")
    @ApiOperationSupport(order = 11)
//    @RequiresPermission("system:user:view")
    public Result<?> getUserRoles(@RequestBody UserConditionDTO userConditionDTO) {
        List<String> roleIds = userInfoServiceImpl.getUserRoleIds(userConditionDTO.getUserId());
        return Result.success(roleIds);
    }

    /**
     * 获取用户机构列表
     *
     * @param userConditionDTO 用户条件DTO（包含userId）
     * @return 机构ID列表
     */
    @PostMapping("/get-user-orgs")
    @Operation(summary = "获取用户机构", description = "获取指定用户的机构列表")
    @ApiOperationSupport(order = 12)
//    @RequiresPermission("system:user:view")
    public Result<?> getUserOrgs(@RequestBody UserConditionDTO userConditionDTO) {
        List<String> orgIds = userInfoServiceImpl.getUserOrgIds(userConditionDTO.getUserId());
        return Result.success(orgIds);
    }

    /**
     * 重置用户密码
     *
     * @param userId 用户ID
     * @param newPassword 新密码
     * @return 操作结果
     */
    @PostMapping("/reset-password")
    @Operation(summary = "重置用户密码", description = "重置指定用户的密码")
    @ApiOperationSupport(order = 13)
//    @RequiresPermission("system:user:password")
    @Audit(description = "用户管理重置用户密码")
    public Result<?> resetPassword(@RequestParam String userId, @RequestParam String newPassword) {
        userInfoServiceImpl.resetPassword(userId, newPassword);
        return Result.success();
    }

    /**
     * 验证登录ID唯一性
     *
     * @param loginId 登录ID
     * @param userId 用户ID（可选，编辑时传入）
     * @return 验证结果
     */
    @GetMapping("/validate-login-id")
    @Operation(summary = "验证登录ID", description = "验证登录ID是否可用")
    @ApiOperationSupport(order = 14)
    public Result<?> validateLoginId(@RequestParam String loginId, 
                                     @RequestParam(required = false) String userId) {
        boolean isAvailable = userInfoServiceImpl.validateLoginId(loginId, userId);
        return Result.success(isAvailable);
    }

}