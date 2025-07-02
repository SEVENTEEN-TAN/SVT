# 审计日志系统

基于实际代码分析的SVT后端审计日志系统设计与实现。

## 1. 审计架构概述

SVT采用基于AOP的审计日志系统，自动记录业务操作，用于合规性和安全监控。

### 核心特性
- **非侵入式**: 通过注解和AOP实现，对业务代码零侵入
- **自动脱敏**: 敏感数据自动脱敏处理，保护用户隐私
- **异步处理**: 审计日志异步保存，不影响主业务流程
- **全流程记录**: 记录请求参数、响应结果、异常信息
- **上下文关联**: 自动关联用户、组织、角色信息

## 2. 审计注解定义

**位置**: `com.seventeen.svt.common.annotation.audit.Audit`

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Audit {
    /**
     * 操作描述
     * 用于标识具体的业务操作
     */
    String description() default "";
    
    /**
     * 是否记录请求参数
     * 默认为true，对于高频查询可设为false
     */
    boolean recordParams() default true;
    
    /**
     * 是否记录响应结果
     * 默认为false，避免大量数据存储
     */
    boolean recordResult() default false;
    
    /**
     * 是否记录异常信息
     * 默认为true，用于问题排查
     */
    boolean recordException() default true;
    
    /**
     * 是否启用敏感数据脱敏
     * 默认为true，自动对敏感字段进行脱敏处理
     */
    boolean sensitive() default true;
}
```

### 使用示例

```java
@RestController
@RequestMapping("/system/auth")
public class SystemAuthController {
    
    // 记录登录操作，包含响应结果
    @Audit(description = "用户登录", recordResult = true)
    @PostMapping("/login")
    public Result<?> login(@RequestBody LoginRequestDTO dto) {
        return authService.login(dto);
    }
    
    // 高频查询操作，不记录参数
    @Audit(description = "查询用户列表", recordParams = false)
    @GetMapping("/users")
    public Result<?> listUsers() {
        return userService.listUsers();
    }
    
    // 敏感操作，启用脱敏
    @Audit(description = "修改用户密码", recordParams = true, sensitive = true)
    @PostMapping("/change-password")
    public Result<?> changePassword(@RequestBody ChangePasswordDTO dto) {
        return userService.changePassword(dto);
    }
    
    // 关键操作，记录完整信息
    @Audit(description = "删除用户", recordParams = true, recordResult = true)
    @DeleteMapping("/user/{id}")
    public Result<?> deleteUser(@PathVariable String id) {
        return userService.deleteUser(id);
    }
}
```

## 3. AOP切面实现

**位置**: `com.seventeen.svt.frame.aspect.AuditAspect`

### 核心实现逻辑

```java
@Slf4j
@Aspect
@Component
public class AuditAspect {

    @Autowired
    private AuditLogService auditLogService;
    
    @Autowired
    private UserDetailCacheUtils userDetailCacheUtils;
    
    @Autowired
    private DistributedIdGenerator distributedIdGenerator;

    @Around("@annotation(audit)")
    public Object around(ProceedingJoinPoint point, Audit audit) throws Throwable {
        // 1. 获取原始参数
        Object[] args = point.getArgs();
        
        // 2. 创建审计日志对象 - 先记录基本信息
        AuditLog auditLog = new AuditLog();
        auditLog.setOperationTime(LocalDateTime.now().format(
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS")
        ));
        auditLog.setOperationDesc(audit.description());
        auditLog.setOperationIp(RequestContextUtils.getIpAddress());
        auditLog.setOperationUrl(RequestContextUtils.getRequestUrl());

        // 3. 记录请求参数（带脱敏处理）
        if (audit.recordParams() && args != null && args.length > 0) {
            Object[] logArgs = args;
            if (audit.sensitive()) {
                // 深拷贝参数进行脱敏处理
                logArgs = ObjectUtil.cloneByStream(args);
                for (Object arg : logArgs) {
                    SensitiveUtil.desensitize(arg);
                }
            }
            auditLog.setRequestParams(JSONUtil.toJsonStr(logArgs));
        }

        Object result = null;
        try {
            // 4. 执行目标方法
            result = point.proceed();
            
            // 5. 方法执行成功后，填充用户信息
            populateUserInfo(auditLog, result, point.getSignature().getName());

            // 6. 记录响应结果（带脱敏处理）
            if (audit.recordResult() && result != null) {
                Object logResult = result;
                if (audit.sensitive()) {
                    logResult = ObjectUtil.cloneByStream(result);
                    SensitiveUtil.desensitize(logResult);
                }
                auditLog.setResponseResult(JSONUtil.toJsonStr(logResult));
            }

            auditLog.setOperationResult("0"); // 成功
            return result;

        } catch (Exception e) {
            // 7. 方法执行失败，填充用户信息
            populateUserInfo(auditLog, null, point.getSignature().getName());
            
            // 8. 记录异常信息
            auditLog.setOperationResult("1"); // 失败
            if (audit.recordException()) {
                auditLog.setErrorMsg(e.getMessage());
            }
            throw e;

        } finally {
            // 9. 异步保存审计日志
            auditLogService.asyncSave(auditLog);
        }
    }

