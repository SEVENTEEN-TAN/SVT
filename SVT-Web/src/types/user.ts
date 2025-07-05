// 用户相关类型定义

export interface User {
  id: string | number; // 🔧 支持字符串和数字类型的ID
  username: string;
  email?: string;
  avatar?: string;
  roles: string[];
  permissions?: string[];
  serverVersion?: string;
  createTime?: string;
  updateTime?: string;
  
  // 🔧 扩展字段：整合userDetails信息，避免重复存储
  userNameEn?: string;        // 英文用户名
  orgId?: string;             // 机构ID
  orgNameZh?: string;         // 机构中文名
  orgNameEn?: string;         // 机构英文名
  roleId?: string;            // 角色ID
  roleNameZh?: string;        // 角色中文名
  roleNameEn?: string;        // 角色英文名
  loginIp?: string;           // 登录IP
  menuTrees?: Array<{         // 菜单树结构
    menuId: string;
    parentId: string | null;
    menuNameZh: string;
    menuNameEn: string;
    menuPath: string;
    menuIcon: string;
    menuSort: string;
    children?: Array<unknown>;
  }>;
}

export interface LoginRequest {
  loginId: string;
  password: string;
  captcha?: string;
}

export interface LoginResponse {
  accessToken: string;
  accessTokenExpireIn: number;
} 