# JWT认证与安全架构

基于实际代码分析的SVT后端JWT认证系统设计与实现。

## 1. JWT智能续期机制

### 架构概述
SVT采用基于活跃度的JWT智能续期机制，实现无感知认证体验：
- **JWT Token**: 标准JWT令牌，包含用户身份信息
- **智能续期**: 基于用户活跃度自动延长有效期
- **单点登录**: 确保用户同一时间只有一个有效会话
- **安全增强**: 9步安全验证流程

### JWT配置

```yaml
# application.yml
jwt:
  secret: ${JWT_SECRET:your-256-bit-secret-key}
  expiration: 36000  # 10小时 (秒)
  issuer: SVT-Server
```

### JWT工具类实现

**位置**: `com.seventeen.svt.frame.security.utils.JwtUtils`

```java
@Component
public class JwtUtils {
    
    @Value("${jwt.secret}")
    private String secret;
    
    @Value("${jwt.expiration}")
    private Long expiration; // 秒
    
    @Value("${jwt.issuer}")
    private String issuer;
    
    /**
     * 生成JWT Token
     */
    public String generateToken(CustomAuthentication auth) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", auth.getUserId());
        claims.put("userName", auth.getName());
        
        return Jwts.builder()
            .setClaims(claims)
            .setSubject(auth.getUsername())
            .setIssuer(issuer)
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + expiration * 1000))
            .signWith(getSigningKey(), SignatureAlgorithm.HS256)
            .compact();
    }
    
    /**
     * 验证Token是否为系统颁发的合法Token
     * 注意：只验证签名和格式，不验证过期时间
     */
    public boolean isValidSystemToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            
            String userId = claims.get("userId", String.class);
            String userName = claims.get("userName", String.class);
            String issuerClaim = claims.getIssuer();
            
            return userId != null && userName != null && issuer.equals(issuerClaim);
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * 获取Token剩余有效期（秒）
     */
    public long getTokenRemainingTime(String token) {
        Date expiration = getExpirationDateFromToken(token);
        return (expiration.getTime() - System.currentTimeMillis()) / 1000;
    }
}
```

## 2. JWT过滤器九步验证

**位置**: `com.seventeen.svt.frame.security.filter.JwtAuthenticationFilter`

### 验证流程

1. **Token有效性验证**: 验证Token是否为系统颁发的合法Token
2. **黑名单检查**: 检查Token是否已被加入黑名单
3. **缓存验证**: 确保JWT缓存存在（服务重启安全机制）
4. **IP地址验证**: 检查IP地址是否发生变化
5. **Token一致性验证**: 验证Token是否已更改（单点登录）
6. **活跃度过期检查**: 检查会话活跃度超时
7. **智能续期**: 基于活跃度的智能续期机制
8. **会话状态计算**: 计算并设置响应头状态
9. **活跃度更新**: 更新最后活跃时间戳

### 智能续期配置

```java
// 活跃度续期配置
public static final long ACTIVITY_TIMEOUT = 30 * 60 * 1000;  // 30分钟
public static final long RENEWAL_THRESHOLD = 15 * 60 * 1000; // 15分钟

// 续期逻辑
if (needsActivityRenewal(loginId)) {
    ActivityRenewalResult result = renewActivityWithTokenLimit(loginId);
    if (result.isSuccess()) {
        // 活跃期延长，在Token生命周期内
    }
}
```

### 会话状态枚举

**位置**: `com.seventeen.svt.frame.security.constants.SessionStatusHeader`

```java
public enum SessionStatusHeader {
    ACTIVE,      // 会话活跃
    WARNING,     // 即将过期警告
    CRITICAL,    // 临界状态
    EXPIRED      // 已过期
}
```

### 响应头状态信息

系统通过响应头实时告知前端会话状态：

```http
X-Session-Status: ACTIVE|WARNING|CRITICAL|EXPIRED
X-Session-Remaining: <毫秒>
X-Session-Warning: <警告消息>
```

**状态说明:**
- `ACTIVE`: 会话正常，无需处理
- `WARNING`: 会话即将过期，建议提醒用户
- `CRITICAL`: 会话处于临界状态，需要紧急续期
- `EXPIRED`: 会话已过期，需要重新登录

**前端处理建议:**
```javascript
// 检查响应头状态
const sessionStatus = response.headers['x-session-status'];
const remaining = response.headers['x-session-remaining'];

switch(sessionStatus) {
    case 'WARNING':
        showSessionWarning(remaining);
        break;
    case 'CRITICAL':
        showSessionRenewalPrompt();
        break;
    case 'EXPIRED':
        redirectToLogin();
        break;
}
```

## 3. RBAC权限控制

### 权限注解定义

**位置**: `com.seventeen.svt.common.annotation.permission.RequiresPermission`

