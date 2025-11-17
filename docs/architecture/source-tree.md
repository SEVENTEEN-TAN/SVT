# SVT 源码树结构文档

## 文档版本

| 版本 | 日期 | 作者 | 说明 |
|------|------|------|------|
| 1.0.0 | 2025-11-17 | Winston (Architect) | 初始版本 |

---

## 一、项目根目录结构

```
SVT/
├── .bmad-core/                  # BMad 工作流核心文件
├── .claude/                     # Claude Code 配置
│   └── commands/                # 自定义命令
├── .git/                        # Git 版本控制
├── .gitignore                   # Git 忽略配置
├── .idea/                       # IntelliJ IDEA 配置
├── .spec-workflow/              # Spec 工作流
├── CLAUDE.md                    # Claude Code 项目指令
├── README.md                    # 项目说明文档
├── SVT-Server/                  # 后端服务 (Spring Boot)
├── SVT-Web/                     # 前端应用 (React)
└── docs/                        # 项目文档
    └── architecture/            # 架构文档
        ├── tech-stack.md        # 技术栈文档
        ├── coding-standards.md  # 编码标准文档
        ├── source-tree.md       # 源码树文档 (本文档)
        └── architecture.md      # 完整架构文档
```

---

## 二、后端源码树 (SVT-Server)

### 2.1 完整目录结构

