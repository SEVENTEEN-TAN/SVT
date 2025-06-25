import type { ReactNode } from 'react';
import type { ColumnsType, TableProps } from 'antd/es/table';
import type { PaginationProps } from 'antd/es/pagination';

// 数据展示模式
export type DisplayMode = 'table' | 'list' | 'tree';

// 列配置
export interface ColumnConfig {
  key: string;
  title: string;
  dataIndex: string;
  width?: number;
  fixed?: 'left' | 'right';
  align?: 'left' | 'center' | 'right';
  sorter?: boolean | ((a: any, b: any) => number);
  render?: (value: any, record: any, index: number) => ReactNode;
  ellipsis?: boolean;
}

// 选择配置
export interface SelectionConfig {
  type?: 'checkbox' | 'radio';
  onChange?: (selectedRowKeys: React.Key[], selectedRows: any[]) => void;
  onSelect?: (record: any, selected: boolean, selectedRows: any[], nativeEvent: Event) => void;
  onSelectAll?: (selected: boolean, selectedRows: any[], changeRows: any[]) => void;
  getCheckboxProps?: (record: any) => any;
}

// 分页配置
export interface PaginationConfig extends PaginationProps {
  showTotal?: (total: number, range: [number, number]) => ReactNode;
}

// DataDisplay组件属性
export interface DataDisplayProps {
  mode: DisplayMode;
  data: any[];
  loading?: boolean;
  className?: string;
  style?: React.CSSProperties;
  
  // Table模式配置
  columns?: ColumnConfig[];
  rowKey?: string | ((record: any) => string);
  pagination?: PaginationConfig | false;
  scroll?: { x?: number; y?: number };
  
  // 选择配置
  rowSelection?: SelectionConfig;
  
  // 事件
  onRowClick?: (record: any, index?: number) => void;
  onRowDoubleClick?: (record: any, index?: number) => void;
  
  // List模式配置
  listItemRender?: (item: any, index: number) => ReactNode;
  
  // Tree模式配置
  treeProps?: {
    titleRender?: (node: any) => ReactNode;
    childrenKey?: string;
    expandedKeys?: string[];
    onExpand?: (expandedKeys: string[]) => void;
    checkable?: boolean;
    onCheck?: (checkedKeys: string[]) => void;
  };
} 