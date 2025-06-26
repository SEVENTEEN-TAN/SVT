import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Spin } from 'antd';

// 路由守卫组件
import ProtectedRoute from './ProtectedRoute';

// 布局组件
const BasicLayout = React.lazy(() => import('@/components/Layout/BasicLayout'));

// 页面组件
const LoginPage = React.lazy(() => import('@/pages/Auth/LoginPage'));
const HomePage = React.lazy(() => import('@/pages/Home/HomePage'));
const DynamicPage = React.lazy(() => import('@/components/DynamicPage'));

// 简单的加载组件
const fallbackElement = (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
    <Spin size="large" />
    <div style={{ marginTop: 16, color: '#666' }}>页面加载中...</div>
  </div>
);

// 路由配置
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/home" replace />,
  },
  {
    path: '/login',
    element: (
      <Suspense fallback={fallbackElement}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Suspense fallback={fallbackElement}>
          <BasicLayout />
        </Suspense>
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'home',
        element: (
          <Suspense fallback={fallbackElement}>
            <HomePage />
          </Suspense>
        ),
      },
      // 这里后续可以添加更多受保护的路由
      {
        path: 'users',
        element: <div>用户管理页面 - 待开发</div>,
      },
      {
        path: 'settings',
        element: <div>系统设置页面 - 待开发</div>,
      },
      {
        path: '*',
        element: (
          <Suspense fallback={fallbackElement}>
            <DynamicPage />
          </Suspense>
        ),
      },
    ],
  },
]);

export default router; 