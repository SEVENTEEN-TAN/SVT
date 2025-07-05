# SVT-Web 前端应用

基于 React 19.1.0 + TypeScript 5.8.3 构建的企业级风险管理系统前端应用，采用现代化开发技术栈，提供完整的布局系统、状态管理、JWT智能续期等功能。

## 🎯 技术特色

- **最新技术栈**：React 19.1.0 + TypeScript 5.8.3 + Vite 6.3.5
- **企业级UI**：Ant Design 5.25.4 完整组件生态
- **现代状态管理**：Zustand 5.0.5 轻量级状态管理
- **高性能构建**：Vite 极速开发体验，代码分割优化
- **类型安全**：TypeScript 严格模式，完整类型覆盖
- **智能缓存**：TanStack React Query 服务端状态管理

## 🚀 核心技术栈

### 核心框架
- **React 19.1.0** - 最新React版本，支持Concurrent特性
- **TypeScript 5.8.3** - 严格类型检查，开发时类型安全保障
- **Vite 6.3.5** - 现代化构建工具，极速热重载

### UI与样式
- **Ant Design 5.25.4** - 企业级React UI组件库
- **@ant-design/icons 5.6.1** - 丰富的图标库
- **CSS-in-JS** - 组件级样式管理

### 状态管理
- **Zustand 5.0.5** - 轻量级状态管理，替代Redux
- **TanStack React Query 5.80.6** - 强大的服务端状态管理
- **Persist中间件** - 状态持久化支持

### 路由与导航
- **React Router DOM 7.6.2** - 现代路由解决方案
- **动态路由加载** - 支持懒加载和代码分割
- **路由守卫** - 权限控制和认证验证

### 表单与验证
- **React Hook Form 7.57.0** - 高性能表单库
- **Zod 3.25.57** - TypeScript优先的模式验证

### 网络与加密
- **Axios 1.9.0** - HTTP客户端，支持请求拦截
- **crypto-js 4.2.0** - 前端加密工具库
- **智能重试机制** - 网络异常自动重试

### 拖拽与交互
- **@dnd-kit/core 6.3.1** - 现代拖拽库
- **@dnd-kit/sortable 10.0.0** - 拖拽排序组件
- **@dnd-kit/modifiers 9.0.0** - 拖拽修饰器

### 开发工具
- **ESLint** - 代码质量检查
- **TypeScript ESLint** - TypeScript专用规则
- **Vite 插件生态** - 丰富的开发插件

## 📁 项目架构

### 目录结构

