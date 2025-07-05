# SVT-Server 后端服务

基于 Spring Boot 3.3.2 + Java 21 + MyBatis-Flex 构建的企业级风险管理系统后端服务，采用分层模块化架构，提供完整的用户权限管理、API数据加密、SM4配置加密、数据库分布式锁、审计日志、分布式ID生成等核心功能。

## 🎯 技术特色

- **现代化技术栈**：Spring Boot 3.3.2 + Java 21 + MyBatis-Flex 1.10.9
- **企业级安全**：JWT智能续期 + AES-256加密 + SM4国密加密 + Argon2密码哈希 + 审计日志 + 敏感数据脱敏
- **高性能设计**：Redis分布式缓存 + Caffeine本地缓存 + 异步日志 + 连接池优化
- **分层架构**：通用层(common) + 框架层(frame) + 业务层(modules) + 职责清晰
- **开发友好**：自定义注解 + 统一响应 + 热重载 + API文档自动生成

## 🚀 核心技术栈

### 应用框架
- **Spring Boot 3.3.2** - 核心应用框架，支持Java 21新特性
- **Spring Security** - 安全框架，集成JWT认证和权限控制
- **Spring AOP** - 面向切面编程，实现审计、事务、权限切面
- **Spring Cache** - 缓存抽象层，统一多级缓存操作

### 持久层技术
- **MyBatis-Flex 1.10.9** - 现代化ORM框架，类型安全，性能优于传统MyBatis
- **Microsoft SQL Server** - 企业级关系数据库，支持ACID事务
- **Druid 1.2.24** - 阿里巴巴数据库连接池，支持监控和防SQL注入
- **SQL Server JDBC 12.8.1** - 微软官方数据库驱动

### 缓存与性能
- **Redis** - 分布式缓存，用于JWT令牌管理、用户会话
- **Caffeine 3.1.8** - 高性能本地缓存，提供L1缓存支持
- **Apache Commons Pool2** - 连接池管理，优化资源使用

### 安全与加密
- **JJWT 0.11.5** - JWT令牌生成、验证和智能续期
- **Spring Security Crypto + Argon2** - 密码哈希，比bcrypt更安全
- **BouncyCastle 1.69** - AES-256-CBC加密实现，API数据端到端加密
- **SM4国密算法** - 配置文件加密，保护敏感配置信息（替代Jasypt）

### 工具与辅助
- **Hutool 5.8.16** - Java工具类库，简化开发
- **Guava 32.1.3** - Google核心工具库
- **Knife4j 4.5.0** - API文档生成工具，基于OpenAPI 3.0
- **Log4j2 + Disruptor** - 高性能异步日志框架
- **Jackson** - JSON序列化/反序列化，支持Java 8时间API

## 📁 项目架构设计

### 分层架构模式
```
分层架构：应用层 → 业务层 → 框架层 → 通用层
           ↓        ↓       ↓       ↓
        Controller → Service → AOP → Utils/Config
```

### 目录结构详解

