import { message } from 'antd';
import { useAuthStore } from '@/stores/authStore';

/**
 * Token管理工具类
 * 负责Token的生命周期管理、心跳保活、过期检查等
 */
class TokenManager {
  private tokenCheckTimer: NodeJS.Timeout | null = null;
  private readonly TOKEN_CHECK_INTERVAL = 30 * 1000; // 30秒检查间隔
  private readonly WARNING_THRESHOLD = 2 * 60 * 1000; // 2分钟预警阈值 (提前预警，不影响5分钟失效)

  /**
   * 启动Token管理
   */
  start() {
    this.startTokenCheck();
  }

  /**
   * 停止Token管理
   */
  stop() {
    if (this.tokenCheckTimer) {
      clearInterval(this.tokenCheckTimer);
      this.tokenCheckTimer = null;
    }
  }

  

  /**
   * 启动Token状态检查
   * 定期检查Token是否即将过期，提前预警
   */
  private startTokenCheck() {
    this.tokenCheckTimer = setInterval(() => {
      const authStore = useAuthStore.getState();
      
      if (!authStore.isAuthenticated || !authStore.token) {
        return;
      }

      try {
        const tokenInfo = this.parseToken(authStore.token);
        if (!tokenInfo) {
          return;
        }

        const now = Date.now();
        const expiryTime = tokenInfo.exp * 1000;
        const remainingTime = expiryTime - now;

        // Token已过期
        if (remainingTime <= 0) {
          console.warn('Token已过期');
          this.handleTokenExpired();
          return;
        }

                 // Token即将过期预警 (提前2分钟预警，不影响后端5分钟失效机制)
         if (remainingTime <= this.WARNING_THRESHOLD) {
           this.showExpiryWarning(Math.floor(remainingTime / 60000));
         }
      } catch (error) {
        console.error('Token检查失败:', error);
      }
    }, this.TOKEN_CHECK_INTERVAL);
  }

  /**
   * 解析JWT Token
   */
  private parseToken(token: string): { exp: number; userId: string; userName: string } | null {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (error) {
      console.error('Token解析失败:', error);
      return null;
    }
  }

  /**
   * 处理Token过期
   */
  private handleTokenExpired() {
    const authStore = useAuthStore.getState();
    
    // 停止所有定时器
    this.stop();
    
    // 执行登出
    authStore.logout();
    
    // 显示过期提示
    message.warning('您已超过5分钟未操作，系统已自动登出');
    
    // 跳转到登录页
    window.location.href = '/login';
  }

  /**
   * 显示Token即将过期警告
   */
  private showExpiryWarning(remainingMinutes: number) {
    // 避免重复显示警告
    if (this.hasShownWarning) {
      return;
    }
    
    this.hasShownWarning = true;
    
    message.warning({
      content: `您已超过3分钟未操作，系统将在 ${remainingMinutes} 分钟后自动登出，请及时保存工作内容`,
      duration: 15,
      key: 'token-expiry-warning',
    });

    // 5分钟后重置警告状态，允许再次显示
    setTimeout(() => {
      this.hasShownWarning = false;
    }, 5 * 60 * 1000);
  }

  private hasShownWarning = false;

  /**
   * 获取Token剩余时间（秒）
   */
  getTokenRemainingTime(token?: string): number {
    const authStore = useAuthStore.getState();
    const targetToken = token || authStore.token;
    
    if (!targetToken) {
      return 0;
    }

    try {
      const tokenInfo = this.parseToken(targetToken);
      if (!tokenInfo) {
        return 0;
      }

      const now = Date.now();
      const expiryTime = tokenInfo.exp * 1000;
      const remainingTime = Math.max(0, expiryTime - now);
      
      return Math.floor(remainingTime / 1000);
    } catch (error) {
      console.error('获取Token剩余时间失败:', error);
      return 0;
    }
  }

  /**
   * 检查Token是否即将过期
   */
  isTokenExpiringSoon(token?: string, thresholdMinutes: number = 5): boolean {
    const remainingSeconds = this.getTokenRemainingTime(token);
    return remainingSeconds > 0 && remainingSeconds <= thresholdMinutes * 60;
  }

  /**
   * 检查Token是否已过期
   */
  isTokenExpired(token?: string): boolean {
    return this.getTokenRemainingTime(token) <= 0;
  }
}

// 创建单例实例
export const tokenManager = new TokenManager();

// 导出类型供其他地方使用
export type { TokenManager }; 