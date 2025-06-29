/**
 * 布局状态管理提供者
 * 
 * 职责：
 * - 统一管理所有布局相关状态
 * - 提供布局操作方法
 * - 处理状态持久化
 * 
 * @author SVT Team
 * @since 2025-06-29
 * @version 3.0.0
 */

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/stores/useAuth';
import type { MenuItem } from '@/types/menu';
import type { PathMaps, TabItem } from '../shared/types/layout';
import { generatePathMaps, getTabName as getTabNameUtil } from '../shared/utils/layoutUtils';
import { useTabStorage } from '../modules/TabSystem/hooks/useTabStorage';

// 布局状态接口
interface LayoutState {
  // 侧边栏状态
  sidebarCollapsed: boolean;
  
  // 标签页状态
  activeTabKey: string;
  tabList: TabItem[];
  
  // 路径映射
  pathMaps: PathMaps;
  
  // 页面刷新状态
  pageRefreshKey: number;
  isPageRefreshing: boolean;
  endPageRefresh: () => void;
  
  // 标签页操作
  addTab: (path: string, forceRefresh?: boolean) => void;
  removeTab: (key: string) => void;
  switchTab: (key: string) => void;
  refreshTab: (key: string) => void;
  closeLeftTabs: (currentKey: string) => void;
  closeRightTabs: (currentKey: string) => void;
  closeOtherTabs: (currentKey: string) => void;
  getTabName: (path: string) => string;
  
  // 侧边栏操作
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

// 创建Context
const LayoutContext = createContext<LayoutState | null>(null);

// Hook for using layout context
export const useLayout = (): LayoutState => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};