```
src/main/java/com/seventeen/svt/
├── RiskManagementApplication.java     # 主程序入口，启用各种配置
│
├── common/                            # 通用基础组件层
│   ├── annotation/                    # 自定义注解定义
│   │   ├── audit/                     # 审计日志注解
│   │   │   ├── Audit.java            # @Audit 操作审计记录
│   │   │   ├── SensitiveLog.java     # @SensitiveLog 敏感信息脱敏
│   │   │   └── SensitiveStrategy.java # 脱敏策略枚举
│   │   ├── dbkey/                     # 分布式ID注解
│   │   │   └── DistributedId.java    # @DistributedId 分布式ID生成
│   │   ├── field/                     # 字段自动填充注解
│   │   │   ├── AutoFill.java         # @AutoFill 字段自动填充
│   │   │   ├── FillType.java         # 填充类型（用户ID、时间、机构ID）
│   │   │   └── OperationType.java    # 操作类型（INSERT、UPDATE）
│   │   ├── permission/                # 权限控制注解
│   │   │   └── RequiresPermission.java # @RequiresPermission 权限验证
│   │   └── transaction/               # 事务管理注解
│   │       ├── AutoTransaction.java  # @AutoTransaction 智能事务管理
│   │       └── TransactionType.java  # 事务传播类型
│   ├── config/                        # 全局配置类
│   │   ├── AESConfig.java            # AES加密配置和密钥管理
│   │   ├── AsyncConfig.java          # 异步任务线程池配置
│   │   ├── DruidConfig.java          # 数据源和连接池配置
│   │   ├── SM4ConfigDecryptProcessor.java # SM4配置文件加密处理器
│   │   ├── MessageConfig.java        # 国际化消息配置
│   │   ├── RedisConfig.java          # Redis缓存和序列化配置
│   │   ├── RemoveDruidAdConfig.java  # 移除Druid广告页面
│   │   ├── SVTArgon2PasswordEncoder.java # Argon2密码编码器
│   │   ├── SecurityPathConfig.java   # 安全路径白名单配置
│   │   ├── SensitiveConfig.java      # 敏感数据脱敏配置
│   │   ├── WebMvcConfig.java         # Web MVC拦截器配置
│   │   └── transaction/              # 事务相关配置
│   │       ├── TransactionConfig.java        # 事务管理器配置
│   │       ├── TransactionMonitorConfig.java # 事务监控配置
│   │       └── TransactionPrefixConfig.java  # 事务方法前缀配置
│   ├── constant/                      # 系统常量定义
│   │   └── SystemConstant.java       # 系统级常量（缓存key、状态码等）
│   ├── exception/                     # 异常处理体系
│   │   ├── BusinessException.java    # 业务异常类
│   │   ├── GlobalExceptionHandler.java # 全局异常处理器
│   │   └── TypeConversionException.java # 类型转换异常
│   ├── filter/                        # 请求过滤器
│   │   ├── AESCryptoFilter.java      # AES数据加解密过滤器
│   │   └── RequestWrapperFilter.java # 请求体包装过滤器
│   ├── interceptor/                   # 请求拦截器
│   │   └── TraceIdInterceptor.java   # 链路追踪ID拦截器
│   ├── response/                      # 统一响应格式
│   │   ├── Result.java               # 统一响应结果封装类
│   │   └── ResultCode.java           # 响应状态码枚举
│   └── util/                          # 工具类库
│       ├── AESUtils.java             # AES加密解密工具
│       ├── SM4Utils.java             # SM4加密解密工具
│       ├── MessageUtils.java         # 国际化消息获取工具
│       ├── RedisUtils.java           # Redis操作封装工具
│       ├── RequestContextUtils.java  # 请求上下文信息工具
│       ├── RequestLogUtils.java      # 请求日志记录工具
│       ├── RequestWrapper.java       # HTTP请求包装器
│       ├── SensitiveUtil.java        # 敏感数据脱敏工具
│       ├── TraceIdUtils.java         # 链路追踪ID工具
│       ├── TransactionUtils.java     # 事务操作工具
│       └── TreeUtils.java            # 树形结构处理工具
│
├── frame/                             # 框架层（基础设施）
│   ├── aspect/                        # AOP切面实现
│   │   ├── AuditAspect.java          # 审计日志切面
│   │   ├── AutoTransactionAspect.java # 自动事务管理切面
│   │   ├── PermissionAspect.java     # 权限验证切面
│   │   └── TransactionMonitorAspect.java # 事务性能监控切面
│   ├── cache/                         # 缓存管理体系
│   │   ├── entity/                    # 缓存实体定义
│   │   │   ├── JwtCache.java         # JWT缓存实体
│   │   │   └── UserDetailCache.java  # 用户详情缓存实体
│   │   └── util/                      # 缓存工具类
│   │       ├── BaseCacheUtils.java   # 基础缓存操作工具
│   │       ├── CodeLibraryCacheUtils.java # 码值库缓存工具
│   │       ├── DbKeyCacheUtils.java  # 分布式ID配置缓存
│   │       ├── FieldCacheUtils.java  # 字段信息缓存工具
│   │       ├── JwtCacheUtils.java    # JWT状态缓存工具
│   │       ├── OrgInfoCacheUtils.java # 机构信息缓存工具
│   │       ├── UserDetailCacheUtils.java # 用户详情缓存工具
│   │       └── UserInfoCacheUtils.java # 用户基础信息缓存
│   ├── dbkey/                         # 分布式ID生成器
│   │   └── DistributedIdGenerator.java # 分布式ID生成实现
│   ├── handler/                       # MyBatis类型处理器
│   │   ├── BigDecimalTypeHandler.java # BigDecimal类型处理
│   │   ├── LocalDateTimeTypeHandler.java # 日期时间类型处理
│   │   ├── NumberTypeHandler.java    # 数字类型处理
│   │   └── StringToDateTimeTypeHandler.java # 字符串转日期处理
│   ├── listener/                      # 事件监听器
│   │   ├── FlexInsertListener.java   # MyBatis-Flex插入事件监听
│   │   ├── FlexUpdateListener.java   # MyBatis-Flex更新事件监听
│   │   └── SystemStartupListener.java # 系统启动事件监听
│   ├── lock/                          # 数据库分布式锁系统
│   │   ├── DatabaseDistributedLockManager.java # 分布式锁管理器
│   │   ├── config/
│   │   │   └── DistributedLockConfig.java # 分布式锁配置
│   │   ├── entity/
│   │   │   └── DistributedLock.java   # 分布式锁实体
│   │   └── mapper/
│   │       └── DistributedLockMapper.java # 分布式锁数据访问
│   ├── security/                      # 安全框架实现
│   │   ├── config/                    # 安全配置
│   │   │   ├── CustomAuthentication.java # 自定义认证实现
│   │   │   └── SecurityConfig.java   # Spring Security主配置
│   │   ├── constants/                 # 安全相关常量
│   │   │   └── SessionStatusHeader.java # 会话状态响应头常量
│   │   ├── controller/                # 认证API控制器
│   │   │   └── AuthController.java   # 登录/登出API
│   │   ├── dto/                       # 认证数据传输对象
│   │   │   ├── request/
│   │   │   │   └── LoginRequestDTO.java # 登录请求DTO
│   │   │   └── response/
│   │   │       └── TokenDTO.java     # JWT Token响应DTO
│   │   ├── filter/                    # 安全过滤器
│   │   │   └── JwtAuthenticationFilter.java # JWT认证过滤器
│   │   ├── service/                   # 认证业务服务
│   │   │   ├── AuthService.java      # 认证服务接口
│   │   │   └── impl/
│   │   │       └── AuthServiceImpl.java # 认证服务实现
│   │   └── utils/                     # 安全工具类
│   │       └── JwtUtils.java         # JWT生成、验证、续期工具
│   └── swagger/                       # API文档配置
│       └── SwaggerConfig.java        # Knife4j API文档配置
│
└── modules/                           # 业务模块层
    └── system/                        # 系统管理模块
        ├── controller/                # REST API控制器
        │   ├── MenuManagementController.java # 菜单管理API
        │   ├── RoleManagementController.java # 角色管理API
        │   ├── SystemAuthController.java # 系统认证API
        │   └── TestController.java   # 测试接口
        ├── dto/                       # 数据传输对象
        │   ├── request/               # 请求DTO
        │   │   ├── GetUserDetailsDTO.java # 获取用户详情请求
        │   │   ├── InsertOrUpdateMenuDTO.java # 菜单新增/编辑请求
        │   │   ├── InsertOrUpdateRoleDetailDTO.java # 角色详情请求
        │   │   ├── MenuConditionDTO.java # 菜单查询条件
        │   │   ├── RoleConditionDTO.java # 角色查询条件
        │   │   ├── UpdateMenuSortDTO.java # 菜单排序更新
        │   │   └── UpdateMenuStatusDTO.java # 菜单状态更新
        │   └── response/              # 响应DTO
        │       ├── AuditLogDTO.java   # 审计日志响应
        │       ├── MenuDetailDTO.java # 菜单详情响应
        │       ├── OrgDetailDTO.java  # 机构详情响应
        │       ├── PermissionDetailDTO.java # 权限详情响应
        │       ├── RoleDetailDTO.java # 角色详情响应
        │       └── UserDetailDTO.java # 用户详情响应
        ├── entity/                    # 数据库实体类
        │   ├── AuditLog.java         # 审计日志实体
        │   ├── CodeLibrary.java      # 码值库实体
        │   ├── DbKey.java            # 分布式ID配置实体
        │   ├── MenuInfo.java         # 菜单信息实体
        │   ├── OrgInfo.java          # 机构信息实体
        │   ├── PermissionInfo.java   # 权限信息实体
        │   ├── RoleInfo.java         # 角色信息实体
        │   ├── RoleMenu.java         # 角色菜单关联实体
        │   ├── RolePermission.java   # 角色权限关联实体
        │   ├── UserInfo.java         # 用户信息实体
        │   ├── UserOrg.java          # 用户机构关联实体
        │   └── UserRole.java         # 用户角色关联实体
        └── service/                   # 业务服务层
            ├── AuditLogService.java   # 审计日志服务接口
            ├── CodeLibraryService.java # 码值库服务接口
            ├── DbKeyService.java      # 分布式ID服务接口
            ├── MenuInfoService.java   # 菜单信息服务接口
            ├── OrgInfoService.java    # 机构信息服务接口
            ├── PermissionInfoService.java # 权限信息服务接口
            ├── RoleInfoService.java   # 角色信息服务接口
            ├── RoleMenuService.java   # 角色菜单关联服务接口
            ├── RolePermissionService.java # 角色权限关联服务接口
            ├── UserInfoService.java   # 用户信息服务接口
            ├── UserOrgService.java    # 用户机构关联服务接口
            ├── UserRoleService.java   # 用户角色关联服务接口
            └── impl/                  # 服务实现类
                ├── AuditLogServiceImpl.java # 审计日志服务实现
                ├── CodeLibraryServiceImpl.java # 码值库服务实现
                ├── DbKeyServiceImpl.java # 分布式ID服务实现
                ├── MenuInfoServiceImpl.java # 菜单信息服务实现
                ├── OrgInfoServiceImpl.java # 机构信息服务实现
                ├── PermissionInfoServiceImpl.java # 权限信息服务实现
                ├── RoleInfoServiceImpl.java # 角色信息服务实现
                ├── RoleMenuServiceImpl.java # 角色菜单服务实现
                ├── RolePermissionServiceImpl.java # 角色权限服务实现
                ├── UserInfoServiceImpl.java # 用户信息服务实现
                ├── UserOrgServiceImpl.java # 用户机构服务实现
                └── UserRoleServiceImpl.java # 用户角色服务实现
```

