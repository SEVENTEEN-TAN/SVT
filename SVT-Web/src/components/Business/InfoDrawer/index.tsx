import React from 'react';
import { Drawer, Spin } from 'antd';
import type { InfoDrawerProps } from './types';
import './InfoDrawer.css';

const InfoDrawer: React.FC<InfoDrawerProps> = ({
  open,
  onClose,
  title = '详情',
  width = 520,
  children,
  footer,
  loading = false,
  className,
  style,
  destroyOnClose = true,
  maskClosable = true,
  keyboard = true,
  placement = 'right',
  size = 'default',
  ...restProps
}) => {
  
  // 根据size设置默认width
  const drawerWidth = size === 'large' ? 720 : width;

  return (
    <Drawer
      title={title}
      width={drawerWidth}
      open={open}
      onClose={onClose}
      destroyOnClose={destroyOnClose}
      maskClosable={maskClosable}
      keyboard={keyboard}
      placement={placement}
      className={`info-drawer ${className || ''}`}
      style={style}
      {...restProps}
    >
      {loading ? (
        <div className="info-drawer-loading">
          <Spin size="large" />
        </div>
      ) : (
        <div className="info-drawer-content">
          {children}
        </div>
      )}
      
      {/* 底部操作区域 */}
      {footer && (
        <div className="info-drawer-footer">
          {footer}
        </div>
      )}
    </Drawer>
  );
};

export default InfoDrawer; 