```
src/
├── api/                          # API接口层
│   ├── auth.ts                   # 认证相关API（登录、登出、续期）
│   └── system/                   # 系统管理API
│       ├── menuApi.ts            # 菜单管理API
│       └── roleApi.ts            # 角色管理API
├── assets/                       # 静态资源
│   ├── login-bg.png              # 登录背景图
│   └── react.svg                 # React图标
├── components/                   # 组件库
│   ├── Common/                   # 通用组件
│   │   └── CryptoConfigPanel.tsx # 加密配置面板
│   ├── DynamicPage/              # 动态页面加载器
│   │   └── index.tsx             # 基于路由的动态页面组件
│   ├── Layout/                   # 布局系统（核心）
│   │   ├── BasicLayout.tsx       # 基础布局容器
│   │   ├── Footer.tsx            # 页脚组件
│   │   ├── core/                 # 布局核心
│   │   │   ├── LayoutProvider.tsx    # 布局状态提供者
│   │   │   └── LayoutStructure.tsx   # 布局结构组件
│   │   ├── modules/              # 布局模块
│   │   │   ├── Header/           # 头部模块
│   │   │   │   ├── Breadcrumb.tsx        # 面包屑导航
│   │   │   │   ├── UserDropdown.tsx      # 用户下拉菜单
│   │   │   │   ├── hooks/
│   │   │   │   │   └── useHeaderState.ts # 头部状态管理
│   │   │   │   └── index.tsx             # 头部主组件
│   │   │   ├── Sidebar/          # 侧边栏模块
│   │   │   │   ├── Logo.tsx              # Logo组件
│   │   │   │   ├── MenuTree.tsx          # 菜单树组件
│   │   │   │   ├── hooks/
│   │   │   │   │   └── useSidebarState.ts # 侧边栏状态
│   │   │   │   └── index.tsx             # 侧边栏主组件
│   │   │   └── TabSystem/        # 标签页系统
│   │   │       ├── TabBar.tsx            # 标签栏组件
│   │   │       ├── TabContextMenu.tsx    # 右键菜单
│   │   │       ├── hooks/
│   │   │       │   └── useTabStorage.ts  # 标签状态持久化
│   │   │       └── index.tsx             # 标签系统主组件
│   │   └── shared/               # 布局共享资源
│   │       ├── types/
│   │       │   └── layout.ts             # 布局类型定义
│   │       └── utils/
│   │           ├── layoutStyles.ts       # 布局样式工具
│   │           └── layoutUtils.ts        # 布局工具函数
│   └── Loading/                  # 加载组件
│       ├── PageLoading.tsx       # 页面加载指示器
│       └── PageRefreshLoading.tsx # 页面刷新加载
├── config/                       # 配置文件
│   ├── crypto.ts                 # 加密配置
│   └── env.ts                    # 环境变量配置
├── hooks/                        # 自定义Hooks
│   ├── useTokenStatus.ts         # JWT Token状态管理
│   └── useUserStatus.ts          # 用户状态管理
├── pages/                        # 页面组件
│   ├── Auth/                     # 认证页面
│   │   ├── LoginPage.css         # 登录页面样式
│   │   └── LoginPage.tsx         # 登录页面组件
│   ├── Business/                 # 业务页面
│   │   ├── ProcessManagement/    # 流程管理
│   │   │   └── index.tsx
│   │   └── QueryManagement/      # 查询管理
│   │       └── index.tsx
│   ├── Debug/                    # 调试页面（开发用）
│   ├── Error/                    # 错误页面
│   │   └── NotFoundPage.tsx      # 404页面
│   ├── Home/                     # 首页
│   │   └── HomePage.tsx          # 首页组件
│   ├── System/                   # 系统管理页面
│   │   ├── Menu/                 # 菜单管理
│   │   │   ├── MenuManagement.css    # 菜单管理样式
│   │   │   ├── index.tsx             # 菜单管理主页面
│   │   │   └── utils/
│   │   │       └── dataTransform.ts  # 数据转换工具
│   │   ├── Role/                 # 角色管理
│   │   │   ├── RoleManagement.css    # 角色管理样式
│   │   │   └── index.tsx             # 角色管理页面
│   │   └── User/                 # 用户管理
│   │       └── index.tsx             # 用户管理页面
│   └── Test/                     # 测试页面
├── router/                       # 路由配置
│   ├── index.tsx                 # 路由定义和配置
│   └── ProtectedRoute.tsx        # 路由守卫组件
├── stores/                       # 状态管理（Zustand）
│   ├── authStore.ts              # 认证状态管理
│   ├── sessionStore.ts           # 会话状态管理
│   ├── useAuth.ts                # 认证Hook封装
│   └── userStore.ts              # 用户信息状态管理
├── styles/                       # 全局样式
│   ├── PageContainer.css         # 页面容器样式
│   └── theme.ts                  # 主题配置
├── types/                        # TypeScript类型定义
│   ├── api.ts                    # API类型定义
│   ├── index.ts                  # 通用类型
│   ├── org-role.ts               # 组织角色类型
│   ├── session.ts                # 会话类型
│   └── user.ts                   # 用户类型
├── utils/                        # 工具函数
│   ├── __tests__/                # 工具函数测试
│   ├── crypto.ts                 # 加密解密工具
│   ├── debugManager.ts           # 调试管理器
│   ├── localStorageManager.ts    # 本地存储管理
│   ├── messageManager.ts         # 消息管理器
│   ├── modalManager.ts           # 弹窗管理器
│   ├── request.ts                # HTTP请求封装
│   ├── sessionManager.ts         # 会话管理器
│   ├── stateRecoveryValidator.ts # 状态恢复验证
│   ├── storageCleanup.ts         # 存储清理工具
│   ├── tabStorageCleanup.ts      # 标签存储清理
│   └── tokenManager.ts           # Token管理器
├── App.css                       # 应用根样式
├── App.tsx                       # 应用根组件
├── index.css                     # 全局基础样式
├── main.tsx                      # 应用入口
└── vite-env.d.ts                 # Vite环境类型
```

