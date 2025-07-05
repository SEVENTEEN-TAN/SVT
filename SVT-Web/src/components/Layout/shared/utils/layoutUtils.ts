import React from 'react';
import {
  SettingOutlined,
  UserOutlined,
  TeamOutlined,
  MenuOutlined,
  ShopOutlined,
  FormOutlined,
  SearchOutlined,
  DashboardOutlined,
  HomeOutlined,
  ApartmentOutlined,
  SafetyOutlined,
  CrownOutlined,
  IdcardOutlined,
} from '@ant-design/icons';
import type { MenuItem, PathMaps } from '@/components/Layout/shared/types/layout';

// 布局常量
export const LAYOUT_CONSTANTS = {
  HEADER_HEIGHT: 48,
  TABS_HEIGHT: 45,
  SIDER_WIDTH_EXPANDED: 240,
  SIDER_WIDTH_COLLAPSED: 80,
  Z_INDEX: {
    SIDER: 100,
    HEADER: 100,
    TABS: 99,
    CONTEXT_MENU: 1000,
  },
  TRANSITION: {
    FAST: '0.2s',
  },
  PADDING: {
    MEDIUM: 16,
  },
  TAB: {
    GUTTER: 4,
  },
} as const;

// 图标映射函数
export const getIcon = (iconName: string): React.ReactNode => {
  const normalized = (iconName || '').trim().replace(/Outlined$/i, '').toLowerCase();
  const iconMap: Record<string, React.ReactNode> = {
    'setting': React.createElement(SettingOutlined),
    'user': React.createElement(UserOutlined),
    'team': React.createElement(TeamOutlined),
    'menu': React.createElement(MenuOutlined),
    'shop': React.createElement(ShopOutlined),
    'form': React.createElement(FormOutlined),
    'search': React.createElement(SearchOutlined),
    'dashboard': React.createElement(DashboardOutlined),
    'home': React.createElement(HomeOutlined),
    'apartment': React.createElement(ApartmentOutlined),
    'safety': React.createElement(SafetyOutlined),
    'crown': React.createElement(CrownOutlined),
    'idcard': React.createElement(IdcardOutlined),
  };

  return iconMap[normalized] || React.createElement(MenuOutlined);
};

// 🔧 动态路径映射生成函数
export const generatePathMaps = (menuTrees: MenuItem[]): PathMaps => {
  const tabMap: Record<string, string> = {
    '/home': '首页'
  };
  const breadcrumbMap: Record<string, string> = {
    '/home': '首页'
  };

  const processMenu = (menus: MenuItem[]) => {
    menus.forEach(menu => {
      if (menu.menuPath) {
        tabMap[menu.menuPath] = menu.menuNameZh || '';
        breadcrumbMap[menu.menuPath] = menu.menuNameZh || '';
      }
      if (menu.children && menu.children.length > 0) {
        processMenu(menu.children);
      }
    });
  };

  if (menuTrees && Array.isArray(menuTrees)) {
    processMenu(menuTrees);
  }

  return { tabMap, breadcrumbMap };
};

// 根据路径获取Tab名称的函数
export const getTabName = (path: string, pathMaps: PathMaps, menuTrees?: MenuItem[]): string => {
  // 如果是有效路径，返回映射的名称
  if (pathMaps.tabMap[path]) {
    return pathMaps.tabMap[path];
  }
  
  // 对于无效路径，从菜单项中查找对应的label（如果是从菜单点击进来的）
  const findMenuLabel = (menus: MenuItem[], targetPath: string): string | null => {
    for (const menu of menus) {
      if (menu.menuPath === targetPath) {
        return menu.menuNameZh || null;
      }
      if (menu.children && menu.children.length > 0) {
        const found = findMenuLabel(menu.children, targetPath);
        if (found) return found;
      }
    }
    return null;
  };
  
  const menuLabel = menuTrees ? findMenuLabel(menuTrees, path) : null;
  return menuLabel || '页面未找到';
};

// getContentInset 函数已移除 - 不再需要计算内容区域的inset值

// 样式常量对象
export const STYLES = {
  // 用户下拉菜单样式
  USER_DROPDOWN: {
    container: {
      padding: '16px',
      minWidth: '240px',
      background: '#fff',
      borderRadius: '8px',
      boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)'
    },
    content: {
      marginBottom: '16px'
    },
    infoRow: {
      fontSize: '14px',
      lineHeight: '28px'
    },
    infoItem: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '8px'
    },
    infoItemLast: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '16px'
    },
    label: {
      color: '#8c8c8c'
    },
    value: {
      color: '#262626',
      fontWeight: 500
    },
    button: {
      height: '36px',
      borderRadius: '6px'
    }
  },

  // 右键菜单样式
  CONTEXT_MENU: {
    container: {
      position: 'fixed' as const,
      zIndex: 1000,
      background: '#fff',
      border: '1px solid #d9d9d9',
      borderRadius: '6px',
      boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
      padding: '4px 0',
      minWidth: '140px',
    },
    item: {
      padding: '8px 16px',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'background-color 0.2s',
    },
    itemEnabled: {
      cursor: 'pointer',
      color: '#262626',
    },
    itemDisabled: {
      cursor: 'not-allowed',
      color: '#bfbfbf',
    }
  },

  // 用户信息按钮样式
  USER_INFO_BUTTON: {
    container: {
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
      padding: '8px 12px',
      borderRadius: 8,
      transition: 'all 0.3s',
      border: '1px solid transparent',
    }
  },

  // 加载状态样式
  LOADING: {
    overlay: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column' as const
    },
    text: {
      marginTop: 16,
      color: '#666'
    },
    pageRefresh: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'center',
      alignItems: 'center',
      background: 'rgba(255, 255, 255, 0.9)',
      zIndex: 9999  // 🔧 提高层级，确保覆盖在所有内容之上
    },
    pageRefreshText: {
      marginTop: 16,
      color: '#666',
      fontSize: '16px'
    }
  },

  // Logo样式
  LOGO: {
    container: (collapsed: boolean) => ({
      height: 48,
      display: 'flex',
      alignItems: 'center',
      justifyContent: collapsed ? 'center' : 'flex-start',
      padding: collapsed ? 0 : '0 24px',
      borderBottom: '1px solid #f0f0f0',
      overflow: 'hidden',
    }),
    text: (collapsed: boolean) => ({
      fontSize: collapsed ? 16 : 18,
      color: '#1890ff',
      transition: 'font-size 0.3s ease',
      whiteSpace: 'nowrap' as const,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    })
  }
} as const; 