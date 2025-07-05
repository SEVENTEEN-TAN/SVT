# SVT前端组件化架构设计

基于实际代码分析的SVT前端项目组件化架构和目录结构设计文档。

## 1. 架构设计原则

### 1.1 核心设计理念

SVT前端采用现代React生态的最佳实践，构建高度模块化、可维护的企业级应用架构：

**组件化分层架构：**
- **页面层(Pages)**: 业务页面组件，负责数据获取和业务逻辑
- **布局层(Layout)**: 应用布局框架，提供统一的页面结构
- **组件层(Components)**: 可复用的UI组件和业务组件
- **工具层(Utils)**: 通用工具函数和配置

**设计原则：**
- **职责单一**: 每个组件只负责一个特定功能
- **高内聚低耦合**: 相关功能聚合，组件间松耦合
- **可复用性**: 通过Props驱动，支持多场景复用
- **类型安全**: 完整的TypeScript类型支持
- **性能优化**: 懒加载、代码分割、渲染优化

## 2. 项目目录架构

### 2.1 整体目录结构

```
src/
├── api/                    # API接口层
│   ├── auth.ts            # 认证相关API
│   └── system/            # 系统管理API
│       ├── menuApi.ts     # 菜单管理
│       └── roleApi.ts     # 角色管理
│
├── components/             # 组件层
│   ├── Common/            # 通用UI组件
│   │   └── CryptoConfigPanel.tsx  # 加密配置面板
│   ├── DynamicPage/       # 动态页面系统
│   │   └── index.tsx      # 动态页面加载核心组件
│   ├── Layout/            # 布局系统
│   │   ├── BasicLayout.tsx        # 主布局组件
│   │   ├── Footer.tsx             # 页脚组件
│   │   ├── core/                  # 布局核心
│   │   │   ├── LayoutProvider.tsx # 布局状态管理
│   │   │   └── LayoutStructure.tsx # 布局结构
│   │   ├── modules/               # 布局模块
│   │   │   ├── Header/            # 头部模块
│   │   │   ├── Sidebar/           # 侧边栏模块
│   │   │   └── TabSystem/         # Tab系统模块
│   │   └── shared/                # 共享资源
│   │       ├── types/             # 布局类型定义
│   │       └── utils/             # 布局工具函数
│   └── Loading/           # 加载组件
│       └── PageLoading.tsx        # 页面加载组件
│
├── config/                # 配置层
│   ├── crypto.ts          # 加密配置
│   └── env.ts             # 环境配置
│
├── hooks/                 # 自定义Hooks
│   ├── useTokenStatus.ts  # Token状态监控
│   └── useUserStatus.ts   # 用户状态监控
│
├── pages/                 # 页面层
│   ├── Auth/              # 认证页面
│   │   └── LoginPage.tsx  # 登录页面
│   ├── Error/             # 错误页面
│   │   └── NotFoundPage.tsx # 404页面
│   ├── Home/              # 首页
│   │   └── HomePage.tsx   # 首页组件
│   └── System/            # 系统管理
│       ├── Menu/          # 菜单管理
│       └── Role/          # 角色管理
│
├── router/                # 路由层
│   ├── index.tsx          # 路由配置
│   └── ProtectedRoute.tsx # 路由守卫
│
├── stores/                # 状态管理层
│   ├── authStore.ts       # 认证状态（Token、登录状态）
│   ├── userStore.ts       # 用户状态（用户信息、会话管理）
│   └── useAuth.ts         # 组合Hook（协调认证和用户状态）
│
├── styles/                # 样式层
│   ├── PageContainer.css  # 页面容器样式
│   └── theme.ts           # 主题配置
│
├── types/                 # 类型定义层
│   ├── api.ts             # API类型
│   ├── index.ts           # 通用类型
│   ├── org-role.ts        # 机构角色类型
│   ├── session.ts         # 会话类型
│   └── user.ts            # 用户类型
│
└── utils/                 # 工具层
    ├── crypto.ts          # 加密工具
    ├── debugManager.ts    # 调试管理
    ├── localStorageManager.ts # 本地存储管理
    ├── messageManager.ts  # 消息管理
    ├── modalManager.ts    # 模态框管理
    ├── request.ts         # HTTP请求
    ├── sessionManager.ts  # 会话管理
    ├── tokenManager.ts    # Token管理
    └── [其他工具文件]
```

