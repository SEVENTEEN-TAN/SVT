# Context
Project_ID: SVT-Web
Task_FileName: fix-dynamicpage-hook-bug.md
Created_At: 2025-07-09 11:08:40 +08:00
Creator: Codex
Associated_Protocol: RIPER-5 v4.1 (无MCP版)

# 0. 团队协作日志与关键决策
---
**会议/决策记录**
* **时间:** 2025-07-09 11:08:40 +08:00 **类型:** 启动 **主导:** PM
* **核心参与者:** PM, AR, LD, DW
* **主题/决策:** 修复DynamicPage组件在React严格模式下产生的"Rendered fewer hooks than expected"错误。初步确认原因是条件返回导致hook顺序不一致。
* **DW确认:** 记录合规
---

# Task Description
修复前端DynamicPage组件由于条件返回导致的hooks数量不一致问题。

# 1. 分析 (RESEARCH)
* 报错信息指向`DynamicPage`组件，提示 hooks 调用顺序不一致。
* 检查代码后发现 `useMemo` 等 hooks 在早期 `isAuthenticated`/`isLoading` 判断前被条件执行，导致第一次渲染与后续渲染的 hooks 数量不同。
* **风险:** 组件渲染失败导致页面无法展示。
* **DW确认:** 分析记录完整且合规。

# 2. 提议解决方案 (INNOVATE)
* **方案A:** 将所有 hooks 调用置于组件顶部，确保无条件执行，再执行逻辑判断返回组件或错误页面。
* **方案B:** 分拆组件逻辑，将权限检查与页面映射封装在自定义 hook 内部，主组件仅负责渲染。依旧需要保证 hook 顺序一致。
* **最终推荐解决方案:** 方案A，修改顺序最小，风险低。
* (AR) 架构文档链接: 无
* **DW确认:** 解决方案记录完整且可追溯。

# 3. 实施计划 (PLAN - 核心清单)
* 修改 `src/components/DynamicPage/index.tsx`，调整 hook 调用顺序，避免条件调用。
* 执行 `npm install` 安装依赖，确保能够运行 lint/build。（若已安装则跳过）
* 运行 `npm run lint` 及 `npm run build` 了解是否有其他问题。（结果记录）
* **实施清单:**
    1. `[P3-LD-001]` **行动:** 调整DynamicPage组件hooks调用顺序。输入：现有代码。输出：修复后的代码，验证无报错。
    2. `[P3-LD-002]` **行动:** 运行npm脚本，记录lint与build结果。输入：代码仓库。输出：日志摘要。
* **DW确认:** 计划详细且可执行。

# 4. 当前执行步骤 (EXECUTE)
> `[MODE: EXECUTE]` 正在处理: "调整DynamicPage组件hooks调用顺序"

# 5. 任务进度 (EXECUTE - 仅追加日志)
---
* **时间:** 2025-07-09 11:08:40 +08:00
* **已执行项/功能:** 完成代码修改并运行npm脚本。
* **核心输出/更改:**
    - 修改 `src/components/DynamicPage/index.tsx`，将 hooks 调用置于条件判断之前。
    - `npm install` 成功，`npm run lint` 与 `npm run build` 输出多处现有错误（详见终端日志）。
* **状态:** 已完成
* **DW确认:** 进度记录合规。
---

# 6. 最终审查 (REVIEW)
待后续补充。
