# Zustand状态管理架构

基于实际代码分析的SVT前端状态管理系统设计与实现。

## 1. 技术选型与架构设计

### 为什么选择Zustand？

SVT项目在React生态的众多状态管理方案中选择Zustand，基于以下技术考量：

**技术优势：**
- **极简API**: 基于Hooks的直观API，学习成本极低
- **轻量级**: 仅2.9KB gzipped，对打包体积影响最小
- **灵活性**: 支持全局状态、局部模块状态，无架构限制
- **零样板代码**: 无需Reducers、Actions、Dispatchers等模板代码
- **原生异步支持**: Action中异步逻辑处理自然简洁
- **TypeScript友好**: 完整的类型安全支持
- **中间件生态**: 支持persist、devtools等中间件

**架构优势：**
- **职责分离**: 按业务领域拆分Store，避免单一巨型状态
- **性能优化**: 精细化状态订阅，只在需要时重渲染
- **开发体验**: 热重载、时间旅行调试、状态持久化
- **测试友好**: 状态逻辑独立，易于单元测试

## 2. SVT状态管理架构

### 2.1 整体架构设计

```
应用层组件
    ↓
状态层 (Zustand Stores) - 职责分离设计
    ├── authStore      (纯认证状态：Token、登录状态、过期时间)
    ├── userStore      (用户信息 + 会话状态：用户详情、权限、会话管理)
    ├── useAuth        (组合Hook：协调authStore和userStore交互)
    └── [业务Store]    (业务状态)
    ↓
持久化层 (Native LocalStorage)
    ├── auth-storage   (认证状态持久化)
    ├── user-storage   (用户信息持久化)
    └── session-state  (会话状态持久化)
    ↓
工具层 (Utilities)
    ├── tokenManager   (Token智能续期管理)
    ├── sessionManager (会话状态管理)
    ├── debugManager   (调试管理)
    └── localStorageManager (存储管理)
```

### 2.2 核心概念与API

**基础Store创建：**
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 1. 定义类型接口
interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

