# 🧪 存储测试工具使用说明

## 📋 概述

SVT-Web 提供了一套完整的存储测试工具，用于验证存储功能、排查问题和开发调试。这些工具可以在浏览器控制台中直接使用。

## 🛠️ 可用工具

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
- ✅ AuthStore Token 存储
- ✅ UserStore 用户数据存储
- ✅ 存储数据格式验证
- ✅ JSON 解析验证

**示例输出**：
```
=== 测试 Zustand Store 存储 ===
1. 测试 AuthStore...
AuthStore 当前状态: {token: null, isAuthenticated: false, ...}
2. 设置测试 Token...
3. 检查 auth-storage...
auth-storage 原始数据: {"state":{"token":"test-token-12345"},"version":0}
auth-storage 类型: string
✓ auth-storage 解析成功: {state: {token: "test-token-12345"}, version: 0}
...
=== Zustand Store 测试完成 ===
```

### 3. `clearAllStorage()` - 存储清理工具

**功能**：清理所有 SVT 相关的存储数据

**用法**：
```javascript
clearAllStorage()
```

**清理内容**：
- `auth-storage` - Zustand AuthStore 数据
- `user-storage` - Zustand UserStore 数据
- `svt_secure_auth_token` - 旧格式认证数据
- `svt_secure_user_data` - 旧格式用户数据
- `svt_secure_session_data` - 旧格式会话数据
- `expiryDate` - Token 过期时间
- 完整的 sessionStorage

**示例输出**：
```
=== 开始清理浏览器存储 ===
✓ 已清理: auth-storage
✓ 已清理: user-storage
✓ 已清理: svt_secure_auth_token
✓ 已清理 sessionStorage
=== 存储清理完成 ===
请刷新页面测试新的存储功能
```

## 🔍 调试场景

### 场景 1：登录状态丢失

**症状**：页面刷新后需要重新登录

**调试步骤**：
```javascript
// 1. 检查当前存储状态
console.log('auth-storage:', localStorage.getItem('auth-storage'));

// 2. 如果显示 [object Object]，清理并重置
if (localStorage.getItem('auth-storage') === '[object Object]') {
  clearAllStorage();
  location.reload();
}

// 3. 重新登录后测试存储
// 登录后执行：
testZustandStorage();
```

### 场景 2：加密功能异常

**症状**：控制台出现加密/解密错误

**调试步骤**：
```javascript
// 1. 检查环境配置
console.log('AES Key configured:', !!import.meta.env.VITE_AES_KEY);
console.log('AES Enabled:', import.meta.env.VITE_AES_ENABLED);

// 2. 测试基础加密功能
testStorage();

// 3. 如果失败，检查密钥格式
const key = import.meta.env.VITE_AES_KEY;
if (key) {
  console.log('Key length:', key.length);
  console.log('Expected length: 44 chars (32 bytes base64)');
}
```

### 场景 3：数据迁移问题

**症状**：存在多种格式的存储数据

**调试步骤**：
```javascript
// 1. 检查迁移状态
console.log('Migration completed:', localStorage.getItem('svt_storage_migrated_v2'));

// 2. 查看所有 SVT 相关存储
Object.keys(localStorage).filter(key => 
  key.includes('svt') || key.includes('auth') || key.includes('user')
);

// 3. 强制重新迁移（如果需要）
localStorage.removeItem('svt_storage_migrated_v2');
location.reload();
```

## 📊 调试信息解读

### 正常的存储数据格式

#### 明文模式 (AES 未启用)
```json
{
  "auth-storage": "{\"state\":{\"token\":\"eyJ...\",\"isAuthenticated\":true},\"version\":0}",
  "user-storage": "{\"state\":{\"user\":{...},\"session\":{...}},\"version\":0}"
}
```

#### 加密模式 (AES 已启用)
```json
{
  "auth-storage": "{\"encrypted\":true,\"data\":\"base64-encrypted-data\",\"iv\":\"random-iv\",\"timestamp\":1234567890}",
  "user-storage": "{\"encrypted\":true,\"data\":\"base64-encrypted-data\",\"iv\":\"random-iv\",\"timestamp\":1234567890}"
}
```

### 异常的存储数据格式

```json
{
  "auth-storage": "[object Object]",  // ❌ 异常：对象未正确序列化
  "user-storage": "[object Object]"   // ❌ 异常：对象未正确序列化
}
```

## ⚠️ 注意事项

1. **测试工具仅在开发环境使用**
   - 生产环境不会加载这些测试工具
   - 避免在生产环境暴露调试接口

2. **敏感数据处理**
   - 测试工具会记录调试日志
   - 生产环境的敏感数据不会在控制台显示

3. **清理操作不可逆**
   - `clearAllStorage()` 会删除所有存储数据
   - 执行前确保已保存重要数据

4. **环境变量依赖**
   - 加密功能依赖正确的 `VITE_AES_KEY` 配置
   - 测试前确保环境变量设置正确

## 🚨 紧急恢复

如果存储系统完全异常，使用以下紧急恢复步骤：

```javascript
// 1. 完全重置存储
clearAllStorage();

// 2. 清理浏览器缓存
// 开发者工具 -> Application -> Storage -> Clear storage

// 3. 重启开发服务器
// 终端执行: npm run dev

// 4. 重新登录并验证
// 登录后执行: testZustandStorage()
```

## 📞 技术支持

如果工具无法解决问题，请提供：

1. 完整的控制台输出
2. localStorage 的当前内容
3. 环境变量配置（隐去敏感信息）
4. 问题复现的详细步骤

联系开发团队获取支持。