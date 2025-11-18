// {{CHENGQI:
// Action: Modified; Timestamp: 2025-07-02 XX:XX:XX +08:00; Reason: 完整实现用户管理页面，参考角色管理设计; Principle_Applied: 组件模块化设计;
// }}

import React, { useState, useEffect } from 'react';
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
  Table,
  Drawer,
  Tag,
  App,
  Spin,
  DatePicker,
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
  UserOutlined,
  ExclamationCircleFilled,
  KeyOutlined,
  TeamOutlined,
  BankOutlined,
} from '@ant-design/icons';
import '@/styles/PageContainer.css';
import './UserManagement.css';

// 导入API和类型
import userApi, { type UserData, type UserConditionDTO, type InsertOrUpdateUserDetailDTO } from '@/api/system/userApi';
import roleApi, { type ActiveRole } from '@/api/system/roleApi';
import type { PageQuery } from '@/types/api';

const { RangePicker } = DatePicker;

const UserManagement: React.FC = () => {
  const { modal } = App.useApp();

  // 状态管理
  const [userData, setUserData] = useState<UserData[]>([]);
  const [selectedRows, setSelectedRows] = useState<UserData[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | 'view'>('view');
  const [currentRecord, setCurrentRecord] = useState<UserData | null>(null);

  // 分页状态
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 当前搜索条件状态
  const [currentSearchParams, setCurrentSearchParams] = useState<UserConditionDTO>({});

  // 角色数据状态(用于下拉选择)
  const [roleList, setRoleList] = useState<ActiveRole[]>([]);

  // 角色分配弹窗状态
  const [roleAssignModalOpen, setRoleAssignModalOpen] = useState(false);
  const [roleAssignLoading, setRoleAssignLoading] = useState(false);
  const [selectedUserForRole, setSelectedUserForRole] = useState<UserData | null>(null);
  const [userCurrentRoles, setUserCurrentRoles] = useState<string[]>([]);

  // 表单实例
  const [searchForm] = Form.useForm();
  const [drawerForm] = Form.useForm();
  const [roleAssignForm] = Form.useForm();

  // 组件初始化时加载数据
  useEffect(() => {
    loadUserData();
    loadRoleList();
  }, []);

  // 加载角色列表（用于筛选和分配）
  const loadRoleList = async () => {
    try {
      const result = await roleApi.getActiveRoleList();
      setRoleList(result || []);
    } catch (error: any) {
      console.error('加载角色列表失败:', error);
    }
  };

  // 加载用户数据
  const loadUserData = async (searchParams?: UserConditionDTO, pageNum?: number, pageSize?: number) => {
    setLoading(true);
    try {
      // 如果提供了新的搜索参数，保存它们
      const searchCondition = searchParams !== undefined ? searchParams : currentSearchParams;
      if (searchParams !== undefined) {
        setCurrentSearchParams(searchParams);
      }

      // 过滤掉空值和空字符串
      const filteredCondition = Object.fromEntries(
        Object.entries(searchCondition).filter(([_, value]) => 
          value !== undefined && value !== null && value !== ''
        )
      );

      const params: PageQuery<UserConditionDTO> = {
        pageNumber: pageNum || pagination.current,
        pageSize: pageSize || pagination.pageSize,
        condition: filteredCondition
      };
      
      const result = await userApi.getUserList(params);
      
      setUserData(result.records || []);
      setPagination(prev => ({
        ...prev,
        current: pageNum || prev.current,
        pageSize: pageSize || prev.pageSize,
        total: result.total || 0
      }));
    } catch (error: any) {
      console.error('加载用户数据失败:', error);
      message.error(error.message || '加载用户数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理搜索
  const handleSearch = async () => {
    try {
      // 获取表单值，不需要验证，因为搜索可以是空条件
      const values = searchForm.getFieldsValue();
      
      // 处理时间范围
      if (values.createTimeRange && values.createTimeRange.length === 2) {
        values.createTimeStart = values.createTimeRange[0].format('YYYY-MM-DD');
        values.createTimeEnd = values.createTimeRange[1].format('YYYY-MM-DD');
        delete values.createTimeRange;
      }
      
      await loadUserData(values, 1); // 重置到第一页
    } catch (error: any) {
      console.error('搜索失败:', error);
      message.error(error.message || '搜索失败');
    }
  };

  // 处理重置
  const handleReset = () => {
    searchForm.resetFields();
    setCurrentSearchParams({});
    loadUserData({}, 1); // 清空搜索条件并重置到第一页
  };

  // 刷新数据
  const refreshData = () => {
    loadUserData(); // 使用当前搜索条件刷新
  };

  // 批量状态更新
  const batchUpdateStatus = async (status: '0' | '1') => {
    if (selectedRows.length === 0) {
      message.warning('请先选择要操作的用户');
      return;
    }

    modal.confirm({
      title: `确认${status === '0' ? '启用' : '停用'}选中的用户吗？`,
      content: `将${status === '0' ? '启用' : '停用'} ${selectedRows.length} 个用户`,
      icon: <ExclamationCircleFilled />,
      onOk: async () => {
        try {
          const userIds = selectedRows.map(row => row.userId);
          await userApi.batchUpdateStatus(userIds, status);
          message.success(`批量${status === '0' ? '启用' : '停用'}成功`);
          setSelectedRows([]);
          setSelectedRowKeys([]);
          await loadUserData(); // 保持当前搜索条件刷新
        } catch (error: any) {
          console.error('批量更新状态失败:', error);
          message.error(error.message || '批量更新状态失败');
        }
      }
    });
  };

  // 批量删除
  const batchDelete = () => {
    if (selectedRows.length === 0) {
      message.warning('请先选择要删除的用户');
      return;
    }

    modal.confirm({
      title: '确认删除选中的用户吗？',
      content: `将删除 ${selectedRows.length} 个用户，此操作不可恢复`,
      icon: <ExclamationCircleFilled />,
      okType: 'danger',
      onOk: async () => {
        try {
          const userIds = selectedRows.map(row => row.userId);
          await userApi.batchDelete(userIds);
          message.success('批量删除成功');
          setSelectedRows([]);
          setSelectedRowKeys([]);
          await loadUserData();
        } catch (error: any) {
          console.error('批量删除失败:', error);
          message.error(error.message || '批量删除失败');
        }
      }
    });
  };

  // 处理行选择
  const handleSelectionChange = (selectedRowKeys: React.Key[], selectedRows: UserData[]) => {
    setSelectedRows(selectedRows);
    setSelectedRowKeys(selectedRowKeys);
  };

  // 处理行查看
  const handleRowView = async (record: UserData) => {
    setDrawerMode('view');
    setCurrentRecord(record);
    setDrawerOpen(true);
    setDrawerLoading(true);

    try {
      const userDetail = await userApi.getUserDetail(record.userId);
      drawerForm.setFieldsValue(userDetail);
    } catch (error: any) {
      console.error('获取用户详情失败:', error);
      message.error(error.message || '获取用户详情失败');
      // 如果获取失败，使用当前记录的数据
      drawerForm.setFieldsValue(record);
    } finally {
      setDrawerLoading(false);
    }
  };

  // 处理行编辑
  const handleRowEdit = async (record: UserData) => {
    setDrawerMode('edit');
    setCurrentRecord(record);
    setDrawerOpen(true);
    setDrawerLoading(true);

    try {
      const userDetail = await userApi.getUserDetail(record.userId);
      drawerForm.setFieldsValue(userDetail);
    } catch (error: any) {
      console.error('获取用户详情失败:', error);
      message.error(error.message || '获取用户详情失败');
      // 如果获取失败，使用当前记录的数据
      drawerForm.setFieldsValue(record);
    } finally {
      setDrawerLoading(false);
    }
  };

  // 处理删除
  const handleDelete = (record: UserData) => {
    modal.confirm({
      title: `确定删除用户 [${record.userNameZh}] 吗?`,
      content: '此操作不可逆，请谨慎操作。',
      icon: <ExclamationCircleFilled />,
      okType: 'danger',
      onOk: async () => {
        try {
          await userApi.deleteUser(record.userId);
          message.success('删除成功');
          await loadUserData();
        } catch (error: any) {
          console.error('删除失败:', error);
          message.error(error.message || '删除失败');
        }
      },
    });
  };

  // 处理状态切换
  const handleStatusChange = async (record: UserData, checked: boolean) => {
    const status = checked ? '0' : '1';
    try {
      await userApi.updateUserStatus(record.userId, status);
      message.success(`${checked ? '启用' : '停用'}成功`);
      await loadUserData();
    } catch (error: any) {
      console.error('状态更新失败:', error);
      message.error(error.message || '状态更新失败');
    }
  };

  // 处理密码重置
  const handleResetPassword = (record: UserData) => {
    modal.confirm({
      title: `重置用户 [${record.userNameZh}] 的密码`,
      content: '密码将重置为：123456，请提醒用户及时修改密码。',
      icon: <ExclamationCircleFilled />,
      onOk: async () => {
        try {
          await userApi.resetPassword(record.userId, '123456');
          message.success('密码重置成功');
        } catch (error: any) {
          console.error('密码重置失败:', error);
          message.error(error.message || '密码重置失败');
        }
      },
    });
  };

  // 处理角色分配
  const handleRoleAssign = async (record: UserData) => {
    setSelectedUserForRole(record);
    setRoleAssignModalOpen(true);
    setRoleAssignLoading(true);

    try {
      // 获取用户当前角色
      const currentRoles = await userApi.getUserRoles(record.userId);
      setUserCurrentRoles(currentRoles);
      roleAssignForm.setFieldsValue({
        roleIds: currentRoles
      });
    } catch (error: any) {
      console.error('获取用户角色失败:', error);
      message.error(error.message || '获取用户角色失败');
      setUserCurrentRoles([]);
    } finally {
      setRoleAssignLoading(false);
    }
  };

  // 提交角色分配
  const handleRoleAssignSubmit = async () => {
    try {
      const values = await roleAssignForm.validateFields();
      const roleIds = values.roleIds || [];

      await userApi.assignUserRoles(selectedUserForRole!.userId, roleIds);
      message.success('角色分配成功');
      setRoleAssignModalOpen(false);
      await loadUserData(); // 刷新用户列表
    } catch (error: any) {
      console.error('角色分配失败:', error);
      message.error(error.message || '角色分配失败');
    }
  };

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await drawerForm.validateFields();
      
      const submitData: InsertOrUpdateUserDetailDTO = {
        userId: drawerMode === 'edit' ? currentRecord?.userId : undefined,
        loginId: values.loginId,
        password: values.password,
        userNameZh: values.userNameZh,
        userNameEn: values.userNameEn,
        status: values.status,
        remark: values.remark
      };

      await userApi.insertOrUpdateUser(submitData);
      setDrawerOpen(false);
      message.success(drawerMode === 'create' ? '创建成功' : '更新成功');
      await loadUserData();
    } catch (error: any) {
      console.error('提交失败:', error);
      message.error(error.message || '提交失败');
    }
  };

  // 处理分页变化
  const handleTableChange = (paginationConfig: any) => {
    const { current, pageSize } = paginationConfig;
    loadUserData(undefined, current, pageSize); // 保持当前搜索条件，只改变分页
  };

  // 表格列配置
  const columns = [
    {
      key: 'userNameZh',
      title: '用户姓名',
      dataIndex: 'userNameZh',
      width: 150,
      render: (text: string, record: UserData) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserOutlined style={{ color: '#1890ff' }} />
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            {record.userNameEn && (
              <div style={{ fontSize: '12px', color: '#666' }}>({record.userNameEn})</div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'loginId',
      title: '登录ID',
      dataIndex: 'loginId',
      width: 120,
      render: (text: string) => <code style={{ fontSize: '12px', background: '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>{text}</code>
    },
    {
      key: 'roleNames',
      title: '角色',
      dataIndex: 'roleNames',
      width: 150,
      ellipsis: true,
      render: (text: string) => {
        if (!text) return '-';
        const roles = text.split(', ');
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {roles.slice(0, 2).map((role, index) => (
              <Tag key={index} color="blue">
                {role}
              </Tag>
            ))}
            {roles.length > 2 && (
              <Tag color="default">
                +{roles.length - 2}
              </Tag>
            )}
          </div>
        );
      }
    },
    {
      key: 'createOrgNameZh',
      title: '所属机构',
      dataIndex: 'createOrgNameZh',
      width: 150,
      render: (text: string, record: UserData) => (
        <div>
          <div>{text}</div>
          {record.createOrgNameEn && record.createOrgNameEn !== text && (
            <div style={{ fontSize: '12px', color: '#666' }}>({record.createOrgNameEn})</div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      title: '状态',
      dataIndex: 'status',
      width: 100,
      align: 'center' as const,
      render: (status: string, record: UserData) => (
        <Switch
          checked={status === '0'}
          checkedChildren="启用"
          unCheckedChildren="停用"
          size="small"
          onChange={(checked) => handleStatusChange(record, checked)}
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
      key: 'remark',
      title: '备注',
      dataIndex: 'remark',
      width: 150,
      ellipsis: true,
      render: (text: string) => text || '-'
    },
    {
      key: 'actions',
      title: '操作',
      dataIndex: 'actions',
      width: 200,
      align: 'center' as const,
      render: (_: any, record: UserData) => (
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
                  key: 'resetPassword',
                  label: '重置密码',
                  icon: <KeyOutlined />,
                },
                {
                  key: 'roles',
                  label: '角色分配',
                  icon: <TeamOutlined />,
                },
                {
                  key: 'orgs',
                  label: '机构分配',
                  icon: <BankOutlined />,
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
                } else if (key === 'resetPassword') {
                  handleResetPassword(record);
                } else if (key === 'roles') {
                  handleRoleAssign(record);
                } else if (key === 'orgs') {
                  message.info('机构分配功能开发中...');
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
                  className="search-form-inline"
                  layout="inline"
                  onFinish={handleSearch}
                >
                  {(() => {
                    // 计算搜索项数量
                    const searchItems = 6; // userNameZh, loginId, status, createOrgId, roleId, createTimeRange
                    
                    // 根据项数量计算网格列数和按钮位置
                    let gridColumns, buttonPosition;
                    if (searchItems <= 3) {
                      gridColumns = 'columns-4';
                      buttonPosition = 'position-4';
                    } else if (searchItems <= 7) {
                      gridColumns = 'columns-8';
                      buttonPosition = 'position-8';
                    } else {
                      gridColumns = 'columns-12';
                      buttonPosition = 'position-12';
                    }
                    
                    return (
                      <div className={`search-form-grid ${gridColumns}`}>
                        <Form.Item name="userNameZh" label="用户姓名" className="search-form-item">
                          <Input placeholder="请输入用户姓名" />
                        </Form.Item>
                        <Form.Item name="loginId" label="登录ID" className="search-form-item">
                          <Input placeholder="请输入登录ID" />
                        </Form.Item>
                        <Form.Item name="status" label="状态" className="search-form-item">
                          <Select placeholder="请选择状态" allowClear>
                            <Select.Option value="0">启用</Select.Option>
                            <Select.Option value="1">停用</Select.Option>
                          </Select>
                        </Form.Item>
                        <Form.Item name="roleId" label="角色" className="search-form-item">
                          <Select placeholder="请选择角色" allowClear>
                            {roleList.map(role => (
                              <Select.Option key={role.roleId} value={role.roleId}>
                                {role.roleNameZh}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                        <Form.Item name="createTimeRange" label="创建时间" className="search-form-item">
                          <RangePicker style={{ width: '100%' }} />
                        </Form.Item>
                        <div className={`search-actions ${buttonPosition}`}>
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
                      </div>
                    );
                  })()}
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
        title="用户列表"
        extra={
          <div className="action-buttons">
            <div className="action-buttons-left">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setDrawerMode('create');
                  setCurrentRecord(null);
                  setDrawerOpen(true);
                  setDrawerLoading(false);
                  drawerForm.resetFields();
                  // 设置默认值
                  drawerForm.setFieldsValue({
                    status: '0'
                  });
                }}
              >
                新增用户
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
          dataSource={userData}
          rowKey="userId"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
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
            y: 500,
            x: 'max-content'
          }}
          onChange={handleTableChange}
        />
      </Card>

      {/* 抽屉 */}
      <Drawer
        className="info-drawer"
        title={
          drawerMode === 'create' ? '新增用户' :
          drawerMode === 'edit' ? '编辑用户' : '查看用户'
        }
        width={520}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <div className="drawer-form-content">
          <Spin spinning={drawerLoading} tip="加载中...">
            <Form
              form={drawerForm}
              layout="vertical"
              disabled={drawerMode === 'view'}
              className="drawer-form"
            >
              <Form.Item name="loginId" label="登录ID" rules={[{ required: true, message: '请输入登录ID' }]}>
                <Input placeholder="请输入登录ID" />
              </Form.Item>
              
              {drawerMode === 'create' && (
                <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
                  <Input.Password placeholder="请输入密码" />
                </Form.Item>
              )}
              
              {drawerMode === 'edit' && (
                <Form.Item name="password" label="新密码（可选）" help="留空则不修改密码">
                  <Input.Password placeholder="请输入新密码" />
                </Form.Item>
              )}

              <Form.Item name="userNameZh" label="用户中文姓名" rules={[{ required: true, message: '请输入用户中文姓名' }]}>
                <Input placeholder="请输入用户中文姓名" />
              </Form.Item>
              <Form.Item name="userNameEn" label="用户英文姓名">
                <Input placeholder="请输入用户英文姓名" />
              </Form.Item>
              <Form.Item name="status" label="用户状态" rules={[{ required: true, message: '请选择用户状态' }]}>
                <Select placeholder="请选择用户状态">
                  <Select.Option value="0">启用</Select.Option>
                  <Select.Option value="1">停用</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="remark" label="备注">
                <Input.TextArea
                  placeholder="请输入备注"
                  rows={3}
                  maxLength={500}
                  showCount
                />
              </Form.Item>
              {drawerMode === 'view' && (
                <>
                  <Form.Item name="createTime" label="创建时间">
                    <Input disabled />
                  </Form.Item>
                  <Form.Item name="updateTime" label="更新时间">
                    <Input disabled />
                  </Form.Item>
                </>
              )}
            </Form>
          </Spin>
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

      {/* 角色分配弹窗 */}
      <Modal
        title={`为用户 [${selectedUserForRole?.userNameZh}] 分配角色`}
        open={roleAssignModalOpen}
        onOk={handleRoleAssignSubmit}
        onCancel={() => setRoleAssignModalOpen(false)}
        width={600}
        okText="确认分配"
        cancelText="取消"
      >
        <div style={{ padding: '20px 0' }}>
          <Spin spinning={roleAssignLoading} tip="加载中...">
            <Form
              form={roleAssignForm}
              layout="vertical"
            >
              <Form.Item 
                name="roleIds" 
                label="选择角色" 
                help="可以选择多个角色，取消选择即为移除角色"
              >
                <Select
                  mode="multiple"
                  placeholder="请选择角色"
                  style={{ width: '100%' }}
                  optionFilterProp="children"
                  showSearch
                  filterOption={(input, option) =>
                    String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {roleList.map(role => (
                    <Select.Option 
                      key={role.roleId} 
                      value={role.roleId}
                      label={role.roleNameZh}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{role.roleNameZh}</span>
                        <span style={{ fontSize: '12px', color: '#666' }}>
                          ({role.roleCode})
                        </span>
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
            
            {userCurrentRoles.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                  当前角色：
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {userCurrentRoles.map(roleId => {
                    const role = roleList.find(r => r.roleId === roleId);
                    return role ? (
                      <Tag key={roleId} color="blue">
                        {role.roleNameZh}
                      </Tag>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </Spin>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagement;