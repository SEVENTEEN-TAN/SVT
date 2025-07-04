# 🔧 存储问题排查指南

## 🚨 常见问题与解决方案

### 1. 存储数据显示为 `[object Object]`

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

### 2. 用户登录状态无法持久化

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
- 存储数据格式损坏

### 3. 加密/解密失败

**症状**：
- 控制台出现 "AES解密失败" 错误
- 登录后数据无法正确读取

**排查步骤**：
```javascript
// 1. 检查密钥配置
const key = import.meta.env.VITE_AES_KEY;
console.log('Key length:', key ? key.length : 'undefined');
console.log('Key format:', key ? 'configured' : 'missing');

// 2. 测试加密功能
import { AESCryptoUtils } from '@/utils/crypto';
const iv = AESCryptoUtils.generateIV();
const encrypted = await AESCryptoUtils.encrypt('test', iv);
const decrypted = await AESCryptoUtils.decrypt(encrypted, iv);
console.log('Crypto test:', decrypted === 'test' ? 'PASS' : 'FAIL');
```

**解决方案**：
- 确保 `VITE_AES_KEY` 是 32 字节的 Base64 编码字符串
- 清理所有存储并重新初始化
- 检查 `.env.development` 文件配置

### 4. 数据迁移失败

**症状**：
- 旧格式数据无法自动迁移
- 存在多种格式的存储数据

**手动迁移步骤**：
```javascript
// 1. 检查迁移状态
console.log('Migration status:', localStorage.getItem('svt_storage_migrated_v2'));

// 2. 强制重新迁移
localStorage.removeItem('svt_storage_migrated_v2');
import { migrateFromSecureStorage } from '@/utils/encryptedStorage';
await migrateFromSecureStorage();

// 3. 清理旧数据
const oldKeys = [
  'svt_secure_auth_token',
  'svt_secure_user_data', 
  'svt_secure_session_data'
];
oldKeys.forEach(key => localStorage.removeItem(key));
```

## 🛠️ 调试工具

### 控制台命令

在浏览器控制台中可以使用以下命令：

```javascript
// 清理所有存储数据
clearAllStorage()

// 测试基础存储功能
testStorage()

// 测试 Zustand Store 存储
testZustandStorage()

// 查看当前存储状态
Object.keys(localStorage).filter(key => 
  key.includes('auth') || key.includes('user') || key.includes('svt')
)
```

### 开发模式调试

在开发环境中启用详细日志：

```javascript
// 在 .env.development 中添加
VITE_DEBUG_MODE=true
VITE_DEBUG_SENSITIVE=true
```

## 📋 检查清单

遇到存储问题时，按以下清单逐项检查：

- [ ] 浏览器控制台无 JavaScript 错误
- [ ] `VITE_AES_KEY` 环境变量正确配置
- [ ] localStorage 中没有 `[object Object]` 数据
- [ ] 存储数据可以正确解析为 JSON
- [ ] 加密/解密功能正常工作
- [ ] 数据迁移已完成
- [ ] 用户登录状态正确持久化

## 🔄 重置方案

如果问题无法解决，可以使用完全重置：

```javascript
// 1. 完全清理存储
clearAllStorage()

// 2. 清理浏览器缓存
// 开发者工具 -> Application -> Storage -> Clear storage

// 3. 重新启动开发服务器
// npm run dev

// 4. 重新登录测试
```

## 📞 技术支持

如果问题仍然存在，请提供以下信息：

1. 浏览器控制台的完整错误日志
2. localStorage 的当前内容
3. 环境变量配置（隐去敏感信息）
4. 复现问题的具体步骤

联系开发团队获取进一步支持。