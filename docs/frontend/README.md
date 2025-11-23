# 前端文档导航

> [首页](../../README.md) > 前端文档

SVT前端基于React 19.1.0 + TypeScript 5.8.3构建，采用模块化架构设计，提供现代化的用户体验。

## 📚 文档列表

### 🏗️ 架构设计

#### [模块化架构](Modular-Architecture.md)
前端模块化架构设计，包括Layout系统、状态管理、路由管理等。

**关键特性**:
- 三层Layout架构（Provider → Structure → Modules）
- 职责分离设计
- 模块独立开发
- 可扩展性强

#### [组件结构](Component-Structure.md)
组件组织方式和设计规范。

**关键特性**:
- 组件分类（Layout/Common/Business）
- 组件设计原则
- Props接口定义
- 组件复用策略

#### [状态管理](State-Management.md)
基于Zustand的状态管理方案。

**关键特性**:
- 职责分离（authStore + userStore）
- 自动持久化
- 类型安全
- 防重复操作

### ⚙️ 核心功能

#### [权限控制](PERMISSION_CONTROL_GUIDE.md)
完整的权限控制系统设计和实现。

**关键特性**:
- O(1)权限检查
- 四层安全防护
- 动态路由加载
- 权限缓存优化

#### [Tab系统](Tab-System-Design.md)
多Tab管理系统的设计和实现。

**关键特性**:
- 多Tab支持
- 上下文菜单
- localStorage持久化
- 防重复操作

#### [SchemaPage](SchemaPage.md)
基于Schema配置的快速开发框架。

**关键特性**:
- Schema驱动
- CRUD页面生成
- 类型安全
- 自定义扩展

### 🎨 系统特性

#### [响应式布局](Responsive-Layout-System.md)
响应式布局系统的设计和实现。

**关键特性**:
- 移动端适配
- 断点管理
- 布局切换
- 性能优化

#### [存储管理](Storage-Management.md)
本地存储管理策略。

**关键特性**:
- 加密存储
- 自动过期
- 命名空间隔离
- 类型安全

### 📖 开发指南

#### [开发指南](开发指南.md)
前端开发规范和最佳实践。

**主要内容**:
- 技术栈说明
- 设计原则
- 开发流程
- 最佳实践

#### [环境变量](环境变量配置说明.md)
环境变量配置说明和管理。

**主要内容**:
- 配置文件说明
- 环境变量列表
- 使用方法
- 优先级规则

#### [Schema配置](Schema配置规范.md)
Schema配置规范和示例。

**主要内容**:
- 数据模型定义
- 表单配置
- 表格配置
- 数据转换

## 🔗 相关文档

### 架构文档
- [架构概述](../architecture/overview.md) - 系统整体架构
- [技术栈](../architecture/tech-stack.md) - 前端技术选型
- [编码规范](../architecture/coding-standards.md) - TypeScript编码规范
- [源码结构](../architecture/source-tree.md) - 前端源码导航

### 后端文档
- [后端文档导航](../backend/README.md) - 后端文档入口

## 📖 快速开始

1. **环境准备**: Node.js 18+ + npm
2. **安装依赖**: `npm install`
3. **配置环境变量**: 复制`.env.development`并配置
4. **启动开发服务器**: `npm run dev`

详见: [项目README](../../README.md#-快速开始)

## 🎯 核心特性

- **类型优先**: 100% TypeScript类型覆盖
- **模块化架构**: 清晰的模块边界和职责分离
- **性能优化**: 代码分割、懒加载、缓存策略
- **安全设计**: 多层安全防护和数据加密
- **O(1)权限检查**: 使用Set索引优化，性能提升100x+
- **智能Tab系统**: 多Tab管理 + 上下文菜单 + 持久化

## 🛠️ 技术栈

- **UI框架**: React 19.1.0
- **编程语言**: TypeScript 5.8.3
- **构建工具**: Vite 6.3.5
- **UI组件库**: Ant Design 5.25.4
- **状态管理**: Zustand 5.0.5
- **路由管理**: React Router DOM 7.6.2
- **HTTP客户端**: Axios 1.9.0
- **原子化CSS**: UnoCSS 66.3.2

---

**文档版本**: 1.0.0  
**最后更新**: 2025-11-20  
**维护团队**: SVT开发团队

