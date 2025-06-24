import React from 'react';
import { Layout, Spin, Typography } from 'antd';
import { useUserStatus } from '@/hooks/useUserStatus';
import { useAuthStore } from '@/stores/authStore';
import Sidebar from './modules/Sidebar';
import Header from './modules/Header';
import TabSystem from './modules/TabSystem';
import ContentArea from './modules/ContentArea';
import { useSidebarState } from './modules/Sidebar/hooks/useSidebarState';
import { usePathMapping } from './shared/hooks/usePathMapping';
import { useTabManager } from './modules/TabSystem/hooks/useTabManager';
import { STYLES } from './shared/utils/layoutUtils';
import type { MenuItem } from './shared/types/layout';

const { Text } = Typography;

const BasicLayout: React.FC = () => {
  const { user } = useAuthStore();
  const { loading } = useUserStatus();
  
  // 使用各模块的Hook
  const sidebarState = useSidebarState();
  const pathMappingState = usePathMapping(user?.menuTrees as MenuItem[]);
  const tabManager = useTabManager({ getTabName: pathMappingState.getTabName });

  // 菜单点击处理
  const handleMenuClick = (key: string) => {
    // 添加Tab并导航
    tabManager.addTab(key, true); // 强制刷新
  };

  // 用户状态验证加载中
  if (loading) {
    return (
      <div style={STYLES.LOADING.overlay}>
        <Spin size="large" />
        <Text style={STYLES.LOADING.text}>正在验证用户状态...</Text>
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
             {/* 侧边栏模块 */}
       <Sidebar
         collapsed={sidebarState.collapsed}
         menuTrees={user?.menuTrees as MenuItem[]}
         activeKey={tabManager.activeTabKey}
         onMenuClick={handleMenuClick}
       />

       <Layout style={{ 
         marginLeft: sidebarState.collapsed ? 80 : 240, 
         transition: 'margin-left 0.2s' 
       }}>
         {/* 头部模块 */}
         <Header
           collapsed={sidebarState.collapsed}
           onToggleCollapsed={() => sidebarState.setCollapsed(!sidebarState.collapsed)}
           pathMaps={pathMappingState.pathMaps}
         />

         {/* Tab系统模块 */}
         <TabSystem
           collapsed={sidebarState.collapsed}
           getTabName={pathMappingState.getTabName}
         />

         {/* 内容区域模块 */}
         <ContentArea
           collapsed={sidebarState.collapsed}
           pageRefreshState={{
             pageRefreshKey: tabManager.pageRefreshKey,
             isPageRefreshing: tabManager.isPageRefreshing,
             setPageRefreshKey: tabManager.setPageRefreshKey,
             setIsPageRefreshing: tabManager.setIsPageRefreshing,
           }}
         />
      </Layout>
    </Layout>
  );
};

export default BasicLayout; 