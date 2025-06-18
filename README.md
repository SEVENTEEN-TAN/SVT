# SVT (Secure Vision Tesseract) 项目

欢迎来到SVT项目。这是一个采用前后端分离架构、以安全为核心、具备高度可扩展性的现代化Web应用模板。

## 1. 项目设计思想

SVT项目的设计哲学根植于以下几个核心原则：

- **安全第一 (Security-First)**: 项目在架构设计的每一个层面都优先考虑安全性。从基于国密算法的密码存储、端到端的API加密，到精细的认证授权和会话管理，我们致力于构建一个深度防御体系。
- **约定优于配置 (Convention over Configuration)**: 我们通过定义清晰的代码结构、组件化原则和自动化机制（如自动事务管理），来减少重复性工作和配置的复杂性，使开发者能更专注于业务逻辑的实现。
- **开发者体验 (Developer Experience)**: 通过引入现代化的技术栈、详尽的文档、统一的代码风格和无侵入式的框架特性，我们力求为开发者提供一个高效、愉悦的开发环境。
- **高内聚、低耦合**: 无论是后端的模块划分，还是前端的组件化设计，我们都遵循这一原则，以确保代码的可维护性和未来的可扩展性。

## 2. 技术栈概览

| 领域       | 技术/库                                       |
| :--------- | :-------------------------------------------- |
| **后端**   | Spring Boot, Spring Security, Mybatis-Flex, Redis, Java |
| **前端**   | React 19, Vite, TypeScript, Ant Design, Zustand, TanStack Query |
| **安全**   | JWT, AES-256-CBC, SM4, RBAC                  |
| **数据库** | SQL Server (可轻松适配MySQL, PostgreSQL等) |

## 3. 快速导航

为了更好地理解和参与项目，请从以下入口开始：

- **[后端项目说明 (SVT-Server/README.md)](./SVT-Server/README.md)**: 了解后端服务的详细架构、功能、配置和启动方式。
- **[前端项目说明 (SVT-Web/README.md)](./SVT-Web/README.md)**: 了解前端应用的详细架构、功能、开发流程和环境配置。

## 4. 目录结构

```
SVT/
├── SVT-Server/      # 后端Spring Boot项目
│   ├── docs/        # 详细技术文档
│   ├── src/
│   └── README.md
├── SVT-Web/         # 前端React项目
│   ├── docs/        # 详细技术文档
│   ├── src/
│   └── README.md
└── README.md        # 本文件 (项目总览)
```

我们鼓励所有开发者在开始编码前，先仔细阅读前后端的`README.md`文件及其`docs`目录下的详细文档。 