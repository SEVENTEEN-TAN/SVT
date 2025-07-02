import { message } from 'antd';
import { useAuthStore } from '@/stores/authStore';

/**
 * Token管理工具类 - 简化版本
 * 只负责Token的存储管理，不做过期检查
 * 
 * 设计原则：
 * - 前端不解析JWT，不检查过期时间
 * - 过期检查完全依赖后端API响应（401或响应头）
 * - 保持职责单一：只管理Token的存储和获取
 */
class TokenManager {
  // 移除定时器相关代码，不再做前端过期检查
  
  /**
   * 启动Token管理（已简化，不再检查过期）
   */
  start() {
    console.log('🔄 [TokenManager] Token管理器已启动（简化版本，不检查过期）');
    // 不再启动定时检查，过期检查完全依赖后端
  }

  /**
   * 停止Token管理
   */
  stop() {
    console.log('🔄 [TokenManager] Token管理器已停止');
    // 由于没有定时器，这里只是占位
  }

  /**
   * 获取当前Token
   */
  getCurrentToken(): string | null {
    const authStore = useAuthStore.getState();
    return authStore.token;
  }

  /**
   * 检查是否有Token（不验证有效性）
   */
  hasToken(): boolean {
    const token = this.getCurrentToken();
    return !!token;
  }

  /**
   * 清除Token
   */
  clearToken(): void {
    const authStore = useAuthStore.getState();
    authStore.clearAuthState();
  }

  // 以下方法保留用于向后兼容，但不再使用JWT解析
  
  /**
   * @deprecated 前端不应该解析JWT，使用后端API响应判断
   */
  getTokenRemainingTime(token?: string): number {
    console.warn('⚠️ [TokenManager] getTokenRemainingTime已废弃，请使用后端API响应判断Token状态');
    return 0;
  }

  /**
   * @deprecated 前端不应该解析JWT，使用后端API响应判断
   */
  isTokenExpiringSoon(token?: string, thresholdMinutes: number = 5): boolean {
    console.warn('⚠️ [TokenManager] isTokenExpiringSoon已废弃，请使用后端API响应判断Token状态');
    return false;
  }

  /**
   * @deprecated 前端不应该解析JWT，使用后端API响应判断
   */
  isTokenExpired(token?: string): boolean {
    console.warn('⚠️ [TokenManager] isTokenExpired已废弃，请使用后端API响应判断Token状态');
    return false;
  }
}

// 创建单例实例
export const tokenManager = new TokenManager();

// 导出类型供其他地方使用
export type { TokenManager }; 