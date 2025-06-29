import React from 'react';
import { Layout, Button, Space, Dropdown, Typography, theme } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import Breadcrumb from './Breadcrumb';
import UserDropdown from './UserDropdown';
import { useHeaderState } from './hooks/useHeaderState';
import type { PathMaps } from '@/components/Layout/shared/types/layout';
import { LAYOUT_CONSTANTS, STYLES } from '@/components/Layout/shared/utils/layoutUtils';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

interface HeaderProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  pathMaps: PathMaps;
}

const Header: React.FC<HeaderProps> = ({ collapsed, onToggleCollapsed, pathMaps }) => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  
  const { currentPath, user, handleLogout } = useHeaderState();

  // 用户信息浮窗内容
  const userInfoDropdown = <UserDropdown user={user} onLogout={handleLogout} />;

  return (
    <AntHeader
      style={{
        padding: `0 ${LAYOUT_CONSTANTS.PADDING.MEDIUM}px`,
        background: colorBgContainer,
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'fixed',
        top: 0,
        right: 0,
        left: collapsed ? LAYOUT_CONSTANTS.SIDER_WIDTH_COLLAPSED : LAYOUT_CONSTANTS.SIDER_WIDTH_EXPANDED,
        zIndex: LAYOUT_CONSTANTS.Z_INDEX.HEADER,
        transition: `left ${LAYOUT_CONSTANTS.TRANSITION.FAST}`,
        height: LAYOUT_CONSTANTS.HEADER_HEIGHT,
      }}
    >
      {/* 折叠按钮和面包屑 */}
      <Space size="large">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggleCollapsed}
          style={{
            fontSize: '16px',
            width: 40,
            height: 40,
            border: 'none',
            background: 'transparent',
            boxShadow: 'none',
            outline: 'none',
          }}
        />
        <Breadcrumb currentPath={currentPath} pathMaps={pathMaps} />
      </Space>

      {/* 用户信息 */}
      <Dropdown
        popupRender={() => userInfoDropdown}
        placement="bottomRight"
        arrow
        trigger={['click']}
      >
        <div
          style={STYLES.USER_INFO_BUTTON.container}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f5f5f5';
            e.currentTarget.style.borderColor = '#d9d9d9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = 'transparent';
          }}
        >
          <Text strong>{user?.username || '用户'}</Text>
        </div>
      </Dropdown>
    </AntHeader>
  );
};

export default Header; 