/**
 * 统一认证Hook - 组合多个Store
 * 
 * 职责：
 * - 组合认证、用户、会话Store
 * - 提供统一的认证流程
 * - 协调各Store之间的交互
 * - 提供便捷的认证相关操作
 * 
 * @author SVT Team
 * @since 2025-06-29
 * @version 2.0.0
 */

import { useAuthStore } from './authStore';
import { useUserStore } from './userStore';
import { useSessionStore } from './sessionStore';
import type { LoginRequest } from '@/types/user';
import type { UserDetailCache } from '@/types/org-role';
import { DebugManager } from '@/utils/debugManager';
import { useEffect } from 'react';
import { checkStateRecovery, fixInconsistentState } from '@/utils/stateRecoveryValidator';

/**
 * 统一认证Hook - 提供完整的认证功能
 */
export const useAuth = () => {
  // 使用分离的Store
  const auth = useAuthStore();
  const user = useUserStore();
  const session = useSessionStore();

  // 完整的登录流程
  const login = async (credentials: LoginRequest) => {
    try {
      session.setLoginStep('initial');
      
      // 1. 先进行认证
      await auth.login(credentials);
      session.setLoginStep('authenticated');
      
      // 2. 获取用户信息
      await user.refreshUserInfo();
      session.setLoginStep('completed');
      
      DebugManager.production('完整登录流程完成', { 
        component: 'useAuth', 
        action: 'login' 
      });
      
    } catch (error) {
      // 登录失败时清理所有状态
      auth.clearAuthState();
      user.clearUser();
      session.clearSession();
      
      DebugManager.error('完整登录流程失败', error as Error, { 
        component: 'useAuth', 
        action: 'login' 
      });
      
      throw error;
    }
  };

  // 完整的登出流程
  const logout = async (options?: { message?: string }) => {
    try {
      // 清理所有Store的状态
      await auth.logout(options);
      user.clearUser();
      session.clearSession();
      
      DebugManager.production('完整登出流程完成', { 
        component: 'useAuth', 
        action: 'logout' 
      });
      
    } catch (error) {
      DebugManager.error('完整登出流程失败', error as Error, { 
        component: 'useAuth', 
        action: 'logout' 
      });
      throw error;
    }
  };

  // 清理所有状态
  const clearAllState = () => {
    auth.clearAuthState();
    user.clearUser();
    session.clearSession();
    
    DebugManager.log('所有认证状态已清理', undefined, { 
      component: 'useAuth', 
      action: 'clearAllState' 
    });
  };

  // 完成机构角色选择
  const completeOrgRoleSelection = (userDetails: UserDetailCache) => {
    // 更新用户信息
    user.setUserFromDetails(userDetails);
    
    // 完成会话状态
    session.completeOrgRoleSelection(userDetails);
    
    DebugManager.logSensitive('机构角色选择完成', {
      userId: userDetails.userId,
      orgId: userDetails.orgId,
      roleId: userDetails.roleId
    }, { component: 'useAuth', action: 'completeOrgRoleSelection' });
  };

  // 检查认证状态
  const checkAuthStatus = () => {
    const isFullyAuthenticated = auth.isAuthenticated && 
                                user.user && 
                                session.hasSelectedOrgRole;
    
    return {
      isAuthenticated: auth.isAuthenticated,
      hasUser: !!user.user,
      hasSelectedOrgRole: session.hasSelectedOrgRole,
      isFullyAuthenticated,
      loginStep: session.loginStep
    };
  };

  // 刷新用户信息
  const refreshUserInfo = async () => {
    if (!auth.isAuthenticated) {
      throw new Error('用户未认证，无法刷新用户信息');
    }
    
    try {
      await user.refreshUserInfo();
      DebugManager.log('用户信息刷新成功', undefined, { 
        component: 'useAuth', 
        action: 'refreshUserInfo' 
      });
    } catch (error) {
      DebugManager.error('用户信息刷新失败', error as Error, { 
        component: 'useAuth', 
        action: 'refreshUserInfo' 
      });
      throw error;
    }
  };

  // 检查状态一致性并自动修复
  useEffect(() => {
    const status = checkStateRecovery();

    // 如果状态不一致，尝试自动修复
    if (auth.isAuthenticated && (!user.user || !session.hasSelectedOrgRole)) {
      DebugManager.warn('检测到状态不一致，尝试自动修复', status, {
        component: 'useAuth',
        action: 'autoFix'
      });

      fixInconsistentState().catch(error => {
        DebugManager.error('自动修复状态失败', error, {
          component: 'useAuth',
          action: 'autoFix'
        });
      });
    }
  }, [auth.isAuthenticated, user.user, session.hasSelectedOrgRole]);

  return {
    // 分离的Store访问
    auth,
    user,
    session,

    // 组合的状态
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.loading || user.loading,
    currentUser: user.user,
    hasSelectedOrgRole: session.hasSelectedOrgRole,
    loginStep: session.loginStep,

    // 组合的操作
    login,
    logout,
    clearAllState,
    completeOrgRoleSelection,
    checkAuthStatus,
    refreshUserInfo,

    // 便捷的状态检查
    status: checkAuthStatus(),
  };
};

// 默认导出
export default useAuth;
