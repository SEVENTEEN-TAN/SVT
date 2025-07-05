// API相关类型定义

// 统一API响应格式
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
  success: boolean;
  timestamp?: number;
  traceId?: string;
}

// 分页查询参数
export interface PageParams {
  page: number;
  pageSize: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// 分页查询参数（通用）
export interface PageQuery<T = unknown> {
  pageNumber: number;
  pageSize: number;
  condition?: T;
}

// 分页响应数据
export interface PageData<T = unknown> {
  records: T[];
  current: number;
  size: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// 分页响应数据（通用）
export interface PageResult<T = unknown> {
  records: T[];
  current: number;
  size: number;
  total: number;
  pages: number;
}

// 查询条件基类
export interface BaseQuery extends PageParams {
  keyword?: string;
  status?: number;
  createTimeStart?: string;
  createTimeEnd?: string;
  [key: string]: unknown;
}

// 上传文件响应
export interface UploadFileResponse {
  url: string;
  filename: string;
  originalName: string;
  size: number;
  contentType: string;
}

// 批量操作参数
export interface BatchParams {
  ids: number[] | string[];
}

// 批量操作响应
export interface BatchResponse {
  successCount: number;
  failCount: number;
  successIds: (number | string)[];
  failIds: (number | string)[];
  errors?: string[];
}

// 导出参数
export interface ExportParams {
  filename?: string;
  columns?: string[];
  query?: Record<string, unknown>;
}

// 字典数据
export interface DictItem {
  label: string;
  value: string | number;
  color?: string;
  status?: number;
  sort?: number;
  remark?: string;
}

// 树形数据结构
export interface TreeNode {
  id: number | string;
  label: string;
  value?: string | number;
  children?: TreeNode[];
  disabled?: boolean;
  isLeaf?: boolean;
  [key: string]: unknown;
}

// 选项数据
export interface OptionItem {
  label: string;
  value: string | number;
  disabled?: boolean;
  children?: OptionItem[];
}

// 状态枚举
export enum ApiStatus {
  SUCCESS = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_ERROR = 500,
}

// 请求方法枚举
export enum RequestMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
} 