```
SVT-Server/
├── pom.xml                                   # Maven 项目配置
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/seventeen/svt/
│   │   │       ├── SvtApplication.java       # 应用入口
│   │   │       │
│   │   │       ├── common/                   # 通用层
│   │   │       │   ├── annotation/           # 自定义注解
│   │   │       │   │   ├── audit/            # 审计注解
│   │   │       │   │   │   ├── Audit.java
│   │   │       │   │   │   ├── SensitiveLog.java
│   │   │       │   │   │   └── SensitiveStrategy.java
│   │   │       │   │   ├── dbkey/            # 分布式ID注解
│   │   │       │   │   │   └── DistributedId.java
│   │   │       │   │   ├── field/            # 字段注解
│   │   │       │   │   │   ├── AutoFill.java
│   │   │       │   │   │   ├── FillType.java
│   │   │       │   │   │   └── OperationType.java
│   │   │       │   │   ├── permission/       # 权限注解
│   │   │       │   │   │   └── RequiresPermission.java
│   │   │       │   │   └── transaction/      # 事务注解
│   │   │       │   │       ├── AutoTransaction.java
│   │   │       │   │       └── TransactionType.java
│   │   │       │   │
│   │   │       │   ├── config/               # 配置类
│   │   │       │   │   ├── AESConfig.java
│   │   │       │   │   ├── AsyncConfig.java
│   │   │       │   │   ├── DruidConfig.java
│   │   │       │   │   ├── MessageConfig.java
│   │   │       │   │   ├── SecurityPathConfig.java
│   │   │       │   │   ├── SensitiveConfig.java
│   │   │       │   │   ├── SM4ConfigDecryptProcessor.java
│   │   │       │   │   ├── SVTArgon2PasswordEncoder.java
│   │   │       │   │   └── transaction/
│   │   │       │   │       └── TransactionConfig.java
│   │   │       │   │
│   │   │       │   ├── constant/             # 常量定义
│   │   │       │   │   ├── CacheConstants.java
│   │   │       │   │   ├── CommonConstants.java
│   │   │       │   │   └── SessionConstants.java
│   │   │       │   │
│   │   │       │   ├── exception/            # 异常类
│   │   │       │   │   ├── BusinessException.java
│   │   │       │   │   └── GlobalExceptionHandler.java
│   │   │       │   │
│   │   │       │   ├── filter/               # 过滤器
│   │   │       │   │   ├── AESCryptoFilter.java
│   │   │       │   │   ├── AESRequestWrapper.java
│   │   │       │   │   ├── AESResponseWrapper.java
│   │   │       │   │   └── RequestWrapperFilter.java
│   │   │       │   │
│   │   │       │   └── util/                 # 工具类
│   │   │       │       ├── AESUtils.java
│   │   │       │       ├── JwtUtils.java
│   │   │       │       ├── RedisUtils.java
│   │   │       │       ├── SensitiveUtil.java
│   │   │       │       ├── SM4Utils.java
│   │   │       │       └── TreeUtils.java
│   │   │       │
│   │   │       ├── frame/                    # 框架层
│   │   │       │   ├── aspect/               # AOP切面
│   │   │       │   │   ├── AuditAspect.java
│   │   │       │   │   ├── AutoTransactionAspect.java
│   │   │       │   │   └── PermissionAspect.java
│   │   │       │   │
│   │   │       │   ├── cache/                # 缓存管理
│   │   │       │   │   ├── entity/
│   │   │       │   │   │   ├── JwtCache.java
│   │   │       │   │   │   └── UserDetailCache.java
│   │   │       │   │   └── util/
│   │   │       │   │       ├── JwtCacheUtils.java
│   │   │       │   │       ├── UserDetailCacheUtils.java
│   │   │       │   │       ├── DbKeyCacheUtils.java
│   │   │       │   │       └── OrgInfoCacheUtils.java
│   │   │       │   │
│   │   │       │   ├── dbkey/                # 分布式ID生成
│   │   │       │   │   ├── DistributedIdGenerator.java
│   │   │       │   │   ├── DbKey.java
│   │   │       │   │   └── DbKeyMapper.java
│   │   │       │   │
│   │   │       │   ├── handler/              # 处理器
│   │   │       │   │   ├── StringToDateTimeTypeHandler.java
│   │   │       │   │   └── GlobalResponseBodyAdvice.java
│   │   │       │   │
│   │   │       │   ├── listener/             # 监听器
│   │   │       │   │   ├── FlexInsertListener.java
│   │   │       │   │   └── FlexUpdateListener.java
│   │   │       │   │
│   │   │       │   ├── lock/                 # 分布式锁
│   │   │       │   │   ├── DatabaseDistributedLockManager.java
│   │   │       │   │   ├── config/
│   │   │       │   │   │   └── DistributedLockConfig.java
│   │   │       │   │   ├── entity/
│   │   │       │   │   │   └── DistributedLock.java
│   │   │       │   │   └── mapper/
│   │   │       │   │       └── DistributedLockMapper.java
│   │   │       │   │
│   │   │       │   └── security/             # 安全框架
│   │   │       │       ├── config/
│   │   │       │       │   └── SecurityConfig.java
│   │   │       │       ├── constants/
│   │   │       │       │   └── SessionConstants.java
│   │   │       │       ├── filter/
│   │   │       │       │   └── JwtAuthenticationFilter.java
│   │   │       │       └── util/
│   │   │       │           └── SecurityUtils.java
│   │   │       │
│   │   │       └── modules/                  # 业务模块
│   │   │           └── system/               # 系统管理模块
│   │   │               ├── controller/       # 控制器层
│   │   │               │   ├── MenuManagementController.java
│   │   │               │   ├── RoleManagementController.java
│   │   │               │   ├── SystemAuthController.java
│   │   │               │   └── UserManagementController.java
│   │   │               │
│   │   │               ├── service/          # 业务逻辑层
│   │   │               │   ├── MenuInfoService.java
│   │   │               │   ├── RoleInfoService.java
│   │   │               │   ├── UserInfoService.java
│   │   │               │   └── impl/
│   │   │               │       ├── MenuInfoServiceImpl.java
│   │   │               │       ├── RoleInfoServiceImpl.java
│   │   │               │       └── UserInfoServiceImpl.java
│   │   │               │
│   │   │               ├── entity/           # 实体类
│   │   │               │   ├── MenuInfo.java
│   │   │               │   ├── RoleInfo.java
│   │   │               │   ├── UserInfo.java
│   │   │               │   ├── OrgInfo.java
│   │   │               │   └── AuditLog.java
│   │   │               │
│   │   │               ├── dto/              # 数据传输对象
│   │   │               │   ├── request/
│   │   │               │   │   ├── LoginRequest.java
│   │   │               │   │   ├── MenuConditionDTO.java
│   │   │               │   │   ├── RoleConditionDTO.java
│   │   │               │   │   └── UserConditionDTO.java
│   │   │               │   └── response/
│   │   │               │       ├── LoginResponse.java
│   │   │               │       ├── MenuDetailDTO.java
│   │   │               │       ├── RoleDetailDTO.java
│   │   │               │       └── UserDetailDTO.java
│   │   │               │
│   │   │               └── mapper/           # 数据访问层
│   │   │                   ├── MenuInfoMapper.java
│   │   │                   ├── RoleInfoMapper.java
│   │   │                   ├── UserInfoMapper.java
│   │   │                   └── AuditLogMapper.java
│   │   │
│   │   └── resources/                        # 资源文件
│   │       ├── application.yml               # 主配置文件
│   │       ├── application-dev.yml           # 开发环境配置
│   │       ├── application-uat.yml           # UAT环境配置
│   │       ├── application-prod.yml          # 生产环境配置
│   │       ├── log4j2-spring.xml             # Log4j2配置
│   │       ├── config/
│   │       │   └── message.properties        # 国际化消息
│   │       └── db/                           # 数据库脚本
│   │           └── init/
│   │               ├── ddl.sql               # 数据定义语言
│   │               └── dml.sql               # 数据操作语言
│   │
│   └── test/                                 # 测试代码
│       └── java/
│           └── com/seventeen/svt/
│               └── SvtApplicationTests.java
│
└── target/                                   # Maven 构建输出
    └── svt-server-1.0.1-SNAPSHOT.jar
```

