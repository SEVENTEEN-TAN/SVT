import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { TabItem, TabManagerState, PageRefreshState } from '../../../shared/types/layout';
import { useTabStorage } from './useTabStorage';

interface UseTabManagerProps {
  getTabName: (path: string) => string;
}

// Tab管理Hook
export const useTabManager = ({ getTabName }: UseTabManagerProps): TabManagerState & PageRefreshState => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loadTabsFromStorage, saveTabsToStorage } = useTabStorage();
  
  // 防重复操作的ref
  const isOperatingRef = useRef(false);

  // Tab状态管理 - 从本地存储初始化
  const [activeTabKey, setActiveTabKey] = useState<string>(() => {
    const { activeTab } = loadTabsFromStorage();
    return activeTab;
  });
  const [tabList, setTabList] = useState<TabItem[]>(() => {
    const { tabs } = loadTabsFromStorage();
    return tabs;
  });

  // 页面刷新key，用于强制重渲染
  const [pageRefreshKey, setPageRefreshKey] = useState<number>(0);

  // 页面初次加载时同步路由和Tab状态
  useEffect(() => {
    const currentPath = location.pathname;
    const { activeTab } = loadTabsFromStorage();
    
    // 如果当前URL与保存的活跃Tab不一致，需要导航到保存的Tab
    if (currentPath !== '/login' && currentPath !== activeTab && activeTab !== '/') {
      navigate(activeTab, { replace: true });
    }
  }, [navigate]); // 只在初次加载时执行

  // 监听路由变化，自动添加Tab
  useEffect(() => {
    const currentPath = location.pathname;

    // 🔧 为所有路径添加Tab，包括无效路径
    // 这样无效路径会显示为菜单名称，但内容显示404
    if (currentPath !== '/login') {
      // 使用函数式更新，避免依赖addTab
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
          // 保存到本地存储
          saveTabsToStorage(newTabList, currentPath);
          return newTabList;
        } else {
          // Tab已存在，只需更新活跃状态
          saveTabsToStorage(prev, currentPath);
          return prev;
        }
      });

      // 只在activeTabKey与当前路径不一致时才更新，避免干扰加载状态
      setActiveTabKey(prev => {
        if (prev !== currentPath) {
          console.log('🔄 路由变化更新activeTabKey:', prev, '->', currentPath);
          return currentPath;
        }
        return prev;
      });
    }
  }, [location.pathname, getTabName, saveTabsToStorage]); // 只依赖必要的值

  // 刷新处理函数 - 简化版本，依赖React自然渲染
  const handleRefresh = useCallback((forceRefresh: boolean, isCurrentTab: boolean) => {
    if (forceRefresh || isCurrentTab) {
      console.log('🔄 开始页面刷新');
      // 只更新pageRefreshKey，让React自然处理渲染
      setPageRefreshKey(prev => prev + 1);

      // 重置滚动位置
      setTimeout(() => {
        const contentContainer = document.querySelector('div[style*="overflow: auto"]');
        if (contentContainer) {
          contentContainer.scrollTop = 0;
          contentContainer.scrollLeft = 0;
        }
      }, 0);
    }
  }, []);

  // 添加新Tab（简化版本，无数量限制）
  const addTab = useCallback((path: string, forceRefresh = false) => {
    const isCurrentTab = activeTabKey === path;

    // 先更新Tab列表
    setTabList(prev => {
      const existingTab = prev.find(tab => tab.key === path);
      if (!existingTab) {
        // 直接添加新Tab，无数量限制
        const newTab: TabItem = {
          key: path,
          label: getTabName(path),
          path: path,
          closable: path !== '/home', // 首页不可关闭
        };

        const newTabList = [...prev, newTab];
        // 保存到本地存储
        saveTabsToStorage(newTabList, path);
        return newTabList;
      } else {
        // Tab已存在，只需保存活跃Tab
        saveTabsToStorage(prev, path);
        return prev;
      }
    });

    // 设置活跃Tab
    setActiveTabKey(path);

    // 处理刷新
    handleRefresh(forceRefresh, isCurrentTab);

    // 导航到目标路径
    navigate(path);
  }, [getTabName, navigate, activeTabKey, handleRefresh, saveTabsToStorage]);

  // 关闭Tab
  const removeTab = useCallback((targetKey: string) => {
    // 防重复操作
    if (isOperatingRef.current) {
      return;
    }

    // 不能关闭首页
    if (targetKey === '/home') {
      return;
    }

    isOperatingRef.current = true;

    setTabList(prev => {
      // 不能关闭最后一个Tab
      if (prev.length <= 1) {
        isOperatingRef.current = false;
        return prev;
      }

      const newTabList = prev.filter(tab => tab.key !== targetKey);
      
      // 如果关闭的是当前激活的Tab，需要切换到其他Tab
      setActiveTabKey(currentActive => {
        if (currentActive === targetKey) {
          const newActiveTab = newTabList[newTabList.length - 1];
          // 保存到本地存储
          saveTabsToStorage(newTabList, newActiveTab.key);
          // 延迟导航，避免状态冲突
          setTimeout(() => {
            navigate(newActiveTab.path);
            isOperatingRef.current = false;
          }, 0);
          return newActiveTab.key;
        } else {
          // 保存到本地存储
          saveTabsToStorage(newTabList, currentActive);
        }
        setTimeout(() => {
          isOperatingRef.current = false;
        }, 0);
        return currentActive;
      });

      return newTabList;
    });
  }, [navigate, saveTabsToStorage]);

  // 切换Tab（简化版本，依赖Ant Design原生切换）
  const switchTab = useCallback((targetKey: string) => {
    console.log('🔄 切换Tab:', targetKey);

    setActiveTabKey(targetKey);
    saveTabsToStorage(tabList, targetKey);

    // 刷新页面内容
    handleRefresh(true, false);

    // 导航到目标路径
    navigate(targetKey);
  }, [navigate, tabList, saveTabsToStorage, handleRefresh]);

  // Tab右键菜单功能
  const refreshTab = useCallback((tabKey: string) => {
    // 强制刷新指定Tab
    setActiveTabKey(tabKey);

    // 保存活跃Tab到本地存储
    saveTabsToStorage(tabList, tabKey);

    // 处理刷新
    handleRefresh(true, false); // 右键刷新总是强制刷新

    // 导航到目标路径
    navigate(tabKey);
  }, [navigate, tabList, saveTabsToStorage, handleRefresh]);

  const closeLeftTabs = useCallback((tabKey: string) => {
    const currentIndex = tabList.findIndex(tab => tab.key === tabKey);
    if (currentIndex <= 0) return; // 没有左边的Tab或者是第一个Tab

    // 获取左边所有可关闭的Tab（不包括首页）
    const tabsToClose = tabList.slice(0, currentIndex).filter(tab => tab.closable && tab.key !== '/home');
    if (tabsToClose.length === 0) return; // 没有可关闭的Tab

    // 检查当前活跃的Tab是否在要关闭的Tab中
    const isCurrentTabBeingClosed = tabsToClose.some(tab => tab.key === activeTabKey);

    // 批量更新tabList
    setTabList(prev => {
      const newTabList = prev.filter(tab => !tabsToClose.some(closeTab => closeTab.key === tab.key));

      // 如果当前活跃的Tab被关闭了，需要切换到合适的Tab
      if (isCurrentTabBeingClosed) {
        // 切换到指定的Tab（因为它在右边，没有被关闭）
        setActiveTabKey(tabKey);
        saveTabsToStorage(newTabList, tabKey);
        navigate(tabKey);
      } else {
        // 保存到本地存储
        saveTabsToStorage(newTabList, activeTabKey);
      }

      return newTabList;
    });
  }, [tabList, activeTabKey, navigate, saveTabsToStorage]);

  const closeRightTabs = useCallback((tabKey: string) => {
    const currentIndex = tabList.findIndex(tab => tab.key === tabKey);
    if (currentIndex === -1 || currentIndex === tabList.length - 1) return; // 没有右边的Tab

    // 获取右边所有可关闭的Tab（不包括首页）
    const tabsToClose = tabList.slice(currentIndex + 1).filter(tab => tab.closable && tab.key !== '/home');
    if (tabsToClose.length === 0) return; // 没有可关闭的Tab

    // 检查当前活跃的Tab是否在要关闭的Tab中
    const isCurrentTabBeingClosed = tabsToClose.some(tab => tab.key === activeTabKey);

    // 批量更新tabList
    setTabList(prev => {
      const newTabList = prev.filter(tab => !tabsToClose.some(closeTab => closeTab.key === tab.key));

      // 如果当前活跃的Tab被关闭了，需要切换到合适的Tab
      if (isCurrentTabBeingClosed) {
        // 切换到指定的Tab（因为它在左边，没有被关闭）
        setActiveTabKey(tabKey);
        saveTabsToStorage(newTabList, tabKey);
        navigate(tabKey);
      } else {
        // 保存到本地存储
        saveTabsToStorage(newTabList, activeTabKey);
      }

      return newTabList;
    });
  }, [tabList, activeTabKey, navigate, saveTabsToStorage]);

  // 关闭其他Tab（保留当前Tab和仪表盘）
  const closeOtherTabs = useCallback((tabKey: string) => {
    setTabList(prev => {
      const newTabList = prev.filter(tab =>
        tab.key === tabKey ||
        tab.key === '/home' ||
        !tab.closable
      );
      
      // 保存到本地存储
      const finalActiveTab = activeTabKey !== tabKey && activeTabKey !== '/home' ? tabKey : activeTabKey;
      saveTabsToStorage(newTabList, finalActiveTab);
      
      return newTabList;
    });

    // 如果当前活跃Tab被保留，不需要切换
    if (activeTabKey !== tabKey && activeTabKey !== '/home') {
      setActiveTabKey(tabKey);
      navigate(tabKey);
    }
  }, [activeTabKey, navigate, saveTabsToStorage]);

  return {
    // Tab管理状态
    activeTabKey,
    tabList,
    addTab,
    removeTab,
    switchTab,
    refreshTab,
    closeLeftTabs,
    closeRightTabs,
    closeOtherTabs,

    // 页面刷新状态
    pageRefreshKey,
    setPageRefreshKey,
  };
}; 