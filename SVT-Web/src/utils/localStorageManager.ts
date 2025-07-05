/**
 * 简化的localStorage管理工具
 * 基于一台电脑只存储一个用户信息的前提
 */

// localStorage键名常量
export const STORAGE_KEYS = {
  // Zustand persist自动管理的键
  AUTH_STORAGE: 'auth-storage',
  
  // 手动管理的键
  EXPIRY_DATE: 'expiryDate',
  TAB_STATE: 'svt-tab-state',      // 简化：不再绑定用户ID
  ACTIVE_TAB: 'svt-active-tab',    // 简化：不再绑定用户ID
  
  // 兼容旧版本的键
  USER: 'user',
  TOKEN: 'token',
  USER_DETAILS: 'userDetails',
} as const;

/**
 * 用户登录时的localStorage初始化
 * 清理所有旧数据，为新用户准备干净的环境
 */
export const initializeStorageOnLogin = (): void => {
  try {
    // 清理所有用户相关数据
    clearAllUserData();
    
    console.log('[LocalStorage] 登录时存储初始化完成');
  } catch (error) {
    console.warn('[LocalStorage] 登录时存储初始化失败:', error);
  }
};

/**
 * 用户登出时的localStorage清理
 * 清理所有用户相关数据
 */
export const clearStorageOnLogout = (): void => {
  try {
    clearAllUserData();
    console.log('[LocalStorage] 登出时存储清理完成');
  } catch (error) {
    console.warn('[LocalStorage] 登出时存储清理失败:', error);
  }
};

/**
 * Token失效时的localStorage清理
 */
export const clearStorageOnTokenExpired = (): void => {
  try {
    clearAllUserData();
    console.log('[LocalStorage] Token失效时存储清理完成');
  } catch (error) {
    console.warn('[LocalStorage] Token失效时存储清理失败:', error);
  }
};

/**
 * 清理所有用户相关数据
 * 统一的清理逻辑
 */
const clearAllUserData = (): void => {
  console.log('🧹 [JWT智能续期测试] 开始清理所有用户相关数据');
  
  // 清理手动管理的数据
  localStorage.removeItem(STORAGE_KEYS.EXPIRY_DATE);
  localStorage.removeItem(STORAGE_KEYS.TAB_STATE);
  localStorage.removeItem(STORAGE_KEYS.ACTIVE_TAB);
  console.log('🧹 [JWT智能续期测试] 手动管理的数据已清理');
  
  // 清理兼容旧版本的数据
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER_DETAILS);
  console.log('🧹 [JWT智能续期测试] 兼容旧版本的数据已清理');
  
  // 🔧 关键修复：清理所有Zustand persist存储
  localStorage.removeItem('session-storage'); // 机构角色选择状态
  localStorage.removeItem('user-storage');    // 用户详情状态
  // 注意：auth-storage 由authStore自己管理，不在这里清理
  console.log('🧹 [JWT智能续期测试] Zustand persist存储已清理');
  
  // 清理其他可能的遗留数据
  cleanupLegacyStorage();
  
  console.log('🎯 [JWT智能续期测试] 所有用户相关数据清理完成');
};

/**
 * 清理遗留的localStorage数据
 */
export const cleanupLegacyStorage = (): void => {
  const legacyKeys = [
    'refreshToken',
    'loginTime',
    'lastActivity',
    // 清理旧的用户绑定Tab状态（如果存在）
  ];

  try {
    // 清理固定的遗留键
    legacyKeys.forEach(key => {
      if (localStorage.getItem(key) !== null) {
        localStorage.removeItem(key);
        console.log(`[LocalStorage] 清理遗留数据: ${key}`);
      }
    });
    
    // 清理所有旧的用户绑定Tab状态（svt-tab-state-xxx 格式）
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('svt-tab-state-') || key.startsWith('svt-active-tab-')) {
        localStorage.removeItem(key);
        console.log(`[LocalStorage] 清理旧的用户绑定数据: ${key}`);
      }
    });
  } catch (error) {
    console.warn('[LocalStorage] 清理遗留数据失败:', error);
  }
};

/**
 * Tab状态管理 - 简化版本
 */
export const tabStorage = {
  // 保存Tab状态
  save: (tabs: unknown[], activeTab: string): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.TAB_STATE, JSON.stringify(tabs));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, activeTab);
    } catch (error) {
      console.warn('[LocalStorage] 保存Tab状态失败:', error);
    }
  },
  
  // 加载Tab状态
  load: (): { tabs: unknown[], activeTab: string } => {
    try {
      const savedTabs = localStorage.getItem(STORAGE_KEYS.TAB_STATE);
      const savedActiveTab = localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB);
      
      if (savedTabs && savedActiveTab) {
        return {
          tabs: JSON.parse(savedTabs),
          activeTab: savedActiveTab
        };
      }
    } catch (error) {
      console.warn('[LocalStorage] 加载Tab状态失败:', error);
    }
    
    // 返回默认状态
    return {
        tabs: [{ key: '/home', label: '首页', path: '/home', closable: false }],
  activeTab: '/home'
    };
  },
  
  // 清理Tab状态
  clear: (): void => {
    localStorage.removeItem(STORAGE_KEYS.TAB_STATE);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_TAB);
  }
};

/**
 * 获取当前localStorage的所有数据（调试用）
 */
export const debugLocalStorage = (): Record<string, string | null> => {
  const storage: Record<string, string | null> = {};
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        storage[key] = localStorage.getItem(key);
      }
    }
  } catch (error) {
    console.warn('[LocalStorage] 获取调试信息失败:', error);
  }
  
  return storage;
};

/**
 * 检查localStorage是否可用
 */
export const isLocalStorageAvailable = (): boolean => {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, 'test');
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}; 