### 配置文件结构

```
src/main/resources/
├── application.yml              # 主配置文件（通用配置）
├── application-dev.yml          # 开发环境配置
├── application-uat.yml          # UAT环境配置
├── application-prod.yml         # 生产环境配置
├── config/
│   ├── log4j2-spring.xml       # Log4j2异步日志配置
│   └── messages.properties     # 国际化消息文件
└── db/init/
    ├── ddl.sql                 # 数据库表结构定义
    └── dml.sql                 # 基础数据初始化脚本
```

## 🏃‍♂️ 快速开始

### 环境要求

- **Java 21+** (推荐使用OpenJDK或Oracle JDK 21)
- **Maven 3.6+**
- **Microsoft SQL Server 2019+**
- **Redis 6.0+**

### 数据库准备

1. **创建数据库**
   ```sql
   CREATE DATABASE svt_db
   COLLATE Chinese_PRC_CI_AS;
   ```

2. **执行初始化脚本**
   ```bash
   # 1. 执行表结构创建脚本
   sqlcmd -S localhost -d svt_db -i src/main/resources/db/init/ddl.sql
   
   # 2. 执行基础数据初始化脚本
   sqlcmd -S localhost -d svt_db -i src/main/resources/db/init/dml.sql
   ```

### 环境变量配置

系统依赖以下环境变量，启动前必须设置：

```bash
# Windows 环境
set SM4_ENCRYPTION_KEY=your_sm4_encryption_key
set SVT_AES_KEY=your_32_character_aes_key_1234567890123456

# Linux/Mac 环境  
export SM4_ENCRYPTION_KEY=your_sm4_encryption_key
export SVT_AES_KEY=your_32_character_aes_key_1234567890123456

# 可选：开发环境关闭敏感信息脱敏
export SENSITIVE_ENABLED=false
```

**关键说明：**
- `SM4_ENCRYPTION_KEY`：SM4配置文件加密密钥，用于解密application.yml中的加密配置（替代Jasypt）
- `SVT_AES_KEY`：API数据加密密钥，必须是32位字符串，用于AES-256加密
- 注意：JASYPT_ENCRYPTOR_PASSWORD已废弃，请使用SM4_ENCRYPTION_KEY

### 应用配置

编辑开发环境配置 `src/main/resources/application-dev.yml`：

