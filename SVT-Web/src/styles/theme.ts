import type { ThemeConfig } from 'antd';

// SVT系统主题配置
export const theme: ThemeConfig = {
  token: {
    // 主色调 - SVT品牌色
    colorPrimary: '#1890ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#f5222d',
    colorInfo: '#1890ff',
    
    // 字体配置
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
    fontSize: 14,
    fontSizeSM: 12,
    fontSizeLG: 16,
    fontSizeXL: 20,
    
    // 圆角
    borderRadius: 6,
    borderRadiusLG: 8,
    borderRadiusSM: 4,
    
    // 间距
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
    paddingXS: 8,
    
    // 阴影
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    boxShadowSecondary: '0 4px 12px rgba(0, 0, 0, 0.08)',
    
    // 布局配置
    sizeUnit: 4,
    sizeStep: 4,
    wireframe: false,
  },
  
  components: {
    // Layout组件主题
    Layout: {
      headerBg: '#fff',
      headerHeight: 64,
      headerPadding: '0 24px',
      siderBg: '#001529',
      triggerBg: '#002140',
    },
    
    // Menu组件主题
    Menu: {
      darkItemBg: '#001529',
      darkSubMenuItemBg: '#000c17',
      darkItemSelectedBg: '#1890ff',
      itemHeight: 40,
      collapsedWidth: 80,
    },
    
    // Button组件主题
    Button: {
      borderRadius: 6,
      controlHeight: 32,
      paddingContentHorizontal: 16,
    },
    
    // Input组件主题
    Input: {
      borderRadius: 6,
      controlHeight: 32,
      paddingInline: 12,
    },
    
    // Table组件主题
    Table: {
      headerBg: '#fafafa',
      headerSortActiveBg: '#f0f0f0',
      bodySortBg: '#fafafa',
      rowHoverBg: '#f5f5f5',
      borderColor: '#f0f0f0',
    },
    
    // Card组件主题
    Card: {
      headerBg: 'transparent',
      actionsBg: '#fafafa',
    },
    
    // Form组件主题
    Form: {
      labelColor: 'rgba(0, 0, 0, 0.85)',
      labelFontSize: 14,
      itemMarginBottom: 24,
    },
  },
  
  // 算法配置 - 用于动态主题切换
  algorithm: [], // 可以添加 theme.darkAlgorithm 用于暗色主题
};

// 暗色主题配置
export const darkTheme: ThemeConfig = {
  ...theme,
  algorithm: [], // 这里可以导入 theme.darkAlgorithm
  token: {
    ...theme.token,
    colorBgBase: '#141414',
    colorTextBase: '#fff',
  },
  components: {
    ...theme.components,
    Layout: {
      ...theme.components?.Layout,
      headerBg: '#141414',
      siderBg: '#001529',
    },
  },
};

// 主题工具函数
export const getThemeConfig = (isDark: boolean = false): ThemeConfig => {
  return isDark ? darkTheme : theme;
}; 