### 应用入口结构

```
应用启动流程：
main.tsx → App.tsx → RouterProvider → ProtectedRoute → BasicLayout
    ↓           ↓         ↓              ↓               ↓
 环境初始化  主题配置   路由管理      认证验证        布局渲染
```

## 🏃‍♂️ 快速开始

### 环境要求

- **Node.js 18+** (推荐使用LTS版本)
- **npm 8+** 或 **yarn 1.22+** 或 **pnpm 7+**

### 安装依赖

```bash
# 使用npm
npm install

# 使用yarn
yarn install

# 使用pnpm
pnpm install
```

### 环境配置

创建环境配置文件：

```bash
# 开发环境配置
cp .env.development .env.local
```

配置关键环境变量：

```bash
# .env.local
# API后端地址
VITE_API_BASE_URL=http://localhost:8080

# 应用标题
VITE_APP_TITLE=SVT风险管理系统

# AES加密密钥（可选，与后端保持一致）
VITE_AES_KEY=your_32_character_aes_key_1234567890123456

# 调试模式（开发环境建议开启）
VITE_DEBUG_MODE=true

# API加密开关（可选）
VITE_ENABLE_CRYPTO=false
```

### 启动开发服务器

```bash
# 开发环境（默认）
npm run dev

# UAT环境
npm run dev:uat

# 生产环境预览
npm run dev:prod

# 预览构建结果
npm run preview
```

应用默认运行在 `http://localhost:5173`

### 构建部署

```bash
# 构建生产版本
npm run build

# 构建UAT版本
npm run build:uat

# 构建开发版本（用于调试）
npm run build:dev

# 代码质量检查
npm run lint
```

## 🔧 核心功能详解

### 已实现功能 ✅

#### 1. 认证系统

**功能特点**：
- **JWT智能续期**：基于用户活跃度自动续期，无感知体验
- **单点登录**：自动检测并处理重复登录
- **状态持久化**：刷新页面保持登录状态
- **自动登出**：Token过期自动清理状态

**技术实现**：
```typescript
// 认证状态管理 (authStore.ts)
interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  expiryDate: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

// JWT智能续期 (tokenManager.ts)
class TokenManager {
  start(); // 启动续期监控
  stop();  // 停止续期监控
  checkAndRenew(); // 检查并续期Token
}
```

#### 2. 布局系统

**模块化设计**：
- **Header模块**：面包屑导航、用户信息、系统通知
- **Sidebar模块**：Logo展示、菜单树、折叠控制
- **TabSystem模块**：多标签页、右键菜单、状态持久化
- **Footer模块**：版权信息、系统状态

**核心特性**：
```typescript
// 布局状态提供者 (LayoutProvider.tsx)
interface LayoutContextType {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  breadcrumbs: BreadcrumbItem[];
  updateBreadcrumbs: (items: BreadcrumbItem[]) => void;
}

// 标签页状态管理 (useTabStorage.ts)
interface TabState {
  tabs: Tab[];
  activeTab: string;
  addTab: (tab: Tab) => void;
  removeTab: (tabId: string) => void;
  clearAllTabs: () => void;
}
```

#### 3. 智能标签页系统

**功能亮点**：
- **防重复开启**：同一页面只开启一个标签
- **状态持久化**：标签状态本地存储，刷新保持
- **右键菜单**：关闭当前、关闭其他、关闭所有
- **拖拽排序**：支持标签拖拽重新排序（规划中）

**技术实现**：
```typescript
// 标签页组件 (TabSystem/index.tsx)
const TabSystem: React.FC = () => {
  const { tabs, activeTab, addTab, removeTab } = useTabStorage();
  
  // 右键菜单处理
  const handleContextMenu = (e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    showContextMenu(e.clientX, e.clientY, tabId);
  };
};
```