// 2. 创建Store
export const useAuthStore = create<AuthState>()(  // 注意双括号
  persist(  // 持久化中间件
    (set, get) => ({
      // State
      token: null,
      isAuthenticated: false,
      loading: false,
      
      // Actions
      login: async (credentials) => {
        set({ loading: true });
        try {
          const response = await authApi.login(credentials);
          set({ 
            token: response.token, 
            isAuthenticated: true,
            loading: false 
          });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },
      
      logout: async () => {
        set({ token: null, isAuthenticated: false });
      }
    }),
    {
      name: 'auth-storage',  // 持久化键名
      partialize: (state) => ({ 
        token: state.token,  // 只持久化必要字段
        isAuthenticated: state.isAuthenticated 
      })
    }
  )
);
```

### 2.3 核心API说明

- **`set`函数**: 状态更新的唯一入口，支持对象或函数形式
- **`get`函数**: 获取当前完整状态，用于Action内部
- **`persist`中间件**: 自动持久化状态到localStorage
- **`partialize`**: 选择性持久化，避免持久化敏感数据

## 3. 核心Store实现

### 3.1 认证Store (authStore.ts)

**位置**: `src/stores/authStore.ts`

**设计原则**: 职责单一，只负责纯认证逻辑

```typescript
/**
 * 认证Store - 职责分离版本
 * 
 * 职责：
 * - Token管理和验证
 * - 登录/登出状态
 * - 认证状态持久化
 * - JWT智能续期
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { tokenManager } from '@/utils/tokenManager';
import * as authApi from '@/api/auth';

// 纯认证状态接口
interface AuthState {
  // 认证相关状态
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  expiryDate: string | null;
  
  // 认证相关操作
  login: (credentials: LoginRequest) => Promise<void>;
  logout: (options?: { message?: string }) => Promise<void>;
  clearAuthState: () => void;
  setToken: (token: string, expiryDate?: string | null) => void;
  refreshToken: () => Promise<void>;
}

// 创建认证Store
export const useAuthStore = create<AuthState>()(  
  persist(
    (set, get) => ({
      // 初始状态
      token: null,
      isAuthenticated: false,
      loading: false,
      expiryDate: null,

      // 登录逻辑
      login: async (credentials: LoginRequest) => {
        set({ loading: true });
        try {
          DebugManager.log('认证Store', '开始登录流程', credentials.username);
          
          const response = await authApi.login(credentials);
          
          // 设置认证状态
          set({
            token: response.token,
            isAuthenticated: true,
            loading: false,
            expiryDate: response.expiryDate
          });
          
          // 初始化存储
          initializeStorageOnLogin();
          
          // 设置Token管理器
          tokenManager.setToken(response.token, response.expiryDate);
          
          DebugManager.log('认证Store', '登录成功');
          
        } catch (error) {
          set({ loading: false });
          DebugManager.error('认证Store', '登录失败', error);
          throw error;
        }
      },

      // 登出逻辑
      logout: async (options = {}) => {
        try {
          DebugManager.log('认证Store', '开始登出流程');
          
          // 调用登出API
          await authApi.logout();
          
          // 清理认证状态
          set({
            token: null,
            isAuthenticated: false,
            loading: false,
            expiryDate: null
          });
          
          // 清理存储
          clearStorageOnLogout();
          
          // 清理Token管理器
          tokenManager.clearToken();
          
          if (options.message) {
            message.info(options.message);
          }
          
        } catch (error) {
          DebugManager.error('认证Store', '登出失败', error);
        }
      },

      // 清理认证状态
      clearAuthState: () => {
        set({
          token: null,
          isAuthenticated: false,
          loading: false,
          expiryDate: null
        });
        clearStorageOnTokenExpired();
      },

      // 设置Token
      setToken: (token: string, expiryDate: string | null = null) => {
        set({ 
          token, 
          isAuthenticated: true, 
          expiryDate 
        });
        tokenManager.setToken(token, expiryDate);
      },

      // 刷新Token
      refreshToken: async () => {
        try {
          const response = await authApi.refreshToken();
          set({
            token: response.token,
            expiryDate: response.expiryDate
          });
          tokenManager.setToken(response.token, response.expiryDate);
        } catch (error) {
          // Token刷新失败，清除认证状态
          get().clearAuthState();
          throw error;
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        expiryDate: state.expiryDate
      }),
      // 版本控制，数据结构变化时自动清理
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          // 清理旧版本数据
          cleanupLegacyStorage();
          return {
            token: null,
            isAuthenticated: false,
            expiryDate: null
          };
        }
        return persistedState;
      }
    }
  )
);
```

### 3.2 用户Store (userStore.ts)

**位置**: `src/stores/userStore.ts`

**设计原则**: 专注用户信息和组织数据管理

```typescript
interface UserState {
  // 用户基本信息
  userInfo: UserInfo | null;
  permissions: string[];
  roles: RoleInfo[];
  currentOrgId: string | null;
  
  // 用户操作
  fetchUserInfo: () => Promise<void>;
  updateUserInfo: (userInfo: UserInfo) => void;
  setCurrentOrg: (orgId: string) => void;
  clearUserInfo: () => void;
}

export const useUserStore = create<UserState>()(  
  persist(
    (set, get) => ({
      userInfo: null,
      permissions: [],
      roles: [],
      currentOrgId: null,

      fetchUserInfo: async () => {
        try {
          const response = await userApi.getCurrentUser();
          set({
            userInfo: response.userInfo,
            permissions: response.permissions,
            roles: response.roles,
            currentOrgId: response.currentOrgId
          });
        } catch (error) {
          DebugManager.error('用户Store', '获取用户信息失败', error);
          throw error;
        }
      },

      updateUserInfo: (userInfo: UserInfo) => {
        set({ userInfo });
      },

      setCurrentOrg: (orgId: string) => {
        set({ currentOrgId: orgId });
      },

      clearUserInfo: () => {
        set({
          userInfo: null,
          permissions: [],
          roles: [],
          currentOrgId: null
        });
      }
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        userInfo: state.userInfo,
        currentOrgId: state.currentOrgId
        // 注意：权限和角色不持久化，每次重新获取
      })
    }
  )
);
```

### 3.3 会话Store (sessionStore.ts)

**位置**: `src/stores/sessionStore.ts`

**设计原则**: 管理会话级别的临时状态

```typescript
interface SessionState {
  // 会话状态
  refreshKey: number;
  lastActivity: number;
  sessionWarning: boolean;
  
  // 会话操作
  updateActivity: () => void;
  triggerRefresh: () => void;
  showSessionWarning: () => void;
  hideSessionWarning: () => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>()(
  // 会话状态不持久化，随浏览器关闭而清除
  (set, get) => ({
    refreshKey: 0,
    lastActivity: Date.now(),
    sessionWarning: false,

    updateActivity: () => {
      set({ lastActivity: Date.now() });
      sessionManager.updateActivity();
    },

    triggerRefresh: () => {
      set(state => ({ refreshKey: state.refreshKey + 1 }));
    },

    showSessionWarning: () => {
      set({ sessionWarning: true });
    },

    hideSessionWarning: () => {
      set({ sessionWarning: false });
    },

    clearSession: () => {
      set({
        refreshKey: 0,
        lastActivity: Date.now(),
        sessionWarning: false
      });
    }
  })
);
```

### 3.4 缓存机制设计

SVT前端实现了多层缓存策略，提供高性能的数据访问：

**缓存类型：**
```typescript
// 1. 安全存储缓存（加密）
SecureStorage:
├── svt_secure_auth_token    # JWT认证令牌
├── svt_secure_user_data     # 用户详细信息（加密）
└── svt_secure_permissions   # 权限数据（加密）

// 2. 普通localStorage缓存
LocalStorage:
├── svt-tab-state           # Tab页签状态
├── svt-active-tab          # 当前激活Tab
├── auth-storage            # Auth Store持久化
└── user-storage            # User Store持久化
```

**缓存数据格式：**
```typescript
// 安全存储格式
interface SecureStorageItem {
  encrypted: boolean;        // 是否加密
  data: string;             // 数据内容
  timestamp: number;        // 时间戳
  version: string;          // 版本号
}

// 示例：JWT Token存储
{
  "encrypted": false,
  "data": "\"eyJhbGciOiJIUzI1NiJ9...\"",
  "timestamp": 1751592860788,
  "version": "1.0"
}

// 示例：用户数据存储（加密）
{
  "encrypted": true,
  "data": "U2FsdGVkX1+...", // AES加密后的数据
  "timestamp": 1751592860790,
  "version": "1.0"
}
```

**缓存策略：**
- **认证数据**: 高安全性，短期存储，自动过期
- **用户数据**: 中等安全性，长期存储，加密保护
- **Tab状态**: 低安全性，会话存储，明文保存
- **权限数据**: 高安全性，中期存储，加密保护

## 4. Store使用模式

### 4.1 组件中使用Store

**基础用法：**
```typescript
import { useAuthStore } from '@/stores/authStore';

const LoginComponent: React.FC = () => {
  // 方式1: 订阅所有状态（谨慎使用）
  const authStore = useAuthStore();
  
  // 方式2: 选择性订阅（推荐）
  const { isAuthenticated, loading } = useAuthStore(
    state => ({ 
      isAuthenticated: state.isAuthenticated, 
      loading: state.loading 
    })
  );
  
  // 方式3: 只订阅Actions（性能最优）
  const login = useAuthStore(state => state.login);
  
  // 使用
  const handleLogin = async (credentials: LoginRequest) => {
    try {
      await login(credentials);
      // 登录成功处理
    } catch (error) {
      // 错误处理
    }
  };

  return (
    <form onSubmit={handleLogin}>
      {/* 表单内容 */}
      <button type="submit" loading={loading}>
        {loading ? '登录中...' : '登录'}
      </button>
    </form>
  );
};
```

**选择器模式（性能优化）：**
```typescript
// 创建选择器，避免重复创建
const authSelector = (state: AuthState) => ({
  isAuthenticated: state.isAuthenticated,
  token: state.token
});

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, token } = useAuthStore(authSelector);
  
  // 只有isAuthenticated或token变化时才重渲染
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};
```

### 4.2 Store间通信

**单向依赖：**
```typescript
// authStore.ts
export const useAuthStore = create<AuthState>()(  
  persist(
    (set, get) => ({
      // ...
      logout: async () => {
        // 1. 清理认证状态
        set({ token: null, isAuthenticated: false });
        
        // 2. 清理其他Store（单向依赖）
        useUserStore.getState().clearUserInfo();
        useSessionStore.getState().clearSession();
        
        // 3. 跳转登录页
        window.location.href = '/login';
      }
    }),
    { name: 'auth-storage' }
  )
);
```

**事件驱动通信：**
```typescript
// 使用自定义事件进行Store间通信
const AUTH_EVENTS = {
  TOKEN_EXPIRED: 'auth:token-expired',
  LOGOUT: 'auth:logout'
} as const;

