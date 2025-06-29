/**
 * 会话管理Store - 职责分离版本
 * 
 * 职责：
 * - 管理机构角色选择状态
 * - 处理会话相关的业务逻辑
 * - 管理登录流程的状态
 * - 协调认证Store和用户Store
 * 
 * @author SVT Team
 * @since 2025-06-29
 * @version 1.0.0
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserDetailCache } from '@/types/org-role';
import { DebugManager } from '@/utils/debugManager';

// 机构角色数据接口
interface OrgRoleData {
  orgId: string;
  orgNameZh: string;
  orgNameEn: string;
  roleId: string;
  roleNameZh: string;
  roleNameEn: string;
  selectedAt: string; // 选择时间
}

// 会话状态接口
interface SessionState {
  // 会话状态
  hasSelectedOrgRole: boolean;
  orgRoleData: OrgRoleData | null;
  loginStep: 'initial' | 'authenticated' | 'org-role-selection' | 'completed';
  
  // 会话操作
  setOrgRoleSelection: (orgRoleData: OrgRoleData) => void;
  completeOrgRoleSelection: (userDetails: UserDetailCache) => void;
  clearSession: () => void;
  setLoginStep: (step: SessionState['loginStep']) => void;
  resetLoginFlow: () => void;
}

// 创建会话状态管理
export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      // 初始状态
      hasSelectedOrgRole: false,
      orgRoleData: null,
      loginStep: 'initial',

      // 设置机构角色选择
      setOrgRoleSelection: (orgRoleData: OrgRoleData) => {
        set({ 
          orgRoleData,
          hasSelectedOrgRole: true,
          loginStep: 'org-role-selection'
        });
        
        DebugManager.logSensitive('机构角色已选择', orgRoleData, { 
          component: 'sessionStore', 
          action: 'setOrgRoleSelection' 
        });
      },

      // 完成机构角色选择 - 与用户Store协作
      completeOrgRoleSelection: (userDetails: UserDetailCache) => {
        // 创建机构角色数据
        const orgRoleData: OrgRoleData = {
          orgId: userDetails.orgId,
          orgNameZh: userDetails.orgNameZh,
          orgNameEn: userDetails.orgNameEn,
          roleId: userDetails.roleId,
          roleNameZh: userDetails.roleNameZh,
          roleNameEn: userDetails.roleNameEn,
          selectedAt: new Date().toISOString()
        };

        set({ 
          hasSelectedOrgRole: true,
          orgRoleData,
          loginStep: 'completed'
        });

        DebugManager.logSensitive('机构角色选择已完成', {
          orgId: orgRoleData.orgId,
          orgName: orgRoleData.orgNameZh,
          roleId: orgRoleData.roleId,
          roleName: orgRoleData.roleNameZh
        }, { component: 'sessionStore', action: 'completeOrgRoleSelection' });
      },

      // 清除会话状态
      clearSession: () => {
        set({ 
          hasSelectedOrgRole: false,
          orgRoleData: null,
          loginStep: 'initial'
        });
        
        DebugManager.log('会话状态已清除', undefined, { 
          component: 'sessionStore', 
          action: 'clearSession' 
        });
      },

      // 设置登录步骤
      setLoginStep: (step: SessionState['loginStep']) => {
        set({ loginStep: step });
        
        DebugManager.log('登录步骤已更新', { step }, { 
          component: 'sessionStore', 
          action: 'setLoginStep' 
        });
      },

      // 重置登录流程
      resetLoginFlow: () => {
        set({ 
          hasSelectedOrgRole: false,
          orgRoleData: null,
          loginStep: 'initial'
        });
        
        DebugManager.log('登录流程已重置', undefined, { 
          component: 'sessionStore', 
          action: 'resetLoginFlow' 
        });
      },
    }),
    {
      name: 'session-storage', // 独立的storage key
      // 持久化会话相关状态
      partialize: (state: SessionState) => ({
        hasSelectedOrgRole: state.hasSelectedOrgRole,
        orgRoleData: state.orgRoleData,
        loginStep: state.loginStep,
      }),
      // 从localStorage恢复状态时的处理
      onRehydrateStorage: () => (state: SessionState | undefined) => {
        if (state) {
          DebugManager.log('会话状态已恢复', { 
            hasSelectedOrgRole: state.hasSelectedOrgRole,
            loginStep: state.loginStep,
            hasOrgRoleData: !!state.orgRoleData
          }, { component: 'sessionStore', action: 'onRehydrateStorage' });
          
          // 检查会话状态的一致性
          if (state.hasSelectedOrgRole && !state.orgRoleData) {
            DebugManager.warn('会话状态不一致，重置会话', undefined, { 
              component: 'sessionStore', 
              action: 'onRehydrateStorage' 
            });
            
            state.hasSelectedOrgRole = false;
            state.loginStep = 'initial';
          }
        }
      },
    }
  )
);