### 2.2 目录设计说明

**分层架构设计：**
- **api/**: 数据访问层，封装所有后端API调用
- **components/**: 组件层，按功能和复用性分类
- **pages/**: 页面层，按业务模块组织
- **stores/**: 状态层，使用Zustand进行状态管理
- **utils/**: 工具层，提供通用功能服务

**模块化设计：**
- 每个目录都有明确的职责边界
- 支持按需导入和代码分割
- 便于团队协作和代码维护

## 3. 组件架构设计

### 3.1 页面层组件(Pages)

**设计理念**: 页面组件作为业务入口，负责数据获取、状态管理和布局组织

```typescript
// pages/Auth/LoginPage.tsx - 登录页面示例
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import type { LoginRequest } from '@/types/user';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuthStore();
  const [formData, setFormData] = useState<LoginRequest>({
    loginId: '',
    password: '',
    rememberMe: false
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData);
      navigate('/home');
    } catch (error) {
      // 错误处理
    }
  };

  return (
    <div className="login-container">
      {/* 登录表单UI */}
    </div>
  );
};
```

**页面组件职责：**
- **数据管理**: 调用API获取和提交数据
- **状态管理**: 管理页面级状态和用户交互
- **路由导航**: 处理页面跳转和参数传递
- **错误处理**: 统一的错误边界和用户提示
- **权限控制**: 基于用户权限显示/隐藏功能

### 3.2 布局层组件(Layout)

**核心架构**: 基于Provider模式的布局状态管理

```typescript
// components/Layout/core/LayoutProvider.tsx
// 提供布局状态管理和操作接口
interface LayoutState {
  sidebarCollapsed: boolean;
  activeTabKey: string;
  tabList: TabItem[];
  pathMaps: PathMaps;
  pageRefreshKey: number;
  isPageRefreshing: boolean;
  
  // 操作方法
  addTab: (path: string, forceRefresh?: boolean) => void;
  removeTab: (key: string) => void;
  switchTab: (key: string) => void;
  // ... 其他操作
}
```

**布局模块化设计：**

1. **Header模块** (`modules/Header/`)
   - 面包屑导航 (Breadcrumb.tsx)
   - 用户下拉菜单 (UserDropdown.tsx) 
   - 头部状态管理 (hooks/useHeaderState.ts)

2. **Sidebar模块** (`modules/Sidebar/`)
   - Logo组件 (Logo.tsx)
   - 菜单树组件 (MenuTree.tsx)
   - 侧边栏状态管理 (hooks/useSidebarState.ts)

3. **TabSystem模块** (`modules/TabSystem/`)
   - Tab栏组件 (TabBar.tsx)
   - 右键菜单 (TabContextMenu.tsx)
   - Tab存储钩子 (hooks/useTabStorage.ts)

### 3.3 通用组件层(Components)

**组件分类策略：**

```typescript
// 1. 纯UI组件 (Common/)
// 完全无业务逻辑，高度可复用
interface CryptoConfigPanelProps {
  visible: boolean;
  onClose: () => void;
  config: CryptoConfig;
  onConfigChange: (config: CryptoConfig) => void;
}

// 2. 业务组件 (DynamicPage/)
// 包含特定业务逻辑的复用组件
interface DynamicPageProps {
  path: string;
  refreshKey?: number;
  errorBoundary?: boolean;
}

// 3. 加载组件 (Loading/)
// 各种加载状态的统一管理
interface PageLoadingProps {
  loading: boolean;
  message?: string;
  overlay?: boolean;
}
```

### 3.4 组件开发规范

**类型安全设计：**
```typescript
// 组件Props接口定义
interface ComponentProps {
  // 必需属性
  data: DataType;
  onAction: (item: DataType) => void;
  
  // 可选属性
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  
  // 事件回调
  onClick?: (e: React.MouseEvent) => void;
  onError?: (error: Error) => void;
}

// 使用泛型提升复用性
interface TableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
}
```

**状态管理模式：**
```typescript
// 组件内部状态
const [localState, setLocalState] = useState<StateType>(initialValue);

// 全局状态访问
const globalState = useGlobalStore(state => state.specificData);

// 自定义Hook封装复杂逻辑
const { data, loading, error, refetch } = useDataFetch<DataType>(apiEndpoint);
```

**性能优化策略：**
```typescript
// 1. 记忆化组件
const MemoizedComponent = React.memo<Props>(({ data, onAction }) => {
  return <div>{/* 组件内容 */}</div>;
});