// authStore中发出事件
logout: async () => {
  // 清理状态
  set({ token: null, isAuthenticated: false });
  
  // 发出登出事件
  window.dispatchEvent(new CustomEvent(AUTH_EVENTS.LOGOUT));
}

// 其他Store监听事件
useEffect(() => {
  const handleLogout = () => {
    // 处理登出后的清理工作
    useUserStore.getState().clearUserInfo();
  };
  
  window.addEventListener(AUTH_EVENTS.LOGOUT, handleLogout);
  return () => window.removeEventListener(AUTH_EVENTS.LOGOUT, handleLogout);
}, []);
```

### 4.3 中间件使用

**Persist中间件配置：**
```typescript
export const useAuthStore = create<AuthState>()(  
  persist(
    (set, get) => ({
      // Store实现
    }),
    {
      name: 'auth-storage',        // localStorage键名
      
      // 部分持久化
      partialize: (state) => ({
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        // loading不持久化，防止刷新后显示加载状态
      }),
      
      // 版本管理
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          return { ...persistedState, newField: 'defaultValue' };
        }
        return persistedState;
      },
      
      // 自定义存储引擎
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          try {
            return JSON.parse(str);
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        }
      }
    }
  )
);
```

**DevTools中间件：**
```typescript
import { devtools } from 'zustand/middleware';

