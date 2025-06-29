import React, { useState } from 'react';
import {
  Button,
  Space,
  Switch,
  Dropdown,
  message,
  Modal,
  Form,
  Input,
  Select,
  Card,
  Collapse,
  Row,
  Col,
  Table,
  Drawer,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  CheckOutlined,
  StopOutlined,
  DeleteOutlined,
  ReloadOutlined,
  DownOutlined,
  EyeOutlined,
  EditOutlined,
  SearchOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import '@/styles/PageContainer.css';
import './RoleManagement.css';

// 角色数据类型定义
interface RoleData {
  roleId: string;
  roleName: string;
  roleCode: string;
  roleDesc: string;
  status: '0' | '1'; // 0-启用 1-停用
  createTime: string;
  updateTime: string;
  userCount: number; // 关联用户数
  permissions: string[]; // 权限列表
}

// 模拟角色数据
const mockRoleData: RoleData[] = [
  {
    roleId: 'R001',
    roleName: '系统管理员',
    roleCode: 'ADMIN',
    roleDesc: '系统最高权限管理员，拥有所有功能权限',
    status: '0',
    createTime: '2024-01-15 10:30:00',
    updateTime: '2024-06-20 14:20:00',
    userCount: 2,
    permissions: ['system:user:*', 'system:role:*', 'system:menu:*', 'system:log:*']
  },
  {
    roleId: 'R002',
    roleName: '业务管理员',
    roleCode: 'BUSINESS_ADMIN',
    roleDesc: '业务模块管理员，负责业务数据管理',
    status: '0',
    createTime: '2024-02-10 09:15:00',
    updateTime: '2024-06-18 16:45:00',
    userCount: 5,
    permissions: ['business:data:*', 'business:report:view', 'system:user:view']
  },
  {
    roleId: 'R003',
    roleName: '普通用户',
    roleCode: 'USER',
    roleDesc: '普通用户角色，只能查看基础信息',
    status: '0',
    createTime: '2024-03-05 11:20:00',
    updateTime: '2024-06-15 10:30:00',
    userCount: 15,
    permissions: ['system:profile:view', 'business:data:view']
  },
  {
    roleId: 'R004',
    roleName: '审核员',
    roleCode: 'AUDITOR',
    roleDesc: '负责业务数据审核的角色',
    status: '1',
    createTime: '2024-04-12 14:10:00',
    updateTime: '2024-06-10 09:25:00',
    userCount: 3,
    permissions: ['business:audit:*', 'business:data:view']
  },
  {
    roleId: 'R005',
    roleName: '财务专员',
    roleCode: 'FINANCE',
    roleDesc: '财务相关功能操作权限',
    status: '0',
    createTime: '2024-05-08 16:30:00',
    updateTime: '2024-06-25 11:15:00',
    userCount: 4,
    permissions: ['finance:*', 'business:report:view']
  }
];

const RoleManagement: React.FC = () => {
  // 状态管理
  const [roleData] = useState<RoleData[]>(mockRoleData);
  const [selectedRows, setSelectedRows] = useState<RoleData[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | 'view'>('view');

  // 表单实例
  const [searchForm] = Form.useForm();
  const [drawerForm] = Form.useForm();

  // 处理搜索
  const handleSearch = () => {
    searchForm.validateFields().then((values) => {
      console.log('搜索参数:', values);
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        message.success('搜索完成');
      }, 1000);
    });
  };

  // 处理重置
  const handleReset = () => {
    searchForm.resetFields();
    handleSearch();
  };

  // 刷新数据
  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success('数据刷新成功');
    }, 1000);
  };

  // 批量状态更新
  const batchUpdateStatus = async (status: '0' | '1') => {
    if (selectedRows.length === 0) {
      message.warning('请先选择要操作的角色');
      return;
    }

    Modal.confirm({
      title: `确认${status === '0' ? '启用' : '停用'}选中的角色吗？`,
      content: `将${status === '0' ? '启用' : '停用'} ${selectedRows.length} 个角色`,
      onOk: () => {
        message.success(`批量${status === '0' ? '启用' : '停用'}成功`);
        setSelectedRows([]);
        setSelectedRowKeys([]);
      }
    });
  };

  // 批量删除
  const batchDelete = () => {
    if (selectedRows.length === 0) {
      message.warning('请先选择要删除的角色');
      return;
    }

    Modal.confirm({
      title: '确认删除选中的角色吗？',
      content: `将删除 ${selectedRows.length} 个角色，此操作不可恢复`,
      okType: 'danger',
      onOk: () => {
        message.success('批量删除成功');
        setSelectedRows([]);
        setSelectedRowKeys([]);
      }
    });
  };

  // 处理行选择
  const handleSelectionChange = (selectedRowKeys: React.Key[], selectedRows: RoleData[]) => {
    setSelectedRows(selectedRows);
    setSelectedRowKeys(selectedRowKeys);
  };

  // 处理行查看
  const handleRowView = (record: RoleData) => {
    setDrawerMode('view');
    setDrawerOpen(true);
    drawerForm.setFieldsValue(record);
  };

  // 处理行编辑
  const handleRowEdit = (record: RoleData) => {
    setDrawerMode('edit');
    setDrawerOpen(true);
    drawerForm.setFieldsValue(record);
  };

  // 处理删除
  const handleDelete = (record: RoleData) => {
    Modal.confirm({
      title: `确定删除角色 [${record.roleName}] 吗?`,
      content: '此操作不可逆，请谨慎操作。',
      onOk: () => {
        message.success('删除成功');
      },
    });
  };

  // 处理表单提交
  const handleSubmit = () => {
    drawerForm.validateFields().then((values: any) => {
      console.log('Form values:', values);
      setDrawerOpen(false);
      message.success(drawerMode === 'create' ? '创建成功' : '更新成功');
    });
  };

  // 表格列配置
  const columns = [
    {
      key: 'roleName',
      title: '角色名称',
      dataIndex: 'roleName',
      width: 150,
      render: (text: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TeamOutlined style={{ color: '#1890ff' }} />
          <span style={{ fontWeight: 500 }}>{text}</span>
        </div>
      )
    },
    {
      key: 'roleCode',
      title: '角色编码',
      dataIndex: 'roleCode',
      width: 120,
      render: (text: string) => <code style={{ fontSize: '12px', background: '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>{text}</code>
    },
    {
      key: 'roleDesc',
      title: '角色描述',
      dataIndex: 'roleDesc',
      width: 200,
      ellipsis: true,
    },
    {
      key: 'userCount',
      title: '关联用户',
      dataIndex: 'userCount',
      width: 100,
      align: 'center' as const,
      render: (count: number) => (
        <Tag color={count > 0 ? 'blue' : 'default'}>
          {count} 人
        </Tag>
      )
    },
    {
      key: 'status',
      title: '状态',
      dataIndex: 'status',
      width: 100,
      align: 'center' as const,
      render: (status: string) => (
        <Switch
          checked={status === '0'}
          checkedChildren="启用"
          unCheckedChildren="停用"
          size="small"
        />
      )
    },
    {
      key: 'createTime',
      title: '创建时间',
      dataIndex: 'createTime',
      width: 160,
      render: (text: string) => <span style={{ fontSize: '12px', color: '#666' }}>{text}</span>
    },
    {
      key: 'actions',
      title: '操作',
      dataIndex: 'actions',
      width: 180,
      align: 'center' as const,
      render: (_: any, record: RoleData) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleRowView(record)}
          >
            详情
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleRowEdit(record)}
          >
            编辑
          </Button>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'permissions',
                  label: '权限配置',
                  icon: <CheckOutlined />,
                },
                {
                  key: 'users',
                  label: '关联用户',
                  icon: <TeamOutlined />,
                },
                {
                  key: 'delete',
                  label: '删除',
                  icon: <DeleteOutlined />,
                  danger: true
                }
              ],
              onClick: ({ key }) => {
                if (key === 'delete') {
                  handleDelete(record);
                } else if (key === 'permissions') {
                  message.info('权限配置功能开发中...');
                } else if (key === 'users') {
                  message.info('关联用户功能开发中...');
                }
              }
            }}
          >
            <Button type="link" size="small">
              更多 <DownOutlined />
            </Button>
          </Dropdown>
        </Space>
      )
    }
  ];

  return (
    <div className="page-container-management">
      {/* 检索区域 */}
      <div className="search-section">
        <Collapse
          className="search-collapse"
          items={[
            {
              key: 'search',
              label: '搜索条件',
              children: (
                <Form
                  form={searchForm}
                  className="search-form"
                  layout="vertical"
                  onFinish={handleSearch}
                >
                  <Row gutter={[16, 8]}>
                    <Col span={6}>
                      <Form.Item name="roleName" label="角色名称">
                        <Input placeholder="请输入角色名称" />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item name="roleCode" label="角色编码">
                        <Input placeholder="请输入角色编码" />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item name="status" label="状态">
                        <Select placeholder="请选择状态" allowClear>
                          <Select.Option value="0">启用</Select.Option>
                          <Select.Option value="1">停用</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item label=" " colon={false}>
                        <div className="search-actions">
                          <Button
                            type="primary"
                            icon={<SearchOutlined />}
                            onClick={handleSearch}
                            loading={loading}
                          >
                            搜索
                          </Button>
                          <Button onClick={handleReset}>
                            重置
                          </Button>
                        </div>
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              ),
            }
          ]}
          defaultActiveKey={['search']}
          ghost
        />
      </div>

      {/* 数据管理区域 */}
      <Card
        className="data-section"
        title="角色列表"
        extra={
          <div className="action-buttons">
            <div className="action-buttons-left">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setDrawerMode('create');
                  setDrawerOpen(true);
                  drawerForm.resetFields();
                }}
              >
                新增角色
              </Button>
              <Button
                icon={<CheckOutlined />}
                disabled={selectedRows.length === 0}
                onClick={() => batchUpdateStatus('0')}
              >
                批量启用
              </Button>
              <Button
                icon={<StopOutlined />}
                disabled={selectedRows.length === 0}
                onClick={() => batchUpdateStatus('1')}
              >
                批量停用
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                disabled={selectedRows.length === 0}
                onClick={batchDelete}
              >
                批量删除
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={refreshData}
              >
                刷新
              </Button>
            </div>
            {selectedRows.length > 0 && (
              <div className="batch-info">
                已选择 {selectedRows.length} 项
              </div>
            )}
          </div>
        }
      >
        {/* 数据表格 */}
        <Table
          className="data-table"
          columns={columns}
          dataSource={roleData}
          rowKey="roleId"
          loading={loading}
          pagination={{
            total: roleData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          }}
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys: selectedRowKeys,
            onChange: handleSelectionChange,
          }}
          scroll={{
            y: 500, // 使用固定高度，避免复杂的动态监听
            x: 'max-content'
          }}
        />
      </Card>

      {/* 抽屉 */}
      <Drawer
        className="info-drawer"
        title={
          drawerMode === 'create' ? '新增角色' :
          drawerMode === 'edit' ? '编辑角色' : '查看角色'
        }
        width={520}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <div className="drawer-form-content">
          <Form
            form={drawerForm}
            layout="vertical"
            disabled={drawerMode === 'view'}
            className="drawer-form"
          >
            <Form.Item name="roleName" label="角色名称" rules={[{ required: true }]}>
              <Input placeholder="请输入角色名称" />
            </Form.Item>
            <Form.Item name="roleCode" label="角色编码" rules={[{ required: true }]}>
              <Input placeholder="请输入角色编码" />
            </Form.Item>
            <Form.Item name="roleDesc" label="角色描述">
              <Input.TextArea
                placeholder="请输入角色描述"
                rows={3}
                maxLength={200}
                showCount
              />
            </Form.Item>
            <Form.Item name="status" label="角色状态" rules={[{ required: true }]}>
              <Select placeholder="请选择角色状态">
                <Select.Option value="0">启用</Select.Option>
                <Select.Option value="1">停用</Select.Option>
              </Select>
            </Form.Item>
            {drawerMode === 'view' && (
              <>
                <Form.Item name="userCount" label="关联用户数">
                  <Input disabled />
                </Form.Item>
                <Form.Item name="createTime" label="创建时间">
                  <Input disabled />
                </Form.Item>
                <Form.Item name="updateTime" label="更新时间">
                  <Input disabled />
                </Form.Item>
              </>
            )}
          </Form>
        </div>

        {/* 底部操作按钮 */}
        {drawerMode !== 'view' && (
          <div className="drawer-actions">
            <Button onClick={() => setDrawerOpen(false)}>
              取消
            </Button>
            <Button type="primary" onClick={handleSubmit}>
              {drawerMode === 'create' ? '创建' : '保存'}
            </Button>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default RoleManagement;
