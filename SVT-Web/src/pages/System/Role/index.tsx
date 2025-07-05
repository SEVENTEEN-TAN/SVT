// {{CHENGQI:
// Action: Modified; Timestamp: 2025-07-03 14:30:00 +08:00; Reason: 恢复Table内置分页，优化高度计算和CSS布局; Principle_Applied: 组件一体化设计;
// }}

import React, { useState, useEffect, Suspense, lazy } from 'react';
import {
  Button,
  Space,
  Switch,
  message,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Card,
  Collapse,
  Table,
  Tag,
  App,
  Spin,
  Transfer,
  Popconfirm,
  Pagination,
} from 'antd';
import type { TransferDirection } from 'antd/es/transfer';
import type { Key } from 'react';
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleFilled,
  UserOutlined,
} from '@ant-design/icons';

// 导入样式
import '@/styles/PageContainer.css';
import './RoleManagement.css';

// 导入hooks和组件
import { useMobile } from '@/hooks/useMobile';
import RoleSearch from './components/RoleSearch';
import TableHeaderOperation from './components/TableHeaderOperation';

// 导入API和类型
import roleApi, { 
  type RoleData, 
  type RoleConditionDTO, 
  type InsertOrUpdateRoleDetailDTO,
  type UserDetailDTO as RoleUserDetailDTO,
  type PermissionDetailDTO
} from '@/api/system/roleApi';
import userApi, { type UserData } from '@/api/system/userApi';
import type { PageQuery } from '@/types/api';

// 懒加载抽屉组件
const RoleOperateDrawer = lazy(() => import('./components/RoleOperateDrawer'));

