import React, { useState, useEffect, useCallback } from 'react';
import { message, Modal } from 'antd';
import SearchSection from './SearchSection';
import DataSection from './DataSection';
import ActionDrawer from './ActionDrawer';
import type { PageSchema, TableColumn } from './types';

interface SchemaPageProps {
    schema: PageSchema;
}

const SchemaPage: React.FC<SchemaPageProps> = ({ schema }) => {
    // 状态管理
    const [loading, setLoading] = useState(false);
    const [dataSource, setDataSource] = useState<any[]>([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [searchParams, setSearchParams] = useState<any>({});
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

    // 抽屉状态
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | 'view'>('create');
    const [currentRecord, setCurrentRecord] = useState<any>(null);
    const [drawerLoading, setDrawerLoading] = useState(false);

    // 加载数据
    const loadData = useCallback(async (page = pagination.current, size = pagination.pageSize, params = searchParams) => {
        setLoading(true);
        try {
            const res = await schema.api.listApi({
                pageNumber: page,
                pageSize: size,
                ...params,
            });

            // 适配不同的 API 响应结构
            // 假设标准结构为 { records: [], total: 0 } 或 { list: [], total: 0 }
            const list = res.records || res.list || [];
            const total = res.total || 0;

            setDataSource(list);
            setPagination(prev => ({ ...prev, current: page, pageSize: size, total }));
        } catch (error: any) {
            console.error('Load data failed:', error);
            message.error(error.message || '加载数据失败');
        } finally {
            setLoading(false);
        }
    }, [schema.api, pagination.current, pagination.pageSize, searchParams]);

    // 初始化加载
    useEffect(() => {
        loadData(1);
    }, []);

    // 搜索
    const handleSearch = (values: any) => {
        setSearchParams(values);
        loadData(1, pagination.pageSize, values);
    };

    // 重置
    const handleReset = () => {
        setSearchParams({});
        loadData(1, pagination.pageSize, {});
    };

    // 分页变化
    const handlePageChange = (page: number, pageSize: number) => {
        loadData(page, pageSize);
    };

    // 表格变化 (排序/筛选)
    const handleTableChange = (pagination: any, filters: any, sorter: any) => {
        const { field, order } = sorter;
        const params = { ...searchParams };
        if (field && order) {
            params.sortField = field;
            params.sortOrder = order === 'ascend' ? 'asc' : 'desc';
        } else {
            delete params.sortField;
            delete params.sortOrder;
        }
        setSearchParams(params);
        loadData(pagination.current, pagination.pageSize, params);
    };

    // 处理新增
    const handleCreate = () => {
        setDrawerMode('create');
        setCurrentRecord(null);
        setDrawerOpen(true);
    };

    // 处理编辑
    const handleEdit = async (record: any) => {
        setDrawerMode('edit');
        setCurrentRecord(record);
        setDrawerOpen(true);

        // 如果有 getApi，获取详情
        if (schema.api.getApi) {
            setDrawerLoading(true);
            try {
                const detail = await schema.api.getApi(record[schema.table.rowKey || 'id']);
                setCurrentRecord(detail);
            } catch (error) {
                console.error('Get detail failed:', error);
            } finally {
                setDrawerLoading(false);
            }
        }
    };

    // 处理查看
    const handleView = (record: any) => {
        setDrawerMode('view');
        setCurrentRecord(record);
        setDrawerOpen(true);
    };

    // 处理删除
    const handleDelete = (record: any) => {
        Modal.confirm({
            title: '确认删除',
            content: '确定要删除这条记录吗？此操作不可恢复。',
            onOk: async () => {
                if (!schema.api.deleteApi) return;
                try {
                    await schema.api.deleteApi(record[schema.table.rowKey || 'id']);
                    message.success('删除成功');
                    loadData();
                } catch (error: any) {
                    message.error(error.message || '删除失败');
                }
            },
        });
    };

    // 处理批量删除
    const handleBatchDelete = () => {
        if (!selectedRowKeys.length) return;
        Modal.confirm({
            title: '确认批量删除',
            content: `确定要删除选中的 ${selectedRowKeys.length} 条记录吗？`,
            onOk: async () => {
                if (!schema.api.batchDeleteApi) return;
                try {
                    await schema.api.batchDeleteApi(selectedRowKeys as (string | number)[]);
                    message.success('批量删除成功');
                    setSelectedRowKeys([]);
                    loadData();
                } catch (error: any) {
                    message.error(error.message || '批量删除失败');
                }
            },
        });
    };

    // 提交表单
    const handleSubmit = async (values: any) => {
        setDrawerLoading(true);
        try {
            if (drawerMode === 'create') {
                if (schema.api.createApi) {
                    await schema.api.createApi(values);
                    message.success('创建成功');
                }
            } else if (drawerMode === 'edit') {
                if (schema.api.updateApi) {
                    // 合并 ID
                    const idKey = schema.table.rowKey || 'id';
                    const submitData = { ...values, [idKey]: currentRecord[idKey] };
                    await schema.api.updateApi(submitData);
                    message.success('更新成功');
                }
            }
            setDrawerOpen(false);
            loadData();
        } catch (error: any) {
            message.error(error.message || '提交失败');
        } finally {
            setDrawerLoading(false);
        }
    };

    // 注入操作列
    const columns: TableColumn[] = [
        ...schema.table.columns,
        {
            title: '操作',
            key: 'action',
            dataIndex: 'action',
            width: schema.table.actionWidth || 150,
            fixed: 'right',
            render: (_, record) => (
                <div style={{ display: 'flex', gap: 8 }}>
                    <a onClick={() => handleView(record)}>查看</a>
                    {schema.api.updateApi && <a onClick={() => handleEdit(record)}>编辑</a>}
                    {schema.api.deleteApi && <a onClick={() => handleDelete(record)} style={{ color: '#ff4d4f' }}>删除</a>}
                </div>
            ),
        },
    ];

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '16px' }}>
            {schema.search && (
                <SearchSection
                    fields={schema.search.fields}
                    onSearch={handleSearch}
                    onReset={handleReset}
                    loading={loading}
                />
            )}

            <DataSection
                columns={columns}
                dataSource={dataSource}
                loading={loading}
                rowKey={schema.table.rowKey}
                pagination={{
                    ...pagination,
                    onChange: handlePageChange,
                }}
                actions={{
                    create: schema.actions?.create ?? true,
                    batchDelete: schema.actions?.batchDelete ?? true,
                    export: schema.actions?.export ?? false,
                    import: schema.actions?.import ?? false,
                    extra: schema.actions?.extra,
                }}
                onAction={(type) => {
                    if (type === 'create') handleCreate();
                    if (type === 'batchDelete') handleBatchDelete();
                    // export TODO
                }}
                rowSelection={
                    schema.table.rowSelection !== false
                        ? {
                            selectedRowKeys,
                            onChange: setSelectedRowKeys,
                        }
                        : undefined
                }
                onChange={handleTableChange}
            />

            <ActionDrawer
                open={drawerOpen}
                mode={drawerMode}
                title={schema.title}
                columns={schema.table.columns}
                initialValues={currentRecord}
                loading={drawerLoading}
                onClose={() => setDrawerOpen(false)}
                onSubmit={handleSubmit}
            />
        </div>
    );
};

export default SchemaPage;
