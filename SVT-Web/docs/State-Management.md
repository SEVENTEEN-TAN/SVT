# 状态管理 (Zustand)

本文档阐述了SVT前端项目选择Zustand作为状态管理库的原因、其核心概念以及项目中的具体实践。

## 1. 为什么选择Zustand？

在React生态中，存在众多状态管理方案（Redux, MobX, Recoil等）。本项目选择Zustand主要基于以下优点：

- **极简API**: Zustand提供了一个极其简单和直观的API，基于Hooks，学习成本非常低。
- **轻量级**: 它非常小巧，几乎不会给项目增加额外的打包体积负担。
- **灵活性**: 它不强制规定项目的结构，可以轻松地与现有代码集成，既能管理全局状态，也能管理局部模块状态。
- **去模板化**: 无需编写大量的样板代码（如Reducers, Actions, Dispatchers），代码更简洁。
- **支持异步**: 在`action`中处理异步逻辑非常自然。

## 2. 核心概念

Zustand的核心是一个`create`函数，它用于创建一个`store`（仓库）。这个`store`是一个Hook，可以在任何React组件中调用以获取状态和更新状态的方法。

```typescript
import { create } from 'zustand';

// 1. 定义State和Actions的接口
interface BearState {
  bears: number;
  increasePopulation: () => void;
  removeAllBears: () => void;
}

// 2. 创建Store
export const useBearStore = create<BearState>((set) => ({
  // State
  bears: 0,
  
  // Actions
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  
  removeAllBears: () => set({ bears: 0 }),
}));
```

- **`set`函数**: 这是更新状态的唯一途径。它可以接收一个对象或一个返回对象的函数。

## 3. 项目中的实践 (`stores/authStore.ts`)

在SVT项目中，我们使用Zustand来管理全局的用户认证信息。`stores/authStore.ts`是其核心实现。

### 3.1 `authStore` 的结构

```typescript
// stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserInfo } from '@/types/user'; // 假设的用户信息类型
import { TokenVO } from '@/types/api';   // 假设的Token类型

interface AuthState {
  token: TokenVO | null;
  userInfo: UserInfo | null;
  isLoggedIn: boolean;
  actions: {
    setToken: (token: TokenVO) => void;
    setUserInfo: (userInfo: UserInfo) => void;
    logout: () => void;
  };
}

export const useAuthStore = create<AuthState>()(
  // 使用 persist 中间件将状态持久化到localStorage
  persist(
    (set, get) => ({
      token: null,
      userInfo: null,
      isLoggedIn: false,
      actions: {
        setToken: (token) => set({ token, isLoggedIn: true }),
        setUserInfo: (userInfo) => set({ userInfo }),
        logout: () => set({ token: null, userInfo: null, isLoggedIn: false }),
      },
    }),
    {
      name: 'auth-storage', // localStorage中的key
      // 只持久化部分数据，actions不需要持久化
      partialize: (state) => ({ token: state.token, userInfo: state.userInfo, isLoggedIn: state.isLoggedIn }),
    }
  )
);

// 导出Actions，便于在非组件环境中使用
export const { setToken, setUserInfo, logout } = useAuthStore.getState().actions;
```

### 3.2 `persist` 中间件

我们使用了Zustand的`persist`中间件，它能自动将`store`的状态同步到`localStorage`（或其他存储）。这确保了用户在刷新页面后，其登录状态不会丢失。

### 3.3 在组件中使用

在React组件中获取和使用状态非常简单。

**获取状态:**
```tsx
import { useAuthStore } from '@/stores/authStore';

function UserProfile() {
  const userInfo = useAuthStore((state) => state.userInfo);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  if (!isLoggedIn) return <div>请先登录</div>;
  
  return <div>欢迎, {userInfo?.username}</div>;
}
```
> **最佳实践**: 推荐使用选择器（selector）函数 `(state) => state.someValue` 来获取状态。这会进行性能优化，只有当被选择的状态值发生变化时，组件才会重新渲染。

**调用Action:**
```tsx
import { useAuthStore } from '@/stores/authStore';

function LogoutButton() {
  const logoutAction = useAuthStore((state) => state.actions.logout);

  const handleLogout = () => {
    // 调用logout action
    logoutAction();
    // ... 其他清理逻辑，如跳转到登录页
  };

  return <button onClick={handleLogout}>退出登录</button>;
}
```

### 3.4 在非组件文件中使用

有时需要在非React组件的文件（如API请求工具`request.ts`）中获取或更新状态。可以通过`useAuthStore.getState()`来实现。

```typescript
// utils/request.ts
import { useAuthStore } from '@/stores/authStore';

axiosInstance.interceptors.request.use((config) => {
  // 从store中获取token
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token.accessToken}`;
  }
  return config;
});
```
这种方式使得状态管理变得非常灵活和解耦。 