```yaml
# 数据库配置
spring:
  datasource:
    druid:
      url: jdbc:sqlserver://localhost:1433;databaseName=svt_db;encrypt=false
      username: your_username
      password: your_encrypted_password  # 使用SM4加密或环境变量
      driver-class-name: com.microsoft.sqlserver.jdbc.SQLServerDriver

# Redis配置
  data:
    redis:
      host: localhost
      port: 6379
      password: your_encrypted_redis_password  # 使用SM4加密或环境变量
      timeout: 5000ms
      lettuce:
        pool:
          max-active: 8
          max-idle: 8
          min-idle: 0

# JWT配置
jwt:
  secret: your_encrypted_jwt_secret  # 使用SM4加密或环境变量
  expiration: 86400  # 24小时，单位：秒
  issuer: svt-issuer

# AES加密配置
svt:
  security:
    aes:
      enabled: true  # 开发环境可设为false，生产环境建议true
      key: ${SVT_AES_KEY}  # 引用环境变量
    sensitive:
      enabled: ${SENSITIVE_ENABLED:true}  # 敏感数据脱敏开关
```

### 启动服务

```bash
# 1. 清理并编译
mvn clean compile

# 2. 开发环境启动
mvn spring-boot:run

# 3. 指定环境启动
mvn spring-boot:run -Dspring.profiles.active=dev

# 4. 打包后启动
mvn clean package -Dmaven.test.skip=true
java -jar target/SVT-Server-1.0.1-SNAPSHOT.jar
```

### 访问地址

服务启动成功后：
- **API接口基地址**：`http://localhost:8080/api`
- **API文档界面**：`http://localhost:8080/doc.html`
- **Druid监控面板**：`http://localhost:8080/druid`

## 🔧 核心功能模块

### 已实现功能 ✅

#### 1. 用户认证模块 (AuthController)

| API路径 | 方法 | 功能描述 | 技术特色 |
|---------|------|----------|----------|
| `/api/auth/login` | POST | 用户登录 | JWT智能续期、单点登录、Argon2密码验证 |
| `/api/auth/logout` | GET | 用户登出 | 清理缓存、Token黑名单管理 |

**核心特性**：
- **JWT智能续期机制**：基于用户活跃度自动续期，无感知用户体验
- **单点登录支持**：自动失效旧Token，确保账户安全
- **Argon2密码哈希**：比bcrypt更安全的密码存储算法
- **分布式Token管理**：Redis存储Token状态，支持集群部署

#### 2. 菜单管理模块 (MenuManagementController)

| API路径 | 方法 | 功能描述 | 技术亮点 |
|---------|------|----------|----------|
| `/api/system/menu/get-all-menu-tree` | POST | 获取菜单树 | 递归树形结构、权限过滤 |
| `/api/system/menu/update-menu-status` | POST | 更新菜单状态 | 级联状态更新、缓存同步 |
| `/api/system/menu/update-menu-sort` | POST | 更新菜单排序 | 拖拽排序支持、事务保证 |
| `/api/system/menu/insert-or-update-menu` | POST | 新增/编辑菜单 | 分布式ID生成、字段自动填充 |
| `/api/system/menu/get-menu-detail` | POST | 获取菜单详情 | 详细信息、关联数据查询 |
| `/api/system/menu/get-menu-role-list` | POST | 获取菜单关联角色 | 角色权限关系展示 |
| `/api/system/menu/delete-menu` | POST | 删除菜单 | 级联删除、完整性检查 |

**技术特色**：
- 递归算法处理无限级菜单树
- 基于权限的菜单过滤
- 支持图标、路由、组件的动态配置
- 菜单权限级联管理

#### 3. 角色管理模块 (RoleManagementController)

- 完整的角色CRUD操作接口
- 角色权限分配和管理
- 角色菜单关联维护
- 支持角色层次结构

#### 4. 系统认证模块 (SystemAuthController)

- 用户详情查询和验证
- 机构角色选择机制
- 用户状态实时检查
- 会话管理和验证

### 系统核心特性 🌟

#### 1. JWT智能续期机制

**配置示例**：
```yaml
jwt:
  expiration: 86400  # Token过期时间：24小时
  issuer: svt-issuer # Token签发者
```

**实现原理**：
- 基于用户活跃度检测自动续期
- 前端会话状态智能提醒
- 支持多种续期策略配置
- 时间对齐策略，确保安全性

#### 2. 分布式ID生成系统

**使用示例**：
```java
@DistributedId(prefix = "SVT")
@Column(value = "user_id", comment = "用户ID")
private String userId;  // 生成格式：SVT20250702A000001
```

**技术特点**：
- 基于Redis分布式锁确保全局唯一性
- 支持按日期重置和字母位扩展
- 可配置前缀、日期格式和补零位数
- 高性能批量生成机制

#### 3. AES-256数据加密

**加密策略**：
- API请求/响应数据端到端加密
- AES-256-CBC算法，工业级安全标准
- 动态IV生成，防重放攻击
- 环境变量控制加密开关

**配置示例**：
```java
@Component
public class AESCryptoFilter implements Filter {
    // 自动检测请求头 X-Encrypted 决定是否加密
    // 支持JSON数据的透明加解密
}
```

#### 4. 审计日志系统

**使用示例**：
```java
@Audit(module = "菜单管理", operation = "删除菜单")
@RequiresPermission("system:menu:delete")
public Result deleteMenu(@RequestParam String menuId) {
    // 自动记录操作日志，敏感数据自动脱敏
}
```

**技术特点**：
- AOP切面自动拦截记录
- 支持多种敏感数据脱敏策略
- 异步存储，不影响主业务性能
- 完整的操作链路追踪（TraceId）

#### 5. 敏感数据脱敏

**脱敏策略**：
```java
@SensitiveLog(strategy = SensitiveStrategy.PASSWORD)
private String password;  // 密码完全隐藏

@SensitiveLog(strategy = SensitiveStrategy.MOBILE)
private String phone;     // 手机号中间4位脱敏

@SensitiveLog(strategy = SensitiveStrategy.ID_CARD)
private String idCard;    // 身份证号中间脱敏
```

