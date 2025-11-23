# Schema配置规范

基于实际代码分析的SVT-Web前端数据模型与表单配置规范。

## 1. 概述

SVT-Web采用TypeScript接口定义数据模型，使用Ant Design表单组件进行数据验证和展示。本文档规范了项目中数据模型定义、表单配置、数据转换等相关标准。

### 1.1 核心原则

- **类型安全**: 使用TypeScript接口确保类型安全
- **手动配置**: 表单和表格通过代码显式配置
- **统一规范**: 遵循一致的命名和结构约定
- **数据转换**: 前后端数据格式转换标准化

### 1.2 技术选型

- **类型定义**: TypeScript接口
- **表单验证**: Ant Design Form内置验证
- **数据展示**: Ant Design Table
- **状态管理**: Zustand + TypeScript

## 2. 数据模型定义

### 2.1 接口命名规范

```typescript
// 实体模型 - 使用名词
interface User {
  id: string;
  username: string;
  status: '0' | '1';
}

// 查询参数 - 使用Query后缀
interface UserQuery extends BaseQuery {
  username?: string;
  status?: string;
}

// 创建/更新DTO - 使用DTO后缀
interface CreateUserDTO {
  username: string;
  password: string;
}

interface UpdateUserDTO {
  id: string;
  username?: string;
  status?: string;
}
```

### 2.2 通用基础类型

```typescript
// 基础查询参数
interface BaseQuery {
  page?: number;
  size?: number;
  sort?: string;
}

// API响应格式
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

// 分页数据
interface PageData<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
```

### 2.3 枚举类型定义

```typescript
// 使用字面量类型而非enum
type Status = '0' | '1';  // 0-禁用 1-启用
type MenuType = '0' | '1' | '2';  // 0-目录 1-菜单 2-按钮

// 枚举映射对象
const STATUS_MAP = {
  '0': { text: '禁用', color: 'error' },
  '1': { text: '启用', color: 'success' }
} as const;
```

## 3. 表单配置规范

### 3.1 表单实例创建

```typescript
import { Form } from 'antd';

function MyComponent() {
  const [form] = Form.useForm();
  
  // 表单初始化
  useEffect(() => {
    if (editData) {
      form.setFieldsValue(editData);
    }
  }, [editData, form]);
  
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
    >
      {/* 表单项 */}
    </Form>
  );
}
```

### 3.2 表单项配置

```typescript
// 基础输入框
<Form.Item
  name="username"
  label="用户名"
  rules={[
    { required: true, message: '请输入用户名' },
    { min: 3, max: 20, message: '用户名长度应为3-20个字符' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线' }
  ]}
>
  <Input placeholder="请输入用户名" />
</Form.Item>

// 下拉选择
<Form.Item
  name="status"
  label="状态"
  rules={[{ required: true, message: '请选择状态' }]}
>
  <Select placeholder="请选择状态">
    <Select.Option value="1">启用</Select.Option>
    <Select.Option value="0">禁用</Select.Option>
  </Select>
</Form.Item>

// 数字输入
<Form.Item
  name="sort"
  label="排序"
  rules={[
    { required: true, message: '请输入排序值' },
    { type: 'number', min: 0, max: 999, message: '排序值应在0-999之间' }
  ]}
>
  <InputNumber min={0} max={999} precision={0} />
</Form.Item>
```

### 3.3 表单验证规则

```typescript
// 自定义验证函数
const validatePassword = (_, value) => {
  if (!value) {
    return Promise.reject(new Error('请输入密码'));
  }
  if (value.length < 8) {
    return Promise.reject(new Error('密码长度至少8位'));
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
    return Promise.reject(new Error('密码必须包含大小写字母和数字'));
  }
  return Promise.resolve();
};

// 使用自定义验证
<Form.Item
  name="password"
  label="密码"
  rules={[{ validator: validatePassword }]}
>
  <Input.Password />
</Form.Item>
```

### 3.4 表单提交处理

```typescript
const handleSubmit = async (values: CreateUserDTO) => {
  try {
    // 数据转换
    const requestData = transformFormData(values);
    
    // API调用
    const response = await userApi.create(requestData);
    
    if (response.code === 200) {
      message.success('创建成功');
      form.resetFields();
      onSuccess?.();
    }
  } catch (error) {
    message.error('操作失败');
  }
};
```

## 4. 表格配置规范

### 4.1 列定义

```typescript
import { ColumnsType } from 'antd/es/table';

const columns: ColumnsType<User> = [
  {
    title: '用户名',
    dataIndex: 'username',
    key: 'username',
    width: 150,
    ellipsis: true,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    render: (status: Status) => (
      <Tag color={STATUS_MAP[status].color}>
        {STATUS_MAP[status].text}
      </Tag>
    ),
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 180,
    render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
  },
  {
    title: '操作',
    key: 'action',
    width: 150,
    fixed: 'right',
    render: (_, record) => (
      <Space>
        <Button type="link" onClick={() => handleEdit(record)}>
          编辑
        </Button>
        <Button type="link" danger onClick={() => handleDelete(record)}>
          删除
        </Button>
      </Space>
    ),
  },
];
```

### 4.2 表格配置

```typescript
<Table
  columns={columns}
  dataSource={dataList}
  rowKey="id"
  loading={loading}
  pagination={{
    current: pagination.current,
    pageSize: pagination.pageSize,
    total: pagination.total,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total) => `共 ${total} 条`,
    onChange: handlePageChange,
  }}
  scroll={{ x: 'max-content' }}
/>
```

## 5. 数据转换规范

### 5.1 前后端字段映射

