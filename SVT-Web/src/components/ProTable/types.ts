import type { ReactNode } from 'react';
import type { ColumnType } from 'antd/es/table';
import type { Rule as FormRule } from 'antd/es/form';
import type { PermissionEnum } from '@/constants/permissions';

// ==================== API Configuration ====================

export interface ApiConfig {
    /** 获取列表数据的 API */
    listApi: (params: any) => Promise<any>;
    /** 获取详情的 API */
    getApi?: (id: string | number) => Promise<any>;
    /** 创建数据的 API */
    createApi?: (data: any) => Promise<any>;
    /** 更新数据的 API */
    updateApi?: (data: any) => Promise<any>;
    /** 删除数据的 API */
    deleteApi?: (id: string | number) => Promise<any>;
    /** 批量删除数据的 API */
    batchDeleteApi?: (ids: (string | number)[]) => Promise<any>;
    /** 导出数据的 API */
    exportApi?: (params: any) => Promise<any>;
}

// ==================== Common Configuration ====================

export type ValueType = 'text' | 'input' | 'select' | 'date' | 'dateRange' | 'number' | 'switch' | 'textarea' | 'password';

export interface CommonFieldProps {
    /** 字段名 (对应 API 参数名) */
    name?: string;
    /** 显示标签 */
    label?: string;
    /** 控件类型 */
    valueType?: ValueType;
    /** 占位符 */
    placeholder?: string;
    /** 默认值 */
    defaultValue?: any;
    /** 下拉选项 (仅 valueType='select' 有效) */
    options?: { label: string; value: any }[];
    /** 是否隐藏 */
    hidden?: boolean;
}

// ==================== Table Configuration ====================

export interface TableColumn extends ColumnType<any> {
    /** 字段名 */
    dataIndex: string;
    /** 显示标题 */
    title: string;
    /** 值类型 (用于搜索栏和表单) */
    valueType?: ValueType;
    /** 下拉选项 (通用) */
    options?: { label: string; value: any }[];

    /** 是否在表格中隐藏 */
    hideInTable?: boolean;
    /** 是否在搜索栏中隐藏 (默认 true, 设置为 false 开启搜索) */
    hideInSearch?: boolean;
    /** 是否在表单中隐藏 */
    hideInForm?: boolean;

    /** 表单校验规则 */
    formRules?: FormRule[];
    /** 搜索栏配置项 (优先级高于通用配置) */
    searchProps?: CommonFieldProps;
    /** 表单配置项 (优先级高于通用配置) */
    formProps?: CommonFieldProps;
}

// ==================== Page Schema ====================

export interface PageSchema {
    /** 页面标题 */
    title: string;
    /** API 配置 */
    api: ApiConfig;
    /** 表格配置 (核心配置) */
    table: {
        /** 主键字段名 (默认 'id') */
        rowKey?: string;
        /** 列定义 (包含搜索、表格、表单配置) */
        columns: TableColumn[];
        /** 是否显示序号列 */
        showIndex?: boolean;
        /** 是否显示复选框 */
        rowSelection?: boolean;
        /** 操作列宽度 */
        actionWidth?: number;
    };
    /** 工具栏按钮配置 */
    toolbar?: {
        /** 按钮列表 */
        buttons?: Array<{
            /** 按钮文本 */
            text: string;
            /** 按钮类型 */
            type?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
            /** 按钮图标 */
            icon?: ReactNode;
            /** 点击回调 */
            onClick: (selectedRowKeys: React.Key[], selectedRows: any[]) => void | Promise<void>;
            /** 是否需要选中数据 */
            needSelection?: boolean;
            /** 是否显示 */
            visible?: boolean;
            /** 权限标识 (如果设置,则只有拥有该权限的用户才能看到此按钮) */
            permission?: PermissionEnum;
        }>;
    };
    /** 行操作按钮配置 */
    rowActions?: {
        /** 按钮列表 */
        buttons?: Array<{
            /** 按钮文本 */
            text: string;
            /** 点击回调 */
            onClick: (record: any) => void | Promise<void>;
            /** 是否显示（可以根据行数据动态判断） */
            visible?: boolean | ((record: any) => boolean);
            /** 按钮样式 */
            style?: React.CSSProperties;
            /** 权限标识 (如果设置,则只有拥有该权限的用户才能看到此按钮) */
            permission?: PermissionEnum;
        }>;
        /** 操作列宽度 */
        width?: number;
    };
}
