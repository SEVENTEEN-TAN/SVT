package com.seventeen.svt.modules.system.controller;


import com.github.xiaoymin.knife4j.annotations.ApiOperationSupport;
import com.seventeen.svt.common.response.Result;
import com.seventeen.svt.modules.system.dto.response.GetRoleListDTO;
import com.seventeen.svt.modules.system.service.RoleInfoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 角色管理控制器
 */
@Tag(name = "角色管理", description = "角色管理")
@Slf4j
@RestController
@RequestMapping("/system/role")
public class RoleManagementController {

    private final RoleInfoService roleInfoServiceImpl;

    @Autowired
    public RoleManagementController(RoleInfoService roleInfoServiceImpl) {
        this.roleInfoServiceImpl = roleInfoServiceImpl;
    }

    /**
     * 获取角色列表
     * @return 角色列表
     */
    @PostMapping("/get-role-list")
    @Operation(summary = "获取角色列表", description = "获取角色列表")
    @ApiOperationSupport(order = 1)
    public Result<?> getRoleList() {
        List<GetRoleListDTO> roleList = roleInfoServiceImpl.getRoleList();
        return Result.success(roleList);
    }

    /**
     * 获取活跃角色列表
     * @return 活跃角色列表
     */
    @PostMapping("/get-active-role-list")
    @Operation(summary = "获取活跃角色列表", description = "获取活跃角色列表")
    @ApiOperationSupport(order = 2)
    public Result<?> getActiveRoleList() {
        List<GetRoleListDTO> roleList = roleInfoServiceImpl.getActiveRoleList();
        return Result.success(roleList);
    }





    //获取角色详情
    //新增角色
    //编辑角色
    //删除角色
    //分配菜单
    //分配权限

}
