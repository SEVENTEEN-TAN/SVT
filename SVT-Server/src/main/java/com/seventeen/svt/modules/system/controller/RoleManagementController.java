package com.seventeen.svt.modules.system.controller;

import com.github.xiaoymin.knife4j.annotations.ApiOperationSupport;
import com.seventeen.svt.common.annotation.audit.Audit;
import com.seventeen.svt.common.page.PageQuery;
import com.seventeen.svt.common.page.PageResult;
import com.seventeen.svt.common.response.Result;
import com.seventeen.svt.modules.system.dto.request.InsertOrUpdateRoleDetailDTO;
import com.seventeen.svt.modules.system.dto.request.RoleConditionDTO;
import com.seventeen.svt.modules.system.dto.response.RoleDetailDTO;
import com.seventeen.svt.modules.system.service.RoleInfoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

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
//    @RequiresPermission("system:role:list")
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
//    @RequiresPermission("system:role:view")
    public Result<?> getRoleDetail(@RequestBody RoleConditionDTO roleConditionDTO) {
        RoleDetailDTO roleDetail = roleInfoServiceImpl.getRoleDetail(roleConditionDTO.getRoleId());
        return Result.success(roleDetail);
    }

    /**
     * 新增/编辑角色
     *
     * @param insertOrUpdateRoleDetailDTO 角色信息
     * @return 操作结果
     */
    @PostMapping("/insert-or-update-role")
    @Operation(summary = "新增/编辑角色", description = "新增/编辑角色,如果有roleId则编辑，否则新增")
    @ApiOperationSupport(order = 4)
//    @RequiresPermission("system:role:edit")
    @Audit(description = "角色管理新增/编辑角色")
    public Result<?> insertOrUpdateRole(@RequestBody InsertOrUpdateRoleDetailDTO insertOrUpdateRoleDetailDTO) {
        roleInfoServiceImpl.insertOrUpdateRole(insertOrUpdateRoleDetailDTO);
        return Result.success();
    }

    /**
     * 更新角色状态
     *
     * @param roleConditionDTO 角色条件DTO（包含roleId和status）
     * @return 操作结果
     */
    @PostMapping("/update-role-status")
    @Operation(summary = "更新角色状态", description = "启用或停用角色")
    @ApiOperationSupport(order = 5)
//    @RequiresPermission("system:role:status")
    @Audit(description = "角色管理更新角色状态")
    public Result<?> updateRoleStatus(@RequestBody RoleConditionDTO roleConditionDTO) {
        roleInfoServiceImpl.updateRoleStatus(roleConditionDTO.getRoleId(), roleConditionDTO.getStatus());
        return Result.success();
    }

    /**
     * 删除角色
     *
     * @param roleConditionDTO 角色条件DTO（包含roleId）
     * @return 操作结果
     */
    @PostMapping("/delete-role")
    @Operation(summary = "删除角色", description = "删除指定角色")
    @ApiOperationSupport(order = 6)
//    @RequiresPermission("system:role:delete")
    @Audit(description = "角色管理删除角色")
    public Result<?> deleteRole(@RequestBody RoleConditionDTO roleConditionDTO) {
        roleInfoServiceImpl.deleteRole(roleConditionDTO.getRoleId());
        return Result.success();
    }

    /**
     * 批量更新角色状态
     *
     * @param roleIds 角色ID列表
     * @param status  状态值
     * @return 操作结果
     */
    @PostMapping("/batch-update-status")
    @Operation(summary = "批量更新角色状态", description = "批量启用或停用角色")
    @ApiOperationSupport(order = 7)
//    @RequiresPermission("system:role:status")
    @Audit(description = "角色管理批量更新角色状态")
    public Result<?> batchUpdateStatus(@RequestParam List<String> roleIds,
                                       @RequestParam @Parameter(description = "状态：0-启用，1-停用") String status) {
        roleInfoServiceImpl.batchUpdateStatus(roleIds, status);
        return Result.success();
    }

