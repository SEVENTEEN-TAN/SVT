# SM4配置文件加密详细指南

## 概述

SM4（国密算法）是中国的商用密码标准，用于加密配置文件中的敏感信息。本文档详细介绍SVT项目中SM4配置加密的实现、使用和最佳实践。

## 目录
1. [技术规格](#1-技术规格)
2. [核心组件](#2-核心组件)
3. [配置文件加密](#3-配置文件加密)
4. [环境变量管理](#4-环境变量管理)
5. [加密工具使用](#5-加密工具使用)
6. [部署配置](#6-部署配置)
7. [故障排除](#7-故障排除)
8. [安全最佳实践](#8-安全最佳实践)

---

## 1. 技术规格

### 1.1 加密算法
- **主算法**: SM4-CBC (密码分组链接模式)
- **密钥长度**: 128位 (16字节)
- **分组长度**: 128位 (16字节)
- **填充方式**: PKCS7Padding
- **初始向量**: 随机生成，16字节

### 1.2 安全参数
```java
// SM4Utils.java 中的配置
private static final String ALGORITHM = "SM4";
private static final String TRANSFORMATION = "SM4/CBC/PKCS7Padding";
private static final int KEY_SIZE = 16; // 128位
private static final int IV_SIZE = 16;  // 128位
```

### 1.3 依赖版本
```xml
<!-- SVT项目中的SM4依赖配置 -->
<dependency>
    <groupId>org.bouncycastle</groupId>
    <artifactId>bcprov-jdk18on</artifactId>
    <version>1.78.1</version>
</dependency>
```

---

## 2. 核心组件

### 2.1 SM4Utils 工具类

```java
/**
 * SM4加密工具类
 * 支持CBC模式，提供配置文件加密/解密功能
 */
@Component
public class SM4Utils {
    
    private static final Logger logger = LoggerFactory.getLogger(SM4Utils.class);
    
    // 添加BouncyCastle安全提供者
    static {
        if (Security.getProvider("BC") == null) {
            Security.addProvider(new BouncyCastleProvider());
        }
    }
    
    /**
     * SM4-CBC模式加密
     */
    public static String encryptCBC(String plainText, String key) {
        try {
            // 生成密钥
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), ALGORITHM);
            
            // 初始化cipher
            Cipher cipher = Cipher.getInstance(TRANSFORMATION, "BC");
            
            // 生成随机IV
            byte[] iv = new byte[IV_SIZE];
            SecureRandom.getInstanceStrong().nextBytes(iv);
            IvParameterSpec ivSpec = new IvParameterSpec(iv);
            
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, ivSpec);
            
            // 加密数据
            byte[] encrypted = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));
            
            // 将IV和加密数据拼接后进行Base64编码
            byte[] result = new byte[IV_SIZE + encrypted.length];
            System.arraycopy(iv, 0, result, 0, IV_SIZE);
            System.arraycopy(encrypted, 0, result, IV_SIZE, encrypted.length);
            
            return Base64.getEncoder().encodeToString(result);
        } catch (Exception e) {
            logger.error("SM4-CBC加密失败", e);
            throw new RuntimeException("SM4-CBC加密失败", e);
        }
    }
    
    /**
     * SM4-CBC模式解密
     */
    public static String decryptCBC(String encryptedText, String key) {
        try {
            // Base64解码
            byte[] data = Base64.getDecoder().decode(encryptedText);
            
            // 提取IV和加密数据
            byte[] iv = new byte[IV_SIZE];
            byte[] encrypted = new byte[data.length - IV_SIZE];
            System.arraycopy(data, 0, iv, 0, IV_SIZE);
            System.arraycopy(data, IV_SIZE, encrypted, 0, encrypted.length);
            
            // 生成密钥
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), ALGORITHM);
            
            // 初始化cipher
            Cipher cipher = Cipher.getInstance(TRANSFORMATION, "BC");
            IvParameterSpec ivSpec = new IvParameterSpec(iv);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, ivSpec);
            
            // 解密数据
            byte[] decrypted = cipher.doFinal(encrypted);
            
            return new String(decrypted, StandardCharsets.UTF_8);
        } catch (Exception e) {
            logger.error("SM4-CBC解密失败", e);
            throw new RuntimeException("SM4-CBC解密失败", e);
        }
    }
}
```

### 2.2 SM4ConfigDecryptProcessor 配置处理器

```java
/**
 * SM4配置解密处理器
 * 实现EnvironmentPostProcessor接口，在Spring Boot启动时自动解密配置
 */
public class SM4ConfigDecryptProcessor implements EnvironmentPostProcessor {
    
    private static final Logger logger = LoggerFactory.getLogger(SM4ConfigDecryptProcessor.class);
    private static final String SM4_PREFIX = "SM4(";
    private static final String SM4_SUFFIX = ")";
    
    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        // 获取SM4密钥
        String sm4Key = environment.getProperty("SM4_KEY");
        if (sm4Key == null) {
            sm4Key = System.getenv("SM4_KEY");
        }
        
        if (sm4Key == null || sm4Key.trim().isEmpty()) {
            logger.warn("SM4_KEY环境变量未设置，跳过SM4配置解密");
            return;
        }
        
        // 处理所有配置源
        for (PropertySource<?> propertySource : environment.getPropertySources()) {
            if (propertySource instanceof MapPropertySource) {
                processMapPropertySource((MapPropertySource) propertySource, sm4Key);
            }
        }
    }
    
    private void processMapPropertySource(MapPropertySource propertySource, String sm4Key) {
        Map<String, Object> source = propertySource.getSource();
        for (Map.Entry<String, Object> entry : source.entrySet()) {
            Object value = entry.getValue();
            if (value instanceof String) {
                String stringValue = (String) value;
                if (stringValue.startsWith(SM4_PREFIX) && stringValue.endsWith(SM4_SUFFIX)) {
                    try {
                        String encryptedValue = stringValue.substring(SM4_PREFIX.length(), stringValue.length() - SM4_SUFFIX.length());
                        String decryptedValue = SM4Utils.decryptCBC(encryptedValue, sm4Key);
                        source.put(entry.getKey(), decryptedValue);
                        logger.debug("成功解密配置项: {}", entry.getKey());
                    } catch (Exception e) {
                        logger.error("解密配置项失败: {}", entry.getKey(), e);
                    }
                }
            }
        }
    }
}
```

---

## 3. 配置文件加密

### 3.1 支持的配置文件格式

SM4配置加密支持多种Spring Boot配置文件格式：
- `application.yml` / `application.yaml`
- `application.properties`
- `application-{profile}.yml`

### 3.2 配置文件中的使用语法

**YAML格式（SVT项目实际配置示例）:**
```yaml
# application-dev.yml 开发环境配置
spring:
  datasource:
    url: jdbc:sqlserver://localhost:1433;databaseName=svt_db;encrypt=true;trustServerCertificate=true
    username: sa
    password: SM4(UQcB8L5X+OABnN5xgK/PTgMrElv9pHiNkLDXZhKVGGBgKGF5MFm1wg==)  # 数据库密码
    
  data:
    redis:
      host: localhost
      port: 6379
      password: SM4(9vGNGzOVWNRqvMiL/8TJ6wxOJy7vGwmLEZWnBKjTbLo=)  # Redis密码
      database: 1
      
# JWT配置
jwt:
  secret: SM4(kLJhFGvbvBNMDmWhIBzF8kCgF9gZNFTAoQ2sNP6VyXGZ7rGDlvQGqLwHXGKWBUa5B7dqJpMHWQ==)
  
# AES配置
svt:
  security:
    aes:
      key: SM4(lKJhFGvbvBNMDmWhIBzF8kCgF9gZNFTAoQ2sNP6VyXGZ7rGDlvQGqLwHXGKWBUa5B7dqJpMHWQ==)
```

**Properties格式:**
```properties
spring.datasource.password=SM4(UQcB8L5X+OABnN5xgK/PTgMrElv9pHiNkLDXZhKVGGBgKGF5MFm1wg==)
spring.data.redis.password=SM4(9vGNGzOVWNRqvMiL/8TJ6wxOJy7vGwmLEZWnBKjTbLo=)
jwt.secret=SM4(kLJhFGvbvBNMDmWhIBzF8kCgF9gZNFTAoQ2sNP6VyXGZ7rGDlvQGqLwHXGKWBUa5B7dqJpMHWQ==)
```

### 3.3 加密规则

1. **格式**: `SM4(加密后的文本)`
2. **大小写敏感**: `SM4` 必须大写
3. **括号必须**: 加密文本必须用圆括号包围
4. **无空格**: `SM4(` 之间不能有空格
5. **Base64编码**: 加密后的文本使用Base64编码

---

## 4. 环境变量管理

### 4.1 环境变量设置

**Windows (PowerShell):**
```powershell
$env:SM4_KEY="SVT2025SM4KEY128"
```

**Windows (CMD):**
```cmd
set SM4_KEY=SVT2025SM4KEY128
```

**Linux/macOS:**
```bash
export SM4_KEY="SVT2025SM4KEY128"
```

**Docker:**
```dockerfile
ENV SM4_KEY=SVT2025SM4KEY128
```

**Docker Compose:**
```yaml
services:
  svt-server:
    environment:
      - SM4_KEY=SVT2025SM4KEY128
```

### 4.2 环境隔离策略

不同环境使用不同的SM4密钥：

```bash
# 开发环境（与工具类保持一致）
export SM4_KEY="SVT2025SM4KEY128"

# UAT测试环境  
export SM4_KEY="SVT2025SM4UATKEY"

# 生产环境（请使用更强的密钥）
export SM4_KEY="SVT2025SM4PRODKEY"
```

**密钥要求：**
- 必须是16字节（16个字符）
- 建议使用字母、数字组合
- 不同环境使用不同密钥

---

## 5. 加密工具使用

### 5.1 通过测试类生成加密值

**SVT项目提供了专门的测试类 `SM4ConfigEncryptionTool`：**

```java
/**
 * SM4配置加密工具
 * 用于生成配置文件中敏感信息的SM4加密密文（CBC模式）
 */
public class SM4ConfigEncryptionTool {
    
    // SM4加密密钥 (16字节/128位)
    private static final String SM4_KEY = "SVT2025SM4KEY128";
    
    /**
     * 生成所有需要的配置加密值
     */
    @Test
    public void generateAllEncryptedConfigs() {
        Map<String, String> configs = new LinkedHashMap<>();
        configs.put("数据库密码", "Tsq19971108!");
        configs.put("Redis密码", "123456");
        configs.put("JWT密钥", "SVT-DEV-JWT-SECRET-CHANGE-ME-5678-VERY-LONG-AND-SECURE");
        configs.put("AES密钥", "wJ/6sgrWER8T14S3z1esg39g7sL8f8b+J5fCg6a5fGg=");
        
        for (Map.Entry<String, String> entry : configs.entrySet()) {
            encryptAndPrint(entry.getKey(), entry.getValue());
        }
    }
    
    /**
     * 生成YAML配置示例
     */
    @Test
    public void generateYamlExample() {
        String dbPassword = SM4Utils.encryptCBC("Tsq19971108!", SM4_KEY);
        String redisPassword = SM4Utils.encryptCBC("123456", SM4_KEY);
        String jwtSecret = SM4Utils.encryptCBC("SVT-DEV-JWT-SECRET-CHANGE-ME-5678-VERY-LONG-AND-SECURE", SM4_KEY);
        String aesKey = SM4Utils.encryptCBC("wJ/6sgrWER8T14S3z1esg39g7sL8f8b+J5fCg6a5fGg=", SM4_KEY);
        
        System.out.println("# application-dev.yml");
        System.out.println("spring:");
        System.out.println("  datasource:");
        System.out.println("    password: SM4(" + dbPassword + ")");
        System.out.println("  data:");
        System.out.println("    redis:");
        System.out.println("      password: SM4(" + redisPassword + ")");
        System.out.println("jwt:");
        System.out.println("  secret: SM4(" + jwtSecret + ")");
        System.out.println("svt:");
        System.out.println("  security:");
        System.out.println("    aes:");
        System.out.println("      key: SM4(" + aesKey + ")");
    }
}
```

### 5.2 运行加密测试

**方法一：运行测试类（推荐）**
```bash
# 1. 设置环境变量
export SM4_KEY="SVT2025SM4KEY128"

# 2. 运行测试生成加密值
mvn test -Dtest=SM4ConfigEncryptionTool#generateAllEncryptedConfigs

# 3. 查看控制台输出的加密值
```

**方法二：使用独立工具文件**
```bash
# 1. 编译并运行独立的加密工具
cd SVT-Server
javac -cp target/classes GenerateSM4Configs.java
java -cp target/classes:. GenerateSM4Configs

# 2. 查看输出结果
```

**方法三：集成到应用中**
```java
// 在Spring Boot应用中直接调用
public class ConfigEncryptionService {
    
    @Value("${SM4_KEY}")
    private String sm4Key;
    
    public String encryptConfig(String plainText) {
        return SM4Utils.encryptCBC(plainText, sm4Key);
    }
    
    public String decryptConfig(String encryptedText) {
        return SM4Utils.decryptCBC(encryptedText, sm4Key);
    }
}
```

---

## 6. 部署配置

### 6.1 应用启动配置

**Maven启动:**
```bash
export SM4_KEY="SVT2025SM4KEY128"
mvn spring-boot:run
```

**JAR包启动:**
```bash
export SM4_KEY="SVT2025SM4KEY128"
java -jar SVT-Server-1.0.1-SNAPSHOT.jar
```

**系统服务配置 (systemd):**
```ini
[Unit]
Description=SVT Server Application
After=network.target

[Service]
Type=forking
User=svt
Environment=SM4_KEY=SVT2025SM4KEY128
ExecStart=/usr/bin/java -jar /opt/svt/SVT-Server-1.0.1-SNAPSHOT.jar
Restart=always

[Install]
WantedBy=multi-user.target
```

### 6.2 容器化部署

**Dockerfile:**
```dockerfile
FROM openjdk:21-jre-slim
COPY target/SVT-Server-1.0.1-SNAPSHOT.jar app.jar
ENV SM4_KEY=""
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

**Kubernetes Secret:**
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: svt-sm4-secret
type: Opaque
data:
  sm4-key: <base64-encoded-key>
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: svt-server
spec:
  template:
    spec:
      containers:
      - name: svt-server
        image: svt-server:latest
        env:
        - name: SM4_KEY
          valueFrom:
            secretKeyRef:
              name: svt-sm4-secret
              key: sm4-key
```

---

## 7. 故障排除

### 7.1 常见错误及解决方案

**错误1: 未设置环境变量**
```
Error: SM4_KEY环境变量未设置，跳过SM4配置解密
```
**解决**: 设置环境变量 `SM4_KEY`

**错误2: 解密失败**
```
Error: SM4-CBC解密失败
```
**解决**: 
- 检查环境变量是否正确设置
- 确认加密值格式正确 `SM4(...)`
- 验证密钥长度为16字节
- 检查Base64编码是否正确

**错误3: 配置文件格式错误**
```
Error: Could not resolve placeholder 'SM4(xxx)'
```
**解决**:
- 检查 `SM4()` 格式是否正确
- 确认没有多余的空格
- 验证YAML缩进是否正确

**错误4: BouncyCastle提供者未找到**
```
Error: java.security.NoSuchAlgorithmException: SM4 KeyGenerator not available
```
**解决**:
- 确认BouncyCastle依赖已正确添加
- 检查安全提供者是否正确注册

### 7.2 调试模式

启用SM4调试日志：
```yaml
logging:
  level:
    com.seventeen.svt.common.config.SM4ConfigDecryptProcessor: DEBUG
    com.seventeen.svt.common.util.SM4Utils: DEBUG
```

**启动时的日志验证：**
```
2025-01-XX XX:XX:XX.XXX  INFO --- [main] c.s.s.c.c.SM4ConfigDecryptProcessor : 成功解密配置项: spring.datasource.password
2025-01-XX XX:XX:XX.XXX  INFO --- [main] c.s.s.c.c.SM4ConfigDecryptProcessor : 成功解密配置项: spring.data.redis.password
2025-01-XX XX:XX:XX.XXX  INFO --- [main] c.s.s.c.c.SM4ConfigDecryptProcessor : 成功解密配置项: jwt.secret
```

---

## 8. 安全最佳实践

### 8.1 密钥管理

✅ **推荐做法:**
- 使用16字节强密钥（必须严格16字符）
- 不同环境使用不同密钥
- 定期轮换密钥
- 使用密钥管理服务存储生产密钥
- 生产环境密钥示例：`SVT2025SM4PRODKEY`

❌ **避免做法:**
- 将密钥硬编码在代码中
- 使用弱密钥或测试密钥
- 密钥长度不是16字节
- 在日志中输出密钥

### 8.2 加密策略

✅ **推荐做法:**
- 只加密敏感配置（密码、密钥、Token）
- 使用CBC模式提高安全性
- 每次加密使用随机IV
- 定期审查加密的配置项

❌ **避免做法:**
- 加密所有配置项
- 重复使用相同的IV
- 忽略加密算法的安全更新

### 8.3 运维安全

✅ **推荐做法:**
- 限制对环境变量的访问权限
- 使用容器secrets管理密钥
- 监控配置文件的访问和修改
- 定期安全审计

❌ **避免做法:**
- 在进程列表中暴露密钥
- 通过不安全的渠道传输密钥
- 在版本控制中提交密钥

---

## 9. SVT项目集成实践

### 9.1 快速开始指南

**第一步：设置环境变量**
```bash
# Windows (PowerShell)
$env:SM4_KEY="SVT2025SM4KEY128"

# Linux/macOS
export SM4_KEY="SVT2025SM4KEY128"
```

**第二步：运行测试生成加密值**
```bash
cd SVT-Server
mvn test -Dtest=SM4ConfigEncryptionTool#generateAllEncryptedConfigs
```

**第三步：复制加密值到配置文件**
```yaml
# 将测试输出的 SM4(...) 值复制到 application-{profile}.yml
spring:
  datasource:
    password: SM4(generated_encrypted_value_here)
```

**第四步：启动应用验证**
```bash
# 确保环境变量已设置，然后启动应用
mvn spring-boot:run
```

### 9.2 SVT项目中的实际应用

**已加密的配置项：**
- 数据库连接密码 (`spring.datasource.password`)
- Redis连接密码 (`spring.data.redis.password`)
- JWT签名密钥 (`jwt.secret`)
- AES加密密钥 (`svt.security.aes.key`)

**配置文件位置：**
- 开发环境：`application-dev.yml`
- UAT环境：`application-uat.yml`
- 生产环境：`application-prod.yml`

### 9.3 与其他安全组件集成

**与AES API加密协同:**
```java
// SM4: 配置文件敏感信息加密
// AES: API请求响应数据加密
// 两者使用不同的密钥和用途，相互独立工作
```

**与Argon2密码哈希协同:**
```java
// SM4: 配置文件加密
// Argon2: 用户密码哈希
// 两者提供不同层面的安全保护
```

---

## 10. 与Jasypt对比

### 10.1 技术对比

| 特性 | SM4 | Jasypt |
|------|-----|---------|
| 算法标准 | 国密SM4 | 国际标准AES |
| 密钥长度 | 128位固定 | 256位可配 |
| 加密模式 | CBC | 多种模式 |
| 性能 | 高 | 中等 |
| 合规性 | 符合国密标准 | 符合国际标准 |

### 10.2 迁移指南

**从Jasypt迁移到SM4：**
1. 使用SM4工具类重新生成所有加密值
2. 更新配置文件格式 `ENC(...)` → `SM4(...)`
3. 更新环境变量 `JASYPT_ENCRYPTOR_PASSWORD` → `SM4_KEY`
4. 重新部署应用

**保持双重支持：**
- 可以同时支持SM4和Jasypt加密
- 逐步迁移配置项
- 保持向后兼容性

---

## 总结

SM4配置加密为SVT项目提供了符合国密标准的配置文件加密能力。关键要点：

1. **国密合规**: 使用SM4国密算法，符合国内安全标准
2. **简单易用**: 16字节密钥，简化配置管理
3. **高性能**: CBC模式提供良好的安全性和性能平衡
4. **自动化**: 启动时自动解密，无需手动干预
5. **开发友好**: 专用工具类便于开发和测试

**SVT项目SM4使用流程：**
1. 开发阶段：使用工具类生成加密值
2. 配置阶段：将加密值配置到环境文件
3. 部署阶段：设置SM4_KEY环境变量
4. 运维阶段：定期轮换密钥，监控安全状态

遵循本文档的指导，可以确保SVT项目配置文件加密的安全性、合规性和可维护性。