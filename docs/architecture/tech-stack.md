# SVT 技术栈文档

## 文档版本

| 版本 | 日期 | 作者 | 说明 |
|------|------|------|------|
| 1.0.0 | 2025-11-17 | Winston (Architect) | 初始版本 |

---

## 一、技术栈概览

SVT (Seventeen) 是一个企业级风险管理系统，采用前后端分离架构，基于现代化技术栈构建。

### 架构模式

```
┌─────────────────────────────────────────────────────────┐
│                   客户端层 (Client)                      │
│              React 19.1.0 + TypeScript 5.8.3            │
│                   Ant Design 5.25.4                     │
└─────────────────────────────────────────────────────────┘
                            │
                   HTTPS + AES-256 加密
                            │
┌─────────────────────────────────────────────────────────┐
│                   API 网关 (Gateway)                     │
│              Nginx 反向代理 + 负载均衡                   │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│                  应用服务层 (Backend)                    │
│         Spring Boot 3.5.7 + Java 21 + MyBatis-Flex      │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│                   数据持久层 (Database)                  │
│              SQL Server 2019+ + Redis (可选)            │
└─────────────────────────────────────────────────────────┘
```

---

## 二、后端技术栈 (SVT-Server)

### 2.1 核心框架

| 技术 | 版本 | 用途 | 说明 |
|------|------|------|------|
| **Spring Boot** | 3.5.7 | 应用框架 | 企业级Java应用框架，提供自动配置和快速开发能力 |
| **Java** | 21 | 编程语言 | LTS版本，支持虚拟线程、模式匹配等现代特性 |
| **Maven** | 3.x | 构建工具 | 依赖管理和项目构建 |

### 2.2 数据访问层

| 技术 | 版本 | 用途 | 说明 |
|------|------|------|------|
| **MyBatis-Flex** | 1.10.9 | ORM 框架 | 轻量级 MyBatis 增强框架，提供灵活的查询构建器 |
| **SQL Server JDBC** | 12.8.1.jre11 | 数据库驱动 | Microsoft SQL Server 连接驱动 |
| **Druid** | 1.2.24 | 连接池 | 阿里巴巴高性能数据库连接池，支持监控和SQL分析 |

**选型理由：**
- ✅ **MyBatis-Flex**: 相比传统MyBatis，提供类型安全的查询API，减少XML配置
- ✅ **Druid**: 强大的监控功能，支持SQL执行统计和慢查询分析

### 2.3 缓存方案

| 技术 | 版本 | 用途 | 说明 |
|------|------|------|------|
| **Caffeine** | 3.1.8 | 本地缓存 | 高性能Java本地缓存库，基于W-TinyLFU算法 |

**架构决策：**
- ✅ **本地缓存优先**: 使用 Caffeine 替代 Redis，简化部署架构
- ✅ **Session Sticky**: 配合负载均衡的会话粘性，确保用户请求路由到同一实例
- ✅ **重启策略**: 服务重启后缓存丢失，用户需要重新登录（安全设计）

**缓存策略：**
```java
// JWT Token 缓存配置
Caffeine.newBuilder()
    .maximumSize(1000)              // 最多缓存1000个Token
    .expireAfterWrite(30, MINUTES)  // 30分钟后过期
    .recordStats()                  // 记录统计信息
    .build();
```

### 2.4 安全框架

| 技术 | 版本 | 用途 | 说明 |
|------|------|------|------|
| **Spring Security** | 6.x (Spring Boot 3.5.7内置) | 安全框架 | 认证和授权框架 |
| **JJWT** | 0.11.5 | JWT 实现 | JSON Web Token 生成和验证 |
| **BouncyCastle** | 1.69 | 加密库 | 提供SM4、Argon2等加密算法 |

**安全架构：**

1. **API 加密**: AES-256-CBC 模式
```
客户端请求 → AES加密 → 服务端解密 → 业务处理 → AES加密 → 客户端解密
```

2. **配置加密**: SM4 国密算法
```yaml
# application.yml
spring:
  datasource:
    password: SM4@encrypted(xxx)  # SM4加密密码
```

3. **密码哈希**: Argon2 算法
```java
// Argon2 参数配置
saltLength: 16 bytes
hashLength: 32 bytes
memory: 65536 KB (64MB)
iterations: 3
parallelism: 1
```

4. **JWT 智能续期**
```
活跃度周期: 600秒 (10分钟)
续期阈值: 20% (最后2分钟自动续期)
续期方式: 更新 lastActivityTime，无需生成新Token
```

### 2.5 API 文档

