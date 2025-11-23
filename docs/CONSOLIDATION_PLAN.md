# SVT项目文档整理计划

生成时间：2025-11-20  
基于文档：`docs/DOCUMENT_INVENTORY.md`

## 📋 整理目标

1. ✅ 归档临时评估文档
2. ✅ 统一前端文档语言为英文
3. ✅ 优化文档结构，按功能分类
4. ✅ 建立完整的文档导航体系
5. ✅ 确保所有链接有效
6. ✅ 为所有文档添加元数据

## 📊 当前状态

### 文档统计
- **总文档数**: 25个
- **临时文档**: 3个 (需要归档)
- **中文文档**: 7个
- **英文文档**: 15个
- **需要迁移**: 18个 (11个前端 + 7个后端)

### 语言分布
- **SVT-Web/docs/**: 3个中文 + 8个英文 (混用)
- **SVT-Server/docs/**: 7个英文 (统一)
- **docs/**: 4个中文架构文档 + 3个临时文档

## 🎯 整理策略

### 1. 语言统一策略

**决策**: 统一前端文档为英文

**理由**:
- 大部分前端文档已是英文 (8/11)
- 只需翻译3个中文文档，工作量可控
- 符合技术文档国际化趋势
- 与后端文档语言保持一致

**需要翻译的文档**:
1. `SVT-Web/docs/环境变量配置说明.md` → `Environment-Variables.md`
2. `SVT-Web/docs/开发指南.md` → `Development-Guide.md`
3. `SVT-Web/docs/Schema配置规范.md` → `Schema-Configuration.md`

**保持中文的文档**:
- `README.md` - 项目主文档
- `docs/architecture/*` - 架构文档 (4个)

### 2. 文档结构优化

**目标结构**:
```
docs/
├── architecture/           # 架构文档 (中文)
│   ├── overview.md        # 从architecture.md重命名
│   ├── tech-stack.md
│   ├── coding-standards.md
│   └── source-tree.md
├── backend/               # 后端文档 (英文)
│   ├── README.md          # 新建导航页面
│   └── [7个后端文档]
└── frontend/              # 前端文档 (英文)
    ├── README.md          # 新建导航页面
    └── [11个前端文档]
```

### 3. 归档策略

**归档目录**: `.archive/2025-11-20/`

**需要归档的文档**:
1. `docs/ARCHITECTURE_ASSESSMENT.md`
2. `docs/ASSESSMENT_SUMMARY.md`
3. `docs/DOCUMENTATION_UPDATE_SUMMARY.md` (如果存在)

**归档元数据**:
```yaml
---
archived: true
archiveDate: "2025-11-20"
archiveReason: "临时评估文档，评估工作已完成"
originalPath: "docs/ARCHITECTURE_ASSESSMENT.md"
---
```

## 📝 详细执行计划

### 阶段一：准备工作

#### 任务1: 创建Git备份分支
```bash
git checkout -b docs/consolidation
git push origin docs/consolidation
```

#### 任务2: 创建目标目录结构
```bash
mkdir -p .archive/2025-11-20
mkdir -p docs/backend
mkdir -p docs/frontend
```

### 阶段二：归档临时文档

#### 任务3: 归档ARCHITECTURE_ASSESSMENT.md
1. 添加归档元数据到文件头部
2. 移动文件: `docs/ARCHITECTURE_ASSESSMENT.md` → `.archive/2025-11-20/`
3. 记录到归档索引

#### 任务4: 归档ASSESSMENT_SUMMARY.md
1. 添加归档元数据到文件头部
2. 移动文件: `docs/ASSESSMENT_SUMMARY.md` → `.archive/2025-11-20/`
3. 记录到归档索引

#### 任务5: 归档DOCUMENTATION_UPDATE_SUMMARY.md (如果存在)
1. 检查文件是否存在
2. 如果存在，添加归档元数据
3. 移动到归档目录
4. 记录到归档索引

#### 任务6: 创建归档索引
创建 `.archive/2025-11-20/archive-index.md`:
```markdown
# 归档文档索引

归档日期：2025-11-20

## 归档文档列表

1. **ARCHITECTURE_ASSESSMENT.md**
   - 原路径: docs/ARCHITECTURE_ASSESSMENT.md
   - 归档原因: 临时架构评估文档，评估工作已完成
   - 文件大小: [size]
   
2. **ASSESSMENT_SUMMARY.md**
   - 原路径: docs/ASSESSMENT_SUMMARY.md
   - 归档原因: 临时评估总结文档，评估工作已完成
   - 文件大小: [size]
```

### 阶段三：优化文档结构

#### 任务7: 重命名架构文档
```bash
# 重命名主架构文档
mv docs/architecture.md docs/architecture/overview.md
```

**需要更新的引用**:
- README.md: `docs/architecture.md` → `docs/architecture/overview.md`

#### 任务8: 迁移后端文档
```bash
# 移动所有后端文档
mv SVT-Server/docs/*.md docs/backend/
```

**文档列表**:
1. API-Encryption-AES.md
2. Argon2-Password-Hashing.md
3. Audit-Logging.md
4. Authentication-and-Security.md
5. Automated-Transaction-Management.md
6. Distributed-ID-Generation.md
7. SM4-Configuration-Encryption.md

**创建重定向说明**:
在 `SVT-Server/docs/README.md` 创建:
```markdown
# 文档已迁移

后端文档已迁移到项目根目录的统一文档结构中。

请访问: [docs/backend/](../../docs/backend/)

## 文档列表
- [认证与安全](../../docs/backend/Authentication-and-Security.md)
- [API加密](../../docs/backend/API-Encryption-AES.md)
- ...
```

#### 任务9: 迁移前端文档
```bash
# 移动所有前端文档
mv SVT-Web/docs/*.md docs/frontend/
```

**文档列表**:
1. Component-Structure.md
2. Modular-Architecture.md
3. PERMISSION_CONTROL_GUIDE.md
4. Responsive-Layout-System.md
5. SchemaPage.md
6. State-Management.md
7. Storage-Management.md
8. Tab-System-Design.md
9. 环境变量配置说明.md (待翻译)
10. 开发指南.md (待翻译)
11. Schema配置规范.md (待翻译)

**创建重定向说明**:
在 `SVT-Web/docs/README.md` 创建:
```markdown
# 文档已迁移

前端文档已迁移到项目根目录的统一文档结构中。

请访问: [docs/frontend/](../../docs/frontend/)

## 文档列表
- [组件结构](../../docs/frontend/Component-Structure.md)
- [模块化架构](../../docs/frontend/Modular-Architecture.md)
- ...
```

### 阶段四：统一文档语言

#### 任务10: 翻译环境变量配置说明.md
1. 翻译文档内容为英文
2. 保护代码块和配置示例
3. 保护技术术语
4. 重命名为 `Environment-Variables.md`
5. 添加元数据

#### 任务11: 翻译开发指南.md
1. 翻译文档内容为英文
2. 保护代码块和配置示例
3. 保护技术术语
4. 重命名为 `Development-Guide.md`
5. 添加元数据

#### 任务12: 翻译Schema配置规范.md
1. 翻译文档内容为英文
2. 保护代码块和配置示例
3. 保护技术术语
4. 重命名为 `Schema-Configuration.md`
5. 添加元数据

### 阶段五：更新文档引用

#### 任务13: 更新README.md中的引用
需要更新的链接:
- `docs/architecture.md` → `docs/architecture/overview.md`
- 添加新的文档索引章节

#### 任务14: 扫描并更新所有文档中的引用
使用全局搜索替换:
- 搜索: `SVT-Server/docs/`
- 替换: `docs/backend/`
- 搜索: `SVT-Web/docs/`
- 替换: `docs/frontend/`

### 阶段六：建立导航体系

#### 任务15: 为所有文档添加元数据
为每个文档添加YAML frontmatter:
```yaml
---
title: "文档标题"
description: "文档描述"
category: "backend|frontend|architecture"
lastUpdated: "2025-11-20"
version: "1.0.0"
status: "published"
tags: ["tag1", "tag2"]
relatedDocs:
  - "related-doc1.md"
  - "related-doc2.md"
---
```

#### 任务16: 创建后端文档导航
创建 `docs/backend/README.md`:
```markdown
# 后端文档导航

> [首页](../../README.md) > 后端文档

## 📚 文档列表

### 安全与认证
- [认证与安全](Authentication-and-Security.md) - JWT认证和安全机制
- [API加密](API-Encryption-AES.md) - AES-256端到端加密
- [密码哈希](Argon2-Password-Hashing.md) - Argon2密码存储
- [配置加密](SM4-Configuration-Encryption.md) - SM4国密算法

### 核心功能
- [审计日志](Audit-Logging.md) - 完整的操作审计
- [事务管理](Automated-Transaction-Management.md) - 自动化事务处理
- [分布式ID](Distributed-ID-Generation.md) - 分布式ID生成策略

## 相关文档
- [架构概述](../architecture/overview.md)
- [技术栈](../architecture/tech-stack.md)
```

#### 任务17: 创建前端文档导航
创建 `docs/frontend/README.md`:
```markdown
# 前端文档导航

> [首页](../../README.md) > 前端文档

## 📚 文档列表

### 架构设计
- [模块化架构](Modular-Architecture.md) - 前端架构设计
- [组件结构](Component-Structure.md) - 组件组织方式
- [状态管理](State-Management.md) - Zustand状态管理

### 核心功能
- [权限控制](PERMISSION_CONTROL_GUIDE.md) - 权限系统设计
- [Tab系统](Tab-System-Design.md) - 多Tab管理
- [SchemaPage](SchemaPage.md) - 动态页面组件

### 系统特性
- [响应式布局](Responsive-Layout-System.md) - 响应式设计
- [存储管理](Storage-Management.md) - 本地存储策略

### 开发指南
- [开发指南](Development-Guide.md) - 开发规范和最佳实践
- [环境变量](Environment-Variables.md) - 环境配置说明
- [Schema配置](Schema-Configuration.md) - Schema配置规范

## 相关文档
- [架构概述](../architecture/overview.md)
- [编码规范](../architecture/coding-standards.md)
```

#### 任务18: 更新README.md的文档索引
在README.md中添加完整的文档导航章节:
```markdown
## 📚 文档导航

### 架构文档
- [架构概述](docs/architecture/overview.md) - 系统整体架构设计
- [技术栈](docs/architecture/tech-stack.md) - 使用的技术和框架
- [编码规范](docs/architecture/coding-standards.md) - 代码风格和最佳实践
- [源码结构](docs/architecture/source-tree.md) - 项目目录结构说明

### 后端文档
- [后端文档导航](docs/backend/README.md)
- [认证与安全](docs/backend/Authentication-and-Security.md)
- [API加密](docs/backend/API-Encryption-AES.md)
- [密码哈希](docs/backend/Argon2-Password-Hashing.md)
- [审计日志](docs/backend/Audit-Logging.md)
- [事务管理](docs/backend/Automated-Transaction-Management.md)
- [分布式ID](docs/backend/Distributed-ID-Generation.md)
- [配置加密](docs/backend/SM4-Configuration-Encryption.md)

### 前端文档
- [前端文档导航](docs/frontend/README.md)
- [组件结构](docs/frontend/Component-Structure.md)
- [模块化架构](docs/frontend/Modular-Architecture.md)
- [权限控制指南](docs/frontend/PERMISSION_CONTROL_GUIDE.md)
- [响应式布局](docs/frontend/Responsive-Layout-System.md)
- [SchemaPage组件](docs/frontend/SchemaPage.md)
- [状态管理](docs/frontend/State-Management.md)
- [存储管理](docs/frontend/Storage-Management.md)
- [Tab系统设计](docs/frontend/Tab-System-Design.md)
- [开发指南](docs/frontend/Development-Guide.md)
- [环境变量](docs/frontend/Environment-Variables.md)
- [Schema配置](docs/frontend/Schema-Configuration.md)
```

#### 任务19: 为每个文档添加面包屑导航
在每个文档顶部添加:
```markdown
> [首页](../../README.md) > [后端文档](README.md) > 认证与安全

# 认证与安全
```

#### 任务20: 添加相关文档链接
在每个文档末尾添加"相关文档"章节:
```markdown
## 相关文档

- [API加密](API-Encryption-AES.md) - 了解API数据加密机制
- [审计日志](Audit-Logging.md) - 了解安全审计功能
- [密码哈希](Argon2-Password-Hashing.md) - 了解密码存储机制
```

### 阶段七：验证和报告

#### 任务21: 验证所有链接有效性
1. 检查README.md中的所有链接
2. 检查导航页面中的所有链接
3. 检查文档间的交叉引用
4. 生成失效链接列表

#### 任务22: 生成整理报告
创建 `docs/CONSOLIDATION_REPORT.md`:
```markdown
# 文档整理报告

生成时间：2025-11-20

## 整理统计

### 文档操作
- 归档文档: 3个
- 移动文档: 18个 (7个后端 + 11个前端)
- 翻译文档: 3个
- 重命名文档: 1个
- 新建文档: 3个 (2个导航 + 1个归档索引)

### 引用更新
- 更新的链接数: [count]
- 新增的链接数: [count]

### 文档结构
- 整理前: 3个目录，25个文档
- 整理后: 4个目录，25个文档 + 3个导航

## 详细变更

### 归档文档
1. docs/ARCHITECTURE_ASSESSMENT.md → .archive/2025-11-20/
2. docs/ASSESSMENT_SUMMARY.md → .archive/2025-11-20/
3. docs/DOCUMENTATION_UPDATE_SUMMARY.md → .archive/2025-11-20/

### 文档迁移
[详细列表]

### 文档翻译
[详细列表]

## 质量改进

### 整理前
- 文档分散在3个目录
- 语言混用（中英文）
- 缺乏统一导航
- 临时文档未归档

### 整理后
- 文档按功能分类（架构/后端/前端）
- 前端文档语言统一（英文）
- 完整的导航体系
- 临时文档已归档
- 所有文档有元数据
- 文档间有交叉引用
```

## 🔍 风险和缓解措施

### 风险1: 链接失效
**风险**: 文档移动后可能导致链接失效  
**缓解**: 
- 在移动前扫描所有引用
- 批量更新链接
- 验证所有链接有效性

### 风险2: 翻译质量
**风险**: 自动翻译可能不准确  
**缓解**: 
- 人工审核所有翻译内容
- 特别注意技术术语
- 保护代码块和配置示例

### 风险3: 数据丢失
**风险**: 操作失误可能导致文档丢失  
**缓解**: 
- 使用Git版本控制
- 创建备份分支
- 每个阶段提交一次

## ✅ 验证检查清单

### 文档完整性
- [ ] 所有核心文档存在
- [ ] 归档文档已正确移动
- [ ] 归档索引文件已创建
- [ ] 导航页面已创建

### 链接有效性
- [ ] README中的所有链接有效
- [ ] 导航页面中的所有链接有效
- [ ] 文档间的交叉引用有效
- [ ] 面包屑导航链接有效

### 文档结构
- [ ] docs/architecture/ 目录正确
- [ ] docs/backend/ 目录正确
- [ ] docs/frontend/ 目录正确
- [ ] .archive/ 目录正确

### 元数据
- [ ] 所有文档都有YAML frontmatter
- [ ] 元数据字段完整
- [ ] 相关文档链接正确

### 语言一致性
- [ ] 前端文档语言统一为英文
- [ ] 代码块未被修改
- [ ] 技术术语翻译准确

## 📅 执行时间表

- **阶段一**: 准备工作 (15分钟)
- **阶段二**: 归档临时文档 (30分钟)
- **阶段三**: 优化文档结构 (45分钟)
- **阶段四**: 统一文档语言 (2小时)
- **阶段五**: 更新文档引用 (30分钟)
- **阶段六**: 建立导航体系 (1.5小时)
- **阶段七**: 验证和报告 (45分钟)

**总计**: 约6小时

## 📋 下一步

1. ✅ 审核整理计划
2. ⏳ 获得用户批准
3. ⏳ 开始执行整理操作