// 2. 回调函数优化
const handleClick = useCallback((id: string) => {
  onAction(id);
}, [onAction]);

// 3. 计算属性缓存
const processedData = useMemo(() => {
  return data.map(item => processItem(item));
}, [data]);
```

## 4. 路由系统架构

### 4.1 路由配置设计

**位置**: `src/router/index.tsx`

```typescript
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy } from 'react';
import ProtectedRoute from './ProtectedRoute';

// 懒加载页面组件
const LoginPage = lazy(() => import('@/pages/Auth/LoginPage'));
const HomePage = lazy(() => import('@/pages/Home/HomePage'));
const MenuManagement = lazy(() => import('@/pages/System/Menu'));
const RoleManagement = lazy(() => import('@/pages/System/Role'));
const NotFoundPage = lazy(() => import('@/pages/Error/NotFoundPage'));

// 路由配置
export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        index: true,
        element: <Navigate to="/home" replace />
      },
      {
        path: 'home',
        element: <HomePage />
      },
      {
        path: 'system',
        children: [
          {
            path: 'menu',
            element: <MenuManagement />
          },
          {
            path: 'role', 
            element: <RoleManagement />
          }
        ]
      }
    ]
  },
  {
    path: '*',
    element: <NotFoundPage />
  }
]);
```

### 4.2 路由守卫机制

**位置**: `src/router/ProtectedRoute.tsx`

```typescript
import React, { Suspense } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import BasicLayout from '@/components/Layout/BasicLayout';
import PageLoading from '@/components/Loading/PageLoading';

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, token } = useAuthStore();

  // 检查认证状态
  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <BasicLayout>
      <Suspense fallback={<PageLoading loading={true} />}>
        <Outlet />
      </Suspense>
    </BasicLayout>
  );
};
```

### 4.3 动态路由与权限控制

**DynamicPage组件**: `src/components/DynamicPage/index.tsx`

```typescript
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useUserStore } from '@/stores/userStore';
import type { MenuItem } from '@/types';

// 页面组件映射
const PAGE_COMPONENTS = {
  '/home': lazy(() => import('@/pages/Home/HomePage')),
  '/system/menu': lazy(() => import('@/pages/System/Menu')),
  '/system/role': lazy(() => import('@/pages/System/Role')),
  // ... 其他页面映射
};

const DynamicPage: React.FC<{ refreshKey?: number }> = ({ refreshKey }) => {
  const location = useLocation();
  const { permissions } = useUserStore();
  const [hasPermission, setHasPermission] = useState(true);

  // 动态获取页面组件
  const PageComponent = useMemo(() => {
    return PAGE_COMPONENTS[location.pathname];
  }, [location.pathname]);

  // 权限检查
  useEffect(() => {
    const requiredPermission = getRequiredPermission(location.pathname);
    const hasAccess = checkPermission(permissions, requiredPermission);
    setHasPermission(hasAccess);
  }, [location.pathname, permissions]);

  if (!hasPermission) {
    return <Navigate to="/403" replace />;
  }

  if (!PageComponent) {
    return <Navigate to="/404" replace />;
  }

  return (
    <Suspense fallback={<PageLoading loading={true} />}>
      <PageComponent key={refreshKey} />
    </Suspense>
  );
};
```

### 4.4 路由性能优化

**代码分割策略：**
- 页面级懒加载，减少初始bundle大小
- 按业务模块分组，相关页面预加载
- 基于路由的Chunk分割

**预加载机制：**
```typescript
// 鼠标悬停时预加载组件
const preloadComponent = (componentImport: () => Promise<any>) => {
  componentImport();
};

