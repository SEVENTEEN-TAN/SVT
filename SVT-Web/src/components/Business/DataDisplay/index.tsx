import React from 'react';
import { Empty } from 'antd';
import DataTable from './DataTable';
import type { DataDisplayProps } from './types';
import './DataDisplay.css';

const DataDisplay: React.FC<DataDisplayProps> = ({
  mode,
  data,
  loading = false,
  className,
  style,
  columns,
  rowKey = 'id',
  pagination,
  scroll,
  rowSelection,
  onRowClick,
  onRowDoubleClick,
  listItemRender,
  treeProps
}) => {

  // 渲染列表模式
  const renderList = () => {
    if (!data || data.length === 0) {
      return (
        <div className="data-display-empty">
          <Empty description="暂无数据" />
        </div>
      );
    }

    return (
      <div className="data-display-list">
        {data.map((item, index) => (
          <div
            key={typeof rowKey === 'function' ? rowKey(item) : item[rowKey as string] || index}
            className="data-display-list-item"
            onClick={() => onRowClick?.(item, index)}
            onDoubleClick={() => onRowDoubleClick?.(item, index)}
          >
            {listItemRender ? listItemRender(item, index) : (
              <div>
                {/* 默认列表项渲染 */}
                {Object.entries(item).map(([key, value]) => (
                  <div key={key}>
                    <strong>{key}:</strong> {String(value)}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // 渲染树形模式
  const renderTree = () => {
    return (
      <div className="data-display-tree">
        <div className="data-display-empty">
          <Empty description="树形模式开发中..." />
        </div>
      </div>
    );
  };

  // 根据模式渲染内容
  const renderContent = () => {
    switch (mode) {
      case 'table':
        return (
          <DataTable
            data={data}
            loading={loading}
            columns={columns}
            rowKey={rowKey}
            pagination={pagination}
            scroll={scroll}
            rowSelection={rowSelection}
            onRowClick={onRowClick}
            onRowDoubleClick={onRowDoubleClick}
          />
        );
      
      case 'list':
        return renderList();
      
      case 'tree':
        return renderTree();
      
      default:
        return (
          <div className="data-display-empty">
            <Empty description="不支持的显示模式" />
          </div>
        );
    }
  };

  return (
    <div 
      className={`data-display data-display-${mode} ${className || ''}`}
      style={style}
    >
      {renderContent()}
    </div>
  );
};

export default DataDisplay; 