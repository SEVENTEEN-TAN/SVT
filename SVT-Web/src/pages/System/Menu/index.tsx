import React, {useMemo, useState} from 'react';
import {
    Button,
    Card,
    Drawer,
    Form,
    Input,
    InputNumber,
    message,
    Modal,
    Select,
    Space,
    Switch,
    Table,
    TreeSelect,
} from 'antd';
import {DownOutlined, PlusOutlined, UpOutlined,} from '@ant-design/icons';
import '@/styles/PageContainer.css';
import './MenuManagement.css';
import axios from 'axios';

import type {ColumnsType} from 'antd/es/table';

// 菜单数据类型定义
interface MenuNode {
  menuId: string;
  parentId: string | null;
  menuName: string;
  menuPath: string;
  menuSort: number;
  status: '0' | '1'; // 0 启用 1 停用
  description?: string;
  seq?: string; // 层级序号
  children?: MenuNode[];
}

interface FlatNode extends Omit<MenuNode, 'children'> {
  level: number; // 层级，用于缩进与拖拽子树计算
}

// Mock数据
const mockTree: MenuNode[] = [
  {
    menuId: 'M01',
    parentId: null,
    menuName: '系统管理',
    menuPath: '/system',
    menuSort: 1,
    status: '0',
    description: '',
    children: [
      {
        menuId: 'M01-1',
        parentId: 'M01',
        menuName: '用户管理',
        menuPath: '/system/user',
        menuSort: 1,
        status: '0',
        description: '',
      },
      {
        menuId: 'M01-2',
        parentId: 'M01',
        menuName: '角色管理',
        menuPath: '/system/role',
        menuSort: 2,
        status: '0',
        description: '',
      },
    ],
  },
  {
    menuId: 'M02',
    parentId: null,
    menuName: '业务管理',
    menuPath: '/business',
    menuSort: 2,
    status: '0',
    description: '',
    children: [
      {
        menuId: 'M02-1',
        parentId: 'M02',
        menuName: '流程管理',
        menuPath: '/business/process',
        menuSort: 1,
        status: '0',
        description: '',
      },
    ],
  },
];

/* ---------------------------- 排序工具函数 ------------------------------- */
// subtreeEndIndex 等工具函数已在文件前方定义
// 移动节点（同级 Up / Down 按钮）
const moveNode = (tree: MenuNode[], nodeId: string, direction: 'up' | 'down'): MenuNode[] => {
  const flat = treeToFlat(tree);
  const start = flat.findIndex(n => n.menuId === nodeId);
  if (start === -1) return tree;
  const node = flat[start];
  const end = subtreeEndIndex(flat, start);
  const block = flat.slice(start, end + 1);

  // 搜索目标兄弟
  let targetStart: number | null = null;
  if (direction === 'up') {
    for (let i = start - 1; i >= 0; i--) {
      if (flat[i].level === node.level && flat[i].parentId === node.parentId) {
        targetStart = i;
        break;
      }
    }
  } else {
    for (let i = end + 1; i < flat.length; i++) {
      if (flat[i].level === node.level && flat[i].parentId === node.parentId) {
        targetStart = i;
        break;
      }
    }
  }
  if (targetStart === null) return tree; // 已在边缘

  const remaining = [...flat];
  remaining.splice(start, block.length);

  // 计算插入索引
  let insertPos = targetStart;
  if (direction === 'down') {
    // 插入到目标兄弟之后（包括其子树之后）
    const targetEnd = subtreeEndIndex(remaining, insertPos - (start < targetStart ? block.length : 0));
    insertPos = targetEnd + 1;
  }

  remaining.splice(insertPos, 0, ...block);

  // 重新计算同级排序
  const siblings = remaining.filter(n => n.parentId === node.parentId && n.level === node.level);
  siblings.forEach((n, idx) => n.menuSort = idx + 1);

  const newTree = flatToTree(remaining);
  return assignSeq(newTree);
};