#### 4. 状态管理架构

**分层设计**：
- **认证状态 (authStore)**：JWT Token、登录状态、过期时间
- **用户状态 (userStore)**：用户信息、权限、组织信息
- **会话状态 (sessionStore)**：页面状态、表单状态、临时数据

**持久化策略**：
```typescript
// Zustand持久化配置
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 状态定义
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        expiryDate: state.expiryDate,
      }),
    }
  )
);
```

#### 5. 网络请求管理

**智能拦截器**：
- **请求拦截**：自动添加Token、加密数据、请求日志
- **响应拦截**：自动解密、错误处理、Token续期
- **错误重试**：网络异常自动重试机制
- **并发控制**：防止重复请求

**实现示例**：
```typescript
// 请求拦截器 (request.ts)
request.interceptors.request.use(
  (config) => {
    // 添加Token
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // AES加密
    if (config.data && cryptoConfig.enabled) {
      config.data = encryptData(config.data);
      config.headers['X-Encrypted'] = 'true';
    }
    
    return config;
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    // AES解密
    if (response.headers['x-encrypted']) {
      response.data = decryptData(response.data);
    }
    
    // Token续期检查
    tokenManager.checkAndRenew();
    
    return response;
  }
);
```

#### 6. 数据加密传输

**AES-256加密**：
- **前后端密钥同步**：确保加解密一致性
- **动态开关控制**：支持开发/生产环境不同配置
- **透明加解密**：业务代码无感知
- **错误容错处理**：加密失败自动降级

**配置示例**：
```typescript
// 加密配置 (crypto.ts)
export const cryptoConfig = {
  enabled: import.meta.env.VITE_ENABLE_CRYPTO === 'true',
  key: import.meta.env.VITE_AES_KEY || '',
  algorithm: 'AES-256-CBC',
};

// 加密工具 (utils/crypto.ts)
export const encryptData = (data: any): string => {
  const iv = CryptoJS.lib.WordArray.random(16);
  const encrypted = CryptoJS.AES.encrypt(
    JSON.stringify(data),
    cryptoConfig.key,
    { iv, mode: CryptoJS.mode.CBC }
  );
  return iv.concat(encrypted.ciphertext).toString();
};
```

#### 7. 调试与开发工具

**调试管理器**：
- **分级日志输出**：DEBUG、INFO、WARN、ERROR
- **环境智能切换**：开发环境详细，生产环境简化
- **组件标记**：每个日志标记来源组件
- **性能追踪**：关键操作性能监控

**使用示例**：
```typescript
// 调试管理器 (debugManager.ts)
export class DebugManager {
  static log(message: string, data?: any, context?: DebugContext) {
    if (isDevelopment) {
      console.log(`🔍 [${context?.component}] ${message}`, data);
    }
  }
  
  static error(message: string, error: Error, context?: DebugContext) {
    console.error(`❌ [${context?.component}] ${message}`, error);
  }
}

// 业务代码中使用
DebugManager.log('用户登录成功', { userId }, { 
  component: 'LoginPage', 
  action: 'login' 
});
```

### 开发中功能 🚧

- **主题切换**：浅色/深色主题支持
- **国际化**：多语言支持
- **离线缓存**：Service Worker缓存策略
- **错误边界**：React错误边界完善
- **性能监控**：Web Vitals性能指标
- **无障碍支持**：ARIA标准支持

## 🔨 开发指南

### 新增页面组件

1. **创建页面文件**
   ```typescript
   // pages/YourModule/index.tsx
   import React from 'react';
   import { Card, Button } from 'antd';
   
   const YourModulePage: React.FC = () => {
     return (
       <Card title="您的模块">
         <Button type="primary">操作按钮</Button>
       </Card>
     );
   };
   
   export default YourModulePage;
   ```

2. **添加路由配置**
   ```typescript
   // router/index.tsx
   const YourModulePage = React.lazy(() => import('@/pages/YourModule'));
   
   // 在路由配置中添加
   {
     path: 'your-module',
     element: (
       <Suspense fallback={fallbackElement}>
         <YourModulePage />
       </Suspense>
     ),
   }
   ```

