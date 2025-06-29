# DebugManager 调试管理器使用指南

**文档版本**: v1.0  
**创建时间**: 2025-06-29 09:02:03 +08:00  
**适用范围**: SVT-Web前端项目  
**文档类型**: 开发工具使用指南

## 📋 概述

DebugManager 是 SVT 前端项目的统一调试信息管理工具，提供分级的调试信息输出，确保开发环境的调试便利性和生产环境的安全性。

## 🎯 设计目标

### 核心原则
1. **安全第一**: 生产环境绝不泄露敏感信息
2. **开发友好**: 开发环境提供完整的调试信息
3. **结构化日志**: 统一的日志格式和上下文信息
4. **分级管理**: 根据信息敏感度分级处理
5. **易于使用**: 简单直观的API接口

## 🚀 快速开始

### 基本导入和使用

```typescript
import { DebugManager } from '@/utils/debugManager';

// 普通调试信息（开发环境可见）
DebugManager.log('组件渲染', { componentName: 'UserCard' });

// 敏感调试信息（需要特殊环境变量启用）
DebugManager.logSensitive('用户详情', userDetails);

// 错误信息（自动脱敏）
DebugManager.error('API调用失败', error);
```

### 环境变量配置

```env
# .env.development
VITE_DEBUG_SENSITIVE=true          # 启用敏感调试信息
VITE_PRODUCTION_LOGGING=false      # 生产环境日志（开发环境建议关闭）

# .env.production
VITE_DEBUG_SENSITIVE=false         # 生产环境禁用敏感调试
VITE_PRODUCTION_LOGGING=true       # 生产环境启用关键日志
```

## 📊 API 接口详解

### 1. 普通调试信息

```typescript
DebugManager.log(message: string, data?: any, context?: LogContext)
```

**使用场景**: 一般的调试信息，不包含敏感数据
**环境**: 仅开发环境显示
**示例**:
```typescript
DebugManager.log('组件挂载', { componentName: 'Header' }, { 
  component: 'Header', 
  action: 'mount' 
});
```

### 2. 敏感调试信息

```typescript
DebugManager.logSensitive(message: string, data?: any, context?: LogContext)
```

**使用场景**: 包含用户信息、认证详情等敏感数据
**环境**: 开发环境 + 特殊环境变量启用
**示例**:
```typescript
DebugManager.logSensitive('用户登录成功', userInfo, { 
  component: 'authStore', 
  action: 'login' 
});
```

### 3. 信息级别日志

```typescript
DebugManager.info(message: string, data?: any, context?: LogContext)
```

**使用场景**: 重要的系统信息，非敏感
**环境**: 开发环境显示详情，生产环境显示简化信息
**示例**:
```typescript
DebugManager.info('系统初始化完成', { version: '1.0.0' }, { 
  component: 'app', 
  action: 'init' 
});
```

### 4. 警告级别日志

```typescript
DebugManager.warn(message: string, data?: any, context?: LogContext)
```

**使用场景**: 需要注意的问题，但不影响功能
**环境**: 所有环境显示，生产环境不包含敏感数据
**示例**:
```typescript
DebugManager.warn('API响应缓慢', undefined, { 
  component: 'request', 
  action: 'timeout' 
});
```

### 5. 错误级别日志

```typescript
DebugManager.error(message: string, error?: Error, context?: LogContext)
```

**使用场景**: 系统错误和异常
**环境**: 所有环境显示，生产环境自动脱敏
**示例**:
```typescript
DebugManager.error('数据加载失败', error, { 
  component: 'dataService', 
  action: 'fetch' 
});
```

### 6. 生产环境日志

```typescript
DebugManager.production(message: string, context?: LogContext)
```

**使用场景**: 生产环境需要记录的关键操作
**环境**: 所有环境显示，不包含敏感数据
**示例**:
```typescript
DebugManager.production('用户登录', { 
  component: 'auth', 
  action: 'login' 
});
```

## 🔧 高级功能

### 1. 性能监控日志

```typescript
DebugManager.performance(message: string, duration?: number, context?: LogContext)
```

**示例**:
```typescript
const startTime = Date.now();
// ... 执行操作
const duration = Date.now() - startTime;
DebugManager.performance('数据处理完成', duration, { 
  component: 'dataProcessor', 
  action: 'process' 
});
```

### 2. 用户操作日志

```typescript
DebugManager.userAction(action: string, userId?: string, data?: any)
```

**示例**:
```typescript
DebugManager.userAction('点击按钮', userId, { buttonId: 'submit' });
```

### 3. API调用日志

```typescript
DebugManager.apiCall(method: string, url: string, duration?: number, status?: number)
```

**示例**:
```typescript
DebugManager.apiCall('POST', '/api/users', 150, 200);
```

### 4. 条件调试

