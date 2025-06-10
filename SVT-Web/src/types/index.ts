// 通用类型定义

// API响应基础结构
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
  success: boolean;
}

// 分页参数
export interface PaginationParams {
  page: number;
  pageSize: number;
  total?: number;
}

// 分页响应数据
export interface PaginationData<T = unknown> {
  records: T[];
  page: number;
  pageSize: number;
  total: number;
  pages: number;
}

// 排序参数
export interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}

// 列表查询参数
export interface ListParams extends PaginationParams {
  sort?: SortParams;
  [key: string]: unknown;
}

// 表格列定义
export interface TableColumn {
  key: string;
  title: string;
  dataIndex?: string;
  width?: number;
  fixed?: 'left' | 'right';
  sorter?: boolean;
  render?: string;
  align?: 'left' | 'center' | 'right';
}

// 表单字段定义
export interface FormField {
  key: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  rules?: FormRule[];
  options?: SelectOption[];
  [key: string]: unknown;
}

// 表单验证规则
export interface FormRule {
  required?: boolean;
  message?: string;
  pattern?: string;
  min?: number;
  max?: number;
  validator?: string;
}

// 下拉选项
export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
  children?: SelectOption[];
}

// 菜单项定义
export interface MenuItem {
  key: string;
  label: string;
  icon?: string;
  path?: string;
  children?: MenuItem[];
  meta?: MenuMeta;
}

// 菜单元信息
export interface MenuMeta {
  title: string;
  icon?: string;
  hidden?: boolean;
  roles?: string[];
  permissions?: string[];
  keepAlive?: boolean;
  affix?: boolean;
}

// 路由定义
export interface RouteConfig {
  path: string;
  component?: string;
  redirect?: string;
  children?: RouteConfig[];
  meta?: RouteMeta;
}

// 路由元信息
export interface RouteMeta {
  title: string;
  icon?: string;
  roles?: string[];
  permissions?: string[];
  hidden?: boolean;
  noCache?: boolean;
  breadcrumb?: boolean;
  affix?: boolean;
}

// 用户权限
export interface Permission {
  id: number;
  name: string;
  code: string;
  type: 'menu' | 'button' | 'api';
  parentId?: number;
  children?: Permission[];
}

// 角色定义
export interface Role {
  id: number;
  name: string;
  code: string;
  description?: string;
  permissions: Permission[];
}

// 文件上传响应
export interface UploadResponse {
  url: string;
  name: string;
  size: number;
  type: string;
}

// 操作日志
export interface OperationLog {
  id: number;
  userId: number;
  username: string;
  action: string;
  module: string;
  description: string;
  ip: string;
  userAgent: string;
  createTime: string;
}

// 全局设置
export interface GlobalSettings {
  theme: 'light' | 'dark';
  primaryColor: string;
  layout: 'side' | 'top' | 'mix';
  collapsed: boolean;
  fixedHeader: boolean;
  fixedSider: boolean;
  multiTab: boolean;
  locale: string;
}

// 错误信息
export interface ErrorInfo {
  message: string;
  stack?: string;
  componentStack?: string;
}

// 加载状态
export type LoadingState = boolean | string;

// 主题模式
export type ThemeMode = 'light' | 'dark' | 'auto';

// 布局模式
export type LayoutMode = 'side' | 'top' | 'mix';

// 组件大小
export type ComponentSize = 'small' | 'middle' | 'large';

// 导出所有类型
export * from './user';
export * from './api'; 