#### 6. 多级缓存架构

**缓存层次**：
```
L1: Caffeine本地缓存 (高频访问数据，毫秒级响应)
L2: Redis分布式缓存 (共享数据，支持集群)
L3: 数据库 (持久化存储)
```

**应用场景**：
- JWT令牌状态管理和黑名单
- 用户详情信息缓存
- 系统码值库数据缓存
- 分布式ID配置缓存
- 权限和菜单信息缓存

### 规划中功能 🚧

- **工作流引擎**：基于Flowable的业务流程管理
- **报表系统**：集成JasperReports或类似报表工具
- **文件管理服务**：文件上传、下载、预览、版本控制
- **消息通知中心**：站内信、邮件、短信通知
- **数据导入导出**：Excel、CSV等格式的批量处理
- **定时任务管理**：基于Quartz的任务调度
- **API限流防护**：基于Redis的分布式限流

## 📊 数据库设计

### 核心表结构

#### RBAC权限模型
```sql
-- 用户相关表
user_info: 用户基础信息（登录名、密码、状态、中英文名等）
user_role: 用户角色关联表（一个用户可有多个角色）
user_org: 用户机构关联表（一个用户可属于多个机构）

-- 角色权限表
role_info: 角色定义（角色名称、描述、状态等）
role_permission: 角色权限关联表（角色与权限的多对多关系）
role_menu: 角色菜单关联表（角色可访问的菜单）

-- 权限菜单表
permission_info: 权限定义（权限代码、名称、资源路径等）
menu_info: 菜单信息（菜单树结构、路由、图标、组件等）
```

#### 系统支撑表
```sql
-- 组织架构
org_info: 机构信息（支持4级：总部/分部/支部/组）

-- 系统配置
code_library: 码值库（数据字典，系统配置项）
db_key: 分布式ID生成配置（前缀、格式、计数器等）

-- 审计追踪
audit_log: 审计日志（操作记录、IP地址、敏感数据脱敏存储）
```

### 数据模型特点

1. **完整的RBAC权限模型**：用户-角色-权限三级管理，支持灵活权限分配
2. **层次化组织架构**：4级机构体系，支持权限继承和隔离
3. **动态菜单系统**：支持前端路由和组件的动态配置
4. **统一数据字典**：码值库管理系统所有配置项
5. **完善审计追踪**：全链路操作记录，满足合规要求

## 🔨 开发指南

### 新增业务模块

1. **创建模块结构**
   ```
   modules/
   └── yourmodule/              # 新业务模块
       ├── controller/          # REST API控制器
       ├── dto/                 # 数据传输对象
       │   ├── request/         # 请求DTO
       │   └── response/        # 响应DTO
       ├── entity/              # 实体类（数据库映射）
       ├── service/             # 业务接口
       └── service/impl/        # 业务实现
   ```

2. **实体类开发最佳实践**
   ```java
   @Table(value = "your_table", comment = "业务表",
          onInsert = FlexInsertListener.class, onUpdate = FlexUpdateListener.class)
   @Data
   @Builder
   @AllArgsConstructor
   @NoArgsConstructor
   public class YourEntity implements Serializable {
       
       @DistributedId(prefix = "YT")  // 自动生成分布式ID
       @Column(value = "id", comment = "主键ID")
       private String id;
       
       @AutoFill(type = FillType.USER_ID, operation = OperationType.INSERT)
       @Column(value = "create_by", comment = "创建人")
       private String createBy;
       
       @AutoFill(type = FillType.TIME, operation = OperationType.INSERT)
       @Column(value = "create_time", comment = "创建时间", 
               typeHandler = StringToDateTimeTypeHandler.class)
       private String createTime;
       
       @AutoFill(type = FillType.USER_ID, operation = OperationType.UPDATE)
       @Column(value = "update_by", comment = "更新人")
       private String updateBy;
       
       @AutoFill(type = FillType.TIME, operation = OperationType.UPDATE)
       @Column(value = "update_time", comment = "更新时间",
               typeHandler = StringToDateTimeTypeHandler.class)
       private String updateTime;
       
       @Column(value = "del_flag", comment = "删除标志", isLogicDelete = true)
       private String delFlag;
   }
   ```

3. **控制器开发规范**
   ```java
   @RestController
   @RequestMapping("/api/your-module")
   @Tag(name = "业务模块管理", description = "业务模块相关API接口")
   @Slf4j
   public class YourController {
       
       private final YourService yourService;
       
       @Autowired
       public YourController(YourService yourService) {
           this.yourService = yourService;
       }
       
       @PostMapping("/create")
       @Operation(summary = "创建记录", description = "创建新的业务记录")
       @ApiOperationSupport(order = 1)
       @Audit(module = "业务模块", operation = "创建记录")
       @RequiresPermission("your-module:create")
       public Result<String> create(@RequestBody @Valid YourCreateDTO dto) {
           String id = yourService.create(dto);
           return Result.success(MessageUtils.getMessage("create.success"), id);
       }
       
       @PostMapping("/update")
       @Operation(summary = "更新记录", description = "更新业务记录信息")
       @ApiOperationSupport(order = 2)
       @Audit(module = "业务模块", operation = "更新记录", recordParams = true)
       @RequiresPermission("your-module:update")
       public Result<?> update(@RequestBody @Valid YourUpdateDTO dto) {
           yourService.update(dto);
           return Result.success(MessageUtils.getMessage("update.success"));
       }
       
       @PostMapping("/delete")
       @Operation(summary = "删除记录", description = "逻辑删除业务记录")
       @ApiOperationSupport(order = 3)
       @Audit(module = "业务模块", operation = "删除记录")
       @RequiresPermission("your-module:delete")
       public Result<?> delete(@RequestParam String id) {
           yourService.delete(id);
           return Result.success(MessageUtils.getMessage("delete.success"));
       }
   }
   ```

