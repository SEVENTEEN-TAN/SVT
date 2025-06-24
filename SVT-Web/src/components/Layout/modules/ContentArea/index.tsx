import React from 'react';
import { Layout, theme } from 'antd';
import { Outlet } from 'react-router-dom';
import PageLoader from './PageLoader';
import { useContentState } from './hooks/useContentState';
import Footer from '../../Footer';
import type { PageRefreshState } from '../../shared/types/layout';

const { Content } = Layout;

interface ContentAreaProps {
  collapsed: boolean;
  pageRefreshState: PageRefreshState;
}

const ContentArea: React.FC<ContentAreaProps> = ({ collapsed, pageRefreshState }) => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const { contentInset, isPageRefreshing } = useContentState({ collapsed, pageRefreshState });

  return (
    <div
      style={{
        position: 'fixed',
        inset: `${contentInset.top}px ${contentInset.right}px ${contentInset.bottom}px ${contentInset.left}px`,
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s',
        zIndex: 1,
        background: '#f0f2f5',
        overflow: 'hidden',
      }}
    >
      {/* 可滚动内容容器 - 支持A4效果滚动 */}
      <div
        style={{
          flex: 1,
          overflow: 'auto', // 当内容超出时允许滚动
          padding: 0,
          margin: 0,
        }}
      >
        {/* 主内容区域 - 最小高度保证，内容可自然扩展 */}
        <Content
          style={{
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            margin: '1%',
            minHeight: 'calc(100vh - 19vh)', // 最小高度保证不会太小
            boxShadow: '0 0.2vh 0.8vh rgba(0, 0, 0, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          <div
            key={pageRefreshState.pageRefreshKey}
            style={{
              flex: 1,
              padding: '24px',
              height: '100%',
              width: '100%',
              minHeight: 0, // 确保flex子项可以正确收缩
              position: 'relative' // 为加载状态定位
            }}
          >
            {/* 页面加载状态覆盖层 */}
            <PageLoader loading={isPageRefreshing} />
            
            {/* 页面内容 */}
            <Outlet />
          </div>
        </Content>
      </div>

      {/* 页脚 */}
      <Footer />
    </div>
  );
};

export default ContentArea; 