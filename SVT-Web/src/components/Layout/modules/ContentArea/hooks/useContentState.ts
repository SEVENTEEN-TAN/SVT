import type { PageRefreshState } from '../../../shared/types/layout';
import { LAYOUT_CONSTANTS, getContentInset } from '../../../shared/utils/layoutUtils';

interface UseContentStateProps {
  collapsed: boolean;
  pageRefreshState: PageRefreshState;
}

interface UseContentStateReturn {
  contentInset: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  isPageRefreshing: boolean;
}

// 内容区域状态管理Hook
export const useContentState = ({ collapsed, pageRefreshState }: UseContentStateProps): UseContentStateReturn => {
  // 计算内容区域的inset值
  const contentInset = getContentInset(collapsed);

  return {
    contentInset,
    isPageRefreshing: pageRefreshState.isPageRefreshing,
  };
}; 