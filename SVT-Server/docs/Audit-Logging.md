# 审计日志

本文档详细说明了项目的审计日志功能，该功能通过AOP（面向切面编程）自动记录关键业务操作，以满足合规性、安全监控和事后追溯的需求。

## 1. 设计目标
- **无侵入性**: 业务代码只需添加注解，无需编写任何日志记录的逻辑。
- **异步记录**: 日志记录在独立的线程池中异步执行，最大限度降低对主业务流程的性能影响。
- **信息全面**: 记录包括操作人、时间、IP、请求参数、响应结果、异常信息在内的完整上下文。
- **数据安全**: 对日志中的敏感信息（如密码、手机号）进行自动脱敏处理。
- **配置灵活**: 提供丰富的注解参数，允许开发者精细控制每个操作的审计粒度。

## 2. 整体架构

```mermaid
graph TD
    subgraph A [业务代码]
        B[@Audit注解]
    end
    
    A --> C{AuditAspect (AOP切面)};
    
    subgraph C
        D[拦截方法] --> E[收集上下文信息];
        E --> F[JSON序列化 & 脱敏];
        F --> G[提交到异步线程池];
    end
    
    G --> H((AuditLog线程池));
    H --> I(AuditLogService);
    I --> J[保存到数据库];
```

1.  开发者在需要审计的Controller方法上添加`@Audit`注解。
2.  `AuditAspect`切面会拦截所有标记了此注解的方法。
3.  在方法执行前后，切面收集操作人信息、请求详情、IP地址等上下文。
4.  如果配置了记录参数或结果，切面会将相关对象序列化为JSON字符串。在此过程中，`SensitiveUtil`会根据`@SensitiveLog`注解对指定字段进行脱敏。
5.  收集到的日志信息被封装成`AuditLog`实体，并提交到一个专用的异步线程池。
6.  `AuditLogService`从线程池中获取任务，并将日志最终持久化到数据库。

## 3. 注解驱动

### 3.1 `@Audit`
此注解是启用审计功能的核心，可配置在方法上。

- `description`: 操作的文字描述，例如 "创建用户"
- `recordParams`: 是否记录请求参数，默认为`true`
- `recordResult`: 是否记录响应结果，默认为`false`
- `recordException`: 是否记录异常信息，默认为`true`
- `sensitive`: 是否进行脱敏处理，默认为`true`

```java
// 实际的使用示例
@Audit(description = "用户登录", recordResult = true, sensitive = true)
@PostMapping("/login")
public Result<?> login() { ... }

@Audit(description = "查询用户列表", recordResult = false)
@GetMapping("/list")
public Result<?> listUsers() { ... }
```

### 3.2 `@SensitiveLog`
此注解用于标记实体类中需要脱敏的字段。

- `strategy`: 指定脱敏策略，是一个枚举`SensitiveStrategy`。

```java
@Data
public class UserDTO {
    @SensitiveLog(strategy = SensitiveStrategy.PHONE)
    private String phone;
    
    @SensitiveLog(strategy = SensitiveStrategy.PASSWORD)
    private String password;
}
```

## 4. 敏感信息脱敏

`SensitiveUtil`提供了多种内置的脱敏策略，包括：
- `ID_CARD`: 身份证号 (例如: `330...1234`)
- `PHONE`: 手机号 (例如: `138****1234`)
- `PASSWORD`: 密码 (例如: `********`)
- `BANK_CARD`: 银行卡号
- `EMAIL`: 邮箱
- `NAME`: 姓名

## 5. 异步处理

为了将审计日志对性能的影响降至最低，所有数据库写入操作均通过一个专用的`ThreadPoolTaskExecutor`（线程名前缀`audit-log-`）异步执行。这确保了即时在日志系统繁忙或数据库写入慢的情况下，主业务线程也能迅速返回。

## 6. 数据库设计 (`audit_log`)

```sql
CREATE TABLE audit_log (
    audit_id NVARCHAR(32) PRIMARY KEY,      -- 审计ID (分布式ID)
    operation_time DATETIME NOT NULL,       -- 操作时间
    operation_ip NVARCHAR(50),              -- 操作IP
    operator_id NVARCHAR(32),               -- 操作人ID
    operator_org_id NVARCHAR(32),           -- 操作机构ID
    role_id NVARCHAR(32),                   -- 角色ID
    request_params NVARCHAR(MAX),           -- 请求参数 (JSON)
    response_result NVARCHAR(MAX),          -- 响应结果 (JSON)
    operation_url NVARCHAR(500),            -- 操作URL
    operation_desc NVARCHAR(500),           -- 操作描述
    operation_result CHAR(1) DEFAULT '0',   -- 操作结果(0:成功, 1:失败)
    error_msg NVARCHAR(MAX)                 -- 错误信息
);
```

## 7. 运维与扩展
- **日志清理**: 建议制定定期任务，归档或清理旧的审计日志（例如，保留6个月）。
- **监控**: 应当监控审计日志线程池的队列积压情况和数据库的写入性能。
- **扩展**: 可以方便地增加新的`SensitiveStrategy`来满足未来的脱敏需求。 