### 2.2 关键文件说明

#### 2.2.1 入口文件
- **SvtApplication.java**: Spring Boot应用入口，包含`main()`方法

#### 2.2.2 核心配置
- **application.yml**: 基础配置，所有环境共享
- **application-{profile}.yml**: 环境特定配置（dev/uat/prod）
- **SecurityConfig.java**: Spring Security配置，定义安全策略
- **DruidConfig.java**: 数据库连接池配置

#### 2.2.3 框架核心
- **JwtAuthenticationFilter.java**: JWT认证过滤器，9步安全检查
- **AESCryptoFilter.java**: API加密解密过滤器
- **DatabaseDistributedLockManager.java**: 分布式锁管理器
- **DistributedIdGenerator.java**: 分布式ID生成器

#### 2.2.4 AOP切面
- **AuditAspect.java**: 审计日志切面
- **PermissionAspect.java**: 权限验证切面
- **AutoTransactionAspect.java**: 自动事务切面

---

## 三、前端源码树 (SVT-Web)

### 3.1 完整目录结构

```
SVT-Web/
├── package.json                              # NPM 项目配置
├── tsconfig.json                             # TypeScript 配置
├── vite.config.ts                            # Vite 构建配置
├── uno.config.ts                             # UnoCSS 配置
├── .env.development                          # 开发环境变量
├── .env.uat                                  # UAT环境变量
├── .env.production                           # 生产环境变量
├── index.html                                # HTML入口
│
├── public/                                   # 静态资源
│   ├── favicon.ico
│   └── logo.png
│
└── src/
    ├── main.tsx                              # React入口文件
    ├── App.tsx                               # 根组件
    │
    ├── api/                                  # API服务层
    │   ├── auth.ts                           # 认证API
    │   └── system/                           # 系统管理API
    │       ├── menu.ts
    │       ├── role.ts
    │       └── user.ts
    │
    ├── assets/                               # 静态资源
    │   ├── images/
    │   └── styles/
    │
    ├── components/                           # 公共组件
    │   ├── Common/                           # 通用组件
    │   │   ├── ErrorBoundary.tsx
    │   │   ├── PageLoading.tsx
    │   │   └── NotFoundPage.tsx
    │   │
    │   ├── DynamicPage/                      # 动态页面加载
    │   │   └── index.tsx
    │   │
    │   ├── Layout/                           # 布局系统
    │   │   ├── BasicLayout.tsx               # 基础布局容器
    │   │   │
    │   │   ├── core/                         # 核心逻辑
    │   │   │   ├── LayoutProvider.tsx        # 状态管理提供者
    │   │   │   └── LayoutStructure.tsx       # 布局结构组件
    │   │   │
    │   │   ├── modules/                      # 功能模块
    │   │   │   ├── Header/                   # 顶部导航
    │   │   │   │   ├── index.tsx
    │   │   │   │   ├── Breadcrumb.tsx
    │   │   │   │   ├── UserDropdown.tsx
    │   │   │   │   └── hooks/
    │   │   │   │       └── useHeader.ts
    │   │   │   │
    │   │   │   ├── Sidebar/                  # 侧边栏
    │   │   │   │   ├── index.tsx
    │   │   │   │   ├── Logo.tsx
    │   │   │   │   ├── MenuTree.tsx
    │   │   │   │   └── hooks/
    │   │   │   │       └── useSidebar.ts
    │   │   │   │
    │   │   │   └── TabSystem/                # 标签页系统
    │   │   │       ├── index.tsx
    │   │   │       ├── TabBar.tsx
    │   │   │       ├── TabContextMenu.tsx
    │   │   │       └── hooks/
    │   │   │           └── useTabStorage.ts
    │   │   │
    │   │   └── shared/                       # 共享类型
    │   │       ├── types.ts
    │   │       └── constants.ts
    │   │
    │   └── Loading/                          # 加载组件
    │       ├── PageLoading.tsx
    │       └── FullScreenLoading.tsx
    │
    ├── config/                               # 配置文件
    │   └── constants.ts                      # 常量配置
    │
    ├── hooks/                                # 自定义Hooks
    │   ├── useAuth.ts                        # 认证Hook
    │   ├── useUserStatus.ts                  # 用户状态Hook
    │   ├── useMobile.ts                      # 移动端检测Hook
    │   ├── useTable.ts                       # 表格Hook
    │   └── useDebounce.ts                    # 防抖Hook
    │
    ├── pages/                                # 页面组件
    │   ├── Auth/                             # 认证页面
    │   │   ├── LoginPage/
    │   │   │   ├── index.tsx
    │   │   │   ├── LoginForm.tsx
    │   │   │   ├── OrgRoleSelection.tsx
    │   │   │   └── styles.css
    │   │   └── ForgotPassword/
    │   │
    │   ├── Home/                             # 首页
    │   │   └── HomePage/
    │   │       └── index.tsx
    │   │
    │   ├── System/                           # 系统管理
    │   │   ├── Menu/                         # 菜单管理
    │   │   │   ├── index.tsx
    │   │   │   ├── MenuList.tsx
    │   │   │   ├── MenuForm.tsx
    │   │   │   └── MenuTree.tsx
    │   │   │
    │   │   ├── Role/                         # 角色管理
    │   │   │   ├── index.tsx
    │   │   │   ├── RoleList.tsx
    │   │   │   ├── RoleForm.tsx
    │   │   │   └── PermissionTree.tsx
    │   │   │
    │   │   └── User/                         # 用户管理
    │   │       ├── index.tsx
    │   │       ├── UserList.tsx
    │   │       ├── UserForm.tsx
    │   │       └── UserDetail.tsx
    │   │
    │   ├── Business/                         # 业务模块
    │   │   ├── ProcessManagement/            # 流程管理
    │   │   └── QueryManagement/              # 查询管理
    │   │
    │   └── Error/                            # 错误页面
    │       ├── NotFound.tsx                  # 404页面
    │       └── ServerError.tsx               # 500页面
    │
    ├── router/                               # 路由配置
    │   ├── index.tsx                         # 路由主配置
    │   └── ProtectedRoute.tsx                # 路由保护组件
    │
    ├── stores/                               # 状态管理
    │   ├── authStore.ts                      # 认证状态
    │   ├── userStore.ts                      # 用户状态
    │   └── useAuth.ts                        # 组合Hook
    │
    ├── styles/                               # 样式文件
    │   ├── theme.ts                          # Ant Design主题
    │   ├── global.css                        # 全局样式
    │   └── variables.css                     # CSS变量
    │
    ├── types/                                # 类型定义
    │   ├── user.ts                           # 用户类型
    │   ├── menu.ts                           # 菜单类型
    │   ├── role.ts                           # 角色类型
    │   ├── api.ts                            # API类型
    │   └── session.ts                        # 会话类型
    │
    └── utils/                                # 工具函数
        ├── request.ts                        # HTTP客户端
        ├── tokenManager.ts                   # Token管理
        ├── sessionManager.ts                 # 会话管理
        ├── messageManager.ts                 # 消息管理
        ├── crypto.ts                         # 加密工具
        ├── debugManager.ts                   # 调试工具
        └── storage.ts                        # 存储工具
```

