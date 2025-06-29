/**
 * 状态恢复验证工具
 * 用于验证状态管理重构后的状态恢复是否正常
 * 
 * @author SVT Team
 * @since 2025-06-29
 */

import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/userStore';
import { useSessionStore } from '@/stores/sessionStore';
import { DebugManager } from './debugManager';

export interface StateRecoveryStatus {
  auth: {
    isRecovered: boolean;
    hasToken: boolean;
    isAuthenticated: boolean;
  };
  user: {
    isRecovered: boolean;
    hasUser: boolean;
    hasMenuTrees: boolean;
  };
  session: {
    isRecovered: boolean;
    hasSelectedOrgRole: boolean;
    loginStep: string;
  };
  overall: {
    isFullyRecovered: boolean;
    canAccessDynamicRoutes: boolean;
  };
}

/**
 * 检查状态恢复状态
 */
export const checkStateRecovery = (): StateRecoveryStatus => {
  const authState = useAuthStore.getState();
  const userState = useUserStore.getState();
  const sessionState = useSessionStore.getState();

  const authRecovery = {
    isRecovered: true, // Zustand的persist会自动恢复
    hasToken: !!authState.token,
    isAuthenticated: authState.isAuthenticated
  };

  const userRecovery = {
    isRecovered: true, // Zustand的persist会自动恢复
    hasUser: !!userState.user,
    hasMenuTrees: !!(userState.user?.menuTrees && userState.user.menuTrees.length > 0)
  };

  const sessionRecovery = {
    isRecovered: true, // Zustand的persist会自动恢复
    hasSelectedOrgRole: sessionState.hasSelectedOrgRole,
    loginStep: sessionState.loginStep
  };

  const isFullyRecovered = authRecovery.isAuthenticated && 
                          userRecovery.hasUser && 
                          sessionRecovery.hasSelectedOrgRole;

  const canAccessDynamicRoutes = isFullyRecovered && userRecovery.hasMenuTrees;

  const status: StateRecoveryStatus = {
    auth: authRecovery,
    user: userRecovery,
    session: sessionRecovery,
    overall: {
      isFullyRecovered,
      canAccessDynamicRoutes
    }
  };

  DebugManager.log('状态恢复检查完成', status, { 
    component: 'stateRecoveryValidator', 
    action: 'checkStateRecovery' 
  });

  return status;
};

/**
 * 等待状态完全恢复
 */
export const waitForStateRecovery = (timeout: number = 5000): Promise<StateRecoveryStatus> => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkInterval = setInterval(() => {
      const status = checkStateRecovery();
      
      if (status.overall.isFullyRecovered) {
        clearInterval(checkInterval);
        DebugManager.log('状态恢复完成', status, { 
          component: 'stateRecoveryValidator', 
          action: 'waitForStateRecovery' 
        });
        resolve(status);
        return;
      }
      
      if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval);
        DebugManager.warn('状态恢复超时', status, { 
          component: 'stateRecoveryValidator', 
          action: 'waitForStateRecovery' 
        });
        resolve(status); // 即使超时也返回当前状态，不reject
        return;
      }
    }, 100); // 每100ms检查一次
  });
};

/**
 * 修复不一致的状态
 */
export const fixInconsistentState = async (): Promise<void> => {
  const status = checkStateRecovery();
  
  // 如果认证状态存在但用户数据缺失，尝试重新获取用户数据
  if (status.auth.isAuthenticated && !status.user.hasUser) {
    DebugManager.warn('检测到状态不一致：有认证但无用户数据，尝试修复', undefined, { 
      component: 'stateRecoveryValidator', 
      action: 'fixInconsistentState' 
    });
    
    try {
      const userStore = useUserStore.getState();
      await userStore.refreshUserInfo();
      
      DebugManager.log('状态修复成功', undefined, { 
        component: 'stateRecoveryValidator', 
        action: 'fixInconsistentState' 
      });
    } catch (error) {
      DebugManager.error('状态修复失败', error as Error, { 
        component: 'stateRecoveryValidator', 
        action: 'fixInconsistentState' 
      });
      
      // 修复失败，清理所有状态
      const authStore = useAuthStore.getState();
      const userStore = useUserStore.getState();
      const sessionStore = useSessionStore.getState();
      
      authStore.clearAuthState();
      userStore.clearUser();
      sessionStore.clearSession();
    }
  }
  
  // 如果用户数据存在但会话状态缺失，尝试修复会话状态
  if (status.user.hasUser && !status.session.hasSelectedOrgRole) {
    DebugManager.warn('检测到状态不一致：有用户数据但无会话状态，尝试修复', undefined, { 
      component: 'stateRecoveryValidator', 
      action: 'fixInconsistentState' 
    });
    
    const sessionStore = useSessionStore.getState();
    sessionStore.setLoginStep('completed');
    
    // 如果用户数据包含机构角色信息，恢复会话状态
    const userState = useUserStore.getState();
    if (userState.user?.orgId && userState.user?.roleId) {
      const orgRoleData = {
        orgId: userState.user.orgId,
        orgNameZh: userState.user.orgNameZh || '',
        orgNameEn: userState.user.orgNameEn || '',
        roleId: userState.user.roleId,
        roleNameZh: userState.user.roleNameZh || '',
        roleNameEn: userState.user.roleNameEn || '',
        selectedAt: new Date().toISOString()
      };
      
      sessionStore.setOrgRoleSelection(orgRoleData);
    }
  }
};

/**
 * 诊断状态问题
 */
export const diagnoseStateIssues = (): string[] => {
  const status = checkStateRecovery();
  const issues: string[] = [];
  
  if (!status.auth.isAuthenticated) {
    issues.push('用户未认证');
  }
  
  if (status.auth.isAuthenticated && !status.auth.hasToken) {
    issues.push('认证状态异常：已认证但无Token');
  }
  
  if (status.auth.isAuthenticated && !status.user.hasUser) {
    issues.push('用户数据缺失：已认证但无用户信息');
  }
  
  if (status.user.hasUser && !status.user.hasMenuTrees) {
    issues.push('菜单数据缺失：有用户信息但无菜单权限数据');
  }
  
  if (status.user.hasUser && !status.session.hasSelectedOrgRole) {
    issues.push('会话状态缺失：有用户信息但无机构角色选择状态');
  }
  
  if (!status.overall.canAccessDynamicRoutes) {
    issues.push('无法访问动态路由：缺少必要的权限数据');
  }
  
  DebugManager.log('状态诊断完成', { issues }, { 
    component: 'stateRecoveryValidator', 
    action: 'diagnoseStateIssues' 
  });
  
  return issues;
};

// 导出便捷函数
export default {
  checkStateRecovery,
  waitForStateRecovery,
  fixInconsistentState,
  diagnoseStateIssues
};
