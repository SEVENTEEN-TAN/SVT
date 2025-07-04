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
  const { logout, isAuthenticated, auth, hasSelectedOrgRole } = useAuth();

  useEffect(() => {
    // 🔧 将verifyStatus定义在useEffect内部，避免依赖问题
    const verifyStatus = async () => {
      // 🔧 关键修复：只在完整认证状态下才进行验证（包括机构角色选择）
      if (!isAuthenticated || !auth.token || !hasSelectedOrgRole) {
        DebugManager.log('🚫 [用户状态验证] 用户未完整认证，跳过状态验证', {
          isAuthenticated,
          hasToken: !!auth.token,
          hasSelectedOrgRole
        }, { component: 'useUserStatus', action: 'skipVerify' });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        DebugManager.log('🔍 [用户状态验证] 开始用户状态验证', {
          tokenPrefix: auth.token.substring(0, 20) + '...',
          hasSelectedOrgRole
        }, { component: 'useUserStatus', action: 'startVerify' });

        const status = await verifyUserStatus();
        setUserStatus(status);

        DebugManager.log('✅ [用户状态验证] 用户状态验证API调用成功', {
          isValid: status.isValid,
          message: status.message
        }, { component: 'useUserStatus', action: 'verifySuccess' });
        
        // 检查用户状态
        if (!status.isValid) {
          DebugManager.warn('⚠️ [用户状态验证] 用户状态无效，准备登出', {
            status: status.message
          }, { component: 'useUserStatus', action: 'invalidStatus' });
          
          message.error(status.message || '用户状态异常，请联系管理员');
          await logout();
          navigate('/login');
          return;
        }

        DebugManager.logSensitive('🎯 [JWT智能续期测试] 用户状态验证完全成功', status, { 
          component: 'useUserStatus', 
          action: 'verify' 
        });
      } catch (err: any) {
        // 🔧 对于verify-user-status的错误，已由request拦截器统一处理
        // 这里只记录错误，不显示消息，避免重复提醒
        DebugManager.warn('❌ [用户状态验证] 用户状态验证失败（由全局拦截器统一处理）', err, {
          component: 'useUserStatus',
          action: 'verify'
        });
        setError(err.message || '验证失败');
      } finally {
        setLoading(false);
      }
    };

    // 🔧 防止重复调用：只在完整认证状态且首次挂载时调用
    if (isAuthenticated && auth.token && hasSelectedOrgRole && !hasVerifiedRef.current) {
      DebugManager.log('🚀 [用户状态验证] 满足用户状态验证条件，开始执行', {
        isAuthenticated,
        hasToken: !!auth.token,
        hasSelectedOrgRole,
        hasVerified: hasVerifiedRef.current
      }, { component: 'useUserStatus', action: 'initVerify' });

      hasVerifiedRef.current = true;
      verifyStatus();
    } else {
      DebugManager.log('⏸️ [用户状态验证] 跳过用户状态验证', {
        isAuthenticated,
        hasToken: !!auth.token,
        hasSelectedOrgRole,
        hasVerified: hasVerifiedRef.current
      }, { component: 'useUserStatus', action: 'skipVerify' });
    }
  }, [isAuthenticated, auth.token, hasSelectedOrgRole, logout, navigate]); // 🔧 添加hasSelectedOrgRole依赖

  // 🔧 提供手动刷新功能
  const refetch = async () => {
    if (isAuthenticated && auth.token && hasSelectedOrgRole) {
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