    /**
     * 填充用户信息到审计日志
     */
    private void populateUserInfo(AuditLog auditLog, Object result, String methodName) {
        try {
            // 从当前上下文获取用户信息
            String requestUserId = RequestContextUtils.getRequestUserId();
            UserDetailCache userDetail = userDetailCacheUtils.getUserDetail(requestUserId);
            if (ObjectUtil.isNotEmpty(userDetail)) {
                auditLog.setOperatorId(userDetail.getUserId());
                auditLog.setOperatorOrgId(userDetail.getOrgId());
                auditLog.setRoleId(userDetail.getRoleId());
            }
        } catch (Exception e) {
            // 无法获取用户信息的情况，记录为UNKNOWN
            log.debug("无法获取用户信息，记录为UNKNOWN: {}", e.getMessage());
            auditLog.setOperatorId("UNKNOWN");
            auditLog.setOperatorOrgId("UNKNOWN");
            auditLog.setRoleId("UNKNOWN");
        }
    }
}
```

### 关键特性
1. **深拷贝脱敏**: 使用`ObjectUtil.cloneByStream`确保原对象不受影响
2. **用户上下文**: 自动从请求上下文获取用户信息
3. **异常容错**: 无法获取用户信息时记录为"UNKNOWN"
4. **异步处理**: 审计日志异步保存，不影响主流程
5. **精确时间**: 使用毫秒级时间戳，便于问题排查
## 4. 数据库设计

### 审计日志表结构

**位置**: `SVT-Server/src/main/resources/db/init/ddl.sql`

```sql
CREATE TABLE audit_log (
    audit_id NVARCHAR(32) PRIMARY KEY,           -- 分布式ID（雪花算法）
    operation_time NVARCHAR(30) NOT NULL,        -- 操作时间（毫秒级）
    operation_ip NVARCHAR(50),                   -- 客户端IP地址
    operator_id NVARCHAR(32),                    -- 操作用户ID
    operator_org_id NVARCHAR(32),                -- 操作用户所属组织ID
    role_id NVARCHAR(32),                        -- 操作用户角色ID
    request_params NVARCHAR(MAX),                -- 请求参数（JSON格式）
    response_result NVARCHAR(MAX),               -- 响应结果（JSON格式）
    operation_url NVARCHAR(500),                 -- 请求URL路径
    operation_desc NVARCHAR(500),                -- 操作描述
    operation_result CHAR(1) DEFAULT '0',        -- 操作结果: 0-成功, 1-失败
    error_msg NVARCHAR(MAX)                      -- 错误信息
);

-- 索引优化
CREATE INDEX idx_audit_log_time ON audit_log(operation_time);
CREATE INDEX idx_audit_log_operator ON audit_log(operator_id);
CREATE INDEX idx_audit_log_org ON audit_log(operator_org_id);
CREATE INDEX idx_audit_log_result ON audit_log(operation_result);
CREATE INDEX idx_audit_log_desc ON audit_log(operation_desc);
```

### 实体类定义

**位置**: `com.seventeen.svt.modules.system.entity.AuditLog`

```java
@Data
@Table("audit_log")
public class AuditLog {
    @Id
    @DistributedId
    @Column(value = "audit_id", comment = "审计日志ID")
    private String auditId;
    
    @Column(value = "operation_time", comment = "操作时间")
    private String operationTime;
    
    @Column(value = "operation_ip", comment = "操作IP")
    private String operationIp;
    
    @Column(value = "operator_id", comment = "操作用户ID")
    private String operatorId;
    
    @Column(value = "operator_org_id", comment = "操作用户组织ID")
    private String operatorOrgId;
    
    @Column(value = "role_id", comment = "角色ID")
    private String roleId;
    
    @Column(value = "request_params", comment = "请求参数")
    private String requestParams;
    
    @Column(value = "response_result", comment = "响应结果")
    private String responseResult;
    
    @Column(value = "operation_url", comment = "操作URL")
    private String operationUrl;
    
    @Column(value = "operation_desc", comment = "操作描述")
    private String operationDesc;
    
    @Column(value = "operation_result", comment = "操作结果")
    private String operationResult; // 0:成功 1:失败
    
