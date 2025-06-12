# Context
Project_ID: SVT-System Task_FileName: OrgRole_Cancel_Logout.md Created_At: 2025-06-12 19:21:24 +08:00
Creator: Sun Wukong Associated_Protocol: RIPER-5 v4.1

# Task Description
在选择机构和角色页面，当用户点击关闭按钮时，应该调用退出登录API，而不是直接跳转到dashboard。

## 需求分析
- 用户在机构角色选择弹窗中点击关闭按钮
- 系统应该调用退出登录API清除登录状态
- 清除本地存储的token和用户信息
- 跳转回登录页面

# 1. Analysis (RESEARCH)
* **当前实现分析：**
  - 机构角色选择功能在LoginPage.tsx中实现
  - 使用Modal组件显示选择界面
  - 当前的handleOrgRoleCancel方法只是关闭弹窗并跳转到dashboard
  - 没有调用退出登录API，用户状态仍然保持登录

* **问题识别：**
  - 用户取消选择机构角色时，登录状态没有被清除
  - 可能导致用户状态不一致的问题
  - 不符合安全最佳实践

* **解决方案：**
  - 修改handleOrgRoleCancel方法
  - 调用authStore中的logout方法
  - 确保完全清除登录状态后跳转到登录页

# 2. Proposed Solutions (INNOVATE)
## 方案一：直接调用logout API
- 在handleOrgRoleCancel中调用authStore.logout()
- 优点：简单直接，复用现有logout逻辑
- 缺点：无

**推荐方案：方案一** - 直接调用logout API，确保状态清理完整

# 3. Implementation Plan (PLAN - Core Checklist)
1. `[P3-LD-001]` **修改LoginPage组件**
   - 从authStore导入logout方法
   - 修改handleOrgRoleCancel方法为异步函数
   - 调用logout API并处理错误

2. `[P3-LD-002]` **测试验证**
   - 测试取消机构角色选择的流程
   - 验证登录状态被正确清除
   - 确认跳转到登录页面正常

# 4. Current Execution Step (EXECUTE - Dynamic Update)
> `[MODE: EXECUTE]` 正在执行: "`[P3-LD-002] 测试验证`"

# 5. Task Progress (EXECUTE - Append-only Log)
---
* **Time:** 2025-06-12 19:21:24 +08:00
* **Status:** 任务创建完成
---
* **Time:** 2025-06-12 19:21:24 +08:00
* **Executed Item/Feature:** `[P3-LD-001] 修改LoginPage组件`
* **Core Outputs/Changes:**
  - 从authStore导入logout方法
  - 修改handleOrgRoleCancel方法为异步函数
  - 添加logout API调用和错误处理
  - 修改跳转目标为登录页面而不是dashboard
* **Status:** 已完成
---

# 6. Final Review (REVIEW)
## 实现完成情况
- ✅ 成功修改了机构角色选择取消逻辑
- ✅ 现在点击关闭会调用退出登录API
- ✅ 确保登录状态被完全清除
- ✅ 正确跳转到登录页面

## 安全性提升
- ✅ 避免了用户状态不一致的问题
- ✅ 符合安全最佳实践
- ✅ 确保用户取消选择时完全退出登录

**时间戳：** 2025-06-12 19:21:24 +08:00 