import React, { useState, useEffect, useCallback } from 'react';
import { message, Modal } from 'antd';
import { SearchSection, DataSection, ActionDrawer } from '@/components/ProTable';
import type { PageSchema, TableColumn } from '@/components/ProTable/types';

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
    const handleTableChange = (pagination: any, _filters: any, sorter: any) => {
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


    // 生成行操作列
    const rowActionButtons = schema.rowActions?.buttons || [
        {
            text: '查看',
            onClick: handleView,
        },
        ...(schema.api.updateApi ? [{
            text: '编辑',
            onClick: handleEdit,
        }] : []),
        ...(schema.api.deleteApi ? [{
            text: '删除',
            onClick: handleDelete,
            style: { color: '#ff4d4f' },
        }] : []),
    ];

    // 注入操作列
    const columns: TableColumn[] = [
        ...schema.table.columns.filter(col => !col.hideInTable),
        ...(rowActionButtons.length > 0 ? [{
            title: '操作',
            key: 'action',
            dataIndex: 'action',
            width: schema.rowActions?.width || schema.table.actionWidth || 150,
            fixed: 'right' as const,
            render: (_: any, record: any) => (
                <div style={{ display: 'flex', gap: 8 }}>
                    {rowActionButtons.map((btn, index) => {
                        const isVisible = typeof btn.visible === 'function'
                            ? btn.visible(record)
                            : btn.visible !== false;

                        if (!isVisible) return null;

                        return (
                            <a
                                key={index}
                                onClick={() => btn.onClick(record)}
                                style={btn.style}
                            >
                                {btn.text}
                            </a>
                        );
                    })}
                </div>
            ),
        }] : []),
    ];

    // 生成搜索字段
    const searchFields = schema.table.columns
        .filter(col => col.hideInSearch === false)
        .map(col => ({
            name: col.dataIndex as string,
            label: col.title as string,
            valueType: col.valueType,
            options: col.options,
            placeholder: col.searchProps?.placeholder || `请输入${col.title}`,
            ...col.searchProps,
        }))

        ;

    // 生成工具栏按钮
    const toolbarButtons = schema.toolbar?.buttons || [
        {
            text: '新增',
            type: 'primary' as const,
            onClick: async () => {
                handleCreate();
            },
        },
        {
            text: '批量删除',
            onClick: async (selectedRowKeys: React.Key[]) => {
                if (selectedRowKeys.length === 0) {
                    message.warning('请先选择要删除的数据');
                    return;
                }
                handleBatchDelete();
            },
            needSelection: true,
        },
    ];

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '16px' }}>
            {searchFields.length > 0 && (
                <SearchSection
                    fields={searchFields}
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
                toolbarButtons={toolbarButtons}
                selectedRowKeys={selectedRowKeys}
                selectedRows={dataSource.filter(item =>
                    selectedRowKeys.includes(item[schema.table.rowKey || 'id'])
                )}
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
