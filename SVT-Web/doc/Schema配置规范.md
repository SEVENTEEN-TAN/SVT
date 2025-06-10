# Schema 配置规范

## 📋 Info页面配置

### 基础结构
```json
{
  "pageType": "info",
  "title": "用户信息",
  "api": {
    "load": "/api/users/{id}",
    "save": "/api/users/{id}",
    "create": "/api/users"
  },
  "layout": {
    "columns": 2,
    "labelAlign": "right",
    "size": "middle"
  },
  "fields": []
}
```

### 字段配置

#### 文本输入
```json
{
  "key": "username",
  "label": "用户名",
  "type": "input",
  "required": true,
  "placeholder": "请输入用户名",
  "maxLength": 50,
  "rules": [
    {
      "pattern": "^[a-zA-Z0-9_]{3,20}$",
      "message": "用户名只能包含字母、数字、下划线，长度3-20位"
    }
  ]
}
```

#### 下拉选择（静态数据）
```json
{
  "key": "status",
  "label": "状态",
  "type": "select",
  "required": true,
  "placeholder": "请选择状态",
  "dataSource": {
    "type": "static",
    "options": [
      { "label": "启用", "value": 1 },
      { "label": "禁用", "value": 0 }
    ]
  }
}
```

#### 下拉选择（API数据）
```json
{
  "key": "companyId",
  "label": "公司",
  "type": "select",
  "required": true,
  "dataSource": {
    "type": "api",
    "url": "/api/companies/options",
    "method": "GET",
    "responseMapping": {
      "labelField": "name",
      "valueField": "id",
      "dataPath": "data"
    },
    "cache": {
      "enabled": true,
      "duration": 300
    }
  }
}
```

#### 字段依赖
```json
{
  "key": "departmentId",
  "label": "部门",
  "type": "select",
  "required": true,
  "dataSource": {
    "type": "api",
    "url": "/api/departments/options",
    "dependencies": {
      "watch": ["companyId"],
      "url": "/api/departments/options?companyId={companyId}"
    },
    "responseMapping": {
      "labelField": "name",
      "valueField": "id"
    }
  }
}
```

## 📊 List页面配置

### 基础结构
```json
{
  "pageType": "list",
  "title": "用户列表",
  "api": {
    "list": "/api/users",
    "delete": "/api/users/{id}",
    "batchDelete": "/api/users/batch"
  },
  "search": {
    "enabled": true,
    "fields": []
  },
  "table": {
    "columns": [],
    "pagination": true,
    "selection": true,
    "actions": []
  },
  "toolbar": {
    "actions": []
  }
}
```

### 搜索配置
```json
{
  "search": {
    "enabled": true,
    "layout": "inline",
    "fields": [
      {
        "key": "username",
        "label": "用户名",
        "type": "input",
        "placeholder": "用户名模糊搜索"
      },
      {
        "key": "status",
        "label": "状态",
        "type": "select",
        "dataSource": {
          "type": "static",
          "options": [
            { "label": "全部", "value": "" },
            { "label": "启用", "value": 1 },
            { "label": "禁用", "value": 0 }
          ]
        }
      }
    ]
  }
}
```

### 表格列配置
```json
{
  "table": {
    "columns": [
      {
        "key": "username",
        "title": "用户名",
        "width": 120,
        "fixed": "left"
      },
      {
        "key": "email",
        "title": "邮箱",
        "width": 200
      },
      {
        "key": "status",
        "title": "状态",
        "width": 80,
        "render": {
          "type": "tag",
          "mapping": {
            "1": { "color": "green", "text": "启用" },
            "0": { "color": "red", "text": "禁用" }
          }
        }
      },
      {
        "key": "createTime",
        "title": "创建时间",
        "width": 180,
        "render": {
          "type": "date",
          "format": "YYYY-MM-DD HH:mm:ss"
        }
      }
    ]
  }
}
```

### 操作按钮配置
```json
{
  "toolbar": {
    "actions": [
      {
        "key": "add",
        "label": "新增",
        "type": "primary",
        "icon": "PlusOutlined",
        "action": {
          "type": "navigate",
          "path": "/users/add"
        }
      },
      {
        "key": "batchDelete",
        "label": "批量删除",
        "type": "danger",
        "icon": "DeleteOutlined",
        "action": {
          "type": "api",
          "api": "/api/users/batch",
          "method": "DELETE",
          "confirm": {
            "title": "确认删除",
            "content": "确定要删除选中的用户吗？"
          }
        },
        "permission": "user:delete"
      }
    ]
  }
}
```

### 行操作配置
```json
{
  "table": {
    "actions": [
      {
        "key": "edit",
        "label": "编辑",
        "type": "link",
        "action": {
          "type": "navigate",
          "path": "/users/edit/{id}"
        },
        "permission": "user:edit"
      },
      {
        "key": "delete",
        "label": "删除",
        "type": "link",
        "danger": true,
        "action": {
          "type": "api",
          "api": "/api/users/{id}",
          "method": "DELETE",
          "confirm": {
            "title": "确认删除",
            "content": "确定要删除用户 {username} 吗？"
          }
        },
        "permission": "user:delete"
      }
    ]
  }
}
```