```java
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RequiresPermission {
    /**
     * 所需权限（逗号分隔）
     * 格式：module:entity:operation
     * 示例：system:user:view,system:user:edit
     */
    String value();
    
    /**
     * 权限验证逻辑
     * true: 需要所有权限 (AND逻辑)
     * false: 需要任一权限 (OR逻辑)
     */
    boolean requireAll() default false;
}
```

### 权限切面实现

**位置**: `com.seventeen.svt.frame.aspect.PermissionAspect`

权限验证通过AOP切面自动处理，支持：
- 方法级权限控制
- 类级权限控制
- 多权限AND/OR逻辑
- 权限层级继承
- 缓存优化

### 使用示例

```java
// 单个权限验证
@RequiresPermission("system:user:view")
@GetMapping("/users")
public Result<?> listUsers() {
    return Result.success(userService.listUsers());
}

// 多权限OR逻辑（满足任一权限即可）
@RequiresPermission("system:user:add,system:user:edit")
@PostMapping("/save")
public Result<?> saveUser(@RequestBody UserDTO user) {
    return Result.success(userService.save(user));
}

// 多权限AND逻辑（必须同时具备所有权限）
@RequiresPermission(value = "system:user:delete,system:role:assign", requireAll = true)
@DeleteMapping("/{id}")
public Result<?> deleteUserWithRoles(@PathVariable String id) {
    userService.deleteUserAndRoles(id);
    return Result.success();
}

// 类级权限（作用于整个Controller）
@RequiresPermission("system:admin")
@RestController
@RequestMapping("/admin")
public class AdminController {
    // 所有方法都需要system:admin权限
}
```

### 权限格式规范

**标准格式**: `模块:实体:操作`

**系统管理模块:**
- `system:user:view` - 查看用户
- `system:user:create` - 创建用户
- `system:user:edit` - 编辑用户
- `system:user:delete` - 删除用户
- `system:role:view` - 查看角色
- `system:role:assign` - 分配角色
- `system:menu:view` - 查看菜单
- `system:menu:edit` - 编辑菜单

**业务模块:**
- `business:order:view` - 查看订单
- `business:order:approve` - 审批订单
- `business:report:export` - 导出报表

## 4. 密码安全机制

### Argon2密码哈希

**位置**: `com.seventeen.svt.common.config.SVTArgon2PasswordEncoder`

**算法配置:**
- **算法**: Argon2id（最安全的Argon2变种）
- **内存使用**: 4096KB
- **迭代次数**: 3
- **盐值**: 16字节随机生成
- **哈希长度**: 32字节
- **并行度**: 1（适合单线程环境）

**优势:**
- 抗时间攻击
- 抗侧信道攻击
- 内存难函数，抗ASIC攻击
- 2015年密码哈希竞赛获胜者

```java
@Configuration
public class SVTArgon2PasswordEncoder implements PasswordEncoder {
    
    private final Argon2 argon2 = Argon2Factory.create(
        Argon2Types.ARGON2id,
        32,    // 哈希长度
        16     // 盐值长度
    );
    
    @Override
    public String encode(CharSequence rawPassword) {
        return argon2.hash(3, 4096, 1, rawPassword.toString().toCharArray());
    }
    
    @Override
    public boolean matches(CharSequence rawPassword, String encodedPassword) {
        return argon2.verify(encodedPassword, rawPassword.toString().toCharArray());
    }
}
```

### 配置文件加密 (Jasypt)

**位置**: `com.seventeen.svt.common.config.JasyptConfig`

```yaml
# 加密的配置值
spring:
  datasource:
    password: ENC(encrypted_value_here)
  data:
    redis:
      password: ENC(encrypted_redis_password)
```

**环境变量**: `JASYPT_ENCRYPTOR_PASSWORD`

**加密工具**: `com.seventeen.svt.common.util.JasyptEncryptionUtils`

## 5. 会话管理策略

### 本地缓存策略

**实现方式**: Caffeine本地缓存
- **负载均衡**: 会话粘性（IP哈希）
- **容量限制**: 最大1000个用户会话
- **重启策略**: 服务重启后用户需重新登录
- **缓存过期**: 基于用户活跃度自动清理

### Token黑名单机制

**Token加入黑名单的情况:**
- 用户主动登出
- 管理员强制登出
- 用户密码变更
- 检测到安全违规行为
- IP地址异常变更
- 会话超时清理

**黑名单存储**: Redis分布式存储，确保多实例一致性

### 核心安全特性

1. **IP变更检测**: IP地址变更时会话立即失效
2. **单点登录**: 每个用户同时只能有一个活跃会话
3. **活跃度超时**: 30分钟无活动自动登出
4. **智能续期**: 活跃用户自动续期，无感知体验
5. **Token生命周期限制**: 续期不能超过原始Token过期时间
6. **会话状态监控**: 实时计算会话状态并通知前端

## 6. 安全最佳实践