| 技术 | 版本 | 用途 | 说明 |
|------|------|------|------|
| **Knife4j** | 4.5.0 | API 文档 | 基于OpenAPI 3.0的文档工具，增强Swagger UI |
| **SpringDoc OpenAPI** | 2.6.0 | OpenAPI 支持 | Spring Boot 3.x 的 OpenAPI 集成 |

**访问地址：**
- 开发环境: http://localhost:8080/doc.html
- 生产环境: 通过配置关闭

### 2.6 工具库

| 技术 | 版本 | 用途 | 说明 |
|------|------|------|------|
| **Hutool** | 5.8.16 | Java 工具类 | 全面的Java工具类库，简化常见操作 |
| **Guava** | 32.1.3-jre | Google 工具库 | 集合、缓存、并发等工具类 |
| **Lombok** | 1.18.34 | 代码简化 | 通过注解自动生成getter/setter/builder等 |

### 2.7 日志框架

| 技术 | 版本 | 用途 | 说明 |
|------|------|------|------|
| **Log4j2** | 2.x (Spring Boot内置) | 日志框架 | 高性能异步日志框架 |
| **Disruptor** | 3.4.4 | 异步日志 | 高性能异步日志队列，提升日志性能 |

**日志配置：**
```xml
<!-- log4j2-spring.xml -->
<Configuration>
  <Appenders>
    <!-- 异步日志 -->
    <Async name="AsyncFile">
      <AppenderRef ref="RollingFile"/>
    </Async>
  </Appenders>
</Configuration>
```

### 2.8 测试框架

| 技术 | 版本 | 用途 | 说明 |
|------|------|------|------|
| **JUnit 5** | 5.x (Spring Boot内置) | 单元测试 | Java标准测试框架 |
| **Spring Boot Test** | 3.5.7 | 集成测试 | Spring Boot测试支持 |
| **Mockito** | 内置 | Mock 框架 | 模拟对象框架 |

---

## 三、前端技术栈 (SVT-Web)

### 3.1 核心框架

| 技术 | 版本 | 用途 | 说明 |
|------|------|------|------|
| **React** | 19.1.0 | UI 框架 | 最新版本，支持并发特性和自动批处理 |
| **TypeScript** | 5.8.3 | 编程语言 | 严格类型检查，100%类型覆盖 |
| **Vite** | 6.3.5 | 构建工具 | 闪电般的HMR和构建速度，基于ESM |

**选型理由：**
- ✅ **React 19**: 最新稳定版，性能和开发体验最佳
- ✅ **TypeScript**: 提供类型安全，减少运行时错误
- ✅ **Vite**: 比Webpack快10-100倍的HMR，开发体验极佳

### 3.2 UI 组件库

| 技术 | 版本 | 用途 | 说明 |
|------|------|------|------|
| **Ant Design** | 5.25.4 | 组件库 | 企业级React组件库，开箱即用 |
| **Ant Design Icons** | 5.6.1 | 图标库 | Ant Design 配套图标库 |
| **UnoCSS** | 66.3.2 | 原子化CSS | 即时按需的原子化CSS引擎 |

**UnoCSS 配置：**
```typescript
// uno.config.ts
export default defineConfig({
  presets: [presetUno()],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup()
  ]
});
```

### 3.3 状态管理

| 技术 | 版本 | 用途 | 说明 |
|------|------|------|------|
| **Zustand** | 5.0.5 | 全局状态 | 轻量级状态管理，无Redux样板代码 |
| **TanStack React Query** | 5.80.6 | 服务端状态 | 强大的异步状态管理和缓存 |

**状态管理架构：**
```
全局状态 (Zustand)
├── authStore.ts       - 认证状态 (token, isAuthenticated)
├── userStore.ts       - 用户信息 (user, session)
└── useAuth.ts         - 组合Hook (协调各Store)

服务端状态 (React Query)
├── 自动缓存
├── 自动重新获取
├── 乐观更新
└── 后台同步
```

### 3.4 路由

| 技术 | 版本 | 用途 | 说明 |
|------|------|------|------|
| **React Router DOM** | 7.6.2 | 路由管理 | 声明式路由，支持嵌套路由和数据加载 |

**路由架构：**
```typescript
// 四层安全防护
<Route path="/" element={<ProtectedRoute />}>
  <Route element={<BasicLayout />}>
    <Route path="home" element={<HomePage />} />
    <Route path="*" element={<DynamicPage />} />  // 动态路由
  </Route>
</Route>
```

### 3.5 网络请求

| 技术 | 版本 | 用途 | 说明 |
|------|------|------|------|
| **Axios** | 1.9.0 | HTTP 客户端 | 基于Promise的HTTP库，支持拦截器 |
| **Crypto-JS** | 4.2.0 | 加密库 | AES-256加密/解密 |

