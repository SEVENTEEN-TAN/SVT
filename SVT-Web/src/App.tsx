import React, { useEffect, useState } from 'react';
import { App as AntdApp } from 'antd';
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { theme } from '@/styles/theme';
import { router } from '@/router';
import { messageManager } from '@/utils/messageManager';
import { modalManager } from '@/utils/modalManager';

// 🔐 导入认证相关工具
import { DebugManager } from '@/utils/debugManager';
import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/userStore';
import { tokenManager } from '@/utils/tokenManager';
import { migrateFromSecureStorage } from '@/utils/encryptedStorage';
// 清理存储工具
import '@/utils/clearStorage';

// 设置 dayjs 中文语言
dayjs.locale('zh-cn');

// 内部应用组件 - 使用 useApp 钩子
const InnerApp: React.FC = () => {
  const { message, modal } = AntdApp.useApp();
  const [isInitialized, setIsInitialized] = useState(false); // 🔧 添加初始化状态

  useEffect(() => {
    // 初始化全局消息管理器
    messageManager.setMessageApi(message);
    // 初始化全局Modal管理器
    modalManager.setModalApi(modal);

    // 🔐 认证状态初始化
    const initializeAuth = async () => {
      try {
        DebugManager.log('🔄 [App] 开始初始化认证状态', {}, { 
          component: 'App', 
          action: 'initializeAuth' 
        });

        // 执行一次性存储迁移
        await migrateFromSecureStorage();

        // 🔧 直接获取认证状态（已从localStorage恢复）
        const authStore = useAuthStore.getState();
        const userStore = useUserStore.getState();

        DebugManager.log('🔍 [App] 检查localStorage恢复的状态', {
          hasToken: !!authStore.token,
          isAuthenticated: authStore.isAuthenticated,
          hasUser: !!userStore.user,
          hasSelectedOrgRole: userStore.session.hasSelectedOrgRole,
          loginStep: userStore.session.loginStep,
          tokenLength: authStore.token?.length || 0
        }, { component: 'App', action: 'checkRestoredState' });

        // 如果有有效的token，启动Token管理器
        if (authStore.token && authStore.isAuthenticated) {
          tokenManager.start();

          DebugManager.log('✅ [App] 认证状态已恢复', {
            hasToken: true,
            hasUser: !!userStore.user,
            hasSelectedOrgRole: userStore.session.hasSelectedOrgRole
          }, {
            component: 'App',
            action: 'authRestored'
          });

          // 🔧 新增：如果有完整的认证状态，验证其有效性
          if (userStore.user && userStore.session.hasSelectedOrgRole) {
            DebugManager.log('🔍 [App] 检测到完整认证状态，将由useUserStatus进行验证', {}, {
              component: 'App',
              action: 'scheduleVerification'
            });
            // 注意：不在这里直接调用API，而是让useUserStatus在合适时机调用
          }
        } else {
          DebugManager.log('ℹ️ [App] 用户未登录', {
            hasToken: !!authStore.token,
            isAuthenticated: authStore.isAuthenticated,
            tokenLength: authStore.token?.length || 0
          }, {
            component: 'App',
            action: 'noAuth'
          });
        }
        
      } catch (error) {
        DebugManager.error('❌ [App] 认证初始化异常', error as Error, {
          component: 'App',
          action: 'authInitError'
        });
      } finally {
        // 🔧 无论成功还是失败，都标记为已初始化
        setIsInitialized(true);
        DebugManager.log('✅ [App] 认证状态初始化完成', {}, {
          component: 'App',
          action: 'initComplete'
        });
      }
    };

    initializeAuth();
  }, [message, modal]);

  // 🔧 等待初始化完成后再渲染路由
  if (!isInitialized) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '16px',
        color: '#666'
      }}>
        正在初始化应用...
      </div>
    );
  }

  return <RouterProvider router={router} />;
};

// 主应用组件 - 提供 AntdApp 上下文
const App: React.FC = () => {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={theme}
      componentSize="middle"
    >
      <AntdApp>
        <InnerApp />
      </AntdApp>
    </ConfigProvider>
  );
};

export default App;
