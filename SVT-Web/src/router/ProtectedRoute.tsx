import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/stores/useAuth';
import { useUserStatus } from '@/hooks/useUserStatus';
import PageLoading from '@/components/Loading/PageLoading';
import { DebugManager } from '@/utils/debugManager';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, auth, hasSelectedOrgRole } = useAuth();
  const { userStatus, loading } = useUserStatus(); // 🔧 添加用户状态验证
  const location = useLocation();

  // 🔧 使用DebugManager记录调试信息（刷新后仍可见）
  DebugManager.log('🛡️ [ProtectedRoute] 状态检查', {
    path: location.pathname,
    isAuthenticated,
    hasToken: !!auth.token,
    tokenLength: auth.token?.length || 0,
    hasSelectedOrgRole,
    loading,
    userStatusValid: userStatus?.isValid,
    userStatusMessage: userStatus?.message
  }, { component: 'ProtectedRoute', action: 'statusCheck' });

  // 第一层：基础认证检查（快速响应）
  if (!isAuthenticated || !auth.token) {
    DebugManager.warn('🚫 [ProtectedRoute] 基础认证失败，跳转登录页', {
      isAuthenticated,
      hasToken: !!auth.token
    }, { component: 'ProtectedRoute', action: 'authFailed' });
    // 保存当前路径，登录后可以重定向回来
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 第二层：机构角色选择检查
  if (isAuthenticated && !hasSelectedOrgRole) {
    DebugManager.warn('🏢 [ProtectedRoute] 未选择机构角色，跳转登录页', {
      isAuthenticated,
      hasSelectedOrgRole
    }, { component: 'ProtectedRoute', action: 'orgRoleNotSelected' });
    // 保存当前路径，选择机构角色后可以重定向回来
    return <Navigate to="/login" state={{ from: location, needOrgRoleSelection: true }} replace />;
  }

  // 第三层：用户状态验证中（显示加载）
  if (loading) {
    DebugManager.log('⏳ [ProtectedRoute] 用户状态验证中...', {}, {
      component: 'ProtectedRoute',
      action: 'verifying'
    });
    return <PageLoading message="正在验证用户状态..." />;
  }

  // 第四层：用户状态无效（已由useUserStatus处理跳转）
  if (userStatus && !userStatus.isValid) {
    DebugManager.error('❌ [ProtectedRoute] 用户状态无效，跳转登录页', new Error(userStatus.message || '用户状态无效'), {
      component: 'ProtectedRoute',
      action: 'userStatusInvalid'
    });
    return <Navigate to="/login" replace />;
  }

  DebugManager.log('✅ [ProtectedRoute] 所有检查通过，渲染页面', {}, {
    component: 'ProtectedRoute',
    action: 'renderSuccess'
  });
  return <>{children}</>;
};

export default ProtectedRoute; 