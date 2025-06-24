import React from 'react';
import { Spin, Typography } from 'antd';
import { STYLES } from '../../shared/utils/layoutUtils';

const { Text } = Typography;

interface PageLoaderProps {
  loading: boolean;
  text?: string;
}

const PageLoader: React.FC<PageLoaderProps> = ({ loading, text = '页面刷新中...' }) => {
  if (!loading) {
    return null;
  }

  return (
    <div style={STYLES.LOADING.pageRefresh}>
      <Spin size="large" />
      <Text style={STYLES.LOADING.pageRefreshText}>
        {text}
      </Text>
    </div>
  );
};

export default PageLoader; 