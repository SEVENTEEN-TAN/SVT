import React from 'react';
import ReactDOM from 'react-dom/client';
import { App as AntdApp, ConfigProvider } from 'antd';
import App from './App';
import './index.css';

// 抑制Antd相关警告
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

// 拦截console.warn
console.warn = (...args) => {
  const message = String(args[0] || '');
  
  // 检查是否是需要抑制的警告
  const suppressWarnings = [
    'antd v5 support React is 16 ~ 18',
    'antd: compatible',
    '[antd: Spin]',
    'tip` only work in nest or fullscreen pattern',
    '[antd: Dropdown]',
    'dropdownRender` is deprecated'
  ];

  const shouldSuppress = suppressWarnings.some(pattern => 
    message.includes(pattern)
  );

  if (shouldSuppress) {
    // 在开发环境下可以取消注释这行来确认拦截效果
    console.debug('已拦截Antd警告:', message);
    return; // 忽略这些警告
  }
  
  originalConsoleWarn.apply(console, args);
};

// 同时拦截console.error中的相关警告
console.error = (...args) => {
  const message = String(args[0] || '');
  
  if (message.includes('antd: compatible') || message.includes('antd v5 support React is 16 ~ 18')) {
    return; // 忽略这些错误级别的警告
  }
  
  originalConsoleError.apply(console, args);
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  // React.StrictMode 在开发环境会故意双重调用useEffect等钩子来检测副作用
  // 这会导致API被调用两次，在测试JWT续期功能时可能会干扰测试
  // 生产环境中不存在这个问题，可以根据需要决定是否启用
  // <React.StrictMode>
    <ConfigProvider
      theme={{
        // 配置主题
      }}
      warning={{
        strict: false, // 禁用严格模式警告
      }}
    >
      <AntdApp>
        <App />
      </AntdApp>
    </ConfigProvider>
  // </React.StrictMode>,
);
