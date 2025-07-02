# SVT前端API加密(AES)实现

基于实际代码分析的SVT前端AES加密系统设计与实现文档。

## 1. 系统概述

### 1.1 设计目标

SVT前端API加密系统旨在通过AES-256-CBC算法保护前后端通信数据的安全性：

- **端到端加密**: 请求和响应数据全链路加密
- **无感集成**: 对业务代码透明，自动处理加解密
- **配置驱动**: 通过环境变量灵活控制加密功能
- **密钥安全**: 密钥从环境变量加载，支持缓存优化
- **性能优化**: 异步加密、密钥缓存、大小限制

### 1.2 技术方案

- **加密算法**: AES-256-CBC
- **密钥长度**: 256位 (32字节)
- **IV长度**: 128位 (16字节)，每次请求动态生成
- **填充模式**: PKCS7
- **编码格式**: Base64
- **核心库**: crypto-js
- **最大数据**: 10MB限制

## 2. 架构设计

### 2.1 系统架构

```
┌─────────────────┐
│   业务层代码    │
│ (Pages/Components)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    API层        │
│ (api/auth.ts等) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────┐
│  Request工具    │────▶│   Crypto工具      │
│(utils/request.ts)│     │(utils/crypto.ts) │
└────────┬────────┘     └──────────────────┘
         │
         ▼
┌─────────────────┐
│   Axios实例     │
│  (拦截器处理)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   后端API       │
│  (加密通信)     │
└─────────────────┘
```

### 2.2 核心模块

**1. 加密工具类 (utils/crypto.ts)**
- AESCryptoUtils类：封装crypto-js的AES加密功能
- 密钥管理：缓存机制、过期控制
- 加解密方法：支持自动IV生成
- API格式转换：JSON对象与加密格式互转

**2. 请求拦截器 (utils/request.ts)**
- 请求拦截：自动加密请求体
- 响应拦截：自动解密响应数据
- 错误处理：加解密失败处理
- 透明集成：对业务代码无侵入

**3. 配置管理 (config/crypto.ts)**
- 环境变量读取
- 配置验证
- 时间戳校验
- 数据大小限制

## 3. 加密实现

### 3.1 核心加密类

```typescript
// utils/crypto.ts
export class AESCryptoUtils {
  // 加密配置
  static CRYPTO_CONFIG = {
    algorithm: 'AES-CBC',
    keySize: 256 / 32,    // 256位 = 8个32位字
    ivSize: 128 / 32,     // 128位 = 4个32位字  
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
    maxDataSize: 10 * 1024 * 1024  // 10MB
  };

  // 密钥缓存
  static cachedKey: CryptoJS.lib.WordArray | null = null;
  static keyExpiry: number = 0;

  // 获取密钥（带缓存）
  static async getKey(): Promise<CryptoJS.lib.WordArray> {
    if (cachedKey && Date.now() < keyExpiry) {
      return cachedKey;
    }

    const keyString = import.meta.env.VITE_AES_KEY;
    const key = CryptoJS.enc.Base64.parse(keyString);
    
    if (key.sigBytes !== 32) {
      throw new Error(`无效的AES密钥长度: ${key.sigBytes}字节`);
    }
    
    cachedKey = key;
    keyExpiry = Date.now() + 60 * 60 * 1000; // 1小时缓存
    
    return cachedKey;
  }

  // 生成随机IV
  static generateIV(): string {
    const iv = CryptoJS.lib.WordArray.random(16);
    return CryptoJS.enc.Base64.stringify(iv);
  }

  // AES加密
  static async encrypt(plainText: string, ivString: string): Promise<string> {
    const key = await this.getKey();
    const iv = CryptoJS.enc.Base64.parse(ivString);

    const encrypted = CryptoJS.AES.encrypt(plainText, key, {
      iv: iv,
      mode: this.CRYPTO_CONFIG.mode,
      padding: this.CRYPTO_CONFIG.padding
    });

    return encrypted.toString();
  }

  // AES解密
  static async decrypt(encryptedData: string, ivString: string): Promise<string> {
    const key = await this.getKey();
    const iv = CryptoJS.enc.Base64.parse(ivString);

    const decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
      iv: iv,
      mode: this.CRYPTO_CONFIG.mode,
      padding: this.CRYPTO_CONFIG.padding
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
  }
}
```

