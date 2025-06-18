# SVT (Secure Vision Tesseract) 项目

## 📋 项目概述

SVT是一个采用现代化前后端分离架构的企业级Web应用系统，集成了完整的安全加密体系和权限管理功能。

### 🏗️ 系统架构

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   SVT-Web       │    │   AES加密通道     │    │  SVT-Server     │
│  (React 19)     │◄──►│  (端到端加密)     │◄──►│ (Spring Boot)   │
│                 │    │                  │    │                 │
│ • React Router  │    │ • AES-256-CBC    │    │ • Spring Security│
│ • Ant Design    │    │ • 调试模式支持    │    │ • Mybatis-Flex  │
│ • Zustand       │    │ • CORS配置       │    │ • Redis缓存     │
│ • CryptoJS      │    │ • 时间戳防重放    │    │ • Argon2哈希    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### 🔒 核心安全特性

#### 1. AES-256-CBC端到端加密
- **完整的API加密**: 请求响应数据全程加密传输
- **调试模式支持**: 开发环境可选择明文传输，便于调试
- **智能配置检测**: 前端自动检测密钥配置，智能启用加密
- **CORS头部支持**: 自动暴露`X-Encrypted`加密标识头
- **时间戳防重放**: 10分钟容差保护，防止重放攻击
- **数据大小限制**: 10MB传输限制，防止滥用

#### 2. 配置文件加密 (Jasypt)
- **敏感信息保护**: 数据库密码、JWT密钥等使用AES-256加密
- **环境变量管理**: 通过`JASYPT_ENCRYPTOR_PASSWORD`统一管理
- **多环境支持**: 开发、UAT、生产环境独立加密配置

#### 3. 密码安全 (Argon2)
- **现代哈希算法**: 替代传统MD5/SHA，抗彩虹表攻击
- **自适应成本**: 可调节计算复杂度，应对硬件发展
- **盐值保护**: 每个密码使用独立随机盐值

#### 4. JWT认证体系
- **无状态认证**: 支持分布式部署
- **令牌刷新**: 自动续期机制
- **权限集成**: 与RBAC权限系统深度集成

### 📁 项目结构

```
SVT/
├── README.md                    # 项目总览（本文件）
├── SVT-Server/                  # 后端服务
│   ├── README.md               # 后端详细文档
│   ├── docs/                   # 技术文档
│   │   ├── API-Encryption-AES.md
│   │   ├── Argon2-Password-Hashing.md
│   │   ├── Jasypt-Configuration-Encryption.md
│   │   └── Authentication-and-Security.md
│   └── src/                    # 源代码
├── SVT-Web/                    # 前端应用
│   ├── README.md               # 前端详细文档
│   ├── docs/                   # 前端文档
│   └── src/                    # 源代码
└── project_document/           # 项目文档
    ├── architecture/           # 架构设计文档
    └── *.md                   # 各类项目文档
```

### 🚀 快速开始

#### 环境要求
- **后端**: Java 17+, Maven 3.6+, SQL Server, Redis
- **前端**: Node.js 18+, npm 8+
- **环境变量**: `JASYPT_ENCRYPTOR_PASSWORD` (配置文件解密)

#### 启动步骤

1. **配置环境变量**
   ```bash
   # 必需：Jasypt配置文件解密密钥
   export JASYPT_ENCRYPTOR_PASSWORD=your-jasypt-password
   ```

2. **启动后端服务**
   ```bash
   cd SVT-Server
   mvn spring-boot:run
   # 默认端口: 8080
   ```

3. **启动前端应用**
   ```bash
   cd SVT-Web
   npm install
   npm run dev        # 开发环境
   npm run dev:uat    # UAT环境
   npm run dev:prod   # 生产配置测试
   # 默认端口: 5173
   ```

### 🔧 AES加密配置

#### 后端配置 (application-dev.yml)
```yaml
svt:
  security:
    aes:
      enabled: true           # 启用AES加密
      debug: true             # 调试模式（开发环境）
      key: ENC(...)          # Jasypt加密的AES密钥
```

#### 前端配置 (.env.development)
```bash
VITE_AES_ENABLED=false        # 开发环境可禁用加密
VITE_AES_KEY=your-aes-key     # AES密钥（与后端一致）
```

### 🌍 多环境支持

| 环境 | 后端端口 | AES加密 | 调试模式 | 配置文件 |
|------|----------|---------|----------|----------|
| **开发** | 8080 | 可选 | 启用 | application-dev.yml |
| **UAT** | 8080 | 启用 | 禁用 | application-uat.yml |
| **生产** | 8080 | 启用 | 禁用 | application-prod.yml |

### 📚 详细文档导航

#### 🔙 后端文档
- **[后端开发指南](./SVT-Server/README.md)** - 完整的后端开发文档
- **[AES加密实现](./SVT-Server/docs/API-Encryption-AES.md)** - 后端加密详细设计
- **[Argon2密码哈希](./SVT-Server/docs/Argon2-Password-Hashing.md)** - 密码安全实现
- **[Jasypt配置加密](./SVT-Server/docs/Jasypt-Configuration-Encryption.md)** - 配置文件保护

#### 🔜 前端文档
- **[前端开发指南](./SVT-Web/README.md)** - 完整的前端开发文档
- **[AES加密配置](./SVT-Web/docs/AES加密配置说明.md)** - 前端加密配置
- **[环境配置指南](./SVT-Web/docs/环境配置快速指南.md)** - 多环境配置

#### 📋 项目文档
- **[架构设计](./project_document/architecture/)** - 系统架构文档
- **[项目状态](./project_document/)** - 项目进展和状态

### ⚡ 性能特性

- **前端**: Vite构建，React 19并发特性，代码分割
- **后端**: 连接池优化，Redis缓存，异步处理
- **加密**: 硬件加速AES，密钥缓存，批量处理
- **数据库**: MyBatis-Flex动态SQL，连接池优化

### 🛡️ 安全特性

- **传输安全**: HTTPS + AES-256端到端加密
- **存储安全**: Argon2密码哈希 + Jasypt配置加密
- **访问控制**: JWT + RBAC权限管理
- **攻击防护**: 时间戳防重放，数据大小限制，SQL注入防护

### 🔍 监控与调试

- **开发工具**: Swagger UI, Knife4j, 浏览器DevTools
- **日志系统**: Log4j2分级日志，敏感信息脱敏
- **调试模式**: AES加密可选，详细错误信息
- **性能监控**: Druid数据库监控，JVM指标

### 🤝 开发规范

- **代码风格**: ESLint + Prettier (前端), Checkstyle (后端)
- **提交规范**: Conventional Commits
- **分支策略**: Git Flow
- **文档更新**: 代码变更同步更新文档

### 📞 技术支持

- **问题反馈**: 通过项目Issue提交
- **技术讨论**: 查看项目文档和代码注释
- **安全问题**: 私密报告安全漏洞

---

**最后更新**: 2025-06-18 18:58:17 +08:00  
**版本**: v1.0.0  
**作者**: SEVENTEEN & Development Team 