//    /**
//     * 获取角色关联的用户列表
//     *
//     * @param roleConditionDTO 角色条件DTO（包含roleId）
//     * @return 用户列表
//     */
//    @PostMapping("/get-role-user-list")
//    @Operation(summary = "获取角色关联用户", description = "获取指定角色关联的用户列表")
//    @ApiOperationSupport(order = 9)
////    @RequiresPermission("system:role:view")
//    public Result<?> getRoleUserList(@RequestBody RoleConditionDTO roleConditionDTO) {
//        List<String> userList = roleInfoServiceImpl.getRoleUserList(roleConditionDTO.getRoleId());
//        return Result.success(userList);
//    }
//
//    /**
//     * 获取角色关联的用户详细信息列表
//     *
//     * @param roleConditionDTO 角色条件DTO（包含roleId）
//     * @return 用户详细信息列表
//     */
//    @PostMapping("/get-role-user-detail-list")
//    @Operation(summary = "获取角色关联用户详细信息", description = "获取指定角色关联的用户详细信息列表")
//    @ApiOperationSupport(order = 10)
////    @RequiresPermission("system:role:view")
//    public Result<?> getRoleUserDetailList(@RequestBody RoleConditionDTO roleConditionDTO) {
//        List<com.seventeen.svt.modules.system.dto.response.UserDetailDTO> userDetailList =
//                roleInfoServiceImpl.getRoleUserDetailList(roleConditionDTO.getRoleId());
//        return Result.success(userDetailList);
//    }
//
//    /**
//     * 获取角色关联的权限列表
//     *
//     * @param roleConditionDTO 角色条件DTO（包含roleId）
//     * @return 权限列表
//     */
//    @PostMapping("/get-role-permission-list")
//    @Operation(summary = "获取角色权限列表", description = "获取指定角色关联的权限列表")
//    @ApiOperationSupport(order = 11)
////    @RequiresPermission("system:role:view")
//    public Result<?> getRolePermissionList(@RequestBody RoleConditionDTO roleConditionDTO) {
//        List<com.seventeen.svt.modules.system.dto.response.PermissionDetailDTO> permissionList =
//                roleInfoServiceImpl.getRolePermissionList(roleConditionDTO.getRoleId());
//        return Result.success(permissionList);
//    }
//
//    /**
//     * 分配角色权限
//     *
//     * @param roleId        角色ID
//     * @param permissionIds 权限ID列表
//     * @return 操作结果
//     */
//    @PostMapping("/assign-role-permissions")
//    @Operation(summary = "分配角色权限", description = "为指定角色分配权限")
//    @ApiOperationSupport(order = 12)
////    @RequiresPermission("system:role:permission")
//    @Audit(description = "角色管理分配角色权限")
//    public Result<?> assignRolePermissions(@RequestParam String roleId,
//                                           @RequestParam List<String> permissionIds) {
//        roleInfoServiceImpl.assignRolePermissions(roleId, permissionIds);
//        return Result.success();
//    }
//
//    /**
//     * 获取所有权限列表
//     *
//     * @return 权限列表
//     */
//    @PostMapping("/get-all-permissions")
//    @Operation(summary = "获取所有权限", description = "获取系统中所有可用权限")
//    @ApiOperationSupport(order = 13)
////    @RequiresPermission("system:role:view")
//    public Result<?> getAllPermissions() {
//        List<com.seventeen.svt.modules.system.dto.response.PermissionDetailDTO> permissionList =
//                roleInfoServiceImpl.getAllPermissions();
//        return Result.success(permissionList);
//    }
//
//    /**
//     * 更新角色用户关联
//     *
//     * @param roleId  角色ID
//     * @param userIds 用户ID列表
//     * @return 操作结果
//     */
//    @PostMapping("/assign-role-users")
//    @Operation(summary = "分配角色用户", description = "为指定角色分配用户")
//    @ApiOperationSupport(order = 14)
////    @RequiresPermission("system:role:user")
//    @Audit(description = "角色管理分配角色用户")
//    public Result<?> assignRoleUsers(@RequestParam String roleId,
//                                     @RequestParam List<String> userIds) {
//        roleInfoServiceImpl.assignRoleUsers(roleId, userIds);
//        return Result.success();
//    }

}
