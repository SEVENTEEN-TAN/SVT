import React from 'react';
import { Spin } from 'antd';

interface PageLoadingProps {
  message?: string;
}

const PageLoading: React.FC<PageLoadingProps> = ({ message = "页面加载中..." }) => (
  <Spin size="large" tip={message} fullscreen />
);

export default PageLoading;