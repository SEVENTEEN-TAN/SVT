# 组件化与目录结构

本文档旨在为SVT前端项目的开发者提供一份关于代码组织、目录结构和组件化开发的指导原则。

## 1. 总体原则
- **职责单一 (Single Responsibility)**: 每个组件或文件都应该只做一件事，并把它做好。
- **高内聚，低耦合**: 功能相关的代码（如一个页面的所有组件、样式和逻辑）应该放在一起，同时减少模块间的直接依赖。
- **约定优于配置**: 遵循既定的目录结构和命名约定，以减少沟通成本和不确定性。

## 2. 根目录结构 (`/src`)

```
src
├── api/          # API请求模块 (按业务划分)
├── assets/       # 静态资源 (图片, 字体等)
├── components/   # 全局通用组件
│   ├── Common/   # 业务无关的纯UI组件 (如自定义按钮, 面板)
│   └── Layout/   # 页面布局组件 (如BasicLayout, Footer)
├── config/       # 项目配置 (环境变量, 加密配置)
├── hooks/        # 自定义Hooks
├── pages/        # 页面级组件 (应用的核心)
│   ├── Auth/
│   │   ├── LoginPage.tsx
│   │   └── LoginPage.css
│   └── Dashboard/
│       └── DashboardPage.tsx
├── router/       # 路由配置
├── stores/       # 全局状态管理 (Zustand)
├── styles/       # 全局样式和主题配置
├── types/        # TypeScript类型定义
└── utils/        # 通用工具函数
```

## 3. 组件化详解

### 3.1 `pages` - 页面组件

`pages`目录是应用的核心，它代表了用户能访问到的每一个独立页面。
- **组织方式**: 按业务模块或路由路径进行组织。例如，所有与认证相关的页面都放在`pages/Auth`下。
- **构成**: 一个页面通常由其主组件（如`LoginPage.tsx`）、相关的样式文件（`LoginPage.css`）以及可能只在该页面使用的子组件构成。
- **原则**: 页面组件负责组织和布局，并处理该页面的数据获取和状态逻辑。它应该将具体的UI表现委托给`components`中的通用组件或其内部的子组件。

### 3.2 `components` - 通用组件

`components`目录存放可以在应用中**复用**的组件。
- **`components/Common`**: 存放与业务逻辑完全解耦的纯UI组件。例如，一个定制化的`Card`组件或一个`Icon`组件。这些组件应该是高度可配置和可复用的。
- **`components/Layout`**: 存放构成页面骨架的布局组件。`BasicLayout.tsx`就是一个典型的例子，它包含了页头、侧边栏、多Tab页面管理、内容区域和页脚的结构。
- **`components/Business` (可选)**: 如果存在跨页面复用的、但又包含特定业务逻辑的组件（例如一个"用户选择"弹窗），可以考虑创建一个`Business`目录来存放它们。

### 3.3 组件开发原则

- **Props驱动**: 组件应该优先通过`props`接收数据和回调函数，保持其独立性和可预测性。
- **状态内聚**: 将组件自身的状态（如输入框的值、开关的状态）保留在组件内部（使用`useState`），除非该状态需要被父组件或其他组件共享。
- **自定义Hooks**: 将可复用的逻辑（如数据请求、事件监听、复杂计算）抽取到自定义Hooks中（存放于`/hooks`目录），使组件代码更清晰。例如，`useTokenStatus`就是一个很好的例子。

## 4. 路由 (`/router`)

- **`index.tsx`**: 定义了应用的所有路由规则，使用了`react-router-dom`的`createBrowserRouter`。
- **代码分割**: 所有页面级组件都通过`React.lazy()`进行懒加载，这有助于优化初始加载性能。用户只有在访问特定路由时，才会下载对应页面的代码。
- **`ProtectedRoute.tsx`**: 这是一个路由守卫组件，它包裹了需要认证才能访问的路由。其内部逻辑会检查`authStore`中的登录状态，如果未登录，则重定向到登录页。

## 5. 状态管理 (`/stores`)

- 全局状态由Zustand进行管理，具体的`store`文件存放在此目录下。
- 详见`State-Management.md`文档。

## 6. Tab系统架构 (2025-06-21 新增)

### 6.1 Tab系统概述

SVT系统采用多Tab页面管理方式，为用户提供类似浏览器的多页面工作体验。Tab系统集成在`BasicLayout.tsx`中，提供完整的页面管理功能。

