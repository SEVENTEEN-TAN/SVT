/**
 * 用户信息Store - 合并session功能版本
 * 
 * 职责：
 * - 管理用户详细信息
 * - 管理会话状态（机构角色选择、登录流程）
 * - 处理用户信息的获取和更新
 * - 统一用户相关的所有状态管理
 * 
 * @author SVT Team
 * @since 2025-07-02
 * @version 2.0.0 - 合并session功能
 */

import { create } from 'zustand';
// import { createEncryptedStorage } from '@/utils/encryptedStorage'; // 不再需要
import * as authApi from '@/api/auth';
import type { User } from '@/types/user';
import type { UserDetailCache } from '@/types/org-role';
import { DebugManager } from '@/utils/debugManager';

// 原生localStorage存储键
const USER_STORAGE_KEY = 'user-storage';

// 存储用户状态到localStorage
const saveUserState = (state: { user: User | null; session: SessionState }) => {
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(state));
    DebugManager.log('✅ [userStore] 用户状态已保存到localStorage', {
      hasUser: !!state.user,
      hasSelectedOrgRole: state.session.hasSelectedOrgRole,
      loginStep: state.session.loginStep
    }, { component: 'userStore', action: 'saveState' });
  } catch (error) {
    DebugManager.error('❌ [userStore] 保存用户状态失败', error as Error, {
      component: 'userStore',
      action: 'saveState'
    });
  }
};

// 从localStorage恢复用户状态
const loadUserState = () => {
  try {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (stored) {
      const state = JSON.parse(stored);
      DebugManager.log('✅ [userStore] 从localStorage恢复用户状态', {
        hasUser: !!state.user,
        hasSelectedOrgRole: state.session?.hasSelectedOrgRole,
        loginStep: state.session?.loginStep
      }, { component: 'userStore', action: 'loadState' });
      return state;
    }
  } catch (error) {
    DebugManager.error('❌ [userStore] 恢复用户状态失败', error as Error, {
      component: 'userStore',
      action: 'loadState'
    });
  }
  return null;
};

// 清除localStorage中的用户状态
const clearUserState = () => {
  try {
    localStorage.removeItem(USER_STORAGE_KEY);
    DebugManager.log('🧹 [userStore] 已清除localStorage中的用户状态', {}, {
      component: 'userStore',
      action: 'clearState'
    });
  } catch (error) {
    DebugManager.error('❌ [userStore] 清除用户状态失败', error as Error, {
      component: 'userStore',
      action: 'clearState'
    });
  }
};
import { useAuthStore } from './authStore';

// 机构角色数据接口
interface OrgRoleData {
  orgId: string;
  orgNameZh: string;
  orgNameEn: string;
  roleId: string;
  roleNameZh: string;
  roleNameEn: string;
  selectedAt: string;
}

// 会话状态接口
interface SessionState {
  hasSelectedOrgRole: boolean;
  orgRoleData: OrgRoleData | null;
  loginStep: 'initial' | 'authenticated' | 'org-role-selection' | 'completed';
}

// 用户信息状态接口（包含session）
interface UserState {
  // 用户信息状态
  user: User | null;
  loading: boolean;
  error: string | null;
  
  // 🔥 新增：会话状态（从sessionStore合并过来）
  session: SessionState;
  
  // 用户信息操作
  setUser: (user: User) => void;
  updateUser: (userData: Partial<User>) => void;
  clearUser: () => void;
  refreshUserInfo: () => Promise<void>;
  setUserFromDetails: (userDetails: UserDetailCache) => void;
  
  // 🔥 新增：会话管理操作（从sessionStore合并过来）
  setOrgRoleSelection: (orgRoleData: OrgRoleData) => void;
  completeOrgRoleSelection: (userDetails: UserDetailCache) => void;
  clearSession: () => void;
  setLoginStep: (step: SessionState['loginStep']) => void;
  resetLoginFlow: () => void;
}

