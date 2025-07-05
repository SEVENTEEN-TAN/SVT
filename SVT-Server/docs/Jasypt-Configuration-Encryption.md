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
<!-- SVT项目中的实际依赖配置 -->
<dependency>
    <groupId>com.github.ulisesbocchio</groupId>
    <artifactId>jasypt-spring-boot-starter</artifactId>
    <version>${jasypt.version}</version>
</dependency>
```

**Maven属性配置：**
```xml
<properties>
    <jasypt.version>3.0.5</jasypt.version>
</properties>
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
     * 创建加密器（与JasyptConfig保持一致的配置）
     */
    private PooledPBEStringEncryptor createEncryptor() {
        PooledPBEStringEncryptor encryptor = new PooledPBEStringEncryptor();
        SimpleStringPBEConfig config = new SimpleStringPBEConfig();
        
        // 从环境变量获取密钥
        String password = System.getenv("JASYPT_ENCRYPTOR_PASSWORD");
        if (password == null || password.trim().isEmpty()) {
            throw new IllegalArgumentException("未设置JASYPT_ENCRYPTOR_PASSWORD环境变量");
        }

        config.setPassword(password);
        
        // 使用与JasyptConfig相同的配置
        config.setAlgorithm("PBEWITHHMACSHA512ANDAES_256");
        config.setKeyObtentionIterations("1000");
        config.setPoolSize("1");
        config.setSaltGeneratorClassName("org.jasypt.salt.RandomSaltGenerator");
        config.setIvGeneratorClassName("org.jasypt.iv.RandomIvGenerator");
        config.setStringOutputType("base64");
        
        encryptor.setConfig(config);
        return encryptor;
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

    /**
     * 批量加密常用配置项
     * 用于快速生成配置文件所需的加密值
     */
    public void printCommonEncryptedValues() {
        System.out.println("=== SVT 常用配置项加密结果 ===");
        
        // 示例配置项（请替换为实际值）
        String[][] configs = {
            {"数据库密码", "your_db_password"},
            {"Redis密码", "your_redis_password"},
            {"JWT密钥", "your_jwt_secret_key_at_least_32_chars"},
            {"AES密钥", "your_aes_key_32_characters_long"}
        };
        
        for (String[] config : configs) {
            String name = config[0];
            String value = config[1];
            String encrypted = encryptProperty(value);
            
            System.out.println(name + ":");
            System.out.println("  明文: " + value);
            System.out.println("  密文: " + encrypted);
            System.out.println("  配置: ENC(" + encrypted + ")");
            System.out.println("---");
        }
        
        System.out.println("使用方法：将上述 ENC(...) 值复制到对应的配置文件中");
        System.out.println("环境变量：JASYPT_ENCRYPTOR_PASSWORD 必须设置为加密时使用的密钥");
    }

    /**
     * 验证加密解密功能
     */
    public boolean validateEncryption() {
        try {
            String testText = "test_encryption_" + System.currentTimeMillis();
            String encrypted = encryptProperty(testText);
            String decrypted = decryptProperty(encrypted);
            
            boolean isValid = testText.equals(decrypted);
            System.out.println("加密功能验证: " + (isValid ? "通过" : "失败"));
            return isValid;
        } catch (Exception e) {
            System.err.println("加密功能验证失败: " + e.getMessage());
            return false;
        }
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

**YAML格式（SVT项目实际配置示例）:**
```yaml
# application-prod.yml 实际配置
spring:
  datasource:
    url: jdbc:sqlserver://123.60.68.66:1433;databaseName=svt-prod;encrypt=true;trustServerCertificate=true
    username: sa
    password: ENC(MgtqLx7TCcVS9OlboFeo8Qi+Awm0knkLom756drzSsl/nKPXIQapluwRYA9PGJUD)  # 生产环境数据库密码
    
  data:
    redis:
      host: 123.60.68.66
      port: 6739
      password: ENC(sbLkh5viVrQrea/rKmqD1h5+vDJX2lz5FO1/iw9QRfocxz4TxDhehF9SMIrHgqMy)  # Redis密码
      database: 2
      
# 其他可加密的配置项示例
jwt:
  secret: ENC(your_encrypted_jwt_secret_key)
  
svt:
  security:
    aes:
      key: ENC(your_encrypted_aes_key)
```

**开发环境配置示例:**
```yaml
# application-dev.yml 开发环境（通常不加密）
spring:
  datasource:
    url: jdbc:sqlserver://localhost:1433;databaseName=svt_dev
    username: sa
    password: your_dev_password  # 开发环境可以不加密
    
  data:
    redis:
      host: localhost
      port: 6379
      password: 123456  # 开发环境Redis密码
      database: 1
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
# 开发环境（与测试类保持一致）
export JASYPT_ENCRYPTOR_PASSWORD="SVT_JASYPT_KEY_2025"

# UAT测试环境  
export JASYPT_ENCRYPTOR_PASSWORD="SVT_UAT_STRONG_KEY_2025"

# 生产环境（请使用更强的密钥）
export JASYPT_ENCRYPTOR_PASSWORD="SVT_PROD_ULTRA_SECURE_KEY_2025_#@!$%"
```

---

## 5. 加密工具使用

### 5.1 通过测试类生成加密值

**SVT项目提供了专门的测试类 `PasswordSecurityUpgradeTest`：**

```java
// SVT项目中的实际测试实现
public class PasswordSecurityUpgradeTest {
    
    // Jasypt加密密钥（与JasyptConfig保持一致）
    private static final String JASYPT_PASSWORD = "SVT_JASYPT_KEY_2025";
    
    @Test
    public void testJasyptConfigEncryption() {
        System.out.println("=== Jasypt 配置文件加密测试 ===");
        
        PooledPBEStringEncryptor encryptor = createJasyptEncryptor();
        
        // 定义需要加密的配置项（请替换为实际值）
        String[][] configs = {
            {"数据库密码", "Tsq19971108!"},
            {"Redis密码", "123456"},
            {"JWT密钥", "SVT-DEV-JWT-SECRET-CHANGE-ME-5678-VERY-LONG-AND-SECURE"},
            {"AES密钥", "wJ/6sgrWER8T14S3z1esg39g7sL8f8b+J5fCg6a5fGg="}
        };
        
        for (String[] config : configs) {
            String name = config[0];
            String plainText = config[1];
            
            try {
                // 加密
                String encrypted = encryptor.encrypt(plainText);
                
                // 验证解密
                String decrypted = encryptor.decrypt(encrypted);
                boolean isValid = plainText.equals(decrypted);
                
                System.out.println("【" + name + "】");
                System.out.println("  原文: " + plainText);
                System.out.println("  密文: " + encrypted);
                System.out.println("  配置: ENC(" + encrypted + ")");
                System.out.println("  验证: " + (isValid ? "✓ 通过" : "✗ 失败"));
                System.out.println();
                
            } catch (Exception e) {
                System.err.println("【" + name + "】加密失败: " + e.getMessage());
            }
        }
    }
    
    // 创建与JasyptConfig相同配置的加密器
    private PooledPBEStringEncryptor createJasyptEncryptor() {
        PooledPBEStringEncryptor encryptor = new PooledPBEStringEncryptor();
        SimpleStringPBEConfig config = new SimpleStringPBEConfig();
        
        config.setPassword(JASYPT_PASSWORD);
        config.setAlgorithm("PBEWITHHMACSHA512ANDAES_256");
        config.setKeyObtentionIterations("1000");
        config.setPoolSize("1");
        config.setSaltGeneratorClassName("org.jasypt.salt.RandomSaltGenerator");
        config.setIvGeneratorClassName("org.jasypt.iv.RandomIvGenerator");
        config.setStringOutputType("base64");
        
        encryptor.setConfig(config);
        return encryptor;
    }
}
```

### 5.2 运行加密测试

**方法一：直接运行测试类（推荐）**
```bash
# 1. 设置环境变量（可选，测试类使用内置密钥）
export JASYPT_ENCRYPTOR_PASSWORD="SVT_JASYPT_KEY_2025"

# 2. 运行测试生成加密值
mvn test -Dtest=PasswordSecurityUpgradeTest#testJasyptConfigEncryption

# 3. 查看控制台输出的加密值
```

**方法二：使用JasyptEncryptionUtils工具类**
```bash
# 1. 设置环境变量
export JASYPT_ENCRYPTOR_PASSWORD="your_encryption_key"

# 2. 在Spring Boot应用中调用工具类方法
# JasyptEncryptionUtils.printCommonEncryptedValues();

# 3. 或者通过测试验证功能
# JasyptEncryptionUtils.validateEncryption();
```

**方法三：生成生产环境配置**
```bash
# 运行生产环境配置生成测试
mvn test -Dtest=PasswordSecurityUpgradeTest#generateProductionConfig
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
- 使用密钥管理服务 (如AWS KMS、Azure Key Vault、HashiCorp Vault)
- 生产环境密钥示例格式：`SVT_PROD_ULTRA_SECURE_KEY_2025_#@!$%`

❌ **避免做法:**
- 将密钥硬编码在代码中
- 在配置文件中存储密钥
- 使用弱密钥或默认密钥（如测试类中的`SVT_JASYPT_KEY_2025`）
- 在日志中输出密钥
- 在版本控制系统中提交包含密钥的文件

**SVT项目密钥安全建议：**
- 开发环境：可使用测试类默认密钥便于开发
- UAT环境：使用中等强度密钥进行集成测试
- 生产环境：**必须**使用高强度随机密钥，并定期轮换

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

## 9. SVT项目集成实践

### 9.1 快速开始指南

**第一步：设置环境变量**
```bash
# Windows (PowerShell)
$env:JASYPT_ENCRYPTOR_PASSWORD="SVT_JASYPT_KEY_2025"

# Linux/macOS
export JASYPT_ENCRYPTOR_PASSWORD="SVT_JASYPT_KEY_2025"
```

**第二步：运行测试生成加密值**
```bash
cd SVT-Server
mvn test -Dtest=PasswordSecurityUpgradeTest#testJasyptConfigEncryption
```

**第三步：复制加密值到配置文件**
```yaml
# 将测试输出的 ENC(...) 值复制到 application-{profile}.yml
spring:
  datasource:
    password: ENC(generated_encrypted_value_here)
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
- 开发环境：`application-dev.yml` (通常不加密)
- UAT环境：`application-uat.yml` (部分加密)
- 生产环境：`application-prod.yml` (强制加密)

### 9.3 与其他安全组件集成

**与SVTArgon2PasswordEncoder协同:**
```java
// Jasypt用于配置文件加密，Argon2用于用户密码哈希
// 两者独立工作，提供不同层面的安全保护

// 测试类中同时测试两种加密方式
@Test
public void fullFunctionalityTest() {
    // 1. Jasypt配置加密测试
    // 2. Argon2密码哈希测试
    // 3. 环境配置检查
}
```

**与AES API加密协同:**
```java
// Jasypt: 配置文件敏感信息加密
// AES: API请求响应数据加密
// 两者使用不同的密钥和用途
```

### 9.4 常见问题解决

**问题1：启动时找不到JASYPT_ENCRYPTOR_PASSWORD**
```java
// 错误信息
IllegalStateException: JASYPT_ENCRYPTOR_PASSWORD environment variable is required

// 解决方案
export JASYPT_ENCRYPTOR_PASSWORD="your_key_here"
```

**问题2：配置值解密失败**
```java
// 错误信息  
EncryptionOperationNotPossibleException

// 可能原因
1. 环境变量密钥与加密时不一致
2. ENC() 格式错误
3. 配置文件编码问题

// 解决方案
1. 验证环境变量设置
2. 检查ENC()格式，确保无空格
3. 确保配置文件UTF-8编码
```

**问题3：测试类运行失败**
```java
// 常见原因
1. 未设置JASYPT_ENCRYPTOR_PASSWORD环境变量
2. IDE运行配置问题
3. Maven测试环境配置问题

// 解决方案
1. 在IDE中配置环境变量
2. 使用Maven命令行运行测试
3. 检查测试类内置的默认密钥
```

---

## 总结

Jasypt为SVT项目提供了强大的配置文件加密能力，通过合理的配置和使用，可以有效保护敏感信息的安全。关键要点：

1. **环境变量管理密钥**: 密钥与配置文件分离，支持不同环境
2. **专用测试类**: `PasswordSecurityUpgradeTest` 便于开发和部署
3. **实际生产应用**: 生产环境配置已使用Jasypt加密保护
4. **多层安全架构**: 与Argon2、AES等组件协同提供全面保护
5. **开发友好**: 开发环境可选加密，生产环境强制加密

**SVT项目Jasypt使用流程：**
1. 开发阶段：使用测试类生成加密值
2. 配置阶段：将加密值配置到对应环境文件
3. 部署阶段：设置正确的环境变量
4. 运维阶段：定期轮换密钥，监控安全状态

遵循本文档的指导，可以确保SVT项目配置文件加密的安全性和可维护性。 