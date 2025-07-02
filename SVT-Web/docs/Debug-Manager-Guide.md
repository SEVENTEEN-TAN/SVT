# DebugManager 调试管理器使用指南

基于实际代码分析的DebugManager调试管理器使用指南。

## 1. 概述

DebugManager是SVT前端项目的统一调试信息管理工具，提供分级的调试信息输出，确保开发环境的调试便利性和生产环境的安全性。

### 1.1 核心特性

- **🔒 安全分级**: 根据信息敏感度自动分级处理
- **🛡️ 自动脱敏**: 生产环境自动脱敏敏感信息
- **📊 结构化日志**: 统一的日志格式和上下文信息
- **🎯 环境隔离**: 开发/生产环境智能切换
- **⚡ 性能监控**: 内置性能监控和API调用跟踪

### 1.2 技术实现

**文件位置**: `/src/utils/debugManager.ts`

**依赖环境变量**:
- `import.meta.env.DEV` - 判断是否为开发环境
- `VITE_DEBUG_SENSITIVE` - 控制敏感信息输出
- `VITE_PRODUCTION_LOGGING` - 控制生产环境日志

**日志级别**:
```typescript
enum LogLevel {
  DEBUG = 0,      // 调试信息
  INFO = 1,       // 一般信息
  WARN = 2,       // 警告信息
  ERROR = 3,      // 错误信息
  PRODUCTION = 4  // 生产日志
}
```

## 2. 使用指南

### 2.1 基本使用

```typescript
import { DebugManager } from '@/utils/debugManager';
// 或使用便捷函数
import { debug, debugError, debugInfo } from '@/utils/debugManager';

// 普通调试信息（开发环境可见）
DebugManager.log('组件渲染', { componentName: 'Header' });

// 敏感调试信息（需要特殊环境变量启用）
DebugManager.logSensitive('用户详情', userInfo);

// 错误信息（自动脱敏）
DebugManager.error('API调用失败', error);

// 生产环境关键操作
DebugManager.production('用户登录成功');
```

### 2.2 环境变量配置

```env
# .env.development
VITE_DEBUG_SENSITIVE=true          # 启用敏感调试信息
VITE_PRODUCTION_LOGGING=false      # 生产环境日志（开发环境建议关闭）

# .env.production  
VITE_DEBUG_SENSITIVE=false         # 生产环境禁用敏感调试
VITE_PRODUCTION_LOGGING=true       # 生产环境启用关键日志
```

## 3. API接口详解

### 3.1 核心方法

#### log(message: string, data?: any, context?: LogContext)
**用途**: 普通调试信息
**环境**: 仅开发环境显示
**格式**: `[timestamp] [DEBUG] message [context]`

```typescript
DebugManager.log('组件渲染', { props }, {
  component: 'UserProfile',
  action: 'render'
});
// 输出: [2025-01-01T12:00:00.000Z] [DEBUG] 组件渲染 [component:UserProfile, action:render]
```

#### logSensitive(message: string, data?: any, context?: LogContext)
**用途**: 敏感信息调试
**环境**: 开发环境 + VITE_DEBUG_SENSITIVE=true
**特点**: 带🔐标识

```typescript
DebugManager.logSensitive('用户认证信息', {
  token: userToken,
  userId: user.id
});
// 输出: 🔐 [timestamp] [SENSITIVE] 用户认证信息
```

#### info(message: string, data?: any, context?: LogContext)
**用途**: 信息级别日志
**环境**: 开发环境显示详情，生产环境显示简化信息
**特点**: 带ℹ️标识

```typescript
DebugManager.info('系统初始化完成', { version: '1.0.0' });
// 开发环境: ℹ️ [timestamp] [INFO] 系统初始化完成 {version: '1.0.0'}
// 生产环境: ℹ️ [timestamp] [INFO] 系统初始化完成
```

#### warn(message: string, data?: any, context?: LogContext)
**用途**: 警告信息
**环境**: 所有环境显示，生产环境不含敏感数据
**特点**: 带⚠️标识

