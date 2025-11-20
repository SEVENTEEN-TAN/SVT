/**
 * 权限工具函数
 * 提供权限过滤和检查的工具方法
 * 
 * @author SVT Team
 * @since 2025-01-20
 */

import { useUserStore } from '@/stores/userStore';
import type { PermissionEnum } from '@/constants/permissions';

/**
 * 行操作按钮接口
 */
interface RowActionButton {
  text: string;
  onClick: (record: any) => void | Promise<void>;
  visible?: boolean | ((record: any) => boolean);
  style?: React.CSSProperties;
  permission?: PermissionEnum;
}

/**
 * 工具栏按钮接口
 */
interface ToolbarButton {
  text: string;
  type?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
  icon?: React.ReactNode;
  onClick: (selectedRowKeys: React.Key[], selectedRows: any[]) => void | Promise<void>;
  needSelection?: boolean;
  visible?: boolean;
  permission?: PermissionEnum;
}

/**
 * Hook: 获取过滤后的行操作按钮配置
 * 
 * @description
 * 根据用户权限自动过滤行操作按钮
 * - 如果按钮没有配置 permission 字段,则默认显示
 * - 如果按钮配置了 permission 字段,则检查用户是否拥有该权限
 * - 只返回用户有权限的按钮
 * 
 * @param buttons 原始行操作按钮配置
 * @returns 过滤后的行操作按钮配置
 * 
 * @example
 * ```tsx
 * const buttons = [
 *   { text: '查看', permission: PermissionEnum.ROLE_QUERY, onClick: () => {} },
 *   { text: '编辑', permission: PermissionEnum.ROLE_EDIT, onClick: () => {} },
 * ];
 * 
 * const filteredButtons = useFilteredRowActions(buttons);
 * // 只返回用户有权限的按钮
 * ```
 */
export function useFilteredRowActions(
  buttons: RowActionButton[] | undefined
): RowActionButton[] {
  const user = useUserStore(state => state.user);
  const permissionList = user?.permissions || [];

  // 处理空数组或 undefined
  if (!buttons || buttons.length === 0) {
    return [];
  }

  // 过滤按钮
  return buttons.filter(button => {
    // 如果按钮没有配置权限,则默认显示
    if (!button.permission) {
      return true;
    }

    // 检查用户是否拥有该权限
    return permissionList.includes(button.permission);
  });
}

/**
 * Hook: 获取过滤后的工具栏按钮配置
 * 
 * @description
 * 根据用户权限自动过滤工具栏按钮
 * - 如果按钮没有配置 permission 字段,则默认显示
 * - 如果按钮配置了 permission 字段,则检查用户是否拥有该权限
 * - 只返回用户有权限的按钮
 * 
 * @param buttons 原始工具栏按钮配置
 * @returns 过滤后的工具栏按钮配置
 * 
 * @example
 * ```tsx
 * const buttons = [
 *   { text: '新增', permission: PermissionEnum.ROLE_ADD, onClick: () => {} },
 *   { text: '批量删除', permission: PermissionEnum.ROLE_DELETE, onClick: () => {} },
 * ];
 * 
 * const filteredButtons = useFilteredToolbarButtons(buttons);
 * // 只返回用户有权限的按钮
 * ```
 */
export function useFilteredToolbarButtons(
  buttons: ToolbarButton[] | undefined
): ToolbarButton[] {
  const user = useUserStore(state => state.user);
  const permissionList = user?.permissions || [];

  // 处理空数组或 undefined
  if (!buttons || buttons.length === 0) {
    return [];
  }

  // 过滤按钮
  return buttons.filter(button => {
    // 如果按钮没有配置权限,则默认显示
    if (!button.permission) {
      return true;
    }

    // 检查用户是否拥有该权限
    return permissionList.includes(button.permission);
  });
}

/**
 * 检查用户是否拥有指定权限
 * 
 * @param permission 权限枚举值
 * @returns 是否拥有权限
 * 
 * @example
 * ```tsx
 * const hasViewPermission = checkPermission(PermissionEnum.ROLE_VIEW);
 * if (hasViewPermission) {
 *   // 执行操作
 * }
 * ```
 */
export function checkPermission(permission: PermissionEnum): boolean {
  const user = useUserStore.getState().user;
  const permissionList = user?.permissions || [];
  return permissionList.includes(permission);
}

/**
 * 检查用户是否拥有任意一个权限
 * 
 * @param permissions 权限枚举值数组
 * @returns 是否拥有任意一个权限
 * 
 * @example
 * ```tsx
 * const hasAnyPermission = checkAnyPermission([
 *   PermissionEnum.ROLE_VIEW,
 *   PermissionEnum.ROLE_UPDATE
 * ]);
 * ```
 */
export function checkAnyPermission(permissions: PermissionEnum[]): boolean {
  const user = useUserStore.getState().user;
  const permissionList = user?.permissions || [];
  return permissions.some(p => permissionList.includes(p));
}

/**
 * 检查用户是否拥有所有权限
 * 
 * @param permissions 权限枚举值数组
 * @returns 是否拥有所有权限
 * 
 * @example
 * ```tsx
 * const hasAllPermissions = checkAllPermissions([
 *   PermissionEnum.ROLE_VIEW,
 *   PermissionEnum.ROLE_UPDATE
 * ]);
 * ```
 */
export function checkAllPermissions(permissions: PermissionEnum[]): boolean {
  const user = useUserStore.getState().user;
  const permissionList = user?.permissions || [];
  return permissions.every(p => permissionList.includes(p));
}
