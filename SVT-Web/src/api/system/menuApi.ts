// {{CHENGQI:
// Action: Moved; Timestamp: 2025-06-28 16:58:44 +08:00; Reason: 移动API文件到正确目录结构 SVT-Web/src/api/system/; Principle_Applied: 目录结构规范;
// }}

import { api } from '@/utils/request';
import type { BackendMenuData } from '@/pages/System/Menu/utils/dataTransform';

// 获取菜单树请求参数（无参数）
export interface GetMenuTreeRequest {}

// 更新菜单状态请求参数
export interface UpdateMenuStatusRequest {
  menuIds: string[];  // 菜单ID数组，如 ["000000","000001"]
  status: string;     // "0" 启用, "1" 停用
}

// 更新菜单排序请求参数
export interface UpdateMenuSortRequest {
  menuId: string;
  sort: string;
}

// 编辑菜单请求参数
export interface EditMenuRequest {
  menuId?: string;      // 有则编辑，无则新增
  parentId?: string;
  menuNameZh?: string;
  menuNameEn?: string;
  menuPath?: string;
  menuIcon?: string;
  menuSort?: string;
  status?: string;
  remark?: string;
  roleIds?: string[];
}

// 获取菜单详情请求参数
export interface GetMenuDetailRequest {
  menuId: string;
}

// 角色关联信息
export interface MenuRoleInfo {
  roleId: string;
  roleNameZh: string;
  roleNameEn: string;
}

export interface MenuDetailResponse extends BackendMenuData {
  roleList?: MenuRoleInfo[];
}

/**
 * 菜单管理API服务类
 */
class MenuApiService {
  private prefix = '/system/menu';

  /**
   * 获取菜单树
   */
  async getAllMenuTree(): Promise<any> {
    return api.post<any>(`${this.prefix}/get-all-menu-tree`);
  }

  /**
   * 更新菜单状态
   * @param menuIds 菜单ID列表，逗号分隔
   * @param status 状态：'0' 启用, '1' 停用
   */
  async updateMenuStatus(menuIds: string[], status: '0' | '1'): Promise<any> {
    const request: UpdateMenuStatusRequest = {
      menuIds,
      status,
    };
    return api.post<any>(`${this.prefix}/update-menu-status`, request);
  }

  /**
   * 更新菜单排序
   * @param menuId 菜单ID
   * @param sort 排序值
   */
  async updateMenuSort(menuId: string, sort: number): Promise<any> {
    const request: UpdateMenuSortRequest = {
      menuId,
      sort: sort.toString(),
    };
    return api.post<any>(`${this.prefix}/update-menu-sort`, request);
  }

  /**
   * 编辑菜单（新增/更新）
   * @param menuData 菜单数据
   */
  async editMenu(menuData: EditMenuRequest): Promise<any> {
    return api.post<any>(`${this.prefix}/edit-menu`, menuData);
  }

  /**
   * 获取菜单详情
   * @param menuId 菜单ID
   */
  async getMenuDetail(menuId: string): Promise<MenuDetailResponse> {
    const request: GetMenuDetailRequest = { menuId };
    return api.post<MenuDetailResponse>(`${this.prefix}/get-menu-detail`, request);
  }

  /**
   * 删除菜单
   */
  async deleteMenu(menuId: string): Promise<any> {
    return api.post<any>(`${this.prefix}/delete-menu`, { menuId });
  }
}

// 导出单例实例
export const menuApi = new MenuApiService();

// 重新导出类型
export type { BackendMenuData } from '@/pages/System/Menu/utils/dataTransform';

// 导出默认实例
export default menuApi;
