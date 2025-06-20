# Jasypt配置文件加密详细指南

## 概述

Jasypt (Java Simplified Encryption) 是一个Java加密库，用于加密配置文件中的敏感信息。本文档详细介绍SVT项目中Jasypt的配置、使用和最佳实践。

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
- **主算法**: `PBEWITHHMACSHA512ANDAES_256`
- **密钥派生**: PBKDF2 (Password-Based Key Derivation Function 2)
- **哈希函数**: HMAC-SHA512
- **对称加密**: AES-256
- **盐值**: 随机生成，自动管理

### 1.2 安全参数
```java
// JasyptConfig.java 中的配置
encryptor.setPoolSize(1);                    // 加密器池大小
encryptor.setStringOutputType("base64");     // 输出格式：Base64
encryptor.setKeyObtentionIterations(1000);   // PBKDF2迭代次数
```

### 1.3 依赖版本
```xml
<dependency>
    <groupId>com.github.ulisesbocchio</groupId>
    <artifactId>jasypt-spring-boot-starter</artifactId>
    <version>${jasypt.version}</version>
</dependency>
```

---

## 2. 核心组件

### 2.1 JasyptConfig 配置类

```java
@Configuration
@EnableEncryptableProperties
public class JasyptConfig {
    
    @Bean("jasyptStringEncryptor")
    public StringEncryptor stringEncryptor() {
        PooledPBEStringEncryptor encryptor = new PooledPBEStringEncryptor();
        SimpleStringPBEConfig config = new SimpleStringPBEConfig();
        
        // 从环境变量获取密钥
        String password = System.getenv("JASYPT_ENCRYPTOR_PASSWORD");
        if (password == null || password.trim().isEmpty()) {
            throw new IllegalArgumentException("未设置JASYPT_ENCRYPTOR_PASSWORD环境变量");
        }
        
        config.setPassword(password);
        config.setAlgorithm("PBEWITHHMACSHA512ANDAES_256");
        config.setKeyObtentionIterations("1000");
        config.setPoolSize("1");
        config.setStringOutputType("base64");
        config.setSaltGeneratorClassName("org.jasypt.salt.RandomSaltGenerator");
        config.setIvGeneratorClassName("org.jasypt.iv.RandomIvGenerator");
        
        encryptor.setConfig(config);
        return encryptor;
    }
}
```

### 2.2 JasyptEncryptionUtils 工具类

```java
// 实际的JasyptEncryptionUtils.java实现
@Component
public class JasyptEncryptionUtils {

    private final PooledPBEStringEncryptor encryptor;

    public JasyptEncryptionUtils() {
        this.encryptor = createEncryptor();
    }

    /**
     * 加密配置属性
     */
    public String encryptProperty(String plainText) {
        if (plainText == null || plainText.trim().isEmpty()) {
            throw new IllegalArgumentException("待加密的文本不能为空");
        }
        return encryptor.encrypt(plainText);
    }

    /**
     * 解密配置属性
     */
    public String decryptProperty(String encryptedText) {
        if (encryptedText == null || encryptedText.trim().isEmpty()) {
            throw new IllegalArgumentException("待解密的文本不能为空");
        }
        return encryptor.decrypt(encryptedText);
    }

    /**
     * 获取用于配置文件的完整格式
     */
    public String getEncryptedConfigValue(String plainText) {
        return "ENC(" + encryptProperty(plainText) + ")";
    }
}
```

---

## 3. 配置文件加密

### 3.1 支持的配置文件格式

Jasypt支持多种Spring Boot配置文件格式：
- `application.yml` / `application.yaml`
- `application.properties`
- `application-{profile}.yml`

### 3.2 配置文件中的使用语法

**YAML格式:**
```yaml
spring:
  datasource:
    url: jdbc:sqlserver://localhost:1433;databaseName=SVT
    username: sa
    password: ENC(encrypted_password_here)  # 加密后的密码
    
  data:
    redis:
      host: localhost
      port: 6379
      password: ENC(encrypted_redis_password)  # 加密后的Redis密码
      
# 自定义配置也可以加密
custom:
  api:
    secret-key: ENC(encrypted_api_key)
    third-party-token: ENC(encrypted_token)
```

**Properties格式:**
```properties
spring.datasource.password=ENC(encrypted_password_here)
spring.data.redis.password=ENC(encrypted_redis_password)
custom.api.secret-key=ENC(encrypted_api_key)
```

### 3.3 加密规则

1. **格式**: `ENC(加密后的文本)`
2. **大小写敏感**: `ENC` 必须大写
3. **括号必须**: 加密文本必须用圆括号包围
4. **无空格**: `ENC(` 之间不能有空格

---

## 4. 环境变量管理

### 4.1 环境变量设置

**Windows (PowerShell):**
```powershell
$env:JASYPT_ENCRYPTOR_PASSWORD="your_secret_key_here"
```

**Windows (CMD):**
```cmd
set JASYPT_ENCRYPTOR_PASSWORD=your_secret_key_here
```

**Linux/macOS:**
```bash
export JASYPT_ENCRYPTOR_PASSWORD="your_secret_key_here"
```

**Docker:**
```dockerfile
ENV JASYPT_ENCRYPTOR_PASSWORD=your_secret_key_here
```

**Docker Compose:**
```yaml
services:
  svt-server:
    environment:
      - JASYPT_ENCRYPTOR_PASSWORD=your_secret_key_here
```

### 4.2 环境隔离策略

不同环境使用不同的加密密钥：

