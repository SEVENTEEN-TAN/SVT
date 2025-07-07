import React, { useState } from 'react';
import {
  Button,
  Card,
  Collapse,
  Form,
  Input,
  Row,
  Col,
  Space,
  Table
} from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useMobile } from '@/hooks/useMobile';
import '@/styles/PageContainer.css';
import '../BusinessPage.css';

interface ProcessRecord {
  id: string;
  name: string;
  status: string;
}

const ProcessManagement: React.FC = () => {
  const isMobile = useMobile();
  const [form] = Form.useForm();
  const [data] = useState<ProcessRecord[]>([
    { id: '1', name: '流程A', status: '待处理' },
    { id: '2', name: '流程B', status: '已完成' }
  ]);

  const columns = [
    { title: '流程名称', dataIndex: 'name', key: 'name' },
    { title: '状态', dataIndex: 'status', key: 'status', width: 120 }
  ];

  const handleSearch = () => {
    const values = form.getFieldsValue();
    console.log('search', values);
  };

  const handleReset = () => {
    form.resetFields();
  };

  const items = [
    {
      key: '1',
      label: '搜索条件',
      children: (
        <Form
          form={form}
          layout="inline"
          className="search-form-inline"
          onFinish={handleSearch}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8} lg={6} xl={6}>
              <Form.Item name="keyword" label="关键字">
                <Input
                  placeholder="请输入关键字"
                  allowClear
                  onPressEnter={handleSearch}
                />
              </Form.Item>
            </Col>
            <Col flex="auto">
              <Space>
                <Button icon={<ReloadOutlined />} onClick={handleReset}>
                  重置
                </Button>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  htmlType="submit"
                >
                  搜索
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      )
    }
  ];

  return (
    <div className="page-container-management">
      <Collapse
        className="search-collapse card-wrapper"
        bordered={false}
        defaultActiveKey={isMobile ? undefined : '1'}
        items={items}
      />
      <Card className="data-card card-wrapper" title="流程列表">
        <Table rowKey="id" columns={columns} dataSource={data} pagination={false} />
      </Card>
    </div>
  );
};

export default ProcessManagement;
