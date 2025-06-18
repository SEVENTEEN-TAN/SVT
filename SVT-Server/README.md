# SVT 后端服务 (SVT-Server)

本文档是SVT后端服务的开发者指南，旨在帮助开发人员快速理解项目架构、功能、配置和开发规范。

## 1. 快速开始

### 1.1 环境要求
- JDK 17+
- Maven 3.6+
- Redis
- SQL Server (或其他兼容数据库)

### 1.2 配置
核心配置文件位于 `src/main/resources/application-dev.yml`。请确保以下配置正确：
- **数据库连接**: `spring.datasource.url`, `username`, `password`
- **Redis连接**: `spring.data.redis.host`, `port`
- **AES密钥**: `crypto.aes.key` (必须是32字节的Base64编码字符串)

### 1.3 启动
在项目根目录下执行以下命令：
```bash
mvn spring-boot:run
```
服务启动后，API文档将托管在 `http://localhost:8080/swagger-ui/index.html`。

## 2. 技术栈

| 类型       | 技术/库                                | 说明                                          |
| :--------- | :------------------------------------- | :-------------------------------------------- |
| **核心框架** | Spring Boot 3.x                        | 应用基础框架                                  |
| **安全框架** | Spring Security                        | 认证与授权                                    |
| **数据库**   | Mybatis-Flex                           | 高效的数据库ORM框架                           |
| **缓存**     | Redis                                  | 分布式缓存，用于会话管理和分布式锁            |
| **API文档**  | SpringDoc (Swagger UI)                 | 自动生成API文档                               |
| **密码学**   | Hutool / Bouncy Castle (推断)          | 提供AES、SM4等加密算法实现                   |

## 3. 核心特性与设计

后端服务采用了一系列自动化和安全增强的设计，以提高开发效率和系统健壮性。

### 3.1 自动化框架特性
- **[自动事务管理](./docs/Automated-Transaction-Management.md)**: 基于方法名约定自动管理事务，无需手动添加`@Transactional`。
- **[分布式ID生成](./docs/Distributed-ID-Generation.md)**: 通过`@DistributedId`注解为新实体自动生成全局唯一的、格式可定制的ID。
- **[自动化审计日志](./docs/Audit-Logging.md)**: 通过`@Audit`注解自动记录关键操作的日志，支持异步写入和敏感信息脱敏。

### 3.2 多层安全体系
- **[认证与授权](./docs/Authentication-and-Security.md)**: 基于JWT的无状态认证和基于`@RequiresPermission`的RBAC权限模型。
- **[API加密](./docs/API-Encryption-AES.md)**: 基于AES-256-CBC算法对请求和响应体进行端到端加密，对业务代码透明。
- **密码存储**: 使用国密**SM4**算法加密用户密码。

## 4. 详细文档索引

为了更深入地了解各项功能的实现细节，请查阅`docs`目录下的详细设计文档：
- **[认证、授权与安全体系](./docs/Authentication-and-Security.md)**
- **[API加密 (AES)](./docs/API-Encryption-AES.md)**
- **[分布式ID生成器](./docs/Distributed-ID-Generation.md)**
- **[审计日志](./docs/Audit-Logging.md)**
- **[自动化事务管理](./docs/Automated-Transaction-Management.md)**

## 5. 开发规范
- **Service层**: 遵循`get/save/update/delete`等方法名约定以利用自动事务。
- **DTO/VO**: 在Controller层与外部交互时，使用DTO（数据传输对象）和VO（视图对象）进行数据隔离。
- **异常处理**: 业务异常应抛出`BusinessException`，由`GlobalExceptionHandler`统一处理。
- **日志**: 使用`Slf4j`进行日志记录。 