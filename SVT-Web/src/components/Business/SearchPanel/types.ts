import type { ReactNode } from 'react';

// 搜索字段类型
export interface SearchFieldOption {
  label: string;
  value: string | number;
}

export interface SearchField {
  type: 'input' | 'select' | 'date' | 'dateRange';
  name: string;
  label: string;
  placeholder?: string;
  options?: SearchFieldOption[];
  style?: React.CSSProperties;
  rules?: any[]; // 验证规则
  disabled?: boolean;
}

// SearchPanel组件属性
export interface SearchPanelProps {
  fields: SearchField[];
  onSearch: (values: Record<string, any>) => void;
  onReset?: () => void;
  loading?: boolean;
  defaultValues?: Record<string, any>;
  layout?: 'horizontal' | 'vertical' | 'inline';
  className?: string;
  style?: React.CSSProperties;
}

// 表单值类型
export type SearchValues = Record<string, any>; 