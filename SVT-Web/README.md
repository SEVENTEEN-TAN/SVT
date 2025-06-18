# SVT 前端应用 (SVT-Web)

本文档是SVT前端应用的开发者指南，旨在帮助开发人员快速理解项目架构、技术栈、开发流程和编码规范。

## 1. 快速开始

### 1.1 环境要求
- Node.js 18+
- pnpm (推荐) 或 npm/yarn

### 1.2 安装依赖
在项目根目录下执行：
```bash
pnpm install
# 或
npm install
```

### 1.3 环境配置

#### 1.3.1 环境文件说明

项目包含以下环境配置文件：

| 文件名 | 用途 | 加载时机 |
|--------|------|----------|
| `.env.development` | 开发环境 | `npm run dev` 时自动加载 |
| `.env.uat` | UAT测试环境 | `npm run dev:uat` 时加载 |
| `.env.production` | 生产环境 | `npm run build` 时自动加载 |
| `.env.local` | 本地覆盖配置 | 所有环境都会加载（优先级最高）|

#### 1.3.2 环境变量详解

每个环境文件包含以下配置项：

```env
# ================================
# 📱 应用基本信息
# ================================
VITE_APP_TITLE=SVT 管理系统                    # 应用标题，显示在浏览器标签页
VITE_APP_DESCRIPTION=一个现代化、高效、可靠的企业级解决方案...  # 应用描述，用于SEO
VITE_APP_VERSION=1.0.0                        # 应用版本号
VITE_APP_ENV=development                      # 环境标识

# ================================
# 🌐 后端API配置
# ================================
VITE_API_BASE_URL=http://localhost:8080/api   # 后端API基础URL
VITE_API_TIMEOUT=10000                        # API请求超时时间（毫秒）

# ================================
# 👥 管理员联系信息
# ================================
VITE_ADMIN_EMAIL=admin@svt.com                # 管理员邮箱
VITE_ADMIN_PHONE=                            # 管理员电话（可选）
VITE_SUPPORT_URL=                            # 技术支持链接（可选）

# ================================
# ⚙️ 功能开关
# ================================
VITE_ENABLE_MOCK=false                        # 是否启用Mock数据
VITE_ENABLE_DEBUG=true                        # 是否启用调试模式

# ================================
# 🔒 AES加密配置
# ================================
# 是否启用前端AES加密 (true/false/不设置)
# - true: 强制启用加密
# - false: 强制禁用加密  
# - 不设置: 根据VITE_AES_KEY是否存在自动决定
VITE_AES_ENABLED=true

# AES密钥 (Base64格式，32字节)
# 必须与后端配置的密钥完全一致
VITE_AES_KEY=wJ/6sgrWER8T14S3z1esg39g7sL8f8b+J5fCg6a5fGg=

# ================================
# 🎨 主题配置
# ================================
VITE_THEME_PRIMARY_COLOR=#1890ff              # 主题色
VITE_THEME_MODE=light                         # 主题模式（light/dark）

# ================================
# 📄 页脚配置
# ================================
VITE_FOOTER_COPYRIGHT=SVT System              # 版权信息
VITE_FOOTER_YEAR=2025                         # 年份
```

#### 1.3.3 不同环境的配置差异

| 配置项 | Development | UAT | Production |
|--------|-------------|-----|------------|
| **标题** | SVT 管理系统 | SVT 管理系统 (UAT) | SVT 管理系统 |
| **API地址** | `localhost:8080` | `uat.svt.com` | `prod.svt.com` |
| **协议** | HTTP | HTTP | HTTPS |
| **超时时间** | 10秒 | 15秒 | 20秒 |
| **调试模式** | ✅ 启用 | ❌ 禁用 | ❌ 禁用 |
| **AES加密** | ✅ 启用 | ✅ 启用 | ✅ 启用 |

#### 1.3.4 本地配置覆盖

如果需要在本地临时覆盖某些配置，可以创建 `.env.local` 文件：

```env
# .env.local（本地开发时的特殊配置）
VITE_API_BASE_URL=http://192.168.1.100:8080/api
VITE_AES_ENABLED=false
```

⚠️ **注意：** `.env.local` 文件不会被Git跟踪，适合存放个人开发配置。

### 1.4 启动应用

#### 1.4.1 开发模式启动

```bash
# 启动开发环境（默认）
npm run dev
# 等同于：vite --mode development
# 自动加载 .env.development 文件

# 启动UAT环境开发模式
npm run dev:uat
# 等同于：vite --mode uat
# 自动加载 .env.uat 文件

# 启动生产环境开发模式（用于本地测试生产配置）
npm run dev:prod
# 等同于：vite --mode production
# 自动加载 .env.production 文件
```

#### 1.4.2 构建模式

```bash
# 构建生产版本（默认）
npm run build
# 等同于：npm run build:prod

# 构建开发版本
npm run build:dev

# 构建UAT版本
npm run build:uat

# 构建生产版本
npm run build:prod
```

#### 1.4.3 验证环境配置

启动后，您可以在浏览器控制台中查看当前环境：

```javascript
// 查看当前环境变量
console.log('当前环境:', import.meta.env.VITE_APP_ENV);
console.log('API地址:', import.meta.env.VITE_API_BASE_URL);
console.log('调试模式:', import.meta.env.VITE_ENABLE_DEBUG);
console.log('AES加密:', import.meta.env.VITE_AES_ENABLED);
```

