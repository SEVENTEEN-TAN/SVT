/**
 * AES加密工具类
 * 支持AES-256-CBC加密算法
 * 用于API请求响应数据的加密解密
 * 
 * @author SEVENTEEN
 * @since 2025-06-17
 */

import CryptoJS from 'crypto-js';
import { cryptoConfig } from '@/config/crypto';

// 加密配置
export const CRYPTO_CONFIG = {
  algorithm: 'AES-CBC',
  keySize: 256 / 32, // 256位 = 8个32位字
  ivSize: 128 / 32,  // 128位 = 4个32位字
  mode: CryptoJS.mode.CBC,
  padding: CryptoJS.pad.Pkcs7,
  maxDataSize: 10 * 1024 * 1024, // 10MB
} as const;

// 加密数据格式
export interface EncryptedData {
  encrypted: boolean;
  data: string;
  iv: string;
  timestamp: number;
  version: string;
}

// 加密结果
export interface EncryptionResult {
  encryptedData: string;
  iv: string;
}

// 密钥缓存
let cachedKey: CryptoJS.lib.WordArray | null = null;
let keyExpiry: number = 0;

/**
 * AES加密工具类
 */
export class AESCryptoUtils {
  
  /**
   * 检查AES加密是否启用
   */
  static isEnabled(): boolean {
    return cryptoConfig.isEnabled();
  }

  /**
   * 生成随机IV
   */
  static generateIV(): string {
    // AES-CBC需要16字节的IV
    const iv = CryptoJS.lib.WordArray.random(16);
    return CryptoJS.enc.Base64.stringify(iv);
  }

  /**
   * 获取密钥
   * 支持缓存机制，避免重复获取
   */
  static async getKey(): Promise<CryptoJS.lib.WordArray> {
    // 检查缓存
    if (cachedKey && Date.now() < keyExpiry) {
      return cachedKey;
    }

    const keyString = import.meta.env.VITE_AES_KEY;
    if (!keyString) {
      throw new Error('AES密钥未在环境变量中设置 (VITE_AES_KEY)');
    }

    try {
      console.debug('从.env加载的AES密钥 (Base64):', keyString);
      const key = CryptoJS.enc.Base64.parse(keyString);

      if (!key.sigBytes) {
        // .parse returns an empty WordArray for invalid Base64
        throw new Error('解析密钥失败，可能不是有效的Base64格式。');
      }

      if (key.sigBytes !== 32) {
        const errorMessage = `无效的AES密钥长度。期望32字节（AES-256），实际为 ${key.sigBytes} 字节。请检查VITE_AES_KEY环境变量。`;
        console.error(errorMessage);
        throw new Error(errorMessage);
      }
      
      console.debug(`成功解码AES密钥，长度: ${key.sigBytes} 字节`);
      cachedKey = key;
      // 设置缓存过期时间（1小时）
      keyExpiry = Date.now() + 60 * 60 * 1000;
      
      return cachedKey;

    } catch (error) {
      console.error('AES密钥处理失败:', error);
      const message = error instanceof Error ? error.message : '密钥配置无效，必须是32字节的Base64编码字符串。';
      throw new Error(message);
    }
  }

  /**
   * AES加密
   * @param plainText 明文
   * @param ivString Base64编码的IV
   */
  static async encrypt(plainText: string, ivString: string): Promise<string> {
    if (!plainText) {
      throw new Error('待加密数据不能为空');
    }

    if (!ivString) {
      throw new Error('IV不能为空');
    }

    // 检查数据大小
    const dataSize = new Blob([plainText]).size;
    if (!cryptoConfig.isDataSizeValid(dataSize)) {
      const config = cryptoConfig.get();
      throw new Error(`数据大小超过限制: ${config.maxDataSize} bytes`);
    }

    try {
      const key = await this.getKey();
      const iv = CryptoJS.enc.Base64.parse(ivString);

      // 执行加密
      const encrypted = CryptoJS.AES.encrypt(plainText, key, {
        iv: iv,
        mode: CRYPTO_CONFIG.mode,
        padding: CRYPTO_CONFIG.padding
      });

      const result = encrypted.toString();
      return result;

    } catch (error) {
      console.error('AES加密失败:', error);
      throw new Error('数据加密失败');
    }
  }

