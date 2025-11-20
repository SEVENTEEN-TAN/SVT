/**
 * 权限枚举类
 * 集中管理系统所有权限码
 * 
 * @description
 * 权限码格式: 模块:操作
 * 通用操作: query(查询), add(新增), edit(修改), delete(删除), start(发起流程), approve(审批流程)
 * 
 * @author SVT Team
 * @since 2025-01-20
 */
export enum PermissionEnum {
  // ==================== 角色管理 ====================
  /** 查询角色 */
  ROLE_QUERY = 'system:role:query',
  /** 新增角色 */
  ROLE_ADD = 'system:role:add',
  /** 修改角色 */
  ROLE_EDIT = 'system:role:edit',
  /** 删除角色 */
  ROLE_DELETE = 'system:role:delete',

  // ==================== 用户管理 ====================
  /** 查询用户 */
  USER_QUERY = 'user:query',
  /** 新增用户 */
  USER_ADD = 'user:add',
  /** 修改用户 */
  USER_EDIT = 'user:edit',
  /** 删除用户 */
  USER_DELETE = 'user:delete',

  // ==================== 菜单管理 ====================
  /** 查询菜单 */
  MENU_QUERY = 'menu:query',
  /** 新增菜单 */
  MENU_ADD = 'menu:add',
  /** 修改菜单 */
  MENU_EDIT = 'menu:edit',
  /** 删除菜单 */
  MENU_DELETE = 'menu:delete',

  // ==================== 机构管理 ====================
  /** 查询机构 */
  ORG_QUERY = 'org:query',
  /** 新增机构 */
  ORG_ADD = 'org:add',
  /** 修改机构 */
  ORG_EDIT = 'org:edit',
  /** 删除机构 */
  ORG_DELETE = 'org:delete',

  // ==================== 流程管理 (示例) ====================
  /** 发起流程 */
  WORKFLOW_START = 'workflow:start',
  /** 审批流程 */
  WORKFLOW_APPROVE = 'workflow:approve',
}

/**
 * 权限分组 - 用于UI展示和管理
 */
export const PermissionGroups = {
  role: {
    label: '角色管理',
    permissions: [
      PermissionEnum.ROLE_QUERY,
      PermissionEnum.ROLE_ADD,
      PermissionEnum.ROLE_EDIT,
      PermissionEnum.ROLE_DELETE,
    ],
  },
  user: {
    label: '用户管理',
    permissions: [
      PermissionEnum.USER_QUERY,
      PermissionEnum.USER_ADD,
      PermissionEnum.USER_EDIT,
      PermissionEnum.USER_DELETE,
    ],
  },
  menu: {
    label: '菜单管理',
    permissions: [
      PermissionEnum.MENU_QUERY,
      PermissionEnum.MENU_ADD,
      PermissionEnum.MENU_EDIT,
      PermissionEnum.MENU_DELETE,
    ],
  },
  org: {
    label: '机构管理',
    permissions: [
      PermissionEnum.ORG_QUERY,
      PermissionEnum.ORG_ADD,
      PermissionEnum.ORG_EDIT,
      PermissionEnum.ORG_DELETE,
    ],
  },
  workflow: {
    label: '流程管理',
    permissions: [
      PermissionEnum.WORKFLOW_START,
      PermissionEnum.WORKFLOW_APPROVE,
    ],
  },
} as const;

/**
 * 权限分组类型
 */
export type PermissionGroupKey = keyof typeof PermissionGroups;

/**
 * 获取权限的显示名称
 * @param permission 权限枚举值
 * @returns 权限的中文显示名称
 */
export function getPermissionLabel(permission: PermissionEnum): string {
  const labels: Record<PermissionEnum, string> = {
    // 角色管理
    [PermissionEnum.ROLE_QUERY]: '查询角色',
    [PermissionEnum.ROLE_ADD]: '新增角色',
    [PermissionEnum.ROLE_EDIT]: '修改角色',
    [PermissionEnum.ROLE_DELETE]: '删除角色',

    // 用户管理
    [PermissionEnum.USER_QUERY]: '查询用户',
    [PermissionEnum.USER_ADD]: '新增用户',
    [PermissionEnum.USER_EDIT]: '修改用户',
    [PermissionEnum.USER_DELETE]: '删除用户',

    // 菜单管理
    [PermissionEnum.MENU_QUERY]: '查询菜单',
    [PermissionEnum.MENU_ADD]: '新增菜单',
    [PermissionEnum.MENU_EDIT]: '修改菜单',
    [PermissionEnum.MENU_DELETE]: '删除菜单',

    // 机构管理
    [PermissionEnum.ORG_QUERY]: '查询机构',
    [PermissionEnum.ORG_ADD]: '新增机构',
    [PermissionEnum.ORG_EDIT]: '修改机构',
    [PermissionEnum.ORG_DELETE]: '删除机构',

    // 流程管理
    [PermissionEnum.WORKFLOW_START]: '发起流程',
    [PermissionEnum.WORKFLOW_APPROVE]: '审批流程',
  };

  return labels[permission] || permission;
}
