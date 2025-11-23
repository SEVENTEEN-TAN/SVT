# 后端文档导航

> [首页](../../README.md) > 后端文档

SVT后端基于Spring Boot 3.5.7 + Java 21构建，采用三层架构设计（common/frame/modules），提供完整的企业级特性。

## 📚 文档列表

### 🔐 安全与认证

#### [认证与安全](Authentication-and-Security.md)
JWT认证机制和安全特性的完整说明，包括9步安全检查流程、智能续期机制等。

**关键特性**:
- JWT智能续期（基于用户活跃度）
- 9步安全检查流程
- Session Sticky支持
- 本地缓存优先策略

#### [API加密](API-Encryption-AES.md)
AES-256端到端加密机制，保护API请求和响应数据。

**关键特性**:
- AES-256-CBC加密模式
- 每次请求随机IV
- 自动加密/解密
- 前后端密钥同步

#### [密码哈希](Argon2-Password-Hashing.md)
使用Argon2算法进行密码存储，提供业界最安全的密码保护。

**关键特性**:
- Argon2id算法
- 内存成本64MB
- 迭代次数3次
- 16字节盐值

#### [配置加密](SM4-Configuration-Encryption.md)
使用SM4国密算法加密敏感配置信息。

**关键特性**:
- SM4国密算法
- 环境变量密钥管理
- 自动解密配置
- 替代Jasypt方案

### ⚙️ 核心功能

#### [审计日志](Audit-Logging.md)
完整的操作审计日志系统，记录所有关键操作。

**关键特性**:
- @Audit注解驱动
- 敏感数据自动脱敏
- 多种脱敏策略
- 异步日志记录

#### [事务管理](Automated-Transaction-Management.md)
自动化事务管理机制，简化事务处理。

**关键特性**:
- @AutoTransaction注解
- 多种事务类型
- AOP切面实现
- 自动回滚机制

#### [分布式ID](Distributed-ID-Generation.md)
分布式ID生成策略，支持高并发场景。

**关键特性**:
- 前缀+日期+序号格式
- 批量预分配（步长100）
- 日期自动重置
- 字母扩展支持

## 🔗 相关文档

### 架构文档
- [架构概述](../architecture/overview.md) - 系统整体架构
- [技术栈](../architecture/tech-stack.md) - 后端技术选型
- [编码规范](../architecture/coding-standards.md) - Java编码规范
- [源码结构](../architecture/source-tree.md) - 后端源码导航

### 前端文档
- [前端文档导航](../frontend/README.md) - 前端文档入口

## 📖 快速开始

1. **环境准备**: Java 21 + Maven 3.8+ + MySQL 8.4.0
2. **配置环境变量**: SM4_ENCRYPTION_KEY, SVT_AES_KEY
3. **数据库初始化**: 执行DDL和DML脚本
4. **启动应用**: `mvn spring-boot:run`

详见: [项目README](../../README.md#-快速开始)

## 🎯 核心特性

- **注解驱动开发**: @Audit, @RequiresPermission, @AutoTransaction, @DistributedId, @AutoFill
- **AOP横切关注点**: 审计、权限、事务、参数脱敏
- **三层缓存**: Redis分布式 + Caffeine本地 + 批量ID缓存
- **数据库分布式锁**: 基于主键唯一性，智能重试机制
- **完善的安全机制**: 多层加密、JWT智能续期、Argon2密码哈希

---

**文档版本**: 1.0.0  
**最后更新**: 2025-11-20  
**维护团队**: SVT开发团队