```typescript
DebugManager.warn('API响应缓慢', { duration: 3000 });
// 开发环境: ⚠️ [timestamp] [WARN] API响应缓慢 {duration: 3000}
// 生产环境: ⚠️ [timestamp] [WARN] API响应缓慢
```

#### error(message: string, error?: Error, context?: LogContext)
**用途**: 错误日志
**环境**: 所有环境显示，生产环境自动脱敏
**特点**: 带❌标识，自动脱敏处理

```typescript
DebugManager.error('数据加载失败', error);
// 开发环境: ❌ [timestamp] [ERROR] 数据加载失败 Error对象
// 生产环境: ❌ 数据加载失败 (已脱敏)
```

#### production(message: string, context?: LogContext)
**用途**: 生产环境关键操作日志
**环境**: 所有环境显示
**特点**: 带🚀标识，不包含敏感数据

```typescript
DebugManager.production('用户登录成功', {
  component: 'auth',
  action: 'login'
});
// 输出: 🚀 [timestamp] [PROD] 用户登录成功 [component:auth, action:login]
```

### 3.2 特殊功能

#### performance(message: string, duration?: number, context?: LogContext)
**用途**: 性能监控日志
**特点**: 带⚡标识，显示执行时间

```typescript
const startTime = Date.now();
// ... 执行操作
const duration = Date.now() - startTime;
DebugManager.performance('数据处理完成', duration);
// 输出: ⚡ [timestamp] [PERF] 数据处理完成 (150ms)
```

#### userAction(action: string, userId?: string, data?: any)
**用途**: 记录用户操作
**特点**: 生产环境自动脱敏用户ID

```typescript
DebugManager.userAction('点击提交按钮', 'user123', { buttonId: 'submit' });
// 开发环境: 用户操作: 点击提交按钮 [user:user123]
// 生产环境: 🚀 用户操作: 点击提交按钮 [user:us***23]
```

#### apiCall(method: string, url: string, duration?: number, status?: number)
**用途**: API调用跟踪
**特点**: 生产环境只记录失败调用

```typescript
DebugManager.apiCall('POST', '/api/users', 150, 200);
// 开发环境: [timestamp] [DEBUG] API POST /api/users {duration: 150, status: 200}
// 生产环境: 仅当status >= 400时记录
```

#### logIf(condition: boolean, message: string, data?: any, context?: LogContext)
**用途**: 条件调试
**特点**: 满足条件才输出

```typescript
DebugManager.logIf(user.role === 'admin', '管理员操作', { action: 'deleteUser' });
// 仅当条件为true时输出日志
```

#### group(label: string, callback: () => void)
**用途**: 分组日志
**特点**: 将相关日志分组显示

```typescript
DebugManager.group('用户认证流程', () => {
  DebugManager.log('开始认证');
  DebugManager.log('验证Token');
  DebugManager.log('获取用户信息');
});
// 输出:
// 📁 用户认证流程
//   [DEBUG] 开始认证
//   [DEBUG] 验证Token
//   [DEBUG] 获取用户信息
```

### 3.3 LogContext上下文

```typescript
interface LogContext {
  component?: string;    // 组件名称
  action?: string;       // 操作名称  
  userId?: string;       // 用户ID（自动脱敏）
  timestamp?: number;    // 时间戳
}
```

**上下文格式化**:
```typescript
// 输入
const context = {
  component: 'UserProfile',
  action: 'updateAvatar',
  userId: 'user123'
};

// 输出格式
"[component:UserProfile, action:updateAvatar, user:user123]"
```

## 4. 安全机制

### 4.1 自动脱敏规则

**sanitizeErrorMessage实现**:
```typescript
// 自动替换敏感信息
token: Bearer abc123... → token: ***
password: secret123   → password: ***
key: sk-1234567      → key: ***
/api/users/123       → /api/***
localhost:3000       → localhost:***
```

### 4.2 用户ID脱敏

**maskUserId实现**:
```typescript
// 保留前2位和后2位
"user123456" → "us***56"
"abc"        → "***"
undefined    → undefined
```

