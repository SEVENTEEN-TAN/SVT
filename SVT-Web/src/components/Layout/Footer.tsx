import React from 'react';
import { Layout, Typography, Space } from 'antd';
import { CopyrightOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/stores/authStore';
import { appConfig } from '@/config/env';

const { Footer: AntdFooter } = Layout;
const { Text } = Typography;

const Footer: React.FC = () => {
  const { user } = useAuthStore();
  const currentYear = import.meta.env.VITE_FOOTER_YEAR || new Date().getFullYear();
  const copyrightName = import.meta.env.VITE_FOOTER_COPYRIGHT || 'SVT System';

  return (
    <AntdFooter
      style={{
        height: 48,
        padding: '0 24px',
        background: '#fff',
        borderTop: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.04)',
        marginTop: 'auto',
      }}
    >
      {/* 左侧版权信息 */}
      <Space size="small">
        <CopyrightOutlined style={{ color: '#666' }} />
        <Text type="secondary">
          {currentYear} {copyrightName}. All rights reserved.
        </Text>
      </Space>

      {/* 右侧版本信息 */}
      <div style={{ textAlign: 'right', lineHeight: '14px' }}>
        <div>
          <Text style={{ fontSize: '10px', color: '#bfbfbf' }}>
            前端版本：v{appConfig.appVersion}
          </Text>
        </div>
        <div>
          <Text style={{ fontSize: '10px', color: '#bfbfbf' }}>
            后端版本：v{user?.serverVersion || '1.0.0'}
          </Text>
        </div>
      </div>
    </AntdFooter>
  );
};

export default Footer; 