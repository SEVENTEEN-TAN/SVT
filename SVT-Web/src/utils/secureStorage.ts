/**
 * 安全存储工具类
 * 支持localStorage的AES加密存储
 * 根据环境变量动态启用/禁用加密
 * 
 * @author SEVENTEEN
 * @since 2025-07-02
 */

import { AESCryptoUtils } from '@/utils/crypto';
import { cryptoConfig } from '@/config/crypto';
import { DebugManager } from '@/utils/debugManager';

// 存储配置
export const STORAGE_CONFIG = {
  keyPrefix: 'svt_secure_',
  encryptionVersion: '1.0',
  timestampTolerance: 24 * 60 * 60 * 1000, // 24小时
  debugContext: { component: 'SecureStorage' }
} as const;

// 加密存储数据格式
export interface SecureStorageData {
  encrypted: boolean;
  data: string;
  iv?: string;
  timestamp: number;
  version: string;
}

// 存储选项
export interface StorageOptions {
  encrypt?: boolean;        // 是否强制加密（覆盖全局配置）
  ttl?: number;            // 过期时间（毫秒）
  compress?: boolean;      // 是否压缩（预留）
}

/**
 * 安全存储管理器
 */
export class SecureStorage {

  /**
   * 检查是否应该使用加密
   */
  private static shouldEncrypt(options?: StorageOptions): boolean {
    // 如果明确指定了encrypt选项，则使用该选项
    if (options?.encrypt !== undefined) {
      return options.encrypt;
    }
    
    // 否则使用全局配置
    return cryptoConfig.isEnabled();
  }

  /**
   * 生成存储键名
   */
  private static generateKey(key: string): string {
    return `${STORAGE_CONFIG.keyPrefix}${key}`;
  }

  /**
   * 设置存储数据
   */
  static async setItem(key: string, value: any, options?: StorageOptions): Promise<void> {
    try {
      const storageKey = this.generateKey(key);
      const shouldEncrypt = this.shouldEncrypt(options);
      
      DebugManager.log(`设置存储项: ${key}, 加密: ${shouldEncrypt}`, { key, shouldEncrypt }, STORAGE_CONFIG.debugContext);

      // 准备存储数据
      let storageData: SecureStorageData;
      
      if (shouldEncrypt) {
        // 加密存储
        try {
          const plainText = JSON.stringify(value);
          const { encryptedData, iv } = await AESCryptoUtils.encryptWithIV(plainText);
          
          storageData = {
            encrypted: true,
            data: encryptedData,
            iv: iv,
            timestamp: Date.now(),
            version: STORAGE_CONFIG.encryptionVersion
          };
          
          DebugManager.log(`数据加密成功: ${key}`, { 
            originalSize: plainText.length,
            encryptedSize: encryptedData.length 
          }, STORAGE_CONFIG.debugContext);
          
        } catch (error) {
          DebugManager.error(`数据加密失败: ${key}`, error as Error, STORAGE_CONFIG.debugContext);
          
          // 加密失败时回退到明文存储（可选择抛出错误）
          console.warn(`加密失败，回退到明文存储: ${key}`);
          storageData = {
            encrypted: false,
            data: JSON.stringify(value),
            timestamp: Date.now(),
            version: STORAGE_CONFIG.encryptionVersion
          };
        }
      } else {
        // 明文存储
        storageData = {
          encrypted: false,
          data: JSON.stringify(value),
          timestamp: Date.now(),
          version: STORAGE_CONFIG.encryptionVersion
        };
      }

      // 设置过期时间
      if (options?.ttl) {
        const expiryTime = Date.now() + options.ttl;
        storageData.timestamp = expiryTime;
      }

      // 存储到localStorage
      localStorage.setItem(storageKey, JSON.stringify(storageData));
      
      DebugManager.log(`存储项设置成功: ${key}`, { storageKey }, STORAGE_CONFIG.debugContext);

    } catch (error) {
      DebugManager.error(`设置存储项失败: ${key}`, error as Error, STORAGE_CONFIG.debugContext);
      throw new Error(`安全存储设置失败: ${key}`);
    }
  }