3. **添加菜单项**（后端配置菜单数据库）

### 新增API接口

1. **定义类型**
   ```typescript
   // types/your-module.ts
   export interface YourModuleRequest {
     name: string;
     description?: string;
   }
   
   export interface YourModuleResponse {
     id: string;
     name: string;
     createTime: string;
   }
   ```

2. **创建API文件**
   ```typescript
   // api/yourModule.ts
   import request from '@/utils/request';
   import type { YourModuleRequest, YourModuleResponse } from '@/types/your-module';
   
   export const yourModuleApi = {
     create: (data: YourModuleRequest): Promise<YourModuleResponse> =>
       request.post('/your-module/create', data),
       
     getList: (): Promise<YourModuleResponse[]> =>
       request.get('/your-module/list'),
       
     update: (id: string, data: Partial<YourModuleRequest>): Promise<void> =>
       request.put(`/your-module/${id}`, data),
       
     delete: (id: string): Promise<void> =>
       request.delete(`/your-module/${id}`),
   };
   ```

3. **使用TanStack Query**
   ```typescript
   // pages/YourModule/index.tsx
   import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
   import { yourModuleApi } from '@/api/yourModule';
   
   const YourModulePage: React.FC = () => {
     const queryClient = useQueryClient();
     
     // 查询数据
     const { data, isLoading } = useQuery({
       queryKey: ['your-module-list'],
       queryFn: yourModuleApi.getList,
     });
     
     // 创建数据
     const createMutation = useMutation({
       mutationFn: yourModuleApi.create,
       onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['your-module-list'] });
       },
     });
   };
   ```

### 状态管理最佳实践

1. **创建Store**
   ```typescript
   // stores/yourModuleStore.ts
   import { create } from 'zustand';
   import { persist } from 'zustand/middleware';
   
   interface YourModuleState {
     data: YourModuleData[];
     selectedId: string | null;
     
     setData: (data: YourModuleData[]) => void;
     setSelected: (id: string | null) => void;
     addItem: (item: YourModuleData) => void;
     removeItem: (id: string) => void;
   }
   
   export const useYourModuleStore = create<YourModuleState>()(
     persist(
       (set, get) => ({
         data: [],
         selectedId: null,
         
         setData: (data) => set({ data }),
         setSelected: (selectedId) => set({ selectedId }),
         
         addItem: (item) => set(state => ({
           data: [...state.data, item]
         })),
         
         removeItem: (id) => set(state => ({
           data: state.data.filter(item => item.id !== id),
           selectedId: state.selectedId === id ? null : state.selectedId
         })),
       }),
       {
         name: 'your-module-storage',
         partialize: (state) => ({
           selectedId: state.selectedId,
         }),
       }
     )
   );
   ```

2. **在组件中使用**
   ```typescript
   const YourComponent: React.FC = () => {
     const { data, selectedId, setSelected, addItem } = useYourModuleStore();
     
     const handleSelect = (id: string) => {
       setSelected(id);
       DebugManager.log('选择项目', { id }, { 
         component: 'YourComponent', 
         action: 'select' 
       });
     };
   };
   ```

### 样式开发规范

1. **使用CSS Modules**
   ```typescript
   // YourComponent.module.css
   .container {
     padding: 16px;
     background: #fff;
     border-radius: 6px;
   }
   
   .title {
     font-size: 16px;
     font-weight: 600;
     margin-bottom: 12px;
   }
   
   // YourComponent.tsx
   import styles from './YourComponent.module.css';
   
   const YourComponent = () => (
     <div className={styles.container}>
       <h2 className={styles.title}>标题</h2>
     </div>
   );
   ```

2. **使用Ant Design主题**
   ```typescript
   // styles/theme.ts
   export const theme = {
     token: {
       colorPrimary: '#1677ff',
       borderRadius: 6,
       fontSize: 14,
     },
     components: {
       Button: {
         borderRadius: 4,
       },
       Table: {
         headerBg: '#fafafa',
       },
     },
   };
   ```

### 工具函数开发