### 自定义注解使用指南

#### 1. 分布式ID生成
```java
@DistributedId(prefix = "U")           // 生成：U20250702A000001
@DistributedId(prefix = "ORD", dateFormat = "yyyyMMdd")  // 自定义日期格式
@DistributedId(prefix = "TXN", paddingLength = 8)        // 8位补零
```

#### 2. 字段自动填充
```java
@AutoFill(type = FillType.USER_ID, operation = OperationType.INSERT)
private String createBy;    // 插入时自动填充当前用户ID

@AutoFill(type = FillType.TIME, operation = OperationType.INSERT_UPDATE)
private String updateTime;  // 插入和更新时都自动填充时间

@AutoFill(type = FillType.ORG_ID, operation = OperationType.INSERT)
private String orgId;       // 插入时自动填充当前用户机构ID
```

#### 3. 审计日志配置
```java
@Audit(module = "用户管理", operation = "添加用户", recordParams = true, sensitive = true)
public Result addUser(@RequestBody UserDTO user) {
    // recordParams=true: 记录请求参数
    // sensitive=true: 敏感数据自动脱敏
}

@Audit(module = "用户管理", operation = "删除用户", recordResult = true)
public Result deleteUser(@RequestParam String userId) {
    // recordResult=true: 记录响应结果
}
```

#### 4. 权限验证注解
```java
@RequiresPermission("user:view")     // 需要用户查看权限
@RequiresPermission("user:edit")     // 需要用户编辑权限
@RequiresPermission(value = {"user:view", "user:edit"}, logical = Logical.OR)
// 任一权限即可访问
```

#### 5. 事务管理注解
```java
@AutoTransaction(type = TransactionType.REQUIRED)
public void businessMethod() {
    // 自动事务管理，异常时自动回滚
}

@AutoTransaction(type = TransactionType.REQUIRES_NEW, timeout = 30)
public void independentTransaction() {
    // 独立事务，超时30秒
}
```

### 缓存使用指南

#### 1. 使用专用缓存工具类
```java
@Autowired
private UserDetailCacheUtils userDetailCache;

// 获取缓存
UserDetailCache user = userDetailCache.getUserDetail(userId);

// 设置缓存（3600秒过期）
userDetailCache.putUserDetail(userId, userDetail, 3600);

// 删除缓存
userDetailCache.removeUserDetail(userId);

// 批量获取
Map<String, UserDetailCache> users = userDetailCache.batchGet(userIds);
```

#### 2. 使用Spring Cache注解
```java
@Cacheable(value = "menu", key = "#userId")
public List<MenuDTO> getUserMenus(String userId) {
    // 方法结果自动缓存到Redis
    return menuService.getMenusByUserId(userId);
}

@CacheEvict(value = "menu", key = "#userId")
public void updateUserMenus(String userId, List<String> menuIds) {
    // 更新菜单时自动清除缓存
    menuService.updateUserMenus(userId, menuIds);
}

@CachePut(value = "user", key = "#user.id")
public UserDTO updateUser(UserDTO user) {
    // 更新数据库的同时更新缓存
    return userService.updateUser(user);
}
```

### API开发规范

#### 1. 统一响应格式
```java
// 成功响应
return Result.success(data);
return Result.success("操作成功", data);

// 失败响应
return Result.error("操作失败");
return Result.error(ResultCode.INVALID_PARAMS);
return Result.error(ResultCode.USER_NOT_FOUND, "用户不存在");

// 分页响应
PageResult<UserDTO> pageResult = PageResult.of(userList, total);
return Result.success(pageResult);
```

#### 2. 参数验证规范
```java
@PostMapping("/create")
public Result create(@RequestBody @Valid UserCreateDTO dto) {
    // @Valid自动触发参数验证
}

// DTO中的验证注解
public class UserCreateDTO {
    @NotBlank(message = "用户名不能为空")
    @Length(min = 3, max = 20, message = "用户名长度必须在3-20位之间")
    private String username;
    
    @Email(message = "邮箱格式不正确")
    private String email;
    
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String phone;
}
```

#### 3. 异常处理机制
```java
// 业务异常
throw new BusinessException("业务处理失败");
throw new BusinessException(ResultCode.USER_NOT_FOUND);

// 全局异常处理器会自动捕获并返回统一格式
// 无需在Controller中try-catch
```

## 📦 构建部署

### 本地开发构建

```bash
# 清理和编译
mvn clean compile

# 运行单元测试
mvn test

# 打包（跳过测试）
mvn clean package -Dmaven.test.skip=true

# 本地运行
java -jar target/SVT-Server-1.0.1-SNAPSHOT.jar
```

### 生产环境部署

#### 1. 应用构建打包
```bash
# 生产环境打包
mvn clean package -Dmaven.test.skip=true -Pprod

# 验证打包结果
ls -la target/SVT-Server-*.jar
```

#### 2. 环境变量设置
```bash
# 生产环境必须设置的环境变量
export SM4_ENCRYPTION_KEY=your_production_sm4_key
export SVT_AES_KEY=your_production_32_character_aes_key
export SPRING_PROFILES_ACTIVE=prod

# 可选的优化配置
export JAVA_OPTS="-Xms2g -Xmx4g -XX:+UseG1GC"
```

#### 3. JVM参数优化
```bash
java -Xms2g -Xmx4g \
     -XX:+UseG1GC \
     -XX:MaxGCPauseMillis=200 \
     -XX:+HeapDumpOnOutOfMemoryError \
     -XX:HeapDumpPath=/logs/heapdump/ \
     -XX:+UseCompressedOops \
     -XX:+UseCompressedClassPointers \
     -Dspring.profiles.active=prod \
     -Duser.timezone=Asia/Shanghai \
     -jar SVT-Server-1.0.1-SNAPSHOT.jar
```

