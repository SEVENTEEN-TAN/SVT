# API加密 (AES) - 前端实现

本文档详细描述了SVT项目前端如何通过AES加密来保护与后端API的通信安全。

## 1. 设计目标
- **协同后端**: 与后端采用完全一致的加密方案，确保数据可以被正确加解密。
- **无感集成**: 将加解密逻辑封装在HTTP请求工具中，对业务层的页面和组件代码透明。
- **配置驱动**: 加密功能可通过环境变量进行全局控制。
- **密钥安全**: 密钥从环境变量加载，不硬编码在代码中。

## 2. 加密方案
- **算法**: AES-256-CBC
- **密钥长度**: 256位 (32字节)
- **IV (初始化向量)**: 128位 (16字节)，每个请求动态生成。
- **填充模式**: PKCS7
- **编码**: 密钥、IV和密文均使用Base64编码进行传输。
- **核心库**: `crypto-js`

## 3. 实现架构

前端的API加密主要由两部分协作完成：`utils/crypto.ts`（加密核心）和`utils/request.ts`（Axios拦截器）。

```mermaid
graph TD
    A[页面/组件] -->|调用API方法| B(api/auth.ts);
    B --> C{request.ts (Axios实例)};
    
    subgraph C [Axios Interceptors]
        D(请求拦截器) --> E{加密是否启用?};
        E -- Yes --> F(调用crypto.ts加密请求体);
        F --> G(构造加密荷载);
        E -- No --> H(发送原始请求);
        G --> H;
    end
    
    H --> I((后端API));
    I --> J[Axios响应];

    subgraph C
        K(响应拦截器) --> L{数据是否加密?};
        L -- Yes --> M(调用crypto.ts解密响应体);
        M --> N(返回解密后的数据);
        L -- No --> O(返回原始数据);
    end

    J --> K;
    N --> A;
    O --> A;

```

1.  **`utils/crypto.ts`**:
    -   这是一个封装了`crypto-js`的工具类`AESCryptoUtils`。
    -   `getKey()`: 从环境变量`VITE_AES_KEY`中异步加载并缓存Base64编码的AES密钥。
    -   `encrypt(plainText, iv)`: 执行AES加密。
    -   `decrypt(cipherText, iv)`: 执行AES解密。
    -   `encryptForAPI(data)`: 将一个JSON对象完整地处理成后端要求的加密荷载格式。
    -   `decryptFromAPI(encryptedResponse)`: 将后端返回的加密荷载解密成JSON对象。

2.  **`utils/request.ts`**:
    -   这里创建了一个Axios实例，并为其配置了请求和响应拦截器。
    -   **请求拦截器**:
        -   在每个请求发送前，检查全局加密开关是否开启。
        -   如果开启，调用`AESCryptoUtils.encryptForAPI`将`config.data`（即POST/PUT请求的body）替换为加密后的荷载。
    -   **响应拦截器**:
        -   在收到响应后，检查响应体`response.data`是否符合加密荷载的格式（例如，`data.encrypted === true`）。
        -   如果符合，调用`AESCryptoUtils.decryptFromAPI`进行解密，并将解密后的数据作为最终的响应数据返回。
        -   如果不符合，直接返回原始数据。

## 4. 加密数据格式

前端生成的加密荷载与后端完全一致。

```json
{
  "encrypted": true,
  "data": "Base64-encoded-ciphertext",
  "iv": "Base64-encoded-iv",
  "timestamp": 1678886400000,
  "version": "1.0"
}
```
- `iv`: 由`CryptoJS.lib.WordArray.random(16)`在每个请求前动态生成。

## 5. 配置

前端的加密配置由`.env`文件管理。

**`.env.development` / `.env.production`:**
```
# 是否启用AES加密 (true/false)
VITE_CRYPTO_ENABLED=true

# AES 密钥 (Base64编码, 32字节)
# 必须与后端的密钥完全一致
VITE_AES_KEY="your-32-byte-base64-encoded-aes-key-here"
```
`config/crypto.ts`文件负责读取这些环境变量并提供给`crypto.ts`使用。

## 6. 使用流程

对于业务开发者而言，整个过程是无感的。

```typescript
// src/api/auth.ts

import request from '@/utils/request';

// 开发者正常调用API
export function login(data: LoginRequest) {
  // request工具会自动处理data的加密和响应的解密
  return request<LoginResponse>({
    url: '/auth/login',
    method: 'post',
    data,
  });
}
```
开发者无需关心`data`对象是如何被加密的，也无需关心从`request`返回的结果是如何被解密的，所有复杂性都被封装在了`request.ts`和`crypto.ts`中。 