  /**
   * 获取存储数据
   */
  static async getItem<T = any>(key: string): Promise<T | null> {
    try {
      const storageKey = this.generateKey(key);
      const storedValue = localStorage.getItem(storageKey);
      
      if (!storedValue) {
        DebugManager.log(`存储项不存在: ${key}`, { storageKey }, STORAGE_CONFIG.debugContext);
        return null;
      }

      // 解析存储数据
      let storageData: SecureStorageData;
      try {
        storageData = JSON.parse(storedValue);
      } catch (error) {
        DebugManager.error(`存储数据解析失败: ${key}`, error as Error, STORAGE_CONFIG.debugContext);
        // 尝试清理无效数据
        this.removeItem(key);
        return null;
      }

      // 验证数据格式
      if (!this.isValidStorageData(storageData)) {
        DebugManager.log(`存储数据格式无效: ${key}`, { storageData }, STORAGE_CONFIG.debugContext);
        this.removeItem(key);
        return null;
      }

      // 检查数据是否过期
      if (this.isExpired(storageData)) {
        DebugManager.log(`存储数据已过期: ${key}`, { 
          timestamp: storageData.timestamp,
          now: Date.now() 
        }, STORAGE_CONFIG.debugContext);
        this.removeItem(key);
        return null;
      }

      // 解密数据
      let resultData: any;
      if (storageData.encrypted) {
        try {
          if (!storageData.iv) {
            throw new Error('加密数据缺少IV');
          }
          
          const decryptedText = await AESCryptoUtils.decrypt(storageData.data, storageData.iv);
          resultData = JSON.parse(decryptedText);
          
          DebugManager.log(`数据解密成功: ${key}`, { 
            encryptedSize: storageData.data.length,
            decryptedSize: decryptedText.length 
          }, STORAGE_CONFIG.debugContext);
          
        } catch (error) {
          DebugManager.error(`数据解密失败: ${key}`, error as Error, STORAGE_CONFIG.debugContext);
          // 解密失败时清理数据
          this.removeItem(key);
          return null;
        }
      } else {
        // 明文数据
        try {
          resultData = JSON.parse(storageData.data);
        } catch (error) {
          DebugManager.error(`明文数据解析失败: ${key}`, error as Error, STORAGE_CONFIG.debugContext);
          this.removeItem(key);
          return null;
        }
      }

      DebugManager.log(`获取存储项成功: ${key}`, { 
        encrypted: storageData.encrypted,
        version: storageData.version 
      }, STORAGE_CONFIG.debugContext);

      return resultData as T;

    } catch (error) {
      DebugManager.error(`获取存储项失败: ${key}`, error as Error, STORAGE_CONFIG.debugContext);
      return null;
    }
  }

  /**
   * 移除存储项
   */
  static removeItem(key: string): void {
    try {
      const storageKey = this.generateKey(key);
      localStorage.removeItem(storageKey);
      
      DebugManager.log(`移除存储项: ${key}`, { storageKey }, STORAGE_CONFIG.debugContext);
    } catch (error) {
      DebugManager.error(`移除存储项失败: ${key}`, error as Error, STORAGE_CONFIG.debugContext);
    }
  }

  /**
   * 检查存储项是否存在
   */
  static hasItem(key: string): boolean {
    const storageKey = this.generateKey(key);
    return localStorage.getItem(storageKey) !== null;
  }