#### 4. 系统服务配置 (systemd)
```bash
# 创建服务文件 /etc/systemd/system/svt-server.service
[Unit]
Description=SVT Risk Management Server
Documentation=https://github.com/your-org/svt-server
After=network.target mysql.service redis.service

[Service]
Type=simple
User=app
Group=app
WorkingDirectory=/app
Environment=SM4_ENCRYPTION_KEY=your_sm4_key
Environment=SVT_AES_KEY=your_aes_key
Environment=SPRING_PROFILES_ACTIVE=prod
ExecStart=/usr/bin/java -Xms2g -Xmx4g -XX:+UseG1GC -jar /app/SVT-Server-1.0.1-SNAPSHOT.jar
ExecReload=/bin/kill -HUP $MAINPID
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target

# 启用和启动服务
sudo systemctl daemon-reload
sudo systemctl enable svt-server
sudo systemctl start svt-server
sudo systemctl status svt-server
```

### 监控和运维

#### 1. 应用监控
- **JVM监控**：使用JConsole、JVisualVM或Arthas
- **数据库监控**：Druid内置监控面板 `/druid`
- **缓存监控**：Redis-cli或RedisInsight
- **应用指标**：集成Micrometer + Prometheus
- **日志监控**：ELK Stack或Loki + Grafana

#### 2. 健康检查配置
```bash
# API基础健康检查
curl http://localhost:8080/api/auth/health

# Spring Boot Actuator检查
curl http://localhost:8080/actuator/health

# 详细健康信息（需要配置）
curl http://localhost:8080/actuator/health/readiness
curl http://localhost:8080/actuator/health/liveness
```

#### 3. 性能调优建议
```yaml
# application-prod.yml性能优化配置
spring:
  datasource:
    druid:
      initial-size: 10
      min-idle: 10
      max-active: 50
      max-wait: 60000
      validation-query-timeout: 3
  data:
    redis:
      lettuce:
        pool:
          max-active: 16
          max-idle: 8
          min-idle: 2

mybatis-flex:
  configuration:
    cache-enabled: true
    lazy-loading-enabled: true
    default-fetch-size: 100
    default-statement-timeout: 30

# 日志异步配置优化
logging:
  level:
    com.seventeen.svt: INFO
    org.springframework.security: WARN
    com.alibaba.druid: WARN
```

## 🔍 故障排查

### 常见问题解决

#### 1. 启动失败问题

**数据库连接失败**
```bash
# 检查SQL Server服务状态
sqlcmd -S localhost -U username -P password -Q "SELECT @@VERSION"

# 检查网络连通性
telnet localhost 1433

# 验证SM4配置加密解密（需要相应工具）
# 检查SM4_ENCRYPTION_KEY环境变量设置
echo $SM4_ENCRYPTION_KEY
```

**Redis连接失败**
```bash
# 检查Redis服务状态
redis-cli ping

# 检查Redis配置和密码
redis-cli -h localhost -p 6379 -a password ping

# 查看Redis日志
tail -f /var/log/redis/redis-server.log
```

**环境变量未设置**
```bash
# 检查环境变量
echo $SM4_ENCRYPTION_KEY
echo $SVT_AES_KEY
echo $SPRING_PROFILES_ACTIVE

# Windows环境
echo %SM4_ENCRYPTION_KEY%
echo %SVT_AES_KEY%
```

#### 2. JWT认证问题

**Token过期处理**
```java
// 检查JWT配置
@Value("${jwt.expiration}")
private Long jwtExpiration;

// 验证系统时间同步
System.out.println("Current time: " + Instant.now());

// 查看JWT解码信息
String[] tokenParts = token.split("\\.");
String payload = new String(Base64.getDecoder().decode(tokenParts[1]));
```

**Token验证失败**
- 检查JWT密钥配置是否与签发时一致
- 验证Token格式：`Bearer <token>`
- 查看Token是否在黑名单中
- 确认请求头`Authorization`设置正确

#### 3. 加密通信问题

**AES加密失败**
```bash
# 验证AES密钥长度（必须32位）
echo -n "your_aes_key" | wc -c

# 检查前后端密钥一致性
curl -H "Content-Type: application/json" \
     -H "X-Encrypted: true" \
     -d '{"test":"data"}' \
     http://localhost:8080/api/test
```

**配置文件解密失败**
```bash
# 测试SM4解密（需要SM4工具）
# 检查SM4密钥配置
echo "SM4 Key: $SM4_ENCRYPTION_KEY"
# 验证配置文件是否正确解密
```

#### 4. 性能问题诊断

**数据库查询慢**
```bash
# Druid监控查看慢SQL
http://localhost:8080/druid/sql.html

# SQL Server执行计划分析
SET STATISTICS IO ON;
SET STATISTICS TIME ON;
-- 执行查询语句
```

**缓存命中率低**
```bash
# Redis缓存统计
redis-cli info stats | grep -E "keyspace|expired|evicted"

# 查看缓存键分布
redis-cli --scan --pattern "svt:*" | head -20

# Caffeine本地缓存统计（需要配置监控）
curl http://localhost:8080/actuator/metrics/cache.gets
```

### 日志分析指南

#### 1. 日志级别配置
```yaml
logging:
  level:
    root: INFO
    com.seventeen.svt: DEBUG    # 应用详细日志
    org.springframework.security: DEBUG  # 安全框架日志
    org.springframework.cache: DEBUG     # 缓存操作日志
    com.alibaba.druid.sql: DEBUG         # SQL执行日志
    redis.clients.jedis: DEBUG           # Redis操作日志
```

#### 2. 关键日志位置
- **应用日志**：`logs/svt-server.log`
- **错误日志**：`logs/error.log`
- **审计日志**：数据库`audit_log`表
- **SQL日志**：`logs/sql.log`
- **性能日志**：`logs/performance.log`

