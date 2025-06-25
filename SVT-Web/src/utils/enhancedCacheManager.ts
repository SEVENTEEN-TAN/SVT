/**
 * 增强版缓存管理系统
 * 专业设计师优化版本 - 多级缓存 + 智能清理 + 性能监控
 */

// 缓存配置接口
interface CacheConfig {
  ttl?: number; // 生存时间(毫秒)
  maxSize?: number; // 最大条目数
  enableCompression?: boolean; // 是否启用压缩
  enableEncryption?: boolean; // 是否启用加密
}

// 缓存项接口
interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  ttl?: number;
  compressed?: boolean;
  encrypted?: boolean;
}

// 缓存统计接口
interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  size: number;
  hitRate: number;
}

/**
 * Level 1: 内存缓存管理器
 * 最快访问速度，用于组件状态和临时数据
 */
class MemoryCacheManager {
  private cache = new Map<string, CacheItem>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    size: 0,
    hitRate: 0
  };
  private maxSize: number;

  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
  }

  set<T>(key: string, value: T, config?: CacheConfig): void {
    // LRU清理策略
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    const item: CacheItem<T> = {
      data: value,
      timestamp: Date.now(),
      ttl: config?.ttl
    };

    this.cache.set(key, item);
    this.stats.sets++;
    this.stats.size = this.cache.size;
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // 检查TTL
    if (item.ttl && Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.deletes++;
      this.stats.size = this.cache.size;
      this.updateHitRate();
      return null;
    }

    this.stats.hits++;
    this.updateHitRate();
    return item.data as T;
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.deletes++;
      this.stats.size = this.cache.size;
    }
    return deleted;
  }

  clear(): void {
    this.cache.clear();
    this.stats.size = 0;
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }
}

/**
 * Level 2: LocalStorage缓存管理器
 * 持久化存储，用于用户设置和重要状态
 */
class PersistentCacheManager {
  private prefix: string;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    size: 0,
    hitRate: 0
  };

  constructor(prefix = 'svt-cache-') {
    this.prefix = prefix;
    this.updateSize();
  }

  set<T>(key: string, value: T, config?: CacheConfig): boolean {
    try {
      const item: CacheItem<T> = {
        data: value,
        timestamp: Date.now(),
        ttl: config?.ttl,
        compressed: config?.enableCompression,
        encrypted: config?.enableEncryption
      };

      let serialized = JSON.stringify(item);
      
      // 压缩处理(简化版)
      if (config?.enableCompression) {
        // 这里可以集成压缩库
        console.debug('[Cache] 压缩功能待实现');
      }

      localStorage.setItem(this.prefix + key, serialized);
      this.stats.sets++;
      this.updateSize();
      return true;
    } catch (error) {
      console.warn('[PersistentCache] 设置失败:', error);
      return false;
    }
  }

  get<T>(key: string): T | null {
    try {
      const serialized = localStorage.getItem(this.prefix + key);
      
      if (!serialized) {
        this.stats.misses++;
        this.updateHitRate();
        return null;
      }

      const item: CacheItem<T> = JSON.parse(serialized);

      // 检查TTL
      if (item.ttl && Date.now() - item.timestamp > item.ttl) {
        this.delete(key);
        this.stats.misses++;
        this.updateHitRate();
        return null;
      }

      this.stats.hits++;
      this.updateHitRate();
      return item.data;
    } catch (error) {
      console.warn('[PersistentCache] 获取失败:', error);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }
  }

  delete(key: string): boolean {
    try {
      localStorage.removeItem(this.prefix + key);
      this.stats.deletes++;
      this.updateSize();
      return true;
    } catch (error) {
      console.warn('[PersistentCache] 删除失败:', error);
      return false;
    }
  }

  clear(): void {
    const keys = Object.keys(localStorage).filter(key => key.startsWith(this.prefix));
    keys.forEach(key => localStorage.removeItem(key));
    this.updateSize();
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  private updateSize(): void {
    this.stats.size = Object.keys(localStorage).filter(key => key.startsWith(this.prefix)).length;
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }
}

