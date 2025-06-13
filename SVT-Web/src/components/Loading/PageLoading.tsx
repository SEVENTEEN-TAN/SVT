import React from 'react';
import { Spin } from 'antd';

const PageLoading: React.FC = () => (
  <Spin size="large" tip="页面加载中..." fullscreen />
);

export default PageLoading; 