# SVT管理系统

## 项目介绍

基于Spring Boot 3的后端管理系统 : 系统采用分层架构设计,提供完整的用户认证、权限管理、审计日志等功能,支持高并发、高可用部署。

### 技术栈

- 后端框架: Spring Boot 3.3.2
- 安全框架: Spring Security + JWT 0.11.5
- 持久层框架: MyBatis-Plus 3.5.11
- 数据库: SQLServer 2022 (JDBC 12.8.1)
- 数据库连接池: Druid 1.2.24
- 缓存: Redis 6.0 + Caffeine 3.1.8(二级缓存)
- API文档: Knife4j 4.5.0
- 开发工具: 
  - Lombok
  - Spring Boot DevTools
  - Hutool 5.8.16
- 加密工具: BouncyCastle 1.69
- 工具库: Google Guava 32.1.3-jre
- 项目管理: Maven 3.8+

### 主要功能

- 用户认证与授权 [Token校验方案](./doc/Token校验方案.md)
  - JWT token认证
  - 基于角色的权限控制
  - 自定义SM4密码加密
- 权限管理 [用户访问权限](./doc/用户访问权限.md)
  - 用户管理
  - 角色管理
  - 菜单管理
  - 权限分配
- 自动事务 [自动事务管理](./doc/自动事务管理.md)
  - 全局事务管理
  - 事务传播机制
- 系统管理
  - 用户管理
  - 角色管理
  - 菜单管理
  - 系统配置
- 审计日志
  - 注解驱动审计
  - 敏感信息脱敏
  - 异步处理机制
  - 自动填充功能
- 系统监控
  - 性能监控
  - 操作日志
  - 登录日志
- 分布式ID [分布式ID](./doc/分布式ID.md)
  - 自定义ID生成器
  - 分布式序列号

## 开发进度

### 已完成功能
- [x] 项目基础框架搭建
- [x] 用户认证与授权模块
   - JWT token认证
   - 基于角色的权限控制
   - 自定义密码加密(SM4)
- [x] 系统管理模块
   - 用户管理
   - 角色管理
   - 菜单管理
- [x] 基础功能
   - 统一响应处理
   - 全局异常处理
   - 操作日志记录
   - 接口文档生成
- [x] 缓存优化
  - Caffeine本地缓存
  - Redis分布式缓存
  - 多级缓存架构
- [x] 框架优化
    - 暴露全局自动事务
- [x] Mybatis Plus 拓展
    - 类型转换器
    - 自定义ID注入(分布式ID的实现)
- [x] 接口权限
    - 根据客户权限配置表,控制用户对接口的访问权限
- [x] 缓存管理
    - 用户详情的缓存添加(菜单/角色)
- [x] API补充
    - 根据当前登录用户获取可选择的角色
    - 获取用户选择的角色,更新缓存中的使用角色
    - 根据角色获取用户可见菜单
- [x] 审计日志基础功能
    - 注解驱动审计日志
    - 敏感信息自动脱敏
    - 异步处理机制
    - 自动填充功能
    - 异常信息记录

### 进行中功能
- [ ] 接口级审计日志
    - 操作日志记录完善
    - 登录日志记录
    - 审计追踪
    - 审计日志查询API
    - 统计分析功能
- [ ] 认证完善
    - OAuth2的部分设计(对接其他系统)

### 待开发功能
- [x] 缓存管理
    - 多资源缓存同步通知(清空/同步)
    - 码值表的缓存添加
- [ ] API补充
    - 用户管理CRUD / 密码重置与修改  / 用户禁用与启用
    - 菜单管理CRUD / 禁用启用
    - 角色管理CRUD / 禁用启用
    - 权限管理CRUD / 禁用启用
- [ ] 审计日志优化
    - 日志分片存储
    - 日志清理策略
    - 监控告警机制
    - 运维工具开发
- [ ] 模板化配置
    - 前端页面展示模板配置
    - 查询组件的模板化

