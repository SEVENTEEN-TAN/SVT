import { useState } from 'react';
import type { SidebarState } from '../../../shared/types/layout';

// 侧边栏状态管理Hook
export const useSidebarState = (): SidebarState => {
  const [collapsed, setCollapsed] = useState(false);

  return {
    collapsed,
    setCollapsed,
  };
}; 