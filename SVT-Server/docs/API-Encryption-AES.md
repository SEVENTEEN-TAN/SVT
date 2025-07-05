# API加密实现 (AES)

本文档描述SVT后端API加密的实际实现，基于实际代码分析。

## 1. 技术方案

### 加密算法
- **算法**: AES-256-CBC
- **密钥长度**: 256位 (32字节)
- **IV**: 128位 (16字节)，每次随机生成
- **填充**: PKCS5Padding
- **编码**: Base64
- **安全**: 使用SecureRandom生成随机IV

### 实现方式
- 使用 `AESCryptoFilter` 自动处理加解密
- 对业务代码透明，无需手动处理
- 支持开发/生产环境切换
- 数据大小限制：10MB
- 时间戳验证防重放攻击

## 2. 核心组件

### AESUtils (加密工具类)
位置：`com.seventeen.svt.common.util.AESUtils`

**主要方法：**
- `encrypt(String plainText, String ivString)` - 使用指定IV加密数据
- `decrypt(String encryptedData, String ivString)` - 使用指定IV解密数据
- `encryptWithIV(String plainText)` - 自动生成IV并加密
- `generateIV()` - 生成随机IV
- `isAESEnabled()` - 检查是否启用加密
- `validateKey()` - 验证密钥有效性
- `encryptForAPI(String jsonData)` - API专用加密方法
- `decryptFromAPI(Map<String, Object> encryptedData)` - API专用解密方法

**特性：**
- 自动验证密钥长度（必须32字节）
- 支持数据大小检查
- 完整的异常处理
- 详细的日志记录
- 时间戳容差验证

### AESCryptoFilter (过滤器)
位置：`com.seventeen.svt.common.filter.AESCryptoFilter`

功能：
- 自动解密请求体（POST/PUT/PATCH）
- 自动加密响应体
- 对GET请求和文件上传不处理
- 支持路径排除配置

### AESConfig (配置类)
位置：`com.seventeen.svt.common.config.AESConfig`

管理加密相关配置：
- 启用/禁用开关
- 密钥管理（Base64编码）
- 排除路径配置
- 数据大小限制设置
- 时间戳容差配置
- 调试模式开关

## 3. 数据格式

### 加密请求/响应格式
```json
{
  "encrypted": true,
  "data": "Base64编码的密文",
  "iv": "Base64编码的IV",
  "timestamp": 1735804800000,
  "version": "1.0"
}
```

**字段说明：**
- `encrypted`: 标识数据已加密（固定为true）
- `data`: AES-256-CBC加密后的Base64编码密文
- `iv`: 随机生成的16字节初始化向量（Base64编码）
- `timestamp`: Unix时间戳（防重放攻击）
- `version`: 格式版本号（当前为"1.0"）

### 时间戳验证
- 默认容差：10分钟
- 超出容差的请求在生产环境会被拒绝
- 调试模式下只记录警告不阻止
- 时间差计算：`Math.abs(currentTime - timestamp)`

## 4. 配置方式

### application.yml配置
```yaml
svt:
  security:
    aes:
      key: ${SVT_AES_KEY}  # 从环境变量读取（Base64编码的32字节密钥）
      enabled: true        # 是否启用加密
      max-data-size: 10485760  # 最大数据大小（10MB）
      timestamp-tolerance: 600000  # 时间戳容差（10分钟）
      debug: false         # 调试模式开关
```

### 环境变量
```bash
# 设置AES密钥（Base64编码的32字节密钥）
export SVT_AES_KEY=your_base64_encoded_32_byte_key_here

# 生成密钥示例（Linux/Mac）
openssl rand -base64 32

# 生成密钥示例（Windows PowerShell）
[System.Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### 密钥要求
- 必须是Base64编码格式
- 解码后长度必须是32字节（AES-256）
- 建议使用强随机生成器生成
- 生产环境定期轮换

## 5. 使用示例

### 自动加密（无需手动处理）
```java
@PostMapping("/api/user/create")
public Result<User> createUser(@RequestBody UserDTO userDTO) {
    // 请求体已自动解密
    User user = userService.create(userDTO);
    return Result.success(user);  // 响应会自动加密
}
```

### 检查加密状态
```java
@Autowired
private AESUtils aesUtils;

if (aesUtils.isAESEnabled()) {
    // 加密已启用
    boolean keyValid = aesUtils.validateKey();
    if (keyValid) {
        log.info("AES加密已启用且密钥有效");
    }
}
```

### 手动加密（特殊情况）
```java
@Autowired
private AESUtils aesUtils;

// 加密JSON数据为API格式
String jsonData = "{\"message\":\"Hello World\"}";
Map<String, Object> encrypted = aesUtils.encryptForAPI(jsonData);

// 解密API格式数据
String decrypted = aesUtils.decryptFromAPI(encrypted);

// 自定义IV加密
String iv = aesUtils.generateIV();
String encryptedData = aesUtils.encrypt("plaintext", iv);
String decryptedData = aesUtils.decrypt(encryptedData, iv);
```

### 异常处理
```java
try {
    Map<String, Object> result = aesUtils.encryptForAPI(data);
    return Result.success(result);
} catch (BusinessException e) {
    log.error("加密失败: {}", e.getMessage());
    return Result.error("数据处理失败");
}
```

## 6. 注意事项

### 密钥安全
- 使用环境变量管理密钥，严禁硬编码
- 密钥必须是Base64编码的32字节随机数据
- 生产环境定期轮换密钥
- 密钥丢失将导致所有加密数据无法解密

### 性能考虑
- 大文件传输建议使用其他方式（如直接文件传输）
- 数据大小限制10MB，可通过配置调整
- 开发环境可关闭加密提升调试效率
- 加密解密过程会增加CPU开销

### 兼容性
- GET请求不加密（查询参数明文传输）
- 文件上传接口自动排除
- 支持明文降级（调试模式）
- 老版本客户端需要升级支持加密格式

### 故障排查
1. **密钥错误**
   - 检查环境变量`SVT_AES_KEY`是否正确设置
   - 验证密钥是否为有效的Base64编码
   - 确认解码后长度为32字节

2. **时间戳错误**
   - 检查客户端与服务器时间同步
   - 确认时间戳容差配置合理
   - 调试模式下查看详细日志

3. **数据大小超限**
   - 检查数据是否超过配置的最大大小
   - 考虑数据分片或压缩
   - 调整配置参数

### 监控建议
- 监控加密失败率
- 统计加密性能指标
- 记录异常解密尝试
- 定期检查密钥有效期 