应用启动后，可在 `http://localhost:5173` (或Vite指定的其他端口) 访问。

### 1.5 验证AES加密配置

#### 1.5.1 AES加密配置优先级

1. `VITE_AES_ENABLED=false` → 强制禁用加密
2. `VITE_AES_ENABLED=true` → 强制启用加密
3. 未设置`VITE_AES_ENABLED` → 根据`VITE_AES_KEY`是否存在自动决定

#### 1.5.2 运行时验证

启动前端服务后，可以通过以下方式验证AES配置：

```javascript
// 查看当前AES配置
console.log('AES配置:', window.cryptoConfig?.get());

// 检查加密状态
console.log('AES加密状态:', window.cryptoConfig?.isEnabled());

// 动态控制加密状态（仅开发环境）
window.cryptoConfig?.enable();   // 启用加密
window.cryptoConfig?.disable();  // 禁用加密
```

#### 1.5.3 常见配置场景

```env
# 🔹 开发环境 - 启用加密（推荐）
VITE_AES_ENABLED=true
VITE_AES_KEY=wJ/6sgrWER8T14S3z1esg39g7sL8f8b+J5fCg6a5fGg=

# 🔹 开发环境 - 禁用加密（便于调试）
VITE_AES_ENABLED=false

# 🔹 生产环境
VITE_AES_ENABLED=true
VITE_AES_KEY=your-production-key
```

## 2. 技术栈

| 类型           | 技术/库                                | 说明                                   |
| :------------- | :------------------------------------- | :------------------------------------- |
| **核心框架**   | React 19, Vite, TypeScript           | 现代化的前端开发基础                   |
| **UI组件库**   | Ant Design 5.x                         | 提供高质量的开箱即用组件               |
| **路由**       | React Router 7.x                       | 负责应用的页面导航和代码分割           |
| **状态管理**   | Zustand                                | 轻量、灵活的全局状态管理方案           |
| **数据请求**   | TanStack Query + Axios                 | 管理服务端状态，提供缓存、重试等高级功能 |
| **表单处理**   | React Hook Form + Zod                  | 高性能的表单管理与数据校验             |
| **加密**       | CryptoJS                               | 用于实现与后端匹配的AES加密            |

## 3. 架构与设计

前端项目遵循组件化的开发模式，并采用了清晰、可扩展的目录结构。

### 3.1 核心设计
- **无感知的API加密**: 加解密逻辑被封装在`utils/request.ts`的Axios拦截器中，对业务代码完全透明。
- **持久化的全局状态**: 使用Zustand的`persist`中间件管理用户认证信息，确保页面刷新后登录状态不丢失。
- **路由守卫**: `router/ProtectedRoute.tsx`组件负责保护需要登录才能访问的页面。
- **代码分割**: 所有页面级组件都通过`React.lazy`实现懒加载，优化首屏加载速度。

## 4. 详细文档索引

为了更深入地了解各项功能的实现细节，请查阅`docs`目录下的详细设计文档：
- **[组件化与目录结构](./docs/Component-Structure.md)**
- **[API加密 (AES)](./docs/API-Encryption-AES.md)**
- **[状态管理 (Zustand)](./docs/State-Management.md)**

## 5. 环境变量快速参考

### 5.1 必需配置

| 变量名 | 说明 | 示例值 | 必需 |
|--------|------|--------|------|
| `VITE_API_BASE_URL` | 后端API地址 | `http://localhost:8080/api` | ✅ |
| `VITE_AES_KEY` | AES加密密钥 | `wJ/6sgrWER8T14S3z1esg39g7sL8f8b+J5fCg6a5fGg=` | ✅ |

### 5.2 可选配置

| 变量名 | 说明 | 默认值 | 可选值 |
|--------|------|--------|--------|
| `VITE_AES_ENABLED` | 是否启用AES加密 | 自动检测 | `true`, `false` |
| `VITE_API_TIMEOUT` | API超时时间(毫秒) | `10000` | 数字 |
| `VITE_ENABLE_DEBUG` | 调试模式 | `false` | `true`, `false` |
| `VITE_THEME_PRIMARY_COLOR` | 主题色 | `#1890ff` | 颜色值 |
| `VITE_APP_TITLE` | 应用标题 | `SVT 管理系统` | 字符串 |

### 5.3 环境差异配置

不同环境的主要配置差异：

```bash
# 开发环境
VITE_API_BASE_URL=http://localhost:8080/api
VITE_ENABLE_DEBUG=true

# UAT环境  
VITE_API_BASE_URL=http://uat.svt.com/api
VITE_ENABLE_DEBUG=false

# 生产环境
VITE_API_BASE_URL=https://prod.svt.com/api
VITE_ENABLE_DEBUG=false
```

## 6. 开发规范
- **组件**: 优先创建可复用的、由Props驱动的纯组件。
- **Hooks**: 将可复用的逻辑（数据获取、事件处理等）抽取为自定义Hooks。
- **样式**: 组件级样式与组件文件放在一起（如`LoginPage.css`），全局样式放在`src/styles`下。
- **类型定义**: 所有自定义类型都应定义在`src/types`目录下，并按业务领域划分文件。
- **API**: 所有API请求方法都应统一定义在`src/api`目录下，按后端Controller或业务模块划分文件。
