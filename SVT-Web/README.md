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

### 1.3 开发环境配置
在项目根目录创建一个`.env.development`文件，并配置以下必要的环境变量：

```
# .env.development

# API代理的目标地址 (你的后端服务地址)
VITE_API_BASE_URL=http://localhost:8080

# 是否启用AES加密 (true/false)，开发时可设为false以方便调试
VITE_CRYPTO_ENABLED=true

# AES 密钥 (Base64编码, 32字节), 必须与后端配置的密钥完全一致
VITE_AES_KEY="your-32-byte-base64-encoded-aes-key-here"
```

### 1.4 启动开发服务器
```bash
pnpm dev
# 或
npm run dev
```
应用启动后，可在 `http://localhost:5173` (或Vite指定的其他端口) 访问。

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

## 5. 开发规范
- **组件**: 优先创建可复用的、由Props驱动的纯组件。
- **Hooks**: 将可复用的逻辑（数据获取、事件处理等）抽取为自定义Hooks。
- **样式**: 组件级样式与组件文件放在一起（如`LoginPage.css`），全局样式放在`src/styles`下。
- **类型定义**: 所有自定义类型都应定义在`src/types`目录下，并按业务领域划分文件。
- **API**: 所有API请求方法都应统一定义在`src/api`目录下，按后端Controller或业务模块划分文件。
