# SVT管理系统AES加密架构方案

**文档版本**: v1.0  
**创建时间**: 2025-06-17 13:38:52 +08:00  
**架构师**: AR (SEVENTEEN)  
**协议版本**: RIPER-5 v4.1

## 架构概述

### 设计目标
在SVT管理系统现有架构基础上，实施API请求的AES加密机制，形成多层安全防护体系：
- **L1**: HTTPS传输加密（已有）
- **L2**: AES应用层加密（新增）⭐
- **L3**: SM4密码字段加密（已有，保持不变）

### 核心原则
1. **安全优先**：提升API数据传输安全等级
2. **兼容平滑**：支持渐进式迁移，确保系统稳定
3. **性能平衡**：在安全和性能之间找到最佳平衡点
4. **运维友好**：简化配置管理和故障排查

## 技术架构设计

### 1. 技术选型

| 组件 | 前端选择 | 后端选择 | 理由 |
|------|----------|----------|------|
| 加密算法 | AES-256-CBC | AES-256-CBC | 安全性高，兼容性好 |
| 加密库 | crypto-js | Java Cipher | 成熟稳定，性能优秀 |
| 数据格式 | JSON包装 | JSON解析 | 结构化，易扩展 |
| 密钥管理 | 动态获取 | 配置文件+环境变量 | 灵活安全 |

### 2. 数据格式设计

#### 2.1 加密请求格式
```json
{
  "encrypted": true,
  "data": "base64编码的加密数据",
  "iv": "base64编码的初始化向量",
  "timestamp": 1701234567890,
  "version": "1.0"
}
```

#### 2.2 原始数据示例
```json
// 加密前
{
  "username": "admin",
  "password": "123456",
  "rememberMe": true
}

// 加密后
{
  "encrypted": true,
  "data": "K8ZvFQ7+9x2jR8sQ3Km...（Base64）",
  "iv": "Zm5hY24gZU1WR0F...（Base64）",
  "timestamp": 1701234567890,
  "version": "1.0"
}
```

### 3. 系统集成架构

#### 3.1 前端集成架构
```
React App
    ↓
API调用 (api.post/get/put/delete)
    ↓
Axios请求拦截器
    ↓
[新增] AES加密处理
    ↓
HTTP请求发送
    ↓
Axios响应拦截器
    ↓
[新增] AES解密处理
    ↓
业务逻辑处理
```

#### 3.2 后端集成架构
```
HTTP请求接收
    ↓
RequestWrapperFilter (Order=50)
    ↓
[新增] AESDecryptionFilter (Order=60)
    ↓
JwtAuthenticationFilter (Order=70)
    ↓
业务Controller处理
    ↓
[新增] AES响应加密
    ↓
HTTP响应返回
```

### 4. 核心组件设计

#### 4.1 前端AES工具类
```typescript
// src/utils/crypto.ts
export class AESCryptoUtils {
  private static key: string;
  private static algorithm = 'AES-CBC';

  static async encrypt(data: any): Promise<EncryptedData> {
    // 实现AES加密逻辑
  }

  static async decrypt(encryptedData: EncryptedData): Promise<any> {
    // 实现AES解密逻辑
  }

  static generateIV(): string {
    // 生成随机IV
  }
}
```

#### 4.2 后端AES工具类
```java
// com.seventeen.svt.common.util.AESUtils
@Component
public class AESUtils {
    
    @Value("${svt.security.aes.key}")
    private String secretKey;
    
    public String encrypt(String plainText) throws Exception {
        // 实现AES加密逻辑
    }
    
    public String decrypt(String encryptedData, String iv) throws Exception {
        // 实现AES解密逻辑
    }
}
```

#### 4.3 后端过滤器设计
```java
// com.seventeen.svt.frame.security.filter.AESDecryptionFilter
@Component
@Order(60)
public class AESDecryptionFilter implements Filter {
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, 
                        FilterChain chain) throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        
        // 检查是否为加密请求
        if (isEncryptedRequest(httpRequest)) {
            // 解密请求体
            RequestWrapper decryptedRequest = decryptRequest(httpRequest);
            chain.doFilter(decryptedRequest, response);
        } else {
            // 非加密请求，直接处理
            chain.doFilter(request, response);
        }
    }
}
```

