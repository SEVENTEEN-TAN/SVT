import React, { useMemo, useCallback } from 'react';
import { Tabs } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import type { TabItem, ContextMenuState } from '../../shared/types/layout';
import { LAYOUT_CONSTANTS } from '../../shared/utils/layoutUtils';

interface TabBarProps {
  activeTabKey: string;
  tabList: TabItem[];
  collapsed: boolean;
  onTabChange: (targetKey: string) => void;
  onTabRemove: (targetKey: string) => void;
  onContextMenu: (e: React.MouseEvent, tabKey: string) => void;
}

const TabBar: React.FC<TabBarProps> = ({
  activeTabKey,
  tabList,
  collapsed,
  onTabChange,
  onTabRemove,
  onContextMenu,
}) => {
  // 自定义Tab渲染，支持关闭按钮和右键菜单
  const customTabRender = useCallback((tab: TabItem) => {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 8px',
          minWidth: 0,
        }}
        onContextMenu={(e) => onContextMenu(e, tab.key)}
      >
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '120px',
          }}
          title={tab.label}
        >
          {tab.label}
        </span>
        {tab.closable && (
          <CloseOutlined
            style={{
              fontSize: '12px',
              color: '#999',
              cursor: 'pointer',
              padding: '2px',
              borderRadius: '2px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f5f5f5';
              e.currentTarget.style.color = '#ff4d4f';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#999';
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('关闭Tab:', tab.key); // 调试日志
              onTabRemove(tab.key);
            }}
          />
        )}
      </div>
    );
  }, [onContextMenu, onTabRemove]);

  // 转换Tab数据为Ant Design格式
  const tabItems = useMemo(() => {
    return tabList.map(tab => ({
      key: tab.key,
      label: customTabRender(tab),
      closable: false, // 禁用默认的关闭按钮，使用自定义的
    }));
  }, [tabList, customTabRender]);

  return (
    <div 
      style={{ 
        background: '#fff', 
        borderBottom: '1px solid #f0f0f0',
        position: 'fixed',
        top: LAYOUT_CONSTANTS.HEADER_HEIGHT,
        right: 0,
        left: collapsed ? LAYOUT_CONSTANTS.SIDER_WIDTH_COLLAPSED : LAYOUT_CONSTANTS.SIDER_WIDTH_EXPANDED,
        zIndex: LAYOUT_CONSTANTS.Z_INDEX.TABS,
        transition: `left ${LAYOUT_CONSTANTS.TRANSITION.FAST}`,
        height: LAYOUT_CONSTANTS.TABS_HEIGHT,
        display: 'flex',
        alignItems: 'flex-end',
      }}
    >
      <Tabs
        type="card"
        activeKey={activeTabKey}
        onChange={(key) => {
          console.log('📋 TabBar onChange 触发:', key);
          onTabChange(key);
        }}
        items={tabItems}
        style={{
          margin: `0 ${LAYOUT_CONSTANTS.PADDING.MEDIUM}px`,
          width: `calc(100% - ${LAYOUT_CONSTANTS.PADDING.MEDIUM * 2}px)`,
        }}
        tabBarStyle={{
          marginBottom: 0,
          height: 34,
          minHeight: 34,
          // 移除overflow hidden，让Antd自动处理滚动
        }}
        // 启用Tab滚动功能
        tabBarGutter={LAYOUT_CONSTANTS.TAB.GUTTER}
        // 移除数量显示，让用户自由管理Tab
      />
    </div>
  );
};

export default TabBar; 