/* ------------------- 工具函数提前 ------------------ */
// Tree => Flat
const treeToFlat = (nodes: MenuNode[], level = 0): FlatNode[] => {
  const res: FlatNode[] = [];
  nodes
    .sort((a, b) => a.menuSort - b.menuSort)
    .forEach((n) => {
      const { children, ...rest } = n;
      res.push({ ...rest, level });
      if (children?.length) {
        res.push(...treeToFlat(children, level + 1));
      }
    });
  return res;
};

// Flat => Tree
const flatToTree = (flat: FlatNode[]): MenuNode[] => {
  const map = new Map<string, MenuNode>();
  const roots: MenuNode[] = [];

  flat.forEach((f) => {
    map.set(f.menuId, { ...f, children: [] });
  });
  flat.forEach((f) => {
    const node = map.get(f.menuId)!;
    if (f.parentId) {
      const parent = map.get(f.parentId);
      if (parent) parent.children!.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
};

// 计算子树块结束索引
const subtreeEndIndex = (flat: FlatNode[], start: number): number => {
  const baseLevel = flat[start].level;
  let end = start;
  while (end + 1 < flat.length && flat[end + 1].level > baseLevel) {
    end += 1;
  }
  return end;
};

/* ---------------- 序号计算 & 后端同步 ---------------- */
const assignSeq = (nodes: MenuNode[], parentSeq = 'S'): MenuNode[] => {
  return nodes
    .sort((a, b) => a.menuSort - b.menuSort)
    .map((n, idx) => {
      const seq = parentSeq === 'S' ? `S${String(idx + 1).padStart(2, '0')}` : `${parentSeq}${String(idx + 1).padStart(3, '0')}`;
      return {
        ...n,
        seq,
        children: n.children ? assignSeq(n.children, seq) : undefined,
      };
    });
};

const syncMenuOrder = async (tree: MenuNode[]) => {
  try {
    await axios.post('/api/system/menu/sort', tree);
  } catch (e) {
    console.error('sync menu order failed', e);
  }
};

/* ------------------ 主组件 ------------------ */
const MenuManagement: React.FC = () => {
  // 状态管理
  const [tree, setTree] = useState<MenuNode[]>(assignSeq(mockTree));
  const [selectedRows, setSelectedRows] = useState<MenuNode[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkStrictly, setCheckStrictly] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | 'view'>('view');
  const [currentRecord, setCurrentRecord] = useState<MenuNode | null>(null);
  // 表单实例
  const [drawerForm] = Form.useForm();

  // 扁平化列表
  const flat = useMemo(() => treeToFlat(tree), [tree]);

  /* ---------------- 拖拽排序实现 ---------------- */
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

  /* ======== 状态级联 ======== */
  const updateStatus = (id: string, status: '0' | '1') => {
    const dfs = (nodes: MenuNode[]): MenuNode[] => {
      return nodes.map((n) => {
        if (n.menuId === id) {
          // 更新自身及子孙
          const deepUpdate = (m: MenuNode): MenuNode => ({
            ...m,
            status,
            children: m.children ? m.children.map(deepUpdate) : undefined,
          });
          return deepUpdate(n);
        }
        return {
          ...n,
          children: n.children ? dfs(n.children) : undefined,
        };
      });
    };
    setTree((prev) => dfs(prev));
    message.success('状态已更新');
  };

  /* ======== 列定义 ======== */
  const columns: ColumnsType<FlatNode> = [
    {
      title: 'ID',
      dataIndex: 'seq',
      key: 'seq',
      width: 120,
    },
    {
      title: '菜单名称',
      dataIndex: 'menuName',
      key: 'menuName',
      render: (_: any, record: FlatNode) => <span style={{ paddingLeft: record.level * 20 }}>{record.menuName}</span>,
    },
    {
      title: '菜单路径',
      dataIndex: 'menuPath',
      key: 'menuPath',
      render: (path: string) => <code style={{ color: '#666' }}>{path}</code>,
    },
    {
      title: '说明',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => text || '-',
    },
    {
      title: '是否启用',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (_: any, record: FlatNode) => (
        <Switch
          size="small"
          checked={record.status === '0'}
          checkedChildren="启用"
          unCheckedChildren="停用"
          onChange={(checked) => updateStatus(record.menuId, checked ? '0' : '1')}
        />
      ),
    },
    {
      title: '排序',
      dataIndex: 'menuSort',
      key: 'menuSort',
      align: 'center',
      render: (sort: number, record: FlatNode) => {
        const siblings = flat.filter(n => n.parentId === record.parentId && n.level === record.level);
        const firstId = siblings[0]?.menuId;
        const lastId = siblings[siblings.length - 1]?.menuId;
        const isFirst = record.menuId === firstId;
        const isLast = record.menuId === lastId;
        return (
          <Space size="small">
            <Button
              size="small"
              icon={<UpOutlined />}
              disabled={isFirst}
              onClick={() => setTree(prev => {
                const updated = moveNode(prev, record.menuId, 'up');
                syncMenuOrder(updated);
                return updated;
              })}
            />
            <Button
              size="small"
              icon={<DownOutlined />}
              disabled={isLast}
              onClick={() => setTree(prev => {
                const updated = moveNode(prev, record.menuId, 'down');
                syncMenuOrder(updated);
                return updated;
              })}
            />
          </Space>
        );
      },
    },
    {
      title: '操作',
      key: 'actions',
      align: 'center',
      render: (_: any, record: FlatNode) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => handleRowView(record as any)}>查看</Button>
          <Button type="link" size="small" onClick={() => handleRowEdit(record as any)}>编辑</Button>
        </Space>
      ),
    },
  ];

  // 处理行选择
  const handleSelectionChange = (selectedRowKeys: React.Key[], selectedRows: MenuNode[]) => {
    setSelectedRows(selectedRows);
    setSelectedRowKeys(selectedRowKeys);
  };

  // 处理行查看
  const handleRowView = (record: MenuNode) => {
    setDrawerMode('view');
    setCurrentRecord(record);
    setDrawerOpen(true);
    drawerForm.setFieldsValue(record);
  };

  // 处理行编辑
  const handleRowEdit = (record: MenuNode) => {
    setDrawerMode('edit');
    setCurrentRecord(record);
    setDrawerOpen(true);
    drawerForm.setFieldsValue(record);
  };

  // 处理新增子菜单
  const handleAddChild = (record: MenuNode) => {
    setDrawerMode('create');
    setCurrentRecord(record);
    setDrawerOpen(true);
    drawerForm.resetFields();
    drawerForm.setFieldsValue({ parentId: record.menuId });
  };

  // 处理删除
  const handleDelete = (record: MenuNode) => {
    Modal.confirm({
      title: `确定删除菜单 [${record.menuName}] 吗?`,
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
  const buildParentOptions = (nodes: MenuNode[], level = 0): any[] => {
    return nodes.map(node => ({
      value: node.menuId,
      title: `${'--'.repeat(level)} ${node.menuName}`,
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
                新增菜单
              </Button>
            </div>
          </div>
        }
      >
        <Table
          className="data-table tree-table"
          columns={columns}
          dataSource={flat}
          rowKey="menuId"
          loading={loading}
          pagination={false}
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys: selectedRowKeys,
            onChange: handleSelectionChange,
            checkStrictly: checkStrictly,
          }}
          expandable={{
            defaultExpandAllRows: true,
          }}
          scroll={{
            y: '70vh', // 使用视口高度的70%，响应式适配
            x: 'max-content', // 水平滚动支持
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
                treeData={buildParentOptions(tree)}
                placeholder="请选择上级菜单"
                treeDefaultExpandAll
                allowClear
              />
            </Form.Item>
            <Form.Item name="menuName" label="菜单名称" rules={[{ required: true }]}>
              <Input placeholder="请输入菜单名称" />
            </Form.Item>
            <Form.Item name="menuPath" label="菜单路径" rules={[{ required: true }]}>
              <Input placeholder="请输入菜单路径" />
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
