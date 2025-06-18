# SVT 后端服务 (SVT-Server)

本文档是SVT后端服务的开发者指南，旨在帮助开发人员快速理解项目架构、功能、配置和开发规范。

> **🔒 密码安全升级 (2025-06-18)**: 项目已完成密码安全升级，采用Argon2密码哈希和Jasypt配置文件加密，提供业界领先的安全保护。

## 1. 快速开始

### 1.1 环境要求
- **JDK 21** (推荐使用最新LTS版本)
- **Maven 3.6+**
- **Redis** (用于缓存和会话管理)
- **SQL Server** (或其他兼容数据库)
- **环境变量**: `JASYPT_ENCRYPTOR_PASSWORD` (配置文件加密密钥)

### 1.2 配置

**⚠️ 重要**: 启动前必须设置Jasypt加密密钥环境变量：

```bash
# Windows (PowerShell)
$env:JASYPT_ENCRYPTOR_PASSWORD="SVT_JASYPT_KEY_2025"

# Linux/macOS
export JASYPT_ENCRYPTOR_PASSWORD="SVT_JASYPT_KEY_2025"
```

核心配置文件位于 `src/main/resources/application-dev.yml`。主要配置项：
- **数据库连接**: `spring.datasource.url`, `username`, `password` (支持加密)
- **Redis连接**: `spring.data.redis.host`, `port`, `password` (支持加密)
- **AES密钥**: `crypto.aes.key` (必须是32字节的Base64编码字符串)

**配置文件加密**: 敏感信息可使用 `ENC(加密值)` 格式加密存储，详见 [Jasypt配置文件加密指南](./docs/Jasypt-Configuration-Encryption.md)。

### 1.3 启动

**开发环境启动**：
```bash
# 设置环境变量
export JASYPT_ENCRYPTOR_PASSWORD="SVT_JASYPT_KEY_2025"

# 启动应用
mvn spring-boot:run
```

**生产环境启动**：
```bash
# 设置生产环境密钥
export JASYPT_ENCRYPTOR_PASSWORD="your_production_key"

# 打包并启动
mvn clean package -DskipTests
java -jar target/SVT-Server-1.0.1-SNAPSHOT.jar
```

**验证启动**：
- API文档: `http://localhost:8080/swagger-ui/index.html`
- 健康检查: `http://localhost:8080/actuator/health`

### 1.4 密码安全测试

运行密码安全测试以验证Jasypt和Argon2功能：
```bash
# 运行密码安全升级测试
mvn test -Dtest=PasswordSecurityUpgradeTest
```

## 2. 技术栈

| 类型       | 技术/库                                | 版本 | 说明                                          |
| :--------- | :------------------------------------- | :--- | :-------------------------------------------- |
| **核心框架** | Spring Boot                            | 3.3.2 | 应用基础框架                                  |
| **安全框架** | Spring Security                        | 6.x | 认证与授权                                    |
| **密码安全** | **Argon2** (Spring Security Crypto)   | 6.x | 🔒 密码哈希 (2019年密码哈希竞赛获胜者)        |
| **配置加密** | **Jasypt**                             | 3.0.5 | 🔒 配置文件敏感信息加密                       |
| **数据库**   | Mybatis-Flex                           | 1.10.9 | 高效的数据库ORM框架                           |
| **缓存**     | Redis + Caffeine                       | - | 分布式缓存 + 本地缓存，用于会话管理和分布式锁  |
| **API文档**  | Knife4j (OpenAPI 3)                   | 4.5.0 | 自动生成API文档                               |
| **API加密**  | AES-256-CBC                            | - | 端到端API请求/响应加密                        |
| **工具库**   | Hutool + Guava + BouncyCastle          | - | 提供加密算法、工具类等实现                    |

## 3. 核心特性与设计

后端服务采用了一系列自动化和安全增强的设计，以提高开发效率和系统健壮性。