### 部署安全
1. **HTTPS强制**: 所有通信必须使用HTTPS
2. **JWT密钥管理**: 使用环境变量安全存储JWT密钥
3. **权限命名规范**: 遵循`模块:实体:操作`格式
4. **失败监控**: 监控认证失败次数，实施防暴力破解
5. **权限审计**: 定期审计用户权限分配
6. **限流策略**: 对登录接口实施速率限制

### 开发安全
1. **密码复杂度**: 强制密码复杂度要求
2. **会话超时**: 合理设置会话超时时间
3. **权限最小化**: 遵循最小权限原则
4. **日志记录**: 完整记录认证和授权日志
5. **异常处理**: 避免敏感信息泄露
6. **定期更新**: 及时更新安全相关依赖

### 监控告警
1. **异常登录**: 监控异地登录、异常时间登录
2. **权限变更**: 监控权限分配变更
3. **Token异常**: 监控Token伪造、篡改尝试
4. **会话异常**: 监控会话劫持、异常续期
5. **性能监控**: 监控认证性能，及时优化

## 7. 安全设计原理

### 7.1 安全设计目标

SVT-Server的安全架构设计旨在构建一个多层防护、纵深防御的企业级安全体系：

- **机密性(Confidentiality)**: 确保敏感数据不被未授权访问
- **完整性(Integrity)**: 保证数据在传输和存储过程中不被篡改  
- **可用性(Availability)**: 确保系统服务的持续可用
- **可审计性(Auditability)**: 记录所有安全相关操作
- **不可抵赖性(Non-repudiation)**: 操作行为可追溯到具体用户

### 7.2 威胁模型

基于企业内部应用场景的威胁分析：

**高风险威胁**:
- 内部人员恶意操作
- 权限提升攻击
- 会话劫持(Token盗用)
- 敏感数据泄露

**中风险威胁**:
- 暴力破解攻击
- 重放攻击
- 配置信息泄露
- SQL注入攻击

**低风险威胁**:
- 信息枚举
- 社会工程学攻击
- 客户端漏洞利用

### 7.3 多层安全架构

```
┌─────────────────────────────────────────┐
│          网络层安全 (Network)           │  ← HTTPS/TLS、防火墙、VPN
├─────────────────────────────────────────┤
│         传输层安全 (Transport)          │  ← AES-256-CBC、JWT签名
├─────────────────────────────────────────┤
│         应用层安全 (Application)        │  ← 认证授权、权限控制
├─────────────────────────────────────────┤
│          业务层安全 (Business)          │  ← 业务规则、数据验证
├─────────────────────────────────────────┤
│          数据层安全 (Data)              │  ← 加密存储、审计日志
├─────────────────────────────────────────┤
│         基础设施安全 (Infrastructure)   │  ← 操作系统、数据库安全
└─────────────────────────────────────────┘
```

### 7.4 安全控制措施

**认证控制 (Authentication)**:
- Argon2密码哈希算法
- JWT智能续期机制
- 多因素认证准备（预留接口）
- 会话管理和超时控制

**授权控制 (Authorization)**:
- RBAC权限模型
- 细粒度权限控制
- 权限继承和组合
- 动态权限验证

**数据保护 (Data Protection)**:
- AES-256-CBC传输加密
- SM4国密配置加密
- 敏感数据脱敏
- 数据备份加密

**审计监控 (Audit & Monitoring)**:
- 完整操作审计
- 敏感操作告警
- 异常行为检测
- 性能安全监控

### 7.5 安全开发生命周期

**设计阶段**:
- 威胁建模分析
- 安全需求定义
- 架构安全评审
- 加密算法选择

**开发阶段**:
- 安全编码规范
- 输入数据验证
- 错误处理安全
- 依赖库安全审计

**测试阶段**:
- 安全功能测试
- 渗透测试
- 代码安全扫描
- 配置安全检查

**部署阶段**:
- 生产环境加固
- 密钥安全管理
- 监控告警配置
- 应急响应准备

### 7.6 安全合规要求

**国家标准**:
- GB/T 22239-2019 网络安全等级保护基本要求
- GM/T 0028-2014 密码模块安全技术要求
- SM2/SM3/SM4国密算法应用

**行业标准**:
- ISO 27001 信息安全管理体系
- OWASP Top 10 Web应用安全风险
- CWE/SANS Top 25 最危险软件错误

**企业标准**:
- 数据分类分级保护
- 特权账户管理
- 安全开发流程
- 应急响应机制

---

## 📚 相关文档

- [API加密实现](./API-Encryption-AES.md) - AES数据传输加密
- [SM4配置加密](./SM4-Configuration-Encryption.md) - 国密配置文件保护
- [Argon2密码哈希](./Argon2-Password-Hashing.md) - 密码安全存储
- [审计日志系统](./Audit-Logging.md) - 操作审计和监控