### 3.2 数据格式

**加密请求格式**:
```typescript
interface EncryptedData {
  encrypted: boolean;    // 加密标识
  data: string;         // Base64编码的密文
  iv: string;           // Base64编码的IV
  timestamp: number;    // 时间戳（防重放）
  version: string;      // 协议版本
}
```

**示例**:
```json
{
  "encrypted": true,
  "data": "U2FsdGVkX1+ZN3BxdXNlcg==...",
  "iv": "MTIzNDU2Nzg5MDEyMzQ1Ng==",
  "timestamp": 1678886400000,
  "version": "1.0"
}
```

### 3.3 API集成

**加密API数据**:
```typescript
// 将JSON对象加密为API格式
static async encryptForAPI(data: any): Promise<EncryptedData> {
  const plainText = JSON.stringify(data);
  const iv = this.generateIV();
  const encryptedData = await this.encrypt(plainText, iv);

  return {
    encrypted: true,
    data: encryptedData,
    iv: iv,
    timestamp: Date.now(),
    version: '1.0'
  };
}

// 解密API响应
static async decryptFromAPI(encryptedResponse: EncryptedData): Promise<any> {
  // 验证时间戳（防重放攻击）
  const timestampValid = cryptoConfig.isTimestampValid(encryptedResponse.timestamp);
  if (!timestampValid) {
    console.warn('响应时间戳异常，可能存在重放攻击');
  }

  const decryptedText = await this.decrypt(encryptedResponse.data, encryptedResponse.iv);
  return JSON.parse(decryptedText);
}
```

## 4. 请求拦截实现

### 4.1 请求拦截器

```typescript
// utils/request.ts
request.interceptors.request.use(
  async (config) => {
    // 检查加密是否启用
    if (!cryptoConfig.isEnabled()) {
      return config;
    }

    // 只处理有请求体的请求
    if (config.data && ['post', 'put', 'patch'].includes(config.method || '')) {
      try {
        // 加密请求数据
        const encryptedData = await AESCryptoUtils.encryptForAPI(config.data);
        config.data = encryptedData;
        
        // 添加加密标识头
        config.headers['X-Encrypted'] = 'true';
      } catch (error) {
        console.error('请求加密失败:', error);
        throw error;
      }
    }

    return config;
  }
);
```

### 4.2 响应拦截器

```typescript
request.interceptors.response.use(
  async (response) => {
    // 检查响应是否为加密数据
    if (isEncryptedData(response.data)) {
      try {
        // 解密响应数据
        const decryptedData = await AESCryptoUtils.decryptFromAPI(response.data);
        response.data = decryptedData;
      } catch (error) {
        console.error('响应解密失败:', error);
        throw error;
      }
    }

    return response;
  }
);
```

### 4.3 加密数据检测

```typescript
// 检查数据是否为加密格式
export function isEncryptedData(data: any): data is EncryptedData {
  return (
    typeof data === 'object' &&
    data !== null &&
    data.encrypted === true &&
    typeof data.data === 'string' &&
    typeof data.iv === 'string' &&
    typeof data.timestamp === 'number' &&
    typeof data.version === 'string'
  );
}
```

## 5. 配置管理

### 5.1 环境变量配置

**.env.development / .env.production**:
```bash
# 是否启用AES加密
VITE_CRYPTO_ENABLED=true

# AES密钥 (Base64编码, 32字节)
# 必须与后端密钥完全一致
VITE_AES_KEY="your-32-byte-base64-encoded-aes-key-here"

# 加密版本
VITE_CRYPTO_VERSION=1.0

# 时间戳容差（毫秒）
VITE_CRYPTO_TIMESTAMP_TOLERANCE=300000

# 最大数据大小（字节）
VITE_CRYPTO_MAX_DATA_SIZE=10485760
```

### 5.2 配置读取

```typescript
// config/crypto.ts
export const cryptoConfig = {
  isEnabled(): boolean {
    return import.meta.env.VITE_CRYPTO_ENABLED === 'true';
  },

  get(): CryptoConfig {
    return {
      enabled: this.isEnabled(),
      version: import.meta.env.VITE_CRYPTO_VERSION || '1.0',
      timestampTolerance: Number(import.meta.env.VITE_CRYPTO_TIMESTAMP_TOLERANCE) || 300000,
      maxDataSize: Number(import.meta.env.VITE_CRYPTO_MAX_DATA_SIZE) || 10485760
    };
  },

  isTimestampValid(timestamp: number): boolean {
    const now = Date.now();
    const tolerance = this.get().timestampTolerance;
    return Math.abs(now - timestamp) <= tolerance;
  },

  isDataSizeValid(size: number): boolean {
    return size <= this.get().maxDataSize;
  }
};
```

