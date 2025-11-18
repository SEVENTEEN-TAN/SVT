import type { AxiosResponse } from 'axios';
import { useAuthStore } from '@/stores/authStore';
// 🔥 sessionStore已合并到userStore中
import { useUserStore } from '@/stores/userStore';
import { clearStorageOnTokenExpired } from './localStorageManager';
import { DebugManager } from './debugManager';
import { modalManager } from './modalManager';
import {
  SESSION_STATUS,
  EXPIRED_REASON,
  type SessionStatus,
  type SessionStatusInfo,
  type ExpiredReason,
  formatRemainingTime,
  getExpiredReasonText
} from '@/types/session';

/**
 * 简化版会话管理器
 * 
 * 功能：
 * - 处理后端返回的会话状态响应头
 * - 只处理两种状态：NORMAL和EXPIRED
 * - 根据过期原因显示对应的提示信息
 * - 处理会话过期和自动登出
 * 
 * 版本：v1.2 (2025-07-01)
 * 设计：简化版JWT智能续期机制的前端配套实现
 */
class SessionManager {
  private static instance: SessionManager;
  
  // 状态控制
  private isHandlingExpiry = false; // 防止重复处理过期
  
  private constructor() {
    DebugManager.log('SessionManager initialized (Simplified)', {}, {
      component: 'sessionManager',
      action: 'init'
    });
  }
  