// LayoutProvider组件
export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { loadTabsFromStorage, saveTabsToStorage } = useTabStorage();

  // 防重复操作的ref
  const isOperatingRef = useRef(false);
  
  // 标记是否正在进行Tab操作（关闭、切换等），避免路由监听干扰
  const isTabOperatingRef = useRef(false);

  // 侧边栏状态
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // 标签页状态
  const [activeTabKey, setActiveTabKey] = useState<string>('/home');
  const [tabList, setTabList] = useState<TabItem[]>([
    { key: '/home', label: '首页', path: '/home', closable: false }
  ]);

  // 页面刷新状态
  const [pageRefreshKey, setPageRefreshKey] = useState<number>(0);
  const [isPageRefreshing, setIsPageRefreshing] = useState<boolean>(false);

  // 路径映射 - 基于用户菜单动态生成
  const pathMaps = useMemo(() => {
    return generatePathMaps(currentUser?.menuTrees as MenuItem[] || []);
  }, [currentUser?.menuTrees]);

  // 手动结束页面刷新
  const endPageRefresh = useCallback(() => {
    setIsPageRefreshing(false);
  }, []);

  // 页面刷新处理
  const handleRefresh = useCallback((showLoading: boolean = false) => {
    if (showLoading) {
      setIsPageRefreshing(true);
      setPageRefreshKey(prev => prev + 1);

      setTimeout(() => {
        setIsPageRefreshing(false);
      }, 500);
    } else {
      setPageRefreshKey(prev => prev + 1);
    }
  }, []);

  // 获取标签页名称
  const getTabName = useCallback((path: string): string => {
    return getTabNameUtil(path, pathMaps, currentUser?.menuTrees as MenuItem[]);
  }, [pathMaps, currentUser?.menuTrees]);

  // 初始化标签页状态
  useEffect(() => {
    const { tabs: savedTabList, activeTab: savedActiveTabKey } = loadTabsFromStorage();
    if (savedTabList && savedTabList.length > 0) {
      setTabList(savedTabList);
      setActiveTabKey(savedActiveTabKey);
    }
  }, [loadTabsFromStorage]);

  // 添加标签页
  const addTab = useCallback((path: string, forceRefresh: boolean = false) => {
    // 设置Tab操作标志，防止路由监听干扰
    isTabOperatingRef.current = true;

    const isCurrentTab = activeTabKey === path;
    
    if (forceRefresh) {
      handleRefresh(true);
    }

    setTabList(prev => {
      const existingTab = prev.find(tab => tab.key === path);
      if (!existingTab) {
        const newTab: TabItem = {
          key: path,
          label: getTabName(path),
          path: path,
          closable: path !== '/home',
        };
        const newTabList = [...prev, newTab];
        saveTabsToStorage(newTabList, path);
        return newTabList;
      } else {
        saveTabsToStorage(prev, path);
        return prev;
      }
    });

    if (!isCurrentTab) {
      setActiveTabKey(path);
      navigate(path);
    }

    // 延迟重置标志
    setTimeout(() => {
      isTabOperatingRef.current = false;
    }, 100);
  }, [activeTabKey, getTabName, navigate, saveTabsToStorage, handleRefresh]);

  // 切换标签页 (保留个性化逻辑)
  const switchTab = useCallback((targetKey: string) => {
    // 防止重复操作
    if (isOperatingRef.current) {
      return;
    }

    // 设置操作标志，防止useEffect干扰
    isOperatingRef.current = true;
    isTabOperatingRef.current = true;

    // 先设置loading状态
    handleRefresh(true);

    // 延迟执行状态更新和导航，确保loading状态先显示
    setTimeout(() => {
      // 更新活跃Tab
      setActiveTabKey(targetKey);

      // 保存活跃Tab到本地存储
      saveTabsToStorage(tabList, targetKey);

      // 导航到目标路径
      navigate(targetKey);
      
      // 延迟重置Tab操作标志
      setTimeout(() => {
        isTabOperatingRef.current = false;
      }, 100);
    }, 50); // 50ms延迟，确保loading状态先渲染
  }, [tabList, saveTabsToStorage, handleRefresh, navigate]);

  // 移除标签页
  const removeTab = useCallback((targetKey: string) => {
    if (targetKey === '/home') return; // 首页不可关闭

    // 设置Tab操作标志，防止路由监听干扰
    isTabOperatingRef.current = true;

    // 先计算新的状态
    const targetIndex = tabList.findIndex(tab => tab.key === targetKey);
    if (targetIndex === -1) {
      isTabOperatingRef.current = false;
      return;
    }

    const newTabList = tabList.filter(tab => tab.key !== targetKey);
    
    // 如果关闭的是当前活跃标签页，需要切换到其他标签页
    if (targetKey === activeTabKey) {
      const newActiveKey = targetIndex > 0 
        ? newTabList[targetIndex - 1]?.key || '/home'
        : newTabList[0]?.key || '/home';
      
      // 同步更新所有状态
      setTabList(newTabList);
      setActiveTabKey(newActiveKey);
      navigate(newActiveKey);
      saveTabsToStorage(newTabList, newActiveKey);
    } else {
      // 只更新tabList
      setTabList(newTabList);
      saveTabsToStorage(newTabList, activeTabKey);
    }

    // 延迟重置标志，确保路由变化完成
    setTimeout(() => {
      isTabOperatingRef.current = false;
    }, 100);
  }, [tabList, activeTabKey, navigate, saveTabsToStorage]);

  // 刷新标签页
  const refreshTab = useCallback((key: string) => {
    handleRefresh(true);
  }, [handleRefresh]);

  // 关闭左侧标签页 (保留个性化逻辑)
  const closeLeftTabs = useCallback((currentKey: string) => {
    const currentIndex = tabList.findIndex(tab => tab.key === currentKey);
    if (currentIndex <= 0) return; // 没有左边的Tab
    
    // 获取左边所有可关闭的Tab（不包括首页）
    const tabsToClose = tabList.slice(0, currentIndex).filter(tab => tab.closable && tab.key !== '/home');
    if (tabsToClose.length === 0) return; // 没有可关闭的Tab
    
    // 设置Tab操作标志
    isTabOperatingRef.current = true;
    
    // 检查当前活跃的Tab是否在要关闭的Tab中
    const isCurrentTabBeingClosed = tabsToClose.some(tab => tab.key === activeTabKey);
    
    // 计算新的tabList
    const newTabList = tabList.filter(tab => !tabsToClose.some(closeTab => closeTab.key === tab.key));
    
    // 同步更新所有状态
    setTabList(newTabList);
    
    if (isCurrentTabBeingClosed) {
      // 切换到指定的Tab（因为它在右边，没有被关闭）
      setActiveTabKey(currentKey);
      saveTabsToStorage(newTabList, currentKey);
      navigate(currentKey);
    } else {
      // 保存到本地存储
      saveTabsToStorage(newTabList, activeTabKey);
    }
    
    // 延迟重置标志
    setTimeout(() => {
      isTabOperatingRef.current = false;
    }, 100);
  }, [tabList, activeTabKey, navigate, saveTabsToStorage]);

  // 关闭右侧标签页 (保留个性化逻辑)
  const closeRightTabs = useCallback((currentKey: string) => {
    const currentIndex = tabList.findIndex(tab => tab.key === currentKey);
    if (currentIndex === -1 || currentIndex === tabList.length - 1) return; // 没有右边的Tab

    // 获取右边所有可关闭的Tab（不包括首页）
    const tabsToClose = tabList.slice(currentIndex + 1).filter(tab => tab.closable && tab.key !== '/home');
    if (tabsToClose.length === 0) return; // 没有可关闭的Tab

    // 设置Tab操作标志
    isTabOperatingRef.current = true;

    // 检查当前活跃的Tab是否在要关闭的Tab中
    const isCurrentTabBeingClosed = tabsToClose.some(tab => tab.key === activeTabKey);

    // 计算新的tabList
    const newTabList = tabList.filter(tab => !tabsToClose.some(closeTab => closeTab.key === tab.key));

    // 同步更新所有状态
    setTabList(newTabList);

    if (isCurrentTabBeingClosed) {
      // 切换到指定的Tab（因为它在左边，没有被关闭）
      setActiveTabKey(currentKey);
      saveTabsToStorage(newTabList, currentKey);
      navigate(currentKey);
    } else {
      // 保存到本地存储
      saveTabsToStorage(newTabList, activeTabKey);
    }
    
    // 延迟重置标志
    setTimeout(() => {
      isTabOperatingRef.current = false;
    }, 100);
  }, [tabList, activeTabKey, navigate, saveTabsToStorage]);

  // 关闭其他标签页 (保留个性化逻辑)
  const closeOtherTabs = useCallback((currentKey: string) => {
    // 设置Tab操作标志
    isTabOperatingRef.current = true;
    
    // 计算新的tabList
    const newTabList = tabList.filter(tab =>
      tab.key === currentKey ||
      tab.key === '/home' ||
      !tab.closable
    );

    // 同步更新所有状态
    setTabList(newTabList);

    // 如果当前活跃Tab被保留，不需要切换
    if (activeTabKey !== currentKey && activeTabKey !== '/home') {
      setActiveTabKey(currentKey);
      saveTabsToStorage(newTabList, currentKey);
      navigate(currentKey);
    } else {
      saveTabsToStorage(newTabList, activeTabKey);
    }
    
    // 延迟重置标志
    setTimeout(() => {
      isTabOperatingRef.current = false;
    }, 100);
  }, [tabList, activeTabKey, navigate, saveTabsToStorage]);

  // 侧边栏操作
  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  const setSidebarCollapsedCallback = useCallback((collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  }, []);

  // 监听路由变化，自动添加标签页
  useEffect(() => {
    const currentPath = location.pathname;
    
    // 如果正在进行Tab操作，跳过路由监听，避免干扰
    if (isTabOperatingRef.current) {
      return;
    }
    
    if (currentPath !== '/login' && currentPath !== activeTabKey) {
      // 只更新标签页列表和活跃状态，不调用navigate避免循环
      setTabList(prev => {
        const existingTab = prev.find(tab => tab.key === currentPath);
        if (!existingTab) {
          const newTab: TabItem = {
            key: currentPath,
            label: getTabName(currentPath),
            path: currentPath,
            closable: currentPath !== '/home',
          };
          const newTabList = [...prev, newTab];
          saveTabsToStorage(newTabList, currentPath);
          return newTabList;
        } else {
          saveTabsToStorage(prev, currentPath);
          return prev;
        }
      });

      // 设置活跃标签页
      setActiveTabKey(currentPath);
    }
  }, [location.pathname, activeTabKey, getTabName, saveTabsToStorage]);

  // 添加动态解锁 effect —— 页面刷新结束后立即解锁
  useEffect(() => {
    if (!isPageRefreshing && isOperatingRef.current) {
      isOperatingRef.current = false;
    }
  }, [isPageRefreshing]);

  // 构建Context值
  const contextValue = useMemo(() => ({
    // 状态
    sidebarCollapsed,
    activeTabKey,
    tabList,
    pathMaps,
    pageRefreshKey,
    isPageRefreshing,
    
    // 操作
    toggleSidebar,
    setSidebarCollapsed: setSidebarCollapsedCallback,
    addTab,
    removeTab,
    switchTab,
    refreshTab,
    closeLeftTabs,
    closeRightTabs,
    closeOtherTabs,
    getTabName,
    endPageRefresh,
  }), [
    sidebarCollapsed,
    activeTabKey,
    tabList,
    pathMaps,
    pageRefreshKey,
    isPageRefreshing,
    toggleSidebar,
    setSidebarCollapsedCallback,
    addTab,
    removeTab,
    switchTab,
    refreshTab,
    closeLeftTabs,
    closeRightTabs,
    closeOtherTabs,
    getTabName,
    endPageRefresh,
  ]);

  return (
    <LayoutContext.Provider value={contextValue}>
      {children}
    </LayoutContext.Provider>
  );
};
