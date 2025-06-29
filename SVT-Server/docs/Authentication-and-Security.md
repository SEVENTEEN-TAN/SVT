# 认证、授权与安全体系

本文档详细阐述了SVT项目的综合安全体系，涵盖用户认证、授权、密码学策略和会话管理。

## 目录
1. [整体安全架构](#1-整体安全架构)
2. [用户认证流程 (JWT)](#2-用户认证流程-jwt)
3. [授权与访问控制 (RBAC)](#3-授权与访问控制-rbac)
4. [密码学策略](#4-密码学策略)
    - [Argon2密码哈希](#41-argon2密码哈希)
    - [Jasypt配置文件加密](#42-jasypt配置文件加密)
    - [AES API加密](#43-aes-api加密)
5. [会话与缓存管理](#5-会话与缓存管理)
    - [双层缓存架构](#51-双层缓存架构)
    - [Token黑名单机制](#52-token黑名单机制)
    - [IP与设备校验](#53-ip与设备校验)
6. [核心组件](#6-核心组件)

---

## 1. 整体安全架构

项目的安全架构是一个多层次的深度防御体系，旨在保护数据和API的机密性、完整性和可用性。

```mermaid
graph TD
    A[客户端] -->|HTTPS| B(负载均衡/网关)
    B -->|请求| C{SVT后端应用}
    
    subgraph C [Spring Security Filter Chain]
        D(AESCryptoFilter) --> E(JwtAuthenticationFilter) --> F(Controller)
    end
    
    subgraph F
        G[@RequiresPermission] --> H{Service层}
    end

    C --> I[Redis缓存]
    C --> J[数据库]

    style F fill:#f9f,stroke:#333,stroke-width:2px
```

- **通信层**: 所有外部通信强制使用HTTPS。
- **解密层 (`AESCryptoFilter`)**: 在请求进入业务逻辑前，对加密的请求体进行解密。
- **认证层 (`JwtAuthenticationFilter`)**: 校验JWT的有效性，并从中解析出用户信息，构建安全上下文。
- **授权层 (`PermissionAspect`)**: 在方法执行前，通过AOP切面检查`@RequiresPermission`注解，判断用户是否具备操作权限。

---

## 2. 用户认证流程 (JWT)

系统采用 **JSON Web Tokens (JWT)** 作为无状态认证的核心机制。

### 2.1 登录流程
1.  用户提交用户名和**明文密码**。
2.  后端`AuthService`使用**Argon2密码哈希**验证凭据。
3.  验证成功后，`JwtUtils`生成一个包含用户ID、用户名、角色等信息的JWT。
4.  `JwtCacheUtils`将生成的Token与用户信息存入Redis缓存，并设置有效期（如10小时）。
5.  将JWT返回给客户端。

### 2.2 请求校验流程 (`JwtAuthenticationFilter`)
1.  过滤器从`Authorization: Bearer <token>`请求头中提取JWT。
2.  **黑名单检查**: 查询Redis，确认Token是否已登出或失效。
3.  **基础校验**: `JwtUtils`校验Token的签名和是否过期。
4.  **缓存校验**: 从Redis中获取缓存的用户会话信息，进行IP地址、设备绑定等检查。
5.  **上下文构建**: 所有校验通过后，构建`CustomAuthentication`对象并存入`SecurityContextHolder`，完成认证。

---

## 3. 授权与访问控制 (RBAC)

系统实现了基于角色的访问控制（Role-Based Access Control）。

### 3.1 权限声明

通过在Controller或Service方法上添加`@RequiresPermission`注解来声明所需权限。

**示例:**
```java
// 需要"system:user:view"权限
@RequiresPermission("system:user:view")
@GetMapping("/list")
public Result<?> listUsers() { ... }

// 需要"system:user:add" 或 "system:user:edit"权限
@RequiresPermission("system:user:add,system:user:edit")
@PostMapping("/save")
public Result<?> saveUser() { ... }

// 需要"system:user:delete" 和 "system:role:assign"两个权限
@RequiresPermission(value = "system:user:delete,system:role:assign", requireAll = true)
@DeleteMapping("/{id}")
public Result<?> deleteUserAndRoles() { ... }
```

### 3.2 权限校验 (`PermissionAspect`)
- AOP切面`PermissionAspect`会拦截所有标记了`@RequiresPermission`注解的方法。
- 从`SecurityContextHolder`获取当前用户的权限列表。
- 将用户拥有的权限与注解声明的权限进行比对。
- 如果权限不足，则抛出`BusinessException`，全局异常处理器会捕获并返回`403 Forbidden`响应。

### 3.3 权限命名规范
推荐使用`模块:实体:操作`的格式，例如`system:user:create`。

---

## 4. 密码学策略

### 4.1 Argon2密码哈希

- **算法**: Argon2id (2019年密码哈希竞赛获胜者)
- **用途**: 用于安全存储数据库中的用户密码哈希
- **安全参数**:
  - `saltLength`: 16字节 (128位随机盐)
  - `hashLength`: 32字节 (256位哈希输出)
  - `parallelism`: 1 (并行度)
  - `memory`: 4096KB (内存使用量)
  - `iterations`: 3 (迭代次数)
- **实现**: `SVTArgon2PasswordEncoder`实现了Spring Security的`PasswordEncoder`接口
- **安全特性**:
  - **不可逆**: 单向哈希，无法从哈希值推导出原始密码
  - **抗彩虹表**: 每个密码使用唯一随机盐
  - **抗暴力破解**: 计算成本高，减缓攻击速度
  - **内存困难**: 需要大量内存，抵御ASIC攻击

**使用示例:**
```java
@Autowired
private PasswordEncoder passwordEncoder;

// 密码哈希 (注册时)
String hashedPassword = passwordEncoder.encode("plainPassword");
// 输出格式: $argon2id$v=19$m=4096,t=3,p=1$saltBase64$hashBase64

// 密码验证 (登录时)
boolean matches = passwordEncoder.matches("plainPassword", hashedPassword);
```

### 4.2 Jasypt配置文件加密

- **算法**: PBEWITHHMACSHA512ANDAES_256 (PBKDF2 + HMAC-SHA512 + AES-256)
- **用途**: 加密配置文件中的敏感信息（数据库密码、Redis密码、密钥等）
- **密钥管理**: 通过环境变量`JASYPT_ENCRYPTOR_PASSWORD`提供加密密钥
- **实现**: `JasyptConfig`配置类 + `JasyptEncryptionUtils`工具类

**配置文件使用:**
```yaml
# application.yml
spring:
  datasource:
    password: ENC(encrypted_password_here)  # 加密后的密码
  data:
    redis:
      password: ENC(encrypted_redis_password)  # 加密后的Redis密码
```

**加密工具使用:**
```java
// 通过测试类获取加密值
@Test
void testJasyptConfigEncryption() {
    String plainText = "mySecretPassword";
    String encrypted = JasyptEncryptionUtils.encrypt(plainText);
    System.out.println("加密值: " + encrypted);
    
    String decrypted = JasyptEncryptionUtils.decrypt(encrypted);
    System.out.println("解密值: " + decrypted);
}
```

**安全特性:**
- **分离存储**: 加密密钥与配置文件分离存储
- **环境隔离**: 不同环境使用不同的加密密钥
- **透明解密**: 应用启动时自动解密，业务代码无感知
- **防泄露**: 配置文件泄露不会直接暴露敏感信息

### 4.3 AES API加密

- **算法**: AES-256-CBC + PKCS5Padding
- **用途**: 对客户端与服务器之间的API请求和响应体进行端到端加密
- **IV长度**: 16字节 (128位)
- **实现**: 详见`API-Encryption-AES.md`文档

---

## 5. 会话与缓存管理

为了在无状态的JWT模型中实现有状态的功能（如强制下线、单点登录），系统采用了一套基于Redis的双层缓存方案。

### 5.1 双层缓存架构
- **第一层 (逻辑层):** `JwtCacheUtils`提供了对用户会话缓存的操作API。
- **第二层 (物理层):** **Redis**作为分布式缓存，存储所有用户的会话信息、Token黑名单等。
- **数据结构**: 在Redis中，每个登录用户对应一个`JwtCache`对象，包含当前有效的Token、IP地址、最后活跃时间等。

### 5.2 Token黑名单机制
- **场景**: 用户主动登出、管理员强制下线、密码修改等。
- **实现**: 当Token需要失效时，会将其加入Redis的一个`Set`结构（黑名单）中，并设置与原Token相同的过期时间。`JwtAuthenticationFilter`在校验时会优先检查黑名单。

### 5.3 IP与设备校验
- **IP地址变更检测**: `JwtCache`中记录了用户首次登录的IP。如果后续请求的IP发生变化，系统可以配置为自动使Token失效，防止会话劫持。
- **单点登录**: `JwtCache`中只保存用户最新的一个有效Token。如果用户在另一设备登录，旧设备持有的Token在下一次请求时会因为与缓存中的Token不匹配而认证失败。

---

## 6. 核心组件
- **`SecurityConfig`**: Spring Security的主配置类，负责组装过滤器链。
- **`JwtAuthenticationFilter`**: JWT认证核心过滤器。
- **`PermissionAspect`**: AOP切面，负责权限校验。
- **`JwtUtils`**: JWT生成与解析的工具类。
- **`JwtCacheUtils`**: 用户会话缓存管理工具类。
- **`SVTArgon2PasswordEncoder`**: Argon2密码哈希编码器。
- **`JasyptConfig`**: Jasypt配置文件加密配置类。
- **`JasyptEncryptionUtils`**: Jasypt加密解密工具类。
- **`AESCryptoFilter`**: API加解密过滤器。 