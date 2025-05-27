package com.seventeen.svt.modules.system.controller;

import com.seventeen.svt.common.annotation.permission.RequiresPermission;
import com.seventeen.svt.common.response.Result;
import com.seventeen.svt.modules.system.entity.UserInfo;
import com.seventeen.svt.modules.system.service.AuditLogService;
import com.seventeen.svt.modules.system.service.UserInfoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 测试控制器
 */
@Tag(name = "测试接口", description = "用于系统测试的相关接口")
@RestController
@RequestMapping("/test")
public class TestController {
    
    private final UserInfoService userInfoServiceImpl;
    private final AuditLogService auditLogServiceImpl;

    @Autowired
    public TestController(UserInfoService userInfoServiceImpl, AuditLogService auditLogServiceImpl) {
        this.userInfoServiceImpl = userInfoServiceImpl;
        this.auditLogServiceImpl = auditLogServiceImpl;
    }

    /**
     * 测试接口
     * @return 测试结果
     */
    @Operation(summary = "测试接口", description = "用于测试系统是否正常运行")
    @GetMapping("/hello")
    @RequiresPermission(value = "aa",requireAll = true)
    public Result<String> hello() {
        return Result.success("Hello, OCBC Risk Management System!");
    }

    /**
     * 测试新增用户接口
     * @return 新增结果
     */
    @Operation(summary = "测试新增用户接口", description = "测试用户新增")
    @GetMapping("/addUserTest")
    public Result<?> addUserTest(){
        UserInfo userInfo = UserInfo.builder()
                .loginId("test001")
                .password("xxxxxx")
                .userNameEn("En")
                .userNameZh("Zh")
                .build();
        userInfoServiceImpl.addUser(userInfo);
        return Result.success();
    }

    /**
     * 测试删除审计接口
     * @param auditId 审计ID
     * @return 删除结果
     */
    @Operation(summary = "测试删除审计接口", description = "测试删除审计接口")
    @GetMapping("/deleteAuditTest")
    public Result<?> deleteAuditTest(String auditId){
        auditLogServiceImpl.deleteAuditTest(auditId);
        return Result.success();
    }
}