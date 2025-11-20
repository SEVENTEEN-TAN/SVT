# SchemaPage 权限控制使用指南

## 📖 概述

本指南介绍如何在 SchemaPage 框架中使用权限控制功能,实现行操作按钮级别的权限管理。

## 🎯 功能特性

- ✅ **工具栏按钮权限控制**: 根据用户权限动态显示/隐藏工具栏按钮
- ✅ **行操作按钮权限控制**: 根据用户权限动态显示/隐藏行操作按钮
- ✅ **权限枚举管理**: 使用 PermissionEnum 集中管理所有权限码
- ✅ **自动权限检查**: 框架自动检查用户权限,无需手动判断
- ✅ **类型安全**: 完整的 TypeScript 类型支持
- ✅ **向后兼容**: 不影响现有代码,可选配置

## 🚀 快速开始

### 1. 在按钮配置中添加权限字段

```typescript
// pages/System/Role/schema.ts
import { PermissionEnum } from '@/constants/permissions';

export const roleSchema: PageSchema = {
  // 工具栏配置
  toolbar: {
    buttons: [
      {
        text: '新增角色',
        type: 'primary',
        permission: PermissionEnum.ROLE_ADD, // 🔑 使用权限枚举
        onClick: async () => {
          console.log('新增角色');
        },
      },
      {
        text: '批量删除',
        permission: PermissionEnum.ROLE_DELETE, // 🔑 使用权限枚举
        onClick: async (selectedRowKeys) => {
          console.log('批量删除:', selectedRowKeys);
        },
        needSelection: true,
      },
    ],
  },

  // 行操作配置
  rowActions: {
    buttons: [
      {
        text: '查看',
        permission: PermissionEnum.ROLE_QUERY, // 🔑 使用权限枚举
        onClick: (record) => {
          console.log('查看角色:', record);
        },
      },
      {
        text: '编辑',
        permission: PermissionEnum.ROLE_EDIT, // 🔑 使用权限枚举
        onClick: (record) => {
          console.log('编辑角色:', record);
        },
      },
      {
        text: '删除',
        permission: PermissionEnum.ROLE_DELETE, // 🔑 使用权限枚举
        onClick: (record) => {
          console.log('删除角色:', record);
        },
        style: { color: '#ff4d4f' },
      },
    ],
  },
};
```

### 2. 框架自动处理权限检查

无需额外代码,框架会自动:

1. 获取当前用户的权限列表 (从 `userStore.user.permissions`)
2. 检查每个按钮的 `permission` 字段
3. 如果用户没有该权限,自动隐藏按钮
4. 如果按钮没有配置 `permission` 字段,默认显示
5. 如果所有工具栏按钮都无权限,工具栏区域仍显示但无按钮
6. 如果所有行操作按钮都无权限,隐藏整个操作列

## 📋 权限枚举定义

### 权限枚举类 (PermissionEnum)

所有权限码都定义在 `src/constants/permissions.ts` 文件中:

```typescript
export enum PermissionEnum {
  // ==================== 角色管理 ====================
  /** 查询角色 */
  ROLE_QUERY = 'role:query',
  /** 新增角色 */
  ROLE_ADD = 'role:add',
  /** 修改角色 */
  ROLE_EDIT = 'role:edit',
  /** 删除角色 */
  ROLE_DELETE = 'role:delete',

  // ==================== 用户管理 ====================
  USER_QUERY = 'user:query',
  USER_ADD = 'user:add',
  USER_EDIT = 'user:edit',
  USER_DELETE = 'user:delete',

  // ==================== 菜单管理 ====================
  MENU_QUERY = 'menu:query',
  MENU_ADD = 'menu:add',
  MENU_EDIT = 'menu:edit',
  MENU_DELETE = 'menu:delete',

  // ==================== 机构管理 ====================
  ORG_QUERY = 'org:query',
  ORG_ADD = 'org:add',
  ORG_EDIT = 'org:edit',
  ORG_DELETE = 'org:delete',

  // ==================== 流程管理 ====================
  WORKFLOW_START = 'workflow:start',
  WORKFLOW_APPROVE = 'workflow:approve',
}
```