1. **创建工具函数**
   ```typescript
   // utils/yourUtils.ts
   import { DebugManager } from './debugManager';
   
   /**
    * 格式化文件大小
    * @param bytes 字节数
    * @returns 格式化后的字符串
    */
   export const formatFileSize = (bytes: number): string => {
     if (bytes === 0) return '0 B';
     
     const k = 1024;
     const sizes = ['B', 'KB', 'MB', 'GB'];
     const i = Math.floor(Math.log(bytes) / Math.log(k));
     
     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
   };
   
   /**
    * 防抖函数
    * @param func 要防抖的函数
    * @param wait 等待时间（毫秒）
    * @returns 防抖后的函数
    */
   export const debounce = <T extends (...args: any[]) => any>(
     func: T,
     wait: number
   ): ((...args: Parameters<T>) => void) => {
     let timeout: NodeJS.Timeout;
     
     return (...args: Parameters<T>) => {
       clearTimeout(timeout);
       timeout = setTimeout(() => func.apply(null, args), wait);
     };
   };
   ```

2. **添加单元测试**
   ```typescript
   // utils/__tests__/yourUtils.test.ts
   import { formatFileSize, debounce } from '../yourUtils';
   
   describe('yourUtils', () => {
     describe('formatFileSize', () => {
       it('should format bytes correctly', () => {
         expect(formatFileSize(0)).toBe('0 B');
         expect(formatFileSize(1024)).toBe('1 KB');
         expect(formatFileSize(1048576)).toBe('1 MB');
       });
     });
     
     describe('debounce', () => {
       it('should debounce function calls', (done) => {
         const mockFn = jest.fn();
         const debouncedFn = debounce(mockFn, 100);
         
         debouncedFn();
         debouncedFn();
         debouncedFn();
         
         setTimeout(() => {
           expect(mockFn).toHaveBeenCalledTimes(1);
           done();
         }, 150);
       });
     });
   });
   ```

## 📦 构建与部署

### 构建配置

```typescript
// vite.config.ts
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            antd: ['antd', '@ant-design/icons'],
            router: ['react-router-dom'],
            utils: ['axios', 'dayjs', 'crypto-js'],
          }
        }
      },
      chunkSizeWarningLimit: 1000,
    },
    server: {
      port: 5173,
      host: true,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/api')
        }
      }
    }
  };
});
```

### 部署脚本

```bash
#!/bin/bash
# deploy.sh

# 设置环境
ENVIRONMENT=${1:-production}

echo "🚀 开始部署到 $ENVIRONMENT 环境"

# 安装依赖
echo "📦 安装依赖..."
npm ci

# 代码检查
echo "🔍 代码质量检查..."
npm run lint

# 构建应用
echo "🏗️ 构建应用..."
if [ "$ENVIRONMENT" = "production" ]; then
  npm run build:prod
elif [ "$ENVIRONMENT" = "uat" ]; then
  npm run build:uat
else
  npm run build
fi

# 部署到服务器
echo "📤 部署到服务器..."
rsync -avz --delete dist/ user@server:/var/www/svt-web/

echo "✅ 部署完成！"
```

### Nginx配置

