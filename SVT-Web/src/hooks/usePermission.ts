import { useUserStore } from '@/stores/userStore';
import { useMemo } from 'react';

/**
 * useHasPermission - 判断当前用户是否拥有指定权限 key
 * @param keys 单个权限字符串或权限字符串数组
 * @returns boolean - 是否全部拥有
 */
export function useHasPermission(keys: string | string[]): boolean {
  const user = useUserStore(state => state.user);
  const permissionList = user?.permissions || [];

  return useMemo(() => {
    const list = Array.isArray(keys) ? keys : [keys];
    return list.every(k => permissionList.includes(k));
  }, [keys, permissionList]);
} 