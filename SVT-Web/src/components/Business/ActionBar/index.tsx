import React from 'react';
import { Button, Tooltip, Tag } from 'antd';
import type { ActionBarProps, ActionItem } from './types';
import './ActionBar.css';

const ActionBar: React.FC<ActionBarProps> = ({
  actions,
  selectedCount = 0,
  loading = false,
  className,
  style,
  layout = 'horizontal',
  size = 'middle',
  align = 'left'
}) => {
  
  // 渲染单个按钮
  const renderAction = (action: ActionItem) => {
    const {
      key,
      label,
      type = 'default',
      icon,
      onClick,
      disabled = false,
      hidden = false,
      loading: actionLoading = false,
      tooltip
    } = action;

    if (hidden) {
      return null;
    }

    const button = (
      <Button
        key={key}
        type={type}
        icon={icon}
        size={size}
        disabled={disabled || loading}
        loading={actionLoading}
        onClick={onClick}
      >
        {label}
      </Button>
    );

    // 如果有tooltip，用Tooltip包装
    return tooltip ? (
      <Tooltip key={key} title={tooltip}>
        {button}
      </Tooltip>
    ) : button;
  };

  // 过滤可见的操作
  const visibleActions = actions.filter(action => !action.hidden);

  return (
    <div 
      className={`action-bar ${className || ''}`}
      style={style}
    >
      <div className={`action-bar-${layout} action-bar-${align}`}>
        {/* 选择信息 */}
        {selectedCount > 0 && (
          <div className="action-bar-selection-info">
            已选择
            <Tag color="blue">{selectedCount}</Tag>
            项
          </div>
        )}
        
        {/* 操作按钮 */}
        {visibleActions.map(renderAction)}
      </div>
    </div>
  );
};

export default ActionBar; 