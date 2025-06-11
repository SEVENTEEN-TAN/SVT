import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Layout,
  Menu,
  Button,
  Dropdown,
  Avatar,
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
} from '@ant-design/icons';
import { useAuthStore } from '@/stores/authStore';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

// Tab项接口定义
interface TabItem {
  key: string;
  label: string;
  path: string;
  closable: boolean;
}

// 路径到Tab名称的映射
const pathToTabMap: Record<string, string> = {
  '/dashboard': '仪表盘',
  '/users': '用户管理',
  '/settings': '系统设置',
  // 可以根据需要添加更多路径映射
};

// 路径到面包屑名称的映射  
const pathToBreadcrumbMap: Record<string, string> = {
  '/dashboard': '仪表盘',
  '/users': '用户管理',
  '/settings': '系统设置',
};

const BasicLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

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

  // 根据路径获取Tab名称
  const getTabName = useCallback((path: string): string => {
    return pathToTabMap[path] || '未知页面';
  }, []);

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
  }, [getTabName]);

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
    
    // 如果当前路径有对应的Tab名称，则添加Tab
    if (pathToTabMap[currentPath]) {
      addTab(currentPath);
    } else {
      // 如果是未知路径，默认激活仪表盘
      setActiveTabKey('/dashboard');
      if (currentPath !== '/dashboard') {
        navigate('/dashboard');
      }
    }
  }, [location.pathname, addTab, navigate]);

  // 菜单项配置
  const menuItems: MenuProps['items'] = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: '用户管理',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '系统设置',
    },
  ];

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

  // 用户下拉菜单
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

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
  if (currentPath !== '/' && pathToBreadcrumbMap[currentPath]) {
    breadcrumbItems.push({
      title: <span>{pathToBreadcrumbMap[currentPath]}</span>,
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
    <Layout style={{ minHeight: '100vh', height: '100vh' }}>
      {/* 侧边栏 */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          background: colorBgContainer,
          borderRight: '1px solid #f0f0f0',
        }}
        width={240}
      >
        {/* Logo区域 */}
        <div
          style={{
            height: 64,
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
      </Sider>

      <Layout>
        {/* 头部 */}
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
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
              }}
            />
            <Breadcrumb items={breadcrumbItems} />
          </Space>

          {/* 用户信息 */}
          <Space>
            <span>欢迎，{user?.username || '用户'}</span>
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: 8,
                  transition: 'background-color 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f5f5f5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Avatar
                  size={32}
                  icon={<UserOutlined />}
                  src={user?.avatar}
                  style={{ marginRight: 8 }}
                />
                <Text strong>{user?.username || '用户'}</Text>
              </div>
            </Dropdown>
          </Space>
        </Header>

        {/* 动态Tab区域 */}
        <div style={{ background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
          <Tabs
            type="card"
            activeKey={activeTabKey}
            onChange={switchTab}
            items={tabItems}
            style={{ 
              margin: '0 24px',
            }}
            tabBarStyle={{
              marginBottom: 0,
            }}
          />
        </div>

        {/* 主内容区域 */}
        <Content
          style={{
            margin: '16px',
            padding: 24,
            minHeight: 'calc(100vh - 112px)',
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default BasicLayout; 