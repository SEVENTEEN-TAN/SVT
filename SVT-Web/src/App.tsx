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
