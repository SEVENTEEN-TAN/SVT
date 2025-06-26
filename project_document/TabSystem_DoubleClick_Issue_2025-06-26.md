# Context
Project_ID: SVT-Web Task_FileName: TabSystem_DoubleClick_Issue Created_At: 2025-06-26 16:00:01 +08:00
Creator: AI Assistant (Sun Wukong) Associated_Protocol: RIPER-5 v4.1

# 0. Team Collaboration Log & Key Decisions
---
**Meeting/Decision Record** (timestamp via mcp.server_time)
* **Time:** 2025-06-26 16:00:01 +08:00 **Type:** Kickoff **Lead:** PM
* **Core Participants:** PM, PDM, AR, LD, DW
* **Topic/Decision:** Investigate Tab switching requiring double click in TabSystem. 
* **DW Confirmation:** [Pending]
---

# Task Description
User reports that switching tabs sometimes requires two clicks in TabSystem of SVT-Web. Need to identify cause and propose fix.

# 1. Analysis (RESEARCH)
* Initial hypothesis: `isOperatingRef` lock in `useTabManager.switchTab` prevents rapid successive operations; holding for 600ms causes first click to be ignored when previous operation ongoing.
* `switchTab` sets `isOperatingRef` true and only resets after 600ms. If user clicks another tab within this window (after loading overlay vanishes but before 600ms), the click is ignored, thus needing second click.
* Risk: Poor UX, user confusion. No security risk.
* Related Code: `SVT-Web/src/components/Layout/modules/TabSystem/hooks/useTabManager.ts` lines ~160–210.
* (AR) Preliminary architecture assessment: state lock could be replaced with queue or shorter delay; consider using `transitionend` or promise after navigation.
* (LD) Suggest reducing lock duration or using `disable` logic per tab.
* **DW Confirmation:** [Pending] 

# 2. Proposed Solutions (INNOVATE)
* **Solution A: 缩短锁定时长**
  * **做法**：将 `switchTab` 中重置 `isOperatingRef` 的延迟由 600 ms 减至 150–200 ms（与蒙层动画时长一致）。
  * **优点**：改动最小，实施快速；风险低；几乎不影响原有防抖逻辑。
  * **缺点**：仍依赖固定时间，极端慢网速下可能偶发；只是缓解，非彻底解决。
  * **ROI**：高（5 分钟改完，体验显著提升）。
  * **测试性**：单元测试检查定时器；E2E 需验证连续点击一次即生效。

* **Solution B: 动态解锁（首选）**
  * **做法**：去掉固定 `setTimeout`，改为：
    1. `navigate(targetKey)` 之后，监听 `location.pathname` 变化或 `useNavigationType` 完成事件后立即把 `isOperatingRef` 设回 `false`；
    2. 或在 `handleRefresh` 完成（蒙层关闭后）回调中解锁。
  * **优点**：锁定时长随真正导航/渲染完成而定，更精准；彻底解决双击，兼容慢网速。
  * **缺点**：实现稍复杂，需要增加监听或 Promise；需谨慎避免竞态。
  * **ROI**：中高；一次性投入（≈30 分钟），长期最优体验。
  * **测试性**：可通过 mock 路由变更或 Loading 结束事件断言锁状态；E2E 连续快速点击应一次生效。

* **Solution C: 移除全局锁 + 局部按钮禁用**
  * **做法**：删除 `isOperatingRef`，在 TabBar 点击时为当前点击 Tab 添加 `disabled` 状态直到导航完成；其他 Tab 保持可点。
  * **优点**：用户仍可切到其他 Tab，不会被全局锁；彻底消除双击问题。
  * **缺点**：需要在 TabBar 组件层面控制 UI `disabled`，实现量最大；需处理多处状态同步。
  * **ROI**：中；交互体验最佳，但改动面相对大。
  * **测试性**：需覆盖 TabBar UI 状态；E2E 测试验证 disabled 样式及点击行为。

