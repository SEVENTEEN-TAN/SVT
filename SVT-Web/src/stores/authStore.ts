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
import { tokenManager } from '@/utils/tokenManager';
import * as authApi from '@/api/auth';
import type { LoginRequest } from '@/types/user';
import {
  initializeStorageOnLogin,
  clearStorageOnTokenExpired,
  STORAGE_KEYS
} from '@/utils/localStorageManager';
import { migrateFromSecureStorage } from '@/utils/encryptedStorage';
import { message } from 'antd';
import { DebugManager } from '@/utils/debugManager';
import { sessionManager } from '@/utils/sessionManager';
import { resetGlobalVerificationStatus } from '@/hooks/useUserStatus';

// 原生localStorage存储键
const AUTH_STORAGE_KEY = 'auth-storage';

// 存储认证状态到localStorage
const saveAuthState = (state: { token: string | null; isAuthenticated: boolean; expiryDate: string | null }) => {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
    DebugManager.log('✅ [authStore] 认证状态已保存到localStorage', {
      hasToken: !!state.token,
      isAuthenticated: state.isAuthenticated,
      tokenLength: state.token?.length || 0
    }, { component: 'authStore', action: 'saveState' });
  } catch (error) {
    DebugManager.error('❌ [authStore] 保存认证状态失败', error as Error, {
      component: 'authStore',
      action: 'saveState'
    });
  }
};

// 从localStorage恢复认证状态
const loadAuthState = () => {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      const state = JSON.parse(stored);
      DebugManager.log('✅ [authStore] 从localStorage恢复认证状态', {
        hasToken: !!state.token,
        isAuthenticated: state.isAuthenticated,
        tokenLength: state.token?.length || 0
      }, { component: 'authStore', action: 'loadState' });
      return state;
    }
  } catch (error) {
    DebugManager.error('❌ [authStore] 恢复认证状态失败', error as Error, {
      component: 'authStore',
      action: 'loadState'
    });
  }
  return null;
};

// 清除localStorage中的认证状态
const clearAuthState = () => {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    DebugManager.log('🧹 [authStore] 已清除localStorage中的认证状态', {}, {
      component: 'authStore',
      action: 'clearState'
    });
  } catch (error) {
    DebugManager.error('❌ [authStore] 清除认证状态失败', error as Error, {
      component: 'authStore',
      action: 'clearState'
    });
  }
};

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

// 创建纯认证状态管理 - 使用原生localStorage
export const useAuthStore = create<AuthState>()((set, get) => {
  // 从localStorage恢复初始状态
  const savedState = loadAuthState();

  return {
      // 初始状态 - 从localStorage恢复或使用默认值
      token: savedState?.token || null,
      isAuthenticated: savedState?.isAuthenticated || false,
      loading: false,
      expiryDate: savedState?.expiryDate || null,

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
          
          // 移除记住我功能，不设置额外的过期时间
          // Token过期时间完全由后端JWT控制
          const calculatedExpiryDate: string | null = null;

          // 清除可能存在的旧过期时间设置
          localStorage.removeItem(STORAGE_KEYS.EXPIRY_DATE);
          
          // 更新认证状态
          const newAuthState = {
            token: accessToken,
            isAuthenticated: true,
            expiryDate: calculatedExpiryDate,
          };

          set({
            ...newAuthState,
            loading: false,
          });

          // 保存到localStorage
          saveAuthState(newAuthState);

          DebugManager.log('🔐 [authStore] 认证状态已保存到localStorage', {
            tokenLength: accessToken.length
          }, {
            component: 'authStore',
            action: 'saveAuthState'
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
        
        // 重置全局用户状态验证状态
        resetGlobalVerificationStatus();
        DebugManager.log('🔄 [JWT智能续期测试] 全局用户状态验证状态已重置', {}, { 
          component: 'authStore', 
          action: 'globalVerificationReset' 
        });
        
        // 清理旧的SecureStorage（如果存在）
        localStorage.removeItem('svt_secure_auth_token');
        localStorage.removeItem('svt_secure_user_data');
        DebugManager.log('🧹 [统一存储] 旧存储已清理', {}, { 
          component: 'authStore', 
          action: 'legacyStorageCleared' 
        });
        
        // 重置认证状态
        set({
          token: null,
          isAuthenticated: false,
          loading: false,
          expiryDate: null,
        });

        // 清除localStorage中的认证状态
        clearAuthState();

        DebugManager.production('🎯 [authStore] 认证状态完全清理完成', {
          component: 'authStore',
          action: 'clearAuthState'
        });
      },

      // 设置Token - 新增方法，供其他Store使用
      setToken: (token: string, expiryDate?: string | null) => {
        const newState = {
          token,
          isAuthenticated: true,
          expiryDate: expiryDate || null
        };

        set(newState);

        // 保存到localStorage
        saveAuthState(newState);

        if (expiryDate) {
          localStorage.setItem(STORAGE_KEYS.EXPIRY_DATE, expiryDate);
        }

        DebugManager.log('🔐 [authStore] Token已更新并保存', {
          tokenLength: token.length
        }, {
          component: 'authStore',
          action: 'setToken'
        });
        
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
  };
});

// 初始化时执行迁移
if (typeof window !== 'undefined') {
  migrateFromSecureStorage();
}
