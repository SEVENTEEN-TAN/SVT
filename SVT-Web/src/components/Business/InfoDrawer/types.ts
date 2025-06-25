import type { ReactNode } from 'react';
import type { DrawerProps } from 'antd/es/drawer';

// InfoDrawer组件属性
export interface InfoDrawerProps extends Omit<DrawerProps, 'open' | 'onClose'> {
  open: boolean;
  onClose: () => void;
  title?: string | ReactNode;
  width?: number | string;
  children?: ReactNode;
  footer?: ReactNode;
  loading?: boolean;
  className?: string;
  style?: React.CSSProperties;
  
  // 扩展属性
  destroyOnClose?: boolean;
  maskClosable?: boolean;
  keyboard?: boolean;
  placement?: 'top' | 'right' | 'bottom' | 'left';
  size?: 'default' | 'large';
} 