// 创建用户信息状态管理
export const useUserStore = create<UserState>()((set, get) => {
  // 从localStorage恢复初始状态
  const savedState = loadUserState();

  return {
      // 初始状态 - 从localStorage恢复或使用默认值
      user: savedState?.user || null,
      loading: false,
      error: null,

      // 🔥 新增：会话状态初始值
      session: savedState?.session || {
        hasSelectedOrgRole: false,
        orgRoleData: null,
        loginStep: 'initial'
      },

      // 设置用户信息
      setUser: (user: User) => {
        const currentState = get();
        const newState = { user, session: currentState.session };

        set({ user, error: null });

        // 保存到localStorage
        saveUserState(newState);

        DebugManager.logSensitive('用户信息已设置', user, {
          component: 'userStore',
          action: 'setUser'
        });
      },

      // 更新用户信息
      updateUser: (userData: Partial<User>) => {
        const { user } = get();
        if (user) {
          const updatedUser = { ...user, ...userData };
          set({ user: updatedUser, error: null });
          
                  // 🔧 移除重复的localStorage设置，只使用Zustand persist
          
          DebugManager.logSensitive('用户信息已更新', { 
            updatedFields: Object.keys(userData),
            userId: user.id 
          }, { component: 'userStore', action: 'updateUser' });
        }
      },

      // 清除用户信息
      clearUser: () => {
        set({ user: null, error: null, loading: false });

        // 清除localStorage中的用户状态
        clearUserState();

        DebugManager.log('用户信息已清除', undefined, {
          component: 'userStore',
          action: 'clearUser'
        });
      },

      // 刷新用户信息 - 直接从authStore获取认证状态
      refreshUserInfo: async () => {
        // 直接从authStore获取认证状态
        const authState = useAuthStore.getState();

        if (!authState.isAuthenticated || !authState.token) {
          DebugManager.warn('无有效认证状态，跳过用户信息刷新', undefined, {
            component: 'userStore',
            action: 'refreshUserInfo'
          });
          return;
        }
        
        set({ loading: true, error: null });
        
        try {
          DebugManager.log('开始刷新用户信息', undefined, { 
            component: 'userStore', 
            action: 'refreshUserInfo' 
          });

          // 1. 获取用户机构列表
          const orgResponse = await authApi.getUserOrgList();
          DebugManager.logSensitive('用户机构列表获取成功', orgResponse, { 
            component: 'userStore', 
            action: 'getUserOrgList' 
          });

          // 2. 获取用户角色列表
          const roleResponse = await authApi.getUserRoleList();
          DebugManager.logSensitive('用户角色列表获取成功', roleResponse, { 
            component: 'userStore', 
            action: 'getUserRoleList' 
          });
          
          // 3. 选择第一个机构和角色获取详情
          if (orgResponse.length > 0 && roleResponse.length > 0) {
            const selectedOrg = orgResponse[0];
            const selectedRole = roleResponse[0];
            
            DebugManager.logSensitive('选择机构和角色', {
              orgId: selectedOrg.orgId,
              orgName: selectedOrg.orgNameZh,
              roleId: selectedRole.roleId,
              roleName: selectedRole.roleNameZh
            }, { component: 'userStore', action: 'selectOrgRole' });
            
            // 4. 获取用户详情
            const userDetails = await authApi.getUserDetails({
              orgId: selectedOrg.orgId,
              roleId: selectedRole.roleId
            });
            
            DebugManager.logSensitive('获取用户详情成功', userDetails, { 
              component: 'userStore', 
              action: 'getUserDetails' 
            });
            
            // 5. 转换并保存用户信息
            get().setUserFromDetails(userDetails);
            
          } else {
            DebugManager.warn('未找到有效的机构或角色信息', undefined, { 
              component: 'userStore', 
              action: 'refreshUserInfo' 
            });
            set({ error: '未找到有效的机构或角色信息' });
          }

        } catch (error) {
          const errorMessage = (error as Error).message || '刷新用户信息失败';
          set({ error: errorMessage });
          
          DebugManager.error('刷新用户信息失败', error as Error, { 
            component: 'userStore', 
            action: 'refreshUserInfo' 
          });
          
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      // 从UserDetailCache设置用户信息
      setUserFromDetails: (userDetails: UserDetailCache) => {
        const user: User = {
          id: userDetails.userId,
          username: userDetails.userNameZh,
          email: '', // 后端没有提供，设为空
          roles: [userDetails.roleId],
          permissions: userDetails.permissionKeys,
          serverVersion: userDetails.serverVersion,
          createTime: userDetails.loginTime,
          updateTime: new Date().toISOString(),
          
          // 整合userDetails的所有独有信息
          userNameEn: userDetails.userNameEn,
          orgId: userDetails.orgId,
          orgNameZh: userDetails.orgNameZh,
          orgNameEn: userDetails.orgNameEn,
          roleId: userDetails.roleId,
          roleNameZh: userDetails.roleNameZh,
          roleNameEn: userDetails.roleNameEn,
          loginIp: userDetails.loginIp,
          menuTrees: userDetails.menuTrees,
        };

        const currentState = get();
        const newState = { user, session: currentState.session };

        set({ user, error: null });

        // 保存到localStorage
        saveUserState(newState);

        DebugManager.logSensitive('用户信息已从详情设置', user, {
          component: 'userStore',
          action: 'setUserFromDetails'
        });
      },

      // 🔥 新增：会话管理方法（从sessionStore合并过来）
      
      // 设置机构角色选择
      setOrgRoleSelection: (orgRoleData: OrgRoleData) => {
        const currentState = get();
        const newSession = {
          ...currentState.session,
          orgRoleData,
          hasSelectedOrgRole: true,
          loginStep: 'org-role-selection' as const
        };

        set({ session: newSession });

        // 保存到localStorage
        saveUserState({ user: currentState.user, session: newSession });

        DebugManager.logSensitive('机构角色已选择', orgRoleData, {
          component: 'userStore',
          action: 'setOrgRoleSelection'
        });
      },

      // 完成机构角色选择
      completeOrgRoleSelection: (userDetails: UserDetailCache) => {
        const orgRoleData: OrgRoleData = {
          orgId: userDetails.orgId,
          orgNameZh: userDetails.orgNameZh,
          orgNameEn: userDetails.orgNameEn,
          roleId: userDetails.roleId,
          roleNameZh: userDetails.roleNameZh,
          roleNameEn: userDetails.roleNameEn,
          selectedAt: new Date().toISOString()
        };

        const currentState = get();
        const newSession = {
          hasSelectedOrgRole: true,
          orgRoleData,
          loginStep: 'completed' as const
        };

        set({ session: newSession });

        // 保存到localStorage
        saveUserState({ user: currentState.user, session: newSession });

        DebugManager.logSensitive('机构角色选择已完成', {
          orgId: orgRoleData.orgId,
          orgName: orgRoleData.orgNameZh,
          roleId: orgRoleData.roleId,
          roleName: orgRoleData.roleNameZh
        }, { component: 'userStore', action: 'completeOrgRoleSelection' });
      },

      // 清除会话状态
      clearSession: () => {
        const currentState = get();
        const newSession = {
          hasSelectedOrgRole: false,
          orgRoleData: null,
          loginStep: 'initial' as const
        };

        set({ session: newSession });

        // 保存到localStorage
        saveUserState({ user: currentState.user, session: newSession });

        DebugManager.log('会话状态已清除', undefined, {
          component: 'userStore',
          action: 'clearSession'
        });
      },

      // 设置登录步骤
      setLoginStep: (step: SessionState['loginStep']) => {
        const currentState = get();
        const newSession = {
          ...currentState.session,
          loginStep: step
        };

        set({ session: newSession });

        // 保存到localStorage
        saveUserState({ user: currentState.user, session: newSession });

        DebugManager.log('登录步骤已更新', { step }, {
          component: 'userStore',
          action: 'setLoginStep'
        });
      },

      // 重置登录流程
      resetLoginFlow: () => {
        const currentState = get();
        const newSession = {
          hasSelectedOrgRole: false,
          orgRoleData: null,
          loginStep: 'initial' as const
        };

        set({ session: newSession });

        // 保存到localStorage
        saveUserState({ user: currentState.user, session: newSession });

        DebugManager.log('登录流程已重置', undefined, {
          component: 'userStore',
          action: 'resetLoginFlow'
        });
      },
  };
});
