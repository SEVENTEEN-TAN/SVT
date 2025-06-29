import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { verifyUserStatus, type UserStatusVerificationResult } from '@/api/auth';
import { useAuth } from '@/stores/useAuth';
import { DebugManager } from '@/utils/debugManager';

/**
 * 用户状态验证Hook
 * 用于Dashboard页面验证用户状态，处理各种异常情况
 */
export const useUserStatus = () => {
  const [userStatus, setUserStatus] = useState<UserStatusVerificationResult | null>(null);
  const [loading, setLoading] = useState(false); // 🔧 修复：初始不加载，根据认证状态决定
  const [error, setError] = useState<string | null>(null);
  const hasVerifiedRef = useRef(false); // 🔧 使用useRef防重复验证（不触发重新渲染）
  const navigate = useNavigate();
  const { logout, isAuthenticated, auth } = useAuth();

  useEffect(() => {
    // 🔧 将verifyStatus定义在useEffect内部，避免依赖问题
    const verifyStatus = async () => {
      // 🔧 关键修复：只在已认证且有token的情况下才进行验证
      if (!isAuthenticated || !auth.token) {
        DebugManager.log('用户未认证，跳过状态验证', { isAuthenticated, hasToken: !!auth.token });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const status = await verifyUserStatus();
        setUserStatus(status);
        
        // 检查用户状态
        if (!status.isValid) {
          message.error(status.message || '用户状态异常，请联系管理员');
          await logout();
          navigate('/login');
          return;
        }

        DebugManager.logSensitive('用户状态验证成功', status, { component: 'useUserStatus', action: 'verify' });
      } catch (err: any) {
        // 🔧 对于verify-user-status的错误，已由request拦截器统一处理
        // 这里只记录错误，不显示消息，避免重复提醒
        DebugManager.warn('用户状态验证失败（由全局拦截器统一处理）', err, { component: 'useUserStatus', action: 'verify' });
        setError(err.message || '验证失败');
      } finally {
        setLoading(false);
      }
    };

    // 🔧 防止重复调用：只在组件首次挂载且已认证时调用
    if (isAuthenticated && auth.token && !hasVerifiedRef.current) {
      hasVerifiedRef.current = true;
      verifyStatus();
    }
  }, [isAuthenticated, auth.token, logout, navigate]); // 🔧 移除hasVerified依赖，使用useRef避免重复调用

  // 🔧 提供手动刷新功能
  const refetch = async () => {
    if (isAuthenticated && auth.token) {
      const verifyStatus = async () => {
        try {
          setLoading(true);
          setError(null);
          
          const status = await verifyUserStatus();
          setUserStatus(status);
          
          if (!status.isValid) {
            message.error(status.message || '用户状态异常，请联系管理员');
            await logout();
            navigate('/login');
            return;
          }

          DebugManager.logSensitive('用户状态验证成功', status, { component: 'useUserStatus', action: 'refetch' });
        } catch (err: any) {
          DebugManager.warn('用户状态验证失败', err, { component: 'useUserStatus', action: 'refetch' });
          setError(err.message || '验证失败');
        } finally {
          setLoading(false);
        }
      };
      
      await verifyStatus();
    }
  };

  return {
    userStatus,
    loading,
    error,
    refetch,
  };
}; 