# SVT 前端缓存机制详解

## 一、缓存概览

从你提供的实际缓存数据可以看出，系统中存在以下几类缓存：

### 1. 安全存储缓存（SecureStorage）
- `svt_secure_auth_token` - JWT认证令牌
- `svt_secure_user_data` - 用户详细信息

### 2. 普通 localStorage 缓存
- `svt-tab-state` - Tab页签状态
- `svt-active-tab` - 当前激活的Tab
- `auth-storage` - 旧版认证存储（应该被清理）

## 二、缓存数据分析

### 1. svt_secure_auth_token（未加密状态）
```json
{
  "encrypted": false,  // 表示未加密
  "data": "\"eyJhbGciOiJIUzI1NiJ9..._k\"",  // JWT token
  "timestamp": 1751592860788,
  "version": "1.0"
}
```
**作用**：存储JWT令牌，用于API请求认证

### 2. svt_secure_user_data（加密状态）
```json
{
  "encrypted": true,  // 表示已加密
  "data": "加密的Base64字符串",
  "iv": "eZv8RA7pcW6/LbNEd0PhNA==",
  "timestamp": 1751592862592,
  "version": "1.0"
}
```
**作用**：存储用户完整信息（包含用户基本信息、权限、菜单、机构角色等）

### 3. auth-storage（旧版缓存）
这是Zustand的旧版持久化存储，包含了token和用户信息的冗余数据，应该被清理。

## 三、为什么关闭加密后仍有这些缓存？

### 理解关键点：
1. **"关闭加密"不是"关闭缓存"**
   - 设置 `VITE_AES_ENABLED=false` 只是让数据以明文存储
   - 系统仍需要这些缓存来维持运行状态

2. **这些缓存是必需的**
   - 没有 `svt_secure_auth_token`，用户刷新页面就会丢失登录状态
   - 没有 `svt_secure_user_data`，系统无法知道用户权限和菜单

## 四、当前问题分析

从你的数据看，存在以下问题：

1. **加密状态不一致**
   - `svt_secure_auth_token` 是未加密的（encrypted: false）
   - `svt_secure_user_data` 是加密的（encrypted: true）
   - 这说明配置可能在中途被修改过

2. **存在冗余数据**
   - `auth-storage` 是旧版存储，应该被清理
   - 它包含了与 `svt_secure_*` 重复的数据

## 五、解决方案

### 1. 完全清理并重新登录
```javascript
// 在浏览器控制台执行
localStorage.clear();
location.reload();
```

### 2. 确保环境变量设置正确
```bash
# .env.development
VITE_AES_ENABLED=false  # 明确设置为false
# 或者注释掉 VITE_AES_KEY
# VITE_AES_KEY=xxx
```

### 3. 验证配置生效
登录后，在控制台检查：
```javascript
// 查看加密配置
cryptoConfig.isEnabled()  // 应该返回 false

// 查看存储的数据
localStorage.getItem('svt_secure_auth_token')
// 应该看到 encrypted: false
```

## 六、缓存生命周期

### 1. 登录时
```
用户输入凭据 → API验证 → 返回JWT
  ↓
存储到 svt_secure_auth_token
  ↓
获取用户详情 → 存储到 svt_secure_user_data
```

### 2. 页面刷新时
```
检查 svt_secure_auth_token 是否存在
  ↓ 存在
从缓存恢复登录状态
  ↓
从 svt_secure_user_data 恢复用户信息
```

### 3. 登出时
```
清理所有 svt_secure_* 缓存
  ↓
跳转到登录页
```

## 七、开发建议

### 1. 开发环境
- 设置 `VITE_AES_ENABLED=false` 方便调试
- 使用 Chrome DevTools 查看 Application → Local Storage

### 2. 生产环境
- 必须设置 `VITE_AES_ENABLED=true`
- 确保 `VITE_AES_KEY` 安全且不在代码库中

### 3. 调试技巧
```javascript
// 查看所有安全存储
Object.keys(localStorage)
  .filter(key => key.startsWith('svt_secure_'))
  .forEach(key => {
    console.log(key, JSON.parse(localStorage.getItem(key)));
  });
```

## 八、常见误区

1. **误区**：关闭加密就不应该有缓存
   **事实**：关闭加密只是改变存储格式，缓存仍然需要

2. **误区**：可以完全禁用这些缓存
   **事实**：这些是系统核心功能，禁用会导致无法正常使用

3. **误区**：缓存会自动清理
   **事实**：需要在登出或Token过期时主动清理

## 九、总结

- `svt_secure_*` 缓存是系统必需的，不能禁用
- "关闭加密"只影响数据存储格式，不影响是否存储
- 确保环境配置正确，避免加密状态不一致
- 定期清理旧版冗余缓存（如 `auth-storage`）