/**
 * 用户信息Store - 职责分离版本
 * 
 * 职责：
 * - 管理用户详细信息
 * - 处理用户信息的获取和更新
 * - 管理用户相关的加载状态
 * - 与认证Store协作，但保持独立
 * 
 * @author SVT Team
 * @since 2025-06-29
 * @version 1.0.0
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as authApi from '@/api/auth';
import type { User } from '@/types/user';
import type { UserDetailCache } from '@/types/org-role';
import { DebugManager } from '@/utils/debugManager';
import { useAuthStore } from './authStore';

// 用户信息状态接口
interface UserState {
  // 用户信息状态
  user: User | null;
  loading: boolean;
  error: string | null;
  
  // 用户信息操作
  setUser: (user: User) => void;
  updateUser: (userData: Partial<User>) => void;
  clearUser: () => void;
  refreshUserInfo: () => Promise<void>;
  setUserFromDetails: (userDetails: UserDetailCache) => void;
}

// 创建用户信息状态管理
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // 初始状态
      user: null,
      loading: false,
      error: null,

      // 设置用户信息
      setUser: (user: User) => {
        set({ user, error: null });
        
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
        
        // 🔧 移除手动localStorage清理，只使用Zustand persist清理
        
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

        set({ user, error: null });
        
        // 🔧 移除重复的localStorage设置，只使用Zustand persist
        
        DebugManager.logSensitive('用户信息已从详情设置', user, { 
          component: 'userStore', 
          action: 'setUserFromDetails' 
        });
      },
    }),
    {
      name: 'user-storage', // 独立的storage key
      // 只持久化用户信息
      partialize: (state: UserState) => ({
        user: state.user,
      }),
      // 从localStorage恢复状态时的处理
      onRehydrateStorage: () => (state: UserState | undefined) => {
        if (state?.user) {
          DebugManager.log('用户信息已恢复', { 
            userId: state.user.id,
            username: state.user.username 
          }, { component: 'userStore', action: 'onRehydrateStorage' });
        }
      },
    }
  )
);
