import React, { useState, useCallback, useEffect } from 'react';
import TabBar from './TabBar';
import TabContextMenu from './TabContextMenu';
import type { ContextMenuState, TabManagerState, PageRefreshState } from '@/components/Layout/shared/types/layout';

interface TabSystemProps {
  collapsed: boolean;
  getTabName: (path: string) => string;
  /**
   * TabManager状态，由父组件LayoutProvider提供
   */
  tabManager: TabManagerState & PageRefreshState;
}

const TabSystem: React.FC<TabSystemProps> = ({ collapsed, tabManager }) => {

  // 右键菜单状态
  const [contextMenuState, setContextMenuState] = useState<ContextMenuState>({
    visible: false,
    position: { x: 0, y: 0 },
    tabKey: '',
    setVisible: () => {},
    setPosition: () => {},
    setTabKey: () => {},
  });

  // 处理右键菜单
  const handleTabContextMenu = useCallback((e: React.MouseEvent, tabKey: string) => {
    e.preventDefault();
    setContextMenuState(prev => ({
      ...prev,
      visible: true,
      position: { x: e.clientX, y: e.clientY },
      tabKey,
    }));
  }, []);

  // 关闭右键菜单
  const closeContextMenu = useCallback(() => {
    setContextMenuState(prev => ({
      ...prev,
      visible: false,
    }));
  }, []);

  // 监听点击事件，关闭右键菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuState.visible) {
        // 检查点击是否在右键菜单外部
        const target = e.target as HTMLElement;
        const contextMenu = document.querySelector('[data-context-menu]');

        if (!contextMenu || !contextMenu.contains(target)) {
          closeContextMenu();
        }
      }
    };

    // 使用mousedown事件，确保在click之前触发
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [contextMenuState.visible, closeContextMenu]);

  return (
    <>
      {/* Tab栏 */}
      <TabBar
        activeTabKey={tabManager.activeTabKey}
        tabList={tabManager.tabList}
        collapsed={collapsed}
        onTabChange={tabManager.switchTab}
        onTabRemove={tabManager.removeTab}
        onContextMenu={handleTabContextMenu}
      />

      {/* 右键菜单 */}
      <TabContextMenu
        contextMenuState={contextMenuState}
        onRefresh={tabManager.refreshTab}
        onClose={tabManager.removeTab}
        onCloseLeft={tabManager.closeLeftTabs}
        onCloseRight={tabManager.closeRightTabs}
        onCloseOther={tabManager.closeOtherTabs}
        onCloseMenu={closeContextMenu}
      />
    </>
  );
};

export default TabSystem; 