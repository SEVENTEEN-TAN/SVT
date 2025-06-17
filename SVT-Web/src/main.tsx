import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { App } from 'antd';
import router from './router';
import './index.css';
import AESCryptoUtils from './utils/crypto';

// 开发环境下进行加密测试
if (import.meta.env.DEV) {
  AESCryptoUtils.testEncryption();
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App>
      <RouterProvider router={router} />
    </App>
  </React.StrictMode>,
);