export const useAuthStore = create<AuthState>()(  
  devtools(
    persist(
      (set, get) => ({
        // Store实现
      }),
      { name: 'auth-storage' }
    ),
    {
      name: 'auth-store',  // DevTools中显示的名称
      enabled: process.env.NODE_ENV === 'development'
    }
  )
);
```

## 5. 最佳实践

### 5.1 设计原则

1. **职责单一**: 每个Store只负责一个业务领域
2. **状态最小化**: 只存储必需的状态，派生状态通过计算获得
3. **不可变更新**: 使用set函数更新状态，避免直接修改
4. **选择性订阅**: 只订阅需要的状态，优化渲染性能
5. **错误边界**: Action中妥善处理异常，避免状态污染

### 5.2 性能优化

**1. 避免订阅整个Store：**
```typescript
// ❌ 错误：订阅整个Store
const authStore = useAuthStore();

// ✅ 正确：只订阅需要的状态
const isAuthenticated = useAuthStore(state => state.isAuthenticated);
```

**2. 使用稳定的选择器：**
```typescript
// ❌ 错误：每次渲染都创建新选择器
const { user, permissions } = useUserStore(state => ({
  user: state.userInfo,
  permissions: state.permissions
}));

// ✅ 正确：使用稳定的选择器
const userSelector = useCallback(
  (state: UserState) => ({
    user: state.userInfo,
    permissions: state.permissions
  }),
  []
);
const { user, permissions } = useUserStore(userSelector);
```

**3. 批量状态更新：**
```typescript
// ❌ 错误：多次set调用
set({ loading: true });
set({ error: null });
set({ data: [] });

