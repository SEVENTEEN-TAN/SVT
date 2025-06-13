import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Spin } from 'antd';

// 路由守卫组件
import ProtectedRoute from './ProtectedRoute';

// 布局组件
const BasicLayout = React.lazy(() => import('@/components/Layout/BasicLayout'));

// 页面组件
const LoginPage = React.lazy(() => import('@/pages/Auth/LoginPage'));
const DashboardPage = React.lazy(() => import('@/pages/Dashboard/DashboardPage'));
const NotFoundPage = React.lazy(() => import('@/pages/Error/NotFoundPage'));

// 简单的加载组件
const fallbackElement = <Spin size="large" tip="页面加载中..." style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }} />;

// 路由配置
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
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
        path: 'dashboard',
        element: (
          <Suspense fallback={fallbackElement}>
            <DashboardPage />
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
            <NotFoundPage />
          </Suspense>
        ),
      },
    ],
  },
]);

export default router; 