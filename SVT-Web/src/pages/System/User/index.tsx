import React from 'react';
import { Typography, Button, Space } from 'antd';
import { UserOutlined, ToolOutlined } from '@ant-design/icons';
import '@/styles/PageContainer.css';

const { Title, Paragraph } = Typography;

const UserManagement: React.FC = () => {
  return (
    <div className="page-container-center">
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <UserOutlined style={{ fontSize: '64px', color: '#1890ff', marginBottom: '16px' }} />
        <Title level={2}>用户管理</Title>
        <Paragraph style={{ fontSize: '16px', color: '#666', marginBottom: '24px' }}>
          用户管理页面正在开发中...
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

export default UserManagement;
