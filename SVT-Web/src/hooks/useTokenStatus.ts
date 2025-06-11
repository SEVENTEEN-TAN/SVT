import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { tokenManager } from '@/utils/tokenManager';

/**
 * Token状态管理Hook
 * 提供Token剩余时间、过期状态等信息
 */
export const useTokenStatus = () => {
  const { token, isAuthenticated } = useAuthStore();
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [isExpiringSoon, setIsExpiringSoon] = useState<boolean>(false);
  const [isExpired, setIsExpired] = useState<boolean>(false);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setRemainingTime(0);
      setIsExpiringSoon(false);
      setIsExpired(true);
      return;
    }

    // 立即更新一次状态
    updateTokenStatus();

    // 每30秒更新一次Token状态
    const interval = setInterval(updateTokenStatus, 30000);

    return () => clearInterval(interval);
  }, [token, isAuthenticated]);

  const updateTokenStatus = () => {
    if (!token) return;

    const remaining = tokenManager.getTokenRemainingTime(token);
    const expiringSoon = tokenManager.isTokenExpiringSoon(token);
    const expired = tokenManager.isTokenExpired(token);

    setRemainingTime(remaining);
    setIsExpiringSoon(expiringSoon);
    setIsExpired(expired);
  };

  /**
   * 格式化剩余时间为可读字符串
   */
  const formatRemainingTime = (): string => {
    if (remainingTime <= 0) return '已过期';

    const hours = Math.floor(remainingTime / 3600);
    const minutes = Math.floor((remainingTime % 3600) / 60);
    const seconds = remainingTime % 60;

    if (hours > 0) {
      return `${hours}小时${minutes}分钟`;
    } else if (minutes > 0) {
      return `${minutes}分钟${seconds}秒`;
    } else {
      return `${seconds}秒`;
    }
  };

  /**
   * 获取Token状态描述
   */
  const getStatusText = (): string => {
    if (isExpired) return '已过期';
    if (isExpiringSoon) return '即将过期';
    return '正常';
  };

  /**
   * 获取状态颜色
   */
  const getStatusColor = (): 'success' | 'warning' | 'error' => {
    if (isExpired) return 'error';
    if (isExpiringSoon) return 'warning';
    return 'success';
  };

  return {
    // 基础状态
    remainingTime,
    isExpiringSoon,
    isExpired,
    isAuthenticated,
    
    // 格式化方法
    formatRemainingTime,
    getStatusText,
    getStatusColor,
    
    // 手动更新
    updateTokenStatus,
  };
}; 