```typescript
// 后端到前端的转换
export function transformMenuFromAPI(apiMenu: any): MenuNode {
  return {
    menuId: apiMenu.menu_id,
    parentId: apiMenu.parent_id,
    menuNameZh: apiMenu.menu_name_zh,
    menuNameEn: apiMenu.menu_name_en,
    menuPath: apiMenu.menu_path,
    menuIcon: apiMenu.menu_icon,
    menuSort: apiMenu.menu_sort,
    status: apiMenu.status,
    createTime: apiMenu.create_time,
  };
}

// 前端到后端的转换
export function transformMenuToAPI(menu: Partial<MenuNode>): any {
  return {
    menu_id: menu.menuId,
    parent_id: menu.parentId,
    menu_name_zh: menu.menuNameZh,
    menu_name_en: menu.menuNameEn,
    menu_path: menu.menuPath,
    menu_icon: menu.menuIcon,
    menu_sort: menu.menuSort,
    status: menu.status,
  };
}
```

### 5.2 数据验证函数

```typescript
export function validateMenuData(menuData: Partial<MenuNode>) {
  const errors: string[] = [];
  
  if (!menuData.menuNameZh?.trim()) {
    errors.push('菜单中文名称不能为空');
  }
  
  if (!menuData.menuPath?.trim()) {
    errors.push('菜单路径不能为空');
  }
  
  if (menuData.menuSort === undefined || menuData.menuSort < 0) {
    errors.push('排序值必须大于等于0');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
```

### 5.3 树形数据处理

```typescript
export function buildTreeData<T extends { id: string; parentId: string | null }>(
  flatData: T[]
): TreeNode<T>[] {
  const map = new Map<string, TreeNode<T>>();
  const roots: TreeNode<T>[] = [];
  
  // 创建节点映射
  flatData.forEach(item => {
    map.set(item.id, { ...item, children: [] });
  });
  
  // 构建树形结构
  flatData.forEach(item => {
    const node = map.get(item.id)!;
    if (item.parentId && map.has(item.parentId)) {
      map.get(item.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  
  return roots;
}
```

## 6. 搜索表单规范

### 6.1 搜索表单配置

```typescript
const SearchForm: React.FC<{ onSearch: (values: UserQuery) => void }> = ({ onSearch }) => {
  const [form] = Form.useForm();
  
  const handleSearch = (values: UserQuery) => {
    // 过滤空值
    const params = Object.entries(values).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {} as UserQuery);
    
    onSearch(params);
  };
  
  const handleReset = () => {
    form.resetFields();
    onSearch({});
  };
  
  return (
    <Form form={form} layout="inline" onFinish={handleSearch}>
      <Form.Item name="username">
        <Input placeholder="请输入用户名" allowClear />
      </Form.Item>
      
      <Form.Item name="status">
        <Select placeholder="请选择状态" allowClear style={{ width: 120 }}>
          <Select.Option value="1">启用</Select.Option>
          <Select.Option value="0">禁用</Select.Option>
        </Select>
      </Form.Item>
      
      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit">
            查询
          </Button>
          <Button onClick={handleReset}>
            重置
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};
```

## 7. 最佳实践

### 7.1 类型定义位置

```
src/types/
├── api.ts          # API相关类型
├── user.ts         # 用户模块类型
├── menu.ts         # 菜单模块类型
├── role.ts         # 角色模块类型
└── index.ts        # 公共类型导出
```

### 7.2 数据转换位置

```
src/pages/System/Menu/
├── index.tsx              # 页面组件
├── utils/
│   ├── dataTransform.ts  # 数据转换函数
│   └── validation.ts     # 数据验证函数
└── types.ts              # 页面特定类型
```

### 7.3 表单复用

```typescript
// 创建通用表单组件
const UserForm: React.FC<{
  initialValues?: Partial<User>;
  onSubmit: (values: User) => Promise<void>;
}> = ({ initialValues, onSubmit }) => {
  const [form] = Form.useForm();
  
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);
  
  return (
    <Form form={form} onFinish={onSubmit}>
      {/* 表单项 */}
    </Form>
  );
};

// 在不同场景复用
<UserForm onSubmit={handleCreate} />  // 创建
<UserForm initialValues={editUser} onSubmit={handleUpdate} />  // 编辑
```

### 7.4 错误处理

```typescript
// 统一的错误处理
const handleApiError = (error: any, defaultMessage = '操作失败') => {
  if (error.response?.data?.message) {
    message.error(error.response.data.message);
  } else if (error.message) {
    message.error(error.message);
  } else {
    message.error(defaultMessage);
  }
};

// 使用示例
try {
  await userApi.create(data);
  message.success('创建成功');
} catch (error) {
  handleApiError(error, '创建用户失败');
}
```

## 8. 注意事项

### 8.1 类型安全

- 避免使用`any`类型
- 为所有数据定义明确的接口
- 使用泛型提高代码复用性
- 利用TypeScript的类型推导

### 8.2 性能优化

- 大数据表格使用虚拟滚动
- 表单项较多时考虑分步表单
- 使用`useMemo`缓存计算结果
- 避免在render中创建新对象

### 8.3 用户体验

- 提供清晰的错误提示
- 表单验证即时反馈
- 加载状态显示
- 操作成功/失败提示

### 8.4 代码组织

- 相关类型定义放在一起
- 数据转换函数集中管理
- 表单验证规则可复用
- 遵循单一职责原则

---

## 📚 相关文档

- [前端设计原则](./Frontend-Design-Principles.md)
- [组件结构](./Component-Structure.md)
- [开发指南](./开发指南.md)