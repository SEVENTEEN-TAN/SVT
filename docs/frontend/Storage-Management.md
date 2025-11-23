# 🗄️ 存储管理指南

基于实际代码分析的SVT前端存储管理、测试工具和问题排查指南。

## 📋 概述

SVT-Web 实现了一套完整的存储管理系统，包括加密存储、状态持久化、测试工具和问题排查机制。系统支持 Zustand 状态管理的持久化存储，并提供调试工具便于开发和维护。

## 🧪 存储测试工具

### 1. `testStorage()` - 基础存储测试

**功能**：测试 `createEncryptedStorage()` 的基本功能

**用法**：
```javascript
testStorage()
```

**测试内容**：
- ✅ 数据写入功能
- ✅ 数据读取功能  
- ✅ 数据类型验证
- ✅ localStorage 原始数据检查
- ✅ 数据清理功能

**示例输出**：
```
=== 开始测试存储功能 ===
1. 测试写入数据...
数据类型: string
数据内容: {"state":{"test":"Hello World","timestamp":1751597790512},"version":0}
✓ 写入成功
2. 测试读取数据...
✓ 读取成功: {"state":{"test":"Hello World","timestamp":1751597790512},"version":0}
✓ 解析成功: Object { state: {…}, version: 0 }
✓ 数据验证通过
3. 检查localStorage内容...
原始数据: {"state":{"test":"Hello World","timestamp":1751597790512},"version":0}
4. 清理测试数据...
✓ 清理完成
=== 测试完成 ===
```

### 2. `testZustandStorage()` - Zustand Store 测试

**功能**：测试 AuthStore 和 UserStore 的存储功能

**用法**：
```javascript
testZustandStorage()
```

**测试内容**：
- ✅ AuthStore 状态写入/读取
- ✅ UserStore 状态写入/读取
- ✅ 存储格式验证
- ✅ 数据完整性检查

### 3. `debugLocalStorage()` - 存储调试

**功能**：显示当前所有存储数据的详细信息

**用法**：
```javascript
debugLocalStorage()
```

**输出信息**：
```
🔍 LocalStorage Debug Report
======================
📊 存储统计:
- 总键数: 3
- 总大小: ~1.2KB

📝 详细内容:
┌─────────────────┬────────────────┬─────────────┐
│ 键名            │ 值类型         │ 大小        │
├─────────────────┼────────────────┼─────────────┤
│ auth-storage    │ object         │ 456B        │
│ user-storage    │ object         │ 623B        │
│ svt-tab-state   │ array          │ 234B        │
└─────────────────┴────────────────┴─────────────┘
```

### 4. `clearAllStorage()` - 清理所有存储

**功能**：清理所有 SVT 相关的存储数据

**用法**：
```javascript
clearAllStorage()
```

**清理内容**：
- Auth Store 数据
- User Store 数据 
- Tab 状态数据
- 其他 SVT 相关数据

## 🔧 问题排查指南

### 常见问题 1: 存储数据显示为 `[object Object]`

**症状**：
```javascript
localStorage.getItem('auth-storage') // 返回 "[object Object]"
localStorage.getItem('user-storage') // 返回 "[object Object]"
```

**原因**：
- Zustand persist 调用异步的 storage 方法导致的类型转换错误
- 数据没有被正确序列化为 JSON 字符串

**解决方案**：
```javascript
// 1. 清理损坏的数据
clearAllStorage()

// 2. 刷新页面重新初始化存储
location.reload()

// 3. 验证修复结果
testZustandStorage()
```

### 常见问题 2: 用户登录状态无法持久化

**症状**：
- 页面刷新后用户需要重新登录
- 控制台显示 "token not found" 错误

**排查步骤**：
```javascript
// 1. 检查存储内容
console.log('auth-storage:', localStorage.getItem('auth-storage'));

// 2. 检查加密配置
console.log('AES Key:', !!import.meta.env.VITE_AES_KEY);
console.log('AES Enabled:', import.meta.env.VITE_AES_ENABLED);

// 3. 测试存储功能
testStorage()
```

**可能原因**：
- 环境变量 `VITE_AES_KEY` 配置错误
- localStorage 被浏览器清理
- 隐私模式或浏览器限制

**解决方案**：
```javascript
// 1. 验证环境配置
if (!import.meta.env.VITE_AES_KEY) {
  console.error('❌ VITE_AES_KEY 未配置');
}

// 2. 重新设置存储
clearAllStorage();
location.reload();

// 3. 测试存储可用性
if (!localStorage) {
  console.error('❌ localStorage 不可用');
}
```

### 常见问题 3: Tab 状态无法恢复

**症状**：
- 页面刷新后 Tab 页面都消失
- 只显示默认首页 Tab

**排查步骤**：
```javascript
// 1. 检查 Tab 存储
console.log('Tab State:', localStorage.getItem('svt-tab-state'));
console.log('Active Tab:', localStorage.getItem('svt-active-tab'));

// 2. 检查数据格式
try {
  const tabs = JSON.parse(localStorage.getItem('svt-tab-state') || '[]');
  console.log('Tab Data Valid:', Array.isArray(tabs));
} catch (e) {
  console.error('❌ Tab 数据格式错误:', e);
}
```