### 6.2 核心组件

#### 6.2.1 BasicLayout.tsx - Tab管理中心
```typescript
// Tab状态管理
const [activeTabKey, setActiveTabKey] = useState<string>('/dashboard');
const [tabList, setTabList] = useState<TabItem[]>([...]);
const [pageRefreshKey, setPageRefreshKey] = useState<number>(0);

// 核心功能函数
const addTab = useCallback((path: string, forceRefresh = false) => {...});
const removeTab = useCallback((targetKey: string) => {...});
const switchTab = useCallback((targetKey: string) => {...});
```

#### 6.2.2 Tab数据结构
```typescript
interface TabItem {
  key: string;        // Tab唯一标识，通常是路由路径
  label: string;      // Tab显示名称
  path: string;       // 对应的路由路径
  closable: boolean;  // 是否可关闭（仪表盘不可关闭）
}
```

### 6.3 核心功能

#### 6.3.1 智能刷新机制
- **重复点击检测**: 检测用户是否重复点击当前活跃的菜单项
- **React Key刷新**: 通过改变`<Outlet key={pageRefreshKey} />`的key强制重新渲染
- **组件重挂载**: 确保页面组件完全重新初始化，触发数据重新获取

#### 6.3.2 右键菜单系统
- **刷新**: 重新加载当前页面
- **关闭当前页面**: 关闭当前Tab（仪表盘不可关闭）
- **关闭左边**: 关闭当前Tab左边的所有可关闭Tab
- **关闭右边**: 关闭当前Tab右边的所有可关闭Tab
- **关闭其他**: 关闭除当前Tab和仪表盘外的所有Tab

#### 6.3.3 智能状态管理
- **防重复操作**: 使用`useRef`防止快速连续操作导致状态冲突
- **智能切换**: 关闭Tab时自动切换到相邻的合适Tab
- **仪表盘保护**: 确保仪表盘Tab永远不会被关闭

### 6.4 性能优化

#### 6.4.1 函数缓存
```typescript
// 使用useCallback缓存函数引用
const addTab = useCallback((path: string, forceRefresh = false) => {
  // Tab添加逻辑
}, [getTabName, navigate, activeTabKey]);
```

#### 6.4.2 状态优化
```typescript
// 使用函数式状态更新避免依赖
setTabList(prev => {
  // 基于前一个状态计算新状态
  return newTabList;
});
```

#### 6.4.3 防重复操作
```typescript
const isOperatingRef = useRef(false);

const removeTab = useCallback((targetKey: string) => {
  if (isOperatingRef.current) return;
  isOperatingRef.current = true;

  // 执行操作

  setTimeout(() => {
    isOperatingRef.current = false;
  }, 0);
}, []);
```

### 6.5 用户体验设计

#### 6.5.1 视觉反馈
- **活跃状态**: 当前Tab有明显的视觉区分
- **悬停效果**: 鼠标悬停时的交互反馈
- **关闭按钮**: 清晰的关闭操作入口

#### 6.5.2 操作便利性
- **无数量限制**: 用户可以打开任意数量的Tab
- **水平滚动**: Tab过多时自动支持滚动
- **批量操作**: 右键菜单提供丰富的批量管理选项

#### 6.5.3 错误预防
- **仪表盘保护**: 确保用户始终有可用页面
- **智能禁用**: 根据实际情况禁用不可用的菜单选项
- **状态恢复**: 异常情况下的状态恢复机制

### 6.6 扩展性设计

Tab系统采用模块化设计，便于后续扩展：
- **Tab拖拽排序**: 支持拖拽调整Tab顺序
- **Tab分组**: 支持Tab分组管理
- **历史记录**: 记录用户的Tab使用历史
- **状态持久化**: Tab状态的本地存储

详细的Tab系统设计请参考：[Tab系统设计文档](./Tab-System-Design.md)

---

遵循此结构和原则，可以帮助团队成员快速定位代码，理解不同部分之间的关系，并高效地进行协作开发和后期维护。

## 🆕 更新日志
- 2025-06-26 16:50:43 +08:00:
  - 核对目录结构，补充 `shared/` 目录以及 `ContentArea` 模块文件描述，确保文档与代码一致。
  - 更新 Tab 系统描述，注明 Loading 覆盖层与本地持久化实现。