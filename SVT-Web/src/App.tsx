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

// 设置 dayjs 中文语言
dayjs.locale('zh-cn');

const App: React.FC = () => {
  const { message } = AntdApp.useApp();

  useEffect(() => {
    // 初始化全局消息管理器
    messageManager.setMessageApi(message);
  }, [message]);

  return (
    <ConfigProvider
      locale={zhCN}
      theme={theme}
      componentSize="middle"
    >
      <RouterProvider router={router} />
    </ConfigProvider>
  );
};

export default App;
