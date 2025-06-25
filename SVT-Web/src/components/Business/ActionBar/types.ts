import type { ReactNode } from 'react';

// 操作按钮类型
export interface ActionItem {
  key: string;
  label: string;
  type?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  hidden?: boolean;
  loading?: boolean;
  tooltip?: string;
  permission?: string; // 权限码，用于后续权限控制
}

// ActionBar组件属性
export interface ActionBarProps {
  actions: ActionItem[];
  selectedCount?: number;
  loading?: boolean;
  className?: string;
  style?: React.CSSProperties;
  layout?: 'horizontal' | 'vertical';
  size?: 'small' | 'middle' | 'large';
  align?: 'left' | 'center' | 'right';
} 