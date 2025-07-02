/**
 * 认证Store - 职责分离版本
 * 
 * 职责：
 * - 只负责纯认证逻辑（token、登录状态、过期时间）
 * - 简化的登录/登出流程
 * - Token管理和刷新
 * - 认证状态持久化
 * 
 * @author SVT Team
 * @since 2025-06-29
 * @version 2.0.0
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { tokenManager } from '@/utils/tokenManager';
import * as authApi from '@/api/auth';
import type { LoginRequest } from '@/types/user';
import {
  initializeStorageOnLogin,
  clearStorageOnLogout,
  clearStorageOnTokenExpired,
  cleanupLegacyStorage,
  STORAGE_KEYS
} from '@/utils/localStorageManager';
import { message } from 'antd';
import { DebugManager } from '@/utils/debugManager';
import { sessionManager } from '@/utils/sessionManager';

// 纯认证状态接口 - 职责单一
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

// 创建纯认证状态管理
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 初始状态
      token: null,
      isAuthenticated: false,
      loading: false,
      expiryDate: null,

      // 登录操作 - 简化版，只处理认证
      login: async (credentials: LoginRequest) => {
        set({ loading: true });
        
        try {
          DebugManager.log('🚀 [JWT智能续期测试] 开始用户登录', { username: credentials.loginId }, { 
            component: 'authStore', 
            action: 'login' 
          });
          
          // 登录时初始化localStorage
          initializeStorageOnLogin();
          
          // 调用登录API
          const response = await authApi.login(credentials);
          const { accessToken } = response;
          
          DebugManager.log('✅ [JWT智能续期测试] 登录API调用成功', { 
            tokenLength: accessToken?.length,
            tokenPrefix: accessToken?.substring(0, 20) + '...'
          }, { 
            component: 'authStore', 
            action: 'loginSuccess' 
          });
          
          // 计算过期时间
          const now = new Date();
          let calculatedExpiryDate: string | null = null;
          if (credentials.rememberMe) {
            now.setDate(now.getDate() + 30);
            calculatedExpiryDate = now.toISOString();
          }

          // 存储过期时间到localStorage
          if (calculatedExpiryDate) {
            localStorage.setItem(STORAGE_KEYS.EXPIRY_DATE, calculatedExpiryDate);
          } else {
            localStorage.removeItem(STORAGE_KEYS.EXPIRY_DATE);
          }
          
          // 更新认证状态
          set({
            token: accessToken,
            isAuthenticated: true,
            loading: false,
            expiryDate: calculatedExpiryDate,
          });

          // 启动Token管理器
          tokenManager.start();
          DebugManager.log('🔄 [JWT智能续期测试] Token管理器已启动', {}, { 
            component: 'authStore', 
            action: 'tokenManagerStart' 
          });

          // 重置会话管理器状态
          sessionManager.reset();
          DebugManager.log('🔄 [JWT智能续期测试] SessionManager已重置', {}, { 
            component: 'authStore', 
            action: 'sessionManagerReset' 
          });

          DebugManager.production('🎉 [JWT智能续期测试] 用户登录成功', {
            component: 'authStore',
            action: 'login'
          });
          
        } catch (error) {
          set({ loading: false });
          DebugManager.error('❌ [JWT智能续期测试] 用户登录失败', error as Error, { 
            component: 'authStore', 
            action: 'login' 
          });
          throw error;
        }
      },

      // 退出登录 - 简化版，只处理认证清理
      logout: async (options?: { message?: string }) => {
        const state = get();
        
        // 防止重复调用logout
        if (state.loading || !state.isAuthenticated) {
          DebugManager.log('登出操作跳过', {
            reason: state.loading ? '已在进行中' : '用户未认证',
            loading: state.loading,
            isAuthenticated: state.isAuthenticated
          }, { component: 'authStore', action: 'logout' });
          return;
        }

        const initialMessage = options?.message;

        // 被动强制登出时显示提示
        if (initialMessage) {
          message.warning(initialMessage);
        }

        set({ loading: true });
        
        try {
          // 只有在token有效时才调用后端logout
          if (state.token && state.isAuthenticated) {
            try {
              await authApi.logout();
            } catch (error: unknown) {
              const axiosError = error as { response?: { status?: number } };
              if (axiosError.response?.status !== 401) {
                DebugManager.warn('调用后端logout接口失败', error as Error, {
                  component: 'authStore',
                  action: 'logout'
                });
                if (!initialMessage) {
                  message.error('退出登录失败，请稍后重试');
                }
              }
            }
          }
        } finally {
          // 清理认证状态
          get().clearAuthState();
        }
      },

      // 直接清理认证状态
      clearAuthState: () => {
        DebugManager.log('🧹 [JWT智能续期测试] 开始清理认证状态', { skipLogoutAPI: true }, { 
          component: 'authStore', 
          action: 'clearAuthState' 
        });
        
        // 停止Token管理器
        tokenManager.stop();
        DebugManager.log('🔄 [JWT智能续期测试] Token管理器已停止', {}, { 
          component: 'authStore', 
          action: 'tokenManagerStop' 
        });
        
        // 清理localStorage
        clearStorageOnTokenExpired();
        DebugManager.log('🧹 [JWT智能续期测试] localStorage已清理', {}, { 
          component: 'authStore', 
          action: 'localStorageCleared' 
        });
        
        // 🔧 关键修复：清理所有Zustand persist存储
        // 清理session-storage (机构角色选择状态)
        localStorage.removeItem('session-storage');
        DebugManager.log('🧹 [JWT智能续期测试] session-storage已清理', {}, { 
          component: 'authStore', 
          action: 'sessionStorageCleared' 
        });
        
        // 清理user-storage (用户详情状态)  
        localStorage.removeItem('user-storage');
        DebugManager.log('🧹 [JWT智能续期测试] user-storage已清理', {}, { 
          component: 'authStore', 
          action: 'userStorageCleared' 
        });
        
        // 重置认证状态
        set({
          token: null,
          isAuthenticated: false,
          loading: false,
          expiryDate: null,
        });
        
        DebugManager.production('🎯 [JWT智能续期测试] 认证状态完全清理完成', { 
          component: 'authStore', 
          action: 'clearAuthState' 
        });
      },

      // 设置Token - 新增方法，供其他Store使用
      setToken: (token: string, expiryDate?: string | null) => {
        set({
          token,
          isAuthenticated: true,
          expiryDate: expiryDate || null
        });
        
        if (expiryDate) {
          localStorage.setItem(STORAGE_KEYS.EXPIRY_DATE, expiryDate);
        }
        
        // 启动Token管理器
        tokenManager.start();
      },

      // 刷新Token
      refreshToken: async () => {
        const { token } = get();
        if (!token) {
          throw new Error('No token available for refresh');
        }

        try {
          const response = await authApi.refreshToken();
          const { accessToken } = response;
          
          set({ token: accessToken });
          
          DebugManager.log('Token刷新成功', undefined, { 
            component: 'authStore', 
            action: 'refreshToken' 
          });
          
        } catch (error) {
          DebugManager.error('Token刷新失败', error as Error, { 
            component: 'authStore', 
            action: 'refreshToken' 
          });
          
          // Token刷新失败，清理状态
          get().clearAuthState();
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage', // 使用标准的storage key
      // 只持久化认证相关状态
      partialize: (state: AuthState) => ({
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        expiryDate: state.expiryDate,
      }),
      // 从localStorage恢复状态时的处理
      onRehydrateStorage: () => (state: AuthState | undefined) => {
        cleanupLegacyStorage();
        
        if (state) {
          if (state.token && state.isAuthenticated) {
            // 恢复认证状态时启动Token管理器
            tokenManager.start();
            
            DebugManager.log('认证状态已恢复', { 
              hasToken: !!state.token,
              isAuthenticated: state.isAuthenticated 
            }, { component: 'authStore', action: 'onRehydrateStorage' });
          } else {
            // 清除无效状态
            state.token = null;
            state.isAuthenticated = false;
            state.expiryDate = null;
            localStorage.removeItem(STORAGE_KEYS.EXPIRY_DATE);
            cleanupLegacyStorage();
          }
        }
      },
    }
  )
);
