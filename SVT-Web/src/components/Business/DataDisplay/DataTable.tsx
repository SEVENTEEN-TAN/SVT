import React from 'react';
import { Table, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { DataDisplayProps, ColumnConfig } from './types';

interface DataTableProps extends Pick<DataDisplayProps, 
  'data' | 'loading' | 'columns' | 'rowKey' | 'pagination' | 'scroll' | 'rowSelection' | 'onRowClick' | 'onRowDoubleClick'
> {}

const DataTable: React.FC<DataTableProps> = ({
  data,
  loading,
  columns = [],
  rowKey = 'id',
  pagination,
  scroll,
  rowSelection,
  onRowClick,
  onRowDoubleClick
}) => {
  
  // 转换列配置为Ant Design Table格式
  const tableColumns: ColumnsType<any> = columns.map((col: ColumnConfig) => ({
    key: col.key,
    title: col.title,
    dataIndex: col.dataIndex,
    width: col.width,
    fixed: col.fixed,
    align: col.align,
    sorter: col.sorter,
    render: col.render,
    ellipsis: col.ellipsis
  }));

  return (
    <Table
      dataSource={data}
      columns={tableColumns}
      loading={loading}
      rowKey={rowKey}
      pagination={pagination}
      scroll={scroll}
      rowSelection={rowSelection}
      onRow={(record, index) => ({
        onClick: () => onRowClick?.(record, index),
        onDoubleClick: () => onRowDoubleClick?.(record, index),
      })}
      locale={{
        emptyText: <Empty description="暂无数据" />
      }}
      size="middle"
    />
  );
};

export default DataTable; 