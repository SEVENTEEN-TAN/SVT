import React from 'react';
import { Layout, Spin, Typography } from 'antd';
import { Outlet } from 'react-router-dom';
import { useUserStatus } from '@/hooks/useUserStatus';
import { useAuthStore } from '@/stores/authStore';
import Sidebar from './modules/Sidebar';
import Header from './modules/Header';
import TabSystem from './modules/TabSystem';
import Footer from './Footer';
import { useSidebarState } from './modules/Sidebar/hooks/useSidebarState';
import { usePathMapping } from './shared/hooks/usePathMapping';
import { useTabManager } from './modules/TabSystem/hooks/useTabManager';
import { STYLES, LAYOUT_CONSTANTS } from './shared/utils/layoutUtils';
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
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
             {/* 侧边栏模块 */}
       <Sidebar
         collapsed={sidebarState.collapsed}
         menuTrees={user?.menuTrees as MenuItem[]}
         activeKey={tabManager.activeTabKey}
         onMenuClick={handleMenuClick}
       />

       <Layout style={{ 
         marginLeft: sidebarState.collapsed ? 80 : 240, 
         transition: 'margin-left 0.2s',
         display: 'flex',
         flexDirection: 'column',
         height: '100vh',
         background: '#f0f2f5'
       }}>
         {/* 头部模块 - fixed定位，不占用flex空间 */}
         <Header
           collapsed={sidebarState.collapsed}
           onToggleCollapsed={() => sidebarState.setCollapsed(!sidebarState.collapsed)}
           pathMaps={pathMappingState.pathMaps}
         />

         {/* Tab系统模块 - fixed定位，不占用flex空间 */}
         <TabSystem
           collapsed={sidebarState.collapsed}
           getTabName={pathMappingState.getTabName}
           tabManager={tabManager}
         />

         {/* 页面内容 - 需要考虑Header和TabSystem的高度 */}
         <div 
           key={tabManager.pageRefreshKey} 
           style={{ 
             flex: 1,
             position: 'relative',
             overflow: 'auto',
             marginTop: `${LAYOUT_CONSTANTS.HEADER_HEIGHT + LAYOUT_CONSTANTS.TABS_HEIGHT}px`,
             minHeight: 0
           }}
         >
           {/* 页面加载状态覆盖层 */}
           {tabManager.isPageRefreshing && (
             <div style={STYLES.LOADING.pageRefresh}>
               <Spin size="large" />
               <Text style={STYLES.LOADING.pageRefreshText}>页面刷新中...</Text>
             </div>
           )}
           
           {/* 直接渲染页面组件 */}
           <Outlet />
         </div>

         {/* 页脚 */}
         <Footer />
      </Layout>
    </Layout>
  );
};

export default BasicLayout; 