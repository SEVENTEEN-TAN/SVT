import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/utils/request';
import { tokenManager } from '@/utils/tokenManager';
import type { User, LoginRequest, LoginResponse } from '@/types/user';

// 认证状态接口
interface AuthState {
  // 状态
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  expiryDate: string | null; // 新增：token过期日期
  
  // 操作
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  refreshUserInfo: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
}

// 创建认证状态管理
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 初始状态
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      expiryDate: null, // 初始化

      // 登录操作
      login: async (credentials: LoginRequest) => {
        set({ loading: true });
        
        try {
          // 调用登录API - 直接发送明文密码，依赖HTTPS传输加密
          const response = await api.post<LoginResponse>('/auth/login', {
            loginId: credentials.loginId,
            password: credentials.password,  // 直接发送明文密码
            rememberMe: credentials.rememberMe, // 传递rememberMe选项
          });
          
          // 修正：根据后端实际返回的数据结构处理
          const { accessToken } = response;
          
          const now = new Date();
          let calculatedExpiryDate: string | null = null;
          if (credentials.rememberMe) {
            // 如果记住我，设置30天有效期
            now.setDate(now.getDate() + 30);
            calculatedExpiryDate = now.toISOString();
          }

          // 保存token和expiryDate到localStorage
          localStorage.setItem('token', accessToken);
          if (calculatedExpiryDate) {
            localStorage.setItem('expiryDate', calculatedExpiryDate);
          } else {
            localStorage.removeItem('expiryDate'); // 如果不记住，确保清除旧的有效期
          }
          
          // 更新状态 - 暂时不设置用户信息，需要额外获取
          set({
            token: accessToken,
            isAuthenticated: true,
            loading: false,
            expiryDate: calculatedExpiryDate,
          });

          // 启动Token管理器
          tokenManager.start();

          // TODO: 需要调用用户详情接口获取用户信息
          // 这里可以调用 /login/get-user-details 接口
          
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      // 退出登录
      logout: () => {
        // 停止Token管理器
        tokenManager.stop();
        
        // 清除localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('expiryDate'); // 新增：清除expiryDate
        
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
          // TODO: 调用正确的用户详情接口
          // const user = await api.get<User>('/user/profile');
          // set({ user });
          // localStorage.setItem('user', JSON.stringify(user));
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
          
          if (token) {
            state.token = token;
            state.isAuthenticated = true;
            
            if (user) {
              try {
                const parsedUser = JSON.parse(user);
                state.user = parsedUser;
              } catch (error) {
                console.error('恢复用户状态失败:', error);
                localStorage.removeItem('user');
              }
            }
            
            // 如果有有效Token，启动Token管理器
            tokenManager.start();
          } else {
            state.logout();
          }
        }
      },
    }
  )
); 