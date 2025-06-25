import type { ReactNode } from 'react';
import type { ActionItem } from '../ActionBar/types';
import type { DataDisplayProps } from '../DataDisplay/types';

// DataManager组件属性
export interface DataManagerProps {
  // 操作按钮配置
  actions: ActionItem[];
  selectedCount?: number;
  actionLoading?: boolean;
  
  // 数据展示配置
  mode: 'table' | 'list' | 'card';
  data: any[];
  loading?: boolean;
  columns?: any[];
  rowKey?: string | ((record: any) => string);
  pagination?: any | false;
  scroll?: { x?: number; y?: number };
  
  // 选择配置
  rowSelection?: {
    type: 'checkbox' | 'radio';
    onChange?: (selectedRowKeys: any[], selectedRows: any[]) => void;
    selectedRowKeys?: any[];
    getCheckboxProps?: (record: any) => any;
  };
  
  // 样式配置
  className?: string;
  style?: React.CSSProperties;
  
  // 布局配置
  actionBarPosition?: 'top' | 'bottom';
  showActionBar?: boolean;
  
  // 其他配置
  title?: ReactNode;
  extra?: ReactNode;
}
