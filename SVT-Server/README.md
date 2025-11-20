# SVT-Server 后端服务

基于 **Spring Boot 3.5.7 + Java 21 + MyBatis-Flex** 构建的企业级风险管理系统后端服务，采用分层模块化架构，提供完整的用户权限管理、API数据加密、SM4配置加密、数据库分布式锁、审计日志、分布式ID生成等核心功能。

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.7-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://openjdk.java.net/)
[![MyBatis-Flex](https://img.shields.io/badge/MyBatis--Flex-1.10.9-blue.svg)](https://mybatis-flex.com/)

---

## 📋 目录

- [技术特色](#-技术特色)
- [核心技术栈](#-核心技术栈)
- [项目架构](#-项目架构)
- [快速开始](#️-快速开始)
- [核心功能](#-核心功能)
- [开发指南](#-开发指南)
- [构建部署](#-构建部署)
- [架构文档](#-架构文档)

---

## 🎯 技术特色

- **现代化技术栈**: Spring Boot 3.5.7 + Java 21 + MyBatis-Flex 1.10.9
- **企业级安全**: JWT智能续期 + AES-256加密 + SM4国密加密 + Argon2密码哈希
- **高性能设计**: Caffeine本地缓存 + Session Sticky + 异步日志 + 连接池优化
- **分层架构**: 通用层(common) + 框架层(frame) + 业务层(modules)
- **注解驱动开发**: 自定义注解简化开发，统一响应格式
- **数据库分布式锁**: 基于主键唯一性，智能重试机制

---

## 🚀 核心技术栈

### 应用框架

| 技术 | 版本 | 说明 |
|------|------|------|
| **Spring Boot** | 3.5.7 | 核心应用框架，支持Java 21新特性 |
| **Spring Security** | 6.x | 安全框架，JWT认证和权限控制 |
| **Spring AOP** | 内置 | 面向切面编程，实现审计、事务、权限切面 |

### 持久层技术

| 技术 | 版本 | 说明 |
|------|------|------|
| **MyBatis-Flex** | 1.10.9 | 现代化ORM框架，类型安全 |
| **MySQL** | 8.4.0 | 开源关系数据库 |
| **Druid** | 1.2.24 | 数据库连接池 + SQL监控 |

### 缓存与性能

| 技术 | 版本 | 说明 |
|------|------|------|
| **Caffeine** | 3.1.8 | 高性能本地缓存（W-TinyLFU算法） |
| **Redis** | 可选 | 分布式缓存（当前使用Caffeine + Session Sticky） |

### 安全与加密

| 技术 | 版本 | 说明 |
|------|------|------|
| **JJWT** | 0.11.5 | JWT令牌生成、验证和智能续期 |
| **Argon2** | 内置 | 密码哈希，比bcrypt更安全 |
| **BouncyCastle** | 1.69 | AES-256-CBC加密 + SM4国密算法 |

### 工具与辅助

| 技术 | 版本 | 说明 |
|------|------|------|
| **Knife4j** | 4.5.0 | API文档生成（OpenAPI 3.0） |
| **Log4j2 + Disruptor** | 2.x + 3.4.4 | 高性能异步日志 |
| **Hutool + Guava** | 5.8.16 + 32.1.3 | Java工具类库 |

---

## 📁 项目架构

### 分层架构模式

```
应用层 → 业务层 → 框架层 → 通用层
   ↓        ↓       ↓       ↓
Controller → Service → AOP → Utils/Config
```

### 核心分层

```
src/main/java/com/seventeen/svt/
├── common/                    # 通用基础组件层
│   ├── annotation/            # 自定义注解（@Audit, @RequiresPermission, @DistributedId, @AutoFill）
│   ├── config/                # 全局配置（AES, SM4, Security, Transaction）
│   ├── filter/                # 请求过滤器（AES加密、请求包装）
│   └── util/                  # 工具类库
│
├── frame/                     # 框架基础设施层
│   ├── aspect/                # AOP切面（审计、权限、事务）
│   ├── cache/                 # 缓存管理（JWT、用户详情、分布式ID批量）
│   ├── security/              # 安全框架（JWT认证、9步验证）
│   ├── lock/                  # 数据库分布式锁系统
│   └── dbkey/                 # 分布式ID生成器
│
└── modules/                   # 业务模块层
    └── system/                # 系统管理模块
        ├── controller/        # REST API控制器
        ├── service/           # 业务逻辑层
        ├── entity/            # 实体类（数据库映射）
        ├── dto/               # 数据传输对象
        └── mapper/            # 数据访问层
```

**详细目录结构请参考**: [源码树文档](../docs/architecture/source-tree.md)

---

## 🏃‍♂️ 快速开始

### 环境要求

- **Java 21+** (推荐使用OpenJDK或Oracle JDK 21 LTS)
- **Maven 3.8+**
- **MySQL 8.4.0+**
- **Redis 6.0+** (可选，当前使用Caffeine本地缓存)

### 1. 数据库准备

```sql
-- 创建数据库 (MySQL)
CREATE DATABASE svt_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 执行表结构创建脚本
-- src/main/resources/db/init/ddl.sql

-- 执行基础数据初始化脚本
-- src/main/resources/db/init/dml.sql
```

### 2. 环境变量配置

**必需环境变量**:

```bash
# Windows
set SM4_ENCRYPTION_KEY=your_sm4_encryption_key_32_chars
set SVT_AES_KEY=your_32_char_aes_key_1234567890123456

# Linux/Mac
export SM4_ENCRYPTION_KEY=your_sm4_encryption_key_32_chars
export SVT_AES_KEY=your_32_char_aes_key_1234567890123456

# 可选：敏感数据脱敏开关
export SENSITIVE_ENABLED=true
```

⚠️ **重要说明**:
- `SM4_ENCRYPTION_KEY`: 用于配置文件加密（使用SM4国密算法）
- `SVT_AES_KEY`: 必须是32字符长度，用于API请求/响应加密
- 生产环境请使用强密码和随机密钥，建议定期轮换

### 3. 应用配置

编辑 `src/main/resources/application-dev.yml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/svt_db?useSSL=false&serverTimezone=Asia/Shanghai
    username: your_username
    password: SM4@encrypted(your_encrypted_password)  # 使用SM4加密

svt:
  jwt:
    secret: your_jwt_secret_key
    expiration: 1800000  # 30分钟
    activity-cycle-seconds: 600  # 活跃度周期10分钟
    activity-renewal-threshold: 20  # 续期阈值20%
```

### 4. 启动服务

```bash
# 编译项目
mvn clean install

# 开发环境启动
mvn spring-boot:run

# 指定环境启动
mvn spring-boot:run -Dspring-profiles-active=dev
```

**访问地址**:
- **API接口**: `http://localhost:8080/api`
- **API文档**: `http://localhost:8080/doc.html`
- **Druid监控**: `http://localhost:8080/druid`

---

## 🔧 核心功能

### 1. JWT智能续期机制

**9步安全检查流程**:
1. 验证Token格式和签名
2. 检查是否在黑名单中
3. 检查JWT缓存是否存在
4. 检查IP地址变化
5. 检查Token变化（单点登录）
6. 会话活跃度过期检查
7. 智能活跃度续期检查
8. 会话状态计算和响应头设置
9. 更新用户最后活动时间

**详见**: [`frame/security/filter/JwtAuthenticationFilter.java`](src/main/java/com/seventeen/svt/frame/security/filter/JwtAuthenticationFilter.java)

### 2. 分布式ID生成系统

**ID格式**: `前缀 + 日期 + 序号 + 字母扩展`

```java
@DistributedId(prefix = "U")
@Column(value = "user_id", comment = "用户ID")
private String userId;  // 生成: U20250617000001
```

**特点**:
- 批量预分配（步长100），减少数据库访问
- 支持日期重置（每天凌晨自动重置序号）
- 序号超999999后自动字母扩展（A-Z）

**详见**: [`frame/dbkey/DistributedIdGenerator.java`](src/main/java/com/seventeen/svt/frame/dbkey/DistributedIdGenerator.java)

### 3. 数据库分布式锁

**实现原理**: 利用数据库主键唯一性保证互斥

```sql
-- 获取锁：尝试插入，主键冲突=失败，成功=获得锁
INSERT INTO distributed_lock (lock_key, lock_value, expire_time)
VALUES ('user:create:admin', 'uuid-xxx', DATEADD(SECOND, 10, GETDATE()));
```

**智能重试机制**:
- 检测到锁被占用时自动重试
- 支持可配置的重试间隔和最大次数
- 达到最大重试次数后可强制释放锁（可配置）

**详见**: [`frame/lock/DatabaseDistributedLockManager.java`](src/main/java/com/seventeen/svt/frame/lock/DatabaseDistributedLockManager.java)

### 4. AES-256数据加密

**加密策略**:
- API请求/响应数据端到端加密
- AES-256-CBC算法，动态IV生成
- 检查请求头 `X-Encrypted: true` 决定是否加密
- 环境变量控制加密开关

**详见**: [`common/filter/AESCryptoFilter.java`](src/main/java/com/seventeen/svt/common/filter/AESCryptoFilter.java)

### 5. 审计日志系统

**使用示例**:

```java
@Audit(description = "创建用户", recordParams = true, sensitive = true)
@RequiresPermission("user:create")
@AutoTransaction(type = TransactionType.REQUIRED)
public Result<String> createUser(@RequestBody @Valid UserDTO dto) {
    // 自动记录操作日志，敏感数据自动脱敏
}
```

**技术特点**:
- AOP切面自动拦截记录
- 支持多种敏感数据脱敏策略
- 异步存储，不影响主业务性能
- 完整的操作链路追踪（TraceId）

### 6. 多级缓存架构

**缓存层次**:
```
L1: Caffeine本地缓存 (高频访问数据，毫秒级响应)
    ├─ JWT Token缓存（最多1000个，30分钟过期）
    ├─ 用户详情缓存（提升权限验证性能）
    └─ 分布式ID批量缓存（减少数据库访问）

L2: 数据库 (持久化存储)
```

**架构决策**: 使用Caffeine本地缓存 + Nginx Session Sticky，简化部署

---

## 🔨 开发指南

### 实体类开发

```java
@Table(value = "user_info", comment = "用户表",
       onInsert = FlexInsertListener.class,
       onUpdate = FlexUpdateListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserInfo implements Serializable {

    @DistributedId(prefix = "U")  // 自动生成分布式ID
    @Column(value = "user_id", comment = "用户ID")
    private String userId;

    @SensitiveLog(strategy = SensitiveStrategy.PASSWORD)  // 敏感数据脱敏
    @Column(value = "password", comment = "密码")
    private String password;

    @AutoFill(type = FillType.USER_ID, operation = INSERT)  // 自动填充创建者
    @Column(value = "create_by", comment = "创建者")
    private String createBy;

    @AutoFill(type = FillType.TIME, operation = INSERT)  // 自动填充创建时间
    @Column(value = "create_time", comment = "创建时间")
    private String createTime;

    @Column(value = "del_flag", comment = "删除标志", isLogicDelete = true)
    private String delFlag;
}
```

### Controller开发

```java
@Tag(name = "用户管理", description = "用户管理相关API")
@RestController
@RequestMapping("/system/user")
public class UserManagementController {

    private final UserInfoService userInfoService;

    public UserManagementController(UserInfoService userInfoService) {
        this.userInfoService = userInfoService;
    }

    @PostMapping("/create")
    @Operation(summary = "创建用户")
    @Audit(description = "创建用户", recordParams = true)      // 审计日志
    @RequiresPermission("user:create")                       // 权限验证
    @AutoTransaction(type = TransactionType.REQUIRED)        // 自动事务
    public Result<String> createUser(@RequestBody @Valid UserDTO dto) {
        String userId = userInfoService.createUser(dto);
        return Result.success("创建成功", userId);
    }
}
```

### 使用分布式锁

```java
@Service
public class UserInfoServiceImpl implements UserInfoService {

    private final DatabaseDistributedLockManager lockManager;

    @Override
    public String createUser(UserDTO userDTO) {
        String lockKey = "user:create:" + userDTO.getLoginId();
        String lockValue = lockManager.tryLock(lockKey, 5, 10, TimeUnit.SECONDS);

        try {
            // 业务逻辑
            UserInfo userInfo = convertToEntity(userDTO);
            userInfoMapper.insert(userInfo);
            return userInfo.getUserId();
        } finally {
            if (lockValue != null) {
                lockManager.unlock(lockKey, lockValue);
            }
        }
    }
}
```

**更多开发指南请参考**: [编码标准文档](../docs/architecture/coding-standards.md)

---

## 📦 构建部署

### 本地构建

```bash
# 清理和编译
mvn clean compile

# 打包（跳过测试）
mvn clean package -Dmaven.test.skip=true

# 本地运行
java -jar target/SVT-Server-1.0.1-SNAPSHOT.jar
```

### 生产环境部署

```bash
# 1. 环境变量设置
export SM4_ENCRYPTION_KEY=your_production_sm4_key
export SVT_AES_KEY=your_production_32_character_aes_key
export SPRING_PROFILES_ACTIVE=prod

# 2. JVM参数优化
java -Xms2g -Xmx4g \
     -XX:+UseG1GC \
     -XX:MaxGCPauseMillis=200 \
     -XX:+HeapDumpOnOutOfMemoryError \
     -XX:HeapDumpPath=/logs/heapdump/ \
     -Dspring.profiles.active=prod \
     -jar SVT-Server-1.0.1-SNAPSHOT.jar
```

### Docker部署

```dockerfile
FROM openjdk:21-jdk-slim

WORKDIR /app

COPY target/SVT-Server-1.0.1-SNAPSHOT.jar app.jar

ENV SM4_ENCRYPTION_KEY=""
ENV SVT_AES_KEY=""
ENV SPRING_PROFILES_ACTIVE="prod"

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
```

**详细部署指南请参考**: [主架构文档-第七章](../docs/architecture.md#七部署架构)

---

## 📖 架构文档

完整的架构文档帮助您深入理解系统设计和实现细节。

### 主要文档

| 文档 | 说明 | 链接 |
|------|------|------|
| **完整架构文档** | 11章节完整系统架构（1471行） | [architecture.md](../docs/architecture.md) |
| **技术栈文档** | 技术选型和版本说明（600行） | [tech-stack.md](../docs/architecture/tech-stack.md) |
| **编码标准文档** | Java编码规范（1104行） | [coding-standards.md](../docs/architecture/coding-standards.md) |
| **源码树文档** | 完整源码结构导航（719行） | [source-tree.md](../docs/architecture/source-tree.md) |

### 关键章节

**后端开发必读**:
- [第三章：后端架构](../docs/architecture.md#三后端架构-svt-server) - JWT九步验证、数据库分布式锁、分布式ID生成、AOP切面
- [第五章：安全架构](../docs/architecture.md#五安全架构) - 三层加密体系、JWT智能续期、Argon2密码哈希
- [第六章：数据架构](../docs/architecture.md#六数据架构) - 分布式ID设计、分布式锁设计、标准字段规范
- [第八章：性能优化](../docs/architecture.md#八性能优化) - 数据库优化、缓存优化、批量操作

---

## 🔄 更新日志

### v1.0.1-SNAPSHOT (2025-11-17)

#### 🔒 安全增强
- ✅ **SM4国密算法**: 实施SM4配置文件加密，替代Jasypt
- ✅ **JWT九步验证**: 完善JWT安全检查流程
- ✅ **Argon2密码哈希**: 配置参数（16字节盐，32字节哈希，64MB内存，3次迭代）

#### 🔧 架构优化
- ✅ **数据库分布式锁**: 基于主键唯一性实现，智能重试机制
- ✅ **分布式ID生成**: 前缀+日期+序号+字母扩展，批量预分配
- ✅ **本地缓存策略**: Caffeine替代Redis，配合Session Sticky

#### ⚡ 性能提升
- ✅ **批量ID生成**: 步长100，减少数据库访问
- ✅ **缓存优化**: JWT Token缓存（最多1000个，30分钟过期）
- ✅ **异步日志**: 基于Disruptor的高性能异步日志系统

#### 📋 文档更新
- ✅ 创建完整的Brownfield架构文档（记录实际系统状态）
- ✅ 详细的技术选型说明和架构决策记录
- ✅ 完善的编码规范和开发指南
- ✅ 清晰的源码导航和关键路径索引

---

## 🤝 贡献指南

### 开发规范
- **代码风格**: 遵循阿里巴巴Java开发手册
- **注释规范**: 使用JavaDoc规范，重要方法必须添加注释
- **测试要求**: 新增功能必须包含单元测试，覆盖率不低于80%

### 提交规范
```bash
feat: 添加用户管理API
fix: 修复JWT续期问题
docs: 更新API文档
refactor: 重构缓存工具类
test: 添加单元测试
```

---

## 📞 联系方式

- **问题反馈**: [GitHub Issues](../../issues)
- **技术支持**: 请提交Issue或联系开发团队

---

**项目状态**: ✅ 生产就绪
**最后更新**: 2025-11-17
**维护团队**: SVT后端开发团队
