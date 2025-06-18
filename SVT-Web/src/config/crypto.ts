/**
 * 前端加密配置管理
 * 统一管理AES加密相关配置和开关
 * 
 * @author Sun Wukong
 * @since 2025-06-17
 */

// 加密配置接口
export interface CryptoConfig {
  enabled: boolean;
  algorithm: string;
  keySize: number;
  ivSize: number;
  maxDataSize: number;
  debug: boolean;
  keyCacheExpiry: number;
  timestampTolerance: number;
}

// 默认配置
const DEFAULT_CONFIG: CryptoConfig = {
  enabled: true,
  algorithm: 'AES-CBC',
  keySize: 8, // 256位 = 8个32位字
  ivSize: 4,  // 128位 = 4个32位字
  maxDataSize: 10 * 1024 * 1024, // 10MB
  debug: false,
  keyCacheExpiry: 60 * 60 * 1000, // 1小时
  timestampTolerance: 10 * 60 * 1000, // 10分钟
};

/**
 * 加密配置管理器
 */
class CryptoConfigManager {
  private config: CryptoConfig;
  private initialized = false;

  constructor() {
    this.config = { ...DEFAULT_CONFIG };
    this.init();
  }

  /**
   * 初始化配置
   */
  private init(): void {
    try {
      // 从环境变量读取配置
      const aesEnabled = import.meta.env.VITE_AES_ENABLED;
      
      // 🔧 支持多种配置方式
      if (aesEnabled !== undefined) {
        // 显式设置了VITE_AES_ENABLED
        this.config.enabled = aesEnabled === 'true';
      } else {
        // 未设置时，检查是否有AES密钥，有密钥则默认启用
        const hasAesKey = !!import.meta.env.VITE_AES_KEY;
        this.config.enabled = hasAesKey;
      }
      
      this.config.debug = false;
      
      this.initialized = true;
    } catch (error) {
      console.error('AES配置初始化失败:', error);
      // 初始化失败时禁用加密
      this.config.enabled = false;
    }
  }

  /**
   * 获取配置
   */
  getConfig(): Readonly<CryptoConfig> {
    return { ...this.config };
  }

  /**
   * 检查是否启用加密
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * 动态启用加密
   */
  enable(): void {
    this.config.enabled = true;
  }

  /**
   * 动态禁用加密
   */
  disable(): void {
    this.config.enabled = false;
  }

  /**
   * 检查数据大小是否有效
   */
  isDataSizeValid(dataSize: number): boolean {
    return dataSize <= this.config.maxDataSize;
  }

  /**
   * 检查时间戳是否有效
   */
  isTimestampValid(timestamp: number): boolean {
    const now = Date.now();
    const diff = Math.abs(now - timestamp);
    return diff <= this.config.timestampTolerance;
  }

  /**
   * 获取配置摘要
   */
  getConfigSummary(): string {
    return `AES[enabled=${this.config.enabled}, algorithm=${this.config.algorithm}, keySize=${this.config.keySize * 32}bit, maxDataSize=${this.config.maxDataSize / 1024 / 1024}MB]`;
  }

  /**
   * 更新配置
   */
  updateConfig(updates: Partial<CryptoConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * 重置为默认配置
   */
  resetConfig(): void {
    this.config = { ...DEFAULT_CONFIG };
    this.init();
  }


}

// 创建全局配置管理器实例
export const cryptoConfigManager = new CryptoConfigManager();

// 导出配置相关的工具函数
export const cryptoConfig = {
  /**
   * 获取当前配置
   */
  get: () => cryptoConfigManager.getConfig(),

  /**
   * 检查是否启用
   */
  isEnabled: () => cryptoConfigManager.isEnabled(),

  /**
   * 启用加密
   */
  enable: () => cryptoConfigManager.enable(),

  /**
   * 禁用加密
   */
  disable: () => cryptoConfigManager.disable(),

  /**
   * 检查数据大小
   */
  isDataSizeValid: (size: number) => cryptoConfigManager.isDataSizeValid(size),

  /**
   * 检查时间戳
   */
  isTimestampValid: (timestamp: number) => cryptoConfigManager.isTimestampValid(timestamp),

  /**
   * 获取配置摘要
   */
  getSummary: () => cryptoConfigManager.getConfigSummary(),



  /**
   * 更新配置
   */
  update: (updates: Partial<CryptoConfig>) => cryptoConfigManager.updateConfig(updates),

  /**
   * 重置配置
   */
  reset: () => cryptoConfigManager.resetConfig(),
};

// 默认导出
export default cryptoConfig;

// {{CHENGQI:
// Action: Added; Timestamp: 2025-06-17 14:45:00 +08:00; Reason: 创建前端加密配置管理模块; Principle_Applied: SOLID-S单一职责原则,配置外部化原则;
// }} 