### 权限码命名规范

格式: `模块:操作`

**通用操作类型**:
- `query` - 查询/查看
- `add` - 新增/创建
- `edit` - 修改/编辑
- `delete` - 删除
- `start` - 发起流程
- `approve` - 审批流程

**示例**:
- `role:query` - 查询角色
- `role:add` - 新增角色
- `role:edit` - 修改角色
- `role:delete` - 删除角色
- `workflow:start` - 发起流程
- `workflow:approve` - 审批流程

## 🔧 高级用法

### 1. 手动权限检查

如果需要在业务逻辑中手动检查权限:

```typescript
import { checkPermission } from '@/utils/permissionUtils';
import { PermissionEnum } from '@/constants/permissions';

const handleSensitiveOperation = () => {
  if (!checkPermission(PermissionEnum.ROLE_DELETE)) {
    message.error('您没有删除权限');
    return;
  }
  
  // 执行删除操作
};
```

### 2. 检查多个权限

```typescript
import { checkAnyPermission, checkAllPermissions } from '@/utils/permissionUtils';
import { PermissionEnum } from '@/constants/permissions';

// 检查是否拥有任意一个权限
const hasAnyPermission = checkAnyPermission([
  PermissionEnum.ROLE_QUERY,
  PermissionEnum.ROLE_EDIT
]);

// 检查是否拥有所有权限
const hasAllPermissions = checkAllPermissions([
  PermissionEnum.ROLE_QUERY,
  PermissionEnum.ROLE_EDIT
]);
```

### 3. 在组件中使用权限过滤

**过滤行操作按钮**:
```typescript
import { useFilteredRowActions } from '@/utils/permissionUtils';
import { PermissionEnum } from '@/constants/permissions';

const MyComponent = () => {
  const rowButtons = [
    { text: '查看', permission: PermissionEnum.ROLE_QUERY, onClick: () => {} },
    { text: '编辑', permission: PermissionEnum.ROLE_EDIT, onClick: () => {} },
  ];

  // 自动过滤行操作按钮
  const filteredRowButtons = useFilteredRowActions(rowButtons);

  return (
    <Space>
      {filteredRowButtons.map(button => (
        <Button key={button.text} onClick={button.onClick}>
          {button.text}
        </Button>
      ))}
    </Space>
  );
};
```

**过滤工具栏按钮**:
```typescript
import { useFilteredToolbarButtons } from '@/utils/permissionUtils';
import { PermissionEnum } from '@/constants/permissions';

const MyComponent = () => {
  const toolbarButtons = [
    { text: '新增', permission: PermissionEnum.ROLE_ADD, onClick: () => {} },
    { text: '批量删除', permission: PermissionEnum.ROLE_DELETE, onClick: () => {} },
  ];

  // 自动过滤工具栏按钮
  const filteredToolbarButtons = useFilteredToolbarButtons(toolbarButtons);

  return (
    <Space>
      {filteredToolbarButtons.map(button => (
        <Button key={button.text} onClick={button.onClick}>
          {button.text}
        </Button>
      ))}
    </Space>
  );
};
```

## 🧪 验证功能

### 验证步骤

1. **启动项目**
   - 后端服务: `http://localhost:8080`
   - 前端服务: `http://localhost:5173`

2. **访问角色管理页面**
   ```
   http://localhost:5173/system/role
   ```

3. **测试不同权限场景**

   **场景1: 拥有所有权限**
   - 用户权限包含: `['role:query', 'role:add', 'role:edit', 'role:delete']`
   - 期望结果: 所有行操作按钮都显示

   **场景2: 只有查看权限**
   - 用户权限只有: `['role:query']`
   - 期望结果: 只显示"查看"按钮,其他按钮隐藏

   **场景3: 没有任何权限**
   - 用户权限为空: `[]`
   - 期望结果: 整个操作列隐藏

### 调试方法

在浏览器控制台执行以下命令:

