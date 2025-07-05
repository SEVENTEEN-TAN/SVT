/**
 * 布局样式工具
 * 
 * 职责：
 * - 提供统一的样式常量
 * - 简化样式计算逻辑
 * 
 * @author SVT Team
 * @since 2025-06-29
 * @version 3.0.0
 */

// 布局常量 (从原有的layoutUtils.ts中提取核心常量)
export const LAYOUT_CONSTANTS = {
  HEADER_HEIGHT: 48,
  TABS_HEIGHT: 45,
  SIDER_WIDTH_EXPANDED: 240,
  SIDER_WIDTH_COLLAPSED: 80,
  Z_INDEX: {
    SIDER: 100,
    HEADER: 100,
    TABS: 99,
    CONTEXT_MENU: 1000,
  },
  TRANSITION: {
    FAST: '0.2s',
  },
  PADDING: {
    MEDIUM: 16,
  },
  TAB: {
    GUTTER: 4,
  },
} as const;

// 加载状态样式
export const LOADING_STYLES = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(255, 255, 255, 0.9)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  text: {
    marginTop: 16,
    color: '#666',
    fontSize: 14,
  },
  pageRefresh: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(255, 255, 255, 0.9)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    animation: 'fadeIn 0.3s ease-in-out',
    backdropFilter: 'blur(2px)',
  },
  pageRefreshText: {
    marginTop: 16,
    color: '#666',
    fontSize: 14,
  }
} as const;

// 为了向后兼容，保持原有的STYLES导出
export const STYLES = {
  LOADING: LOADING_STYLES,
} as const;
