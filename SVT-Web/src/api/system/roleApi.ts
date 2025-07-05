// {{CHENGQI:
// Action: Modified; Timestamp: 2025-07-02 XX:XX:XX +08:00; Reason: 完善角色管理API接口，替换Mock数据; Principle_Applied: API集成原则，类型安全;
// }}

import { request } from '@/utils/request';
import type { PageQuery, PageResult } from '@/types/api';

// 角色相关类型定义
export interface RoleData {
  roleId: string;
  roleCode: string;
  roleNameZh: string;
  roleNameEn: string;
  roleSort: number;
  status: '0' | '1'; // 0-启用 1-停用
  remark?: string;
  createTime: string;
  updateTime: string;
  userCount?: number; // 前端计算字段，关联用户数
}

// 角色条件查询DTO
export interface RoleConditionDTO {
  roleId?: string;
  roleCode?: string;
  roleNameZh?: string;
  roleNameEn?: string;
  status?: string;
}

// 新增/编辑角色DTO
export interface InsertOrUpdateRoleDetailDTO {
  roleId?: string;
  roleCode: string;
  roleNameZh: string;
  roleNameEn: string;
  roleSort: number;
  status: '0' | '1';
  remark?: string;
}

// 活跃角色类型（用于下拉选择）
export interface ActiveRole {
  roleId: string;
  roleCode: string;
  roleNameZh: string;
  roleNameEn: string;
  status?: string;
  remark?: string;
  roleSort?: number;
}

// 用户详情类型（用于角色关联用户列表）
export interface UserDetailDTO {
  userId: string;
  loginId: string;
  userNameZh: string;
  userNameEn?: string;
  status: '0' | '1';
  createTime: string;
  updateTime: string;
  remark?: string;
}

// 权限详情类型（用于权限配置）
export interface PermissionDetailDTO {
  permissionId: string;
  permissionKey: string;
  permissionNameZh: string;
  permissionNameEn?: string;
  permissionGroup: string;
  permissionSort: number;
  status: '0' | '1';
  remark?: string;
}

class RoleApiService {
  private prefix = '/system/role';

  /**
   * 获取角色列表（分页）
   * @param params 查询参数
   * @returns 角色列表
   */
  async getRoleList(params: PageQuery<RoleConditionDTO>): Promise<PageResult<RoleData>> {
    const response = await request.post(`${this.prefix}/get-role-list`, params);
    return response.data.data;
  }

  /**
   * 获取活跃角色列表（不分页）
   * @returns 活跃角色列表
   */
  async getActiveRoleList(): Promise<ActiveRole[]> {
    const response = await request.post(`${this.prefix}/get-active-role-list`);
    return response.data.data || [];
  }

  /**
   * 获取角色详情
   * @param roleId 角色ID
   * @returns 角色详情
   */
  async getRoleDetail(roleId: string): Promise<RoleData> {
    const response = await request.post(`${this.prefix}/get-role-detail`, { roleId });
    return response.data.data;
  }

  /**
   * 新增/编辑角色
   * @param data 角色数据
   * @returns 操作结果
   */
  async insertOrUpdateRole(data: InsertOrUpdateRoleDetailDTO): Promise<void> {
    await request.post(`${this.prefix}/insert-or-update-role`, data);
  }

  /**
   * 更新角色状态
   * @param roleId 角色ID
   * @param status 状态
   * @returns 操作结果
   */
  async updateRoleStatus(roleId: string, status: '0' | '1'): Promise<void> {
    await request.post(`${this.prefix}/update-role-status`, { roleId, status });
  }

  /**
   * 删除角色
   * @param roleId 角色ID
   * @returns 操作结果
   */
  async deleteRole(roleId: string): Promise<void> {
    await request.post(`${this.prefix}/delete-role`, { roleId });
  }

  /**
   * 批量更新角色状态
   * @param roleIds 角色ID列表
   * @param status 状态
   * @returns 操作结果
   */
  async batchUpdateStatus(roleIds: string[], status: '0' | '1'): Promise<void> {
    const params = new URLSearchParams();
    roleIds.forEach(id => params.append('roleIds', id));
    params.append('status', status);
    
    await request.post(`${this.prefix}/batch-update-status?${params.toString()}`);
  }

  /**
   * 批量删除角色
   * @param roleIds 角色ID列表
   * @returns 操作结果
   */
  async batchDelete(roleIds: string[]): Promise<void> {
    const params = new URLSearchParams();
    roleIds.forEach(id => params.append('roleIds', id));
    
    await request.post(`${this.prefix}/batch-delete?${params.toString()}`);
  }

  /**
   * 获取角色关联的用户列表
   * @param roleId 角色ID
   * @returns 用户ID列表
   */
  async getRoleUserList(roleId: string): Promise<string[]> {
    const response = await request.post(`${this.prefix}/get-role-user-list`, { roleId });
    return response.data.data || [];
  }

  /**
   * 获取角色关联的用户详细信息列表
   * @param roleId 角色ID
   * @returns 用户详细信息列表
   */
  async getRoleUserDetailList(roleId: string): Promise<UserDetailDTO[]> {
    const response = await request.post(`${this.prefix}/get-role-user-detail-list`, { roleId });
    return response.data.data || [];
  }

  /**
   * 获取角色关联的权限列表
   * @param roleId 角色ID
   * @returns 权限列表
   */
  async getRolePermissionList(roleId: string): Promise<PermissionDetailDTO[]> {
    const response = await request.post(`${this.prefix}/get-role-permission-list`, { roleId });
    return response.data.data || [];
  }

  /**
   * 分配角色权限
   * @param roleId 角色ID
   * @param permissionIds 权限ID列表
   * @returns 操作结果
   */
  async assignRolePermissions(roleId: string, permissionIds: string[]): Promise<void> {
    const params = new URLSearchParams();
    params.append('roleId', roleId);
    permissionIds.forEach(id => params.append('permissionIds', id));
    
    await request.post(`${this.prefix}/assign-role-permissions?${params.toString()}`);
  }

  /**
   * 获取所有权限列表
   * @returns 权限列表
   */
  async getAllPermissions(): Promise<PermissionDetailDTO[]> {
    const response = await request.post(`${this.prefix}/get-all-permissions`);
    return response.data.data || [];
  }

  /**
   * 分配角色用户
   * @param roleId 角色ID
   * @param userIds 用户ID列表
   * @returns 操作结果
   */
  async assignRoleUsers(roleId: string, userIds: string[]): Promise<void> {
    const params = new URLSearchParams();
    params.append('roleId', roleId);
    userIds.forEach(id => params.append('userIds', id));
    
    await request.post(`${this.prefix}/assign-role-users?${params.toString()}`);
  }
}

export const roleApi = new RoleApiService();
export default roleApi; 