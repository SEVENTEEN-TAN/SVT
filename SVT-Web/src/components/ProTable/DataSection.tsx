import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Table, Button, Space, Card, theme, Pagination, Tooltip, Popover, Checkbox } from 'antd';
import {
    SettingOutlined,
    FullscreenOutlined,
    FullscreenExitOutlined
} from '@ant-design/icons';
import type { TableColumn } from './types';

interface ToolbarButton {
    text: string;
    type?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
    icon?: React.ReactNode;
    onClick: (selectedRowKeys: React.Key[], selectedRows: any[]) => void | Promise<void>;
    needSelection?: boolean;
    visible?: boolean;
}

interface DataSectionProps {
    columns: TableColumn[];
    dataSource: any[];
    loading?: boolean;
    rowKey?: string;
    pagination: {
        current: number;
        pageSize: number;
        total: number;
        onChange: (page: number, pageSize: number) => void;
    };
    toolbarButtons?: ToolbarButton[];
    selectedRowKeys?: React.Key[];
    selectedRows?: any[];
    onAction?: (type: string) => void;
    rowSelection?: {
        selectedRowKeys: React.Key[];
        onChange: (selectedRowKeys: React.Key[], selectedRows: any[]) => void;
    };
    onChange?: (pagination: any, filters: any, sorter: any) => void;
}

const DataSection: React.FC<DataSectionProps> = ({
    columns: initialColumns,
    dataSource,
    loading,
    rowKey = 'id',
    pagination,
    toolbarButtons = [],
    selectedRowKeys = [],
    selectedRows = [],
    rowSelection,
    onChange,
}) => {
    const { token } = theme.useToken();
    const tableWrapperRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [scrollY, setScrollY] = useState<number>(400);

    // 全屏状态
    const [isFullscreen, setIsFullscreen] = useState(false);

    // 列设置状态
    const [visibleColKeys, setVisibleColKeys] = useState<React.Key[]>(
        initialColumns.map(col => col.key || col.dataIndex as React.Key)
    );

    // 过滤显示的列
    const visibleColumns = useMemo(() => {
        return initialColumns.filter(col =>
            visibleColKeys.includes(col.key || col.dataIndex as React.Key)
        );
    }, [initialColumns, visibleColKeys]);

    // 动态计算表格滚动高度
    useEffect(() => {
        const calculateHeight = () => {
            if (tableWrapperRef.current) {
                const containerHeight = tableWrapperRef.current.clientHeight;
                const headerHeight = 55;
                const safePadding = 2;
                const availableHeight = containerHeight - headerHeight - safePadding;
                setScrollY(Math.max(availableHeight, 200));
            }
        };

        calculateHeight();
        window.addEventListener('resize', calculateHeight);
        // 监听全屏变化
        document.addEventListener('fullscreenchange', () => {
            setIsFullscreen(!!document.fullscreenElement);
        });

        return () => {
            window.removeEventListener('resize', calculateHeight);
            document.removeEventListener('fullscreenchange', () => { });
        };
    }, []);

    // 全屏切换
    const toggleFullscreen = () => {
        if (!containerRef.current) return;

        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    // 列设置内容
    const columnSettingContent = (
        <div style={{ width: 200 }}>
            <div style={{ padding: '4px 8px', borderBottom: `1px solid ${token.colorBorderSecondary}`, marginBottom: 8 }}>
                <Checkbox
                    indeterminate={visibleColKeys.length > 0 && visibleColKeys.length < initialColumns.length}
                    checked={visibleColKeys.length === initialColumns.length}
                    onChange={e => {
                        if (e.target.checked) {
                            setVisibleColKeys(initialColumns.map(col => col.key || col.dataIndex as React.Key));
                        } else {
                            setVisibleColKeys([]);
                        }
                    }}
                >
                    列展示
                </Checkbox>
            </div>
            <Checkbox.Group
                style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 8px' }}
                value={visibleColKeys}
                onChange={(keys) => setVisibleColKeys(keys)}
            >
                {initialColumns.map(col => (
                    <Checkbox key={col.key || col.dataIndex as React.Key} value={col.key || col.dataIndex as React.Key}>
                        {col.title as React.ReactNode}
                    </Checkbox>
                ))}
            </Checkbox.Group>
        </div>
    );

    return (
        <div ref={containerRef} style={{ flex: 1, display: 'flex', flexDirection: 'column', background: token.colorBgContainer, overflow: 'hidden' }}>
            <Card
                bordered={false}
                bodyStyle={{
                    padding: '24px',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            >
                {/* 工具栏 */}
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space>
                        {toolbarButtons.map((btn, index) => {
                            const isVisible = btn.visible !== false;
                            const isDisabled = btn.needSelection && selectedRowKeys.length === 0;

                            if (!isVisible) return null;

                            return (
                                <Button
                                    key={index}
                                    type={btn.type || 'default'}
                                    icon={btn.icon}
                                    disabled={isDisabled}
                                    onClick={() => btn.onClick(selectedRowKeys, selectedRows)}
                                >
                                    {btn.text}
                                </Button>
                            );
                        })}
                    </Space>

                    <Space size={8}>

                        <Popover
                            content={columnSettingContent}
                            title="列设置"
                            trigger="click"
                            placement="bottomRight"
                            arrow={false}
                        >
                            <Tooltip title="列设置">
                                <Button type="text" icon={<SettingOutlined />} />
                            </Tooltip>
                        </Popover>

                        <Tooltip title={isFullscreen ? "退出全屏" : "全屏"}>
                            <Button
                                type="text"
                                icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                                onClick={toggleFullscreen}
                            />
                        </Tooltip>
                    </Space>
                </div>

                {/* 表格区域 (自适应高度) */}
                <div style={{ flex: 1, overflow: 'hidden' }} ref={tableWrapperRef}>
                    <Table
                        columns={visibleColumns}
                        dataSource={dataSource}
                        rowKey={rowKey}
                        loading={loading}
                        scroll={{ y: scrollY }}
                        pagination={false}
                        rowSelection={rowSelection}
                        size="middle"
                        onChange={onChange}
                    />
                </div>

                {/* 独立分页区域 */}
                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                    <Pagination
                        {...pagination}
                        showSizeChanger
                        showQuickJumper
                        showTotal={(total) => `共 ${total} 条`}
                        size="small"
                    />
                </div>
            </Card>
        </div>
    );
};

export default DataSection;
