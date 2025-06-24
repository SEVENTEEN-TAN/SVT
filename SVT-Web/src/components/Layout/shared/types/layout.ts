// 布局相关类型定义

// Tab项接口定义
export interface TabItem {
  key: string;
  label: string;
  path: string;
  closable: boolean;
}

// Tab右键菜单项类型
export interface TabContextMenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}

// 菜单项类型定义
export interface MenuItem {
  menuPath?: string;
  menuIcon?: string;
  menuNameZh?: string;
  menuSort?: string;
  children?: MenuItem[];
}

// 路径映射类型
export interface PathMaps {
  tabMap: Record<string, string>;
  breadcrumbMap: Record<string, string>;
}

// 侧边栏状态类型
export interface SidebarState {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

// Tab管理器状态类型
export interface TabManagerState {
  activeTabKey: string;
  tabList: TabItem[];
  addTab: (path: string, forceRefresh?: boolean) => void;
  removeTab: (targetKey: string) => void;
  switchTab: (targetKey: string) => void;
  refreshTab: (tabKey: string) => void;
  closeLeftTabs: (tabKey: string) => void;
  closeRightTabs: (tabKey: string) => void;
  closeOtherTabs: (tabKey: string) => void;
}

// 页面刷新状态类型
export interface PageRefreshState {
  pageRefreshKey: number;
  isPageRefreshing: boolean;
  setPageRefreshKey: (key: number) => void;
  setIsPageRefreshing: (loading: boolean) => void;
}

// 右键菜单状态类型
export interface ContextMenuState {
  visible: boolean;
  position: { x: number; y: number };
  tabKey: string;
  setVisible: (visible: boolean) => void;
  setPosition: (position: { x: number; y: number }) => void;
  setTabKey: (tabKey: string) => void;
}

// 用户信息类型（从现有代码推断）
export interface UserInfo {
  username?: string;
  orgNameZh?: string;
  roleNameZh?: string;
  menuTrees?: MenuItem[];
}

// 布局常量类型
export interface LayoutConstants {
  HEADER_HEIGHT: number;
  TABS_HEIGHT: number;
  SIDER_WIDTH_EXPANDED: number;
  SIDER_WIDTH_COLLAPSED: number;
  Z_INDEX: {
    SIDER: number;
    HEADER: number;
    TABS: number;
    CONTEXT_MENU: number;
  };
  TRANSITION: {
    FAST: string;
  };
  PADDING: {
    MEDIUM: number;
  };
  TAB: {
    GUTTER: number;
  };
} 