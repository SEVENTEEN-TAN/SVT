/**
 * Tab状态本地存储清理工具
 * 用于管理用户Tab状态的localStorage数据
 */

// 生成用户Tab存储键
const getUserTabStorageKey = (userId: string) => `svt-tab-state-${userId}`;
const getUserActiveTabStorageKey = (userId: string) => `svt-active-tab-${userId}`;

/**
 * 清理指定用户的Tab状态
 * @param userId 用户ID
 */
export const clearUserTabStorage = (userId: string): void => {
  try {
    const tabStorageKey = getUserTabStorageKey(userId);
    const activeTabStorageKey = getUserActiveTabStorageKey(userId);
    
    localStorage.removeItem(tabStorageKey);
    localStorage.removeItem(activeTabStorageKey);
    
    console.log(`[TabStorage] 已清理用户 ${userId} 的Tab状态`);
  } catch (error) {
    console.warn('[TabStorage] 清理用户Tab状态失败:', error);
  }
};

/**
 * 清理所有用户的Tab状态
 * 用于全局清理或重置
 */
export const clearAllTabStorage = (): void => {
  try {
    // 获取所有localStorage键
    const keys = Object.keys(localStorage);
    
    // 删除所有Tab相关的存储
    keys.forEach(key => {
      if (key.startsWith('svt-tab-state-') || key.startsWith('svt-active-tab-')) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('[TabStorage] 已清理所有用户的Tab状态');
  } catch (error) {
    console.warn('[TabStorage] 清理所有Tab状态失败:', error);
  }
};

/**
 * 在Token失效时清理Tab状态
 * 通常在请求拦截器中调用
 * @param userId 当前用户ID（可选）
 */
export const clearTabStorageOnTokenExpired = (userId?: string): void => {
  try {
    if (userId) {
      // 如果有用户ID，只清理该用户的状态
      clearUserTabStorage(userId);
    } else {
      // 否则清理所有Tab状态
      clearAllTabStorage();
    }
    
    console.log('[TabStorage] Token失效，已清理Tab状态');
  } catch (error) {
    console.warn('[TabStorage] Token失效时清理Tab状态失败:', error);
  }
};

/**
 * 检查并清理过期的Tab状态
 * 可以定期调用以清理无用数据
 */
export const cleanupExpiredTabStorage = (): void => {
  try {
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith('svt-tab-state-') || key.startsWith('svt-active-tab-')) {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            // 检查数据的时间戳（如果有的话）
            // 这里可以根据实际需求实现更复杂的过期逻辑
            // 暂时简单处理：如果是很久以前的数据，可能需要清理
          }
        } catch {
          // 如果数据格式有问题，直接删除
          localStorage.removeItem(key);
        }
      }
    });
    
    console.log('[TabStorage] 过期Tab状态清理完成');
  } catch {
    console.warn('[TabStorage] 清理过期Tab状态失败');
  }
}; 