**Solution Comparison Summary**
| 方案 | 体验提升 | 开发工作量 | 风险 | 推荐度 |
|------|----------|-----------|------|--------|
| A | 中 | 低 | 低 | ⭐⭐ |
| B | 高 | 中 | 中 | ⭐⭐⭐⭐ *(首选)* |
| C | 高 | 高 | 中高 | ⭐⭐⭐ |

**Final Recommended Solution:** **Solution B – 动态解锁**。
*原因：精确控制锁定时机，根治问题且对现有架构侵入低。*

---
**DW Confirmation:** [Pending] 

# 3. Implementation Plan (PLAN - Core Checklist)
* (AR) Final architecture/API spec link: /project_document/architecture/tabsystem_dynamic_unlock_v1.0.md (将新增，用于记录锁定机制变更)
* (LD) Test plan summary：
  * Unit Test：验证 `isOperatingRef` 在 `isPageRefreshing` 结束（或路由变更）时立即归零。
  * Integration Test：快速连续点击两个 Tab，仅一次点击即生效。
  * E2E（Playwright）：
    1. 打开 /home → /system/menu → /system/role。
    2. 等菜单加载完成后，先点击 Tab A，再立即点击 Tab B；断言当前路径为 B。
    3. 记录视频/截图，输出至 /project_document/tests/e2e/results/20250626_unlock/。

* **Implementation Checklist:**
  1. `[P1-LD-001]` **Action:** 将 `switchTab` 中 `setTimeout(() => { ... isOperatingRef=false }, 600)` 删除 (Inputs: useTabManager.ts; Outputs: 无固定延迟) (Acceptance: 不再存在 600ms 定时锁) (Risk: 可能遗漏其他调用)
  2. `[P1-LD-002]` **Action:** 在 `handleRefresh` 结束（`isPageRefreshing` 变 `false`）或 `useEffect` 监听 `location.pathname` 变化时，将 `isOperatingRef.current = false` (Acceptance: 路由变化或加载结束即解锁) (Risk: 竞态更新)
  3. `[P2-LD-003]` **Action:** `handleRefresh` 内部暴露回调或引用 `onComplete` 钩子，以便解锁更精确 (Optional) (Acceptance: 可编译 & 单元测试通过)
  4. `[P2-LD-004]` **Action:** 检查 `removeTab` / `refreshTab` 等函数是否仍需固定延迟，改为同样解锁逻辑 (Acceptance: 双击问题全场景消失)
  5. `[P3-LD-005]` **Action:** 编写 Jest 单元测试 (Path: /SVT-Web/src/components/.../__tests__/useTabManager.test.ts) (Owner: LD)
  6. `[P3-LD-006]` **Action:** 编写 Playwright 脚本 (Path: /project_document/tests/e2e/scripts/tab_dynamic_unlock.spec.ts) (Owner: LD)
  7. `[P3-DW-007]` **Action:** 更新《菜单管理页面组件化设计剔除记录》及本任务文档，补充变更原因与时间戳 (Owner: DW)
  8. `[P3-AR-008]` **Action:** 在新增架构文档 `/project_document/architecture/tabsystem_dynamic_unlock_v1.0.md` 中记录锁定机制由固定时延 -> 动态事件驱动的设计 (Owner: AR)

* **DW Confirmation:** [Pending] 

# 5. Task Progress (EXECUTE)
---
* **Time:** 2025-06-26 16:26:47 +08:00
* **Executed Item/Feature:** P1-LD-001 & P1-LD-002 – Removed fixed 600ms timeout, added dynamic unlock effects.
* **Core Outputs/Changes:**
    * Modified `useTabManager.ts` – removed setTimeout(600) & added two useEffect hooks for route and refresh unlock.
    * Loading overlay total duration adjusted to 400ms for better UX.
* **Status:** Completed
* **DW Confirmation:** [Pending]
---