const RoleManagement: React.FC = () => {
  const { modal } = App.useApp();
  const isMobile = useMobile();

  // 基础状态
  const [roleData, setRoleData] = useState<RoleData[]>([]);
  const [selectedRole, setSelectedRole] = useState<RoleData | null>(null);
  const [loading, setLoading] = useState(false);

  // 抽屉状态
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | 'view'>('view');
  const [currentRecord, setCurrentRecord] = useState<RoleData | null>(null);

  // 权限配置弹窗状态
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [permissionLoading, setPermissionLoading] = useState(false);
  const [allPermissions, setAllPermissions] = useState<PermissionDetailDTO[]>([]);
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);
  const [currentPermissionRole, setCurrentPermissionRole] = useState<RoleData | null>(null);

  // 关联用户弹窗状态
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userLoading, setUserLoading] = useState(false);
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<RoleData | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [targetKeys, setTargetKeys] = useState<string[]>([]);

  // 分页状态
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number, range: [number, number]) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
    // 强制显示分页器，即使只有一页
    hideOnSinglePage: false,
  });

  // 搜索相关
  const [currentSearchParams, setCurrentSearchParams] = useState<RoleConditionDTO>({});
  const [searchForm] = Form.useForm();
  const [drawerForm] = Form.useForm();
  const [permissionForm] = Form.useForm();

  // 加载角色数据
  const loadRoleData = async (searchParams?: RoleConditionDTO, pageNum?: number, pageSize?: number) => {
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

      const params: PageQuery<RoleConditionDTO> = {
        pageNumber: pageNum || pagination.current,
        pageSize: pageSize || pagination.pageSize,
        condition: filteredCondition
      };
      
      const result = await roleApi.getRoleList(params);
      
      setRoleData(result.records || []);
      setPagination(prev => ({
        ...prev,
        current: pageNum || prev.current,
        pageSize: pageSize || prev.pageSize,
        total: result.total || 0
      }));
    } catch (error: any) {
      console.error('加载角色数据失败:', error);
      message.error(error.message || '加载角色数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 组件初始化时加载数据
  useEffect(() => {
    loadRoleData();
  }, []);


  // 处理搜索
  const handleSearch = async () => {
    try {
      // 获取表单值，不需要验证，因为搜索可以是空条件
      const values = searchForm.getFieldsValue();
      await loadRoleData(values, 1); // 重置到第一页
    } catch (error: any) {
      console.error('搜索失败:', error);
      message.error(error.message || '搜索失败');
    }
  };

  // 处理重置
  const handleReset = () => {
    searchForm.resetFields();
    setCurrentSearchParams({});
    loadRoleData({}, 1); // 清空搜索条件并重置到第一页
  };

  // 刷新数据
  const refreshData = () => {
    loadRoleData(); // 使用当前搜索条件刷新
  };


  // 处理行查看
  const handleRowView = async (record: RoleData) => {
    setDrawerMode('view');
    setCurrentRecord(record);
    setDrawerOpen(true);
    setDrawerLoading(true);

    try {
      const roleDetail = await roleApi.getRoleDetail(record.roleId);
      drawerForm.setFieldsValue(roleDetail);
    } catch (error: any) {
      console.error('获取角色详情失败:', error);
      message.error(error.message || '获取角色详情失败');
      // 如果获取失败，使用当前记录的数据
      drawerForm.setFieldsValue(record);
    } finally {
      setDrawerLoading(false);
    }
  };

  // 处理行编辑
  const handleRowEdit = async (record: RoleData) => {
    setDrawerMode('edit');
    setCurrentRecord(record);
    setDrawerOpen(true);
    setDrawerLoading(true);

    try {
      const roleDetail = await roleApi.getRoleDetail(record.roleId);
      drawerForm.setFieldsValue(roleDetail);
    } catch (error: any) {
      console.error('获取角色详情失败:', error);
      message.error(error.message || '获取角色详情失败');
      // 如果获取失败，使用当前记录的数据
      drawerForm.setFieldsValue(record);
    } finally {
      setDrawerLoading(false);
    }
  };

  // 处理删除 (显示用户数量)
  const handleDelete = (record: RoleData) => {
    const userCount = record.userCount || 0;
    const hasUsers = userCount > 0;
    
    modal.confirm({
      title: `确定删除角色 [${record.roleNameZh}] 吗?`,
      content: hasUsers 
        ? `该角色下还有 ${userCount} 个用户，删除角色将同时移除这些用户的角色关联。此操作不可逆，请谨慎操作。`
        : '此操作不可逆，请谨慎操作。',
      icon: <ExclamationCircleFilled />,
      okType: 'danger',
      onOk: async () => {
        try {
          await roleApi.deleteRole(record.roleId);
          message.success('删除成功');
          await loadRoleData();
        } catch (error: any) {
          console.error('删除失败:', error);
          message.error(error.message || '删除失败');
        }
      },
    });
  };

  // 处理权限配置
  const handlePermissionConfig = async (record: RoleData) => {
    setCurrentPermissionRole(record);
    setPermissionModalOpen(true);
    setPermissionLoading(true);

    try {
      // 并行加载所有权限和当前角色权限
      const [allPerms, rolePerms] = await Promise.all([
        roleApi.getAllPermissions(),
        roleApi.getRolePermissionList(record.roleId)
      ]);
      
      setAllPermissions(allPerms);
      setRolePermissions(rolePerms.map(p => p.permissionId));
      permissionForm.setFieldsValue({
        permissionIds: rolePerms.map(p => p.permissionId)
      });
    } catch (error: any) {
      console.error('加载权限配置失败:', error);
      message.error(error.message || '加载权限配置失败');
    } finally {
      setPermissionLoading(false);
    }
  };

  // 提交权限配置
  const handlePermissionSubmit = async () => {
    try {
      const values = await permissionForm.validateFields();
      const permissionIds = values.permissionIds || [];

      await roleApi.assignRolePermissions(currentPermissionRole!.roleId, permissionIds);
      message.success('权限配置成功');
      setPermissionModalOpen(false);
      await loadRoleData(); // 刷新角色列表
    } catch (error: any) {
      console.error('权限配置失败:', error);
      message.error(error.message || '权限配置失败');
    }
  };

  // 处理关联用户（穿梭框模式）
  const handleRelatedUsers = async (record: RoleData) => {
    setCurrentUserRole(record);
    setUserModalOpen(true);
    setUserLoading(true);

    try {
      // 并行加载所有用户和当前角色的用户
      const [allUsersData, roleUserIds] = await Promise.all([
        userApi.getActiveUserList(),
        roleApi.getRoleUserList(record.roleId)
      ]);
      
      console.log('获取的用户数据:', { 
        allUsersData, 
        isArray: Array.isArray(allUsersData),
        length: allUsersData?.length,
        roleUserIds 
      });
      
      // 确保allUsersData是数组
      const userArray = Array.isArray(allUsersData) ? allUsersData : [];
      setAllUsers(userArray);
      setTargetKeys(roleUserIds || []);
      setSelectedUserIds([]);
    } catch (error: any) {
      console.error('加载用户数据失败:', error);
      message.error(error.message || '加载用户数据失败');
      // 发生错误时设置空数组
      setAllUsers([]);
      setTargetKeys([]);
    } finally {
      setUserLoading(false);
    }
  };

  // 处理穿梭框变化
  const handleTransferChange = (newTargetKeys: Key[], _direction: TransferDirection, _moveKeys: Key[]) => {
    setTargetKeys(newTargetKeys as string[]);
  };

  // 处理穿梭框选择变化
  const handleTransferSelectChange = (sourceSelectedKeys: Key[], targetSelectedKeys: Key[]) => {
    setSelectedUserIds([...sourceSelectedKeys, ...targetSelectedKeys] as string[]);
  };

  // 提交用户分配
  const handleUserAssignSubmit = async () => {
    try {
      await roleApi.assignRoleUsers(currentUserRole!.roleId, targetKeys);
      message.success('用户分配成功');
      setUserModalOpen(false);
      await loadRoleData(); // 刷新角色列表以更新用户数量
    } catch (error: any) {
      console.error('用户分配失败:', error);
      message.error(error.message || '用户分配失败');
    }
  };

  // 处理状态切换
  const handleStatusChange = async (record: RoleData, checked: boolean) => {
    const status = checked ? '0' : '1';
    try {
      await roleApi.updateRoleStatus(record.roleId, status);
      message.success(`${checked ? '启用' : '停用'}成功`);
      await loadRoleData();
    } catch (error: any) {
      console.error('状态更新失败:', error);
      message.error(error.message || '状态更新失败');
    }
  };

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await drawerForm.validateFields();
      
      const submitData: InsertOrUpdateRoleDetailDTO = {
        roleId: drawerMode === 'edit' ? currentRecord?.roleId : undefined,
        roleCode: values.roleCode,
        roleNameZh: values.roleNameZh,
        roleNameEn: values.roleNameEn,
        roleSort: values.roleSort || 1,
        status: values.status,
        remark: values.remark
      };

      await roleApi.insertOrUpdateRole(submitData);
      setDrawerOpen(false);
      message.success(drawerMode === 'create' ? '创建成功' : '更新成功');
      await loadRoleData();
    } catch (error: any) {
      console.error('提交失败:', error);
      message.error(error.message || '提交失败');
    }
  };

  // 处理分页变化
  const handleTableChange = (paginationConfig: any) => {
    const { current, pageSize } = paginationConfig;
    loadRoleData(undefined, current, pageSize); // 保持当前搜索条件，只改变分页
  };

  // 表格列配置
  const columns = [
    {
      key: 'roleNameZh',
      title: '角色名称',
      dataIndex: 'roleNameZh',
      width: 150,
      render: (text: string, record: RoleData) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          {record.roleNameEn && (
            <div style={{ fontSize: '12px', color: '#666' }}>({record.roleNameEn})</div>
          )}
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
      key: 'remark',
      title: '角色描述',
      dataIndex: 'remark',
      width: 200,
      ellipsis: true,
      render: (text: string) => text || '-'
    },
    {
      key: 'userCount',
      title: '关联用户',
      dataIndex: 'userCount',
      width: 100,
      align: 'center' as const,
      render: (count: number = 0) => (
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
      render: (status: string, record: RoleData) => (
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
        </Space>
      )
    }
  ];

  return (
    <div className="role-page-container">
      {/* 搜索区域 - 固定展开 */}
      <div className="search-section">
        <Card className="card-wrapper" title="搜索条件">
          <RoleSearch
            form={searchForm}
            searchParams={currentSearchParams}
            onSearch={handleSearch}
            onReset={handleReset}
          />
        </Card>
      </div>

      {/* 数据区域 - 精确计算高度 */}
      <div className="data-section">
        {/* 表格卡片 */}
        <Card
          className="data-card card-wrapper"
          title="角色列表"
          variant="borderless"
          extra={
            <TableHeaderOperation
              selectedRole={selectedRole}
              loading={loading}
              onAdd={() => {
                setDrawerMode('create');
                setCurrentRecord(null);
                setDrawerOpen(true);
                setDrawerLoading(false);
                drawerForm.resetFields();
                drawerForm.setFieldsValue({
                  status: '0',
                  roleSort: 1
                });
              }}
              onBatchDelete={() => selectedRole && handleDelete(selectedRole)}
              onRefresh={refreshData}
              onPermissionConfig={() => selectedRole && handlePermissionConfig(selectedRole)}
              onRelatedUsers={() => selectedRole && handleRelatedUsers(selectedRole)}
            />
          }
        >
          <Table
            rowSelection={{
              type: 'radio',
              selectedRowKeys: selectedRole ? [selectedRole.roleId] : [],
              onChange: (_, selectedRows) => {
                setSelectedRole(selectedRows[0] || null);
              },
            }}
            scroll={{ x: 1200, y: 'calc(100vh - 280px)' }} // 精确计算表格高度
            size="small"
            columns={columns}
            dataSource={roleData}
            rowKey="roleId"
            loading={loading}
            pagination={false}
          />
        </Card>

        {/* 分页器 - 独立在Card外部 */}
        <div className="pagination-section">
          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={pagination.total}
            showSizeChanger={pagination.showSizeChanger}
            showQuickJumper={pagination.showQuickJumper}
            showTotal={pagination.showTotal}
            hideOnSinglePage={false}
            onChange={(page, pageSize) => {
              handleTableChange({ current: page, pageSize });
            }}
            onShowSizeChange={(_, size) => {
              handleTableChange({ current: 1, pageSize: size });
            }}
          />
        </div>
      </div>

      {/* 懒加载抽屉 */}
      <Suspense>
        <RoleOperateDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          mode={drawerMode}
          currentRecord={currentRecord}
          form={drawerForm}
          loading={drawerLoading}
          onSubmit={handleSubmit}
        />
      </Suspense>


      {/* 权限配置弹窗 */}
      <Modal
        title={`角色 [${currentPermissionRole?.roleNameZh}] 权限配置`}
        open={permissionModalOpen}
        onOk={handlePermissionSubmit}
        onCancel={() => setPermissionModalOpen(false)}
        width={800}
        okText="保存配置"
        cancelText="取消"
      >
        <div style={{ padding: '20px 0' }}>
          <Spin spinning={permissionLoading} tip="加载中...">
            <Form
              form={permissionForm}
              layout="vertical"
            >
              <Form.Item 
                name="permissionIds" 
                label="选择权限" 
                help="可以选择多个权限，取消选择即为移除权限"
              >
                <Select
                  mode="multiple"
                  placeholder="请选择权限"
                  style={{ width: '100%' }}
                  optionFilterProp="children"
                  showSearch
                  filterOption={(input, option) => {
                    const label = String(option?.label ?? '');
                    return label.toLowerCase().includes(input.toLowerCase());
                  }}
                  maxTagCount="responsive"
                >
                  {(() => {
                    // 按权限组分组
                    const groupedPermissions = allPermissions.reduce((groups, permission) => {
                      const group = permission.permissionGroup || '其他';
                      if (!groups[group]) {
                        groups[group] = [];
                      }
                      groups[group].push(permission);
                      return groups;
                    }, {} as Record<string, PermissionDetailDTO[]>);

                    return Object.entries(groupedPermissions).map(([groupName, permissions]) => (
                      <Select.OptGroup key={groupName} label={groupName}>
                        {permissions.map(permission => (
                          <Select.Option 
                            key={permission.permissionId} 
                            value={permission.permissionId}
                            label={permission.permissionNameZh}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span>{permission.permissionNameZh}</span>
                              <span style={{ fontSize: '12px', color: '#666' }}>
                                ({permission.permissionKey})
                              </span>
                            </div>
                          </Select.Option>
                        ))}
                      </Select.OptGroup>
                    ));
                  })()}
                </Select>
              </Form.Item>
            </Form>
            
            {rolePermissions.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                  当前权限 ({rolePermissions.length} 个):
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {allPermissions
                    .filter(p => rolePermissions.includes(p.permissionId))
                    .map(permission => (
                      <Tag key={permission.permissionId} color="blue">
                        {permission.permissionNameZh}
                      </Tag>
                    ))}
                </div>
              </div>
            )}
          </Spin>
        </div>
      </Modal>

      {/* 关联用户穿梭框弹窗 */}
      <Modal
        title={`角色 [${currentUserRole?.roleNameZh}] 用户分配`}
        open={userModalOpen}
        onOk={handleUserAssignSubmit}
        onCancel={() => setUserModalOpen(false)}
        width={900}
        okText="保存分配"
        cancelText="取消"
      >
        <div style={{ padding: '20px 0' }}>
          <Spin spinning={userLoading} tip="加载中...">
            {Array.isArray(allUsers) ? (
              <Transfer
                dataSource={allUsers.map(user => ({
                  key: user.userId,
                  title: user.userNameZh,
                  description: `登录ID: ${user.loginId} | 状态: ${user.status === '0' ? '启用' : '停用'}`,
                  disabled: false,
                  ...user
                }))}
                showSearch
                filterOption={(inputValue, item) => {
                  const searchValue = inputValue.toLowerCase();
                  return (
                    (item.loginId ?? '').toLowerCase().includes(searchValue) ||
                    (item.userNameZh ?? '').toLowerCase().includes(searchValue) ||
                    ((item.userNameEn ?? '').toLowerCase?.() ?? '').includes(searchValue)
                  );
                }}
                targetKeys={targetKeys || []}
                selectedKeys={selectedUserIds || []}
                onChange={handleTransferChange}
                onSelectChange={handleTransferSelectChange}
                render={(item) => (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <UserOutlined style={{ color: '#1890ff' }} />
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '14px' }}>
                        {item.title}
                        {item.userNameEn && <span style={{ fontSize: '12px', color: '#666', marginLeft: '4px' }}>({item.userNameEn})</span>}
                      </div>
                      <div style={{ fontSize: '12px', color: '#999' }}>
                        {item.description}
                      </div>
                    </div>
                  </div>
                )}
                titles={['可选用户', '已分配用户']}
                listStyle={{
                  width: 400,
                  height: 500,
                }}
                oneWay={false}
                pagination={{
                  pageSize: 10,
                }}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '50px 0', color: '#999' }}>
                暂无用户数据
              </div>
            )}
          </Spin>
          
          <div style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
            <div>可选用户：{(allUsers?.length || 0) - (targetKeys?.length || 0)} 人</div>
            <div>已分配用户：{targetKeys?.length || 0} 人</div>
            <div>总用户数：{allUsers?.length || 0} 人</div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RoleManagement;
