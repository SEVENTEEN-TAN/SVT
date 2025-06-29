/**
 * SVT 调试管理器 (DebugManager)
 *
 * 统一管理应用的调试信息输出，提供分级的调试信息管理，确保开发环境的调试便利性和生产环境的安全性。
 *
 * 核心特性：
 * - 🔒 安全分级：根据信息敏感度自动分级处理
 * - 🛡️ 自动脱敏：生产环境自动脱敏敏感信息
 * - 📊 结构化日志：统一的日志格式和上下文信息
 * - 🎯 环境隔离：开发/生产环境智能切换
 * - ⚡ 性能监控：内置性能监控和API调用跟踪
 *
 * 使用示例：
 * ```typescript
 * import { DebugManager } from '@/utils/debugManager';
 *
 * // 普通调试信息（开发环境可见）
 * DebugManager.log('组件渲染', { componentName: 'Header' });
 *
 * // 敏感调试信息（需要特殊环境变量启用）
 * DebugManager.logSensitive('用户详情', userInfo);
 *
 * // 错误信息（自动脱敏）
 * DebugManager.error('API调用失败', error);
 *
 * // 生产环境关键操作
 * DebugManager.production('用户登录成功');
 * ```
 *
 * 环境变量配置：
 * - VITE_DEBUG_SENSITIVE: 启用敏感调试信息（开发环境建议true，生产环境必须false）
 * - VITE_PRODUCTION_LOGGING: 生产环境日志开关（生产环境建议true）
 *
 * 详细文档：docs/Debug-Manager-Guide.md
 * 使用示例：utils/debugManager.example.ts
 *
 * @author SVT Team
 * @since 2025-06-29
 * @version 1.0.0
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  PRODUCTION = 4
}

export interface LogContext {
  component?: string;
  action?: string;
  userId?: string;
  timestamp?: number;
}

/**
 * 调试管理器类
 * 提供分级的调试信息管理，确保生产环境安全
 */
export class DebugManager {
  private static isDevelopment = import.meta.env.DEV;
  private static isSensitiveDebugEnabled = import.meta.env.VITE_DEBUG_SENSITIVE === 'true';
  private static isProductionLoggingEnabled = import.meta.env.VITE_PRODUCTION_LOGGING === 'true';
  
  /**
   * 普通调试信息
   * 仅在开发环境显示
   */
  static log(message: string, data?: any, context?: LogContext) {
    if (!this.isDevelopment) return;
    
    const logMessage = this.formatMessage('DEBUG', message, context);
    console.log(logMessage, data);
  }
  
  /**
   * 敏感调试信息
   * 需要特殊环境变量启用，用于调试包含敏感数据的信息
   */
  static logSensitive(message: string, data?: any, context?: LogContext) {
    if (!this.isDevelopment || !this.isSensitiveDebugEnabled) return;
    
    const logMessage = this.formatMessage('SENSITIVE', message, context);
    console.log(`🔐 ${logMessage}`, data);
  }
  
  /**
   * 信息级别日志
   * 开发环境显示详细信息，生产环境显示简化信息
   */
  static info(message: string, data?: any, context?: LogContext) {
    const logMessage = this.formatMessage('INFO', message, context);
    
    if (this.isDevelopment) {
      console.info(`ℹ️ ${logMessage}`, data);
    } else if (this.isProductionLoggingEnabled) {
      console.info(`ℹ️ ${logMessage}`);
    }
  }
  
  /**
   * 警告级别日志
   * 所有环境都会显示，但生产环境不包含敏感数据
   */
  static warn(message: string, data?: any, context?: LogContext) {
    const logMessage = this.formatMessage('WARN', message, context);
    
    if (this.isDevelopment) {
      console.warn(`⚠️ ${logMessage}`, data);
    } else {
      console.warn(`⚠️ ${logMessage}`);
    }
  }
  
  /**
   * 错误级别日志
   * 所有环境都会显示，生产环境进行错误信息脱敏
   */
  static error(message: string, error?: Error, context?: LogContext) {
    const logMessage = this.formatMessage('ERROR', message, context);
    
    if (this.isDevelopment) {
      console.error(`❌ ${logMessage}`, error);
    } else {
      // 生产环境只显示用户友好的错误信息
      const sanitizedMessage = this.sanitizeErrorMessage(message);
      console.error(`❌ ${sanitizedMessage}`);
    }
  }
  
  /**
   * 生产环境日志
   * 所有环境都会显示，用于记录关键操作，不包含敏感数据
   */
  static production(message: string, context?: LogContext) {
    const logMessage = this.formatMessage('PROD', message, context);
    console.info(`🚀 ${logMessage}`);
  }
  