```nginx
# /etc/nginx/sites-available/svt-web
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/svt-web;
    index index.html;

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
    }

    # API代理
    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 前端路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

## 🔍 调试与测试

### 开发调试

1. **调试管理器使用**
   ```typescript
   import { DebugManager } from '@/utils/debugManager';
   
   // 在组件中使用
   const handleSubmit = async (data: FormData) => {
     DebugManager.log('表单提交开始', data, { 
       component: 'YourForm', 
       action: 'submit' 
     });
     
     try {
       const result = await api.submit(data);
       DebugManager.log('表单提交成功', result, { 
         component: 'YourForm', 
         action: 'submitSuccess' 
       });
     } catch (error) {
       DebugManager.error('表单提交失败', error as Error, { 
         component: 'YourForm', 
         action: 'submitError' 
       });
     }
   };
   ```

2. **浏览器开发工具**
   - **Redux DevTools**：查看Zustand状态变化
   - **React Developer Tools**：组件树和Props检查
   - **Network面板**：API请求监控
   - **Console面板**：日志和错误信息

### 性能优化

1. **Bundle分析**
   ```bash
   # 安装分析工具
   npm install --save-dev rollup-plugin-visualizer
   
   # 生成分析报告
   npm run build
   npx vite-bundle-analyzer
   ```

2. **代码分割**
   ```typescript
   // 路由级别代码分割
   const HomePage = React.lazy(() => import('@/pages/Home/HomePage'));
   const MenuPage = React.lazy(() => import('@/pages/System/Menu'));
   
   // 组件级别代码分割
   const HeavyComponent = React.lazy(() => import('./HeavyComponent'));
   
   // 在使用时包装Suspense
   <Suspense fallback={<PageLoading />}>
     <HeavyComponent />
   </Suspense>
   ```

3. **图片优化**
   ```typescript
   // 使用WebP格式
   import logoWebP from '@/assets/logo.webp';
   import logoPng from '@/assets/logo.png';
   
   const Logo = () => (
     <picture>
       <source srcSet={logoWebP} type="image/webp" />
       <img src={logoPng} alt="Logo" />
     </picture>
   );
   ```

## 🔒 安全实践

### 前端安全清单

1. **XSS防护**
   - 使用dangerouslySetInnerHTML时进行HTML清理
   - 对用户输入进行转义
   - 设置CSP安全策略

2. **CSRF防护**
   - 使用SameSite Cookie
   - 验证Referer头
   - 实施CSRF Token

3. **敏感信息保护**
   ```typescript
   // 避免在前端存储敏感信息
   const SAFE_CONFIG = {
     apiUrl: import.meta.env.VITE_API_BASE_URL,
     // ❌ 不要这样做
     // secretKey: import.meta.env.VITE_SECRET_KEY,
   };
   
   // 敏感操作确认
   const handleDeleteUser = async (userId: string) => {
     const confirmed = await modal.confirm({
       title: '确认删除',
       content: '此操作不可逆，确定要删除用户吗？',
     });
     
     if (confirmed) {
       await userApi.delete(userId);
     }
   };
   ```

4. **依赖安全**
   ```bash
   # 定期检查依赖漏洞
   npm audit
   
   # 自动修复已知漏洞
   npm audit fix
   
   # 更新到安全版本
   npm update
   ```

## 📖 相关文档

### 技术文档
- [组件架构设计](./docs/Component-Structure.md) - 组件设计原则和规范
- [模块化架构](./docs/Modular-Architecture.md) - 模块化设计理念
- [响应式布局系统](./docs/Responsive-Layout-System.md) - 布局系统设计
- [状态管理指南](./docs/State-Management.md) - Zustand使用指南
- [标签页系统设计](./docs/Tab-System-Design.md) - 标签页实现原理
- [标签状态持久化](./docs/Tab-State-Persistence.md) - 状态持久化机制
- [API数据加密](./docs/API-Encryption-AES.md) - 前端加密实现

### 开发指南
- [开发指南](./docs/开发指南.md) - 详细开发规范和最佳实践
- [环境变量配置](./docs/环境变量配置说明.md) - 环境配置详细说明
- [Schema配置规范](./docs/Schema配置规范.md) - 数据验证配置

## 🤝 贡献指南

### 开发规范
- **代码风格**：遵循ESLint配置规则
- **TypeScript**：使用严格模式，保证类型安全
- **组件命名**：使用PascalCase，文件名与组件名一致
- **提交信息**：使用Conventional Commits规范

### 提交规范
```bash
# 提交信息格式
feat: 添加用户管理页面
fix: 修复登录状态异常
docs: 更新API文档
style: 调整组件样式
refactor: 重构状态管理
test: 添加单元测试
chore: 更新依赖版本
```

### Pull Request流程
1. Fork项目并创建特性分支
2. 完成开发并添加测试
3. 确保代码通过ESLint检查
4. 提交Pull Request并填写详细描述
5. 等待代码审查并根据反馈调整

---

**项目状态**：✅ 开发活跃  
**维护团队**：SVT前端团队  
**最后更新**：2025年7月  
**技术支持**：请提交Issue或联系开发团队