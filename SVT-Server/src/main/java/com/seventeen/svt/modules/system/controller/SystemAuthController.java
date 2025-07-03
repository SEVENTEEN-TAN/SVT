package com.seventeen.svt.modules.system.controller;

import com.github.xiaoymin.knife4j.annotations.ApiOperationSupport;
import com.seventeen.svt.common.annotation.audit.Audit;
import com.seventeen.svt.common.constant.SystemConstant;
import com.seventeen.svt.common.response.Result;
import com.seventeen.svt.common.util.MessageUtils;
import com.seventeen.svt.common.util.RequestContextUtils;
import com.seventeen.svt.frame.cache.entity.UserDetailCache;
import com.seventeen.svt.modules.system.dto.request.GetUserDetailsDTO;
import com.seventeen.svt.modules.system.dto.response.OrgDetailDTO;
import com.seventeen.svt.modules.system.dto.response.RoleDetailDTO;
import com.seventeen.svt.modules.system.entity.UserInfo;
import com.seventeen.svt.modules.system.service.UserInfoService;
import com.seventeen.svt.modules.system.service.UserOrgRoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 用户角色控制
 */
@Tag(name = "认证管理", description = "认证相关接口")
@RestController
@Slf4j
@RequestMapping("/auth")
public class SystemAuthController {

    private final UserInfoService userInfoServiceImpl;
    private final UserOrgRoleService userOrgRoleServiceImpl;

    @Autowired
    public SystemAuthController(UserInfoService userInfoServiceImpl, UserOrgRoleService userOrgRoleServiceImpl) {
        this.userOrgRoleServiceImpl = userOrgRoleServiceImpl;
        this.userInfoServiceImpl = userInfoServiceImpl;
    }

    /**
     * 获取当前用户的机构列表
     *
     * @return 当前用户的机构列表
     */
    @Operation(summary = "获取当前用户的机构列表", description = "根据当前登录的用户(token)获取当前用户的机构列表")
    @PostMapping("/get-user-org-list")
    @ApiOperationSupport(order = 2)
    public Result<?> getUserOrgList() {
        String requestUserId = RequestContextUtils.getRequestUserId();
        List<OrgDetailDTO> orgDetailDTO = userOrgRoleServiceImpl.getUserOrgListByUserId(requestUserId);
        return Result.success(orgDetailDTO);
    }

    /**
     * 获取当前用户选择机构下的角色列表
     *
     * @param orgId 机构ID
     * @return 当前用户的角色列表
     */
    @Operation(summary = "获取当前用户选择机构下的角色列表", description = "根据当前登录的用户(token)获取当前用户选择机构下的角色列表")
    @PostMapping("/get-user-role")
    @ApiOperationSupport(order = 3)
    public Result<?> getUserRole(@RequestParam String orgId) {
        String requestUserId = RequestContextUtils.getRequestUserId();
        List<RoleDetailDTO> roleDetailDTO = userOrgRoleServiceImpl.getUserRoleListByUserId(requestUserId, orgId);
        return Result.success(roleDetailDTO);
    }

    /**
     * 获取当前用户详情
     *
     * @param userDetailsDTO 用户详情DTO
     * @return 当前用户的详情
     */
    @Operation(summary = "获取当前用户详情", description = "根据当前登录的用户(token+org+role)获取当前用户的详情")
    @PostMapping("/get-user-details")
    @ApiOperationSupport(order = 4)
    @Audit(description = "用户登录", recordResult = true, sensitive = true)
    public Result<UserDetailCache> getUserDetails(@RequestBody GetUserDetailsDTO userDetailsDTO) {
        UserDetailCache userDetailCache = userInfoServiceImpl.getUserDetails(userDetailsDTO);
        return Result.success(userDetailCache);
    }

    /**
     * 验证用户状态
     * 用于Dashboard页面验证用户当前状态
     */
    @PostMapping("/verify-user-status")
    @Operation(summary = "验证用户状态", description = "验证用户状态，包括用户是否被禁用、Token是否有效等")
    @ApiOperationSupport(order = 5)
    public Result<?> verifyUserStatus() {
        // 1. 获取当前用户信息
        String currentUserId = RequestContextUtils.getRequestUserId();
        log.debug("验证用户状态，用户ID: {}", currentUserId);

        // 2. 查询用户信息
        UserInfo userInfo = userInfoServiceImpl.getUserById(currentUserId);
        if (userInfo == null) {
            log.warn("用户不存在: {}", currentUserId);
            return Result.fail(401, MessageUtils.getMessage("user.notfound"));
        }

        // 3. 检查用户状态
        if (SystemConstant.Status.DISABLED.equals(userInfo.getStatus())) {
            log.warn("用户已被禁用: {}", currentUserId);
            return Result.fail(403, MessageUtils.getMessage("user.status.deactivate"));
        }

        log.debug("用户状态验证成功: {}", currentUserId);
        return Result.success();

    }

}
