# AES加密配置说明

## 环境变量配置

### 开发环境 (.env.development)
```bash
# 开发环境配置
NODE_ENV=development

# API基础地址
VITE_API_BASE_URL=http://localhost:8080/api

# AES加密配置
VITE_AES_ENABLED=true
VITE_AES_KEY=SVT-DEFAULT-AES-KEY-256BITS-FOR-DEV

# 应用配置
VITE_APP_TITLE=SVT管理系统
VITE_APP_VERSION=1.0.0

# 调试配置
VITE_DEBUG=true
```

### 生产环境 (.env.production)
```bash
# 生产环境配置
NODE_ENV=production

# API基础地址
VITE_API_BASE_URL=https://your-production-domain.com/api

# AES加密配置
VITE_AES_ENABLED=true
VITE_AES_KEY=${从环境变量或密钥管理系统获取}

# 应用配置
VITE_APP_TITLE=SVT管理系统
VITE_APP_VERSION=1.0.0

# 调试配置
VITE_DEBUG=false
```

## 配置说明

### AES加密配置项

| 配置项 | 说明 | 开发环境默认值 | 生产环境建议 |
|--------|------|----------------|--------------|
| `VITE_AES_ENABLED` | 是否启用AES加密 | `true` | `true` |
| `VITE_AES_KEY` | AES加密密钥 | 开发默认密钥 | 从安全系统获取 |

### 密钥要求

1. **密钥长度**: 必须是256位(32字节)
2. **密钥格式**: 支持Base64编码或UTF-8字符串
3. **密钥安全**: 生产环境密钥需要定期轮换

### 配置示例

#### 字符串密钥（32字节）
```bash
VITE_AES_KEY=SVT-DEFAULT-AES-KEY-256BITS-FOR-DEV
```

#### Base64编码密钥
```bash
VITE_AES_KEY=U1ZULURFRkFVTFQtQUVTLUtFWS0yNTZCSVRTLUZPUi1ERVY=
```

## 安全注意事项

1. **开发环境**: 可以使用固定密钥方便开发调试
2. **测试环境**: 建议使用独立的测试密钥
3. **生产环境**: 必须使用安全的密钥管理系统
4. **密钥轮换**: 生产环境建议定期更换密钥

## 验证配置

可以通过以下方式验证配置是否正确：

```typescript
import { getCryptoStats } from '@/utils/crypto';

// 检查配置状态
const stats = getCryptoStats();
console.log('AES配置状态:', stats);

// 预期输出：
// {
//   enabled: true,
//   hasKey: true,
//   keyExpiry: 1701234567890,
//   config: { ... }
// }
```

---

**创建时间**: 2025-06-17 14:32:00 +08:00  
**版本**: v1.0 