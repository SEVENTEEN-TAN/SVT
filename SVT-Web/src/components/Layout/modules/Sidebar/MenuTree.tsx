import React, { useCallback, useMemo } from 'react';
import { Menu } from 'antd';
import type { MenuProps } from 'antd';
import type { MenuItem } from '../../shared/types/layout';
import { getIcon } from '../../shared/utils/layoutUtils';

interface MenuTreeProps {
  menuTrees?: MenuItem[];
  activeKey: string;
  onMenuClick: (key: string) => void;
}

const MenuTree: React.FC<MenuTreeProps> = ({ menuTrees, activeKey, onMenuClick }) => {
  // 递归转换菜单树为Ant Design Menu格式
  const convertMenuTrees = useCallback((menus: MenuItem[]): MenuProps['items'] => {
    if (!menus || !Array.isArray(menus)) return [];

    return menus
      .map(menu => ({
        ...menu,
        menuSort: menu.menuSort || '0'
      }))
      .sort((a, b) => parseInt(a.menuSort) - parseInt(b.menuSort))
      .map(menu => {
        const menuItem: Record<string, unknown> = {
          key: menu.menuPath,
          icon: getIcon(menu.menuIcon || ''),
          label: menu.menuNameZh,
        };

        // 如果有子菜单，递归处理
        if (menu.children && menu.children.length > 0) {
          menuItem.children = convertMenuTrees(menu.children);
        }

        return menuItem;
      }) as unknown as MenuProps['items'];
  }, []);

  // 🔧 动态生成菜单项
  const menuItems = useMemo(() => {
    // 固定的首页菜单项
    const homeMenuItem = {
      key: '/home',
      icon: getIcon('home'),
      label: '首页',
    };

    // 动态菜单项
    const dynamicMenuItems = convertMenuTrees(menuTrees || []);

    // 合并固定菜单项和动态菜单项
    return [homeMenuItem, ...(dynamicMenuItems || [])];
  }, [menuTrees, convertMenuTrees]);

  // 处理菜单点击
  const handleMenuClick = useCallback((info: { key: string }) => {
    onMenuClick(info.key);
  }, [onMenuClick]);

  return (
    <div style={{ height: 'calc(100vh - 48px)', overflow: 'auto' }}>
      <Menu
        mode="inline"
        defaultSelectedKeys={['/home']}
        selectedKeys={[activeKey]}
        items={menuItems}
        style={{
          border: 'none',
          background: 'transparent',
        }}
        onClick={handleMenuClick}
      />
    </div>
  );
};

export default MenuTree; 