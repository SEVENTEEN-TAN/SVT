// {{CHENGQI:
// Action: Modified; Timestamp: 2025-06-28 16:58:44 +08:00; Reason: 全量接入后端API，替换Mock数据; Principle_Applied: API集成原则;
// }}

import React, {useEffect, useMemo, useState} from 'react';
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
    Spin,
    Switch,
    Table,
    TreeSelect,
    Tooltip,
    Typography,
    Tag,
    App,
} from 'antd';
import {DownOutlined, PlusOutlined, UpOutlined, ExclamationCircleFilled} from '@ant-design/icons';
import '../../../styles/PageContainer.css';
import './MenuManagement.css';

import type { ColumnsType } from 'antd/es/table';
import menuApi from '../../../api/system/menuApi';
import roleApi from '../../../api/system/roleApi';
import type { ActiveRole } from '../../../api/system/roleApi';

// 导入类型
import type { MenuNode, FlatNode } from './utils/dataTransform';

// 导入函数和值
import {
    transformBackendTreeToFrontend,
    transformFrontendToBackend,
    treeToFlat,
    flatToTree,
    assignSeq,
    subtreeEndIndex,
    validateMenuData,
} from './utils/dataTransform';

import { getIcon } from '../../../components/Layout/shared/utils/layoutUtils';

/* ---------------------------- 排序工具函数 ------------------------------- */
// 移动节点（同级 Up / Down 按钮）
const moveNode = async (tree: MenuNode[], nodeId: string, direction: 'up' | 'down'): Promise<MenuNode[]> => {
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

  // 重新计算同级排序并找出变动节点
  const siblings = remaining.filter(n => n.parentId === node.parentId && n.level === node.level);
  const changed: { menuId: string; sort: number }[] = [];

  siblings.forEach((n, idx) => {
    const newSort = idx + 1;
    if (n.menuSort !== newSort) {
      changed.push({ menuId: n.menuId, sort: newSort });
      n.menuSort = newSort;
    }
  });

  const newTree = flatToTree(remaining);
  const withSeq = assignSeq(newTree);

  // 移除 children 为空数组的节点，避免出现无实际子项却显示展开标识
  const pruneEmpty = (nodes: MenuNode[]): MenuNode[] =>
    nodes.map((n) => {
      const prunedChildren = n.children && n.children.length ? pruneEmpty(n.children) : undefined;
      return prunedChildren ? { ...n, children: prunedChildren } : { ...n, children: undefined } as MenuNode;
    });

  const finalTree = pruneEmpty(withSeq);

  // 分别调用后端API更新每个受影响节点的排序（确保后端收到全部变化）
  try {
    await Promise.all(
      changed.map(c => menuApi.updateMenuSort(c.menuId, c.sort))
    );
  } catch (error) {
    console.error('更新菜单排序失败:', error);
    message.error('更新排序失败');
    return tree; // 返回原树结构
  }

  return finalTree;
};

/* ---------------- 数据加载和同步函数 ---------------- */

