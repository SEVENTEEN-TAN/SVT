import React, { useState, useCallback, useEffect } from 'react';
import TabBar from './TabBar';
import TabContextMenu from './TabContextMenu';
import { useTabManager } from './hooks/useTabManager';
import type { ContextMenuState, TabManagerState, PageRefreshState } from '../../shared/types/layout';

interface TabSystemProps {
  collapsed: boolean;
  getTabName: (path: string) => string;
  /**
   * 可选的外部 TabManager，用于在父组件和本组件间共享状态。
   * 如果未提供，则组件内部将自行创建 TabManager 实例。
   */
  tabManager?: TabManagerState & PageRefreshState;
}

const TabSystem: React.FC<TabSystemProps> = ({ collapsed, getTabName, tabManager: externalTabManager }) => {
  // 若父组件传入 tabManager，则复用；否则自行创建
  const tabManager = externalTabManager ?? useTabManager({ getTabName });

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
    setContextMenuState({
      ...contextMenuState,
      visible: true,
      position: { x: e.clientX, y: e.clientY },
      tabKey,
    });
  }, [contextMenuState]);

  // 关闭右键菜单
  const closeContextMenu = useCallback(() => {
    setContextMenuState({
      ...contextMenuState,
      visible: false,
    });
  }, [contextMenuState]);

  // 监听点击事件，关闭右键菜单
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenuState.visible) {
        closeContextMenu();
      }
    };

    if (contextMenuState.visible) {
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
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