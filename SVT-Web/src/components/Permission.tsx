import React from 'react';
import { useHasPermission } from '@/hooks/usePermission';

interface PermissionProps {
  perm: string | string[];
  hide?: boolean; // true: 无权限时隐藏; false: 显示 fallback 或 null
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Permission 组件
 * 根据权限点决定是否渲染 children。
 * 默认无权限直接隐藏; 如需禁用或自定义占位，可使用 fallback。
 */
const Permission: React.FC<PermissionProps> = ({ perm, hide = true, fallback = null, children }) => {
  const allowed = useHasPermission(perm);
  if (allowed) return <>{children}</>;
  return hide ? null : <>{fallback}</>;
};

export default Permission; 