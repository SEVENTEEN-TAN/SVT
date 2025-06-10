# SVT-Web

基于 React 18 + TypeScript + Ant Design 的企业级前端管理系统，核心特色是配置化页面生成系统。

## 🚀 技术栈

- **前端框架**: React 18 + TypeScript 5.0+ + Vite 5.0+
- **UI组件库**: Ant Design 5.15+ + @ant-design/icons  
- **状态管理**: Zustand 4.4+ + TanStack Query 5.0+
- **路由管理**: React Router 6.20+
- **表单处理**: React Hook Form 7.48+ + Zod 3.22+
- **HTTP客户端**: Axios 1.6+ 
- **加密处理**: crypto-js (AES加密)

## ✨ 核心特性

### 🎯 页面配置化系统
- **JSON Schema驱动**: 通过配置文件快速生成Info和List页面
- **智能数据源**: 支持API数据源、字段依赖、智能缓存
- **组件扩展**: 支持基础和高级组件，可自定义扩展
- **权限控制**: 细粒度的字段和操作权限管理

### 🛡️ 安全特性
- **JWT认证**: 完整的Token管理机制
- **AES加密**: 密码安全加密传输
- **路由守卫**: 自动权限验证
- **XSS防护**: 输入数据安全过滤

### 🎨 用户体验
- **响应式设计**: 适配各种屏幕尺寸
- **主题定制**: 支持深色/浅色主题切换
- **国际化**: 多语言支持
- **性能优化**: 代码分割、懒加载、缓存策略

## 🚦 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build
```

## 📖 文档

- **[开发指南](./开发指南.md)** - 技术选型、开发步骤、核心方案
- **[Schema配置规范](./Schema配置规范.md)** - 配置化页面的详细规范

## 🎯 配置化页面示例

### 一行代码生成页面
```typescript
// 用户信息页面
export const UserInfoPage = () => {
  const { id } = useParams();
  return <DynamicForm schemaPath="users/UserInfo" id={id} />;
};

// 用户列表页面  
export const UserListPage = () => {
  return <DynamicTable schemaPath="users/UserList" />;
};
```

### Schema配置示例
```json
{
  "pageType": "info",
  "title": "用户信息",
  "api": {
    "load": "/api/users/{id}",
    "save": "/api/users/{id}"
  },
  "fields": [
    {
      "key": "companyId",
      "label": "公司",
      "type": "select",
      "dataSource": {
        "type": "api",
        "url": "/api/companies/options"
      }
    },
    {
      "key": "departmentId", 
      "label": "部门",
      "type": "select",
      "dataSource": {
        "type": "api",
        "dependencies": {
          "watch": ["companyId"],
          "url": "/api/departments/options?companyId={companyId}"
        }
      }
    }
  ]
}
```

## 🏗️ 项目结构

```
src/
├── api/              # API接口层
├── components/       # 通用组件
│   ├── Schema/       # 配置化组件 (核心)
│   ├── Layout/       # 布局组件
│   └── Common/       # 公共组件
├── hooks/            # 自定义Hooks
├── pages/            # 页面组件
├── schemas/          # Schema配置文件
├── stores/           # 状态管理
├── types/            # 类型定义
└── utils/            # 工具函数
```

## 🎨 支持的功能

### 字段类型
- 基础组件: `input`, `select`, `datePicker`, `upload` 等
- 高级组件: `cascader`, `treeSelect`, `editor` 等
- 自定义组件: 支持注册机制

### 智能特性
- **字段依赖**: 公司选择更新部门选项
- **数据绑定**: 自动加载和保存数据
- **缓存机制**: 智能缓存API数据源
- **权限控制**: 字段和操作级别权限

### 表格功能
- 搜索、分页、排序
- 批量操作、行操作
- 自定义渲染、权限控制

---

**设计理念**: 通过配置驱动页面生成，减少80%的重复开发工作，让开发者专注于业务逻辑。

## 🔧 环境配置

### 开发环境 (.env.development)
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_TITLE=SVT管理系统
VITE_APP_VERSION=1.0.0
```