  /**
   * 获取单例实例
   */
  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }
  
  /**
   * 处理后端响应中的会话状态信息
   * 核心方法，在axios响应拦截器中调用
   */
  public handleSessionStatus(response: AxiosResponse): void {
    try {
      // 解析响应头（axios会自动将响应头转换为小写）
      const sessionStatus = response.headers['x-session-status'] as SessionStatus;
      const sessionRemaining = response.headers['x-session-remaining'];
      const sessionWarning = response.headers['x-session-warning'];

      // 调试输出
      console.group('🔍 [SessionManager-简化版] 响应头分析');
      console.log('📡 API URL:', response.config?.url);
      console.log('📊 X-Session-Status:', sessionStatus);
      console.log('⏰ X-Session-Remaining:', sessionRemaining);
      console.log('⚠️ X-Session-Warning:', sessionWarning);
      console.groupEnd();

      // 如果没有会话状态响应头，跳过处理
      if (!sessionStatus || !sessionRemaining) {
        console.log('ℹ️ [SessionManager-简化版] 无会话状态响应头，跳过处理');
        return;
      }

      const remainingTime = parseInt(sessionRemaining, 10);
      const statusInfo: SessionStatusInfo = {
        status: sessionStatus,
        remainingTime,
        message: sessionWarning,
        expiredReason: sessionWarning as ExpiredReason // 后端直接返回过期原因
      };

      // 状态详情输出
      console.group('📈 [SessionManager-简化版] 会话状态详情');
      console.log('🎯 状态:', sessionStatus);
      console.log('⏱️ 剩余时间:', formatRemainingTime(remainingTime));
      console.log('💬 过期原因:', sessionWarning || '无');
      console.groupEnd();

      DebugManager.log('Session status received (Simplified)', {
        status: sessionStatus,
        remainingTime,
        expiredReason: sessionWarning
      }, {
        component: 'sessionManager',
        action: 'handleStatus'
      });

      // 根据状态处理
      this.processSessionStatus(statusInfo);

    } catch (error) {
      console.error('❌ [SessionManager-简化版] 处理会话状态失败:', error);
      DebugManager.warn('Failed to process session status', error, {
        component: 'sessionManager',
        action: 'handleStatus'
      });
    }
  }
  
  /**
   * 处理会话状态
   */
  private processSessionStatus(statusInfo: SessionStatusInfo): void {
    const { status, expiredReason } = statusInfo;
    
    switch (status) {
      case SESSION_STATUS.NORMAL:
        // 正常状态，清理过期处理标志
        this.isHandlingExpiry = false;
        DebugManager.log('Session status normal', {}, {
          component: 'sessionManager',
          action: 'normal'
        });
        break;
        
      case SESSION_STATUS.EXPIRED:
        this.handleSessionExpired(expiredReason);
        break;
        
      default:
        DebugManager.warn('Unknown session status', { status }, {
          component: 'sessionManager',
          action: 'processStatus'
        });
    }
  }
  
  /**
   * 处理会话过期
   */
  private handleSessionExpired(expiredReason?: ExpiredReason): void {
    // 防止重复处理
    if (this.isHandlingExpiry) {
      console.log('⚠️ [SessionManager-简化版] 已在处理过期状态，跳过重复处理');
      return;
    }
    
    this.isHandlingExpiry = true;
    
    // 🔧 详细的过期原因调试信息
    console.group('🚨 [SessionManager-简化版] 会话过期详细分析');
    console.log('📋 过期原因代码:', expiredReason);
    console.log('📋 过期原因类型:', typeof expiredReason);
    console.log('📋 是否为JWT_TOKEN_EXPIRED:', expiredReason === EXPIRED_REASON.JWT_TOKEN_EXPIRED);
    console.log('📋 是否为ACTIVITY_EXPIRED:', expiredReason === EXPIRED_REASON.ACTIVITY_EXPIRED);
    console.log('📋 EXPIRED_REASON常量值:', EXPIRED_REASON);
    
    let reasonAnalysis = '未知原因';
    if (expiredReason === EXPIRED_REASON.JWT_TOKEN_EXPIRED) {
      reasonAnalysis = 'JWT Token达到最大生命周期过期';
    } else if (expiredReason === EXPIRED_REASON.ACTIVITY_EXPIRED) {
      reasonAnalysis = '长时间未操作导致的活跃度过期';
    }
    console.log('📊 过期原因分析:', reasonAnalysis);
    console.groupEnd();
    
    DebugManager.log('🚨 [SessionManager-简化版] 会话过期，开始处理登出', {
      expiredReason,
      reasonAnalysis
    }, {
      component: 'sessionManager',
      action: 'handleExpired'
    });
    
    // 显示过期弹窗
    this.showSessionExpiredModal(expiredReason);
  }

  /**
   * 显示会话过期弹窗
   */
  private showSessionExpiredModal(expiredReason?: ExpiredReason): void {
    // 确定显示的消息
    let expiredMessage = '会话已过期';
    if (expiredReason) {
      expiredMessage = getExpiredReasonText(expiredReason);
    }
    
    DebugManager.log('🔔 [SessionManager-简化版] 显示会话过期弹窗', {
      expiredReason,
      expiredMessage
    }, {
      component: 'sessionManager',
      action: 'showModal'
    });

    // 使用modalManager显示弹窗
    modalManager.showSessionExpiredModal(expiredMessage, () => {
      DebugManager.log('🔔 [SessionManager-简化版] 用户确认会话过期，开始清理', {}, {
        component: 'sessionManager',
        action: 'userConfirmed'
      });
      
      // 用户确认后清理状态
      this.performAuthStateCleanup();
    });
  }

  /**
   * 执行认证状态清理和跳转
   */
  private performAuthStateCleanup(): void {
    console.log('🧹 [SessionManager-简化版] 开始执行认证状态清理');
    
    // 🔧 强制清理localStorage中的旧存储（如果存在）
    localStorage.removeItem('user-storage');    // 清理可能存在的旧明文存储
    console.log('🧹 [SessionManager-简化版] 旧存储清理完成');
    
    // 清除其他相关存储
    clearStorageOnTokenExpired();
    console.log('🧹 [SessionManager-简化版] 其他存储清理完成');
    
    // 🔧 关键修复：重置所有Store的内存状态，确保重新登录时强制选择机构角色
    const authStore = useAuthStore.getState();
    const userStore = useUserStore.getState();
    
    // 清除认证状态（这会重置Zustand状态）
    authStore.clearAuthState();
    console.log('🧹 [SessionManager-简化版] authStore已重置');
    
    // 🔥 重置会话状态（现在在userStore中）
    userStore.clearSession();
    console.log('🧹 [SessionManager-简化版] session状态已重置');
    
    // 清理用户状态
    userStore.clearUser();
    console.log('🧹 [SessionManager-简化版] userStore已重置');
    
    console.log('🧹 [SessionManager-简化版] Zustand状态重置完成');
    
    DebugManager.log('🧹 [SessionManager-简化版] 认证状态已清理', {}, {
      component: 'sessionManager',
      action: 'authStateCleared'
    });
    
    // 跳转到登录页
    setTimeout(() => {
      if (window.location.pathname !== '/login') {
        DebugManager.log('🔄 [SessionManager-简化版] 跳转到登录页', {}, {
          component: 'sessionManager',
          action: 'redirectToLogin'
        });
        window.location.href = '/login';
      }
    }, 500);
  }
  
  /**
   * 重置会话管理器状态
   * 用于登录后重置
   */
  public reset(): void {
    DebugManager.log('SessionManager reset (Simplified)', {}, {
      component: 'sessionManager',
      action: 'reset'
    });
    
    this.isHandlingExpiry = false;
  }
  
  /**
   * 获取当前状态（用于调试）
   */
  public getStatus(): { isHandlingExpiry: boolean } {
    return {
      isHandlingExpiry: this.isHandlingExpiry
    };
  }
}

// 导出单例实例
export const sessionManager = SessionManager.getInstance();