```typescript
DebugManager.logIf(condition: boolean, message: string, data?: any, context?: LogContext)
```

**示例**:
```typescript
DebugManager.logIf(user.isAdmin, '管理员操作', { action: 'deleteUser' });
```

### 5. 分组调试

```typescript
DebugManager.group(label: string, callback: () => void)
```

**示例**:
```typescript
DebugManager.group('用户认证流程', () => {
  DebugManager.log('开始认证');
  DebugManager.log('验证Token');
  DebugManager.log('获取用户信息');
});
```

## 📝 LogContext 上下文信息

```typescript
interface LogContext {
  component?: string;    // 组件名称
  action?: string;       // 操作名称
  userId?: string;       // 用户ID（自动脱敏）
  timestamp?: number;    // 时间戳
}
```

**最佳实践**:
```typescript
const context = {
  component: 'UserProfile',
  action: 'updateAvatar',
  userId: user.id
};

DebugManager.logSensitive('头像更新成功', result, context);
```

## 🔒 安全特性

### 1. 自动脱敏

DebugManager 会自动对以下信息进行脱敏：
- Token 信息
- 密码字段
- 密钥信息
- API 路径中的敏感参数
- 用户ID（生产环境）

### 2. 环境隔离

```typescript
// 开发环境
DebugManager.logSensitive('用户详情', userDetails); // ✅ 显示完整信息

// 生产环境
DebugManager.logSensitive('用户详情', userDetails); // ❌ 不显示任何信息
```

### 3. 错误信息过滤

```typescript
// 开发环境
DebugManager.error('数据库连接失败', error); // ✅ 显示完整错误堆栈

// 生产环境  
DebugManager.error('数据库连接失败', error); // ✅ 显示用户友好的错误信息
```

## 📋 使用规范

### ✅ 推荐做法

```typescript
// 1. 使用结构化的上下文信息
DebugManager.log('操作完成', data, { 
  component: 'ComponentName', 
  action: 'actionName' 
});

// 2. 敏感信息使用 logSensitive
DebugManager.logSensitive('用户信息', userInfo);

// 3. 错误处理使用 error 方法
try {
  // 操作
} catch (error) {
  DebugManager.error('操作失败', error, { component: 'Component' });
}

// 4. 生产环境关键操作使用 production
DebugManager.production('用户登录成功');
```

### ❌ 禁止做法

```typescript
// 1. 禁止直接使用 console.log
console.log('用户信息:', userInfo); // ❌

// 2. 禁止在敏感信息中使用普通 log
DebugManager.log('用户密码', password); // ❌ 应该使用 logSensitive

// 3. 禁止在生产环境暴露内部错误
console.error('数据库连接字符串:', dbUrl); // ❌

// 4. 禁止硬编码敏感信息
DebugManager.log('API密钥: sk-1234567890'); // ❌
```

## 🔧 配置管理

### 获取当前配置

```typescript
const config = DebugManager.getConfig();
console.log('调试配置:', config);
// 输出:
// {
//   isDevelopment: true,
//   isSensitiveDebugEnabled: true,
//   isProductionLoggingEnabled: false,
//   environment: 'development'
// }
```

### 运行时检查

```typescript
// 检查是否为开发环境
if (DebugManager.getConfig().isDevelopment) {
  // 开发环境特殊逻辑
}

// 检查是否启用敏感调试
if (DebugManager.getConfig().isSensitiveDebugEnabled) {
  // 敏感调试逻辑
}
```

## 🚀 迁移指南

### 从 console.log 迁移

```typescript
// 旧代码
console.log('用户登录:', userInfo);
console.warn('API调用失败:', error);
console.error('系统错误:', error);

// 新代码
DebugManager.logSensitive('用户登录', userInfo, { component: 'auth' });
DebugManager.warn('API调用失败', error, { component: 'api' });
DebugManager.error('系统错误', error, { component: 'system' });
```

### 批量替换建议

1. **搜索替换模式**:
   - `console.log` → `DebugManager.log`
   - `console.warn` → `DebugManager.warn`
   - `console.error` → `DebugManager.error`

2. **手动检查敏感信息**:
   - 包含用户信息的日志改为 `logSensitive`
   - 包含认证信息的日志改为 `logSensitive`
   - 包含系统配置的日志改为 `logSensitive`

## 📊 最佳实践总结

1. **分级使用**: 根据信息敏感度选择合适的日志级别
2. **上下文完整**: 始终提供 component 和 action 信息
3. **安全优先**: 敏感信息必须使用 logSensitive
4. **生产考虑**: 重要操作使用 production 方法记录
5. **性能监控**: 关键操作使用 performance 方法
6. **错误处理**: 统一使用 error 方法处理异常

---

**文档维护**: 随功能更新持续维护  
**使用支持**: 开发团队技术支持  
**安全审核**: 定期进行安全审核和更新
