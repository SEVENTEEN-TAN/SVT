import { useCallback } from 'react';
import { tabStorage } from '@/utils/localStorageManager';
import type { TabItem } from '@/components/Layout/shared/types/layout';

// Tab存储管理Hook
export const useTabStorage = () => {
  // 从本地存储恢复Tab状态 - 简化版本
  const loadTabsFromStorage = useCallback((): { tabs: TabItem[], activeTab: string } => {
    const result = tabStorage.load();
    
    // 确保返回正确的类型和仪表盘始终存在
    const tabs = (result.tabs as TabItem[]) || [];
    const homeIndex = tabs.findIndex(tab => tab.key === '/home');
    if (homeIndex >= 0) {
      tabs[homeIndex] = { key: '/home', label: '首页', path: '/home', closable: false };
    } else {
      tabs.unshift({ key: '/home', label: '首页', path: '/home', closable: false });
    }
    
    return {
      tabs,
      activeTab: result.activeTab
    };
  }, []);

  // 保存Tab状态到本地存储 - 简化版本
  const saveTabsToStorage = useCallback((tabs: TabItem[], activeTab: string) => {
    tabStorage.save(tabs, activeTab);
  }, []);

  return {
    loadTabsFromStorage,
    saveTabsToStorage,
  };
}; 