import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { theme } from '@/styles/theme';
import { router } from '@/router';

// 设置 dayjs 中文语言
dayjs.locale('zh-cn');

const App: React.FC = () => {
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
