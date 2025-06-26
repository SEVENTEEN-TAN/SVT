import React, { useState } from 'react';
import {
  Button,
  Space,
  Switch,
  InputNumber,
  Dropdown,
  message,
  Modal,
  Form,
  Input,
  Select,
  TreeSelect,
  Card,
  Table,
  Drawer,
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
} from '@ant-design/icons';
import '@/styles/PageContainer.css';
import './MenuManagement.css';

// 菜单数据类型定义
interface MenuTreeNode {
  menuId: string;
  parentId: string | null;
  menuNameZh: string;
  menuNameEn: string;
  menuPath: string;
  menuIcon: string;
  menuSort: string;
  status: '0' | '1'; // 0: 启用, 1: 停用
  delFlag: '0' | '1';
  hasChildren: boolean;
  level: number;
  expanded?: boolean;
  children?: MenuTreeNode[];
}

// MenuTableRow类型不再需要，直接使用MenuTreeNode

// Mock数据
const mockMenuData: MenuTreeNode[] = [
  {
    menuId: 'M001',
    parentId: null,
    menuNameZh: '系统管理',
    menuNameEn: 'System Management',
    menuPath: '/system',
    menuIcon: 'setting',
    menuSort: '1',
    status: '0',
    delFlag: '0',
    hasChildren: true,
    level: 1,
    expanded: true,
    children: [
      {
        menuId: 'M001001',
        parentId: 'M001',
        menuNameZh: '用户管理',
        menuNameEn: 'User Management',
        menuPath: '/system/user',
        menuIcon: 'user',
        menuSort: '1',
        status: '0',
        delFlag: '0',
        hasChildren: false,
        level: 2,
      },
      {
        menuId: 'M001002',
        parentId: 'M001',
        menuNameZh: '角色管理',
        menuNameEn: 'Role Management',
        menuPath: '/system/role',
        menuIcon: 'team',
        menuSort: '2',
        status: '0',
        delFlag: '0',
        hasChildren: false,
        level: 2,
      },
      {
        menuId: 'M001003',
        parentId: 'M001',
        menuNameZh: '菜单管理',
        menuNameEn: 'Menu Management',
        menuPath: '/system/menu',
        menuIcon: 'menu',
        menuSort: '3',
        status: '0',
        delFlag: '0',
        hasChildren: false,
        level: 2,
      }
    ]
  },
  {
    menuId: 'M002',
    parentId: null,
    menuNameZh: '业务管理',
    menuNameEn: 'Business Management',
    menuPath: '/business',
    menuIcon: 'shop',
    menuSort: '2',
    status: '0',
    delFlag: '0',
    hasChildren: true,
    level: 1,
    expanded: false,
    children: [
      {
        menuId: 'M002001',
        parentId: 'M002',
        menuNameZh: '业务处理',
        menuNameEn: 'Business Process',
        menuPath: '/business/process',
        menuIcon: 'form',
        menuSort: '1',
        status: '0',
        delFlag: '0',
        hasChildren: false,
        level: 2,
      },
      {
        menuId: 'M002002',
        parentId: 'M002',
        menuNameZh: '业务查询',
        menuNameEn: 'Business Query',
        menuPath: '/business/query',
        menuIcon: 'search',
        menuSort: '2',
        status: '1',
        delFlag: '0',
        hasChildren: false,
        level: 2,
      }
    ]
  },
  {
    menuId: 'M003',
    parentId: null,
    menuNameZh: '财务管理',
    menuNameEn: 'Finance Management',
    menuPath: '/finance',
    menuIcon: 'dollar',
    menuSort: '3',
    status: '0',
    delFlag: '0',
    hasChildren: true,
    level: 1,
    expanded: false,
    children: [
      {
        menuId: 'M003001',
        parentId: 'M003',
        menuNameZh: '收支管理',
        menuNameEn: 'Income & Expense',
        menuPath: '/finance/income',
        menuIcon: 'money-collect',
        menuSort: '1',
        status: '0',
        delFlag: '0',
        hasChildren: false,
        level: 2,
      },
      {
        menuId: 'M003002',
        parentId: 'M003',
        menuNameZh: '报表统计',
        menuNameEn: 'Financial Reports',
        menuPath: '/finance/reports',
        menuIcon: 'bar-chart',
        menuSort: '2',
        status: '0',
        delFlag: '0',
        hasChildren: false,
        level: 2,
      },
      {
        menuId: 'M003003',
        parentId: 'M003',
        menuNameZh: '预算管理',
        menuNameEn: 'Budget Management',
        menuPath: '/finance/budget',
        menuIcon: 'calculator',
        menuSort: '3',
        status: '1',
        delFlag: '0',
        hasChildren: false,
        level: 2,
      }
    ]
  },
  {
    menuId: 'M004',
    parentId: null,
    menuNameZh: '人力资源',
    menuNameEn: 'Human Resources',
    menuPath: '/hr',
    menuIcon: 'contacts',
    menuSort: '4',
    status: '0',
    delFlag: '0',
    hasChildren: true,
    level: 1,
    expanded: false,
    children: [
      {
        menuId: 'M004001',
        parentId: 'M004',
        menuNameZh: '员工管理',
        menuNameEn: 'Employee Management',
        menuPath: '/hr/employee',
        menuIcon: 'user-add',
        menuSort: '1',
        status: '0',
        delFlag: '0',
        hasChildren: false,
        level: 2,
      },
      {
        menuId: 'M004002',
        parentId: 'M004',
        menuNameZh: '考勤管理',
        menuNameEn: 'Attendance Management',
        menuPath: '/hr/attendance',
        menuIcon: 'clock-circle',
        menuSort: '2',
        status: '0',
        delFlag: '0',
        hasChildren: false,
        level: 2,
      }
    ]
  },
  {
    menuId: 'M005',
    parentId: null,
    menuNameZh: '库存管理',
    menuNameEn: 'Inventory Management',
    menuPath: '/inventory',
    menuIcon: 'inbox',
    menuSort: '5',
    status: '0',
    delFlag: '0',
    hasChildren: true,
    level: 1,
    expanded: false,
    children: [
      {
        menuId: 'M005001',
        parentId: 'M005',
        menuNameZh: '商品管理',
        menuNameEn: 'Product Management',
        menuPath: '/inventory/product',
        menuIcon: 'shopping',
        menuSort: '1',
        status: '0',
        delFlag: '0',
        hasChildren: false,
        level: 2,
      },
      {
        menuId: 'M005002',
        parentId: 'M005',
        menuNameZh: '入库管理',
        menuNameEn: 'Stock In',
        menuPath: '/inventory/stock-in',
        menuIcon: 'import',
        menuSort: '2',
        status: '0',
        delFlag: '0',
        hasChildren: false,
        level: 2,
      },
      {
        menuId: 'M005003',
        parentId: 'M005',
        menuNameZh: '出库管理',
        menuNameEn: 'Stock Out',
        menuPath: '/inventory/stock-out',
        menuIcon: 'export',
        menuSort: '3',
        status: '0',
        delFlag: '0',
        hasChildren: false,
        level: 2,
      }
    ]
  },
  {
    menuId: 'M006',
    parentId: null,
    menuNameZh: '客户管理',
    menuNameEn: 'Customer Management',
    menuPath: '/customer',
    menuIcon: 'solution',
    menuSort: '6',
    status: '0',
    delFlag: '0',
    hasChildren: true,
    level: 1,
    expanded: false,
    children: [
      {
        menuId: 'M006001',
        parentId: 'M006',
        menuNameZh: '客户信息',
        menuNameEn: 'Customer Info',
        menuPath: '/customer/info',
        menuIcon: 'idcard',
        menuSort: '1',
        status: '0',
        delFlag: '0',
        hasChildren: false,
        level: 2,
      },
      {
        menuId: 'M006002',
        parentId: 'M006',
        menuNameZh: '客户服务',
        menuNameEn: 'Customer Service',
        menuPath: '/customer/service',
        menuIcon: 'customer-service',
        menuSort: '2',
        status: '1',
        delFlag: '0',
        hasChildren: false,
        level: 2,
      }
    ]
  },
  {
    menuId: 'M007',
    parentId: null,
    menuNameZh: '数据分析',
    menuNameEn: 'Data Analytics',
    menuPath: '/analytics',
    menuIcon: 'line-chart',
    menuSort: '7',
    status: '0',
    delFlag: '0',
    hasChildren: true,
    level: 1,
    expanded: false,
    children: [
      {
        menuId: 'M007001',
        parentId: 'M007',
        menuNameZh: '销售分析',
        menuNameEn: 'Sales Analytics',
        menuPath: '/analytics/sales',
        menuIcon: 'rise',
        menuSort: '1',
        status: '0',
        delFlag: '0',
        hasChildren: false,
        level: 2,
      },
      {
        menuId: 'M007002',
        parentId: 'M007',
        menuNameZh: '用户行为',
        menuNameEn: 'User Behavior',
        menuPath: '/analytics/behavior',
        menuIcon: 'heat-map',
        menuSort: '2',
        status: '0',
        delFlag: '0',
        hasChildren: false,
        level: 2,
      },
      {
        menuId: 'M007003',
        parentId: 'M007',
        menuNameZh: '数据报表',
        menuNameEn: 'Data Reports',
        menuPath: '/analytics/reports',
        menuIcon: 'file-text',
        menuSort: '3',
        status: '0',
        delFlag: '0',
        hasChildren: false,
        level: 2,
      },
      {
        menuId: 'M007004',
        parentId: 'M007',
        menuNameZh: '实时监控',
        menuNameEn: 'Real-time Monitor',
        menuPath: '/analytics/monitor',
        menuIcon: 'monitor',
        menuSort: '4',
        status: '1',
        delFlag: '0',
        hasChildren: false,
        level: 2,
      }
    ]
  },
  {
    menuId: 'M008',
    parentId: null,
    menuNameZh: '消息中心',
    menuNameEn: 'Message Center',
    menuPath: '/message',
    menuIcon: 'message',
    menuSort: '8',
    status: '0',
    delFlag: '0',
    hasChildren: true,
    level: 1,
    expanded: false,
    children: [
      {
        menuId: 'M008001',
        parentId: 'M008',
        menuNameZh: '站内消息',
        menuNameEn: 'Internal Message',
        menuPath: '/message/internal',
        menuIcon: 'mail',
        menuSort: '1',
        status: '0',
        delFlag: '0',
        hasChildren: false,
        level: 2,
      },
      {
        menuId: 'M008002',
        parentId: 'M008',
        menuNameZh: '系统通知',
        menuNameEn: 'System Notification',
        menuPath: '/message/notification',
        menuIcon: 'notification',
        menuSort: '2',
        status: '0',
        delFlag: '0',
        hasChildren: false,
        level: 2,
      }
    ]
  },
  {
    menuId: 'M009',
    parentId: null,
    menuNameZh: '配置管理',
    menuNameEn: 'Configuration',
    menuPath: '/config',
    menuIcon: 'control',
    menuSort: '9',
    status: '0',
    delFlag: '0',
    hasChildren: true,
    level: 1,
    expanded: false,
    children: [
      {
        menuId: 'M009001',
        parentId: 'M009',
        menuNameZh: '系统配置',
        menuNameEn: 'System Config',
        menuPath: '/config/system',
        menuIcon: 'setting',
        menuSort: '1',
        status: '0',
        delFlag: '0',
        hasChildren: false,
        level: 2,
      },
      {
        menuId: 'M009002',
        parentId: 'M009',
        menuNameZh: '参数设置',
        menuNameEn: 'Parameter Setting',
        menuPath: '/config/parameter',
        menuIcon: 'sliders',
        menuSort: '2',
        status: '0',
        delFlag: '0',
        hasChildren: false,
        level: 2,
      },
      {
        menuId: 'M009003',
        parentId: 'M009',
        menuNameZh: '字典管理',
        menuNameEn: 'Dictionary Management',
        menuPath: '/config/dictionary',
        menuIcon: 'book',
        menuSort: '3',
        status: '0',
        delFlag: '0',
        hasChildren: false,
        level: 2,
      }
    ]
  }
];

