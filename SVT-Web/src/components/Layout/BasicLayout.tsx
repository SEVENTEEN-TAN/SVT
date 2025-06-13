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
} from '@ant-design/icons';
import { useAuthStore } from '@/stores/authStore';
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

// 🔧 动态路径映射生成函数
const generatePathMaps = (menuTrees: any[]) => {
  const tabMap: Record<string, string> = { 
    '/dashboard': '仪表盘'
  };
  const breadcrumbMap: Record<string, string> = { 
    '/dashboard': '仪表盘'
  };

  const processMenu = (menus: any[]) => {
    menus.forEach(menu => {
      if (menu.menuPath) {
        tabMap[menu.menuPath] = menu.menuNameZh;
        breadcrumbMap[menu.menuPath] = menu.menuNameZh;
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

const BasicLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
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
  const convertMenuTrees = useCallback((menuTrees: any[]): MenuProps['items'] => {
    if (!menuTrees || !Array.isArray(menuTrees)) return [];

    return menuTrees
      .sort((a, b) => parseInt(a.menuSort) - parseInt(b.menuSort))
      .map(menu => {
        const menuItem: any = {
          key: menu.menuPath,
          icon: getIcon(menu.menuIcon),
          label: menu.menuNameZh,
        };

        // 如果有子菜单，递归处理
        if (menu.children && menu.children.length > 0) {
          menuItem.children = convertMenuTrees(menu.children);
        }

        return menuItem;
      });
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
    const findMenuLabel = (menus: any[], targetPath: string): string | null => {
      for (const menu of menus) {
        if (menu.menuPath === targetPath) {
          return menu.menuNameZh;
        }
        if (menu.children && menu.children.length > 0) {
          const found = findMenuLabel(menu.children, targetPath);
          if (found) return found;
        }
      }
      return null;
    };
    
    const menuLabel = user?.menuTrees ? findMenuLabel(user.menuTrees, path) : null;
    return menuLabel || '页面未找到';
  }, [pathMaps.tabMap, user?.menuTrees]);

  // 添加新Tab
  const addTab = useCallback((path: string) => {
    setTabList(prev => {
      const existingTab = prev.find(tab => tab.key === path);
      if (!existingTab) {
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
    setActiveTabKey(path);
    // 导航到对应路由
    navigate(path);
  }, [getTabName, navigate]);

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

  // 切换Tab
  const switchTab = useCallback((targetKey: string) => {
    setActiveTabKey(targetKey);
    navigate(targetKey);
  }, [navigate]);

  // 监听路由变化，自动添加Tab
  useEffect(() => {
    const currentPath = location.pathname;
    
    // 🔧 为所有路径添加Tab，包括无效路径
    // 这样无效路径会显示为菜单名称，但内容显示404
    if (currentPath !== '/login') {
      addTab(currentPath);
    }
  }, [location.pathname, addTab]);

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

  // 处理菜单点击
  const handleMenuClick = useCallback((e: { key: string }) => {
    addTab(e.key);
  }, [addTab]);

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



  // 自定义Tab渲染，支持关闭按钮
  const tabItems = tabList.map(tab => ({
    key: tab.key,
    label: tab.closable ? (
      <span style={{ display: 'flex', alignItems: 'center', gap: 6, userSelect: 'none' }}>
        <span>{tab.label}</span>
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
      </span>
    ) : tab.label,
    closable: false, // 禁用默认的关闭按钮，使用自定义的
  }));

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
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
            dropdownRender={() => userInfoDropdown}
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
            }}
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
              <Outlet />
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