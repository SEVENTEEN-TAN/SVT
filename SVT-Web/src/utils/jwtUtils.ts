/**
 * JWT工具类 - 前端Token有效性检查
 * 
 * 功能：
 * - 解析JWT Token
 * - 检查Token是否过期
 * - 检查Token是否在活跃期
 * - 提供Token状态判断
 * 
 * @author SVT Team
 * @since 2025-07-04
 */

interface JWTPayload {
  exp: number;        // 过期时间戳
  iat: number;        // 签发时间戳
  userId: string;     // 用户ID
  userName: string;   // 用户名
  sub: string;        // 主题
  iss: string;        // 签发者
}

interface TokenValidationResult {
  isValid: boolean;           // Token是否有效
  isExpired: boolean;         // Token是否过期
  isActive: boolean;          // Token是否在活跃期
  expiresAt: Date | null;     // 过期时间
  remainingTime: number;      // 剩余时间（秒）
  payload: JWTPayload | null; // Token载荷
  reason?: string;            // 无效原因
}

export class JWTUtils {
  
  /**
   * 解析JWT Token
   * @param token JWT Token字符串
   * @returns 解析后的payload
   */
  static parseToken(token: string): JWTPayload | null {
    try {
      if (!token) return null;
      
      // JWT格式：header.payload.signature
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.warn('[JWTUtils] Token格式错误');
        return null;
      }
      
      // 解码payload部分（Base64URL）
      const payload = parts[1];
      // 处理Base64URL编码，替换字符并添加填充
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
      
      const decoded = atob(padded);
      const parsed = JSON.parse(decoded) as JWTPayload;
      
      return parsed;
    } catch (error) {
      console.error('[JWTUtils] Token解析失败:', error);
      return null;
    }
  }
  
  /**
   * 检查Token是否过期
   * @param token JWT Token字符串
   * @returns 是否过期
   */
  static isTokenExpired(token: string): boolean {
    const payload = this.parseToken(token);
    if (!payload || !payload.exp) return true;
    
    const now = Math.floor(Date.now() / 1000);
    return now >= payload.exp;
  }
  
  /**
   * 检查Token是否在活跃期
   * 活跃期定义：距离过期时间还有超过5分钟
   * @param token JWT Token字符串
   * @returns 是否在活跃期
   */
  static isTokenActive(token: string, activeThresholdMinutes: number = 5): boolean {
    const payload = this.parseToken(token);
    if (!payload || !payload.exp) return false;
    
    const now = Math.floor(Date.now() / 1000);
    const thresholdSeconds = activeThresholdMinutes * 60;
    
    return (payload.exp - now) > thresholdSeconds;
  }
  
  /**
   * 获取Token剩余时间（秒）
   * @param token JWT Token字符串
   * @returns 剩余时间（秒），过期返回0
   */
  static getTokenRemainingTime(token: string): number {
    const payload = this.parseToken(token);
    if (!payload || !payload.exp) return 0;
    
    const now = Math.floor(Date.now() / 1000);
    const remaining = payload.exp - now;
    
    return Math.max(0, remaining);
  }
  
  /**
   * 获取Token过期时间
   * @param token JWT Token字符串
   * @returns 过期时间Date对象
   */
  static getTokenExpirationDate(token: string): Date | null {
    const payload = this.parseToken(token);
    if (!payload || !payload.exp) return null;
    
    return new Date(payload.exp * 1000);
  }
  
  /**
   * 完整的Token验证
   * @param token JWT Token字符串
   * @param activeThresholdMinutes 活跃期阈值（分钟）
   * @returns 验证结果
   */
  static validateToken(token: string, activeThresholdMinutes: number = 5): TokenValidationResult {
    if (!token) {
      return {
        isValid: false,
        isExpired: true,
        isActive: false,
        expiresAt: null,
        remainingTime: 0,
        payload: null,
        reason: 'Token不存在'
      };
    }
    
    const payload = this.parseToken(token);
    if (!payload) {
      return {
        isValid: false,
        isExpired: true,
        isActive: false,
        expiresAt: null,
        remainingTime: 0,
        payload: null,
        reason: 'Token格式错误或解析失败'
      };
    }
    
    if (!payload.exp) {
      return {
        isValid: false,
        isExpired: true,
        isActive: false,
        expiresAt: null,
        remainingTime: 0,
        payload,
        reason: 'Token缺少过期时间'
      };
    }
    
    const now = Math.floor(Date.now() / 1000);
    const isExpired = now >= payload.exp;
    const remainingTime = Math.max(0, payload.exp - now);
    const isActive = remainingTime > (activeThresholdMinutes * 60);
    const expiresAt = new Date(payload.exp * 1000);
    
    if (isExpired) {
      return {
        isValid: false,
        isExpired: true,
        isActive: false,
        expiresAt,
        remainingTime: 0,
        payload,
        reason: 'Token已过期'
      };
    }
    
    if (!isActive) {
      return {
        isValid: true, // 虽然未过期，但不在活跃期
        isExpired: false,
        isActive: false,
        expiresAt,
        remainingTime,
        payload,
        reason: `Token即将过期（剩余${Math.ceil(remainingTime / 60)}分钟）`
      };
    }
    
    return {
      isValid: true,
      isExpired: false,
      isActive: true,
      expiresAt,
      remainingTime,
      payload,
      reason: undefined
    };
  }
  
  /**
   * 格式化剩余时间为可读字符串
   * @param seconds 剩余秒数
   * @returns 格式化的时间字符串
   */
  static formatRemainingTime(seconds: number): string {
    if (seconds <= 0) return '已过期';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}小时${minutes}分钟`;
    } else if (minutes > 0) {
      return `${minutes}分钟${secs}秒`;
    } else {
      return `${secs}秒`;
    }
  }
  
  /**
   * 检查是否需要刷新Token
   * 当Token有效但接近过期时，建议刷新
   * @param token JWT Token字符串
   * @param refreshThresholdMinutes 刷新阈值（分钟）
   * @returns 是否需要刷新
   */
  static shouldRefreshToken(token: string, refreshThresholdMinutes: number = 10): boolean {
    const validation = this.validateToken(token);
    if (!validation.isValid || validation.isExpired) return false;
    
    const remainingMinutes = validation.remainingTime / 60;
    return remainingMinutes <= refreshThresholdMinutes;
  }
}