  /**
   * 性能监控日志
   * 用于记录性能相关信息
   */
  static performance(message: string, duration?: number, context?: LogContext) {
    if (!this.isDevelopment && !this.isProductionLoggingEnabled) return;
    
    const logMessage = this.formatMessage('PERF', message, context);
    const perfMessage = duration ? `${logMessage} (${duration}ms)` : logMessage;
    
    console.time && console.timeEnd ? 
      console.info(`⚡ ${perfMessage}`) : 
      console.info(`⚡ ${perfMessage}`);
  }
  
  /**
   * 用户操作日志
   * 记录用户关键操作，生产环境会进行数据脱敏
   */
  static userAction(action: string, userId?: string, data?: any) {
    const context: LogContext = {
      action,
      userId: this.isDevelopment ? userId : this.maskUserId(userId),
      timestamp: Date.now()
    };
    
    if (this.isDevelopment) {
      this.log(`用户操作: ${action}`, data, context);
    } else if (this.isProductionLoggingEnabled) {
      this.production(`用户操作: ${action}`, context);
    }
  }
  
  /**
   * API调用日志
   * 记录API调用信息，生产环境会隐藏敏感参数
   */
  static apiCall(method: string, url: string, duration?: number, status?: number) {
    const message = `API ${method} ${url}`;
    const context: LogContext = {
      action: 'api-call',
      timestamp: Date.now()
    };
    
    if (this.isDevelopment) {
      const details = { method, url, duration, status };
      this.log(message, details, context);
    } else if (this.isProductionLoggingEnabled && status && status >= 400) {
      // 生产环境只记录错误的API调用
      this.warn(`API调用失败: ${method} ${this.sanitizeUrl(url)} (${status})`, undefined, context);
    }
  }
  
  /**
   * 格式化日志消息
   */
  private static formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? this.formatContext(context) : '';
    return `[${timestamp}] [${level}] ${message}${contextStr}`;
  }
  
  /**
   * 格式化上下文信息
   */
  private static formatContext(context: LogContext): string {
    const parts: string[] = [];
    
    if (context.component) parts.push(`component:${context.component}`);
    if (context.action) parts.push(`action:${context.action}`);
    if (context.userId) parts.push(`user:${context.userId}`);
    
    return parts.length > 0 ? ` [${parts.join(', ')}]` : '';
  }
  
  /**
   * 脱敏错误信息
   */
  private static sanitizeErrorMessage(message: string): string {
    // 移除可能包含敏感信息的内容
    return message
      .replace(/token[:\s]+[^\s]+/gi, 'token: ***')
      .replace(/password[:\s]+[^\s]+/gi, 'password: ***')
      .replace(/key[:\s]+[^\s]+/gi, 'key: ***')
      .replace(/\/api\/[^\s]+/gi, '/api/***')
      .replace(/localhost:\d+/gi, 'localhost:***');
  }
  
  /**
   * 脱敏用户ID
   */
  private static maskUserId(userId?: string): string | undefined {
    if (!userId) return undefined;
    if (userId.length <= 4) return '***';
    return userId.substring(0, 2) + '***' + userId.substring(userId.length - 2);
  }
  
  /**
   * 脱敏URL
   */
  private static sanitizeUrl(url: string): string {
    // 移除查询参数和敏感路径信息
    return url.split('?')[0].replace(/\/\d+/g, '/***');
  }
  
  /**
   * 获取调试配置信息
   */
  static getConfig() {
    return {
      isDevelopment: this.isDevelopment,
      isSensitiveDebugEnabled: this.isSensitiveDebugEnabled,
      isProductionLoggingEnabled: this.isProductionLoggingEnabled,
      environment: import.meta.env.MODE
    };
  }
  
  /**
   * 条件调试 - 仅在满足条件时输出
   */
  static logIf(condition: boolean, message: string, data?: any, context?: LogContext) {
    if (condition) {
      this.log(message, data, context);
    }
  }
  
  /**
   * 组调试 - 将相关的调试信息分组
   */
  static group(label: string, callback: () => void) {
    if (!this.isDevelopment) {
      callback();
      return;
    }
    
    console.group(`📁 ${label}`);
    try {
      callback();
    } finally {
      console.groupEnd();
    }
  }
}

/**
 * 便捷的调试函数导出
 */
export const debug = DebugManager.log;
export const debugSensitive = DebugManager.logSensitive;
export const debugInfo = DebugManager.info;
export const debugWarn = DebugManager.warn;
export const debugError = DebugManager.error;
export const debugProduction = DebugManager.production;
export const debugPerformance = DebugManager.performance;
export const debugUserAction = DebugManager.userAction;
export const debugApiCall = DebugManager.apiCall;

/**
 * 默认导出
 */
export default DebugManager;