// 菜单项悬停预加载
const MenuItem: React.FC<MenuItemProps> = ({ path, children }) => {
  const handleMouseEnter = () => {
    if (PAGE_COMPONENTS[path]) {
      preloadComponent(PAGE_COMPONENTS[path]);
    }
  };

  return (
    <div onMouseEnter={handleMouseEnter}>
      {children}
    </div>
  );
};
```

## 5. 状态管理架构

### 5.1 Zustand状态管理

SVT采用Zustand进行全局状态管理，具备以下特点：
- **轻量级**: 仅2.9KB，无冗余代码
- **类型安全**: 完整TypeScript支持
- **中间件支持**: persist、devtools等
- **按需订阅**: 精确的状态订阅机制

### 5.2 状态架构设计

```typescript
// 状态模块化设计 (v1.0.1-SNAPSHOT)
stores/
├── authStore.ts      # 认证状态管理（纯认证逻辑）
├── userStore.ts      # 用户信息管理（含会话状态）
├── useAuth.ts        # 组合Hook（协调认证和用户交互）
└── [业务Store]       # 按业务模块划分
```

**详细实现参考**: [State-Management.md](./State-Management.md)

### 5.3 状态持久化策略

```typescript
// 选择性持久化
export const useAuthStore = create<AuthState>()(  
  persist(
    (set, get) => ({
      // Store实现
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        // loading状态不持久化
      })
    }
  )
);
```

## 6. Tab系统组件架构

### 6.1 系统概述

SVT采用类浏览器的多Tab页面管理系统，为用户提供现代化的工作体验。Tab系统基于React Context模式设计，具备完整的状态管理和持久化能力。

### 6.2 核心架构设计

**架构层次:**
```
LayoutProvider (状态管理层)
    ↓
TabSystem (容器组件层)
    ├── TabBar (Tab标签栏)
    └── TabContextMenu (右键菜单)
        ↓
    Tab持久化存储层
```

**核心组件实现:**

```typescript
// 1. LayoutProvider - Tab状态管理核心
interface LayoutState {
  // Tab状态
  activeTabKey: string;
  tabList: TabItem[];
  pageRefreshKey: number;
  isPageRefreshing: boolean;
  
  // Tab操作接口
  addTab: (path: string, forceRefresh?: boolean) => void;
  removeTab: (key: string) => void;
  switchTab: (key: string) => void;
  refreshTab: (key: string) => void;
  closeLeftTabs: (currentKey: string) => void;
  closeRightTabs: (currentKey: string) => void;
  closeOtherTabs: (currentKey: string) => void;
}

// 2. TabItem数据结构
interface TabItem {
  key: string;        // 唯一标识(路由路径)
  label: string;      // 显示名称
  path: string;       // 路由路径
  closable: boolean;  // 是否可关闭
}

// 3. TabSystem容器组件
const TabSystem: React.FC<TabSystemProps> = ({ collapsed, tabManager }) => {
  const [contextMenuState, setContextMenuState] = useState<ContextMenuState>();
  
  return (
    <>
      <TabBar {...tabManager} onContextMenu={handleTabContextMenu} />
      <TabContextMenu {...contextMenuState} {...tabManager} />
    </>
  );
};
```

### 6.3 智能功能特性

**1. 智能刷新机制:**
```typescript
// 检测重复点击当前Tab触发刷新
const addTab = useCallback((path: string, forceRefresh: boolean = false) => {
  const isCurrentTab = activeTabKey === path;
  
  if (forceRefresh || isCurrentTab) {
    // 通过改变pageRefreshKey触发页面重新渲染
    setPageRefreshKey(prev => prev + 1);
    setIsPageRefreshing(true);
    
    setTimeout(() => setIsPageRefreshing(false), 500);
  }
  
  // Tab管理逻辑...
}, [activeTabKey]);
```

**2. 防冲突操作机制:**
```typescript
// 使用Ref防止操作冲突
const isOperatingRef = useRef(false);
const isTabOperatingRef = useRef(false);

