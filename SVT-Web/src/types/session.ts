/**
 * 会话管理相关类型定义 (简化版本)
 * 
 * 版本：v1.2 (2025-07-01)
 * 说明：简化的JWT智能续期机制，只处理两种核心状态
 */

/**
 * 会话状态枚举 (简化版本)
 * 只包含两种状态：正常和过期
 */
export const SESSION_STATUS = {
  /** 正常状态 */
  NORMAL: 'NORMAL',
  /** 已过期状态 - 会话已过期，需要重新登录 */
  EXPIRED: 'EXPIRED'
} as const;

/**
 * 过期原因枚举
 * 区分不同的过期类型以便显示对应的提示信息
 */
export const EXPIRED_REASON = {
  /** JWT Token超时过期 */
  JWT_TOKEN_EXPIRED: 'JWT_TOKEN_EXPIRED',
  /** 用户操作超时过期 */
  ACTIVITY_EXPIRED: 'ACTIVITY_EXPIRED'
} as const;

/**
 * 会话状态类型
 */
export type SessionStatus = typeof SESSION_STATUS[keyof typeof SESSION_STATUS];

/**
 * 过期原因类型
 */
export type ExpiredReason = typeof EXPIRED_REASON[keyof typeof EXPIRED_REASON];

/**
 * 会话状态信息接口 (简化版本)
 */
export interface SessionStatusInfo {
  /** 会话状态 */
  status: SessionStatus;
  /** 剩余时间（毫秒） */
  remainingTime: number;
  /** 消息（可选） */
  message?: string;
  /** 过期原因（仅在EXPIRED状态时有值） */
  expiredReason?: ExpiredReason;
}

/**
 * 会话响应头接口
 */
export interface SessionHeaders {
  /** 会话状态响应头 */
  'x-session-status'?: SessionStatus;
  /** 会话剩余时间响应头（毫秒字符串） */
  'x-session-remaining'?: string;
  /** 会话警告消息响应头 */
  'x-session-warning'?: string;
}

/**
 * 会话管理器状态接口
 * 用于调试和状态查询
 */
export interface SessionManagerStatus {
  /** 是否已显示Token警告 */
  tokenWarningShown: boolean;
  /** 是否有活跃的模态框 */
  hasActiveModal: boolean;
}

/**
 * 会话配置接口
 */
export interface SessionConfig {
  /** 警告冷却期（毫秒） */
  warningCooldown: number;
  /** 最终警告冷却期（毫秒） */
  finalWarningCooldown: number;
  /** 是否启用调试日志 */
  enableDebugLog: boolean;
}

/**
 * 会话事件类型
 */
export type SessionEventType = 
  | 'warning-shown'
  | 'final-warning-shown'
  | 'session-expired'
  | 'warnings-cleared'
  | 'manager-reset';

/**
 * 会话事件接口
 */
export interface SessionEvent {
  /** 事件类型 */
  type: SessionEventType;
  /** 事件时间戳 */
  timestamp: number;
  /** 事件数据 */
  data?: {
    remainingTime?: number;
    message?: string;
    [key: string]: any;
  };
}

/**
 * 会话统计信息接口
 */
export interface SessionStats {
  /** 警告显示次数 */
  warningCount: number;
  /** 最终警告显示次数 */
  finalWarningCount: number;
  /** 会话过期次数 */
  expiredCount: number;
  /** 最后活动时间 */
  lastActivityTime: number;
}

/**
 * 检查是否为有效的会话状态
 */
export function isValidSessionStatus(status: string): status is SessionStatus {
  return Object.values(SESSION_STATUS).includes(status as SessionStatus);
}

/**
 * 格式化剩余时间为可读字符串
 */
export function formatRemainingTime(remainingTime: number): string {
  const minutes = Math.floor(remainingTime / (60 * 1000));
  const seconds = Math.floor((remainingTime % (60 * 1000)) / 1000);
  
  if (minutes > 0) {
    return `${minutes}分钟${seconds > 0 ? seconds + '秒' : ''}`;
  } else {
    return `${seconds}秒`;
  }
}

/**
 * 获取会话状态的显示文本
 */
export function getSessionStatusText(status: SessionStatus): string {
  switch (status) {
    case SESSION_STATUS.NORMAL:
      return '正常';
    case SESSION_STATUS.EXPIRED:
      return '已过期';
    default:
      return '未知';
  }
}

/**
 * 获取过期原因的显示文本
 * 注意：不包含"请重新登录"，由modalManager统一添加
 */
export function getExpiredReasonText(reason: ExpiredReason): string {
  switch (reason) {
    case EXPIRED_REASON.JWT_TOKEN_EXPIRED:
      return '认证已到期';
    case EXPIRED_REASON.ACTIVITY_EXPIRED:
      return '长时间未操作，会话已过期';
    default:
      return '会话已过期';
  }
}

/**
 * 获取会话状态的颜色
 */
export function getSessionStatusColor(status: SessionStatus): string {
  switch (status) {
    case SESSION_STATUS.NORMAL:
      return '#52c41a'; // 绿色
    case SESSION_STATUS.EXPIRED:
      return '#ff4d4f'; // 红色
    default:
      return '#d9d9d9'; // 默认灰色
  }
}
