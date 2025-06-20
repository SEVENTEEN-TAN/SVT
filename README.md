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

#### 5. 敏感数据脱敏 (v3.0)
- **统一配置开关**: 支持环境差异化控制（dev关闭/prod启用）
- **多格式支持**: String/Number/Collection/Map等数据类型脱敏
- **注解驱动**: 基于@SensitiveLog注解的精确字段级控制
- **7种脱敏策略**: DEFAULT(保留首尾)/PHONE/PASSWORD/EMAIL/ID_CARD/BANK_CARD/NAME
- **JSON字符串脱敏**: 自动处理请求体中的敏感信息
- **审计日志保护**: 数据库审计记录自动脱敏存储
- **兜底机制**: 未匹配策略自动使用DEFAULT策略确保安全

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

### 🔧 安全配置

#### 后端配置 (application-dev.yml)
```yaml
svt:
  security:
    # AES加密配置
    aes:
      enabled: true           # 启用AES加密
      debug: true             # 调试模式（开发环境）
      key: ENC(...)          # Jasypt加密的AES密钥
    # 敏感数据脱敏配置 (v3.0)
    sensitive:
      enabled: false          # 开发环境关闭脱敏，便于调试
```

#### 前端配置 (.env.development)
```bash
# AES加密配置
VITE_AES_ENABLED=false        # 开发环境可禁用加密
VITE_AES_KEY=your-aes-key     # AES密钥（与后端一致）
```

### 🛡️ 敏感数据脱敏配置 (v3.0)

#### 实体类配置示例
```java
@Entity
public class UserInfo {
    @SensitiveLog(strategy = SensitiveStrategy.DEFAULT)
    private String userId;          // ID类字段: 保留首尾
    
    @SensitiveLog(strategy = SensitiveStrategy.PHONE)
    private String loginId;         // 手机号: 138****5678
    
    @SensitiveLog(strategy = SensitiveStrategy.PASSWORD)
    private String password;        // 密码: ********
    
    @SensitiveLog(strategy = SensitiveStrategy.NAME)
    private String userNameZh;      // 姓名: 张**
    
    @SensitiveLog(strategy = SensitiveStrategy.EMAIL)
    private String email;           // 邮箱: te***@example.com
}
```

#### 支持的脱敏策略
| 策略 | 适用场景 | 脱敏效果 | 示例 |
|------|----------|----------|------|
| `DEFAULT` | ID、Key等通用字段 | 保留首尾字符 | `user123456` → `us****56` |
| `PHONE` | 手机号码 | 保留前3后4位 | `13812345678` → `138****5678` |
| `PASSWORD` | 密码字段 | 完全隐藏 | `password123` → `********` |
| `EMAIL` | 邮箱地址 | 保留首字符和域名 | `test@example.com` → `te***@example.com` |
| `ID_CARD` | 身份证号 | 保留前6后4位 | `110101199001011234` → `110101********1234` |
| `BANK_CARD` | 银行卡号 | 保留前4后4位 | `6222021234567890` → `6222********7890` |
| `NAME` | 真实姓名 | 保留姓氏 | `张三丰` → `张**` |

### 🌍 多环境支持

| 环境 | 后端端口 | AES加密 | 调试模式 | 数据脱敏 | 配置文件 |
|------|----------|---------|----------|----------|----------|
| **开发** | 8080 | 可选 | 启用 | 禁用 | application-dev.yml |
| **UAT** | 8080 | 启用 | 禁用 | 启用 | application-uat.yml |
| **生产** | 8080 | 启用 | 禁用 | 启用 | application-prod.yml |

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
- **[日志脱敏方案](./project_document/SVT_日志脱敏方案_2025-06-18.md)** - 敏感数据脱敏实施方案

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
- **数据脱敏**: 敏感信息自动脱敏，支持日志和审计记录保护

### 🔍 监控与调试

- **开发工具**: Swagger UI, Knife4j, 浏览器DevTools
- **日志系统**: Log4j2分级日志，敏感信息脱敏 (v3.0增强)
- **调试模式**: AES加密可选，脱敏功能可选，详细错误信息
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

## 🔄 最新更新

### v3.0 敏感数据脱敏方案 (2025-06-19~2025-06-20)
- ✅ **统一配置开关**: 新增`SensitiveConfig`配置类，支持环境差异化控制
- ✅ **多格式脱敏**: 扩展`SensitiveUtil`支持Number/Collection/Map等数据类型
- ✅ **JSON字符串脱敏**: 新增`desensitizeJsonString`方法处理请求体脱敏
- ✅ **实体类注解**: 为UserInfo/OrgInfo等关键实体添加@SensitiveLog注解
- ✅ **安全风险修复**: 修复RequestLogUtils中的敏感信息泄露问题
- ✅ **环境配置**: dev环境关闭脱敏便于调试，prod环境强制脱敏保护数据
- 🔧 **[2025-06-20] 脱敏策略修复**: 添加`SensitiveStrategy.DEFAULT`策略，修复编译错误
- 🔧 **[2025-06-20] 兜底机制**: 完善未匹配策略的默认处理逻辑，确保数据安全

#### 脱敏效果示例
```java
// 实体类配置
@SensitiveLog(strategy = SensitiveStrategy.DEFAULT)
private String userId;          // "user123456" → "us****56"

@SensitiveLog(strategy = SensitiveStrategy.PHONE)
private String loginId;         // "13812345678" → "138****5678"

@SensitiveLog(strategy = SensitiveStrategy.PASSWORD)
private String password;        // "password123" → "********"

@SensitiveLog(strategy = SensitiveStrategy.NAME)
private String userNameZh;      // "张三丰" → "张**"
```

#### 验证步骤
```bash
# 1. 编译验证
cd SVT-Server && mvn clean compile

# 2. 开发环境测试 (脱敏关闭)
mvn spring-boot:run -Dspring.profiles.active=dev
# 日志应显示: "⚠️ 敏感数据脱敏功能已禁用"

# 3. 生产环境测试 (脱敏启用)  
mvn spring-boot:run -Dspring.profiles.active=prod
# 日志应显示: "✅ 敏感数据脱敏功能已启用"
```

---

**最后更新**: 2025-06-19 17:48:40 +08:00  
**版本**: v3.0 (敏感数据脱敏)  
**作者**: SEVENTEEN & Development Team 