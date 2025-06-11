# Context
Project_ID: SVT-Management-System Task_FileName: Token_Strategy_Correction.md Created_At: 2025-06-11 14:51:34 +08:00
Creator: Sun Wukong (AI Assistant) Associated_Protocol: RIPER-5 v4.1

# Task Description
基于用户反馈，重新分析后端Token机制，修正前端Token刷新策略，确保符合后端的安全设计意图。

# 1. Analysis (RESEARCH)

## 问题发现

### 用户反馈的关键问题
> "后端设置5分钟失效就是强制用户登录，你的保活会导致除非用户关闭页面5分钟失效?"

### 重新分析后端设计意图

#### 后端Token机制的真实逻辑
1. **JWT Token本身**: 有效期10小时 (`jwt.expiration: 36000`)
2. **活跃度检查**: 5分钟无活动强制登出 (`jwt.refresh: 300`)
3. **每次请求续期**: 重置5分钟活跃计时器

#### 关键代码分析
```java
// 活跃度检查 - 超过5分钟无活动就认为不活跃
public static boolean checkActive(String userId) {
    JwtCache jwt = getJwt(userId);
    if (ObjectUtil.isNotEmpty(jwt)) {
        Long refreshTime = jwt.getRefreshTime();
        return System.currentTimeMillis() > refreshTime; // 超过refreshTime就不活跃
    }
    return true;
}

// 续期机制 - 每次请求都重置5分钟计时器
public static void renewJwt(String userId) {
    long refreshTime = Long.parseLong(SpringUtil.getProperty("jwt.refresh")); // 300秒
    JwtCache jwt = getJwt(userId);
    if (ObjectUtil.isNotEmpty(jwt)) {
        jwt.setRefreshTime(System.currentTimeMillis() + refreshTime * 1000); // 重置为当前时间+5分钟
        updateJwt(userId, jwt);
    }
}
```

### 我的实现问题

#### ❌ 错误的心跳保活策略
- **4分钟心跳间隔**: 会在5分钟失效前自动发送请求
- **自动续期**: 每次心跳都会重置5分钟计时器
- **结果**: 用户永远不会因为不活跃而被登出

#### ❌ 违背安全设计
- **后端意图**: 强制用户5分钟无活动后重新认证
- **我的实现**: 绕过了这个安全机制
- **安全风险**: 用户离开电脑后，系统仍然保持登录状态

## 正确的Token策略

### ✅ 应该采用的策略

#### 1. **纯被动刷新策略**
- **不主动发送心跳**: 让后端的5分钟失效机制正常工作
- **只处理401响应**: 当Token真正过期时才处理
- **用户主动操作续期**: 只有用户真实操作才会延长Token

#### 2. **用户体验优化**
- **过期预警**: 提前1-2分钟提醒用户即将登出
- **优雅登出**: Token过期时友好提示
- **自动保存**: 提醒用户保存工作内容

#### 3. **安全性保障**
- **遵循后端设计**: 不绕过5分钟失效机制
- **真实活跃检测**: 只有用户真实操作才算活跃
- **强制重认证**: 确保安全性

### 修正后的实现方案

#### 移除心跳保活
```typescript
// ❌ 删除这个功能
// setInterval(() => {
//   // 发送心跳请求保持Token活跃
// }, 4 * 60 * 1000);
```

#### 保留过期检查和预警
```typescript
// ✅ 保留这个功能，但调整预警时间
setInterval(() => {
  // 检查Token状态，提前1-2分钟预警
  if (remainingTime < 2 * 60 * 1000) {
    showExpiryWarning();
  }
}, 30 * 1000); // 30秒检查一次
```

#### 优化401处理
```typescript
// ✅ 改进401响应处理
if (status === 401) {
  message.warning('您已超过5分钟未操作，请重新登录');
  authStore.logout();
  window.location.href = '/login';
}
```

**DW Confirmation:** Analysis record is complete and compliant. 