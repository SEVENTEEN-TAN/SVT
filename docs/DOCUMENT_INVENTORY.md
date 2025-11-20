# SVT项目文档清单

生成时间：2025-11-20

## 文档统计

### 总体统计
- **总文档数**: 25个Markdown文件
- **根目录文档**: 1个 (README.md)
- **docs/目录**: 5个
- **SVT-Web/docs/**: 11个
- **SVT-Server/docs/**: 7个

### 按类别统计
- **核心文档**: 1个 (README.md)
- **架构文档**: 4个
- **临时文档**: 3个 (需要归档)
- **前端文档**: 11个
- **后端文档**: 7个

## 详细清单

### 1. 根目录
- `README.md` - 项目主文档 (中文)

### 2. docs/ 目录

#### 2.1 架构文档
- `docs/architecture.md` - 完整架构文档 (中文, 1471行)
- `docs/architecture/tech-stack.md` - 技术栈文档 (中文, 600行)
- `docs/architecture/coding-standards.md` - 编码标准 (中文, 1104行)
- `docs/architecture/source-tree.md` - 源码树结构 (中文, 719行)

#### 2.2 临时文档 (需要归档)
- `docs/DOCUMENTATION_UPDATE_SUMMARY.md` - 文档更新总结 (临时)
- `docs/ARCHITECTURE_ASSESSMENT.md` - 架构评估 (临时)
- `docs/ASSESSMENT_SUMMARY.md` - 评估总结 (临时)

### 3. SVT-Web/docs/ 目录 (前端文档)

#### 3.1 中文文档 (需要语言统一)
- `SVT-Web/docs/环境变量配置说明.md` - 环境变量配置 (中文)
- `SVT-Web/docs/开发指南.md` - 开发指南 (中文)
- `SVT-Web/docs/Schema配置规范.md` - Schema配置规范 (中文)

#### 3.2 英文文档
- `SVT-Web/docs/Component-Structure.md` - 组件结构 (英文)
- `SVT-Web/docs/Modular-Architecture.md` - 模块化架构 (英文)
- `SVT-Web/docs/PERMISSION_CONTROL_GUIDE.md` - 权限控制指南 (英文)
- `SVT-Web/docs/Responsive-Layout-System.md` - 响应式布局系统 (英文)
- `SVT-Web/docs/SchemaPage.md` - SchemaPage组件 (英文)
- `SVT-Web/docs/State-Management.md` - 状态管理 (英文)
- `SVT-Web/docs/Storage-Management.md` - 存储管理 (英文)
- `SVT-Web/docs/Tab-System-Design.md` - Tab系统设计 (英文)

### 4. SVT-Server/docs/ 目录 (后端文档)

#### 4.1 英文文档
- `SVT-Server/docs/API-Encryption-AES.md` - API加密 (英文)
- `SVT-Server/docs/Argon2-Password-Hashing.md` - 密码哈希 (英文)
- `SVT-Server/docs/Audit-Logging.md` - 审计日志 (英文)
- `SVT-Server/docs/Authentication-and-Security.md` - 认证与安全 (英文)
- `SVT-Server/docs/Automated-Transaction-Management.md` - 事务管理 (英文)
- `SVT-Server/docs/Distributed-ID-Generation.md` - 分布式ID (英文)
- `SVT-Server/docs/SM4-Configuration-Encryption.md` - SM4配置加密 (英文)

## 语言分析

### 中文文档 (7个)
1. README.md
2. docs/architecture.md
3. docs/architecture/tech-stack.md
4. docs/architecture/coding-standards.md
5. docs/architecture/source-tree.md
6. SVT-Web/docs/环境变量配置说明.md
7. SVT-Web/docs/开发指南.md
8. SVT-Web/docs/Schema配置规范.md

### 英文文档 (15个)
- SVT-Web/docs/: 8个英文文档
- SVT-Server/docs/: 7个英文文档

### 语言混用情况
- **SVT-Web/docs/**: 中英文混用 (3个中文 + 8个英文)
- **建议**: 统一为英文或中文

## 临时文档识别

### 需要归档的文档 (3个)
1. `docs/DOCUMENTATION_UPDATE_SUMMARY.md`
   - 原因: 文档更新总结，属于临时评估文档
   - 大小: 待确认
   - 最后修改: 待确认

2. `docs/ARCHITECTURE_ASSESSMENT.md`
   - 原因: 架构评估文档，属于临时评估文档
   - 大小: 待确认
   - 最后修改: 待确认

3. `docs/ASSESSMENT_SUMMARY.md`
   - 原因: 评估总结文档，属于临时评估文档
   - 大小: 待确认
   - 最后修改: 待确认

## 文档引用分析

### 需要检查的引用
- README.md 中可能引用了临时文档
- 其他文档可能引用了临时文档
- 需要扫描所有文档的链接

## 重复内容分析

### 潜在重复内容
- 待分析: 需要比较文档内容相似度
- 阈值: 70%

## 下一步行动

1. ✅ 完成文档扫描和清单生成
2. ⏳ 检查文档间的引用关系
3. ⏳ 分析重复内容
4. ⏳ 制定详细的整理计划



## 文档引用关系分析

### README.md 引用
- `docs/architecture.md` - 完整架构文档
- `docs/architecture/tech-stack.md` - 技术栈文档
- `docs/architecture/coding-standards.md` - 编码标准文档
- `docs/architecture/source-tree.md` - 源码树文档

### 临时文档引用检查
✅ **无引用**: 临时文档没有被其他文档引用，可以安全归档

### 文档间引用关系
- README.md → docs/architecture/* (4个引用)
- 其他文档: 待进一步分析

## 临时文档详细信息

### 1. ARCHITECTURE_ASSESSMENT.md
- **类型**: 架构评估报告
- **内容**: 完整的架构评估，包含评分和建议
- **状态**: 评估已完成，可以归档
- **归档原因**: 临时评估文档，评估工作已完成

### 2. ASSESSMENT_SUMMARY.md
- **类型**: 评估总结
- **内容**: 评估概览和已完成工作总结
- **状态**: 评估已完成，可以归档
- **归档原因**: 临时总结文档，评估工作已完成

### 3. DOCUMENTATION_UPDATE_SUMMARY.md (待确认)
- **类型**: 文档更新总结
- **状态**: 待检查
- **归档原因**: 临时文档更新记录

## 重复内容初步分析

### 潜在重复区域
1. **架构文档**: docs/architecture.md 可能与其他架构文档有重复内容
2. **前端文档**: SVT-Web/docs/ 下的多个文档可能有重复的架构说明
3. **后端文档**: SVT-Server/docs/ 下的文档相对独立，重复可能性较低

### 需要详细比较的文档对
- docs/architecture.md vs docs/architecture/tech-stack.md
- SVT-Web/docs/开发指南.md vs SVT-Web/docs/Modular-Architecture.md
- SVT-Web/docs/Component-Structure.md vs SVT-Web/docs/Modular-Architecture.md

## 文档分类建议

### 目标结构
```
docs/
├── architecture/           # 架构文档
│   ├── overview.md        # 架构概述 (从architecture.md重命名)
│   ├── tech-stack.md      # 技术栈
│   ├── coding-standards.md # 编码规范
│   └── source-tree.md     # 源码结构
├── backend/               # 后端文档 (从SVT-Server/docs/迁移)
│   ├── README.md          # 后端文档导航
│   ├── Authentication-and-Security.md
│   ├── API-Encryption-AES.md
│   ├── Argon2-Password-Hashing.md
│   ├── Audit-Logging.md
│   ├── Automated-Transaction-Management.md
│   ├── Distributed-ID-Generation.md
│   └── SM4-Configuration-Encryption.md
└── frontend/              # 前端文档 (从SVT-Web/docs/迁移)
    ├── README.md          # 前端文档导航
    ├── Component-Structure.md
    ├── Modular-Architecture.md
    ├── PERMISSION_CONTROL_GUIDE.md
    ├── Responsive-Layout-System.md
    ├── SchemaPage.md
    ├── State-Management.md
    ├── Storage-Management.md
    ├── Tab-System-Design.md
    ├── Environment-Variables.md (从环境变量配置说明.md重命名)
    ├── Development-Guide.md (从开发指南.md重命名)
    └── Schema-Configuration.md (从Schema配置规范.md重命名)
```

### 迁移计划
1. **归档临时文档** → `.archive/2025-11-20/`
2. **重命名架构文档** → `docs/architecture.md` → `docs/architecture/overview.md`
3. **迁移后端文档** → `SVT-Server/docs/*.md` → `docs/backend/*.md`
4. **迁移前端文档** → `SVT-Web/docs/*.md` → `docs/frontend/*.md`
5. **统一中文文档语言** → 翻译或保持中文一致性

## 语言统一建议

### 选项A: 统一为英文
**优点**:
- 国际化，便于开源协作
- 与大部分现有文档语言一致 (15个英文 vs 7个中文)
- 技术文档通常使用英文

**缺点**:
- 需要翻译3个中文前端文档
- 翻译工作量较大

**需要翻译的文档**:
1. SVT-Web/docs/环境变量配置说明.md → Environment-Variables.md
2. SVT-Web/docs/开发指南.md → Development-Guide.md
3. SVT-Web/docs/Schema配置规范.md → Schema-Configuration.md

### 选项B: 统一为中文
**优点**:
- 团队主要使用中文
- 维护成本低
- 核心文档(README, architecture)已是中文

**缺点**:
- 需要翻译15个英文文档
- 工作量巨大
- 限制国际化

**推荐**: **选项A - 统一为英文**
- 前端文档应保持语言一致性
- 只需翻译3个文档，工作量可控
- 符合技术文档国际化趋势

