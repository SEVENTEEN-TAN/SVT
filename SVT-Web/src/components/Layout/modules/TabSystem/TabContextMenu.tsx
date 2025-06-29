import React from 'react';
import {
  ReloadOutlined,
  CloseOutlined,
  CloseCircleOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';
import type { TabContextMenuItem, ContextMenuState } from '../../shared/types/layout';
import { STYLES } from '../../shared/utils/layoutUtils';

interface TabContextMenuProps {
  contextMenuState: ContextMenuState;
  onRefresh: (tabKey: string) => void;
  onClose: (tabKey: string) => void;
  onCloseLeft: (tabKey: string) => void;
  onCloseRight: (tabKey: string) => void;
  onCloseOther: (tabKey: string) => void;
  onCloseMenu: () => void;
}

const TabContextMenu: React.FC<TabContextMenuProps> = ({
  contextMenuState,
  onRefresh,
  onClose,
  onCloseLeft,
  onCloseRight,
  onCloseOther,
  onCloseMenu,
}) => {
  const { visible, position, tabKey } = contextMenuState;

  // 生成右键菜单项
  const contextMenuItems: TabContextMenuItem[] = [
    {
      key: 'refresh',
      label: '刷新',
      icon: <ReloadOutlined />,
      onClick: () => onRefresh(tabKey),
    },
    {
      key: 'close',
      label: '关闭',
      icon: <CloseOutlined />,
      disabled: tabKey === '/home', // 首页不能关闭
      onClick: () => onClose(tabKey),
    },
    {
      key: 'closeLeft',
      label: '关闭左侧',
      icon: <LeftOutlined />,
      onClick: () => onCloseLeft(tabKey),
    },
    {
      key: 'closeRight',
      label: '关闭右侧',
      icon: <RightOutlined />,
      onClick: () => onCloseRight(tabKey),
    },
    {
      key: 'closeOther',
      label: '关闭其他',
      icon: <CloseCircleOutlined />,
      onClick: () => onCloseOther(tabKey),
    },
  ];

  if (!visible) {
    return null;
  }

  return (
    <div
      data-context-menu
      style={{
        ...STYLES.CONTEXT_MENU.container,
        left: position.x,
        top: position.y,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {contextMenuItems.map((item) => (
        <div
          key={item.key}
          style={{
            ...STYLES.CONTEXT_MENU.item,
            ...(item.disabled ? STYLES.CONTEXT_MENU.itemDisabled : STYLES.CONTEXT_MENU.itemEnabled),
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
              onCloseMenu();
            }
          }}
        >
          {item.icon}
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default TabContextMenu; 