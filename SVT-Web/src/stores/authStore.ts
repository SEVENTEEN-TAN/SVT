import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { tokenManager } from '@/utils/tokenManager';
import * as authApi from '@/api/auth';
import type { User, LoginRequest } from '@/types/user';
import type { UserDetailCache } from '@/types/org-role';
import { 
  initializeStorageOnLogin, 
  clearStorageOnLogout, 
  clearStorageOnTokenExpired,
  cleanupLegacyStorage,
  STORAGE_KEYS 
} from '@/utils/localStorageManager';
import { message } from 'antd';

// 认证状态接口
interface AuthState {
  // 状态
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  expiryDate: string | null; // 新增：token过期日期
  hasSelectedOrgRole: boolean; // 新增：是否已选择机构角色
  
  // 操作
  login: (credentials: LoginRequest) => Promise<void>;
  logout: (options?: { message?: string }) => Promise<void>;
  clearAuthState: () => void; // 🔧 新增：直接清理状态，不调用API
  refreshUserInfo: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  completeOrgRoleSelection: (userDetails: UserDetailCache) => void;
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
      hasSelectedOrgRole: false, // 初始化

      // 登录操作
      login: async (credentials: LoginRequest) => {
        set({ loading: true });
        
        try {
          // 登录时初始化localStorage
          initializeStorageOnLogin();
          
          // 调用登录API
          const response = await authApi.login(credentials);
          
          // 修正：根据后端实际返回的数据结构处理
          const { accessToken } = response;
          
          const now = new Date();
          let calculatedExpiryDate: string | null = null;
          if (credentials.rememberMe) {
            // 如果记住我，设置30天有效期
            now.setDate(now.getDate() + 30);
            calculatedExpiryDate = now.toISOString();
          }

          // 🔧 token通过Zustand persist自动存储，无需单独存储到localStorage
          if (calculatedExpiryDate) {
            localStorage.setItem(STORAGE_KEYS.EXPIRY_DATE, calculatedExpiryDate);
          } else {
            localStorage.removeItem(STORAGE_KEYS.EXPIRY_DATE); // 如果不记住，确保清除旧的有效期
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

          // 🔧 移除自动调用refreshUserInfo，让登录页面控制机构角色选择流程
          // await get().refreshUserInfo(); // 删除这一行
          
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      // 退出登录
      logout: async (options?: { message?: string }) => {
        const state = get();
        
        // 🔧 防止重复调用logout
        if (state.loading || !state.isAuthenticated) {
          console.log('登出已在进行中或用户未认证，跳过重复执行');
          return;
        }

        const initialMessage = options?.message;

        // 只有在被动强制登出时（即有错误消息传入时）才显示提示
        if (initialMessage) {
          message.warning(initialMessage);
        }

        set({ loading: true });
        
        try {
          // 🔧 优化：只有在token有效时才调用后端logout
          if (state.token && state.isAuthenticated) {
            try {
              await authApi.logout();
            } catch (error: unknown) {
              // 如果是401错误，说明token已失效，不需要显示错误
              const axiosError = error as { response?: { status?: number } };
              if (axiosError.response?.status !== 401) {
                console.warn('调用后端logout接口失败:', error);
                if (!initialMessage) {
                  message.error('退出登录失败，请稍后重试');
                }
              }
            }
          }
        } finally {
          // 停止Token管理器
          tokenManager.stop();
          
          // 清理localStorage
          clearStorageOnLogout();
          
          // 重置状态
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
            expiryDate: null,
            hasSelectedOrgRole: false,
          });
        }
      },

      // 🔧 直接清理认证状态，不调用logout API（用于verify-user-status 401的情况）
      clearAuthState: () => {
        console.log('🔧 直接清理认证状态（不调用logout API）');
        
        // 停止Token管理器
        tokenManager.stop();
        
        // 清理localStorage
        clearStorageOnTokenExpired();
        
        // 重置状态
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
          expiryDate: null,
          hasSelectedOrgRole: false,
        });
      },

      // 刷新用户信息
      refreshUserInfo: async () => {
        const { token } = get();
        if (!token) return;
        
        try {
          console.log('🔄 开始获取用户信息...');
          
          // 1. 获取用户机构列表
          const orgResponse = await authApi.getUserOrgList();
          console.log('📋 用户机构列表:', orgResponse);
          
          // 2. 获取用户角色列表  
          const roleResponse = await authApi.getUserRoleList();
          console.log('🎭 用户角色列表:', roleResponse);
          
          // 3. 选择第一个机构和角色获取详情 (实际项目中可能需要用户选择)
          if (orgResponse.orgInfos.length > 0 && roleResponse.userRoleInfos.length > 0) {
            const selectedOrg = orgResponse.orgInfos[0];
            const selectedRole = roleResponse.userRoleInfos[0];
            
            console.log('🎯 选择机构和角色:', { 
              orgId: selectedOrg.orgId, 
              orgName: selectedOrg.orgNameZh,
              roleId: selectedRole.roleId,
              roleName: selectedRole.roleNameZh 
            });
            
            // 4. 获取用户详情
            const userDetails = await authApi.getUserDetails({
              orgId: selectedOrg.orgId,
              roleId: selectedRole.roleId
            });
            
            console.log('✅ 获取用户详情成功:', userDetails);
            
                         // 5. 转换格式并保存用户信息
             const user: User = {
               id: parseInt(userDetails.userId, 10),
               username: userDetails.userNameZh,
               email: '', // 后端没有提供，设为空
               roles: [selectedRole.roleCode],
               permissions: userDetails.permissionKeys,
               serverVersion: userDetails.serverVersion,
               createTime: userDetails.loginTime,
               updateTime: new Date().toISOString(),
             };
            
            set({ user });
            localStorage.setItem('user', JSON.stringify(user));
            
            console.log('💾 用户信息已保存到状态和localStorage:', user);
            
          } else {
            console.warn('⚠️ 未找到有效的机构或角色信息');
          }
          
        } catch (error) {
          console.error('❌ 刷新用户信息失败:', error);
          // 如果刷新失败，可能token已过期，执行logout
          await get().logout();
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

      // 完成机构角色选择
      completeOrgRoleSelection: (userDetails: UserDetailCache) => {
        // 🔧 将UserDetailCache完整信息整合到User中，避免重复存储
        const user: User = {
          id: userDetails.userId,
          username: userDetails.userNameZh,
          email: '', // 后端没有提供，设为空
          roles: [userDetails.roleId],
          permissions: userDetails.permissionKeys,
          serverVersion: userDetails.serverVersion,
          createTime: userDetails.loginTime,
          updateTime: new Date().toISOString(),
          
          // 🔧 整合userDetails的所有独有信息
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

        // 🔧 不再单独存储userDetails，所有信息都在user中了

        // 更新状态
        set({ 
          user: user,
          hasSelectedOrgRole: true
        });
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      // 只持久化token、user和选择状态，不持久化loading状态
      partialize: (state: AuthState) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        hasSelectedOrgRole: state.hasSelectedOrgRole,
      }),
      // 从localStorage恢复状态时的处理
      onRehydrateStorage: () => (state: AuthState | undefined) => {
        // 🔧 清理遗留的缓存数据
        cleanupLegacyStorage();
        
        if (state) {
          // 🔧 通过Zustand persist自动恢复状态，检查是否已完成机构角色选择
          if (state.token && state.isAuthenticated) {
                       if (state.hasSelectedOrgRole && state.user) {
             // 🔧 用户已完成机构角色选择，启动Token管理器
             tokenManager.start();
           } else {
                           // 🔧 用户还没选择机构角色就刷新页面，清除状态
             console.log('用户未完成机构角色选择，清除登录状态');
             localStorage.removeItem('expiryDate');
             cleanupLegacyStorage();
             
             state.token = null;
             state.user = null;
             state.isAuthenticated = false;
             state.hasSelectedOrgRole = false;
           }
         } else {
           // 清除本地状态
           state.token = null;
           state.user = null;
           state.isAuthenticated = false;
           state.hasSelectedOrgRole = false;
           localStorage.removeItem('expiryDate');
           cleanupLegacyStorage();
         }
        }
      },
    }
  )
); 