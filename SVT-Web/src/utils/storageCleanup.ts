/**
 * localStorage缓存清理工具
 */

/**
 * 清理遗留的localStorage数据
 */
export const cleanupLegacyStorage = () => {
  // 清理已知的遗留数据
  const legacyKeys = [
    'isWhitelist',
    'hasSelectedOrgRole', // 现在通过Zustand persist管理
    'token', // 现在通过Zustand persist管理
    'user', // 现在通过Zustand persist管理
    'userDetails', // 现在数据整合到auth-storage.user中
  ];

  legacyKeys.forEach(key => {
    if (localStorage.getItem(key) !== null) {
      console.log(`🧹 清理遗留缓存: ${key}`);
      localStorage.removeItem(key);
    }
  });
};

/**
 * 获取当前localStorage的所有缓存项（开发调试用）
 */
export const getStorageInfo = () => {
  const storage: Record<string, unknown> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      try {
        const value = localStorage.getItem(key);
        storage[key] = value ? JSON.parse(value) : value;
      } catch {
        storage[key] = localStorage.getItem(key);
      }
    }
  }
  return storage;
};

/**
 * 验证缓存完整性
 */
export const validateStorageIntegrity = () => {
  const authStorage = localStorage.getItem('auth-storage');
  const userDetails = localStorage.getItem('userDetails');
  
  if (authStorage) {
    try {
      const parsed = JSON.parse(authStorage);
      const { state } = parsed;
      
      if (state?.isAuthenticated && state?.hasSelectedOrgRole && !userDetails) {
        console.warn('⚠️ 缓存完整性检查失败: 认证状态为已选择但缺少userDetails');
        return false;
      }
      
      if (state?.user?.id === null) {
        console.warn('⚠️ 缓存完整性检查失败: user.id为null');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('❌ auth-storage解析失败:', error);
      return false;
    }
  }
  
  return true;
}; 