  /**
   * AES解密
   * @param encryptedData Base64编码的密文
   * @param ivString Base64编码的IV
   */
  static async decrypt(encryptedData: string, ivString: string): Promise<string> {
    if (!encryptedData) {
      throw new Error('待解密数据不能为空');
    }

    if (!ivString) {
      throw new Error('IV不能为空');
    }

    try {
      const key = await this.getKey();
      const iv = CryptoJS.enc.Base64.parse(ivString);

      // 执行解密
      const decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
        iv: iv,
        mode: CRYPTO_CONFIG.mode,
        padding: CRYPTO_CONFIG.padding
      });

      const result = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!result) {
        throw new Error('解密结果为空，可能是密钥不正确或数据损坏');
      }

      return result;

    } catch (error) {
      console.error('AES解密失败:', error);
      throw new Error('数据解密失败');
    }
  }

  /**
   * 便捷加密方法（自动生成IV）
   * @param plainText 明文
   */
  static async encryptWithIV(plainText: string): Promise<EncryptionResult> {
    const iv = this.generateIV();
    const encryptedData = await this.encrypt(plainText, iv);
    return {
      encryptedData,
      iv
    };
  }

  /**
   * 加密JSON对象为API请求格式
   * @param data 要加密的数据对象
   */
  static async encryptForAPI(data: any): Promise<EncryptedData> {
    if (!this.isEnabled()) {
      throw new Error('AES加密未启用');
    }

    try {
      const plainText = JSON.stringify(data);
      const { encryptedData, iv } = await this.encryptWithIV(plainText);

      return {
        encrypted: true,
        data: encryptedData,
        iv: iv,
        timestamp: Date.now(),
        version: '1.0'
      };

    } catch (error) {
      console.error('API数据加密失败:', error);
      throw error;
    }
  }

  /**
   * 解密API响应数据
   * @param encryptedResponse 加密的响应数据
   */
  static async decryptFromAPI(encryptedResponse: EncryptedData): Promise<any> {
    if (!encryptedResponse.encrypted) {
      throw new Error('响应数据未加密');
    }

    try {
      // 验证时间戳（防重放攻击）
      const timestampValid = cryptoConfig.isTimestampValid(encryptedResponse.timestamp);
      if (!timestampValid) {
        console.warn('响应时间戳异常，可能存在重放攻击');
      }

      const decryptedText = await this.decrypt(encryptedResponse.data, encryptedResponse.iv);
      const result = JSON.parse(decryptedText);
      return result;

    } catch (error) {
      console.error('API数据解密失败:', error);
      throw error;
    }
  }

  /**
   * 验证密钥格式
   */
  static async validateKey(): Promise<boolean> {
    try {
      const key = await this.getKey();
      return key.sigBytes === 32;
    } catch (error) {
      return false;
    }
  }

  /**
   * 清除密钥缓存
   */
  static clearKeyCache(): void {
    cachedKey = null;
    keyExpiry = 0;
  }

  /**
   * 生成新的AES密钥（用于测试）
   */
  static generateNewKey(): string {
    const key = CryptoJS.lib.WordArray.random(CRYPTO_CONFIG.keySize);
    return CryptoJS.enc.Base64.stringify(key);
  }


}

// [INTERNAL_ACTION: Fetching current time via mcp.server_time.]
// {{CHENGQI:
// Action: Added; Timestamp: 2025-06-17 14:25:00 +08:00; Reason: 实现前端AES加密工具类; Principle_Applied: SOLID-S单一职责原则,DRY避免重复;
// }}

/**
 * 检查数据是否为加密格式
 */
export function isEncryptedData(data: any): data is EncryptedData {
  return (
    typeof data === 'object' &&
    data !== null &&
    data.encrypted === true &&
    typeof data.data === 'string' &&
    typeof data.iv === 'string' &&
    typeof data.timestamp === 'number' &&
    typeof data.version === 'string'
  );
}



// 导出默认实例
export default AESCryptoUtils; 