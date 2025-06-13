# localStorage缓存清理分析

## 当前localStorage使用情况

### ✅ 必要的缓存项

1. **auth-storage** (Zustand persist)
   - `token`: JWT令牌
   - `user`: 用户基本信息
   - `isAuthenticated`: 认证状态
   - `hasSelectedOrgRole`: 机构角色选择状态

2. **hasSelectedOrgRole** (单独存储)
   - 用于页面刷新时的状态检查

3. **userDetails** (完整用户信息)
   - 包含机构、角色、权限、菜单等详细信息

### ❌ 发现的问题

#### 1. 数据冗余问题
```javascript
// 问题：user.id 为 null
"user": {
  "id": null,  // 🚨 应该是 "admin"
  "username": "系统管理员",
  // ...
}

// userDetails 中有完整的 userId
"userDetails": {
  "userId": "admin",  // ✅ 正确的用户ID
  // ...
}
```

#### 2. 可能的冗余存储
- `user` 和 `userDetails` 存储了部分重复信息
- `hasSelectedOrgRole` 同时在 Zustand persist 和单独的 localStorage 中存储

#### 3. 未知缓存项
- `isWhitelist`: false - 可能是遗留数据，需要清理

### 🔧 优化方案

#### 方案1: 修复用户ID问题
```typescript
// authStore.ts - completeOrgRoleSelection 方法
const user: User = {
  id: parseInt(userDetails.userId, 10) || userDetails.userId, // 🔧 修复ID问题
  username: userDetails.userNameZh,
  // ...
};
```

#### 方案2: 简化缓存策略
```typescript
// 建议的localStorage结构：
{
  "auth-storage": {
    // Zustand persist自动管理的状态
    "token": "...",
    "user": {...},
    "isAuthenticated": true,
    "hasSelectedOrgRole": true
  },
  "userDetails": {...},  // 保留，业务需要完整信息
  // 移除重复的 hasSelectedOrgRole
}
```

#### 方案3: 清理遗留数据
```typescript
// 清理未知或过期的缓存项
const cleanupLegacyStorage = () => {
  localStorage.removeItem('isWhitelist');
  // 清理其他可能的遗留项
};
```

### 📋 修复清单

#### 🔴 立即修复
1. **修正user.id为null的问题**
2. **清理重复的hasSelectedOrgRole存储**
3. **移除未知的isWhitelist项**

#### 🟡 优化改进
1. **统一缓存管理策略**
2. **添加缓存版本控制**
3. **定期清理过期缓存** 