### 生产环境 (.env.production)
```env
VITE_API_BASE_URL=https://api.svt-system.com/api
VITE_APP_TITLE=SVT管理系统
VITE_APP_VERSION=1.0.0
```

## 🎯 核心功能

### 1. 认证系统
- [x] 用户登录/登出
- [x] JWT Token管理
- [x] 路由守卫
- [x] AES密码加密
- [x] 自动登出

### 2. 布局系统
- [x] 响应式主布局
- [x] 顶部导航栏
- [x] 侧边菜单栏
- [x] 面包屑导航
- [x] 主题切换

### 3. 菜单系统
- [x] 动态菜单加载
- [x] 权限控制
- [x] 多级菜单
- [x] 菜单折叠
- [x] 路由集成

### 4. 页面管理
- [x] 懒加载路由
- [x] 模块切换
- [x] 404页面
- [x] 加载状态
- [x] 错误边界

## 🔐 安全特性

### 密码加密
```typescript
// 前端密码加密示例
import CryptoJS from 'crypto-js';

const encryptPassword = (password: string): string => {
  const key = 'your-secret-key';
  return CryptoJS.AES.encrypt(password, key).toString();
};
```

### Token管理
```typescript
// JWT Token管理
interface TokenManager {
  getToken(): string | null;
  setToken(token: string): void;
  removeToken(): void;
  isTokenExpired(): boolean;
}
```

## 📱 响应式设计

支持多种设备屏幕尺寸：
- 桌面端: ≥1200px
- 平板端: 768px - 1199px
- 手机端: <768px

## 🧪 开发规范

### 代码规范
```typescript
// 组件开发规范
interface ComponentProps {
  title: string;
  onSubmit?: (data: any) => void;
}

const Component: React.FC<ComponentProps> = ({ title, onSubmit }) => {
  // Hooks
  const [loading, setLoading] = useState(false);
  
  // 事件处理
  const handleSubmit = useCallback(() => {
    // 处理逻辑
  }, []);
  
  // 渲染
  return (
    <Box>
      <Typography variant="h6">{title}</Typography>
      {/* 其他JSX */}
    </Box>
  );
};

export default Component;
```

### 状态管理
```typescript
// Zustand store示例
interface AuthState {
  user: User | null;
  token: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  login: async (credentials) => {
    // 登录逻辑
  },
  logout: () => {
    // 登出逻辑
  }
}));
```

## 🔍 调试指南

### 开发者工具
1. React DevTools - 组件调试
2. Zustand DevTools - 状态调试
3. 浏览器网络面板 - API调试

### 常见问题
1. **跨域问题**: 配置Vite代理
2. **状态不更新**: 检查状态管理逻辑
3. **路由404**: 验证路由配置
4. **样式问题**: 检查Ant Design主题

## 📋 开发计划

详细的开发计划请查看：
- [前端开发计划.md](./前端开发计划.md) - 完整的开发规划
- [开发执行步骤.md](./开发执行步骤.md) - 具体执行步骤

## 🚦 开发状态

### 已完成
- [x] 项目初始化
- [x] 开发环境配置
- [x] 项目架构设计

### 进行中
- [ ] 登录功能开发
- [ ] 主布局组件
- [ ] 菜单系统

### 待开发
- [ ] 系统管理模块
- [ ] 审计日志模块
- [ ] 用户权限模块

## 🤝 开发团队

- **前端负责人**: 待定
- **UI/UX设计**: 待定
- **测试工程师**: 待定

## 📄 许可证

MIT License

## 📞 技术支持

如有问题，请联系开发团队或创建Issue。

---

**项目版本**: v1.0.0  
**最后更新**: 2024年3月  
**开发状态**: 开发中 