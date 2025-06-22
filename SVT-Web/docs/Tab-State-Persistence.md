# Tab状态持久化系统设计文档

## 概述

Tab状态持久化系统是SVT前端架构的重要组成部分，实现了类浏览器的多页面工作体验，通过localStorage技术确保用户在浏览器刷新后能完整恢复工作状态。

## 设计理念

### 用户体验优先
- **无缝衔接**: 浏览器刷新后完整恢复用户工作状态
- **零感知**: 状态保存和恢复对用户完全透明
- **容错性**: 数据异常时优雅降级，不影响系统使用

### 简化架构
- **单用户假设**: 基于"一台电脑一个用户"的合理假设
- **统一管理**: 所有localStorage操作通过统一API管理
- **自动清理**: 关键时机自动清理过期和无效数据

## 核心架构

### 数据存储结构
```typescript
// localStorage存储键定义
export const STORAGE_KEYS = {
  AUTH_STORAGE: 'auth-storage',      // Zustand自动管理的认证状态
  TAB_STATE: 'svt-tab-state',        // Tab列表状态
  ACTIVE_TAB: 'svt-active-tab',      // 当前活跃Tab
} as const;

// Tab数据结构
interface TabItem {
  key: string;           // Tab唯一标识，通常是路径
  label: string;         // Tab显示名称
  path: string;          // 路由路径
  closable: boolean;     // 是否可关闭
}

// 存储数据结构
interface TabStorageData {
  tabs: TabItem[];       // Tab列表
  activeTab: string;     // 当前活跃Tab的key
}
```

### 统一管理API
```typescript
// localStorageManager.ts - 核心管理工具
export const tabStorage = {
  // 保存Tab状态
  save: (tabs: unknown[], activeTab: string): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.TAB_STATE, JSON.stringify(tabs));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, activeTab);
      console.log('[TabStorage] Tab状态已保存');
    } catch (error) {
      console.warn('[TabStorage] 保存Tab状态失败:', error);
    }
  },
  
  // 加载Tab状态
  load: (): { tabs: unknown[], activeTab: string } => {
    try {
      const savedTabs = localStorage.getItem(STORAGE_KEYS.TAB_STATE);
      const savedActiveTab = localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB);
      
      if (savedTabs && savedActiveTab) {
        const tabs = JSON.parse(savedTabs);
        return { tabs, activeTab: savedActiveTab };
      }
    } catch (error) {
      console.warn('[TabStorage] 加载Tab状态失败:', error);
    }
    
    // 默认状态：只有仪表盘
    return {
      tabs: [{ 
        key: '/dashboard', 
        label: '仪表盘', 
        path: '/dashboard', 
        closable: false 
      }],
      activeTab: '/dashboard'
    };
  },
  
  // 清理Tab状态
  clear: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEYS.TAB_STATE);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_TAB);
      console.log('[TabStorage] Tab状态已清理');
    } catch (error) {
      console.warn('[TabStorage] 清理Tab状态失败:', error);
    }
  }
};
```

## 状态管理集成

### BasicLayout组件集成
```typescript
// BasicLayout.tsx - 核心状态管理
const BasicLayout: React.FC = () => {
  const [tabList, setTabList] = useState<TabItem[]>([]);
  const [activeTabKey, setActiveTabKey] = useState<string>('/dashboard');

  // 页面初始化时恢复Tab状态
  useEffect(() => {
    const { tabs, activeTab } = tabStorage.load();
    
    // 确保仪表盘Tab存在且属性正确
    const dashboardTab = { 
      key: '/dashboard', 
      label: '仪表盘', 
      path: '/dashboard', 
      closable: false 
    };
    
    let finalTabs = tabs as TabItem[];
    const hasDashboard = finalTabs.some(tab => tab.key === '/dashboard');
    
    if (!hasDashboard) {
      finalTabs = [dashboardTab, ...finalTabs];
    } else {
      // 确保仪表盘Tab属性正确
      finalTabs = finalTabs.map(tab => 
        tab.key === '/dashboard' ? dashboardTab : tab
      );
    }
    
    setTabList(finalTabs);
    setActiveTabKey(activeTab);
    
    // 同步路由到当前活跃Tab
    navigate(activeTab);
    
    console.log('[TabStorage] Tab状态已恢复:', { tabs: finalTabs, activeTab });
  }, [navigate]);

  // 保存Tab状态到localStorage
  const saveTabsToStorage = useCallback((tabs: TabItem[], activeTab: string) => {
    tabStorage.save(tabs, activeTab);
  }, []);

  // 所有Tab操作都自动保存状态
  const addTab = useCallback((path: string, forceRefresh = false) => {
    // ... Tab添加逻辑
    
    // 保存状态
    saveTabsToStorage(newTabList, targetKey);
  }, [saveTabsToStorage]);

  const removeTab = useCallback((targetKey: string) => {
    // ... Tab移除逻辑
    
    // 保存状态
    saveTabsToStorage(newTabList, newActiveKey);
  }, [saveTabsToStorage]);

  const switchTab = useCallback((targetKey: string) => {
    // ... Tab切换逻辑
    
    // 保存状态
    saveTabsToStorage(tabList, targetKey);
  }, [tabList, saveTabsToStorage]);
};
```

## 数据清理机制

### 清理时机
1. **用户登录时**: 清理所有用户相关数据，重新开始
2. **用户登出时**: 清理所有用户相关数据
3. **Token失效时**: 清理所有用户相关数据
4. **应用启动时**: 清理遗留的无效数据

### 统一清理函数
```typescript
// localStorageManager.ts - 统一清理机制
export const clearAllUserData = (): void => {
  try {
    // 清理Tab状态
    tabStorage.clear();
    
    // 清理遗留的用户ID绑定数据（兼容旧版本）
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('svt-tab-state-') || 
          key.startsWith('svt-active-tab-') ||
          key === 'expiryDate' ||
          key === 'user') {
        localStorage.removeItem(key);
      }
    });
    
    console.log('[LocalStorage] 所有用户数据已清理');
  } catch (error) {
    console.warn('[LocalStorage] 清理用户数据失败:', error);
  }
};
```

## 最佳实践

### 1. 数据结构设计
- **保持简洁**: 只存储必要的Tab信息
- **类型安全**: 使用TypeScript确保数据类型正确
- **向后兼容**: 新版本要能处理旧版本的数据

### 2. 性能优化
- **防抖保存**: 避免频繁的localStorage写入
- **批量操作**: 多个Tab操作合并为一次保存
- **内存缓存**: 减少localStorage读取次数

### 3. 错误处理
- **优雅降级**: 数据异常时回退到默认状态
- **详细日志**: 记录操作过程便于调试
- **用户友好**: 错误不影响用户正常使用

## 版本历史

- **v1.0.0** (2025-06-22): 初始版本，基础Tab状态持久化
- **v1.1.0** (计划): 增加Tab分组功能
- **v1.2.0** (计划): 支持Tab状态的云端同步

---

**文档维护**: 前端架构团队  
**最后更新**: 2025-06-22  
**版本**: v1.0.0 