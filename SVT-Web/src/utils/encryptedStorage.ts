/**
 * Zustand 加密存储适配器
 * 为 Zustand persist 提供加密存储能力
 * 
 * @author SEVENTEEN
 * @since 2025-07-04
 */

import type { StateStorage } from 'zustand/middleware';
import { AESCryptoUtils } from '@/utils/crypto';
import { cryptoConfig } from '@/config/crypto';
import { DebugManager } from '@/utils/debugManager';
import CryptoJS from 'crypto-js';

/**
 * 同步加密函数
 * 用于 Zustand persist 的同步存储需求
 */
function encryptSync(plainText: string, ivString: string): string {
  try {
    const keyString = import.meta.env.VITE_AES_KEY;
    if (!keyString) {
      throw new Error('AES密钥未配置');
    }
    
    const key = CryptoJS.enc.Base64.parse(keyString);
    const iv = CryptoJS.enc.Base64.parse(ivString);
    
    const encrypted = CryptoJS.AES.encrypt(plainText, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    return encrypted.toString();
  } catch (error) {
    DebugManager.error('[加密存储] 同步加密失败', error as Error, {
      component: 'EncryptedStorage',
      action: 'encryptSync'
    });
    throw error;
  }
}

/**
 * 同步解密函数
 * 用于 Zustand persist 的同步存储需求
 */
function decryptSync(encryptedData: string, ivString: string): string {
  try {
    const keyString = import.meta.env.VITE_AES_KEY;
    if (!keyString) {
      throw new Error('AES密钥未配置');
    }
    
    const key = CryptoJS.enc.Base64.parse(keyString);
    const iv = CryptoJS.enc.Base64.parse(ivString);
    
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    DebugManager.error('[加密存储] 同步解密失败', error as Error, {
      component: 'EncryptedStorage',
      action: 'decryptSync'
    });
    throw error;
  }
}

/**
 * 创建加密存储适配器
 * 根据配置动态决定是否加密
 * 注意：Zustand persist 需要同步的 storage 接口
 */
export const createEncryptedStorage = (): StateStorage => {
  return {
    getItem: (name: string): string | null => {
      try {
        const value = localStorage.getItem(name);
        if (!value) return null;

        // 检查是否需要解密
        if (cryptoConfig.isEnabled()) {
          try {
            // 尝试解析为加密格式
            const encryptedData = JSON.parse(value);
            if (encryptedData.encrypted && encryptedData.data && encryptedData.iv) {
              // 同步解密数据 - 使用同步的解密方法
              const decrypted = decryptSync(encryptedData.data, encryptedData.iv);
              DebugManager.log(`[加密存储] 成功解密: ${name}`, {}, { 
                component: 'EncryptedStorage', 
                action: 'getItem' 
              });
              return decrypted;
            }
          } catch (e) {
            // 不是加密格式，返回原值
            DebugManager.log(`[加密存储] 数据未加密，返回原值: ${name}`, {}, { 
              component: 'EncryptedStorage', 
              action: 'getItem' 
            });
          }
        }
        
        return value;
      } catch (error) {
        DebugManager.error(`[加密存储] 读取失败: ${name}`, error as Error, { 
          component: 'EncryptedStorage', 
          action: 'getItem' 
        });
        return null;
      }
    },

    setItem: (name: string, value: string): void => {
      try {
        // 确保 value 是字符串类型
        const valueStr = typeof value === 'string' ? value : JSON.stringify(value);
        
        DebugManager.log(`[加密存储] 准备存储: ${name}`, { 
          valueType: typeof value,
          valueLength: valueStr.length,
          isString: typeof value === 'string'
        }, { 
          component: 'EncryptedStorage', 
          action: 'setItem' 
        });
        
        // 检查是否需要加密
        if (cryptoConfig.isEnabled()) {
          // 生成IV并加密 - 使用同步的加密方法
          const iv = AESCryptoUtils.generateIV();
          const encryptedData = encryptSync(valueStr, iv);
          
          // 存储加密后的数据
          const storageData = {
            encrypted: true,
            data: encryptedData,
            iv: iv,
            timestamp: Date.now(),
            version: '1.0'
          };
          
          localStorage.setItem(name, JSON.stringify(storageData));
          
          DebugManager.log(`[加密存储] 成功加密存储: ${name}`, { 
            originalSize: valueStr.length,
            encryptedSize: encryptedData.length 
          }, { 
            component: 'EncryptedStorage', 
            action: 'setItem' 
          });
        } else {
          // 直接存储明文
          localStorage.setItem(name, valueStr);
          DebugManager.log(`[加密存储] 明文存储: ${name}`, {}, { 
            component: 'EncryptedStorage', 
            action: 'setItem' 
          });
        }
      } catch (error) {
        DebugManager.error(`[加密存储] 存储失败: ${name}`, error as Error, { 
          component: 'EncryptedStorage', 
          action: 'setItem' 
        });
        // 失败时回退到普通存储
        localStorage.setItem(name, valueStr);
      }
    },

    removeItem: (name: string): void => {
      localStorage.removeItem(name);
      DebugManager.log(`[加密存储] 已删除: ${name}`, {}, { 
        component: 'EncryptedStorage', 
        action: 'removeItem' 
      });
    },
  };
};

/**
 * 迁移工具：从 SecureStorage 迁移到统一的加密存储
 */
export const migrateFromSecureStorage = async (): Promise<void> => {
  try {
    // 检查是否已经迁移过
    const migrationKey = 'svt_storage_migrated_v2';
    if (localStorage.getItem(migrationKey)) {
      return; // 已经迁移过，跳过
    }

    DebugManager.log('[存储迁移] 开始执行存储迁移', {}, { 
      component: 'StorageMigration' 
    });

    // 迁移认证数据
    const authTokenKey = 'svt_secure_auth_token';
    const authTokenData = localStorage.getItem(authTokenKey);
    
    if (authTokenData && !localStorage.getItem('auth-storage')) {
      try {
        const parsedData = JSON.parse(authTokenData);
        
        // 检查是否是SecureStorage格式
        if (parsedData.data && typeof parsedData.encrypted === 'boolean') {
          let token: string | null = null;
          
          if (parsedData.encrypted && parsedData.iv) {
            // 解密旧的加密数据
            try {
              const decrypted = await AESCryptoUtils.decrypt(parsedData.data, parsedData.iv);
              token = JSON.parse(decrypted);
            } catch (e) {
              DebugManager.error('[存储迁移] 解密旧token失败', e as Error, {
                component: 'StorageMigration'
              });
            }
          } else {
            // 明文数据
            token = JSON.parse(parsedData.data);
          }
          
          if (token) {
            // 构建新的认证状态
            const authState = {
              state: {
                token: token,
                isAuthenticated: true,
                expiryDate: localStorage.getItem('expiryDate') || null
              },
              version: 0
            };
            
            // 使用新的加密存储保存
            const storage = createEncryptedStorage();
            await storage.setItem('auth-storage', JSON.stringify(authState));
            
            DebugManager.log('[存储迁移] 成功迁移认证数据', {}, { 
              component: 'StorageMigration' 
            });
          }
        }
      } catch (error) {
        DebugManager.error('[存储迁移] 迁移认证数据失败', error as Error, {
          component: 'StorageMigration'
        });
      }
    }

    // 迁移用户数据
    const userDataKey = 'svt_secure_user_data';
    const userDataStorage = localStorage.getItem(userDataKey);
    
    if (userDataStorage && !localStorage.getItem('user-storage')) {
      try {
        const parsedData = JSON.parse(userDataStorage);
        
        if (parsedData.data && typeof parsedData.encrypted === 'boolean') {
          let userData: any = null;
          
          if (parsedData.encrypted && parsedData.iv) {
            // 解密旧的加密数据
            try {
              const decrypted = await AESCryptoUtils.decrypt(parsedData.data, parsedData.iv);
              userData = JSON.parse(decrypted);
            } catch (e) {
              DebugManager.error('[存储迁移] 解密旧用户数据失败', e as Error, {
                component: 'StorageMigration'
              });
            }
          } else {
            // 明文数据
            userData = JSON.parse(parsedData.data);
          }
          
          if (userData) {
            // 构建新的用户状态
            const userState = {
              state: {
                user: userData,
                session: {
                  hasSelectedOrgRole: true,
                  orgRoleData: userData.orgId ? {
                    orgId: userData.orgId,
                    orgNameZh: userData.orgNameZh || '',
                    orgNameEn: userData.orgNameEn || '',
                    roleId: userData.roleId || '',
                    roleNameZh: userData.roleNameZh || '',
                    roleNameEn: userData.roleNameEn || '',
                    selectedAt: new Date().toISOString()
                  } : null,
                  loginStep: 'completed'
                }
              },
              version: 0
            };
            
            // 使用新的加密存储保存
            const storage = createEncryptedStorage();
            await storage.setItem('user-storage', JSON.stringify(userState));
            
            DebugManager.log('[存储迁移] 成功迁移用户数据', {}, { 
              component: 'StorageMigration' 
            });
          }
        }
      } catch (error) {
        DebugManager.error('[存储迁移] 迁移用户数据失败', error as Error, {
          component: 'StorageMigration'
        });
      }
    }

    // 清理旧数据
    const keysToRemove = [
      'svt_secure_auth_token',
      'svt_secure_user_data',
      'svt_secure_session_data'
    ];
    
    keysToRemove.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        DebugManager.log(`[存储迁移] 已删除旧数据: ${key}`, {}, { 
          component: 'StorageMigration' 
        });
      }
    });

    // 标记迁移完成
    localStorage.setItem(migrationKey, new Date().toISOString());
    
    DebugManager.log('[存储迁移] 迁移完成', {}, { 
      component: 'StorageMigration' 
    });
  } catch (error) {
    DebugManager.error('[存储迁移] 迁移失败', error as Error, { 
      component: 'StorageMigration' 
    });
  }
};