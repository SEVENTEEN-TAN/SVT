// {{CHENGQI:
// Action: Added; Timestamp: 2025-07-02 XX:XX:XX +08:00; Reason: 创建用户管理API接口; Principle_Applied: API接口标准化设计;
// }}

import { request } from '@/utils/request';
import type { PageQuery, PageResult } from '@/types/api';

// 用户数据接口
export interface UserData {
  userId: string;
  loginId: string;
  userNameZh: string;
  userNameEn?: string;
  status: '0' | '1'; // 0: 启用, 1: 停用
  remark?: string;
  createBy: string;
  createByNameZh: string;
  createByNameEn?: string;
  createOrgId: string;
  createOrgNameZh: string;
  createOrgNameEn?: string;
  createTime: string;
  updateBy: string;
  updateByNameZh: string;
  updateByNameEn?: string;
  updateOrgId: string;
  updateOrgNameZh: string;
  updateOrgNameEn?: string;
  updateTime: string;
  roleNames?: string; // 角色名称（逗号分隔）
  orgNames?: string; // 机构名称（逗号分隔）
}

// 用户查询条件
export interface UserConditionDTO {
  userId?: string;
  loginId?: string;
  userNameZh?: string;
  userNameEn?: string;
  status?: string;
  createBy?: string;
  createOrgId?: string;
  createTimeStart?: string;
  createTimeEnd?: string;
  roleId?: string; // 查询拥有指定角色的用户
  orgId?: string;  // 查询属于指定机构的用户
}

// 用户新增/编辑DTO
export interface InsertOrUpdateUserDetailDTO {
  userId?: string; // 编辑时必填
  loginId: string;
  password?: string; // 新增时必填，编辑时选填
  userNameZh: string;
  userNameEn?: string;
  status: '0' | '1';
  remark?: string;
  roleIds?: string[];
  orgIds?: string[];
  primaryOrgId?: string;
}

class UserApi {
  /**
   * 获取用户列表
   */
  async getUserList(params: PageQuery<UserConditionDTO>): Promise<PageResult<UserData>> {
    return request.post('/system/user/get-user-list', params);
  }

  /**
   * 获取活跃用户列表
   */
  async getActiveUserList(): Promise<UserData[]> {
    const response = await request.post('/system/user/get-active-user-list');
    return response.data.data || [];
  }

  /**
   * 获取用户详情
   */
  async getUserDetail(userId: string): Promise<UserData> {
    return request.post('/system/user/get-user-detail', { userId });
  }

  /**
   * 新增/编辑用户
   */
  async insertOrUpdateUser(data: InsertOrUpdateUserDetailDTO): Promise<void> {
    return request.post('/system/user/insert-or-update-user', data);
  }

  /**
   * 更新用户状态
   */
  async updateUserStatus(userId: string, status: '0' | '1'): Promise<void> {
    return request.post('/system/user/update-user-status', { userId, status });
  }

  /**
   * 删除用户
   */
  async deleteUser(userId: string): Promise<void> {
    return request.post('/system/user/delete-user', { userId });
  }

  /**
   * 批量更新用户状态
   */
  async batchUpdateStatus(userIds: string[], status: '0' | '1'): Promise<void> {
    const params = new URLSearchParams();
    userIds.forEach(id => params.append('userIds', id));
    params.append('status', status);
    
    return request.post('/system/user/batch-update-status', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  }

  /**
   * 批量删除用户
   */
  async batchDelete(userIds: string[]): Promise<void> {
    const params = new URLSearchParams();
    userIds.forEach(id => params.append('userIds', id));
    
    return request.post('/system/user/batch-delete', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  }

  /**
   * 分配用户角色
   */
  async assignUserRoles(userId: string, roleIds: string[]): Promise<void> {
    const params = new URLSearchParams();
    params.append('userId', userId);
    roleIds.forEach(id => params.append('roleIds', id));
    
    return request.post('/system/user/assign-user-roles', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  }

  /**
   * 分配用户机构
   */
  async assignUserOrgs(userId: string, orgIds: string[], primaryOrgId?: string): Promise<void> {
    const params = new URLSearchParams();
    params.append('userId', userId);
    orgIds.forEach(id => params.append('orgIds', id));
    if (primaryOrgId) {
      params.append('primaryOrgId', primaryOrgId);
    }
    
    return request.post('/system/user/assign-user-orgs', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  }

  /**
   * 获取用户角色列表
   */
  async getUserRoles(userId: string): Promise<string[]> {
    return request.post('/system/user/get-user-roles', { userId });
  }

  /**
   * 获取用户机构列表
   */
  async getUserOrgs(userId: string): Promise<string[]> {
    return request.post('/system/user/get-user-orgs', { userId });
  }

  /**
   * 重置用户密码
   */
  async resetPassword(userId: string, newPassword: string): Promise<void> {
    const params = new URLSearchParams();
    params.append('userId', userId);
    params.append('newPassword', newPassword);
    
    return request.post('/system/user/reset-password', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  }

  /**
   * 验证登录ID唯一性
   */
  async validateLoginId(loginId: string, userId?: string): Promise<boolean> {
    const params = new URLSearchParams();
    params.append('loginId', loginId);
    if (userId) {
      params.append('userId', userId);
    }
    
    return request.get('/system/user/validate-login-id', { params });
  }
}

const userApi = new UserApi();
export default userApi;