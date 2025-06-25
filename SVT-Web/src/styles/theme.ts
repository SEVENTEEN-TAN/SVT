import type { ThemeConfig } from 'antd/es/config-provider/context';
import { antdThemeConfig, svtDesignTokens } from '@/config/uiFrameworkConfig';

// SVT系统主题配置 - 使用增强版UI框架配置
export const theme: ThemeConfig = {
  ...antdThemeConfig,
  components: {
    ...antdThemeConfig.components,
    // Layout组件主题 - SVT特定配置
    Layout: {
      headerBg: '#fff',
      headerHeight: 64,
      headerPadding: '0 24px',
      siderBg: '#001529',
      triggerBg: '#002140',
    },

    // Menu组件主题 - SVT特定配置
    Menu: {
      ...antdThemeConfig.components?.Menu,
      darkItemBg: '#001529',
      darkSubMenuItemBg: '#000c17',
      darkItemSelectedBg: svtDesignTokens.colors.primary,
      itemHeight: 40,
      collapsedWidth: 80,
    },

    // Form组件主题 - SVT特定配置
    Form: {
      labelColor: svtDesignTokens.colors.text.primary,
      labelFontSize: svtDesignTokens.typography.fontSize.sm,
      itemMarginBottom: svtDesignTokens.spacing.lg,
    },
  },
};

// 暗色主题配置 - 基于设计令牌
export const darkTheme: ThemeConfig = {
  ...theme,
  algorithm: [], // 这里可以导入 theme.darkAlgorithm
  token: {
    ...theme.token,
    colorBgBase: svtDesignTokens.colors.neutral[900],
    colorTextBase: svtDesignTokens.colors.neutral[50],
    colorBgContainer: svtDesignTokens.colors.neutral[800],
    colorBorder: svtDesignTokens.colors.neutral[700],
  },
  components: {
    ...theme.components,
    Layout: {
      ...theme.components?.Layout,
      headerBg: svtDesignTokens.colors.neutral[900],
      siderBg: svtDesignTokens.colors.neutral[900],
    },
  },
};

// 主题工具函数
export const getThemeConfig = (isDark: boolean = false): ThemeConfig => {
  return isDark ? darkTheme : theme;
}; 