import React from 'react';
import { Layout, theme } from 'antd';
import Logo from './Logo';
import MenuTree from './MenuTree';
import type { MenuItem } from '../../shared/types/layout';
import { LAYOUT_CONSTANTS } from '../../shared/utils/layoutUtils';

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
  menuTrees?: MenuItem[];
  activeKey: string;
  onMenuClick: (key: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, menuTrees, activeKey, onMenuClick }) => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      style={{
        background: colorBgContainer,
        borderRight: '1px solid #f0f0f0',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: LAYOUT_CONSTANTS.Z_INDEX.SIDER,
      }}
      width={LAYOUT_CONSTANTS.SIDER_WIDTH_EXPANDED}
    >
      <Logo collapsed={collapsed} />
      <MenuTree 
        menuTrees={menuTrees} 
        activeKey={activeKey} 
        onMenuClick={onMenuClick} 
      />
    </Sider>
  );
};

export default Sidebar; 