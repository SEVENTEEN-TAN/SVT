/**
 * 机构和角色相关类型定义
 */

// 机构信息
export interface UserOrgInfo {
  /** 机构ID */
  orgId: string;
  /** 机构Key */
  orgKey: string;
  /** 机构中文名称 */
  orgNameZh: string;
  /** 机构英文名称 */
  orgNameEn: string;
  /** 上一级机构ID */
  parentId: string;
  /** 机构类型 */
  orgType: string;
  /** 备注 */
  remark: string;
}

// 角色信息
export interface UserRoleInfo {
  /** 角色ID */
  roleId: string;
  /** 角色编码 */
  roleCode: string;
  /** 角色中文名称 */
  roleNameZh: string;
  /** 角色英文名称 */
  roleNameEn: string;
  /** 显示顺序 */
  roleSort: string;
  /** 备注 */
  remark: string;
}

// 菜单树节点
export interface MenuTreeVO {
  /** 菜单ID */
  menuId: string;
  /** 父菜单ID */
  parentId: string;
  /** 菜单中文名称 */
  menuNameZh: string;
  /** 菜单英文名称 */
  menuNameEn: string;
  /** 菜单路径 */
  menuPath: string;
  /** 菜单图标 */
  menuIcon: string;
  /** 菜单排序 */
  menuSort: string;
}

// 用户详情缓存
export interface UserDetailCache {
  /** 用户ID */
  userId: string;
  /** 用户中文名 */
  userNameZh: string;
  /** 用户英文名 */
  userNameEn: string;
  /** 机构ID */
  orgId: string;
  /** 机构中文名称 */
  orgNameZh: string;
  /** 机构英文名称 */
  orgNameEn: string;
  /** 角色ID */
  roleId: string;
  /** 角色中文名称 */
  roleNameZh: string;
  /** 角色英文名称 */
  roleNameEn: string;
  /** 登录时间 */
  loginTime: string;
  /** 登录IP */
  loginIp: string;
  /** 服务器版本 */
  serverVersion?: string;
  /** 权限键列表 */
  permissionKeys: string[];
  /** 菜单树 */
  menuTrees: MenuTreeVO[];
}

// API响应类型
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  success: boolean;
  timestamp: number;
  traceId: string;
}

// API响应类型
export interface GetUserOrgResponse extends ApiResponse<UserOrgInfo[]>{}

export interface GetUserRoleResponse extends  ApiResponse<UserRoleInfo[]>{}

export interface GetUserDetailsRequest {
  orgId: string;
  roleId: string;
}

export interface GetUserDetailsResponse {
  data: UserDetailCache;
}

// 机构角色选择表单
export interface OrgRoleSelectForm {
  orgId: string;
  roleId: string;
} 