### 3.2 关键文件说明

#### 3.2.1 入口文件
- **main.tsx**: React应用入口，渲染根组件
- **App.tsx**: 根组件，配置路由和全局Provider
- **index.html**: HTML入口，包含根元素

#### 3.2.2 核心配置
- **vite.config.ts**: Vite构建配置，包含代理、别名、分包策略
- **tsconfig.json**: TypeScript编译配置
- **uno.config.ts**: UnoCSS原子化CSS配置

#### 3.2.3 布局系统
- **BasicLayout.tsx**: 布局容器，负责用户验证
- **LayoutProvider.tsx**: 布局状态管理，Tab系统核心
- **LayoutStructure.tsx**: 布局结构，纯展示组件

#### 3.2.4 路由系统
- **router/index.tsx**: 路由配置，定义应用路由结构
- **ProtectedRoute.tsx**: 路由保护，四层安全防护
- **DynamicPage/index.tsx**: 动态页面加载，权限验证

#### 3.2.5 状态管理
- **authStore.ts**: 认证状态（token, isAuthenticated）
- **userStore.ts**: 用户状态（user, session）
- **useAuth.ts**: 组合Hook，协调各Store

#### 3.2.6 工具层
- **request.ts**: Axios封装，请求/响应拦截，AES加密
- **tokenManager.ts**: Token管理，简化设计
- **sessionManager.ts**: 会话管理，智能续期
- **crypto.ts**: AES-256加密/解密