#### 3. 日志分析命令
```bash
# 查看错误日志
tail -f logs/error.log | grep -i "error\|exception"

# 分析JWT相关日志
grep -r "JWT\|Token" logs/ | tail -20

# 查看API调用统计
grep "POST\|GET" logs/svt-server.log | awk '{print $7}' | sort | uniq -c

# 监控内存使用
grep -i "memory\|heap" logs/svt-server.log | tail -10
```

## 🔒 安全最佳实践

### 生产环境安全检查清单

#### 1. 密钥和密码安全
- [ ] 更改所有默认密钥和密码
- [ ] 使用强密码策略（至少16位，包含大小写字母、数字、特殊字符）
- [ ] 定期轮换密钥（建议3-6个月一次）
- [ ] 密钥分权管理，避免单点风险
- [ ] 生产环境禁用默认账户

#### 2. 网络安全配置
- [ ] 启用HTTPS传输（TLS 1.2+）
- [ ] 配置安全响应头（CSP、HSTS等）
- [ ] 设置防火墙规则，仅开放必要端口
- [ ] 数据库和Redis使用内网访问
- [ ] 配置适当的CORS策略

#### 3. 应用安全设置
- [ ] 启用AES数据加密传输
- [ ] 配置合理的JWT过期时间
- [ ] 开启SQL注入防护（Druid Wall Filter）
- [ ] 设置API请求频率限制
- [ ] 启用敏感数据脱敏功能

#### 4. 监控和审计
- [ ] 开启完整的审计日志记录
- [ ] 配置安全事件告警机制
- [ ] 定期审查安全日志
- [ ] 建立入侵检测和响应机制
- [ ] 监控异常登录和API调用

#### 5. 依赖安全管理
- [ ] 定期扫描和更新依赖版本
- [ ] 使用安全扫描工具检查漏洞
- [ ] 移除不必要的依赖包
- [ ] 使用可信的依赖源

### 安全配置示例

```yaml
# 生产环境安全配置 application-prod.yml
server:
  # SSL/TLS配置
  ssl:
    enabled: true
    key-store: classpath:ssl/keystore.p12
    key-store-password: ${SSL_KEYSTORE_PASSWORD}
    key-store-type: PKCS12
    key-alias: svt-server
  # 安全响应头
  servlet:
    session:
      cookie:
        secure: true
        http-only: true
        same-site: strict

spring:
  security:
    headers:
      frame-options: DENY
      content-type: nosniff
      xss-protection: 1; mode=block
      cache-control: no-cache, no-store, must-revalidate
    require-ssl: true

# JWT安全配置
jwt:
  expiration: 3600  # 生产环境缩短为1小时
  issuer: svt-prod-issuer

# AES加密强制启用
svt:
  security:
    aes:
      enabled: true  # 生产环境强制启用
    sensitive:
      enabled: true  # 敏感数据脱敏启用

# Druid安全配置
spring:
  datasource:
    druid:
      filter:
        wall:
          enabled: true
          config:
            multi-statement-allow: false
            none-base-statement-allow: false
            call-allow: false
```

## 📖 相关文档

### 技术文档
- [API加密设计](./docs/API-Encryption-AES.md) - AES加密实现原理
- [Argon2密码哈希](./docs/Argon2-Password-Hashing.md) - 密码存储安全实践
- [审计日志系统](./docs/Audit-Logging.md) - 审计日志设计和使用
- [身份认证安全](./docs/Authentication-and-Security.md) - JWT和安全机制、安全设计原理
- [自动事务管理](./docs/Automated-Transaction-Management.md) - 事务处理机制
- [分布式ID生成](./docs/Distributed-ID-Generation.md) - ID生成算法设计
- [SM4配置加密](./docs/SM4-Configuration-Encryption.md) - SM4国密算法配置文件安全

### 架构文档

## 🤝 贡献指南

### 开发规范
- **代码风格**：遵循阿里巴巴Java开发手册
- **注释规范**：使用JavaDoc规范，重要方法必须添加注释
- **测试要求**：新增功能必须包含单元测试，覆盖率不低于80%
- **安全审查**：涉及安全功能的代码需要安全审查

### 提交规范
```bash
# 提交信息格式
feat: 添加用户管理API
fix: 修复JWT续期问题
docs: 更新API文档
style: 代码格式调整
refactor: 重构缓存工具类
test: 添加单元测试
chore: 更新依赖版本
```

## 🔄 最新更新记录

### v1.0.1-SNAPSHOT (2025年7月)
- **🔒 安全升级**：实施SM4国密算法替代Jasypt配置加密，提升配置安全性
- **🔧 架构重构**：实现数据库分布式锁系统，替代Redis分布式锁，提高系统可靠性
- **⚡ 性能优化**：优化JWT智能续期机制，基于用户活跃度动态调整过期时间
- **🎯 系统简化**：移除"记住我"功能，简化认证流程，统一Token管理策略
- **🛡️ 会话管理**：统一前后端会话常量，修复重复登录提示问题
- **🚀 智能重试**：数据库分布式锁支持智能重试机制和自动清理过期锁
- **📋 文档同步**：完善技术文档，确保与实际代码实现保持一致

### 技术亮点
- **SM4国密算法**：符合国产化要求，提供与国际标准等同的安全强度
- **数据库分布式锁**：基于数据库实现，减少对Redis的依赖，提高系统稳定性
- **智能续期机制**：根据用户活跃度自动调整Token过期时间，平衡安全性与用户体验
- **统一会话管理**：前后端常量保持一致，减少维护成本和错误率

---

**项目状态**：✅ 生产就绪  
**维护团队**：SVT开发团队  
**最后更新**：2025年7月  
**技术支持**：请提交Issue或联系开发团队