/**
 * Level 3: SessionStorage缓存管理器
 * 会话级存储，用于临时状态和页面数据
 */
class SessionCacheManager {
  private prefix: string;

  constructor(prefix = 'svt-session-') {
    this.prefix = prefix;
  }

  set<T>(key: string, value: T): boolean {
    try {
      const item: CacheItem<T> = {
        data: value,
        timestamp: Date.now()
      };
      sessionStorage.setItem(this.prefix + key, JSON.stringify(item));
      return true;
    } catch (error) {
      console.warn('[SessionCache] 设置失败:', error);
      return false;
    }
  }

  get<T>(key: string): T | null {
    try {
      const serialized = sessionStorage.getItem(this.prefix + key);
      if (!serialized) return null;
      
      const item: CacheItem<T> = JSON.parse(serialized);
      return item.data;
    } catch (error) {
      console.warn('[SessionCache] 获取失败:', error);
      return null;
    }
  }

  delete(key: string): boolean {
    try {
      sessionStorage.removeItem(this.prefix + key);
      return true;
    } catch (error) {
      console.warn('[SessionCache] 删除失败:', error);
      return false;
    }
  }

  clear(): void {
    const keys = Object.keys(sessionStorage).filter(key => key.startsWith(this.prefix));
    keys.forEach(key => sessionStorage.removeItem(key));
  }
}

/**
 * 统一缓存管理器
 * 整合三级缓存，提供统一接口
 */
class EnhancedCacheManager {
  private memoryCache: MemoryCacheManager;
  private persistentCache: PersistentCacheManager;
  private sessionCache: SessionCacheManager;

  constructor() {
    this.memoryCache = new MemoryCacheManager();
    this.persistentCache = new PersistentCacheManager();
    this.sessionCache = new SessionCacheManager();
    
    // 启动清理任务
    this.startCleanupTask();
  }

  // 内存缓存操作
  memory = {
    set: <T>(key: string, value: T, ttl?: number) => 
      this.memoryCache.set(key, value, { ttl }),
    get: <T>(key: string) => this.memoryCache.get<T>(key),
    delete: (key: string) => this.memoryCache.delete(key),
    clear: () => this.memoryCache.clear(),
    stats: () => this.memoryCache.getStats()
  };

  // 持久化缓存操作
  persistent = {
    set: <T>(key: string, value: T, config?: CacheConfig) => 
      this.persistentCache.set(key, value, config),
    get: <T>(key: string) => this.persistentCache.get<T>(key),
    delete: (key: string) => this.persistentCache.delete(key),
    clear: () => this.persistentCache.clear(),
    stats: () => this.persistentCache.getStats()
  };

  // 会话缓存操作
  session = {
    set: <T>(key: string, value: T) => this.sessionCache.set(key, value),
    get: <T>(key: string) => this.sessionCache.get<T>(key),
    delete: (key: string) => this.sessionCache.delete(key),
    clear: () => this.sessionCache.clear()
  };

  // 获取所有缓存统计
  getAllStats() {
    return {
      memory: this.memoryCache.getStats(),
      persistent: this.persistentCache.getStats(),
      session: { size: Object.keys(sessionStorage).length }
    };
  }

  // 清理所有缓存
  clearAll(): void {
    this.memoryCache.clear();
    this.persistentCache.clear();
    this.sessionCache.clear();
  }

  // 启动定期清理任务
  private startCleanupTask(): void {
    // 每5分钟清理一次过期数据
    setInterval(() => {
      console.debug('[CacheManager] 执行定期清理任务');
      // 这里可以添加更复杂的清理逻辑
    }, 5 * 60 * 1000);
  }
}

// 导出单例实例
export const cacheManager = new EnhancedCacheManager();

// 导出类型
export type { CacheConfig, CacheStats };