**解决方案**：
```javascript
// 1. 清理损坏的 Tab 数据
localStorage.removeItem('svt-tab-state');
localStorage.removeItem('svt-active-tab');

// 2. 刷新页面重新初始化
location.reload();
```

### 常见问题 4: 存储大小限制

**症状**：
- 存储操作失败
- 控制台显示 "QuotaExceededError"

**排查步骤**：
```javascript
// 1. 检查存储使用情况
function getStorageSize() {
  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  return (total / 1024).toFixed(2) + ' KB';
}

console.log('存储使用量:', getStorageSize());

// 2. 检查 SVT 相关存储
debugLocalStorage()
```

**解决方案**：
```javascript
// 1. 清理不必要的数据
clearAllStorage();

// 2. 检查是否有大量冗余数据
// 优化存储的数据结构，只保存必要信息
```

## 🛠️ 开发调试技巧

### 1. 实时监控存储变化

```javascript
// 监听 localStorage 变化
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
  console.log(`🔄 localStorage.setItem: ${key}`, value);
  originalSetItem.apply(this, arguments);
};

const originalRemoveItem = localStorage.removeItem;
localStorage.removeItem = function(key) {
  console.log(`🗑️ localStorage.removeItem: ${key}`);
  originalRemoveItem.apply(this, arguments);
};
```

### 2. 存储数据导出/导入

```javascript
// 导出 SVT 相关存储数据
function exportSVTStorage() {
  const data = {};
  for (let key in localStorage) {
    if (key.startsWith('svt-') || key.includes('auth') || key.includes('user')) {
      data[key] = localStorage[key];
    }
  }
  return JSON.stringify(data, null, 2);
}

// 导入存储数据
function importSVTStorage(jsonData) {
  const data = JSON.parse(jsonData);
  for (let key in data) {
    localStorage.setItem(key, data[key]);
  }
  console.log('✅ 存储数据导入完成');
}
```

### 3. 性能监控

```javascript
// 监控存储操作性能
function measureStoragePerformance() {
  const start = performance.now();
  
  // 执行存储操作
  testZustandStorage();
  
  const end = performance.now();
  console.log(`⏱️ 存储操作耗时: ${(end - start).toFixed(2)}ms`);
}
```

## 📊 存储配置最佳实践

### 1. 环境变量配置

```bash
# .env.development
VITE_AES_KEY=your_32_character_aes_key_here_now
VITE_AES_ENABLED=true
VITE_DEBUG_MODE=true

# .env.production  
VITE_AES_KEY=production_32_char_secure_key_here
VITE_AES_ENABLED=true
VITE_DEBUG_MODE=false
```

### 2. 存储策略

```typescript
// 推荐的存储配置
const storageConfig = {
  // 认证数据：高安全性，短期存储
  auth: {
    encrypt: true,
    expire: '24h',
    keys: ['token', 'expiryDate']
  },
  
  // 用户数据：中等安全性，长期存储
  user: {
    encrypt: true,
    expire: '30d',
    keys: ['userInfo', 'permissions']
  },
  
  // Tab 状态：低安全性，会话存储
  tabs: {
    encrypt: false,
    expire: 'session',
    keys: ['tabs', 'activeTab']
  }
};
```

### 3. 错误处理

```typescript
// 健壮的存储操作
function safeStorageOperation(operation: () => void) {
  try {
    operation();
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.warn('⚠️ 存储空间不足，尝试清理');
      clearAllStorage();
    } else if (error.name === 'SecurityError') {
      console.warn('⚠️ 存储访问被拒绝（可能是隐私模式）');
    } else {
      console.error('❌ 存储操作失败:', error);
    }
  }
}
```

## 🔍 故障排查检查清单

### 基础检查
- [ ] 浏览器是否支持 localStorage
- [ ] 是否在隐私/无痕模式下
- [ ] 环境变量是否正确配置
- [ ] 控制台是否有错误信息

### 数据检查
- [ ] localStorage 中是否有相关数据
- [ ] 数据格式是否正确（非 `[object Object]`）
- [ ] 数据是否被正确序列化
- [ ] 版本兼容性是否正常

### 功能检查
- [ ] 登录状态是否持久化
- [ ] Tab 状态是否恢复
- [ ] 用户偏好是否保存
- [ ] 存储清理是否正常

### 性能检查
- [ ] 存储操作是否流畅
- [ ] 是否有内存泄漏
- [ ] 数据大小是否合理
- [ ] 清理机制是否有效

---

## 📚 相关文档

- [State-Management.md](./State-Management.md) - Zustand 状态管理详解
- [Component-Structure.md](./Component-Structure.md) - 组件架构设计
- [Tab-System-Design.md](./Tab-System-Design.md) - Tab 系统设计

---

## 🛡️ 安全说明

存储管理涉及用户敏感数据，请注意：
1. **加密保护**：敏感数据必须加密存储
2. **定期清理**：及时清理过期和无效数据  
3. **权限控制**：限制存储访问权限
4. **监控审计**：记录存储操作日志
5. **容量管理**：监控存储使用量，防止超限