# SchemaPage 快速开发框架

## 📖 简介

**SchemaPage** 是一个基于配置的快速开发框架，专为标准 CRUD 列表页面设计。通过简单的 Schema 配置，即可快速生成包含搜索、表格、表单的完整页面。

## ✅ 适用场景

**推荐使用 SchemaPage**：
- ✅ 标准 CRUD 列表页面（用户管理、商品管理等）
- ✅ 需要搜索、筛选、分页功能的数据表格
- ✅ 需要新增、编辑、删除操作的管理页面

**不推荐使用 SchemaPage**：
- ❌ 详情页 - 直接使用 `Descriptions` 组件更简单
- ❌ 仪表盘 - 直接使用 `Card` + `Statistic` 更灵活
- ❌ 复杂自定义布局 - 直接使用 Ant Design 组件

## 🚀 快速开始

### 1. 创建 Schema 配置

```typescript
// pages/Product/schema.ts
import type { PageSchema } from '@/components/ProTable/types';

export const productSchema: PageSchema = {
  title: '商品管理',
  
  // API 配置
  api: {
    listApi: (params) => request.post('/api/product/list', params),
    createApi: (data) => request.post('/api/product/create', data),
    updateApi: (data) => request.post('/api/product/update', data),
    deleteApi: (id) => request.post('/api/product/delete', { id }),
    batchDeleteApi: (ids) => request.post('/api/product/batch-delete', { ids }),
  },
  
  // 表格列配置
  table: {
    rowKey: 'id',
    columns: [
      {
        title: 'ID',
        dataIndex: 'id',
        width: 80,
        hideInForm: true,  // 表单中隐藏
      },
      {
        title: '商品名称',
        dataIndex: 'name',
        valueType: 'input',
        hideInSearch: false,  // 显示在搜索栏
        formRules: [{ required: true, message: '请输入商品名称' }],
      },
      {
        title: '分类',
        dataIndex: 'category',
        valueType: 'select',
        hideInSearch: false,
        options: [
          { label: '电子产品', value: '电子产品' },
          { label: '家居用品', value: '家居用品' },
        ],
      },
      {
        title: '价格',
        dataIndex: 'price',
        valueType: 'number',
        render: (val: number) => `¥${val}`,
      },
    ],
  },
};
```

### 2. 使用 SchemaPage 组件

```typescript
// pages/Product/index.tsx
import { SchemaPage } from '@/components/SchemaPage';
import { productSchema } from './schema';

const ProductPage = () => {
  return <SchemaPage schema={productSchema} />;
};

export default ProductPage;
```

就这么简单！一个功能完整的 CRUD 页面就创建好了。

## 📋 核心配置

### 1. 列配置 (TableColumn)

每个列支持以下配置：

```typescript
{
  title: string;              // 列标题
  dataIndex: string;          // 数据字段名
  valueType?: ValueType;      // 值类型
  options?: Array;            // 下拉选项（select 类型）
  
  // 显示控制
  hideInTable?: boolean;      // 在表格中隐藏
  hideInSearch?: boolean;     // 在搜索栏中隐藏（默认 true）
  hideInForm?: boolean;       // 在表单中隐藏
  
  // 表单配置
  formRules?: Rule[];         // 表单校验规则
  
  // Ant Design Table 原生属性
  width?: number;
  fixed?: 'left' | 'right';
  sorter?: boolean;
  render?: (value, record) => ReactNode;
}
```

**支持的 valueType**：
- `input` - 文本输入框
- `textarea` - 多行文本
- `number` - 数字输入
- `select` - 下拉选择
- `date` - 日期选择
- `dateRange` - 日期范围
- `switch` - 开关
- `password` - 密码输入

### 2. 工具栏按钮配置

```typescript
toolbar: {
  buttons: [
    {
      text: '新增',
      type: 'primary',
      icon: <PlusOutlined />,
      onClick: async (selectedRowKeys, selectedRows) => {
        // 自定义新增逻辑
      },
    },
    {
      text: '批量删除',
      onClick: async (selectedRowKeys, selectedRows) => {
        // 批量删除逻辑
      },
      needSelection: true,  // 需要选中数据才能点击
    },
    {
      text: '导出',
      onClick: async (selectedRowKeys, selectedRows) => {
        // 导出逻辑
      },
    },
  ],
}
```

**按钮属性**：
- `text` - 按钮文字
- `type` - 按钮类型（primary, default, dashed, link, text）
- `icon` - 按钮图标
- `onClick` - 点击回调（接收 selectedRowKeys 和 selectedRows）
- `needSelection` - 是否需要选中数据
- `visible` - 是否显示

### 3. 行操作按钮配置

```typescript
rowActions: {
  buttons: [
    {
      text: '查看',
      onClick: (record) => {
        // 查看详情
      },
    },
    {
      text: '编辑',
      onClick: (record) => {
        // 编辑逻辑
      },
      visible: (record) => record.status === 'draft',  // 动态显示
    },
    {
      text: '删除',
      onClick: (record) => {
        // 删除逻辑
      },
      style: { color: '#ff4d4f' },
    },
  ],
  width: 180,  // 操作列宽度
}
```

**按钮属性**：
- `text` - 按钮文字
- `onClick` - 点击回调（接收当前行数据 record）
- `visible` - 是否显示（可以是函数，根据 record 动态判断）
- `style` - 自定义样式

## 🎯 完整示例

