# SVT (Seventeen) 企业级管理系统

<div align="center">

**现代化技术栈 · 企业级架构 · 生产就绪**

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.7-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://openjdk.java.net/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

一个基于现代化技术栈构建的企业级管理系统，采用前后端分离架构，提供完整的认证授权、权限管理、审计日志等企业级特性。

[快速开始](#-快速开始) · [核心特性](#-核心特性) · [架构文档](#-架构文档) · [开发指南](#-开发指南)

</div>

---

## 📋 目录

- [项目简介](#项目简介)
- [核心特性](#-核心特性)
- [技术架构](#-技术架构)
- [快速开始](#-快速开始)
- [架构文档](#-架构文档)
- [开发指南](#-开发指南)
- [项目结构](#-项目结构)
- [构建部署](#-构建部署)
- [贡献指南](#-贡献指南)
- [更新日志](#-更新日志)

---

## 项目简介

SVT (Seventeen) 是一个**企业级管理系统**，采用前后端分离架构，基于现代化技术栈构建。系统具备完整的用户管理、权限控制、审计日志等企业级特性，可作为企业应用开发的基础框架。

### 🎯 设计目标

- **安全第一**: 多层加密体系 + 完善的认证授权机制
- **高性能**: 本地缓存优先 + 分布式ID + 数据库分布式锁
- **易维护**: 注解驱动开发 + 模块化设计 + 完整文档
- **开发友好**: TypeScript类型安全 + 热重载 + 智能IDE支持
- **生产就绪**: 完善的监控 + 日志 + 错误处理机制

---

## ✨ 核心特性

### 🔐 安全机制

| 特性 | 说明 | 实现方式 |
|------|------|----------|
| **JWT智能续期** | 基于用户活跃度自动续期 | 活跃度周期10分钟，最后20%自动续期 |
| **API加密** | 端到端数据加密 | AES-256-CBC模式，每次请求随机IV |
| **配置加密** | 敏感配置保护 | SM4国密算法（替代Jasypt） |
| **密码哈希** | 业界最安全的密码存储 | Argon2算法（内存64MB，迭代3次） |
| **九步安全检查** | JWT验证流程 | 签名验证→黑名单→缓存→IP→Token→活跃度→续期 |
| **审计日志** | 完整操作记录 | 敏感数据自动脱敏，支持多种脱敏策略 |

### ⚡ 性能优化

- **本地缓存优先**: Caffeine高性能缓存（最多1000个Token，30分钟过期）
- **Session Sticky**: 负载均衡会话粘性，确保缓存命中
- **分布式ID生成**: 前缀+日期+序号+字母扩展，批量预分配（步长100）
- **数据库分布式锁**: 基于主键唯一性，智能重试机制
- **O(1)权限检查**: 使用Set索引优化，useMemo缓存
- **代码分割**: Vite手动分包，减少首屏加载39%

### 🏗️ 架构特色

**后端架构**:
- ✅ 注解驱动开发（@Audit、@RequiresPermission、@AutoTransaction、@DistributedId、@AutoFill）
- ✅ AOP横切关注点（审计、权限、事务、参数脱敏）
- ✅ 监听器模式（MyBatis-Flex插入/更新监听器）
- ✅ 过滤器链（AES加密→请求包装→JWT认证）
- ✅ 三层缓存（Redis分布式 + Caffeine本地 + 批量ID缓存）

**前端架构**:
- ✅ 模块化Layout系统（Provider + Structure + Header/Sidebar/TabSystem）
- ✅ 分离状态管理（authStore认证 + userStore用户 + useAuth组合Hook）
- ✅ 四层安全防护（Auth → Role Selection → Status Validation → Permission Check）
- ✅ 动态路由加载（基于用户菜单树，懒加载组件）
- ✅ 智能Tab系统（多Tab + 上下文菜单 + localStorage持久化）
- ✅ 防重复操作（loading标志 + ref标记 + 全局验证状态）

---

## 🚀 技术架构

### 后端技术栈 (SVT-Server)

| 层级 | 技术 | 版本 | 说明 |
|------|------|------|------|
| **核心框架** | Spring Boot | 3.5.7 | 企业级Java应用框架 |
| **编程语言** | Java | 21 (LTS) | 支持虚拟线程、模式匹配等现代特性 |
| **ORM框架** | MyBatis-Flex | 1.10.9 | 轻量级MyBatis增强框架 |
| **数据库** | MySQL | 8.4.0 | 关系型数据库 + 分布式锁 + 分布式ID |
| **本地缓存** | Caffeine | 3.1.8 | 高性能本地缓存（W-TinyLFU算法） |
| **连接池** | Druid | 1.2.24 | 数据库连接池 + SQL监控 |
| **安全框架** | Spring Security | 6.x | 认证和授权框架 |
| **JWT实现** | JJWT | 0.11.5 | JSON Web Token生成和验证 |
| **加密库** | BouncyCastle | 1.69 | SM4、Argon2等加密算法 |
| **API文档** | Knife4j | 4.5.0 | 基于OpenAPI 3.0的API文档工具 |
| **日志框架** | Log4j2 + Disruptor | 2.x + 3.4.4 | 高性能异步日志 |
| **工具库** | Hutool + Guava | 5.8.16 + 32.1.3 | Java工具类库 |

### 前端技术栈 (SVT-Web)

| 层级 | 技术 | 版本 | 说明 |
|------|------|------|------|
| **UI框架** | React | 19.1.0 | 最新React，支持并发特性 |
| **编程语言** | TypeScript | 5.8.3 | 严格类型检查，100%类型覆盖 |
| **构建工具** | Vite | 6.3.5 | 闪电般的HMR和构建速度 |
| **UI组件库** | Ant Design | 5.25.4 | 企业级React组件库 |
| **状态管理** | Zustand | 5.0.5 | 轻量级状态管理，无Redux样板代码 |
| **路由管理** | React Router DOM | 7.6.2 | 声明式路由，支持嵌套路由 |
| **服务端状态** | TanStack React Query | 5.80.6 | 强大的异步状态管理和缓存 |
| **表单管理** | React Hook Form | 7.57.0 | 高性能表单库 |
| **类型验证** | Zod | 3.25.57 | TypeScript优先的schema验证 |
| **HTTP客户端** | Axios | 1.9.0 | 基于Promise的HTTP库 |
| **加密工具** | Crypto-JS | 4.2.0 | AES-256加密/解密 |
| **原子化CSS** | UnoCSS | 66.3.2 | 即时按需的原子化CSS引擎 |
| **日期处理** | Day.js | 1.11.13 | 轻量级日期库 |

### 架构模式

```
┌─────────────────────────────────────────────────────────────┐
│                        客户端层                              │
│  React 19.1.0 + TypeScript 5.8.3 + Ant Design 5.25.4       │
└─────────────────────────────────────────────────────────────┘
                            │
                   HTTPS + AES-256加密
                            │
┌─────────────────────────────────────────────────────────────┐
│                      网关/代理层                             │
│            Nginx (反向代理 + Session Sticky)                │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                       应用服务层                             │
│  Spring Boot 3.5.7 + Java 21 + MyBatis-Flex 1.10.9         │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                       数据持久层                             │
│    MySQL 8.4.0 (主数据库 + 分布式锁 + 分布式ID)             │
│    Caffeine Cache (本地缓存: JWT + 用户详情 + ID批量)       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏃‍♂️ 快速开始

### 环境要求

- **Java 21+** (推荐使用OpenJDK或Oracle JDK 21 LTS)
- **Node.js 18+** (推荐使用LTS版本)
- **Maven 3.8+**
- **MySQL 8.4.0+**
- **Redis 6.0+** (可选，当前使用Caffeine本地缓存)
- **Git**

### 1. 克隆项目

```bash
git clone <repository-url>
cd SVT
```

### 2. 数据库初始化

```sql
-- 1. 创建数据库（推荐命名为 svt_db）
CREATE DATABASE svt_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. 执行DDL脚本（创建表结构）
-- SVT-Server/src/main/resources/db/init/ddl.sql

-- 3. 执行DML脚本（初始化数据）
-- SVT-Server/src/main/resources/db/init/dml.sql
```

### 3. 环境变量配置

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

⚠️ **重要**:
- `SM4_ENCRYPTION_KEY`: 用于配置文件加密（使用SM4国密算法）
- `SVT_AES_KEY`: 必须是32字符长度，用于API请求/响应加密
- 生产环境请使用强密码和随机密钥，建议定期轮换

### 4. 后端配置

编辑 `SVT-Server/src/main/resources/application-dev.yml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/svt_db?useSSL=false&serverTimezone=Asia/Shanghai
    username: your_username
    password: SM4@encrypted(your_encrypted_password)  # 使用SM4加密

  # Redis配置（可选）
  data:
    redis:
      host: localhost
      port: 6379
      password: your_redis_password

svt:
  jwt:
    secret: your_jwt_secret_key
    expiration: 1800000  # 30分钟
    activity-cycle-seconds: 600  # 活跃度周期10分钟
    activity-renewal-threshold: 20  # 续期阈值20%
```

### 5. 后端启动

```bash
cd SVT-Server
mvn clean install
mvn spring-boot:run
```

启动成功后:
- **API接口**: `http://localhost:8080/api`
- **API文档**: `http://localhost:8080/doc.html`

### 6. 前端配置

编辑 `SVT-Web/.env.development`:

```bash
# API地址
VITE_API_BASE_URL=http://localhost:8080

# AES密钥（必须与后端一致）
VITE_AES_KEY=your_32_char_aes_key_1234567890123456

# 调试模式
VITE_DEBUG_MODE=true
```

### 7. 前端启动

```bash
cd SVT-Web
npm install
npm run dev
```

访问: `http://localhost:5173`

### 8. 默认登录账户

- **用户名**: admin
- **密码**: 请查看 `SVT-Server/src/main/resources/db/init/dml.sql` 中的初始密码

---

## 📖 架构文档

我们提供了完整的架构文档，帮助您快速理解系统设计和实现细节。

### 📚 主要文档

| 文档 | 说明 | 适合人群 |
|------|------|----------|
| **[完整架构文档](docs/architecture.md)** | 11章节完整系统架构（1471行） | 架构师、技术负责人 |
| **[技术栈文档](docs/architecture/tech-stack.md)** | 技术选型和版本说明（600行） | 所有开发人员 |
| **[编码标准文档](docs/architecture/coding-standards.md)** | Java和TypeScript编码规范（1104行） | 所有开发人员 |
| **[源码树文档](docs/architecture/source-tree.md)** | 完整源码结构导航（719行） | 新团队成员 |

### 📑 文档导航

**新人入门推荐阅读顺序**:
1. `docs/architecture.md` (第一章：项目概述)
2. `docs/architecture/tech-stack.md` (第一、二、三章)
3. `docs/architecture/source-tree.md` (完整阅读)
4. `docs/architecture/coding-standards.md` (根据技术栈选择章节)

**开发人员推荐阅读**:
1. `docs/architecture/coding-standards.md` (第二、三章：后端/前端规范)
2. `docs/architecture/source-tree.md` (第七、八章：关键路径)
3. `docs/architecture.md` (第三、四章：后端/前端架构)

**架构设计推荐阅读**:
1. `docs/architecture.md` (完整阅读11章节)
2. `docs/architecture/tech-stack.md` (第八、九章：技术选型原则)
3. `docs/architecture.md` (第九、十章：技术债务和未来规划)

### 🔍 关键架构亮点

详见 `docs/architecture.md`:

- **后端架构** (第三章): JWT九步验证、数据库分布式锁、分布式ID生成、AOP切面
- **前端架构** (第四章): 模块化Layout系统、智能Tab管理、O(1)权限检查、动态路由
- **安全架构** (第五章): 三层加密体系、JWT智能续期、Argon2密码哈希
- **数据架构** (第六章): 分布式ID设计、分布式锁设计、标准字段规范
- **性能优化** (第八章): 数据库优化、缓存优化、代码分割、React优化

---

## 🔧 开发指南

### 后端开发

#### 1. 创建实体类

```java
@Table(value = "user_info", comment = "用户表",
       onInsert = FlexInsertListener.class,
       onUpdate = FlexUpdateListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserInfo implements Serializable {

    @DistributedId(prefix = "U")  // 自动生成分布式ID: U20250617000001
    @Column(value = "user_id", comment = "用户ID")
    private String userId;

    @Column(value = "user_name", comment = "用户名")
    private String userName;

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

#### 2. 创建Controller

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

#### 3. 使用分布式锁

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

### 前端开发

#### 1. 创建组件

```typescript
interface UserListProps {
  users: User[];
  loading?: boolean;
  onUserClick?: (user: User) => void;
}

const UserList: React.FC<UserListProps> = ({ users, loading, onUserClick }) => {
  // 1. Hooks
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // 2. 事件处理函数（使用useCallback优化）
  const handleUserClick = useCallback((user: User) => {
    setSelectedUser(user);
    onUserClick?.(user);
  }, [onUserClick]);

  // 3. 计算值（使用useMemo优化）
  const activeUsers = useMemo(() =>
    users.filter(user => user.status === 'active'),
    [users]
  );

  // 4. 条件渲染
  if (loading) return <Spin size="large" />;
  if (users.length === 0) return <Empty description="暂无用户数据" />;

  // 5. 主渲染
  return (
    <div className="user-list">
      {activeUsers.map(user => (
        <UserCard key={user.id} user={user} onClick={handleUserClick} />
      ))}
    </div>
  );
};
```

#### 2. 创建状态管理

```typescript
interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      isAuthenticated: false,
      loading: false,

      login: async (credentials) => {
        set({ loading: true });
        try {
          const { accessToken } = await authApi.login(credentials);
          set({ token: accessToken, isAuthenticated: true });
          tokenManager.start();
        } finally {
          set({ loading: false });
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } finally {
          set({ token: null, isAuthenticated: false });
          tokenManager.stop();
        }
      }
    }),
    { name: 'auth-storage' }
  )
);
```

#### 3. API调用

```typescript
export const userApi = {
  getUserList: (params: UserQueryParams): Promise<User[]> => {
    return request.post<User[]>('/system/user/list', params);
  },

  createUser: (user: CreateUserRequest): Promise<string> => {
    return request.post<string>('/system/user/create', user);
  }
};
```

---

## 📁 项目结构

详细的项目结构请参考 [`docs/architecture/source-tree.md`](docs/architecture/source-tree.md)。

### 后端结构概览

```
SVT-Server/src/main/java/com/seventeen/svt/
├── common/                      # 通用层
│   ├── annotation/              # 自定义注解
│   ├── config/                  # 配置类
│   ├── filter/                  # 过滤器
│   └── util/                    # 工具类
├── frame/                       # 框架层
│   ├── aspect/                  # AOP切面
│   ├── cache/                   # 缓存管理
│   ├── security/                # 安全框架
│   ├── lock/                    # 分布式锁
│   └── dbkey/                   # 分布式ID
└── modules/                     # 业务模块
    └── system/                  # 系统管理
        ├── controller/          # 控制器层
        ├── service/             # 业务逻辑层
        ├── entity/              # 实体类
        ├── dto/                 # 数据传输对象
        └── mapper/              # 数据访问层
```

### 前端结构概览

```
SVT-Web/src/
├── api/                         # API服务层
├── components/                  # 公共组件
│   ├── Layout/                  # 布局系统
│   │   ├── core/                # LayoutProvider + LayoutStructure
│   │   └── modules/             # Header + Sidebar + TabSystem
│   └── DynamicPage/             # 动态页面加载
├── pages/                       # 页面组件
├── stores/                      # 状态管理 (Zustand)
├── hooks/                       # 自定义Hooks
├── utils/                       # 工具函数
├── router/                      # 路由配置
└── types/                       # TypeScript类型定义
```

---

## 📦 构建部署

### 开发环境构建

```bash
# 后端构建
cd SVT-Server
mvn clean install

# 前端构建 - 开发环境
cd SVT-Web
npm run build:dev
```

### 生产环境构建

```bash
# 后端打包
cd SVT-Server
mvn clean package -Dmaven.test.skip=true

# 前端打包 - 生产环境
cd SVT-Web
npm run build:prod
```

### Docker部署（推荐）

```yaml
# docker-compose.yml
version: '3.8'

services:
  svt-server:
    image: svt-server:1.0.0
    container_name: svt-server
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - SM4_ENCRYPTION_KEY=${SM4_KEY}
      - SVT_AES_KEY=${AES_KEY}
    depends_on:
      - sqlserver
    networks:
      - svt-network

  svt-web:
    image: svt-web:1.0.0
    container_name: svt-web
    ports:
      - "80:80"
    networks:
      - svt-network

  mysql:
    image: mysql:8.4.0
    container_name: svt-mysql
    ports:
      - "3306:3306"
    environment:
      - MYSQL_ROOT_PASSWORD=${DB_PASSWORD}
      - MYSQL_DATABASE=svt_db
    volumes:
      - mysql-data:/var/lib/mysql
    networks:
      - svt-network

volumes:
  mysql-data:

networks:
  svt-network:
    driver: bridge
```

### Nginx配置

```nginx
upstream svt-backend {
    ip_hash;  # Session Sticky: 基于IP的会话粘性
    server svt-server-1:8080;
    server svt-server-2:8080;
}

server {
    listen 80;
    server_name svt.example.com;

    # 前端静态资源
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }

    # API代理
    location /api/ {
        proxy_pass http://svt-backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
}
```

---

## 🤝 贡献指南

我们欢迎任何形式的贡献，包括但不限于：

- 🐛 Bug修复
- ✨ 新功能开发
- 📝 文档完善
- 🎨 UI/UX改进
- ⚡ 性能优化

### 提交流程

1. Fork本仓库
2. 创建特性分支: `git checkout -b feature/新功能`
3. 提交更改: `git commit -m 'feat: 添加新功能'`
4. 推送到分支: `git push origin feature/新功能`
5. 提交Pull Request

### 提交规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范:

- `feat:` 新功能
- `fix:` Bug修复
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 代码重构
- `perf:` 性能优化
- `test:` 测试相关
- `chore:` 构建/工具变动

### 代码规范

- **后端**: 遵循阿里巴巴Java开发手册
- **前端**: 遵循Airbnb TypeScript规范
- **测试**: 单元测试覆盖率 > 80%

---

## 🔄 更新日志

### v1.0.1-SNAPSHOT (2025-11-17)

#### 🎉 新增特性
- ✅ **完整架构文档**: 创建4份专业级架构文档（3947行）
  - `docs/architecture.md` - 主架构文档（1471行）
  - `docs/architecture/tech-stack.md` - 技术栈文档（600行）
  - `docs/architecture/coding-standards.md` - 编码标准（1104行）
  - `docs/architecture/source-tree.md` - 源码树结构（719行）

#### 🔒 安全增强
- ✅ **SM4国密算法**: 实施SM4配置文件加密，替代Jasypt
- ✅ **JWT九步验证**: 完善JWT安全检查流程
- ✅ **Argon2密码哈希**: 配置参数（16字节盐，32字节哈希，64MB内存，3次迭代）

#### 🔧 架构优化
- ✅ **数据库分布式锁**: 基于主键唯一性实现，智能重试机制
- ✅ **分布式ID生成**: 前缀+日期+序号+字母扩展，批量预分配
- ✅ **本地缓存策略**: Caffeine替代Redis，配合Session Sticky

#### ⚡ 性能提升
- ✅ **O(1)权限检查**: 使用Set索引优化，性能提升100x+
- ✅ **防重复API调用**: 修复页面导航时的重复请求问题
- ✅ **代码分割优化**: Bundle大小减少39%（850KB → 520KB）
- ✅ **首屏加载优化**: 加载时间减少52%（2.5s → 1.2s）

#### 🎯 用户体验
- ✅ **统一会话管理**: 修复重复登录提示问题
- ✅ **智能Tab系统**: 多Tab管理 + 上下文菜单 + 持久化
- ✅ **简化认证流程**: 移除"记住我"功能，增强安全性
- ✅ **全局验证状态**: 防止重复用户状态验证调用

#### 🐛 错误修复
- ✅ 解决React Hooks生命周期错误
- ✅ 增强错误边界处理
- ✅ 修复组件重挂载问题
- ✅ 统一前后端会话常量

#### 📋 文档更新
- ✅ 创建完整的Brownfield架构文档（记录实际系统状态）
- ✅ 详细的技术选型说明和架构决策记录
- ✅ 完善的编码规范和开发指南
- ✅ 清晰的源码导航和关键路径索引

### 技术亮点

**后端核心特性**:
- 🔐 JWT智能续期（基于用户活跃度，活跃度周期10分钟）
- 🔒 三层加密体系（AES-256 + SM4 + Argon2）
- 🔑 数据库分布式锁（智能重试 + 自动清理）
- 🆔 分布式ID生成（日期重置 + 字母扩展）
- ⚡ 本地缓存优先（Caffeine + Session Sticky）
- 🎯 注解驱动开发（@Audit + @RequiresPermission + @AutoTransaction）

**前端核心特性**:
- 🏗️ 模块化Layout系统（Provider + Structure + Modules）
- 🔐 四层安全防护（Auth → Role → Status → Permission）
- ⚡ O(1)权限检查（Set索引 + useMemo缓存）
- 📑 智能Tab系统（多Tab + 上下文菜单 + 持久化）
- 🎨 动态路由加载（基于菜单树 + 懒加载）
- 💾 分离状态管理（authStore + userStore + useAuth）

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

## 📞 联系方式

- **问题反馈**: [GitHub Issues](issues)
- **功能建议**: [GitHub Discussions](discussions)
- **技术交流**: 欢迎Star和Fork本项目

---

## 🙏 致谢

感谢所有为本项目做出贡献的开发者！

---

<div align="center">

**项目状态**: ✅ 生产就绪
**最后更新**: 2025-11-17
**版本**: v1.0.1-SNAPSHOT
**维护团队**: SVT开发团队

**[⬆ 回到顶部](#svt-seventeen-企业级管理系统)**

</div>