## 配置管理设计

### 1. 后端配置
```yaml
# application.yml
svt:
  security:
    aes:
      enabled: true
      key: ${AES_SECRET_KEY:SVT-DEFAULT-AES-KEY-256BITS-FOR-DEV}
      algorithm: AES/CBC/PKCS5Padding
      key-length: 256
      max-data-size: 10485760  # 10MB
```

### 2. 前端配置
```typescript
// src/config/crypto.ts
export const cryptoConfig = {
  enabled: import.meta.env.VITE_AES_ENABLED === 'true',
  algorithm: 'AES-CBC',
  keyLength: 256,
  maxDataSize: 10 * 1024 * 1024, // 10MB
  keyEndpoint: '/api/crypto/key'
};
```

### 3. 环境变量配置
```bash
# 开发环境
VITE_AES_ENABLED=true
AES_SECRET_KEY=SVT-DEFAULT-AES-KEY-256BITS-FOR-DEV

# 生产环境
VITE_AES_ENABLED=true
AES_SECRET_KEY=${从安全密钥管理系统获取}
```

## 密钥管理策略

### 1. 开发环境（静态密钥）
- 使用固定的开发密钥
- 配置在application.yml中
- 适合开发和测试

### 2. 生产环境（动态密钥）
- 密钥存储在安全的密钥管理系统
- 通过环境变量注入
- 支持定期轮换机制

### 3. 密钥分发机制
```typescript
// 前端获取密钥
class KeyManager {
  static async getKey(): Promise<string> {
    if (this.cachedKey && !this.isExpired()) {
      return this.cachedKey;
    }
    
    // 从服务器获取密钥（加密传输）
    const keyResponse = await api.get('/api/crypto/key');
    this.cachedKey = keyResponse.key;
    this.expiry = Date.now() + keyResponse.ttl;
    
    return this.cachedKey;
  }
}
```

## 性能优化策略

### 1. 缓存优化
- **密钥缓存**：前后端都缓存密钥，避免重复获取
- **Cipher实例复用**：预创建Cipher实例池，避免重复初始化
- **IV生成优化**：使用高效的随机数生成器

### 2. 数据处理优化
```java
// Cipher实例池
@Component
public class CipherPool {
    private final BlockingQueue<Cipher> encryptCiphers = new LinkedBlockingQueue<>();
    private final BlockingQueue<Cipher> decryptCiphers = new LinkedBlockingQueue<>();
    
    public Cipher getEncryptCipher() throws Exception {
        Cipher cipher = encryptCiphers.poll();
        if (cipher == null) {
            cipher = createEncryptCipher();
        }
        return cipher;
    }
    
    public void returnCipher(Cipher cipher, boolean isEncrypt) {
        if (isEncrypt) {
            encryptCiphers.offer(cipher);
        } else {
            decryptCiphers.offer(cipher);
        }
    }
}
```

### 3. 性能监控指标
```java
// 性能监控
@Component
public class AESPerformanceMonitor {
    private final MeterRegistry meterRegistry;
    
    public void recordEncryptionTime(long durationMs) {
        Timer.Sample.start(meterRegistry)
            .stop(Timer.builder("aes.encryption.duration")
                .tag("operation", "encrypt")
                .register(meterRegistry));
    }
    
    public void recordDecryptionFailure() {
        Counter.builder("aes.decryption.failures")
            .register(meterRegistry)
            .increment();
    }
}
```

## 错误处理与监控

### 1. 异常分类处理
```java
public enum AESErrorType {
    INVALID_FORMAT("请求格式错误", 400),
    DECRYPTION_FAILED("数据解密失败", 400),
    KEY_ERROR("密钥错误", 500),
    DATA_TOO_LARGE("数据过大", 413);
    
    private final String message;
    private final int httpStatus;
}
```