```bash
# 开发环境
export JASYPT_ENCRYPTOR_PASSWORD="SVT_DEV_KEY_2025"

# 测试环境  
export JASYPT_ENCRYPTOR_PASSWORD="SVT_UAT_KEY_2025"

# 生产环境
export JASYPT_ENCRYPTOR_PASSWORD="SVT_PROD_STRONG_KEY_2025"
```

---

## 5. 加密工具使用

### 5.1 通过测试类生成加密值

```java
@SpringBootTest
class PasswordSecurityUpgradeTest {
    
    @Test
    void testJasyptConfigEncryption() {
        // 设置环境变量后运行此测试
        
        // 需要加密的敏感信息
        String dbPassword = "your_database_password";
        String redisPassword = "your_redis_password";
        String apiKey = "your_api_secret_key";
        
        // 生成加密值
        String encryptedDbPassword = JasyptEncryptionUtils.encrypt(dbPassword);
        String encryptedRedisPassword = JasyptEncryptionUtils.encrypt(redisPassword);
        String encryptedApiKey = JasyptEncryptionUtils.encrypt(apiKey);
        
        // 输出结果，可直接复制到配置文件
        System.out.println("=== Jasypt加密结果 ===");
        System.out.println("数据库密码: ENC(" + encryptedDbPassword + ")");
        System.out.println("Redis密码: ENC(" + encryptedRedisPassword + ")");
        System.out.println("API密钥: ENC(" + encryptedApiKey + ")");
        
        // 验证解密
        assertEquals(dbPassword, JasyptEncryptionUtils.decrypt(encryptedDbPassword));
        assertEquals(redisPassword, JasyptEncryptionUtils.decrypt(encryptedRedisPassword));
        assertEquals(apiKey, JasyptEncryptionUtils.decrypt(encryptedApiKey));
    }
}
```

### 5.2 运行加密测试

```bash
# 1. 设置环境变量
export JASYPT_ENCRYPTOR_PASSWORD="SVT_JASYPT_KEY_2025"

# 2. 运行测试生成加密值
mvn test -Dtest=PasswordSecurityUpgradeTest#testJasyptConfigEncryption

# 3. 查看控制台输出的加密值
```

---

## 6. 部署配置

### 6.1 应用启动配置

**Maven启动:**
```bash
export JASYPT_ENCRYPTOR_PASSWORD="your_production_key"
mvn spring-boot:run
```

**JAR包启动:**
```bash
export JASYPT_ENCRYPTOR_PASSWORD="your_production_key"
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
Environment=JASYPT_ENCRYPTOR_PASSWORD=your_production_key
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
ENV JASYPT_ENCRYPTOR_PASSWORD=""
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

**Kubernetes Secret:**
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: svt-jasypt-secret
type: Opaque
data:
  encryptor-password: <base64-encoded-password>
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
        - name: JASYPT_ENCRYPTOR_PASSWORD
          valueFrom:
            secretKeyRef:
              name: svt-jasypt-secret
              key: encryptor-password
```

---

## 7. 故障排除

### 7.1 常见错误及解决方案

**错误1: 未设置环境变量**
```
Error: 未设置JASYPT_ENCRYPTOR_PASSWORD环境变量
```
**解决**: 设置环境变量 `JASYPT_ENCRYPTOR_PASSWORD`

**错误2: 解密失败**
```
Error: EncryptionOperationNotPossibleException
```
**解决**: 
- 检查环境变量是否正确
- 确认加密值格式正确 `ENC(...)`
- 验证加密时使用的密钥与解密时一致

**错误3: 配置文件格式错误**
```
Error: Could not resolve placeholder 'ENC(xxx)'
```
**解决**:
- 检查 `ENC()` 格式是否正确
- 确认没有多余的空格
- 验证YAML缩进是否正确

### 7.2 调试模式

启用Jasypt调试日志：
```yaml
logging:
  level:
    com.ulisesbocchio.jasyptspringboot: DEBUG
    org.jasypt: DEBUG
```

---

## 8. 安全最佳实践

### 8.1 密钥管理

✅ **推荐做法:**
- 使用强密钥 (至少32字符，包含大小写字母、数字、特殊字符)
- 不同环境使用不同密钥
- 定期轮换密钥
- 使用密钥管理服务 (如AWS KMS、Azure Key Vault)

❌ **避免做法:**
- 将密钥硬编码在代码中
- 在配置文件中存储密钥
- 使用弱密钥或默认密钥
- 在日志中输出密钥

### 8.2 配置文件管理

✅ **推荐做法:**
- 只加密敏感信息 (密码、密钥、Token等)
- 使用版本控制管理配置文件
- 定期审查加密的配置项
- 备份加密密钥

❌ **避免做法:**
- 加密所有配置项 (影响性能和可读性)
- 在公共仓库中存储未加密的敏感信息
- 忘记备份加密密钥

### 8.3 运维安全

✅ **推荐做法:**
- 限制对环境变量的访问权限
- 使用容器secrets管理密钥
- 监控配置文件的访问和修改
- 定期安全审计

❌ **避免做法:**
- 在进程列表中暴露密钥
- 在日志文件中记录密钥
- 通过不安全的渠道传输密钥

---

## 总结

Jasypt为SVT项目提供了强大的配置文件加密能力，通过合理的配置和使用，可以有效保护敏感信息的安全。关键要点：

1. **环境变量管理密钥**: 密钥与配置文件分离
2. **测试类生成加密值**: 便于开发和部署
3. **环境隔离**: 不同环境使用不同密钥
4. **格式规范**: 严格遵循 `ENC(...)` 格式
5. **安全实践**: 强密钥、定期轮换、权限控制

遵循本文档的指导，可以确保配置文件加密的安全性和可维护性。 