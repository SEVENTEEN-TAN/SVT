/**
 * 页面刷新加载组件
 * 
 * 职责：
 * - 提供页面刷新时的加载动画
 * - 支持自定义加载文本和样式
 * 
 * @author SVT Team
 * @since 2025-06-29
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface PageRefreshLoadingProps {
  /** 加载文本 */
  text?: string;
  /** 是否显示 */
  visible?: boolean;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 加载图标大小 */
  size?: 'small' | 'default' | 'large';
  /** 最小显示时间（毫秒），确保用户能看到加载动画 */
  minShowTime?: number;
}

/**
 * 自定义加载图标
 */
const CustomLoadingIcon = () => (
  <LoadingOutlined 
    style={{ 
      fontSize: 32, 
      color: '#1890ff',
      animation: 'spin 1s linear infinite'
    }} 
    spin 
  />
);

/**
 * 页面刷新加载组件
 */
const PageRefreshLoading: React.FC<PageRefreshLoadingProps> = ({
  text = '页面刷新中...',
  visible = true,
  style,
  size = 'large',
  minShowTime = 200
}) => {
  const [shouldShow, setShouldShow] = useState(visible);
  const [showStartTime, setShowStartTime] = useState<number | null>(null);

  useEffect(() => {
    if (visible) {
      setShouldShow(true);
      setShowStartTime(Date.now());
    } else if (showStartTime) {
      const elapsed = Date.now() - showStartTime;
      const remainingTime = Math.max(0, minShowTime - elapsed);

      if (remainingTime > 0) {
        const timer = setTimeout(() => {
          setShouldShow(false);
          setShowStartTime(null);
        }, remainingTime);
        return () => clearTimeout(timer);
      } else {
        setShouldShow(false);
        setShowStartTime(null);
      }
    }
  }, [visible, showStartTime, minShowTime]);

  if (!shouldShow) return null;

  const defaultStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(255, 255, 255, 0.9)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    animation: 'fadeIn 0.3s ease-in-out',
    backdropFilter: 'blur(2px)',
    ...style
  };

  const textStyle: React.CSSProperties = {
    marginTop: 16,
    color: '#666',
    fontSize: 14,
    fontWeight: 400,
    animation: 'pulse 2s ease-in-out infinite'
  };

  return (
    <div style={defaultStyle}>
      <Spin 
        size={size}
        indicator={size === 'large' ? <CustomLoadingIcon /> : undefined}
      />
      <div style={textStyle}>
        {text}
      </div>
    </div>
  );
};

export default PageRefreshLoading;
