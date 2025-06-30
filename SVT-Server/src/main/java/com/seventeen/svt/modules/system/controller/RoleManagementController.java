package com.seventeen.svt.modules.system.controller;


import com.github.xiaoymin.knife4j.annotations.ApiOperationSupport;
import com.seventeen.svt.common.page.PageQuery;
import com.seventeen.svt.common.page.PageResult;
import com.seventeen.svt.common.response.Result;
import com.seventeen.svt.modules.system.dto.request.InsertOrUpdateRoleDetailDTO;
import com.seventeen.svt.modules.system.dto.request.RoleConditionDTO;
import com.seventeen.svt.modules.system.dto.response.RoleDetailDTO;
import com.seventeen.svt.modules.system.service.RoleInfoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
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
     *
     * @return 角色列表
     */
    @PostMapping("/get-role-list")
    @Operation(summary = "获取角色列表", description = "获取角色列表")
    @ApiOperationSupport(order = 1)
    public Result<?> getRoleList(@RequestBody PageQuery<RoleConditionDTO> getRoleListConditionDTO) {
        PageResult<RoleDetailDTO> roleListPage = roleInfoServiceImpl.getRoleList(getRoleListConditionDTO);
        return Result.success(roleListPage);
    }

    /**
     * 获取活跃角色列表
     *
     * @return 活跃角色列表
     */
    @PostMapping("/get-active-role-list")
    @Operation(summary = "获取活跃角色列表", description = "获取活跃角色列表")
    @ApiOperationSupport(order = 2)
    public Result<?> getActiveRoleList() {
        List<RoleDetailDTO> roleList = roleInfoServiceImpl.getActiveRoleList();
        return Result.success(roleList);
    }

    /**
     * 获取角色详情
     *
     * @return 角色详情
     */
    @PostMapping("/get-role-detail")
    @Operation(summary = "获取角色详情", description = "获取角色详情")
    @ApiOperationSupport(order = 3)
    public Result<?> getRoleDetail(@RequestBody RoleConditionDTO roleConditionDTO) {
        RoleDetailDTO roleDetail = roleInfoServiceImpl.getRoleDetail(roleConditionDTO.getRoleId());
        return Result.success(roleDetail);
    }

    //新增/编辑角色
    @PostMapping("/insert-or-update-role")
    @Operation(summary = "新增/编辑角色", description = "新增/编辑角色,如果有roleId则编辑，否则新增")
    @ApiOperationSupport(order = 4)
    public Result<?> insertOrUpdateRole(@RequestBody InsertOrUpdateRoleDetailDTO insertOrUpdateRoleDetailDTO) {
        roleInfoServiceImpl.insertOrUpdateRole(insertOrUpdateRoleDetailDTO);
        return Result.success();
    }

    //获取角色下用户
//    @PostMapping("/get-role-user-list")
//    @Operation(summary = "获取角色下用户", description = "获取角色下用户")
//    @ApiOperationSupport(order = 5)
//    public Result<?> getRoleUserList(@RequestBody GetRoleDetailByIdDTO getRoleDetailByIdDTO) {
//        PageResult<UserDetailDTO> roleUserList = roleInfoServiceImpl.getRoleUserList(getRoleDetailByIdDTO.getRoleId());
//        return Result.success(roleUserList);
//    }

    //获取角色下菜单
    //删除角色
    //停用角色


}