### 已知问题
1. 密码加密问题
   - 问题: 默认密码加密方式与系统要求不匹配
   - 解决方案: 实现自定义PasswordEncoder支持SM4加密

2. 权限控制问题
   - 问题: 部分接口权限控制不完善
   - 解决方案: 完善Spring Security配置,细化权限控制

3. 缓存问题
   - 问题: 缓存策略需要优化
   - 解决方案: 实现多级缓存架构,优化缓存策略

4. 审计日志问题
   - 问题: 大量并发操作时可能存在日志丢失
   - 解决方案: 优化异步处理机制,增加重试机制
   - 问题: 敏感信息脱敏规则需要动态配置
   - 解决方案: 实现脱敏规则动态配置功能
   - 问题: 日志数据量增长过快
   - 解决方案: 实现日志分片存储和定期清理机制

## 设计文档

- [系统架构设计](docs/architecture.md)
- [数据库设计](docs/database.md)
- [接口设计](docs/api.md)
- [安全设计](docs/security.md)
- [性能设计](docs/performance.md)

## 环境要求

- JDK: 17+
- Maven: 3.8+
- SQLServer: 2022
- Redis: 6.0+
- IDE: IntelliJ IDEA 2023+

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/your-username/risk-management.git
cd risk-management
```

### 2. 配置数据库

1. 创建数据库
```sql
CREATE DATABASE risk_management;
```

2. 修改数据库配置
```yaml
spring:
  datasource:
    url: jdbc:sqlserver://localhost:1433;databaseName=risk_management
    username: your-username
    password: your-password
```

### 3. 配置Redis

修改Redis配置
```yaml
spring:
  redis:
    host: localhost
    port: 6379
    password: your-password
