package com.seventeen.svt.modules.system.controller;


import com.github.xiaoymin.knife4j.annotations.ApiOperationSupport;
import com.seventeen.svt.common.response.Result;
import com.seventeen.svt.common.util.TreeUtils;
import com.seventeen.svt.modules.system.dto.request.*;
import com.seventeen.svt.modules.system.dto.response.GetMenuDetail;
import com.seventeen.svt.modules.system.service.MenuInfoService;
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
 * 菜单管理控制器
 */
@Tag(name = "菜单管理", description = "菜单管理")
@Slf4j
@RestController
@RequestMapping("/system/menu")
public class MenuManagementController {

    private final MenuInfoService menuInfoServiceImpl;

    @Autowired
    public MenuManagementController(MenuInfoService menuInfoServiceImpl) {
        this.menuInfoServiceImpl = menuInfoServiceImpl;
    }

    /**
     * 获取菜单树
     * @return 菜单树
     */
    @PostMapping("/get-all-menu-tree")
    @Operation(summary = "获取菜单树", description = "获取菜单树")
    @ApiOperationSupport(order = 1)
    public Result<?> getAllMenuTree() {
        List<TreeUtils.MenuTreeVO> menuTreeVOS = menuInfoServiceImpl.getAllMenuTree();
        return Result.success(menuTreeVOS);
    }

    /**
     * 更新菜单状态
     * @param updateMenuStatusDTO 更新菜单状态DTO
     * @return 更新结果
     */
    @PostMapping("/update-menu-status")
    @Operation(summary = "更新菜单状态", description = "更新菜单状态")
    @ApiOperationSupport(order = 2)
    public Result<?> updateMenuStatus(@RequestBody UpdateMenuStatusDTO updateMenuStatusDTO) {
        menuInfoServiceImpl.updateMenuStatus(updateMenuStatusDTO);
        return Result.success();
    }

    /**
     * 更新菜单排序
     * @return 更新结果
     */
    @PostMapping("/update-menu-sort")
    @Operation(summary = "更新菜单排序", description = "更新菜单排序")
    @ApiOperationSupport(order = 3)
    public Result<?> updateMenuSort(@RequestBody UpdateMenuSortDTO updateMenuSortDTO) {
        menuInfoServiceImpl.updateMenuSort(updateMenuSortDTO);
        return Result.success();
    }

    /**
     * 新增/编辑菜单
     * @param editMenuDTO 编辑菜单DTO
     * @return 新增/编辑结果
     */
    @PostMapping("/edit-menu")
    @Operation(summary = "新增/编辑菜单", description = "新增/编辑菜单,如果有menuId则编辑，否则新增")
    @ApiOperationSupport(order = 4)
    public Result<?> editMenu(@RequestBody EditMenuDTO editMenuDTO) {
        menuInfoServiceImpl.editMenu(editMenuDTO);
        return Result.success();
    }

    /**
     * 获取指定菜单详情
     * @param getMenuDetailDTO 菜单ID
     * @return 菜单详情
     */
    @PostMapping("/get-menu-detail")
    @Operation(summary = "获取指定菜单详情", description = "获取指定菜单详情")
    @ApiOperationSupport(order = 5)
    public Result<?> getMenuDetail(@RequestBody GetMenuDetailDTO getMenuDetailDTO) {
        GetMenuDetail menuDetail = menuInfoServiceImpl.getMenuDetail(getMenuDetailDTO);
        return Result.success(menuDetail);
    }

    /**
     * 删除菜单
     * @param deleteMenuDTO 删除菜单DTO
     * @return 删除结果
     */
    @PostMapping("/delete-menu")
    @Operation(summary = "删除菜单", description = "删除菜单")
    @ApiOperationSupport(order = 6)
    public Result<?> deleteMenu(@RequestBody DeleteMenuDTO deleteMenuDTO) {
        menuInfoServiceImpl.deleteMenu(deleteMenuDTO);
        return Result.success();
    }
}