---

## 四、数据库结构

### 4.1 核心业务表

```
数据库: svt_db
├── 系统管理表
│   ├── user_info                 # 用户表
│   ├── role_info                 # 角色表
│   ├── menu_info                 # 菜单表
│   ├── org_info                  # 组织机构表
│   ├── user_role                 # 用户角色关联表
│   ├── role_menu                 # 角色菜单关联表
│   └── user_org                  # 用户组织关联表
│
├── 审计日志表
│   └── audit_log                 # 审计日志表
│
├── 框架表
│   ├── db_key                    # 分布式ID表
│   └── distributed_lock          # 分布式锁表
│
└── 业务表
    ├── process_info              # 流程信息表
    └── query_config              # 查询配置表
```

### 4.2 表结构说明

#### user_info (用户表)
```sql
user_id VARCHAR(32) PK            # 用户ID (分布式ID)
login_id VARCHAR(50) UNIQUE       # 登录ID
user_name NVARCHAR(50)            # 用户名
password VARCHAR(255)             # 密码 (Argon2哈希)
email VARCHAR(100)                # 邮箱
phone VARCHAR(20)                 # 手机号
status CHAR(1)                    # 状态 (0停用 1正常)
create_by VARCHAR(32)             # 创建者
create_time DATETIME              # 创建时间
update_by VARCHAR(32)             # 更新者
update_time DATETIME              # 更新时间
del_flag CHAR(1)                  # 删除标志 (0正常 1删除)
```

#### menu_info (菜单表)
```sql
menu_id VARCHAR(32) PK            # 菜单ID
parent_id VARCHAR(32)             # 父菜单ID
menu_name_zh NVARCHAR(50)         # 菜单中文名
menu_name_en VARCHAR(50)          # 菜单英文名
menu_path VARCHAR(200)            # 菜单路径
menu_icon VARCHAR(50)             # 菜单图标
menu_sort INT                     # 菜单排序
menu_type CHAR(1)                 # 菜单类型 (M目录 C菜单 F按钮)
status CHAR(1)                    # 状态
create_by VARCHAR(32)             # 创建者
create_time DATETIME              # 创建时间
update_by VARCHAR(32)             # 更新者
update_time DATETIME              # 更新时间
del_flag CHAR(1)                  # 删除标志
```

#### distributed_lock (分布式锁表)
```sql
lock_key VARCHAR(255) PK          # 锁键 (主键保证唯一性)
lock_value VARCHAR(255)           # 锁值 (UUID)
holder_info VARCHAR(500)          # 持有者信息
created_time DATETIME             # 创建时间
expire_time DATETIME              # 过期时间
retry_count INT                   # 重试次数
```

---

## 五、配置文件结构

### 5.1 后端配置文件

```
SVT-Server/src/main/resources/
├── application.yml               # 主配置 (共享)
├── application-dev.yml           # 开发环境
├── application-uat.yml           # UAT环境
├── application-prod.yml          # 生产环境
├── log4j2-spring.xml             # Log4j2配置
└── db/init/
    ├── ddl.sql                   # 表结构定义
    └── dml.sql                   # 初始数据
```

### 5.2 前端配置文件

```
SVT-Web/
├── .env.development              # 开发环境变量
├── .env.uat                      # UAT环境变量
├── .env.production               # 生产环境变量
├── vite.config.ts                # Vite构建配置
├── tsconfig.json                 # TypeScript配置
└── uno.config.ts                 # UnoCSS配置
```

---

## 六、构建产物

### 6.1 后端构建产物

```
SVT-Server/target/
├── svt-server-1.0.1-SNAPSHOT.jar           # 可执行JAR
├── classes/                                # 编译后的类文件
├── generated-sources/                      # 生成的源代码
└── maven-status/                           # Maven状态
```

### 6.2 前端构建产物

```
SVT-Web/dist/
├── index.html                              # 入口HTML
├── assets/                                 # 静态资源
│   ├── index-[hash].js                     # 主入口JS
│   ├── vendor-[hash].js                    # 第三方库
│   ├── antd-[hash].js                      # Ant Design
│   ├── router-[hash].js                    # React Router
│   ├── utils-[hash].js                     # 工具库
│   └── index-[hash].css                    # 样式文件
└── favicon.ico                             # 网站图标
```