## 6. 使用示例

### 6.1 业务代码使用

```typescript
// api/auth.ts
import request from '@/utils/request';

// 登录接口 - 自动加密
export function login(data: LoginRequest) {
  return request<LoginResponse>({
    url: '/auth/login',
    method: 'post',
    data  // 自动加密
  });
}

// 获取用户信息 - 自动解密
export function getUserInfo() {
  return request<UserInfo>({
    url: '/user/info',
    method: 'get'
  }); // 响应自动解密
}
```

### 6.2 组件中使用

```typescript
// pages/Login.tsx
const handleLogin = async (values: LoginForm) => {
  try {
    // 直接调用，无需关心加密
    const response = await login({
      username: values.username,
      password: values.password
    });
    
    // response已自动解密
    console.log('登录成功:', response.token);
  } catch (error) {
    console.error('登录失败:', error);
  }
};
```

## 7. 安全考虑

### 7.1 密钥管理

1. **环境隔离**: 开发、测试、生产使用不同密钥
2. **密钥轮换**: 定期更换密钥
3. **密钥保护**: 不在代码中硬编码密钥
4. **访问控制**: 限制密钥文件访问权限

### 7.2 防护措施

1. **时间戳验证**: 防止重放攻击
2. **数据大小限制**: 防止DoS攻击
3. **IV随机性**: 每次请求生成新IV
4. **错误处理**: 避免泄露敏感信息

### 7.3 性能优化

1. **密钥缓存**: 减少密钥解析开销
2. **异步处理**: 不阻塞主线程
3. **批量请求**: 考虑合并小请求
4. **压缩传输**: 配合gzip减少数据量

## 8. 故障排除

### 8.1 常见问题

**密钥长度错误**:
```
错误: 无效的AES密钥长度。期望32字节，实际为24字节
解决: 确保VITE_AES_KEY是32字节的Base64编码字符串
```

**解密失败**:
```
错误: 数据解密失败
原因: 
1. 前后端密钥不一致
2. IV传输错误
3. 数据被篡改
```

**时间戳验证失败**:
```
警告: 响应时间戳异常，可能存在重放攻击
原因: 客户端与服务器时间差超过容差值
解决: 同步系统时间或调整容差值
```

### 8.2 调试技巧

1. **启用调试日志**: 
```typescript
console.debug('加密前数据:', data);
console.debug('加密后数据:', encryptedData);
```

2. **验证密钥**:
```typescript
const isValid = await AESCryptoUtils.validateKey();
console.log('密钥有效性:', isValid);
```

3. **测试加解密**:
```typescript
const testData = { test: 'hello' };
const encrypted = await AESCryptoUtils.encryptForAPI(testData);
const decrypted = await AESCryptoUtils.decryptFromAPI(encrypted);
console.log('测试结果:', JSON.stringify(decrypted) === JSON.stringify(testData));
```

## 9. 最佳实践

### 9.1 开发建议

1. **统一使用request工具**: 确保所有API调用都经过加密处理
2. **避免直接使用axios**: 防止绕过加密机制
3. **合理设置数据大小**: 大文件考虑分片上传
4. **监控加密性能**: 关注加密对响应时间的影响

### 9.2 部署建议

1. **密钥管理**: 使用密钥管理服务
2. **HTTPS强制**: 加密传输通道
3. **监控告警**: 加解密失败率监控
4. **灰度发布**: 逐步启用加密功能

---

## 🎯 总结

SVT前端API加密系统通过透明的请求拦截机制，为前后端通信提供了强大的安全保障。系统设计充分考虑了安全性、性能和易用性，确保业务开发者可以无感使用加密功能，同时保持了良好的扩展性和维护性。

## 📚 相关文档

- [后端API加密实现](../../SVT-Server/docs/API-Encryption-AES.md)
- [环境变量配置说明](./环境变量配置说明.md)
- [开发指南](./开发指南.md)