  /**
   * 清理所有安全存储项
   */
  static clearAll(): void {
    try {
      const keysToRemove: string[] = [];
      
      // 查找所有带前缀的键
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_CONFIG.keyPrefix)) {
          keysToRemove.push(key);
        }
      }

      // 移除所有找到的键
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      DebugManager.log(`清理所有安全存储项完成`, { 
        clearedCount: keysToRemove.length 
      }, STORAGE_CONFIG.debugContext);

    } catch (error) {
      DebugManager.error('清理安全存储项失败', error as Error, STORAGE_CONFIG.debugContext);
    }
  }

  /**
   * 清理过期的存储项
   */
  static cleanupExpired(): void {
    try {
      const expiredKeys: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_CONFIG.keyPrefix)) {
          try {
            const storedValue = localStorage.getItem(key);
            if (storedValue) {
              const storageData: SecureStorageData = JSON.parse(storedValue);
              if (this.isExpired(storageData)) {
                expiredKeys.push(key);
              }
            }
          } catch (error) {
            // 解析失败的项也标记为过期
            expiredKeys.push(key);
          }
        }
      }

      // 移除过期项
      expiredKeys.forEach(key => localStorage.removeItem(key));
      
      DebugManager.log(`清理过期存储项完成`, { 
        expiredCount: expiredKeys.length 
      }, STORAGE_CONFIG.debugContext);

    } catch (error) {
      DebugManager.error('清理过期存储项失败', error as Error, STORAGE_CONFIG.debugContext);
    }
  }

  /**
   * 获取存储使用情况
   */
  static getStorageInfo(): {
    total: number;
    encrypted: number;
    unencrypted: number;
    expired: number;
    totalSize: number;
  } {
    let total = 0;
    let encrypted = 0;
    let unencrypted = 0;
    let expired = 0;
    let totalSize = 0;

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_CONFIG.keyPrefix)) {
          total++;
          
          const storedValue = localStorage.getItem(key);
          if (storedValue) {
            totalSize += storedValue.length;
            
            try {
              const storageData: SecureStorageData = JSON.parse(storedValue);
              
              if (this.isExpired(storageData)) {
                expired++;
              } else if (storageData.encrypted) {
                encrypted++;
              } else {
                unencrypted++;
              }
            } catch (error) {
              expired++; // 解析失败视为过期
            }
          }
        }
      }
    } catch (error) {
      DebugManager.error('获取存储信息失败', error as Error, STORAGE_CONFIG.debugContext);
    }

    return { total, encrypted, unencrypted, expired, totalSize };
  }

  /**
   * 验证存储数据格式
   */
  private static isValidStorageData(data: any): data is SecureStorageData {
    return (
      typeof data === 'object' &&
      data !== null &&
      typeof data.encrypted === 'boolean' &&
      typeof data.data === 'string' &&
      typeof data.timestamp === 'number' &&
      typeof data.version === 'string' &&
      (!data.encrypted || typeof data.iv === 'string')
    );
  }

  /**
   * 检查数据是否过期
   */
  private static isExpired(storageData: SecureStorageData): boolean {
    const now = Date.now();
    const timeDiff = now - storageData.timestamp;
    
    // 如果时间戳在未来，可能是设置了TTL
    if (storageData.timestamp > now) {
      return false;
    }
    
    // 检查是否超过容忍时间
    return timeDiff > STORAGE_CONFIG.timestampTolerance;
  }

  /**
   * 迁移旧格式数据
   */
  static async migrateOldData(oldKey: string, newKey: string): Promise<boolean> {
    try {
      // 检查旧数据是否存在
      const oldData = localStorage.getItem(oldKey);
      if (!oldData) {
        return false;
      }

      // 解析旧数据
      let parsedData: any;
      try {
        parsedData = JSON.parse(oldData);
      } catch (error) {
        // 如果是直接存储的字符串
        parsedData = oldData;
      }

      // 使用新格式存储
      await this.setItem(newKey, parsedData);
      
      // 移除旧数据
      localStorage.removeItem(oldKey);
      
      DebugManager.log(`数据迁移成功: ${oldKey} -> ${newKey}`, { 
        oldKey, 
        newKey 
      }, STORAGE_CONFIG.debugContext);

      return true;

    } catch (error) {
      DebugManager.error(`数据迁移失败: ${oldKey} -> ${newKey}`, error as Error, STORAGE_CONFIG.debugContext);
      return false;
    }
  }
}

// 便捷的导出函数
export const secureStorage = {
  /**
   * 设置Token（强制加密）
   */
  setToken: async (token: string): Promise<void> => {
    await SecureStorage.setItem('auth_token', token, { encrypt: true });
  },

  /**
   * 获取Token
   */
  getToken: async (): Promise<string | null> => {
    return await SecureStorage.getItem<string>('auth_token');
  },

  /**
   * 移除Token
   */
  removeToken: (): void => {
    SecureStorage.removeItem('auth_token');
  },

  /**
   * 设置用户数据（加密存储）
   */
  setUserData: async (userData: any): Promise<void> => {
    await SecureStorage.setItem('user_data', userData, { encrypt: true });
  },

  /**
   * 获取用户数据
   */
  getUserData: async (): Promise<any> => {
    return await SecureStorage.getItem('user_data');
  },

  /**
   * 设置会话数据（不加密，短期存储）
   */
  setSessionData: async (sessionData: any, ttl: number = 30 * 60 * 1000): Promise<void> => {
    await SecureStorage.setItem('session_data', sessionData, { encrypt: false, ttl });
  },

  /**
   * 获取会话数据
   */
  getSessionData: async (): Promise<any> => {
    return await SecureStorage.getItem('session_data');
  },

  /**
   * 清理所有数据
   */
  clearAll: (): void => {
    SecureStorage.clearAll();
  }
};

// 导出默认实例
export default SecureStorage;

// {{CHENGQI:
// Action: Added; Timestamp: 2025-07-02 15:15:00 +08:00; Reason: 实现支持动态加密配置的安全存储工具类; Principle_Applied: SOLID-S单一职责原则,安全防护策略;
// }}