```typescript
export const userSchema: PageSchema = {
  title: '用户管理',
  
  api: {
    listApi: (params) => userApi.getList(params),
    createApi: (data) => userApi.create(data),
    updateApi: (data) => userApi.update(data),
    deleteApi: (id) => userApi.delete(id),
    batchDeleteApi: (ids) => userApi.batchDelete(ids),
  },
  
  table: {
    rowKey: 'id',
    rowSelection: true,  // 显示复选框
    columns: [
      {
        title: 'ID',
        dataIndex: 'id',
        width: 80,
        hideInForm: true,
      },
      {
        title: '用户名',
        dataIndex: 'username',
        valueType: 'input',
        hideInSearch: false,
        formRules: [
          { required: true, message: '请输入用户名' },
          { min: 3, max: 20, message: '长度在 3 到 20 个字符' },
        ],
      },
      {
        title: '邮箱',
        dataIndex: 'email',
        valueType: 'input',
        hideInSearch: false,
        formRules: [
          { required: true, message: '请输入邮箱' },
          { type: 'email', message: '请输入有效的邮箱地址' },
        ],
      },
      {
        title: '角色',
        dataIndex: 'role',
        valueType: 'select',
        hideInSearch: false,
        options: [
          { label: '管理员', value: 'admin' },
          { label: '普通用户', value: 'user' },
        ],
      },
      {
        title: '状态',
        dataIndex: 'status',
        valueType: 'select',
        options: [
          { label: '启用', value: 'active' },
          { label: '禁用', value: 'inactive' },
        ],
        render: (val: string) => (
          <Tag color={val === 'active' ? 'green' : 'red'}>
            {val === 'active' ? '启用' : '禁用'}
          </Tag>
        ),
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        width: 180,
        hideInForm: true,
      },
    ],
  },
  
  toolbar: {
    buttons: [
      {
        text: '新增用户',
        type: 'primary',
        icon: <PlusOutlined />,
        onClick: async () => {
          console.log('新增用户');
        },
      },
      {
        text: '批量删除',
        icon: <DeleteOutlined />,
        onClick: async (selectedRowKeys, selectedRows) => {
          console.log('批量删除:', selectedRows);
        },
        needSelection: true,
      },
      {
        text: '导出数据',
        icon: <ExportOutlined />,
        onClick: async (selectedRowKeys, selectedRows) => {
          console.log('导出:', selectedRows);
        },
      },
    ],
  },
  
  rowActions: {
    buttons: [
      {
        text: '查看',
        onClick: (record) => {
          console.log('查看:', record);
        },
      },
      {
        text: '编辑',
        onClick: (record) => {
          console.log('编辑:', record);
        },
      },
      {
        text: '删除',
        onClick: (record) => {
          console.log('删除:', record);
        },
        style: { color: '#ff4d4f' },
      },
      {
        text: '重置密码',
        onClick: (record) => {
          console.log('重置密码:', record);
        },
        visible: (record) => record.role !== 'admin',  // 管理员不显示
      },
    ],
    width: 200,
  },
};
```

## 💡 高级用法

### 1. 自定义搜索字段配置

```typescript
{
  title: '商品名称',
  dataIndex: 'name',
  hideInSearch: false,
  searchProps: {
    placeholder: '请输入商品名称进行搜索',  // 自定义 placeholder
  },
}
```

### 2. 自定义表单字段配置

```typescript
{
  title: '价格',
  dataIndex: 'price',
  valueType: 'number',
  formProps: {
    placeholder: '请输入商品价格',
  },
  formRules: [
    { required: true, message: '请输入价格' },
    { type: 'number', min: 0, message: '价格不能为负数' },
  ],
}
```

### 3. 动态显示/隐藏行操作按钮

```typescript
rowActions: {
  buttons: [
    {
      text: '发布',
      onClick: (record) => { /* ... */ },
      visible: (record) => record.status === 'draft',  // 仅草稿状态显示
    },
    {
      text: '下架',
      onClick: (record) => { /* ... */ },
      visible: (record) => record.status === 'published',  // 仅已发布状态显示
    },
  ],
}
```

## 🔧 底层组件

如果 SchemaPage 不满足需求，可以单独使用底层组件：

```typescript
import { SearchSection, DataSection, ActionDrawer } from '@/components/ProTable';

// 自定义组合使用
<>
  <SearchSection fields={searchFields} onSearch={handleSearch} />
  <MyCustomComponent />
  <DataSection columns={columns} dataSource={data} />
  <ActionDrawer open={open} mode="edit" columns={columns} />
</>
```

## 📝 最佳实践

1. **保持 Schema 配置简洁**：将复杂逻辑抽取到单独的函数中
2. **合理使用 valueType**：选择合适的输入类型提升用户体验
3. **善用 hideIn* 属性**：精确控制字段在不同场景的显示
4. **自定义按钮回调**：在 onClick 中实现业务逻辑
5. **类型安全**：充分利用 TypeScript 类型提示

## 🎨 UI 特性

- ✅ 搜索栏：3+N 布局（前 3 个可见，其余在"更多筛选"中）
- ✅ 表格：支持排序、筛选、分页、列设置、全屏
- ✅ 表单：支持新增、编辑、查看三种模式
- ✅ 紧凑布局：优化间距，提升空间利用率

## 📚 相关文档

- [ProTable 组件文档](src/components/ProTable/README.md)
- [类型定义](src/components/ProTable/types.ts)
- [示例页面](src/pages/Demo/SchemaPageDemo)

---

**访问示例页面**: `/demo/schema-page`
