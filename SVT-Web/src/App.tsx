import React, { useEffect } from 'react';
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
import { tokenManager } from '@/utils/tokenManager';
import { migrateFromSecureStorage } from '@/utils/encryptedStorage';
// 清理存储工具
import '@/utils/clearStorage';

// 设置 dayjs 中文语言
dayjs.locale('zh-cn');

// 内部应用组件 - 使用 useApp 钩子
const InnerApp: React.FC = () => {
  const { message, modal } = AntdApp.useApp();

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
        
        // 获取认证状态（Zustand persist会自动从localStorage恢复）
        const authStore = useAuthStore.getState();
        
        // 如果有有效的token，启动Token管理器
        if (authStore.token && authStore.isAuthenticated) {
          tokenManager.start();
          
          DebugManager.log('✅ [App] 认证状态已恢复', { 
            hasToken: true 
          }, { 
            component: 'App', 
            action: 'authRestored' 
          });
        } else {
          DebugManager.log('ℹ️ [App] 用户未登录', {}, { 
            component: 'App', 
            action: 'noAuth' 
          });
        }
        
      } catch (error) {
        DebugManager.error('❌ [App] 认证初始化异常', error as Error, { 
          component: 'App', 
          action: 'authInitError' 
        });
      }
    };

    initializeAuth();
  }, [message, modal]);

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
