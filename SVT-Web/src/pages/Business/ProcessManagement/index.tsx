import React from 'react';
import { Typography, Button, Space } from 'antd';
import { FormOutlined, ToolOutlined } from '@ant-design/icons';
import '@/styles/PageContainer.css';

const { Title, Paragraph } = Typography;

const ProcessManagement: React.FC = () => {
  return (
    <div className="page-container-center">
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <FormOutlined style={{ fontSize: '64px', color: '#1890ff', marginBottom: '16px' }} />
        <Title level={2}>业务处理</Title>
        <Paragraph style={{ fontSize: '16px', color: '#666', marginBottom: '24px' }}>
          业务处理页面正在开发中...
        </Paragraph>
        <Space>
          <Button type="primary" icon={<ToolOutlined />}>
            开始开发
          </Button>
          <Button>
            查看设计文档
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default ProcessManagement;
