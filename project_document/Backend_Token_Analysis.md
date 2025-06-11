# Context
Project_ID: SVT-Management-System Task_FileName: Backend_Token_Analysis.md Created_At: 2025-06-11 14:41:46 +08:00
Creator: Sun Wukong (AI Assistant) Associated_Protocol: RIPER-5 v4.1

# Task Description
分析后端JWT Token刷新机制的设计和实现，为前端Token刷新功能提供技术基础。

# 1. Analysis (RESEARCH)

## 后端Token机制分析

### JWT配置参数
```yaml
jwt:
  secret: ocbc_les_risk_management_jwt_secret_key_2025  # JWT密钥
  expiration: 36000        # 访问令牌过期时间(秒) = 10小时
  issuer: ocbc-les-risk     # Token签发者
  refresh: 300             # Token刷新时间窗口(秒) = 5分钟
  threshold: 0.8           # 本地与Redis同步阈值
```

### Token生命周期管理

#### 1. Token生成 (`AuthServiceImpl.login()`)
- 生成JWT Token (有效期10小时)
- 创建JwtCache对象存储Token信息
- 双重缓存存储: Caffeine(本地) + Redis(分布式)

#### 2. Token验证 (`JwtAuthenticationFilter`)
- 每次请求都会验证Token
- 检查Token是否在黑名单
- 验证用户活跃度
- 检查IP变化
- **自动续期机制**: `jwtCacheUtils.renewJwt(loginId)`

#### 3. Token续期机制 (`JwtCacheUtils.renewJwt()`)
```java
public static void renewJwt(String userId) {
    long refreshTime = Long.parseLong(SpringUtil.getProperty("jwt.refresh"));
    JwtCache jwt = getJwt(userId);
    if (ObjectUtil.isNotEmpty(jwt)) {
        jwt.setRefreshTime(System.currentTimeMillis() + refreshTime * 1000);
        updateJwt(userId, jwt);
    }
}
```

**关键发现**: 
- ✅ **后端已实现自动续期**: 每次请求都会自动延长Token的活跃时间
- ✅ **无需前端主动刷新**: 只要用户在活跃使用，Token就会自动续期
- ✅ **活跃度检查**: 超过5分钟无活动会被认为不活跃

### Token失效机制

#### 1. 自动失效条件
- Token本身过期 (10小时)
- 用户超过5分钟无活动 (`checkActive()`)
- IP地址变化 (`checkIpChange()`)
- Token被加入黑名单

#### 2. 手动失效
- 用户主动登出 (`logout()`)
- Token加入黑名单

### 缓存策略分析

#### 双重缓存架构
1. **Caffeine本地缓存**
   - 最大容量: 80个用户
   - 过期时间: 5分钟
   - 用于快速访问

2. **Redis分布式缓存**
   - 过期时间: 10小时 (与JWT一致)
   - 用于跨实例共享
   - 支持集群部署

#### 同步策略
- 阈值控制: 当剩余时间 <= refresh * (1-threshold) 时同步到Redis
- 默认阈值0.8: 即剩余时间 <= 60秒时同步

## 前端Token刷新策略设计

### 当前问题分析
1. **前端缺少Token刷新逻辑**: 依赖后端自动续期
2. **用户体验问题**: Token过期时用户会突然被登出
3. **缺少过期预警**: 没有提前通知用户Token即将过期

### 推荐的前端实现方案

#### 方案1: 被动刷新 (推荐)
**原理**: 利用后端自动续期机制，前端只需处理401响应
```typescript
// 在axios响应拦截器中处理401
if (status === 401) {
  // Token已过期，清除本地状态并跳转登录
  authStore.logout();
  window.location.href = '/login';
}
```

**优点**:
- 实现简单
- 与后端设计一致
- 无需额外API调用

**缺点**:
- 用户体验稍差 (突然跳转)

#### 方案2: 主动刷新 (增强体验)
**原理**: 前端定时检查Token状态，提前处理过期
```typescript
// 定时检查Token状态
setInterval(() => {
  const token = localStorage.getItem('token');
  if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000;
    const now = Date.now();
    const remaining = exp - now;
    
    // 提前5分钟提醒用户
    if (remaining < 5 * 60 * 1000 && remaining > 0) {
      showTokenExpiryWarning();
    }
  }
}, 60000); // 每分钟检查一次
```

#### 方案3: 心跳保活 (最佳体验)
**原理**: 定期发送心跳请求保持Token活跃
```typescript
// 每4分钟发送一次心跳请求
setInterval(async () => {
  if (authStore.isAuthenticated) {
    try {
      await api.get('/auth/heartbeat'); // 任意需要认证的接口
    } catch (error) {
      // 心跳失败，可能Token已过期
      if (error.response?.status === 401) {
        authStore.logout();
      }
    }
  }
}, 4 * 60 * 1000);
```

### 建议实现策略

**结合方案1和方案3**:
1. 实现被动刷新处理401响应
2. 添加心跳保活机制
3. 可选择性添加过期预警

**DW Confirmation:** Analysis record is complete and compliant. 