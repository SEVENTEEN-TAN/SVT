/**
 * 布局结构组件
 * 
 * 职责：
 * - 纯展示逻辑，无业务状态
 * - 从Context获取所有状态
 * - 渲染布局结构
 * 
 * @author SVT Team
 * @since 2025-06-29
 * @version 3.0.0
 */

import React, { useMemo } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/stores/useAuth';
import { useLayout } from './LayoutProvider';
import Sidebar from '@/components/Layout/modules/Sidebar';
import Header from '@/components/Layout/modules/Header';
import TabSystem from '@/components/Layout/modules/TabSystem';
import Footer from '@/components/Layout/Footer';
import PageRefreshLoading from '@/components/Loading/PageRefreshLoading';
import { LAYOUT_CONSTANTS } from '@/components/Layout/shared/utils/layoutStyles';
import type { MenuItem } from '@/components/Layout/shared/types/layout';

/**
 * 样式计算Hook
 * 优化性能，避免每次渲染都重新计算样式
 */
const useLayoutStyles = (sidebarCollapsed: boolean) => {
  return useMemo(() => ({
    container: {
      minHeight: '100vh',
      background: '#f0f2f5'
    },
    content: {
      marginLeft: sidebarCollapsed ? LAYOUT_CONSTANTS.SIDER_WIDTH_COLLAPSED : LAYOUT_CONSTANTS.SIDER_WIDTH_EXPANDED,
      transition: `margin-left ${LAYOUT_CONSTANTS.TRANSITION.FAST}`,
      display: 'flex',
      flexDirection: 'column' as const,
      height: '100vh',
      background: '#f0f2f5'
    },
    pageContent: {
      flex: 1,
      position: 'relative' as const,
      overflow: 'hidden',
      marginTop: `${LAYOUT_CONSTANTS.HEADER_HEIGHT + LAYOUT_CONSTANTS.TABS_HEIGHT}px`,
      minHeight: 0
    }
  }), [sidebarCollapsed]);
};

/**
 * 布局结构组件
 */
const LayoutStructure: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    sidebarCollapsed,
    activeTabKey,
    tabList,
    pathMaps,
    pageRefreshKey,
    isPageRefreshing,
    addTab,
    switchTab,
    removeTab,
    refreshTab,
    closeLeftTabs,
    closeRightTabs,
    closeOtherTabs,
    getTabName,
    toggleSidebar,
    endPageRefresh
  } = useLayout();

  // 计算样式
  const styles = useLayoutStyles(sidebarCollapsed);

  // 菜单点击处理
  const handleMenuClick = (key: string) => {
    addTab(key, false); // 正常切换，不强制刷新
  };

  // 侧边栏Props
  const sidebarProps = {
    collapsed: sidebarCollapsed,
    menuTrees: currentUser?.menuTrees as MenuItem[],
    activeKey: activeTabKey,
    onMenuClick: handleMenuClick
  };

  // 头部Props
  const headerProps = {
    collapsed: sidebarCollapsed,
    onToggleCollapsed: toggleSidebar,
    pathMaps: pathMaps
  };

  // Tab系统Props
  const tabSystemProps = {
    collapsed: sidebarCollapsed,
    getTabName: getTabName,
    tabManager: {
      activeTabKey,
      tabList,
      addTab,
      switchTab,
      removeTab,
      refreshTab,
      closeLeftTabs,
      closeRightTabs,
      closeOtherTabs,
      pageRefreshKey,
      isPageRefreshing,
      setPageRefreshKey: () => {}, // 空实现，因为状态由LayoutProvider管理
      setIsPageRefreshing: () => {}, // 空实现，因为状态由LayoutProvider管理
      endPageRefresh
    }
  };

  return (
    <Layout style={styles.container}>
      {/* 侧边栏模块 */}
      <Sidebar {...sidebarProps} />

      <Layout style={styles.content}>
        {/* 头部模块 - fixed定位，不占用flex空间 */}
        <Header {...headerProps} />

        {/* Tab系统模块 - fixed定位，不占用flex空间 */}
        <TabSystem {...tabSystemProps} />

        {/* 页面内容 - 需要考虑Header和TabSystem的高度 */}
        <div 
          key={pageRefreshKey} 
          style={styles.pageContent}
        >
          {/* 页面加载状态覆盖层 */}
          <PageRefreshLoading
            visible={isPageRefreshing}
            text="页面刷新中..."
            size="large"
          />
          
          {/* 直接渲染页面组件 */}
          <Outlet />
        </div>

        {/* 页脚 */}
        <Footer />
      </Layout>
    </Layout>
  );
};

export default LayoutStructure;