**请求流程：**
```
发起请求
  ↓
请求拦截器
  ├─ Token注入
  ├─ AES加密请求体
  └─ 添加请求头
  ↓
服务端处理
  ↓
响应拦截器
  ├─ AES解密响应
  ├─ 会话状态处理
  └─ 统一错误处理
  ↓
返回数据
```

### 3.6 表单管理

| 技术 | 版本 | 用途 | 说明 |
|------|------|------|------|
| **React Hook Form** | 7.57.0 | 表单管理 | 高性能表单库，减少重新渲染 |
| **Zod** | 3.25.57 | 运行时验证 | TypeScript优先的schema验证库 |

**表单验证示例：**
```typescript
const schema = z.object({
  loginId: z.string().min(1, '请输入登录ID'),
  password: z.string().min(6, '密码至少6位')
});

const { register, handleSubmit } = useForm({
  resolver: zodResolver(schema)
});
```

### 3.7 拖拽系统

| 技术 | 版本 | 用途 | 说明 |
|------|------|------|------|
| **@dnd-kit/core** | 6.3.1 | 拖拽核心 | 现代拖拽工具包 |
| **@dnd-kit/sortable** | 10.0.0 | 排序支持 | 可排序列表组件 |

### 3.8 工具库

| 技术 | 版本 | 用途 | 说明 |
|------|------|------|------|
| **Day.js** | 1.11.13 | 日期处理 | 轻量级日期库，Moment.js替代品 |

---

## 四、数据库

### 4.1 主数据库

| 技术 | 版本 | 用途 | 说明 |
|------|------|------|------|
| **SQL Server** | 2019+ | 关系型数据库 | 微软企业级数据库 |

**数据库特性：**
- ✅ **事务支持**: ACID完整性保证
- ✅ **分布式锁**: 使用数据库主键唯一性实现分布式锁
- ✅ **分布式ID**: 基于数据库表实现分布式ID生成
- ✅ **逻辑删除**: del_flag字段标记删除，数据不物理删除

### 4.2 缓存数据库 (可选)

| 技术 | 版本 | 用途 | 说明 |
|------|------|------|------|
| **Redis** | 可选 | 缓存/队列 | 当前架构使用Caffeine本地缓存，Redis为可选扩展 |

**设计决策：**
- ✅ **简化部署**: 初期使用Caffeine本地缓存，减少外部依赖
- ✅ **按需扩展**: 当并发量增大时，可平滑切换到Redis分布式缓存

---

## 五、开发工具链

### 5.1 IDE

| 工具 | 用途 | 说明 |
|------|------|------|
| **IntelliJ IDEA** | 后端开发 | Java开发首选IDE |
| **Visual Studio Code** | 前端开发 | 轻量级编辑器，插件生态丰富 |

### 5.2 版本控制

| 工具 | 用途 | 说明 |
|------|------|------|
| **Git** | 版本控制 | 分布式版本控制系统 |
| **GitHub/GitLab** | 代码托管 | 代码仓库和协作平台 |

### 5.3 API 测试

| 工具 | 用途 | 说明 |
|------|------|------|
| **Knife4j** | API 文档和测试 | http://localhost:8080/doc.html |
| **Postman** | API 测试 | 强大的API测试工具 |

### 5.4 数据库工具

| 工具 | 用途 | 说明 |
|------|------|------|
| **SQL Server Management Studio** | 数据库管理 | 微软官方数据库管理工具 |
| **Azure Data Studio** | 跨平台数据库工具 | 轻量级SQL Server客户端 |

---

## 六、部署运维

### 6.1 容器化

| 技术 | 版本 | 用途 | 说明 |
|------|------|------|------|
| **Docker** | 最新 | 容器化 | 应用容器化部署 |
| **Docker Compose** | 最新 | 编排工具 | 多容器应用编排 |

**容器化架构：**
```yaml
services:
  svt-server:
    image: svt-server:1.0.0
    ports:
      - "8080:8080"

  svt-web:
    image: svt-web:1.0.0
    ports:
      - "80:80"

  sqlserver:
    image: mcr.microsoft.com/mssql/server:2019-latest
    ports:
      - "1433:1433"
```

### 6.2 反向代理

| 技术 | 版本 | 用途 | 说明 |
|------|------|------|------|
| **Nginx** | 最新 | 反向代理 | 前端静态资源服务 + API代理 |