/* ------------------ 主组件 ------------------ */
const MenuManagement: React.FC = () => {
  const { modal } = App.useApp();

  // 状态管理
  const [tree, setTree] = useState<MenuNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false); // 抽屉加载状态
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | 'view'>('view');
  const [currentRecord, setCurrentRecord] = useState<MenuNode | null>(null);
  const [roles, setRoles] = useState<ActiveRole[]>([]);
  // 表单实例
  const [drawerForm] = Form.useForm();

  // 加载菜单数据
  const loadMenuData = async () => {
    setLoading(true);
    try {
      const backendData = await menuApi.getAllMenuTree();
      const frontendTree = transformBackendTreeToFrontend(backendData);
      const treeWithSeq = assignSeq(frontendTree);
      setTree(treeWithSeq);
    } catch (error: any) {
      console.error('加载菜单数据失败:', error);
      message.error(error.message || '加载菜单数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 组件初始化时加载数据
  useEffect(() => {
    loadMenuData();
    roleApi.getActiveRoleList().then(setRoles).catch(console.error);
  }, []);

  /* ---------------- 数据操作函数 ---------------- */
  // 刷新数据
  const refreshData = () => {
    loadMenuData();
  };

  // 批量状态更新
  const batchUpdateStatus = async (status: '0' | '1') => {
    if (tree.length === 0) {
      message.warning('请先添加菜单');
      return;
    }

    modal.confirm({
      title: `确认${status === '0' ? '启用' : '停用'}所有菜单吗？`,
      content: `将${status === '0' ? '启用' : '停用'} ${tree.length} 个菜单`,
      onOk: async () => {
        try {
          const menuIds = tree.map(row => row.menuId);
          await menuApi.updateMenuStatus(menuIds, status);
          message.success(`批量${status === '0' ? '启用' : '停用'}成功`);
          // 刷新数据
          await loadMenuData();
        } catch (error: any) {
          console.error('批量更新状态失败:', error);
          message.error(error.message || '批量更新状态失败');
        }
      }
    });
  };

  // 批量删除 - 注意：后端暂无批量删除接口，这里先保留UI逻辑
  const batchDelete = () => {
    if (tree.length === 0) {
      message.warning('请先添加菜单');
      return;
    }

    modal.confirm({
      title: '确认删除所有菜单吗？',
      content: `将删除 ${tree.length} 个菜单，此操作不可恢复`,
      okType: 'danger',
      onOk: () => {
        // TODO: 等待后端提供批量删除接口
        message.warning('批量删除功能暂未实现，请联系后端开发人员添加相应接口');
      }
    });
  };

  /* ======== 状态级联更新 ======== */
  const updateStatus = async (id: string, status: '0' | '1') => {
    try {
      // 收集被影响的节点ID（目标节点 + 所有子孙节点）
      const collectIds = (node: MenuNode): string[] => {
        let ids: string[] = [node.menuId];
        if (node.children && node.children.length) {
          node.children.forEach(child => {
            ids = ids.concat(collectIds(child));
          });
        }
        return ids;
      };

      // 在当前树中找到目标节点
      const findNodeById = (nodes: MenuNode[]): MenuNode | null => {
        for (const n of nodes) {
          if (n.menuId === id) return n;
          if (n.children) {
            const found = findNodeById(n.children);
            if (found) return found;
          }
        }
        return null;
      };

      const targetNode = findNodeById(tree);
      const affectedIds = targetNode ? collectIds(targetNode) : [id];

      // 调用后端API更新状态（一次性提交全部受影响的ID）
      await menuApi.updateMenuStatus(affectedIds, status);

      // 更新本地状态（包含级联更新逻辑）
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
    } catch (error: any) {
      console.error('更新菜单状态失败:', error);
      message.error(error.message || '更新菜单状态失败');
    }
  };

  /* ======== 列定义 ======== */
  const columns: ColumnsType<MenuNode> = [
    {
      title: '菜单名称',
      dataIndex: 'menuNameZh',
      key: 'menuNameZh',
      width: '25%',
      ellipsis: true,
      render: (_: any, record: MenuNode) => {
        const fullText = `${record.menuNameZh}${record.menuNameEn ? ` (${record.menuNameEn})` : ''}`;
        return (
          <Tooltip title={fullText}>
            <span>
              {record.menuNameZh}
              {record.menuNameEn && (
                <span style={{ color: '#999', fontSize: '12px', marginLeft: '8px' }}>
                  ({record.menuNameEn})
                </span>
              )}
            </span>
          </Tooltip>
        );
      },    
    },
    {
      title: '菜单路径',
      dataIndex: 'menuPath',
      key: 'menuPath',
      width: '20%',
      ellipsis: true,
      render: (path: string) => (
        <Tooltip title={path}>
          <code style={{ color: '#666', fontSize: '12px' }}>{path}</code>
        </Tooltip>
      ),
    },
    {
      title: '图标',
      dataIndex: 'menuIcon',
      key: 'menuIcon',
      align: 'center',
      width: '8%',
      render: (icon: string) => icon ? getIcon(icon) : '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: '8%',
      render: (_: any, record: MenuNode) => (
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
      title: '描述',
      dataIndex: 'remark',
      key: 'remark',
      width: '15%',
      ellipsis: true,
      render: (text: string) => text ? (
        <Tooltip title={text}>
          <Typography.Paragraph style={{ marginBottom: 0 }} ellipsis={{ rows: 2 }}>
            {text}
          </Typography.Paragraph>
        </Tooltip>
      ) : '-',
    },
    {
      title: '排序',
      dataIndex: 'menuSort',
      key: 'menuSort',
      align: 'center',
      width: '12%',
      render: (sort: number, record: MenuNode) => {
        const siblings = treeToFlat(tree).filter(n => n.parentId === record.parentId);
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
              onClick={async () => {
                const updated = await moveNode(tree, record.menuId, 'up');
                setTree(updated);
              }}
            />
            <Button
              size="small"
              icon={<DownOutlined />}
              disabled={isLast}
              onClick={async () => {
                const updated = await moveNode(tree, record.menuId, 'down');
                setTree(updated);
              }}
            />
          </Space>
        );
      },
    },
    {
      title: '操作',
      key: 'actions',
      align: 'center',
      width: '12%',
      render: (_: any, record: MenuNode) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => handleRowView(record as any)}>查看</Button>
          <Button type="link" size="small" onClick={() => handleRowEdit(record as any)}>编辑</Button>
          <Button
            type="link"
            size="small"
            danger
            disabled={Array.isArray(record.children) && record.children.length > 0}
            onClick={(e) => { e.stopPropagation(); handleDelete(record); }}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  // 处理行查看
  const handleRowView = async (record: MenuNode) => {
    setDrawerMode('view');
    setCurrentRecord(record);
    setDrawerOpen(true);
    setDrawerLoading(true); // 开始加载

    try {
      // 从后端获取详细信息
      const detailData = await menuApi.getMenuDetail(record.menuId);
      const frontendData = transformBackendTreeToFrontend([detailData])[0];
      drawerForm.setFieldsValue({ ...frontendData, roleIds: detailData.roleList?.map(r=>r.roleId) });
    } catch (error: any) {
      console.error('获取菜单详情失败:', error);
      message.error(error.message || '获取菜单详情失败');
      // 如果获取失败，使用当前记录的数据
      drawerForm.setFieldsValue(record);
    } finally {
      setDrawerLoading(false); // 结束加载
    }
  };

  // 处理行编辑
  const handleRowEdit = async (record: MenuNode) => {
    setDrawerMode('edit');
    setCurrentRecord(record);
    setDrawerOpen(true);
    setDrawerLoading(true); // 开始加载

    try {
      // 从后端获取详细信息用于编辑
      const detailData = await menuApi.getMenuDetail(record.menuId);
      const frontendData = transformBackendTreeToFrontend([detailData])[0];
      drawerForm.setFieldsValue({ ...frontendData, roleIds: detailData.roleList?.map(r=>r.roleId) });
    } catch (error: any) {
      console.error('获取菜单详情失败:', error);
      message.error(error.message || '获取菜单详情失败');
      // 如果获取失败，使用当前记录的数据
      drawerForm.setFieldsValue(record);
    } finally {
      setDrawerLoading(false); // 结束加载
    }
  };

  // 处理新增子菜单
  const handleAddChild = (record: MenuNode) => {
    setDrawerMode('create');
    setCurrentRecord(record);
    setDrawerOpen(true);
    setDrawerLoading(false); // 新增模式不需要加载
    drawerForm.resetFields();
    drawerForm.setFieldsValue({ parentId: record.menuId, menuSort: getNextSort(record.menuId) });
  };

  // 处理删除
  const handleDelete = (record: MenuNode) => {
    if (Array.isArray(record.children) && record.children.length > 0) {
      message.warning('请先删除子菜单');
      return;
    }
    modal.confirm({
      title: '确认删除菜单',
      icon: <ExclamationCircleFilled />,
      content: `确定删除菜单 [${record.menuNameZh}] 吗？此操作不可逆，请谨慎操作。`,
      okText: '确定删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await menuApi.deleteMenu(record.menuId);
          message.success('删除成功');
          await loadMenuData();
        } catch (e:any) {
          message.error(e.message || '删除失败');
        }
      },
    });
  };

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await drawerForm.validateFields();

      // 数据验证
      const validation = validateMenuData(values);
      if (!validation.valid) {
        message.error(validation.errors.join(', '));
        return;
      }

      // 创建模式下，如果未填写排序值，则自动计算
      if (drawerMode === 'create' && (values.menuSort === undefined || values.menuSort === null)) {
        values.menuSort = getNextSort(values.parentId ?? null);
      }

      // 转换为后端数据格式
      const backendData: any = { ...transformFrontendToBackend(values), roleIds: values.roleIds };

      // 若为编辑模式，补充 menuId
      if (drawerMode === 'edit' && currentRecord?.menuId) {
        backendData.menuId = currentRecord.menuId;
      }

      // 调用后端API
      await menuApi.editMenu(backendData);

      setDrawerOpen(false);
      message.success(drawerMode === 'create' ? '创建成功' : '更新成功');

      // 刷新数据
      await loadMenuData();
    } catch (error: any) {
      console.error('提交表单失败:', error);
      message.error(error.message || '操作失败');
    }
  };

  // 构建父菜单选项
  const buildParentOptions = (nodes: MenuNode[], level = 0): any[] => {
    return nodes.map(node => ({
      value: node.menuId,
      title: `${'--'.repeat(level)} ${node.menuNameZh}`,
      children: node.children ? buildParentOptions(node.children, level + 1) : [],
    }));
  };

  // 扁平化列表（用于排序等逻辑）
  const flat = useMemo(() => treeToFlat(tree), [tree]);

  const getRoleLabel = (id:string)=> roles.find(r=>r.roleId===id)?.roleNameZh || id;

  const getNextSort = (parentId: string | null | undefined): number => {
    if (parentId) {
      // 找到父节点的直接子节点集合
      const parentNode = flat.find(n => n.menuId === parentId);
      if (!parentNode) return 1;
      const children = flat.filter(n => n.parentId === parentId);
      if (children.length === 0) return 1;
      return Math.max(...children.map(c => c.menuSort)) + 1;
    }
    // 顶级菜单
    if (flat.length === 0) return 1;
    const topLevel = flat.filter(n => !n.parentId);
    if (topLevel.length === 0) return 1;
    return Math.max(...topLevel.map(t => t.menuSort)) + 1;
  };

  // 在创建模式下，监听 parentId 变化自动更新 menuSort
  const handleValuesChange = (changed: any) => {
    if (drawerMode === 'create' && 'parentId' in changed) {
      const parentId = changed.parentId ?? null;
      drawerForm.setFieldsValue({ menuSort: getNextSort(parentId) });
    }
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
                  setDrawerLoading(false); // 新增模式不需要加载
                  drawerForm.resetFields();
                  drawerForm.setFieldsValue({ menuSort: getNextSort(null) });
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
          dataSource={tree}
          rowKey="menuId"
          loading={loading}
          pagination={false}
          expandable={{
            defaultExpandAllRows: false,
          }}
          tableLayout="fixed"
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
          <Spin spinning={drawerLoading} tip="加载中...">
            <Form
              form={drawerForm}
              layout="vertical"
              disabled={drawerMode === 'view'}
              className="drawer-form"
              onValuesChange={handleValuesChange}
            >
            <Form.Item name="parentId" label="上级菜单">
              <TreeSelect
                treeData={buildParentOptions(tree)}
                placeholder="请选择上级菜单"
                treeDefaultExpandAll
                allowClear
              />
            </Form.Item>

            {/* 菜单名称 - 按用户要求分离中英文名称 */}
            <Form.Item name="menuNameZh" label="菜单中文名称" rules={[{ required: true }]}>
              <Input placeholder="请输入菜单中文名称" />
            </Form.Item>
            <Form.Item name="menuNameEn" label="菜单英文名称">
              <Input placeholder="请输入菜单英文名称" />
            </Form.Item>

            <Form.Item name="menuPath" label="菜单路径" rules={[{ required: true }]}>
              <Input placeholder="请输入菜单路径" />
            </Form.Item>

            {/* 菜单图标 - 后端API支持但前端未实现 */}
            <Form.Item name="menuIcon" label="菜单图标">
              <Input placeholder="请输入图标名称（如：setting, user）" />
            </Form.Item>

            <Form.Item name="menuSort" label="显示排序">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item name="status" label="菜单状态" rules={[{ required: true }]}>
              <Select placeholder="请选择菜单状态">
                <Select.Option value="0">启用</Select.Option>
                <Select.Option value="1">停用</Select.Option>
              </Select>
            </Form.Item>

            {drawerMode==='view' ? (
              <Form.Item label="关联角色" shouldUpdate={(prev:any,cur:any)=>prev.roleIds!==cur.roleIds}>
                {({ getFieldValue }) => {
                  const roleIds = getFieldValue('roleIds') || [];
                  return (
                    <Space wrap>
                      {roleIds.length === 0 && <span style={{ color: '#999' }}>未选择</span>}
                      {roleIds.map((id: string) => (
                        <Tag key={id} title={roles.find(r => r.roleId === id)?.roleNameEn}>{getRoleLabel(id)}</Tag>
                      ))}
                    </Space>
                  );
                }}
              </Form.Item>
            ) : (
              <Form.Item name="roleIds" label="关联角色">
                <Select
                  mode="multiple"
                  placeholder="请选择角色"
                  options={roles.map(r => ({ label: `${r.roleNameZh} · ${r.roleNameEn}`, value: r.roleId }))}
                />
              </Form.Item>
            )}

              {/* 备注字段 - 对应后端的remark字段 */}
              <Form.Item name="remark" label="备注">
                <Input.TextArea placeholder="请输入备注信息" rows={3} />
              </Form.Item>
            </Form>
          </Spin>
        </div>

        {/* 底部操作按钮 */}
        {!drawerLoading && drawerMode !== 'view' && (
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
