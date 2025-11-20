import type { ReactNode } from 'react';
import type { ColumnType } from 'antd/es/table';
import type { Rule as FormRule } from 'antd/es/form';

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

// ==================== Search Configuration ====================

export type SearchFieldType = 'input' | 'select' | 'date' | 'dateRange' | 'number' | 'switch' | 'custom';

export interface SearchField {
    /** 字段名 (对应 API 参数名) */
    name: string;
    /** 显示标签 */
    label: string;
    /** 控件类型 */
    type: SearchFieldType;
    /** 占位符 */
    placeholder?: string;
    /** 默认值 */
    defaultValue?: any;
    /** 下拉选项 (仅 type='select' 有效) */
    options?: { label: string; value: any }[];
    /** 自定义渲染 (仅 type='custom' 有效) */
    render?: () => ReactNode;
    /** 是否隐藏 */
    hidden?: boolean;
}

// ==================== Table Configuration ====================

export interface TableColumn extends ColumnType<any> {
    /** 字段名 */
    dataIndex: string;
    /** 显示标题 */
    title: string;
    /** 是否在表格中隐藏 */
    hideInTable?: boolean;
    /** 是否在表单中隐藏 */
    hideInForm?: boolean;
    /** 表单中的字段类型 (如果不指定，默认 Input) */
    formType?: SearchFieldType;
    /** 表单校验规则 */
    formRules?: FormRule[];
}

// ==================== Page Schema ====================

export interface PageSchema {
    /** 页面标题 */
    title: string;
    /** API 配置 */
    api: ApiConfig;
    /** 搜索栏配置 */
    search?: {
        fields: SearchField[];
        /** 默认每行显示的列数 (默认 3) */
        columnCount?: number;
    };
    /** 表格配置 */
    table: {
        /** 主键字段名 (默认 'id') */
        rowKey?: string;
        /** 列定义 */
        columns: TableColumn[];
        /** 是否显示序号列 */
        showIndex?: boolean;
        /** 是否显示复选框 */
        rowSelection?: boolean;
        /** 操作列宽度 */
        actionWidth?: number;
    };
    /** 功能按钮配置 */
    actions?: {
        /** 是否显示新增按钮 */
        create?: boolean;
        /** 是否显示批量删除按钮 */
        batchDelete?: boolean;
        /** 是否显示导出按钮 */
        export?: boolean;
        /** 是否显示导入按钮 */
        import?: boolean;
        /** 自定义按钮 */
        extra?: ReactNode[];
    };
}