### 4.3 URL脱敏

**sanitizeUrl实现**:
```typescript
// 移除查询参数和ID
"/api/users/123?token=abc" → "/api/users/***"
"/api/orders/456/items"    → "/api/orders/***/items"
```

## 5. 最佳实践

### 5.1 环境配置

```typescript
// 获取当前配置
const config = DebugManager.getConfig();
console.log(config);
// {
//   isDevelopment: true,
//   isSensitiveDebugEnabled: true,
//   isProductionLoggingEnabled: false,
//   environment: 'development'
// }
```

### 5.2 使用建议

**DO - 推荐做法**:
```typescript
// ✅ 提供完整的上下文信息
DebugManager.log('用户操作', data, {
  component: 'UserProfile',
  action: 'update'
});

// ✅ 敏感信息使用专用方法
DebugManager.logSensitive('认证信息', { token, userId });

// ✅ 错误处理统一使用error方法
try {
  await apiCall();
} catch (error) {
  DebugManager.error('API调用失败', error as Error);
}
```

**DON'T - 避免做法**:
```typescript
// ❌ 直接使用console
console.log('debug info');

// ❌ 敏感信息使用普通log
DebugManager.log('用户密码:', password);

// ❌ 硬编码敏感信息
DebugManager.log('API Key: sk-123456');
```

### 5.3 便捷函数导出

```typescript
// 导入便捷函数
import {
  debug,            // = DebugManager.log
  debugSensitive,   // = DebugManager.logSensitive
  debugInfo,        // = DebugManager.info
  debugWarn,        // = DebugManager.warn
  debugError,       // = DebugManager.error
  debugProduction,  // = DebugManager.production
  debugPerformance, // = DebugManager.performance
  debugUserAction,  // = DebugManager.userAction
  debugApiCall      // = DebugManager.apiCall
} from '@/utils/debugManager';

// 使用示例
debug('快速调试');
debugError('快速错误', error);
```

## 6. 实际应用场景

### 6.1 组件调试

```typescript
// 在React组件中使用
import { DebugManager } from '@/utils/debugManager';

function UserProfile() {
  useEffect(() => {
    DebugManager.log('组件挂载', null, {
      component: 'UserProfile',
      action: 'mount'
    });
    
    return () => {
      DebugManager.log('组件卸载', null, {
        component: 'UserProfile',
        action: 'unmount'
      });
    };
  }, []);
}
```

### 6.2 API请求调试

```typescript
// 在请求拦截器中使用
axios.interceptors.request.use(config => {
  const startTime = Date.now();
  config.metadata = { startTime };
  
  DebugManager.apiCall(
    config.method?.toUpperCase() || 'GET',
    config.url || '',
    undefined,
    undefined
  );
  
  return config;
});
```

### 6.3 状态管理调试

```typescript
// 在Zustand store中使用
const useAuthStore = create((set) => ({
  login: async (credentials) => {
    DebugManager.logSensitive('开始登录', credentials);
    try {
      const result = await authApi.login(credentials);
      DebugManager.production('用户登录成功');
      return result;
    } catch (error) {
      DebugManager.error('登录失败', error as Error);
      throw error;
    }
  }
}));
```

## 7. 总结

### 7.1 核心价值

1. **安全保障**: 通过环境隔离和自动脱敏保护敏感信息
2. **开发效率**: 统一的日志管理提升调试效率
3. **生产可靠**: 关键操作日志支持生产环境问题排查
4. **可维护性**: 结构化日志便于问题定位和分析

### 7.2 注意事项

- 生产环境必须设置`VITE_DEBUG_SENSITIVE=false`
- 敏感信息必须使用`logSensitive`方法
- 提供完整的上下文信息便于问题追踪
- 定期审查日志输出避免信息泄露

---

## 📚 相关文档

- [前端设计原则](./Frontend-Design-Principles.md)
- [环境变量配置说明](./环境变量配置说明.md)
- [开发指南](./开发指南.md)