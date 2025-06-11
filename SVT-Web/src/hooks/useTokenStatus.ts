import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { tokenManager } from '@/utils/tokenManager';

/**
 * Token状态监控Hook
 * 提供Token剩余时间、过期状态等信息
 */
export interface TokenStatus {
  /** Token剩余时间（秒） */
  remainingTime: number;
  /** Token是否已过期 */
  isExpired: boolean;
  /** Token是否即将过期（5分钟内） */
  isExpiringSoon: boolean;
  /** Token剩余时间的友好显示格式 */
  remainingTimeText: string;
}

/**
 * 使用Token状态监控
 * @param updateInterval 更新间隔（毫秒），默认30秒
 * @returns Token状态信息
 */
export const useTokenStatus = (updateInterval: number = 30000): TokenStatus => {
  const { token, isAuthenticated } = useAuthStore();
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>({
    remainingTime: 0,
    isExpired: false,
    isExpiringSoon: false,
    remainingTimeText: '未知',
  });

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setTokenStatus({
        remainingTime: 0,
        isExpired: true,
        isExpiringSoon: false,
        remainingTimeText: '未登录',
      });
      return;
    }

    const updateTokenStatus = () => {
      const remainingTime = tokenManager.getTokenRemainingTime(token);
      const isExpired = tokenManager.isTokenExpired(token);
      const isExpiringSoon = tokenManager.isTokenExpiringSoon(token, 5);
      const remainingTimeText = formatRemainingTime(remainingTime);

      setTokenStatus({
        remainingTime,
        isExpired,
        isExpiringSoon,
        remainingTimeText,
      });
    };

    // 立即更新一次
    updateTokenStatus();

    // 设置定时更新
    const timer = setInterval(updateTokenStatus, updateInterval);

    return () => {
      clearInterval(timer);
    };
  }, [token, isAuthenticated, updateInterval]);

  return tokenStatus;
};

/**
 * 格式化剩余时间为友好显示
 * @param seconds 剩余秒数
 * @returns 格式化后的时间字符串
 */
function formatRemainingTime(seconds: number): string {
  if (seconds <= 0) {
    return '已过期';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}小时${minutes}分钟`;
  } else if (minutes > 0) {
    return `${minutes}分钟${remainingSeconds}秒`;
  } else {
    return `${remainingSeconds}秒`;
  }
}

export default useTokenStatus; 