---

## 七、关键路径索引

### 7.1 后端关键路径

| 功能 | 文件路径 |
|------|----------|
| 应用入口 | `src/main/java/com/seventeen/svt/SvtApplication.java` |
| JWT认证过滤器 | `src/main/java/com/seventeen/svt/frame/security/filter/JwtAuthenticationFilter.java` |
| AES加密过滤器 | `src/main/java/com/seventeen/svt/common/filter/AESCryptoFilter.java` |
| 分布式锁 | `src/main/java/com/seventeen/svt/frame/lock/DatabaseDistributedLockManager.java` |
| 分布式ID | `src/main/java/com/seventeen/svt/frame/dbkey/DistributedIdGenerator.java` |
| 审计切面 | `src/main/java/com/seventeen/svt/frame/aspect/AuditAspect.java` |
| 权限切面 | `src/main/java/com/seventeen/svt/frame/aspect/PermissionAspect.java` |
| 全局异常处理 | `src/main/java/com/seventeen/svt/common/exception/GlobalExceptionHandler.java` |
| 登录接口 | `src/main/java/com/seventeen/svt/modules/system/controller/SystemAuthController.java` |

### 7.2 前端关键路径

| 功能 | 文件路径 |
|------|----------|
| 应用入口 | `src/main.tsx` |
| 根组件 | `src/App.tsx` |
| 路由配置 | `src/router/index.tsx` |
| 路由保护 | `src/router/ProtectedRoute.tsx` |
| 动态页面 | `src/components/DynamicPage/index.tsx` |
| 布局容器 | `src/components/Layout/BasicLayout.tsx` |
| 布局Provider | `src/components/Layout/core/LayoutProvider.tsx` |
| 认证Store | `src/stores/authStore.ts` |
| 用户Store | `src/stores/userStore.ts` |
| HTTP客户端 | `src/utils/request.ts` |
| Token管理 | `src/utils/tokenManager.ts` |
| 会话管理 | `src/utils/sessionManager.ts` |
| AES加密 | `src/utils/crypto.ts` |
| 登录页面 | `src/pages/Auth/LoginPage/index.tsx` |

---

## 八、模块依赖关系

### 8.1 后端模块依赖

```
common (通用层)
    ↓
frame (框架层)
    ├── aspect (AOP切面)
    ├── cache (缓存管理)
    ├── security (安全框架)
    ├── lock (分布式锁)
    └── dbkey (分布式ID)
    ↓
modules (业务模块)
    └── system (系统管理)
        ├── controller → service → mapper → entity
        └── dto (request/response)
```

### 8.2 前端模块依赖

```
utils (工具层)
    ↓
stores (状态管理)
    ↓
hooks (自定义Hooks)
    ↓
api (API服务层)
    ↓
components (公共组件)
    ├── Layout (布局系统)
    └── DynamicPage (动态页面)
    ↓
pages (业务页面)
    ├── Auth (认证)
    ├── System (系统管理)
    └── Business (业务模块)
    ↓
router (路由配置)
```

---

## 九、开发指南

### 9.1 添加新业务模块 (后端)

1. **创建包结构**
```
modules/
└── newmodule/
    ├── controller/
    ├── service/
    │   └── impl/
    ├── entity/
    ├── dto/
    │   ├── request/
    │   └── response/
    └── mapper/
```

2. **创建实体类**
```java
@Table(value = "new_table")
@Data
public class NewEntity {
    @DistributedId(prefix = "N")
    private String id;
    // 其他字段...
}
```

3. **创建Service和Controller**

### 9.2 添加新页面 (前端)

1. **创建页面目录**
```
pages/
└── NewModule/
    └── NewPage/
        ├── index.tsx
        ├── components/
        └── styles.css
```

2. **创建页面组件**
```typescript
const NewPage: React.FC = () => {
  return <div>New Page</div>;
};

export default NewPage;
```

3. **添加路由 (可选)**
- 如果使用动态路由，无需手动添加
- 在数据库 `menu_info` 表添加菜单记录即可

---

## 十、更新日志

| 日期 | 版本 | 更新内容 | 作者 |
|------|------|----------|------|
| 2025-11-17 | 1.0.0 | 初始版本，完整源码树文档 | Winston (Architect) |

---

**文档维护**: 本文档应在项目结构变化时及时更新
**最后更新**: 2025-11-17
**负责人**: Winston (System Architect)
