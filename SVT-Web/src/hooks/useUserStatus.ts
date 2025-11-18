import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { verifyUserStatus, type UserStatusVerificationResult } from '@/api/auth';
import { useAuth } from '@/stores/useAuth';
import { DebugManager } from '@/utils/debugManager';

// 全局验证状态，防止多个组件重复验证
let globalVerificationStatus = {
  hasVerified: false,
  isVerifying: false,
  verificationPromise: null as Promise<UserStatusVerificationResult> | null
};

// 重置全局验证状态（用于登出时清理）
export const resetGlobalVerificationStatus = () => {
  globalVerificationStatus = {
    hasVerified: false,
    isVerifying: false,
    verificationPromise: null
  };
};

/**
 * 用户状态验证Hook
 * 用于Dashboard页面验证用户状态，处理各种异常情况
 */
export const useUserStatus = () => {
  const [userStatus, setUserStatus] = useState<UserStatusVerificationResult | null>(null);
  const [loading, setLoading] = useState(false); // 🔧 修复:初始不加载,根据认证状态决定
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { logout, isAuthenticated, auth, hasSelectedOrgRole } = useAuth();

  useEffect(() => {

    // 🔧 防止重复调用：使用全局验证状态，只在完整认证状态且未验证时调用
    if (isAuthenticated && auth.token && hasSelectedOrgRole && !globalVerificationStatus.hasVerified && !globalVerificationStatus.isVerifying) {
      DebugManager.log('🚀 [用户状态验证] 满足用户状态验证条件，开始执行', {
        isAuthenticated,
        hasToken: !!auth.token,
        hasSelectedOrgRole,
        hasVerified: globalVerificationStatus.hasVerified,
        isVerifying: globalVerificationStatus.isVerifying
      }, { component: 'useUserStatus', action: 'initVerify' });

      globalVerificationStatus.isVerifying = true;
      globalVerificationStatus.verificationPromise = verifyUserStatus();
      
      globalVerificationStatus.verificationPromise
        .then((status) => {
          setUserStatus(status);
          globalVerificationStatus.hasVerified = true;
          
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
            logout().then(() => {
              navigate('/login');
            });
          }
        })
        .catch((err: any) => {
          DebugManager.warn('❌ [用户状态验证] 用户状态验证失败（由全局拦截器统一处理）', err, {
            component: 'useUserStatus',
            action: 'verify'
          });
          setError(err.message || '验证失败');
        })
        .finally(() => {
          globalVerificationStatus.isVerifying = false;
          setLoading(false);
        });
      
    } else if (globalVerificationStatus.isVerifying && globalVerificationStatus.verificationPromise) {
      // 如果正在验证中，等待现有的验证完成
      DebugManager.log('⏳ [用户状态验证] 检测到正在验证中，等待现有验证完成', {}, { component: 'useUserStatus', action: 'waitForVerification' });
      
      globalVerificationStatus.verificationPromise
        .then((status) => {
          setUserStatus(status);
        })
        .catch((err: any) => {
          setError(err.message || '验证失败');
        })
        .finally(() => {
          setLoading(false);
        });
      
    } else {
      DebugManager.log('⏸️ [用户状态验证] 跳过用户状态验证', {
        isAuthenticated,
        hasToken: !!auth.token,
        hasSelectedOrgRole,
        hasVerified: globalVerificationStatus.hasVerified,
        isVerifying: globalVerificationStatus.isVerifying
      }, { component: 'useUserStatus', action: 'skipVerify' });
      setLoading(false);
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