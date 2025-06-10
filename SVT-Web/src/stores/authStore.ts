import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import CryptoJS from 'crypto-js';
import { api } from '@/utils/request';
import type { User, LoginRequest, LoginResponse } from '@/types/user';

// 认证状态接口
interface AuthState {
  // 状态
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  
  // 操作
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  refreshUserInfo: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
}

// AES加密密钥（实际项目中应该从环境变量获取）
const SECRET_KEY = 'svt-web-secret-key-2024';

// 密码加密函数
const encryptPassword = (password: string): string => {
  return CryptoJS.AES.encrypt(password, SECRET_KEY).toString();
};

// 创建认证状态管理
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 初始状态
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,

      // 登录操作
      login: async (credentials: LoginRequest) => {
        set({ loading: true });
        
        try {
          // 加密密码
          const encryptedPassword = encryptPassword(credentials.password);
          
          // 调用登录API
          const response = await api.post<LoginResponse>('/auth/login', {
            username: credentials.username,
            password: encryptedPassword,
          });
          
          const { token, user } = response;
          
          // 保存到localStorage
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          
          // 更新状态
          set({
            user,
            token,
            isAuthenticated: true,
            loading: false,
          });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      // 退出登录
      logout: () => {
        // 清除localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // 重置状态
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
        });
      },

      // 刷新用户信息
      refreshUserInfo: async () => {
        const { token } = get();
        if (!token) return;
        
        try {
          const user = await api.get<User>('/user/profile');
          set({ user });
          localStorage.setItem('user', JSON.stringify(user));
        } catch (error) {
          console.error('刷新用户信息失败:', error);
          // 如果刷新失败，可能token已过期，执行logout
          get().logout();
        }
      },

      // 更新用户信息
      updateUser: (userData: Partial<User>) => {
        const { user } = get();
        if (user) {
          const updatedUser = { ...user, ...userData };
          set({ user: updatedUser });
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      // 只持久化token和user，不持久化loading状态
      partialize: (state: AuthState) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      // 从localStorage恢复状态时的处理
      onRehydrateStorage: () => (state: AuthState | undefined) => {
        if (state) {
          // 检查token是否存在且有效
          const token = localStorage.getItem('token');
          const user = localStorage.getItem('user');
          
          if (token && user) {
            try {
              const parsedUser = JSON.parse(user);
              state.token = token;
              state.user = parsedUser;
              state.isAuthenticated = true;
            } catch (error) {
              console.error('恢复用户状态失败:', error);
              state.logout();
            }
          } else {
            state.logout();
          }
        }
      },
    }
  )
); 