```

### 4. 启动项目

```bash
mvn spring-boot:run
```

访问地址: http://localhost:8080

## 项目结构

```
risk-management/
├── src/ # 源代码目录
│ ├── main/ # 主代码目录
│ │ ├── java/ # Java源代码
│ │ │ └── com/ocbc/les/ # 基础包路径
│ │ │ ├── common/ # 公共组件层
│ │ │ │ ├── annotation/ # 自定义注解
│ │ │ │ │ ├── audit/ # 审计日志注解
│ │ │ │ │ │ ├── Audit.java # 审计日志注解
│ │ │ │ │ │ └── SensitiveLog.java # 敏感信息注解
│ │ │ │ │ ├── field/ # 自动填充注解
│ │ │ │ │ │ └── AutoFill.java # 自动填充注解
│ │ │ │ │ ├── id/ # 自定义主键注解
│ │ │ │ │ │ └── AutoId.java # 分布式ID注解
│ │ │ │ │ └── permission/ # 权限注解
│ │ │ │ │     ├── RequiresPermission.java # 权限校验注解
│ │ │ │ │     └── RequiresRole.java # 角色校验注解
│ │ │ │ ├── config/ # 全局配置
│ │ │ │ │ ├── MybatisPlusConfig.java # MyBatis-Plus配置
│ │ │ │ │ ├── MessageConfig.java # 消息配置
│ │ │ │ │ ├── SecurityPathConfig.java # 安全路径配置
│ │ │ │ │ ├── WebMvcConfig.java # Web MVC配置
│ │ │ │ │ ├── RedisConfig.java # Redis配置
│ │ │ │ │ ├── Sm4PasswordEncoder.java # SM4密码编码器
│ │ │ │ │ ├── AsyncConfig.java # 异步处理配置
│ │ │ │ │ ├── SecurityConfig.java # 安全配置
│ │ │ │ │ └── RemoveDruidAdConfig.java # Druid广告移除配置
│ │ │ │ ├── constant/ # 常量定义
│ │ │ │ │ ├── AuditConstants.java # 审计日志常量
│ │ │ │ │ └── SecurityConstants.java # 安全相关常量
│ │ │ │ ├── exception/ # 异常处理
│ │ │ │ │ └── SecurityException.java # 安全相关异常
│ │ │ │ ├── filter/ # 过滤器
│ │ │ │ │ └── JwtAuthenticationFilter.java # JWT认证过滤器
│ │ │ │ ├── interceptor/ # 拦截器
│ │ │ │ │ └── PermissionInterceptor.java # 权限拦截器
│ │ │ │ ├── response/ # 统一响应
│ │ │ │ └── util/ # 工具类
│ │ │ │     ├── SensitiveUtil.java # 敏感信息处理工具
│ │ │ │     ├── RequestContextUtils.java # 请求上下文工具
│ │ │ │     └── SecurityUtils.java # 安全工具类
│ │ │ ├── frame/ # 框架功能层
│ │ │ │ ├── cache/ # 缓存框架
│ │ │ │ │ ├── entity/ # 缓存实体
│ │ │ │ │ └── util/ # 缓存工具
│ │ │ │ ├── handler/ # 处理器
│ │ │ │ │ ├── changetype/ # 类型转换
│ │ │ │ │ └── AutoFillHandler.java # 自动填充处理器
│ │ │ │ ├── security/ # 安全框架
│ │ │ │ │ ├── config/ # 安全配置
│ │ │ │ │ │ ├── WebSecurityConfig.java # Web安全配置
│ │ │ │ │ │ └── JwtConfig.java # JWT配置
│ │ │ │ │ ├── controller/ # 安全控制器
│ │ │ │ │ │ └── AuthController.java # 认证控制器
│ │ │ │ │ ├── dto/ # 数据传输对象
│ │ │ │ │ │ ├── LoginDTO.java # 登录请求对象
│ │ │ │ │ │ └── TokenDTO.java # Token响应对象
│ │ │ │ │ ├── filter/ # 安全过滤器
│ │ │ │ │ │ └── JwtAuthenticationFilter.java # JWT认证过滤器
│ │ │ │ │ ├── service/ # 安全服务
│ │ │ │ │ │ ├── UserDetailsServiceImpl.java # 用户详情服务
│ │ │ │ │ │ └── TokenService.java # Token服务
│ │ │ │ │ ├── utils/ # 安全工具
│ │ │ │ │ │ ├── JwtUtils.java # JWT工具类
│ │ │ │ │ │ └── SecurityUtils.java # 安全工具类
│ │ │ │ │ └── vo/ # 视图对象
│ │ │ │ │     └── LoginVO.java # 登录响应对象
│ │ │ │ ├── swagger/ # API文档
│ │ │ │ └── aspect/ # 切面处理
│ │ │ │     ├── AuditAspect.java # 审计日志切面
│ │ │ │     └── PermissionAspect.java # 权限校验切面
│ │ │ ├── modules/ # 业务模块层
│ │ │ │ ├── system/ # 系统管理模块
│ │ │ │ │ ├── controller/ # 控制器
│ │ │ │ │ │ ├── AuditLogController.java # 审计日志控制器
│ │ │ │ │ │ ├── UserController.java # 用户控制器
│ │ │ │ │ │ ├── RoleController.java # 角色控制器
│ │ │ │ │ │ └── MenuController.java # 菜单控制器
│ │ │ │ │ ├── service/ # 服务层
│ │ │ │ │ │ ├── AuditLogService.java # 审计日志服务接口
│ │ │ │ │ │ ├── UserService.java # 用户服务接口
│ │ │ │ │ │ ├── RoleService.java # 角色服务接口
│ │ │ │ │ │ └── MenuService.java # 菜单服务接口
│ │ │ │ │ ├── mapper/ # 数据访问层
│ │ │ │ │ │ ├── AuditLogMapper.java # 审计日志Mapper
│ │ │ │ │ │ ├── UserMapper.java # 用户Mapper
│ │ │ │ │ │ ├── RoleMapper.java # 角色Mapper
│ │ │ │ │ │ └── MenuMapper.java # 菜单Mapper
│ │ │ │ │ ├── entity/ # 实体类
│ │ │ │ │ │ ├── AuditLog.java # 审计日志实体
│ │ │ │ │ │ ├── User.java # 用户实体
│ │ │ │ │ │ ├── Role.java # 角色实体
│ │ │ │ │ │ └── Menu.java # 菜单实体
│ │ │ │ │ ├── dto/ # 数据传输对象
│ │ │ │ │ │ ├── request/ # 请求对象
│ │ │ │ │ │ │ ├── AuditLogQueryDTO.java # 审计日志查询对象
│ │ │ │ │ │ │ ├── UserQueryDTO.java # 用户查询对象
│ │ │ │ │ │ │ ├── RoleQueryDTO.java # 角色查询对象
│ │ │ │ │ │ │ └── MenuQueryDTO.java # 菜单查询对象
│ │ │ │ │ │ └── response/ # 响应对象
│ │ │ │ │ │     ├── UserDTO.java # 用户信息对象
│ │ │ │ │ │     ├── RoleDTO.java # 角色信息对象
│ │ │ │ │ │     └── MenuDTO.java # 菜单信息对象
│ │ │ │ │ └── vo/ # 视图对象
│ │ │ │ │     ├── AuditLogVO.java # 审计日志视图对象
│ │ │ │ │     ├── UserVO.java # 用户视图对象
│ │ │ │ │     ├── RoleVO.java # 角色视图对象
│ │ │ │ │     └── MenuVO.java # 菜单视图对象
│ │ │ │ └── risk/ # 风险管理模块(待开发)
│ │ │ └── RiskManagementApplication.java # 应用启动类
│ │ └── resources/ # 资源文件目录
│ │ ├── application.yml # 主配置文件
│ │ ├── application-dev.yml # 开发环境配置
│ │ ├── config/ # 配置目录
│ │ ├── db/ # 数据库相关脚本
│ │ │ ├── audit_log.sql # 审计日志表结构
│ │ │ ├── sys_user.sql # 用户表结构
│ │ │ ├── sys_role.sql # 角色表结构
│ │ │ └── sys_menu.sql # 菜单表结构
│ │ └── com/ # MyBatis映射文件
│ │     └── system/ # 系统模块映射文件
│ │         ├── AuditLogMapper.xml # 审计日志Mapper映射
│ │         ├── UserMapper.xml # 用户Mapper映射
│ │         ├── RoleMapper.xml # 角色Mapper映射
│ │         └── MenuMapper.xml # 菜单Mapper映射
│ └── test/ # 测试代码目录
├── doc/ # 项目文档
│ ├── 审计日志.md # 审计日志设计文档
│ └── 权限管理.md # 权限管理设计文档
├── logs/ # 日志目录
├── scripts/ # 脚本目录
├── target/ # 编译输出目录
├── .idea/ # IDE配置目录
├── .git/ # Git版本控制目录
├── TODO # 待办事项
├── .gitignore # Git忽略文件
├── .cursorrules # Cursor IDE规则文件
├── pom.xml # Maven配置
└── README.md # 项目说明
```

## 框架文件说明

1. 公共组件(common)
   - annotation: 自定义注解
     - audit: 审计日志注解
       - Audit: 审计日志注解,用于标记需要记录审计日志的方法
       - SensitiveLog: 敏感信息注解,用于标记需要脱敏的字段
     - field: 自动填充注解
       - AutoFill: 自动填充注解,用于标记需要自动填充的字段
     - id: 自定义主键注解
       - AutoId: 分布式ID注解,用于生成分布式ID
     - permission: 权限注解
       - RequiresPermission: 权限校验注解,用于标记需要权限校验的方法
       - RequiresRole: 角色校验注解,用于标记需要角色校验的方法
   - config: 全局配置类
     - MybatisPlusConfig: MyBatis-Plus配置
     - MessageConfig: 消息配置
     - SecurityPathConfig: 安全路径配置
     - WebMvcConfig: Web MVC配置
     - RedisConfig: Redis配置
     - Sm4PasswordEncoder: SM4密码编码器
     - AsyncConfig: 异步处理配置,用于配置审计日志异步处理
     - SecurityConfig: 安全配置,用于配置Spring Security
     - RemoveDruidAdConfig: Druid广告移除配置
   - constant: 常量定义
     - AuditConstants: 审计日志相关常量定义
     - SecurityConstants: 安全相关常量定义
   - exception: 异常处理
     - SecurityException: 安全相关异常
   - filter: 过滤器
     - JwtAuthenticationFilter: JWT认证过滤器
   - interceptor: 拦截器
     - PermissionInterceptor: 权限拦截器
   - response: 统一响应结构
   - util: 工具类
     - SensitiveUtil: 敏感信息处理工具,用于数据脱敏
     - RequestContextUtils: 请求上下文工具,用于获取请求信息
     - SecurityUtils: 安全工具类,用于获取当前用户信息

2. 框架功能(frame)
   - cache: 缓存框架
     - entity: 缓存实体
     - util: 缓存工具
   - handler: 数据处理器
     - changetype: 类型转换器
     - AutoFillHandler: 自动填充处理器
   - security: 安全框架
     - config: 安全配置
       - WebSecurityConfig: Web安全配置
       - JwtConfig: JWT配置
     - controller: 安全控制器
       - AuthController: 认证控制器
     - dto: 数据传输对象
       - LoginDTO: 登录请求对象
       - TokenDTO: Token响应对象
     - filter: 安全过滤器
       - JwtAuthenticationFilter: JWT认证过滤器
     - service: 安全服务
       - UserDetailsServiceImpl: 用户详情服务
       - TokenService: Token服务
     - utils: 安全工具
       - JwtUtils: JWT工具类
       - SecurityUtils: 安全工具类
     - vo: 视图对象
       - LoginVO: 登录响应对象
   - swagger: API文档配置
   - aspect: 切面处理
     - AuditAspect: 审计日志切面,用于处理审计日志记录
     - PermissionAspect: 权限校验切面,用于处理权限校验

3. 业务模块(modules)
   - system: 系统管理模块
     - controller: 控制器层
       - AuditLogController: 审计日志控制器,提供审计日志查询接口
       - UserController: 用户控制器,提供用户管理接口
       - RoleController: 角色控制器,提供角色管理接口
       - MenuController: 菜单控制器,提供菜单管理接口
     - service: 服务层
       - AuditLogService: 审计日志服务接口
       - UserService: 用户服务接口
       - RoleService: 角色服务接口
       - MenuService: 菜单服务接口
     - mapper: 数据访问层
       - AuditLogMapper: 审计日志Mapper接口
       - UserMapper: 用户Mapper接口
       - RoleMapper: 角色Mapper接口
       - MenuMapper: 菜单Mapper接口
     - entity: 实体类
       - AuditLog: 审计日志实体
       - User: 用户实体
       - Role: 角色实体
       - Menu: 菜单实体
     - dto: 数据传输对象
       - request: 请求对象
         - AuditLogQueryDTO: 审计日志查询对象
         - UserQueryDTO: 用户查询对象
         - RoleQueryDTO: 角色查询对象
         - MenuQueryDTO: 菜单查询对象
       - response: 响应对象
         - UserDTO: 用户信息对象
         - RoleDTO: 角色信息对象
         - MenuDTO: 菜单信息对象
     - vo: 视图对象
       - AuditLogVO: 审计日志视图对象
       - UserVO: 用户视图对象
       - RoleVO: 角色视图对象
       - MenuVO: 菜单视图对象
   - risk: 风险管理模块(待开发)

4. 资源文件(resources)
   - application.yml: 主配置文件
   - application-dev.yml: 开发环境配置
   - config: 配置目录
   - db: 数据库相关脚本
     - audit_log.sql: 审计日志表结构
     - sys_user.sql: 用户表结构
     - sys_role.sql: 角色表结构
     - sys_menu.sql: 菜单表结构
   - com: MyBatis映射文件
     - system: 系统模块映射文件
       - AuditLogMapper.xml: 审计日志Mapper映射
       - UserMapper.xml: 用户Mapper映射
       - RoleMapper.xml: 角色Mapper映射
       - MenuMapper.xml: 菜单Mapper映射

## 开发规范

### 代码规范

- 遵循阿里巴巴Java开发手册(最新版)
- 使用统一的代码格式化工具(推荐IntelliJ IDEA默认格式)
- 保持代码简洁清晰,避免复杂嵌套和冗长方法
- 合理使用设计模式,但避免过度设计
- 单元测试覆盖率不低于70%
- 合理使用缓存提升性能,避免缓存穿透和雪崩
- 使用统一的日志格式,关键操作必须记录日志
- 异常必须处理或向上抛出,禁止捕获异常后不处理

### 命名规范

- 类名: 使用PascalCase(如UserService)
- 方法名: 使用camelCase(如getUserById)
- 变量名: 使用camelCase(如userId)
- 常量名: 使用UPPER_SNAKE_CASE(如MAX_RETRY_COUNT)
- 包名: 使用小写字母(如com.seventeen.svt.common)
- 数据库表名: 使用snake_case(如sys_user)
- 缓存key: 使用冒号分隔的字符串(如user:role:1001)
- 接口命名: 动词+名词(如getUserList, updateRole)

### 注释规范

- 类注释: 说明类的功能、作者、日期
  ```java
  /**
   * 用户服务实现类
   * 
   * @author author
   * @date 2024-03-20
   */
  ```
- 方法注释: 说明方法的功能、参数、返回值
  ```java
  /**
   * 根据ID获取用户信息
   * 
   * @param id 用户ID
   * @return 用户信息
   */
  ```
- 关键代码注释: 说明代码的作用和实现逻辑
- 缓存注释: 说明缓存的用途、过期时间、更新策略

### Git提交规范

- 提交信息格式: `类型(范围): 描述`
- 类型:
  - feat: 新功能
  - fix: 修复bug
  - docs: 文档更新
  - style: 代码格式调整
  - refactor: 重构代码
  - test: 测试相关
  - chore: 构建过程或辅助工具变动
- 示例: `feat(user): 添加用户密码重置功能`

## 部署说明

### 打包命令

```bash
mvn clean package -DskipTests
```

### 部署步骤

1. 准备环境
   - 安装JDK 21+
   - 安装SQLServer 2022
   - 安装Redis 6.0+
   - 设置环境变量(可选)

2. 配置应用
   - 修改application-prod.yml
   - 配置数据库连接
   - 配置Redis连接
   - 配置缓存参数
   - 配置日志级别和路径

3. 启动应用
```bash
java -jar risk-management.jar --spring.profiles.active=prod
```

4. 容器化部署(Docker)
```bash
# 构建镜像
docker build -t risk-management:latest .