### 2. 日志记录策略
```java
@Slf4j
public class AESAuditLogger {
    
    public void logEncryptionEvent(String operation, boolean success, 
                                   long durationMs, int dataSize) {
        if (success) {
            log.info("AES {} success - duration: {}ms, size: {}bytes", 
                     operation, durationMs, dataSize);
        } else {
            log.warn("AES {} failed - duration: {}ms, size: {}bytes", 
                     operation, durationMs, dataSize);
        }
    }
    
    // 不记录敏感信息，只记录操作结果
}
```

### 3. 监控指标设计
- **性能指标**：加解密耗时、吞吐量、数据大小分布
- **质量指标**：成功率、失败率、错误类型分布
- **安全指标**：异常请求检测、攻击模式识别

## 安全性加固措施

### 1. 防重放攻击
```json
{
  "encrypted": true,
  "data": "...",
  "iv": "...",
  "timestamp": 1701234567890,  // 时间戳验证
  "nonce": "unique-request-id", // 请求唯一标识
  "version": "1.0"
}
```

### 2. 数据完整性验证
```java
// 添加HMAC验证
public class AESWithHMAC {
    public String encryptWithHMAC(String data) {
        String encrypted = aesEncrypt(data);
        String hmac = calculateHMAC(encrypted);
        return encrypted + ":" + hmac;
    }
    
    public String decryptWithHMAC(String encryptedWithHMAC) {
        String[] parts = encryptedWithHMAC.split(":");
        String encrypted = parts[0];
        String hmac = parts[1];
        
        // 验证HMAC
        if (!verifyHMAC(encrypted, hmac)) {
            throw new SecurityException("数据完整性验证失败");
        }
        
        return aesDecrypt(encrypted);
    }
}
```

### 3. 密钥轮换机制
```java
@Scheduled(cron = "0 0 2 * * ?") // 每天凌晨2点
public void rotateKeys() {
    if (isProduction()) {
        String newKey = keyManagementService.generateNewKey();
        keyManagementService.rotateKey(newKey);
        log.info("AES key rotated successfully");
    }
}
```

## 测试策略

### 1. 单元测试覆盖
- AES工具类测试：加密解密正确性、性能测试
- 过滤器测试：请求处理逻辑、异常处理
- 配置测试：各种配置场景验证

### 2. 集成测试覆盖
- 端到端加密测试：前端→后端→前端完整流程
- 兼容性测试：加密和非加密请求共存
- 性能测试：加密对系统性能的影响

### 3. 安全测试覆盖
- 密钥安全测试：密钥泄露场景验证
- 攻击模拟测试：重放攻击、篡改攻击防护
- 边界条件测试：大数据、异常格式处理

## 部署与运维

### 1. 部署检查清单
- [ ] 环境变量配置正确
- [ ] 密钥配置安全
- [ ] 性能监控就绪
- [ ] 日志收集配置
- [ ] 回滚方案准备

### 2. 运维工具
```bash
# 加密测试工具
curl -X POST http://localhost:8080/api/test/encrypt \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

# 性能监控
curl http://localhost:8080/actuator/metrics/aes.encryption.duration
```

### 3. 故障排查指南
1. **解密失败**：检查密钥配置、数据格式
2. **性能下降**：检查监控指标、调整缓存配置
3. **兼容性问题**：验证请求格式检测逻辑

## 架构演进规划

### Phase 1: 基础实施（当前）
- 静态密钥管理
- 基础加密解密功能
- 核心接口迁移

### Phase 2: 安全增强（未来3个月）
- 动态密钥管理
- HMAC完整性验证
- 高级攻击防护

### Phase 3: 性能优化（未来6个月）
- 硬件加速支持
- 分布式密钥管理
- 智能加密策略

---

**文档状态**: ✅ 已完成  
**审核状态**: 待审核  
**实施状态**: 准备就绪  

**更新历史**:
- v1.0 (2025-06-17): 初始版本，完整架构设计 