const switchTab = useCallback((targetKey: string) => {
  if (isOperatingRef.current) return;
  
  isOperatingRef.current = true;
  isTabOperatingRef.current = true;
  
  // 执行Tab切换逻辑
  
  setTimeout(() => {
    isTabOperatingRef.current = false;
  }, 100);
}, []);
```

**3. 状态持久化:**
```typescript
// useTabStorage Hook实现
export const useTabStorage = () => {
  const saveTabsToStorage = (tabs: TabItem[], activeTab: string) => {
    try {
      localStorage.setItem('svt-tabs', JSON.stringify({
        tabs: tabs.map(tab => ({ ...tab, refreshKey: 0 })),
        activeTab,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('Tab状态保存失败:', error);
    }
  };
  
  const loadTabsFromStorage = () => {
    // 恢复Tab状态逻辑
  };
  
  return { saveTabsToStorage, loadTabsFromStorage };
};
```

### 6.4 右键菜单系统

**菜单功能设计:**
```typescript
interface ContextMenuAction {
  key: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

const contextMenuItems: ContextMenuAction[] = [
  {
    key: 'refresh',
    label: '刷新页面',
    icon: <ReloadOutlined />,
    onClick: () => refreshTab(tabKey)
  },
  {
    key: 'close',
    label: '关闭标签页',
    icon: <CloseOutlined />,
    onClick: () => removeTab(tabKey),
    disabled: !currentTab?.closable
  },
  {
    key: 'close-left',
    label: '关闭左侧标签页',
    icon: <ColumnWidthOutlined />,
    onClick: () => closeLeftTabs(tabKey)
  }
  // ... 其他菜单项
];
```

### 6.5 性能优化策略

**1. 渲染优化:**
```typescript
// Tab列表虚拟化(大量Tab场景)
const VirtualTabBar = useMemo(() => {
  if (tabList.length > 20) {
    return <VirtualizedList items={tabList} renderItem={TabItem} />;
  }
  return <StandardTabBar tabs={tabList} />;
}, [tabList]);

// 使用React.memo优化Tab项渲染
const TabItem = React.memo<TabItemProps>(({ tab, active, onSwitch }) => {
  return (
    <div 
      className={`tab-item ${active ? 'active' : ''}`}
      onClick={() => onSwitch(tab.key)}
    >
      {tab.label}
    </div>
  );
});
```

**2. 状态更新优化:**
```typescript
// 批量状态更新
const batchUpdateTabs = useCallback((updates: TabUpdate[]) => {
  setTabList(prev => {
    let newTabList = [...prev];
    updates.forEach(update => {
      newTabList = applyUpdate(newTabList, update);
    });
    return newTabList;
  });
}, []);
```

### 6.6 错误边界与恢复

```typescript
// Tab系统错误边界
class TabSystemErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 记录错误
    console.error('Tab系统错误:', error, errorInfo);
    
    // 恢复到默认状态
    this.setState({ hasError: true });
    
    // 重置Tab状态
    localStorage.removeItem('svt-tabs');
  }
  
  render() {
    if (this.state.hasError) {
      return <TabSystemFallback onRetry={this.handleRetry} />;
    }
    
    return this.props.children;
  }
}
```

**详细设计文档**: [Tab-System-Design.md](./Tab-System-Design.md)

## 7. 工具层设计

### 7.1 工具分类

**系统工具:**
- `debugManager.ts`: 统一调试管理，支持分级日志
- `tokenManager.ts`: JWT Token生命周期管理
- `sessionManager.ts`: 会话状态监控和管理
- `localStorageManager.ts`: 本地存储的统一管理

**业务工具:**
- `crypto.ts`: AES加密/解密功能
- `request.ts`: HTTP请求封装，支持拦截器
- `messageManager.ts`: 全局消息提示管理
- `modalManager.ts`: 模态框统一管理

### 7.2 工具设计模式

```typescript
// 单例模式 - 调试管理器
class DebugManager {
  private static instance: DebugManager;
  
  static getInstance(): DebugManager {
    if (!DebugManager.instance) {
      DebugManager.instance = new DebugManager();
    }
    return DebugManager.instance;
  }
  
  log(component: string, message: string, data?: any) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${component}] ${message}`, data);
    }
  }
}

// 工厂模式 - 请求管理器
class RequestFactory {
  static createRequest(baseURL: string, config?: AxiosRequestConfig) {
    const instance = axios.create({ baseURL, ...config });
    
    // 请求拦截器
    instance.interceptors.request.use(request => {
      // 添加认证头
      const token = useAuthStore.getState().token;
      if (token) {
        request.headers.Authorization = `Bearer ${token}`;
      }
      return request;
    });
    
    // 响应拦截器
    instance.interceptors.response.use(
      response => response,
      error => {
        // 统一错误处理
        handleApiError(error);
        return Promise.reject(error);
      }
    );
    
    return instance;
  }
}
```

## 8. 类型系统设计

### 8.1 类型组织结构

```typescript
// types/index.ts - 通用类型
export interface BaseEntity {
  id: string;
  createTime?: string;
  updateTime?: string;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  success: boolean;
}

// types/user.ts - 用户相关类型
export interface UserInfo extends BaseEntity {
  username: string;
  displayName: string;
  email?: string;
  avatar?: string;
  status: UserStatus;
}

export interface LoginRequest {
  loginId: string;
  password: string;
  rememberMe: boolean;
  captcha?: string;
}

// types/api.ts - API接口类型
export interface MenuTreeResponse {
  menuTrees: MenuItem[];
  permissions: string[];
}

export interface RoleManagementResponse {
  roles: RoleInfo[];
  total: number;
  pageSize: number;
  currentPage: number;
}
```

### 8.2 类型安全实践

```typescript
// 1. 严格的接口定义
interface StrictComponentProps {
  readonly data: ReadonlyArray<DataItem>;
  onAction: (item: DataItem) => Promise<void>;
  config: Readonly<ComponentConfig>;
}

// 2. 联合类型和类型守卫
type LoadingState = 'idle' | 'loading' | 'success' | 'error';

function isErrorState(state: LoadingState): state is 'error' {
  return state === 'error';
}

// 3. 泛型约束
interface Repository<T extends BaseEntity> {
  findById(id: string): Promise<T | null>;
  save(entity: Omit<T, 'id'>): Promise<T>;
  delete(id: string): Promise<void>;
}
```

## 9. 开发规范与最佳实践

### 9.1 命名规范

**文件命名:**
- 组件文件: `PascalCase.tsx` (如 `LoginPage.tsx`)
- 工具文件: `camelCase.ts` (如 `tokenManager.ts`)
- 类型文件: `kebab-case.ts` (如 `org-role.ts`)
- 样式文件: `PascalCase.css` (如 `LoginPage.css`)

**变量命名:**
- 组件: `PascalCase` (如 `UserProfile`)
- 函数/变量: `camelCase` (如 `handleLogin`)
- 常量: `SCREAMING_SNAKE_CASE` (如 `API_BASE_URL`)
- 类型/接口: `PascalCase` (如 `UserInfo`)

### 9.2 组件开发最佳实践

```typescript
// ✅ 良好的组件设计
interface UserCardProps {
  user: UserInfo;
  showActions?: boolean;
  onEdit?: (user: UserInfo) => void;
  onDelete?: (userId: string) => void;
  className?: string;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  showActions = true,
  onEdit,
  onDelete,
  className
}) => {
  // 使用useCallback优化性能
  const handleEdit = useCallback(() => {
    onEdit?.(user);
  }, [user, onEdit]);

  const handleDelete = useCallback(() => {
    onDelete?.(user.id);
  }, [user.id, onDelete]);

  return (
    <div className={`user-card ${className || ''}`}>
      <div className="user-info">
        <h3>{user.displayName}</h3>
        <p>{user.email}</p>
      </div>
      
      {showActions && (
        <div className="user-actions">
          <Button onClick={handleEdit}>编辑</Button>
          <Button danger onClick={handleDelete}>删除</Button>
        </div>
      )}
    </div>
  );
};

// 使用React.memo优化渲染
export default React.memo(UserCard);
```

### 9.3 错误处理策略

```typescript
// 1. 错误边界组件
class ComponentErrorBoundary extends React.Component<Props, State> {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 记录错误
    DebugManager.error('组件错误', error, { errorInfo });
    
    // 上报错误
    reportError(error, { component: this.props.componentName });
  }
}

// 2. 异步错误处理
const useAsyncError = () => {
  const [error, setError] = useState<Error | null>(null);
  
  const handleAsync = useCallback(async <T>(
    asyncFn: () => Promise<T>
  ): Promise<T | null> => {
    try {
      return await asyncFn();
    } catch (err) {
      setError(err as Error);
      return null;
    }
  }, []);
  
  return { error, handleAsync, clearError: () => setError(null) };
};
```

---

## 🎯 开发指导原则

遵循此组件化架构设计，可以帮助团队：

1. **快速定位**: 清晰的目录结构和命名规范
2. **高效协作**: 统一的开发模式和代码风格
3. **质量保障**: 类型安全和错误处理机制
4. **性能优化**: 组件懒加载和渲染优化策略
5. **可维护性**: 模块化设计和文档化代码

## 📚 相关文档

- [Tab系统设计](./Tab-System-Design.md)
- [状态管理架构](./State-Management.md)
- [模块化架构设计](./Modular-Architecture.md)
- [响应式布局系统](./Responsive-Layout-System.md)