# 运行容器
docker run -d -p 8080:8080 -v /logs:/app/logs --name risk-management risk-management:latest
```

### 配置说明

主要配置项:
- 数据库连接配置
  ```yaml
  spring:
    datasource:
      url: jdbc:sqlserver://db-host:1433;databaseName=risk_management
      username: db_user
      password: db_password
      driver-class-name: com.microsoft.sqlserver.jdbc.SQLServerDriver
  ```
- Redis连接配置
  ```yaml
  spring:
    redis:
      host: redis-host
      port: 6379
      password: redis_password
      database: 0
      timeout: 10000
  ```
- JWT配置
  ```yaml
  jwt:
    secret: your-secret-key
    expiration: 86400000  # 24小时
    issuer: risk-management-system
  ```
- 日志配置
  ```yaml
  logging:
    level:
      root: INFO
      com.seventeen.svt: DEBUG
    file:
      path: /logs
      name: risk-management.log
  ```
- 安全配置
  ```yaml
  security:
    ignored-paths:
      - /api/auth/**
      - /doc.html
      - /swagger-resources/**
      - /v3/api-docs/**
  ```
- 缓存配置
  ```yaml
  spring:
    cache:
      type: redis
      redis:
        time-to-live: 3600000  # 1小时
        cache-null-values: true
  ```

### 监控和维护

- 健康检查: `http://localhost:8080/actuator/health`
- 查看日志: `tail -f /logs/risk-management.log`
- 重启服务: `systemctl restart risk-management`

## 接口文档

访问地址: http://localhost:8080/doc.html

### 接口认证

大部分接口需要在请求头中添加JWT令牌:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 常见接口示例

#### 用户登录
- 请求: POST /api/auth/login
- 请求体:
  ```json
  {
    "username": "admin",
    "password": "password"
  }
  ```
- 响应:
  ```json
  {
    "code": 200,
    "message": "登录成功",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "userId": 1001,
      "username": "admin"
    }
  }
  ```

#### 获取用户信息
- 请求: GET /api/system/user/{id}
- 响应:
  ```json
  {
    "code": 200,
    "message": "操作成功",
    "data": {
      "id": 1001,
      "username": "admin",
      "realName": "管理员",
      "email": "admin@example.com",
      "roles": ["ADMIN"]
    }
  }
  ```

## 管理后台

### API文档
- Knife4j增强文档: http://localhost:8080/doc.html
- Swagger原始文档: http://localhost:8080/swagger-ui.html

### 数据库监控
- Druid监控首页: http://localhost:8080/druid
- SQL监控: http://localhost:8080/druid/sql.html
- Wall监控: http://localhost:8080/druid/wall.html
- Session监控: http://localhost:8080/druid/session.html
- JSON监控: http://localhost:8080/druid/json.html

### 安全说明
- 以上地址在生产环境建议关闭或限制访问
- 可在application.yml中配置访问白名单
- 建议配置访问IP限制和访问密码

### 配置示例
```yaml
spring:
  datasource:
    druid:
      stat-view-servlet:
        enabled: true
        url-pattern: /druid/*
        allow: 127.0.0.1
        deny: 
        login-username: admin
        login-password: admin123
      filter:
        stat:
          enabled: true
          log-slow-sql: true
          slow-sql-millis: 1000
        wall:
          enabled: true
        slf4j:
          enabled: true
```

## 贡献指南

### 贡献流程

1. Fork 项目到个人仓库
2. 创建特性分支(`git checkout -b feature/your-feature`)
3. 提交变更(`git commit -m 'feat: add some feature'`)
4. 推送到远程分支(`git push origin feature/your-feature`)
5. 创建Pull Request

### 分支管理

- `main`: 主分支,保持稳定可发布状态
- `develop`: 开发分支,用于集成各个特性分支
- `feature/*`: 特性分支,用于开发新功能
- `fix/*`: 修复分支,用于修复缺陷
- `release/*`: 发布分支,用于准备发布版本

### 代码审查标准

- 代码符合项目编码规范
- 单元测试覆盖新增代码
- 无安全漏洞
- 文档已同步更新
- 代码逻辑清晰易懂

### 发布流程

1. 从`develop`分支创建`release`分支
2. 在`release`分支上修复问题并更新版本号
3. 合并到`main`分支并打标签
4. 合并回`develop`分支

## 许可证

[MIT License](LICENSE)

本项目使用MIT许可证,允许任何人出于任何目的使用、复制、修改、合并、发布、分发、再许可和/或销售本软件的副本,但须在所有副本中包含上述版权声明和本许可声明。

## 联系我们

- 项目负责人: [姓名]
- 联系邮箱: [邮箱]
- 问题反馈: [GitHub Issues](https://github.com/your-username/risk-management/issues)