### 3.1 自动化框架特性
- **[自动事务管理](./docs/Automated-Transaction-Management.md)**: 基于方法名约定自动管理事务，无需手动添加`@Transactional`。
- **[分布式ID生成](./docs/Distributed-ID-Generation.md)**: 通过`@DistributedId`注解为新实体自动生成全局唯一的、格式可定制的ID。
- **[自动化审计日志](./docs/Audit-Logging.md)**: 通过`@Audit`注解自动记录关键操作的日志，支持异步写入和敏感信息脱敏。

### 3.2 多层安全体系 🔒

**密码安全 (2025-06-18 升级)**:
- **[Argon2密码哈希](./docs/Argon2-Password-Hashing.md)**: 采用2019年密码哈希竞赛获胜者Argon2id算法，提供业界领先的密码安全保护
- **[Jasypt配置文件加密](./docs/Jasypt-Configuration-Encryption.md)**: 使用PBEWITHHMACSHA512ANDAES_256算法加密配置文件中的敏感信息

**认证与授权**:
- **[JWT认证](./docs/Authentication-and-Security.md)**: 基于JWT的无状态认证，支持Token黑名单和会话管理
- **[RBAC权限模型](./docs/Authentication-and-Security.md)**: 基于`@RequiresPermission`注解的细粒度权限控制

**通信安全**:
- **[API加密](./docs/API-Encryption-AES.md)**: 基于AES-256-CBC算法对请求和响应体进行端到端加密，对业务代码透明

## 4. 详细文档索引

为了更深入地了解各项功能的实现细节，请查阅`docs`目录下的详细设计文档：

### 4.1 安全相关文档 🔒
- **[认证、授权与安全体系](./docs/Authentication-and-Security.md)** - JWT认证、RBAC权限、安全架构总览
- **[Argon2密码哈希详细指南](./docs/Argon2-Password-Hashing.md)** - 密码哈希算法、安全参数、最佳实践
- **[Jasypt配置文件加密指南](./docs/Jasypt-Configuration-Encryption.md)** - 配置加密、环境变量管理、部署配置
- **[API加密 (AES)](./docs/API-Encryption-AES.md)** - 端到端通信加密

### 4.2 自动化框架文档 ⚙️
- **[分布式ID生成器](./docs/Distributed-ID-Generation.md)** - 全局唯一ID自动生成
- **[审计日志](./docs/Audit-Logging.md)** - 操作日志自动记录和脱敏
- **[自动化事务管理](./docs/Automated-Transaction-Management.md)** - 基于方法名的事务自动管理

## 5. 开发规范

### 5.1 代码规范
- **Service层**: 遵循`get/save/update/delete`等方法名约定以利用自动事务
- **DTO/VO**: 在Controller层与外部交互时，使用DTO（数据传输对象）和VO（视图对象）进行数据隔离
- **异常处理**: 业务异常应抛出`BusinessException`，由`GlobalExceptionHandler`统一处理
- **日志**: 使用`Slf4j`进行日志记录，敏感信息需要脱敏处理

### 5.2 安全规范 🔒
- **密码处理**: 使用`PasswordEncoder`进行密码哈希，禁止明文存储
- **配置安全**: 敏感配置使用`ENC()`格式加密，通过环境变量管理密钥
- **权限控制**: 使用`@RequiresPermission`注解进行方法级权限控制
- **审计日志**: 关键操作使用`@Audit`注解自动记录审计日志

### 5.3 测试规范
- **单元测试**: Service层方法需要编写单元测试
- **安全测试**: 密码相关功能需要包含安全测试用例
- **集成测试**: 认证授权流程需要编写集成测试

## 6. Maven配置优化 (2025-06-18)

项目已完成Maven配置优化，实现版本统一管理：
- **版本属性分类**: 按功能模块分类管理依赖版本
- **统一版本管理**: 所有依赖版本使用变量配置
- **插件优化**: Maven编译插件和Spring Boot插件配置优化

详细配置参见 [pom.xml](./pom.xml) 文件。 