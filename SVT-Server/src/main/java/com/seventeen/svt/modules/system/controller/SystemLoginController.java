package com.seventeen.svt.modules.system.controller;

import com.github.xiaoymin.knife4j.annotations.ApiOperationSupport;
import com.seventeen.svt.common.response.Result;
import com.seventeen.svt.common.util.RequestContextUtils;
import com.seventeen.svt.frame.cache.entity.UserDetailCache;
import com.seventeen.svt.modules.system.dto.request.GetUserDetailsDTO;
import com.seventeen.svt.modules.system.service.UserInfoService;
import com.seventeen.svt.modules.system.service.UserOrgService;
import com.seventeen.svt.modules.system.service.UserRoleService;
import com.seventeen.svt.modules.system.dto.response.GetUserOrgVO;
import com.seventeen.svt.modules.system.dto.response.GetUserRoleVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * 用户角色控制
 */
@Tag(name = "角色管理", description = "只要用于系统角色的管理")
@RestController
@Slf4j
@RequestMapping("/login")
public class SystemLoginController {

    private final UserOrgService userOrgServiceImpl;
    private final UserRoleService userRoleServiceImpl;
    private final UserInfoService userInfoServiceImpl;

    @Autowired
    public SystemLoginController(UserOrgService userOrgServiceImpl, UserRoleService userRoleServiceImpl, UserInfoService userInfoServiceImpl) {
        this.userOrgServiceImpl = userOrgServiceImpl;
        this.userRoleServiceImpl = userRoleServiceImpl;
        this.userInfoServiceImpl = userInfoServiceImpl;
    }

    /**
     * 获取当前用户的机构列表
     * @return 当前用户的机构列表
     */
    @Operation(summary = "获取当前用户的机构列表", description = "根据当前登录的用户(token)获取当前用户的机构列表")
    @GetMapping("/get-user-org-list")
    @ApiOperationSupport(order = 1)
    public Result<GetUserOrgVO> getUserOrgList() {
        String requestUserId = RequestContextUtils.getRequestUserId();
        GetUserOrgVO  getUserOrgVO = userOrgServiceImpl.getUserOrgListByUserId(requestUserId);
        return Result.success(getUserOrgVO);
    }

    /**
     * 获取当前用户的角色列表
     * @return 当前用户的角色列表
     */
    @Operation(summary = "获取当前用户的角色列表", description = "根据当前登录的用户(token)获取当前用户的角色列表")
    @GetMapping("/get-user-role")
    @ApiOperationSupport(order = 2)
    public Result<GetUserRoleVO> getUserRole() {
        String requestUserId = RequestContextUtils.getRequestUserId();
        GetUserRoleVO  getUserRoleVO = userRoleServiceImpl.getUserRoleListByUserId(requestUserId);
        return Result.success(getUserRoleVO);
    }

    /**
     * 获取当前用户详情
     * @param userDetailsDTO 用户详情DTO
     * @return 当前用户的详情
     */
    @Operation(summary = "获取当前用户详情", description = "根据当前登录的用户(token+org+role)获取当前用户的详情")
    @PostMapping("/get-user-details")
    @ApiOperationSupport(order = 3)
    public Result<UserDetailCache> getUserDetails(@RequestBody GetUserDetailsDTO userDetailsDTO) {
        UserDetailCache userDetailCache = userInfoServiceImpl.getUserDetails(userDetailsDTO);
        return Result.success(userDetailCache);
    }
}
