import React from 'react';
import { Card, Button, Space } from 'antd';
import DataDisplay from '../DataDisplay';
import type { DataManagerProps } from './types';
import './DataManager.css';

const DataManager: React.FC<DataManagerProps> = ({
  // 操作按钮配置
  actions,
  selectedCount = 0,
  actionLoading = false,
  
  // 数据展示配置
  mode,
  data,
  loading = false,
  columns,
  rowKey,
  pagination,
  scroll,
  rowSelection,
  
  // 样式配置
  className = '',
  style,
  
  // 布局配置
  actionBarPosition = 'top',
  showActionBar = true,
  
  // 其他配置
  title,
  extra,
}) => {
  // 渲染操作按钮（不使用ActionBar组件，直接渲染按钮）
  const renderActionButtons = () => {
    if (!showActionBar || !actions?.length) return null;

    return actions
      .filter(action => !action.hidden)
      .map(action => (
        <Button
          key={action.key}
          type={action.type || 'default'}
          icon={action.icon}
          onClick={action.onClick}
          disabled={action.disabled}
          loading={action.loading}
          size="middle"
          style={{ marginLeft: 8 }}
        >
          {action.label}
        </Button>
      ));
  };

  // 渲染数据展示区域
  const renderDataDisplay = () => {
    return (
      <div className="data-manager-content">
        <DataDisplay
          mode={mode}
          data={data}
          loading={loading}
          columns={columns}
          rowKey={rowKey}
          pagination={pagination}
          scroll={scroll}
          rowSelection={rowSelection}
        />
      </div>
    );
  };

  return (
    <div
      className={`data-manager ${className}`}
      style={style}
    >
      <Card
        title={title}
        extra={
          <Space>
            {extra}
            {actionBarPosition === 'top' && renderActionButtons()}
          </Space>
        }
        className="data-manager-card"
        bodyStyle={{ padding: 0 }}
      >
        {/* 数据展示区域 */}
        {renderDataDisplay()}

        {/* 底部操作栏 */}
        {actionBarPosition === 'bottom' && (
          <div className="data-manager-action-bar">
            <Space>
              {renderActionButtons()}
            </Space>
          </div>
        )}
      </Card>
    </div>
  );
};

export default DataManager;
export type { DataManagerProps } from './types';
