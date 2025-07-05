import React from 'react';
import { Typography } from 'antd';
import { STYLES } from '@/components/Layout/shared/utils/layoutUtils';

const { Text } = Typography;

interface LogoProps {
  collapsed: boolean;
}

const Logo: React.FC<LogoProps> = ({ collapsed }) => {
  return (
    <div style={STYLES.LOGO.container(collapsed)}>
      <Text strong style={STYLES.LOGO.text(collapsed)}>
        {collapsed ? 'SVT' : 'SVT 系统'}
      </Text>
    </div>
  );
};

export default Logo; 