// ✅ 正确：批量更新
set({ 
  loading: true, 
  error: null, 
  data: [] 
});
```

### 5.3 调试与测试

**1. 状态调试：**
```typescript
// 开发环境启用状态日志
const useAuthStore = create<AuthState>()(  
  devtools(
    (set, get) => ({
      login: async (credentials) => {
        console.log('登录前状态:', get());
        // 登录逻辑
        console.log('登录后状态:', get());
      }
    }),
    { name: 'auth-store' }
  )
);
```

**2. 单元测试：**
```typescript
// auth.test.ts
import { useAuthStore } from '@/stores/authStore';

describe('AuthStore', () => {
  beforeEach(() => {
    // 重置Store状态
    useAuthStore.setState({
      token: null,
      isAuthenticated: false,
      loading: false
    });
  });

  it('should login successfully', async () => {
    const store = useAuthStore.getState();
    
    await store.login({ username: 'test', password: 'test' });
    
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.token).toBeTruthy();
  });
});
```

### 5.4 安全考虑

1. **敏感数据处理**: 密码等敏感数据不存储在Store中
2. **持久化选择**: 谨慎选择持久化的状态，避免泄露敏感信息
3. **Token安全**: Token应设置合理的过期时间和刷新机制
4. **状态清理**: 登出时彻底清理所有相关状态
5. **错误信息**: 避免在错误信息中暴露系统内部细节

## 6. 架构更新记录 (v1.0.1-SNAPSHOT)

### 6.1 职责分离重构

**背景**: 为了提高代码可维护性和性能，我们对状态管理架构进行了重构。

**主要变更**:
1. **authStore职责收窄**: 专注于纯认证逻辑（Token、登录状态、过期时间）
2. **userStore职责扩展**: 整合了用户信息和会话状态管理
3. **sessionStore移除**: 会话相关状态合并到userStore中
4. **useAuth组合Hook**: 提供统一的认证接口，协调多个Store交互

**新架构优势**:
- **更清晰的职责分离**: 每个Store有明确的职责边界
- **简化的状态管理**: 减少Store间复杂依赖关系
- **更好的性能**: 避免不必要的状态订阅和组件重渲染
- **更容易测试**: 独立的Store更易于单元测试

### 6.2 全局验证状态优化

**问题**: 页面切换时出现重复API调用，影响性能和用户体验。

**解决方案**: 实现全局验证状态管理
```typescript
// useUserStatus.ts
let globalVerificationStatus = {
  hasVerified: false,
  isVerifying: false,
  verificationPromise: null as Promise<UserStatusVerificationResult> | null
};

export const resetGlobalVerificationStatus = () => {
  globalVerificationStatus = {
    hasVerified: false,
    isVerifying: false,
    verificationPromise: null
  };
};
```

**效果**:
- 防止重复的用户状态验证调用
- 提升页面切换性能
- 改善用户体验

### 6.3 性能优化实现

**权限检查优化**:
```typescript
// O(1)权限检查实现
const permissionPaths = useMemo(() => {
  return user?.menuTrees ? buildPermissionIndex(user.menuTrees as MenuItem[]) : new Set<string>();
}, [user?.menuTrees]);

const hasPermission = permissionPaths.has(currentPath); // O(1)查找
```

**导航系统优化**:
```typescript
// 修复强制刷新问题
const handleMenuClick = (key: string) => {
  addTab(key, false); // 正常切换，不强制刷新
};
```

### 6.4 移除"记住我"功能

**背景**: 简化认证流程，统一Token管理策略。

**变更内容**:
1. 移除登录页面的"记住我"复选框
2. 移除LoginRequest中的rememberMe字段
3. 移除authStore中的记住我逻辑
4. Token过期时间完全由后端JWT控制

**代码变更**:
```typescript
// 旧版本
interface LoginRequest {
  loginId: string;
  password: string;
  captcha?: string;
  rememberMe?: boolean; // 已移除
}

// 新版本
interface LoginRequest {
  loginId: string;
  password: string;
  captcha?: string;
}
```

---

**文档版本**: v1.0.1-SNAPSHOT  
**最后更新**: 2025年7月  
**更新说明**: 反映最新的状态管理架构和性能优化