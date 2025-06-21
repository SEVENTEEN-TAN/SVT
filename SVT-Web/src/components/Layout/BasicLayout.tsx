import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Layout,
  Menu,
  Button,
  Dropdown,
  Typography,
  theme,
  Breadcrumb,
  Tabs,
  Space,
  Spin,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  HomeOutlined,
  CloseOutlined,
  ShopOutlined,
  FormOutlined,
  SearchOutlined,
  TeamOutlined,
  MenuOutlined,
  ReloadOutlined,
  CloseCircleOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/stores/authStore';
import { useUserStatus } from '@/hooks/useUserStatus';
import Footer from './Footer';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

// Tab项接口定义
interface TabItem {
  key: string;
  label: string;
  path: string;
  closable: boolean;
}

// Tab右键菜单项类型
interface TabContextMenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}

// 🔧 动态路径映射生成函数
const generatePathMaps = (menuTrees: unknown[]) => {
  const tabMap: Record<string, string> = {
    '/dashboard': '仪表盘'
  };
  const breadcrumbMap: Record<string, string> = {
    '/dashboard': '仪表盘'
  };

  const processMenu = (menus: unknown[]) => {
    menus.forEach(menu => {
      const menuItem = menu as { menuPath?: string; menuNameZh?: string; children?: unknown[] };
      if (menuItem.menuPath) {
        tabMap[menuItem.menuPath] = menuItem.menuNameZh || '';
        breadcrumbMap[menuItem.menuPath] = menuItem.menuNameZh || '';
      }
      if (menuItem.children && menuItem.children.length > 0) {
        processMenu(menuItem.children);
      }
    });
  };

  if (menuTrees && Array.isArray(menuTrees)) {
    processMenu(menuTrees);
  }

  return { tabMap, breadcrumbMap };
};

const BasicLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { loading } = useUserStatus(); // 🔧 只使用loading状态
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // 图标映射函数
  const getIcon = useCallback((iconName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'setting': <SettingOutlined />,
      'user': <UserOutlined />,
      'team': <TeamOutlined />,
      'menu': <MenuOutlined />,
      'shop': <ShopOutlined />,
      'form': <FormOutlined />,
      'search': <SearchOutlined />,
      'dashboard': <DashboardOutlined />,
      'home': <HomeOutlined />,
    };
    return iconMap[iconName] || <MenuOutlined />;
  }, []);

  // 递归转换菜单树为Ant Design Menu格式
  const convertMenuTrees = useCallback((menuTrees: unknown[]): MenuProps['items'] => {
    if (!menuTrees || !Array.isArray(menuTrees)) return [];

    return menuTrees
      .map(menu => menu as { menuPath?: string; menuIcon?: string; menuNameZh?: string; menuSort?: string; children?: unknown[] })
      .sort((a, b) => parseInt(a.menuSort || '0') - parseInt(b.menuSort || '0'))
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
  }, [getIcon]);

  // 防重复操作的ref
  const isOperatingRef = useRef(false);

  // Tab状态管理
  const [activeTabKey, setActiveTabKey] = useState<string>('/dashboard');
  const [tabList, setTabList] = useState<TabItem[]>([
    {
      key: '/dashboard',
      label: '仪表盘',
      path: '/dashboard',
      closable: false, // 仪表盘不可关闭
    },
  ]);

  // 右键菜单状态
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [contextMenuTabKey, setContextMenuTabKey] = useState<string>('');

  // 页面刷新key，用于强制重渲染
  const [pageRefreshKey, setPageRefreshKey] = useState<number>(0);

  // Tab管理配置（移除强制限制，改为滚动支持）
  // const MAX_TABS = 10; // 移除最大Tab数量限制
  // const TAB_CLOSE_WARNING_COUNT = 8; // 移除提示

  // 🔧 动态获取路径映射
  const pathMaps = useMemo(() => {
    return generatePathMaps(user?.menuTrees || []);
  }, [user?.menuTrees]);

  // 根据路径获取Tab名称
  const getTabName = useCallback((path: string): string => {
    // 如果是有效路径，返回映射的名称
    if (pathMaps.tabMap[path]) {
      return pathMaps.tabMap[path];
    }
    
    // 对于无效路径，从菜单项中查找对应的label（如果是从菜单点击进来的）
    const findMenuLabel = (menus: unknown[], targetPath: string): string | null => {
      for (const menu of menus) {
        const menuItem = menu as { menuPath?: string; menuNameZh?: string; children?: unknown[] };
        if (menuItem.menuPath === targetPath) {
          return menuItem.menuNameZh || null;
        }
        if (menuItem.children && menuItem.children.length > 0) {
          const found = findMenuLabel(menuItem.children, targetPath);
          if (found) return found;
        }
      }
      return null;
    };
    
    const menuLabel = user?.menuTrees ? findMenuLabel(user.menuTrees, path) : null;
    return menuLabel || '页面未找到';
  }, [pathMaps.tabMap, user?.menuTrees]);

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
          closable: path !== '/dashboard', // 仪表盘不可关闭
        };

        return [...prev, newTab];
      }
      return prev;
    });

    // 设置活跃Tab
    setActiveTabKey(path);

    // 只在以下情况才刷新：
    // 1. 强制刷新
    // 2. 重复点击当前Tab（用户期望刷新）
    if (forceRefresh || isCurrentTab) {
      setPageRefreshKey(prev => prev + 1);
    }

    // 导航到目标路径
    navigate(path);
  }, [getTabName, navigate, activeTabKey]);

  // 关闭Tab
  const removeTab = useCallback((targetKey: string) => {
    // 防重复操作
    if (isOperatingRef.current) {
      return;
    }

    // 不能关闭仪表盘
    if (targetKey === '/dashboard') {
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
          // 延迟导航，避免状态冲突
          setTimeout(() => {
            navigate(newActiveTab.path);
            isOperatingRef.current = false;
          }, 0);
          return newActiveTab.key;
        }
        setTimeout(() => {
          isOperatingRef.current = false;
        }, 0);
        return currentActive;
      });

      return newTabList;
    });
  }, [navigate]);

  // 切换Tab（只在需要时刷新）
  const switchTab = useCallback((targetKey: string) => {
    setActiveTabKey(targetKey);

    // 导航到目标路径（不强制刷新，让页面自然切换）
    navigate(targetKey);
  }, [navigate]);

  // Tab右键菜单功能
  const refreshTab = useCallback((tabKey: string) => {
    // 强制刷新指定Tab
    setActiveTabKey(tabKey);

    // 强制刷新页面内容：更新刷新key
    setPageRefreshKey(prev => prev + 1);

    // 导航到目标路径
    navigate(tabKey);
  }, [navigate]);

  const closeCurrentTab = useCallback((tabKey: string) => {
    removeTab(tabKey);
  }, [removeTab]);

  const closeLeftTabs = useCallback((tabKey: string) => {
    const currentIndex = tabList.findIndex(tab => tab.key === tabKey);
    if (currentIndex <= 0) return; // 没有左边的Tab或者是第一个Tab

    // 获取左边所有可关闭的Tab（不包括仪表盘）
    const tabsToClose = tabList.slice(0, currentIndex).filter(tab => tab.closable && tab.key !== '/dashboard');
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
        navigate(tabKey);
      }

      return newTabList;
    });
  }, [tabList, activeTabKey, navigate]);

  const closeRightTabs = useCallback((tabKey: string) => {
    const currentIndex = tabList.findIndex(tab => tab.key === tabKey);
    if (currentIndex === -1 || currentIndex === tabList.length - 1) return; // 没有右边的Tab

    // 获取右边所有可关闭的Tab（不包括仪表盘）
    const tabsToClose = tabList.slice(currentIndex + 1).filter(tab => tab.closable && tab.key !== '/dashboard');
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
        navigate(tabKey);
      }

      return newTabList;
    });
  }, [tabList, activeTabKey, navigate]);

  // 关闭其他Tab（保留当前Tab和仪表盘）
  const closeOtherTabs = useCallback((tabKey: string) => {
    setTabList(prev => prev.filter(tab =>
      tab.key === tabKey ||
      tab.key === '/dashboard' ||
      !tab.closable
    ));

    // 如果当前活跃Tab被保留，不需要切换
    if (activeTabKey !== tabKey && activeTabKey !== '/dashboard') {
      setActiveTabKey(tabKey);
      navigate(tabKey);
    }
  }, [activeTabKey, navigate]);

  // 生成右键菜单项
  const getContextMenuItems = useCallback((tabKey: string): TabContextMenuItem[] => {
    const currentIndex = tabList.findIndex(tab => tab.key === tabKey);
    const hasLeftTabs = currentIndex > 0 && tabList.slice(0, currentIndex).some(tab => tab.closable);
    const hasRightTabs = currentIndex < tabList.length - 1 && tabList.slice(currentIndex + 1).some(tab => tab.closable);
    const hasOtherTabs = tabList.some(tab => tab.closable && tab.key !== tabKey);
    const isClosable = tabList.find(tab => tab.key === tabKey)?.closable;

    return [
      {
        key: 'refresh',
        label: '刷新',
        icon: <ReloadOutlined />,
        onClick: () => refreshTab(tabKey),
      },
      {
        key: 'close',
        label: '关闭当前页面',
        icon: <CloseOutlined />,
        disabled: !isClosable,
        onClick: () => closeCurrentTab(tabKey),
      },
      {
        key: 'closeLeft',
        label: '关闭左边',
        icon: <LeftOutlined />,
        disabled: !hasLeftTabs,
        onClick: () => closeLeftTabs(tabKey),
      },
      {
        key: 'closeRight',
        label: '关闭右边',
        icon: <RightOutlined />,
        disabled: !hasRightTabs,
        onClick: () => closeRightTabs(tabKey),
      },
      {
        key: 'closeOthers',
        label: '关闭其他',
        icon: <CloseCircleOutlined />,
        disabled: !hasOtherTabs,
        onClick: () => closeOtherTabs(tabKey),
      },
    ];
  }, [tabList, refreshTab, closeCurrentTab, closeLeftTabs, closeRightTabs, closeOtherTabs]);

  // 处理Tab右键点击
  const handleTabContextMenu = useCallback((e: React.MouseEvent, tabKey: string) => {
    e.preventDefault();
    setContextMenuTabKey(tabKey);
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuVisible(true);
  }, []);

  // 关闭右键菜单
  const closeContextMenu = useCallback(() => {
    setContextMenuVisible(false);
    setContextMenuTabKey('');
  }, []);

  // 点击页面其他地方关闭右键菜单
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenuVisible) {
        closeContextMenu();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [contextMenuVisible, closeContextMenu]);

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
            closable: currentPath !== '/dashboard',
          };
          return [...prev, newTab];
        }
        return prev;
      });

      // 设置活跃Tab
      setActiveTabKey(currentPath);
    }
  }, [location.pathname, getTabName]); // 只依赖必要的值

  // 🔧 动态生成菜单项
  const menuItems: MenuProps['items'] = useMemo(() => {
    // 始终包含仪表盘作为首页
    const dashboardItem = {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    };

    // 从用户菜单树生成其他菜单
    const userMenuItems = user?.menuTrees ? convertMenuTrees(user.menuTrees) : [];

    return [dashboardItem, ...(userMenuItems || [])];
  }, [user?.menuTrees, convertMenuTrees]);

  // 处理菜单点击（重复点击时刷新）
  const handleMenuClick = useCallback((e: { key: string }) => {
    const isCurrentTab = activeTabKey === e.key;
    addTab(e.key, isCurrentTab); // 重复点击当前Tab时刷新
  }, [addTab, activeTabKey]);

  // 处理登出
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [logout, navigate]);

  // 用户信息浮窗内容
  const userInfoDropdown = (
    <div style={{ 
      padding: '16px', 
      minWidth: '240px',
      background: '#fff',
      borderRadius: '8px',
      boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)'
    }}>
      {/* 用户信息区域 */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '14px', lineHeight: '28px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}>
            <span style={{ color: '#8c8c8c' }}>机构：</span>
            <span style={{ color: '#262626', fontWeight: 500 }}>
              {user?.orgNameZh || '未知机构'}
            </span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <span style={{ color: '#8c8c8c' }}>角色：</span>
            <span style={{ color: '#262626', fontWeight: 500 }}>
              {user?.roleNameZh || '未知角色'}
            </span>
          </div>
        </div>
        
        {/* 退出按钮 */}
        <Button 
          type="primary" 
          danger 
          block 
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          style={{ 
            height: '36px',
            borderRadius: '6px'
          }}
        >
          退出登录
        </Button>
      </div>
    </div>
  );

  // 生成面包屑项
  const breadcrumbItems = [
    {
      title: (
        <>
          <HomeOutlined />
          <span style={{ marginLeft: 4 }}>首页</span>
        </>
      ),
    },
  ];

  const currentPath = location.pathname;
  if (currentPath !== '/' && pathMaps.breadcrumbMap[currentPath]) {
    breadcrumbItems.push({
      title: <span>{pathMaps.breadcrumbMap[currentPath]}</span>,
    });
  }



  // 自定义Tab渲染，支持关闭按钮和右键菜单
  const tabItems = tabList.map(tab => ({
    key: tab.key,
    label: (
      <span
        style={{ display: 'flex', alignItems: 'center', gap: 6, userSelect: 'none' }}
        onContextMenu={(e) => handleTabContextMenu(e, tab.key)}
      >
        <span>{tab.label}</span>
        {tab.closable && (
          <CloseOutlined
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('关闭Tab:', tab.key); // 调试日志
              removeTab(tab.key);
            }}
            style={{
              fontSize: 10,
              cursor: 'pointer',
              opacity: 0.6,
              transition: 'all 0.2s',
              padding: '2px',
              borderRadius: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e: React.MouseEvent) => {
              (e.currentTarget as HTMLElement).style.opacity = '1';
              (e.currentTarget as HTMLElement).style.backgroundColor = '#ff4d4f';
              (e.currentTarget as HTMLElement).style.color = '#fff';
            }}
            onMouseLeave={(e: React.MouseEvent) => {
              (e.currentTarget as HTMLElement).style.opacity = '0.6';
              (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
              (e.currentTarget as HTMLElement).style.color = 'inherit';
            }}
          />
        )}
      </span>
    ),
    closable: false, // 禁用默认的关闭按钮，使用自定义的
  }));

  // 用户状态验证加载中
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column'
      }}>
        <Spin size="large" />
        <Text style={{ marginTop: 16, color: '#666' }}>正在验证用户状态...</Text>
      </div>
    );
  }

  // 🔧 用户状态验证失败时不显示全屏错误页面
  // 错误处理已由request拦截器统一处理（跳转+顶部消息）
  // BasicLayout只负责loading状态，不显示error页面

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
      {/* Tab右键菜单 */}
      {contextMenuVisible && (
        <div
          style={{
            position: 'fixed',
            left: contextMenuPosition.x,
            top: contextMenuPosition.y,
            zIndex: 1000,
            background: '#fff',
            border: '1px solid #d9d9d9',
            borderRadius: '6px',
            boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
            padding: '4px 0',
            minWidth: '140px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {getContextMenuItems(contextMenuTabKey).map((item) => (
            <div
              key={item.key}
              style={{
                padding: '8px 16px',
                cursor: item.disabled ? 'not-allowed' : 'pointer',
                color: item.disabled ? '#bfbfbf' : '#262626',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!item.disabled) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = '#f5f5f5';
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
              }}
              onClick={() => {
                if (!item.disabled) {
                  item.onClick();
                  closeContextMenu();
                }
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* 侧边栏 */}
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
          zIndex: 100,
        }}
        width={240}
      >
        {/* Logo区域 */}
        <div
          style={{
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? 0 : '0 24px',
            borderBottom: '1px solid #f0f0f0',
            overflow: 'hidden',
          }}
        >
          <Text
            strong
            style={{
              fontSize: collapsed ? 16 : 18,
              color: '#1890ff',
              transition: 'font-size 0.3s ease',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {collapsed ? 'SVT' : 'SVT 系统'}
          </Text>
        </div>

        {/* 菜单 */}
        <div style={{ height: 'calc(100vh - 48px)', overflow: 'auto' }}>
          <Menu
            mode="inline"
            defaultSelectedKeys={['/dashboard']}
            selectedKeys={[activeTabKey]}
            items={menuItems}
            style={{
              border: 'none',
              background: 'transparent',
            }}
            onClick={handleMenuClick}
          />
        </div>
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 240, transition: 'margin-left 0.2s' }}>
        {/* 头部 */}
        <Header
          style={{
            padding: '0 16px',
            background: colorBgContainer,
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'fixed',
            top: 0,
            right: 0,
            left: collapsed ? 80 : 240,
            zIndex: 100,
            transition: 'left 0.2s',
            height: 48,
          }}
        >
          {/* 折叠按钮和面包屑 */}
          <Space size="large">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
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
            <Breadcrumb items={breadcrumbItems} />
          </Space>

          {/* 用户信息 */}
          <Dropdown
            popupRender={() => userInfoDropdown}
            placement="bottomRight"
            arrow
            trigger={['click']}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: 8,
                transition: 'all 0.3s',
                border: '1px solid transparent',
              }}
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
        </Header>

        {/* 动态Tab区域 */}
        <div 
          style={{ 
            background: '#fff', 
            borderBottom: '1px solid #f0f0f0',
            position: 'fixed',
            top: 48,
            right: 0,
            left: collapsed ? 80 : 240,
            zIndex: 99,
            transition: 'left 0.2s',
            height: 45,
            display: 'flex',
            alignItems: 'flex-end',
          }}
        >
          <Tabs
            type="card"
            activeKey={activeTabKey}
            onChange={switchTab}
            items={tabItems}
            style={{
              margin: '0 16px',
              width: 'calc(100% - 32px)',
            }}
            tabBarStyle={{
              marginBottom: 0,
              height: 34,
              minHeight: 34,
              // 移除overflow hidden，让Antd自动处理滚动
            }}
            // 启用Tab滚动功能
            tabBarGutter={4}
            // 移除数量显示，让用户自由管理Tab
          />
        </div>

        {/* 内容和页脚容器 */}
        <div
          style={{
            position: 'fixed',
            inset: `calc(48px + 45px) 0px 0px ${collapsed ? 80 : 240}px`,
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.2s',
            zIndex: 1,
            background: '#f0f2f5',
          }}
        >
          {/* 可滚动内容容器 */}
          <div
            style={{
              flex: 1,
              overflow: 'auto',
              padding: 0,
              margin: 0,
            }}
          >
            {/* 主内容区域 */}
            <Content
              style={{
                padding: '24px',
                background: colorBgContainer,
                borderRadius: borderRadiusLG,
                margin: '16px',
                minHeight: 'calc(100vh - 64px - 46px - 48px - 32px)', // 调整高度计算
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              }}
            >
              <Outlet key={pageRefreshKey} />
            </Content>
          </div>

          {/* 页脚组件 */}
          <Footer />
        </div>
      </Layout>
    </Layout>
  );
};

export default BasicLayout; 