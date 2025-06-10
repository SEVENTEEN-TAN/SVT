import React from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { theme } from '@/styles/theme';

// 设置 dayjs 中文语言
dayjs.locale('zh-cn');

const App: React.FC = () => {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={theme}
      componentSize="middle"
    >
      <div className="app">
        <h1>SVT 管理系统</h1>
        <p>主题配置已完成！</p>
      </div>
    </ConfigProvider>
  );
};

export default App;