    @Column(value = "error_msg", comment = "错误信息")
    private String errorMsg;
}
```

## 5. 敏感数据脱敏

当`sensitive=true`时，系统自动对标记为`@SensitiveLog`的字段进行脱敏处理。

### 敏感数据注解

**位置**: `com.seventeen.svt.common.annotation.audit.SensitiveLog`

```java
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface SensitiveLog {
    /**
     * 脱敏策略
     */
    SensitiveStrategy strategy() default SensitiveStrategy.DEFAULT;
}
```

### 脱敏策略枚举

```java
public enum SensitiveStrategy {
    DEFAULT,        // 默认脱敏（数据中间打*）
    PHONE,          // 手机号脱敏: 138****1234
    ID_CARD,        // 身份证脱敏: 123***********4567
    PASSWORD,       // 密码脱敏: ********
    EMAIL,          // 邮箱脱敏: te***@example.com
    BANK_CARD,      // 银行卡脱敏: **** **** **** 1234
    NAME,           // 姓名脱敏: 张*三
    ADDRESS,        // 地址脱敏: 北京市朝阳区***
    IP              // IP地址脱敏: 192.168.***.***
}
```

### 使用示例

```java
public class UserDTO {
    @SensitiveLog(strategy = SensitiveStrategy.PHONE)
    private String phone;  // 138****1234
    
    @SensitiveLog(strategy = SensitiveStrategy.PASSWORD)
    private String password;  // ********
    
    @SensitiveLog(strategy = SensitiveStrategy.ID_CARD)
    private String idCard;  // 123***********4567
    
    @SensitiveLog(strategy = SensitiveStrategy.EMAIL)
    private String email;  // te***@example.com
    
    @SensitiveLog(strategy = SensitiveStrategy.NAME)
    private String name;  // 张*三
}
```

### 脱敏工具类

**位置**: `com.seventeen.svt.common.util.SensitiveUtil`

脱敏处理通过反射递归处理对象的所有字段，支持：
- 嵌套对象袁敏
- 集合类型脱敏
- 数组类型脱敏
- 空值安全处理
- 循环引用检测

## 6. 异步处理机制

### 线程池配置

**位置**: `com.seventeen.svt.common.config.AsyncConfig`

```java
@Configuration
@EnableAsync
public class AsyncConfig {
    
    @Bean("auditLogExecutor")
    public Executor auditLogExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);           // 核心线程数
        executor.setMaxPoolSize(5);            // 最大线程数
        executor.setQueueCapacity(1000);       // 队列容量
        executor.setKeepAliveSeconds(60);      // 线程空闲时间
        executor.setThreadNamePrefix("audit-log-"); // 线程名前缀
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
}
```

### 异步服务实现

**位置**: `com.seventeen.svt.modules.system.service.impl.AuditLogServiceImpl`

```java
@Service
public class AuditLogServiceImpl implements AuditLogService {
    
    @Async("auditLogExecutor")
    @Override
    public void asyncSave(AuditLog auditLog) {
        try {
            // 生成分布式ID
            if (StrUtil.isBlank(auditLog.getAuditId())) {
                auditLog.setAuditId(distributedIdGenerator.nextId());
            }
            
            // 保存到数据库
            auditLogMapper.insert(auditLog);
            
            log.debug("审计日志保存成功: {}", auditLog.getOperationDesc());
            
        } catch (Exception e) {
            log.error("审计日志保存失败: {}", e.getMessage(), e);
            // 注意：这里不抛出异常，避免影响主业务流程
        }
    }
}
```

## 7. 性能优化

### 存储优化
1. **选择性记录**: 高频查询使用`recordResult=false`减少存储
2. **数据压缩**: JSON数据可考虑压缩存储
3. **分表策略**: 按月或按年分表存储
4. **归档策略**: 定期归档历史数据

### 性能监控
1. **线程池监控**: 监控异步线程池使用情况
2. **存储性能**: 监控数据库写入性能
3. **内存使用**: 监控脱敏处理的内存开销

## 8. 最佳实践

### 开发规范
1. **关键操作必须审计**: 创建、更新、删除操作必须添加`@Audit`
2. **查询操作选择性记录**: 设置`recordResult=false`减少存储
3. **描述信息有意义**: 使用清晰的操作描述
4. **敏感数据脱敏**: 处理个人信息的操作启用脱敏
5. **异常信息记录**: 遇到错误时记录详细信息便于排查

### 运维管理
1. **日志表大小监控**: 定期检查表大小并实施清理策略
2. **存储容量规划**: 根据业务量规划存储容量
3. **备份策略**: 定期备份重要审计数据
4. **查询性能优化**: 为常用查询字段建立索引
5. **合规性检查**: 定期检查审计日志的完整性和准确性

### 安全考虑
1. **数据脱敏验证**: 定期验证脱敏效果
2. **访问权限控制**: 限制审计日志的访问权限
3. **数据完整性**: 防止审计日志被篡改或删除
4. **传输加密**: 敏感审计数据传输加密
5. **存储加密**: 核心审计数据存储加密