## 🎨 组件类型规范

### 基础组件
```json
// 输入框
{ "type": "input", "placeholder": "提示文字", "maxLength": 100 }

// 数字输入
{ "type": "number", "min": 0, "max": 999, "precision": 2 }

// 多行文本
{ "type": "textarea", "rows": 4, "maxLength": 500 }

// 密码框
{ "type": "password", "minLength": 6 }

// 日期选择
{ "type": "datePicker", "format": "YYYY-MM-DD", "showTime": false }

// 日期范围
{ "type": "dateRange", "format": "YYYY-MM-DD" }

// 开关
{ "type": "switch", "checkedValue": 1, "uncheckedValue": 0 }

// 文件上传
{
  "type": "upload",
  "accept": ".jpg,.png,.pdf",
  "maxSize": 5,
  "maxCount": 1,
  "action": "/api/upload"
}
```

### 高级组件
```json
// 级联选择
{
  "type": "cascader",
  "dataSource": {
    "type": "api",
    "url": "/api/areas/tree"
  },
  "fieldNames": {
    "label": "name",
    "value": "code",
    "children": "children"
  }
}

// 树形选择
{
  "type": "treeSelect",
  "dataSource": {
    "type": "api",
    "url": "/api/departments/tree"
  },
  "multiple": false,
  "showSearch": true
}

// 富文本编辑器
{
  "type": "editor",
  "height": 300,
  "toolbar": ["bold", "italic", "underline", "link", "image"]
}
```

## 🔧 数据源配置

### API数据源
```json
{
  "dataSource": {
    "type": "api",
    "url": "/api/endpoint",
    "method": "GET",
    "headers": {
      "Content-Type": "application/json"
    },
    "params": {
      "pageSize": 100
    },
    "responseMapping": {
      "labelField": "name",
      "valueField": "id",
      "dataPath": "data.records"
    },
    "cache": {
      "enabled": true,
      "duration": 300,
      "key": "custom_cache_key"
    },
    "dependencies": {
      "watch": ["parentId"],
      "url": "/api/endpoint?parentId={parentId}",
      "debounce": 300
    }
  }
}
```

### 静态数据源
```json
{
  "dataSource": {
    "type": "static",
    "options": [
      { "label": "选项1", "value": "1" },
      { "label": "选项2", "value": "2" }
    ]
  }
}
```

## 📏 验证规则

### 内置验证
```json
{
  "required": true,
  "minLength": 3,
  "maxLength": 20,
  "min": 0,
  "max": 100,
  "pattern": "^[0-9]+$",
  "email": true,
  "url": true,
  "number": true
}
```

### 自定义验证
```json
{
  "rules": [
    {
      "pattern": "^1[3-9]\\d{9}$",
      "message": "请输入正确的手机号码"
    },
    {
      "validator": "checkUniqueUsername",
      "message": "用户名已存在"
    }
  ]
}
```

## 🎯 权限控制

### 字段权限
```json
{
  "key": "salary",
  "label": "薪资",
  "type": "number",
  "permission": {
    "view": "user:salary:view",
    "edit": "user:salary:edit"
  }
}
```

### 操作权限
```json
{
  "key": "delete",
  "label": "删除",
  "permission": "user:delete",
  "action": {
    "type": "api",
    "api": "/api/users/{id}",
    "method": "DELETE"
  }
}
```

## 📱 响应式配置

### 布局配置
```json
{
  "layout": {
    "columns": {
      "xs": 1,
      "sm": 1,
      "md": 2,
      "lg": 3,
      "xl": 4
    },
    "gutter": {
      "xs": 16,
      "sm": 16,
      "md": 24,
      "lg": 32
    }
  }
}
```

## 🚀 使用示例

### 完整的用户信息页配置
```json
{
  "pageType": "info",
  "title": "用户信息",
  "api": {
    "load": "/api/users/{id}",
    "save": "/api/users/{id}",
    "create": "/api/users"
  },
  "layout": {
    "columns": 2,
    "labelAlign": "right"
  },
  "fields": [
    {
      "key": "username",
      "label": "用户名",
      "type": "input",
      "required": true,
      "colSpan": 1,
      "rules": [
        {
          "pattern": "^[a-zA-Z0-9_]{3,20}$",
          "message": "用户名格式不正确"
        }
      ]
    },
    {
      "key": "email",
      "label": "邮箱",
      "type": "input",
      "required": true,
      "colSpan": 1,
      "rules": [{ "email": true }]
    },
    {
      "key": "companyId",
      "label": "公司",
      "type": "select",
      "required": true,
      "colSpan": 1,
      "dataSource": {
        "type": "api",
        "url": "/api/companies/options",
        "responseMapping": {
          "labelField": "name",
          "valueField": "id"
        }
      }
    },
    {
      "key": "departmentId",
      "label": "部门",
      "type": "select",
      "required": true,
      "colSpan": 1,
      "dataSource": {
        "type": "api",
        "url": "/api/departments/options",
        "dependencies": {
          "watch": ["companyId"],
          "url": "/api/departments/options?companyId={companyId}"
        }
      }
    }
  ]
}
```

---

**说明**: 此规范涵盖了常用的Schema配置场景，可根据实际需求扩展。 