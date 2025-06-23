import React, { useState, useCallback } from 'react';
import {
  Table,
  Button,
  Space,
  Checkbox,
  Switch,
  InputNumber,
  Dropdown,
  message,
  Modal,
} from 'antd';
import {
  PlusOutlined,
  CheckOutlined,
  StopOutlined,
  DeleteOutlined,
  ExpandOutlined,
  CompressOutlined,
  ReloadOutlined,
  DownOutlined,
  MinusSquareOutlined,
  PlusSquareOutlined,
  EyeOutlined,
  EditOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import '@/styles/PageContainer.css';

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

interface MenuTableRow extends MenuTreeNode {
  key: string;
}

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
  }
];

const MenuManagement: React.FC = () => {
  // 状态管理
  const [menuData] = useState<MenuTreeNode[]>(mockMenuData);
  const [expandedKeys, setExpandedKeys] = useState<string[]>(['M001']);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // 树形数据扁平化处理
  const flattenTreeData = useCallback((treeData: MenuTreeNode[], level = 1): MenuTableRow[] => {
    const result: MenuTableRow[] = [];
    
    treeData.forEach(node => {
      // 添加当前节点
      result.push({
        ...node,
        level,
        key: node.menuId,
        hasChildren: Boolean(node.children && node.children.length > 0),
        expanded: expandedKeys.includes(node.menuId)
      });
      
      // 如果节点展开且有子节点，递归添加子节点
      if (expandedKeys.includes(node.menuId) && node.children && node.children.length > 0) {
        result.push(...flattenTreeData(node.children, level + 1));
      }
    });
    
    return result;
  }, [expandedKeys]);

  // 获取表格数据
  const tableData = flattenTreeData(menuData);

  // 展开/折叠处理
  const toggleExpand = (menuId: string) => {
    setExpandedKeys(prev => 
      prev.includes(menuId) 
        ? prev.filter(key => key !== menuId)
        : [...prev, menuId]
    );
  };

  // 展开全部
  const expandAll = () => {
    const allKeys: string[] = [];
    const collectKeys = (nodes: MenuTreeNode[]) => {
      nodes.forEach(node => {
        if (node.hasChildren) {
          allKeys.push(node.menuId);
        }
        if (node.children) {
          collectKeys(node.children);
        }
      });
    };
    collectKeys(menuData);
    setExpandedKeys(allKeys);
  };

  // 折叠全部
  const collapseAll = () => {
    setExpandedKeys([]);
  };

  // 刷新数据
  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success('数据刷新成功');
    }, 1000);
  };

  // 行选择处理
  const handleSelectRow = (menuId: string, checked: boolean) => {
    setSelectedRowKeys(prev => 
      checked 
        ? [...prev, menuId]
        : prev.filter(key => key !== menuId)
    );
  };

  // 全选处理
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRowKeys(tableData.map(item => item.menuId));
    } else {
      setSelectedRowKeys([]);
    }
  };

  // 批量状态更新
  const batchUpdateStatus = async (status: '0' | '1') => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要操作的菜单');
      return;
    }

    Modal.confirm({
      title: `确认${status === '0' ? '启用' : '停用'}选中的菜单吗？`,
      content: `将${status === '0' ? '启用' : '停用'} ${selectedRowKeys.length} 个菜单`,
      onOk: () => {
        message.success(`批量${status === '0' ? '启用' : '停用'}成功`);
        setSelectedRowKeys([]);
      }
    });
  };

  // 批量删除
  const batchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的菜单');
      return;
    }

    Modal.confirm({
      title: '确认删除选中的菜单吗？',
      content: `将删除 ${selectedRowKeys.length} 个菜单，此操作不可恢复`,
      okType: 'danger',
      onOk: () => {
        message.success('批量删除成功');
        setSelectedRowKeys([]);
      }
    });
  };

  return (
    <div className="page-container-management">
      {/* 页面标题 */}
      <div className="page-header">
        <h2>菜单管理</h2>
        <p>管理系统菜单结构，配置菜单权限和显示顺序</p>
      </div>

      {/* 工具栏 */}
      <div className="page-toolbar">
        <Space wrap>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => message.info('新增根菜单')}
          >
            新增根菜单
          </Button>
          <Button 
            icon={<CheckOutlined />}
            disabled={selectedRowKeys.length === 0}
            onClick={() => batchUpdateStatus('0')}
          >
            批量启用
          </Button>
          <Button 
            icon={<StopOutlined />}
            disabled={selectedRowKeys.length === 0}
            onClick={() => batchUpdateStatus('1')}
          >
            批量停用
          </Button>
          <Button 
            danger
            icon={<DeleteOutlined />}
            disabled={selectedRowKeys.length === 0}
            onClick={batchDelete}
          >
            批量删除
          </Button>
          <Button 
            icon={<ExpandOutlined />}
            onClick={expandAll}
          >
            展开全部
          </Button>
          <Button 
            icon={<CompressOutlined />}
            onClick={collapseAll}
          >
            折叠全部
          </Button>
          <Button 
            icon={<ReloadOutlined />}
            onClick={refreshData}
          >
            刷新
          </Button>
        </Space>
        
        {selectedRowKeys.length > 0 && (
          <div className="page-selection-info">
            已选择 <span className="page-selection-count">{selectedRowKeys.length}</span> 项
          </div>
        )}
      </div>

      {/* 表格容器 */}
      <div className="page-table-container">
        <Table
          loading={loading}
          dataSource={tableData}
          pagination={false}
          size="middle"
          scroll={{ x: 1200 }}
          columns={[
            {
              title: (
                <Checkbox
                  checked={selectedRowKeys.length === tableData.length && tableData.length > 0}
                  indeterminate={selectedRowKeys.length > 0 && selectedRowKeys.length < tableData.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              ),
              dataIndex: 'selection',
              width: 50,
              render: (_, record) => (
                <Checkbox 
                  checked={selectedRowKeys.includes(record.menuId)}
                  onChange={(e) => handleSelectRow(record.menuId, e.target.checked)}
                />
              )
            },
            {
              title: '菜单名称',
              dataIndex: 'menuNameZh',
              width: 300,
              render: (text, record) => (
                <div 
                  style={{ 
                    paddingLeft: `${(record.level - 1) * 20}px`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {/* 展开/折叠按钮 */}
                  {record.hasChildren ? (
                    <Button
                      type="text"
                      size="small"
                      icon={record.expanded ? <MinusSquareOutlined /> : <PlusSquareOutlined />}
                      onClick={() => toggleExpand(record.menuId)}
                      style={{ padding: '0 4px', minWidth: '20px' }}
                    />
                  ) : (
                    <span style={{ width: '20px', display: 'inline-block' }} />
                  )}
                  
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
              title: '菜单ID',
              dataIndex: 'menuId',
              width: 120,
              render: (text) => <code style={{ fontSize: '12px' }}>{text}</code>
            },
            {
              title: '菜单路径',
              dataIndex: 'menuPath',
              width: 200,
              render: (text) => <code style={{ fontSize: '12px', color: '#666' }}>{text}</code>
            },
            {
              title: '排序',
              dataIndex: 'menuSort',
              width: 80,
              align: 'center',
              render: (sort) => (
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
              title: '状态',
              dataIndex: 'status',
              width: 100,
              align: 'center',
              render: (status) => (
                <Switch
                  checked={status === '0'}
                  checkedChildren="启用"
                  unCheckedChildren="停用"
                  size="small"
                />
              )
            },
            {
              title: '操作',
              dataIndex: 'actions',
              width: 180,
              align: 'center',
              render: (_, record) => (
                <Space size="small">
                  <Button
                    type="link"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => message.info(`查看 ${record.menuNameZh}`)}
                  >
                    详情
                  </Button>
                  <Button
                    type="link"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => message.info(`编辑 ${record.menuNameZh}`)}
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
                      onClick: ({ key }) => message.info(`${key} ${record.menuNameZh}`)
                    }}
                  >
                    <Button type="link" size="small">
                      更多 <DownOutlined />
                    </Button>
                  </Dropdown>
                </Space>
              )
            }
          ] as ColumnsType<MenuTableRow>}
        />
      </div>
    </div>
  );
};

export default MenuManagement;
