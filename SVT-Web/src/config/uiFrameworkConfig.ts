/**
 * UI框架增强配置
 * 专业设计师优化版本 - 统一设计语言 + 主题管理 + 组件规范
 */

import type { ThemeConfig } from 'antd/es/config-provider/context';

// 设计令牌接口
interface DesignTokens {
  // 色彩系统
  colors: {
    primary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    // 中性色
    neutral: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
    };
    // 功能色
    background: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
      disabled: string;
    };
    border: {
      light: string;
      medium: string;
      heavy: string;
    };
  };
  
  // 间距系统
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  
  // 字体系统
  typography: {
    fontFamily: {
      primary: string;
      secondary: string;
      mono: string;
    };
    fontSize: {
      xs: number;
      sm: number;
      base: number;
      lg: number;
      xl: number;
      '2xl': number;
      '3xl': number;
    };
    fontWeight: {
      light: number;
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
    };
  };
  
  // 阴影系统
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  
  // 圆角系统
  borderRadius: {
    none: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
  
  // 动画系统
  animation: {
    duration: {
      fast: number;
      normal: number;
      slow: number;
    };
    easing: {
      linear: string;
      easeIn: string;
      easeOut: string;
      easeInOut: string;
    };
  };
}

// SVT设计令牌
export const svtDesignTokens: DesignTokens = {
  colors: {
    primary: '#1890ff',
    success: '#52c41a',
    warning: '#faad14',
    error: '#ff4d4f',
    info: '#1890ff',
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#f0f0f0',
      300: '#d9d9d9',
      400: '#bfbfbf',
      500: '#8c8c8c',
      600: '#595959',
      700: '#434343',
      800: '#262626',
      900: '#1f1f1f'
    },
    background: {
      primary: '#ffffff',
      secondary: '#fafafa',
      tertiary: '#f5f5f5'
    },
    text: {
      primary: '#262626',
      secondary: '#595959',
      tertiary: '#8c8c8c',
      disabled: '#bfbfbf'
    },
    border: {
      light: '#f0f0f0',
      medium: '#d9d9d9',
      heavy: '#bfbfbf'
    }
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48
  },
  
  typography: {
    fontFamily: {
      primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
      secondary: 'Georgia, "Times New Roman", Times, serif',
      mono: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace'
    },
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75
    }
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  },
  
  borderRadius: {
    none: 0,
    sm: 2,
    md: 6,
    lg: 8,
    xl: 12,
    full: 9999
  },
  
  animation: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500
    },
    easing: {
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  }
};

// Ant Design主题配置
export const antdThemeConfig: ThemeConfig = {
  token: {
    // 色彩配置
    colorPrimary: svtDesignTokens.colors.primary,
    colorSuccess: svtDesignTokens.colors.success,
    colorWarning: svtDesignTokens.colors.warning,
    colorError: svtDesignTokens.colors.error,
    colorInfo: svtDesignTokens.colors.info,
    
    // 字体配置
    fontFamily: svtDesignTokens.typography.fontFamily.primary,
    fontSize: svtDesignTokens.typography.fontSize.base,
    
    // 圆角配置
    borderRadius: svtDesignTokens.borderRadius.md,
    
    // 间距配置
    padding: svtDesignTokens.spacing.md,
    margin: svtDesignTokens.spacing.md,
    
    // 动画配置
    motionDurationFast: `${svtDesignTokens.animation.duration.fast}ms`,
    motionDurationMid: `${svtDesignTokens.animation.duration.normal}ms`,
    motionDurationSlow: `${svtDesignTokens.animation.duration.slow}ms`,
    
    // 阴影配置
    boxShadow: svtDesignTokens.shadows.md,
    boxShadowSecondary: svtDesignTokens.shadows.sm,
    
    // 线条配置
    lineWidth: 1,
    lineType: 'solid',
    
    // 控制高度
    controlHeight: 32,
    controlHeightSM: 24,
    controlHeightLG: 40,
  },
  
  components: {
    // 按钮组件定制
    Button: {
      borderRadius: svtDesignTokens.borderRadius.md,
      fontWeight: svtDesignTokens.typography.fontWeight.medium,
    },
    
    // 输入框组件定制
    Input: {
      borderRadius: svtDesignTokens.borderRadius.md,
      paddingInline: svtDesignTokens.spacing.sm,
    },
    
    // 表格组件定制
    Table: {
      borderRadius: svtDesignTokens.borderRadius.md,
      headerBg: svtDesignTokens.colors.background.secondary,
      headerColor: svtDesignTokens.colors.text.primary,
      rowHoverBg: svtDesignTokens.colors.background.tertiary,
    },
    
    // 卡片组件定制
    Card: {
      borderRadius: svtDesignTokens.borderRadius.lg,
      paddingLG: svtDesignTokens.spacing.lg,
    },
    
    // 菜单组件定制
    Menu: {
      itemBorderRadius: svtDesignTokens.borderRadius.md,
      itemMarginInline: svtDesignTokens.spacing.xs,
    },
    
    // 标签页组件定制
    Tabs: {
      borderRadius: svtDesignTokens.borderRadius.md,
      cardPadding: `${svtDesignTokens.spacing.sm}px ${svtDesignTokens.spacing.md}px`,
    },
    
    // 抽屉组件定制
    Drawer: {
      borderRadius: svtDesignTokens.borderRadius.lg,
    },
    
    // 模态框组件定制
    Modal: {
      borderRadius: svtDesignTokens.borderRadius.lg,
      paddingLG: svtDesignTokens.spacing.lg,
    },
    
    // 消息组件定制
    Message: {
      borderRadius: svtDesignTokens.borderRadius.md,
    },
    
    // 通知组件定制
    Notification: {
      borderRadius: svtDesignTokens.borderRadius.lg,
      paddingMD: svtDesignTokens.spacing.md,
    }
  },
  
  algorithm: undefined, // 可以设置为 theme.darkAlgorithm 支持暗色主题
};

// 组件尺寸配置
export const componentSizes = {
  small: 'small' as const,
  middle: 'middle' as const,
  large: 'large' as const,
};

// 响应式断点配置
export const breakpoints = {
  xs: 480,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600,
};

// CSS变量生成器
export const generateCSSVariables = (tokens: DesignTokens): Record<string, string> => {
  return {
    '--svt-color-primary': tokens.colors.primary,
    '--svt-color-success': tokens.colors.success,
    '--svt-color-warning': tokens.colors.warning,
    '--svt-color-error': tokens.colors.error,
    '--svt-color-info': tokens.colors.info,
    
    '--svt-spacing-xs': `${tokens.spacing.xs}px`,
    '--svt-spacing-sm': `${tokens.spacing.sm}px`,
    '--svt-spacing-md': `${tokens.spacing.md}px`,
    '--svt-spacing-lg': `${tokens.spacing.lg}px`,
    '--svt-spacing-xl': `${tokens.spacing.xl}px`,
    '--svt-spacing-xxl': `${tokens.spacing.xxl}px`,
    
    '--svt-font-family-primary': tokens.typography.fontFamily.primary,
    '--svt-font-size-base': `${tokens.typography.fontSize.base}px`,
    
    '--svt-border-radius-md': `${tokens.borderRadius.md}px`,
    '--svt-border-radius-lg': `${tokens.borderRadius.lg}px`,
    
    '--svt-shadow-md': tokens.shadows.md,
    '--svt-shadow-lg': tokens.shadows.lg,
    
    '--svt-duration-normal': `${tokens.animation.duration.normal}ms`,
    '--svt-easing-ease-in-out': tokens.animation.easing.easeInOut,
  };
};

// 导出类型
export type { DesignTokens };