**Nginx 配置：**
```nginx
# Session Sticky 负载均衡
upstream svt-backend {
    ip_hash;  # 基于IP的会话粘性
    server svt-server-1:8080;
    server svt-server-2:8080;
}

server {
    listen 80;

    # 前端静态资源
    location / {
        root /usr/share/nginx/html;
        try_files $uri /index.html;
    }

    # API 代理
    location /api/ {
        proxy_pass http://svt-backend;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 6.3 CI/CD

| 工具 | 用途 | 说明 |
|------|------|------|
| **Jenkins** | 持续集成 | 自动化构建和部署 |
| **GitHub Actions** | 持续集成 | GitHub原生CI/CD |

**CI/CD 流程：**
```
代码提交
  ↓
自动化测试
  ├─ 单元测试
  ├─ 集成测试
  └─ E2E测试
  ↓
构建镜像
  ├─ 后端: mvn package + docker build
  └─ 前端: npm run build + docker build
  ↓
部署到环境
  ├─ Dev (自动)
  ├─ UAT (手动批准)
  └─ Prod (手动批准)
```

---

## 七、开发环境配置

### 7.1 后端环境要求

```bash
# Java 21
java -version
# openjdk version "21.0.1"

# Maven 3.8+
mvn -version
# Apache Maven 3.8.6

# SQL Server 2019+
# Developer Edition (开发环境)
```

### 7.2 前端环境要求

```bash
# Node.js 18+
node -v
# v18.17.0

# npm 9+
npm -v
# 9.6.7

# 推荐使用 pnpm
npm install -g pnpm
```

### 7.3 环境变量配置

**后端 (.env 或 系统环境变量):**
```bash
# SM4 配置加密密钥
SM4_ENCRYPTION_KEY=your_sm4_key_32_chars_long_xxx

# API 加密密钥 (32字符)
SVT_AES_KEY=your_32_char_aes_key_1234567890123456

# 数据脱敏开关
SENSITIVE_ENABLED=true
```

**前端 (.env.development):**
```bash
# API 地址
VITE_API_BASE_URL=http://localhost:8080

# AES 密钥 (必须与后端一致)
VITE_AES_KEY=your_32_char_aes_key_1234567890123456

# 调试模式
VITE_DEBUG_MODE=true
```

---

## 八、技术选型原则

### 8.1 稳定性优先

- ✅ 选择成熟稳定的技术栈
- ✅ 优先选择LTS版本 (Java 21, Node.js 18+)
- ✅ 关键依赖使用经过生产验证的版本

### 8.2 性能优先

- ✅ 本地缓存优先 (Caffeine > Redis)
- ✅ 构建工具选择 (Vite > Webpack)
- ✅ ORM框架选择 (MyBatis-Flex > MyBatis-Plus)

### 8.3 安全优先

- ✅ 多层加密 (API: AES-256, 配置: SM4, 密码: Argon2)
- ✅ 最小权限原则
- ✅ 安全的默认配置

### 8.4 开发体验优先

- ✅ 类型安全 (TypeScript 100%覆盖)
- ✅ 热更新 (Vite HMR)
- ✅ 代码生成 (Lombok, MyBatis-Flex Processor)

---

## 九、版本升级计划

### 9.1 短期 (3-6个月)

| 升级项 | 当前版本 | 目标版本 | 优先级 |
|--------|----------|----------|--------|
| React | 19.1.0 | 最新 | P1 |
| Ant Design | 5.25.4 | 最新 | P2 |
| Spring Boot | 3.5.7 | 3.6.x | P2 |

### 9.2 中期 (6-12个月)

- 评估 Java 21 新特性使用情况
- 评估 React Query 升级到 v6
- 评估 Vite 6.x 性能改进

### 9.3 技术债务

| 问题 | 严重程度 | 解决方案 | 优先级 |
|------|----------|----------|--------|
| 缺少单元测试 | 高 | 补充测试覆盖率到80% | P0 |
| 缺少E2E测试 | 高 | 引入Playwright/Cypress | P0 |
| API层缺少重试机制 | 中 | 添加指数退避重试 | P1 |

---

## 十、参考资料

### 官方文档

- **Spring Boot**: https://spring.io/projects/spring-boot
- **React**: https://react.dev/
- **TypeScript**: https://www.typescriptlang.org/
- **Ant Design**: https://ant.design/
- **Vite**: https://vitejs.dev/
- **MyBatis-Flex**: https://mybatis-flex.com/

### 技术博客

- **Spring Boot 3.x 迁移指南**
- **React 19 新特性解读**
- **Vite 6.x 性能优化**
- **企业级安全加密实践**

---

## 更新日志

| 日期 | 版本 | 更新内容 | 作者 |
|------|------|----------|------|
| 2025-11-17 | 1.0.0 | 初始版本，完整技术栈文档 | Winston (Architect) |

---

**文档维护**: 本文档应在每次技术栈重大升级时更新
**最后更新**: 2025-11-17
**负责人**: Winston (System Architect)
