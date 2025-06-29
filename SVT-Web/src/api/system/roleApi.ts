// {{CHENGQI:
// Action: Added; Timestamp: 2025-06-28 22:45:00 +08:00; Reason: 角色数据接口封装; Principle_Applied: API封装原则;
// }}
import { api } from '../../utils/request';

export interface ActiveRole {
  roleId: string;
  roleCode: string;
  roleNameZh: string;
  roleNameEn: string;
  status: string;
  remark?: string;
  roleSort?: string;
}

class RoleApiService {
  private prefix = '/system/role';

  async getActiveRoleList(): Promise<ActiveRole[]> {
    return api.post<ActiveRole[]>(`${this.prefix}/get-active-role-list`);
  }
}

export const roleApi = new RoleApiService();
export default roleApi; 