```javascript
// 1. 查看当前用户权限
console.log('用户权限:', useUserStore.getState().user?.permissions);

// 2. 模拟不同权限的用户
const userStore = useUserStore.getState();

// 模拟只有查看权限
userStore.setUser({
  ...userStore.user,
  permissions: ['role:query']
});

// 模拟拥有所有权限
userStore.setUser({
  ...userStore.user,
  permissions: ['role:query', 'role:add', 'role:edit', 'role:delete']
});

// 刷新页面查看效果
window.location.reload();
```

## 📝 添加新权限

### 1. 在权限枚举中添加

编辑 `src/constants/permissions.ts`:

```typescript
export enum PermissionEnum {
  // ... 现有权限
  
  // 新增权限
  /** 导出角色数据 */
  ROLE_EXPORT = 'role:export',
  /** 导入角色数据 */
  ROLE_IMPORT = 'role:import',
}
```

### 2. 在按钮配置中使用

```typescript
{
  text: '导出',
  permission: PermissionEnum.ROLE_EXPORT,
  onClick: (record) => {
    // 导出逻辑
  },
}
```

### 3. 确保后端返回该权限

后端接口 `/api/user/details` 返回的 `permissionKeys` 数组中需要包含 `'role:export'` 和 `'role:import'`。

## 🔒 安全考虑

### 前端权限控制的局限性

**重要**: 前端权限控制仅用于UI展示,不能作为安全防护手段!

- ✅ **前端控制**: 隐藏按钮,优化用户体验
- ✅ **后端控制**: 接口权限验证,真正的安全防护

### 权限码同步

- 前后端权限码必须保持一致
- 权限码格式: `模块:操作[:子操作]`
- 定期审查权限配置

### 权限数据来源

```
用户登录
  ↓
后端返回用户信息 (包含 permissions 数组)
  ↓
前端存储到 userStore.user.permissions
  ↓
SchemaPage 自动过滤按钮
```

## 🎯 最佳实践

### 1. 权限码命名

- ✅ 使用小写字母和冒号
- ✅ 格式: `模块:操作`
- ✅ 通用操作: `query`, `add`, `edit`, `delete`, `start`, `approve`
- ✅ 示例: `role:query`, `role:add`, `workflow:start`
- ❌ 避免: `RoleQuery`, `role_query`, `roleQuery`

### 2. 权限粒度

- 行操作按钮: 控制单条记录操作权限
- 每个操作使用独立的权限码
- 避免过度细化或过度粗化

### 3. 用户体验

- 没有权限的按钮直接隐藏,而不是禁用
- 避免用户看到无法操作的按钮
- 所有按钮都无权限时,隐藏整个操作列

### 4. 代码组织

- 所有权限码定义在 `PermissionEnum` 中
- 使用枚举而非字符串硬编码
- 按模块组织权限定义

## 🐛 常见问题

### Q: 按钮没有隐藏?

A: 检查以下几点:
1. 确认 `permission` 字段使用了正确的枚举值
2. 确认用户权限列表中没有该权限
3. 检查浏览器控制台是否有错误
4. 确认后端返回的权限码格式正确

### Q: 所有按钮都隐藏了?

A: 检查以下几点:
1. 确认用户已登录且有权限数据
2. 在控制台查看: `useUserStore.getState().user?.permissions`
3. 确认权限码与后端返回的一致

### Q: 如何调试权限问题?

A: 使用以下方法:

```javascript
// 1. 查看用户权限
console.log('用户权限:', useUserStore.getState().user?.permissions);

// 2. 查看按钮配置
console.log('按钮配置:', roleSchema.rowActions?.buttons);

// 3. 手动测试权限检查
import { checkPermission } from '@/utils/permissionUtils';
import { PermissionEnum } from '@/constants/permissions';
console.log('有查询权限?', checkPermission(PermissionEnum.ROLE_QUERY));
```

### Q: 权限枚举值与后端不一致怎么办?

A: 
1. 前端枚举值必须与后端保持一致
2. 检查后端返回的权限码格式
3. 更新 `PermissionEnum` 中的值
4. 与后端团队协调统一权限码规范

## 📞 技术支持

如有问题,请:
1. 查看浏览器控制台错误信息
2. 检查权限配置是否正确
3. 参考本文档的调试方法
4. 联系开发团队获取支持

---

**最后更新**: 2025-01-20  
**版本**: 1.0.0