const MenuManagement: React.FC = () => {
  // 状态管理
  const [menuData] = useState<MenuTreeNode[]>(mockMenuData);
  const [selectedRows, setSelectedRows] = useState<MenuTreeNode[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | 'view'>('view');
  const [currentRecord, setCurrentRecord] = useState<MenuTreeNode | null>(null);
  // 表单实例
  const [drawerForm] = Form.useForm();

  // 直接使用原始树形数据
  const tableData = menuData;





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
      message.warning('请先选择要操作的菜单');
      return;
    }

    Modal.confirm({
      title: `确认${status === '0' ? '启用' : '停用'}选中的菜单吗？`,
      content: `将${status === '0' ? '启用' : '停用'} ${selectedRows.length} 个菜单`,
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
      message.warning('请先选择要删除的菜单');
      return;
    }

    Modal.confirm({
      title: '确认删除选中的菜单吗？',
      content: `将删除 ${selectedRows.length} 个菜单，此操作不可恢复`,
      okType: 'danger',
      onOk: () => {
        message.success('批量删除成功');
        setSelectedRows([]);
        setSelectedRowKeys([]);
      }
    });
  };

  // 表格列配置
  const columns = [
    {
      key: 'menuNameZh',
      title: '菜单名称',
      dataIndex: 'menuNameZh',
      width: 300,
      render: (text: string, record: MenuTreeNode) => (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {/* 菜单图标 */}
          <span className="menu-icon">
            {record.hasChildren ? '📁' : '📄'}
          </span>

          {/* 菜单名称 */}
          <span className="menu-name">
            {text}
          </span>
        </div>
      )
    },
    {
      key: 'menuId',
      title: '菜单ID',
      dataIndex: 'menuId',
      width: 120,
      render: (text: string) => <code style={{ fontSize: '12px' }}>{text}</code>
    },
    {
      key: 'menuPath',
      title: '菜单路径',
      dataIndex: 'menuPath',
      width: 200,
      render: (text: string) => <code style={{ fontSize: '12px', color: '#666' }}>{text}</code>
    },
    {
      key: 'menuSort',
      title: '排序',
      dataIndex: 'menuSort',
      width: 80,
      align: 'center' as const,
      render: (sort: string) => (
        <InputNumber
          size="small"
          value={parseInt(sort)}
          min={1}
          max={999}
          style={{ width: '60px' }}
        />
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
      key: 'actions',
      title: '操作',
      dataIndex: 'actions',
      width: 180,
      align: 'center' as const,
      render: (_: any, record: MenuTreeNode) => (
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
                  key: 'add',
                  label: '新增子菜单',
                  icon: <PlusOutlined />,
                },
                {
                  key: 'delete',
                  label: '删除',
                  icon: <DeleteOutlined />,
                  danger: true
                }
              ],
              onClick: ({ key }) => {
                if (key === 'add') {
                  handleAddChild(record);
                } else if (key === 'delete') {
                  handleDelete(record);
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

  // 处理行选择
  const handleSelectionChange = (selectedRowKeys: React.Key[], selectedRows: MenuTreeNode[]) => {
    setSelectedRows(selectedRows);
    setSelectedRowKeys(selectedRowKeys);
  };

  // 处理行查看
  const handleRowView = (record: MenuTreeNode) => {
    setDrawerMode('view');
    setCurrentRecord(record);
    setDrawerOpen(true);
    drawerForm.setFieldsValue(record);
  };

  // 处理行编辑
  const handleRowEdit = (record: MenuTreeNode) => {
    setDrawerMode('edit');
    setCurrentRecord(record);
    setDrawerOpen(true);
    drawerForm.setFieldsValue(record);
  };

  // 处理新增子菜单
  const handleAddChild = (record: MenuTreeNode) => {
    setDrawerMode('create');
    setCurrentRecord(record);
    setDrawerOpen(true);
    drawerForm.resetFields();
    drawerForm.setFieldsValue({ parentId: record.menuId });
  };

  // 处理删除
  const handleDelete = (record: MenuTreeNode) => {
    Modal.confirm({
      title: `确定删除菜单 [${record.menuNameZh}] 吗?`,
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

  // 构建父菜单选项
  const buildParentOptions = (nodes: MenuTreeNode[], level = 0): any[] => {
    return nodes.map(node => ({
      value: node.menuId,
      title: `${'--'.repeat(level)} ${node.menuNameZh}`,
      children: node.children ? buildParentOptions(node.children, level + 1) : [],
    }));
  };

  return (
    <div className="page-container-management">

      {/* 数据管理区域 */}
      <Card
        className="data-section"
        title="菜单列表"
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
                  drawerForm.resetFields();
                }}
              >
                新增根菜单
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
          className="data-table tree-table"
          columns={columns}
          dataSource={tableData}
          rowKey="menuId"
          loading={loading}
          pagination={false}
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys: selectedRowKeys,
            onChange: handleSelectionChange,
          }}
          expandable={{
            defaultExpandAllRows: true,
          }}
          scroll={{
            y: '70vh', // 使用视口高度的70%，响应式适配
            x: 'max-content' // 水平滚动支持
          }}
        />
      </Card>

      {/* 抽屉 */}
      <Drawer
        className="info-drawer"
        title={
          drawerMode === 'create' ? '新增菜单' :
          drawerMode === 'edit' ? '编辑菜单' : '查看菜单'
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
            <Form.Item name="parentId" label="上级菜单">
              <TreeSelect
                treeData={buildParentOptions(menuData)}
                placeholder="请选择上级菜单"
                treeDefaultExpandAll
                allowClear
              />
            </Form.Item>
            <Form.Item name="menuNameZh" label="菜单名称(中)" rules={[{ required: true }]}>
              <Input placeholder="请输入菜单中文名称" />
            </Form.Item>
            <Form.Item name="menuNameEn" label="菜单名称(英)" rules={[{ required: true }]}>
              <Input placeholder="请输入菜单英文名称" />
            </Form.Item>
            <Form.Item name="menuPath" label="菜单路径" rules={[{ required: true }]}>
              <Input placeholder="请输入菜单路径" />
            </Form.Item>
            <Form.Item name="menuIcon" label="菜单图标">
              <Input placeholder="请输入菜单图标" />
            </Form.Item>
            <Form.Item name="menuSort" label="显示排序" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="status" label="菜单状态" rules={[{ required: true }]}>
              <Select placeholder="请选择菜单状态">
                <Select.Option value="0">启用</Select.Option>
                <Select.Option value="1">停用</Select.Option>
              </Select>
            </Form.Item>
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

export default MenuManagement;
