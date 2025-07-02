# Automated Transaction Management

## Implementation

SVT uses convention-based automatic transaction management through AOP, reducing the need for explicit `@Transactional` annotations.

### Transaction Annotation

```java
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface AutoTransaction {
    TransactionType type() default TransactionType.AUTO;
    Propagation propagation() default Propagation.REQUIRED;
    Isolation isolation() default Isolation.DEFAULT;
    int timeout() default -1;
    boolean readOnly() default false;
}
```

### Transaction Types

```java
public enum TransactionType {
    AUTO,       // Determine by method name prefix
    READ_ONLY,  // Read-only transaction
    REQUIRED,   // Read-write transaction
    NONE        // No transaction
}
```

## Convention-Based Configuration

### Method Name Prefixes

```yaml
# application.yml
transaction:
  prefix:
    readonly:
      - get
      - query
      - find
      - list
      - count
      - check
      - exists
    required:
      - save
      - update
      - delete
      - insert
      - add
      - modify
      - remove
      - create
    none:
      - export
      - download
      - print
      - generate
```

### Automatic Detection

The `AutoTransactionAspect` automatically applies transactions based on method names:

```java
@Service
public class UserServiceImpl implements UserService {
    
    // Automatically applies read-only transaction
    public UserInfo getUserById(String id) {
        return userMapper.selectById(id);
    }
    
    // Automatically applies read-write transaction
    public void saveUser(UserDTO dto) {
        userMapper.insert(dto);
    }
    
    // No transaction applied
    public void exportUsers() {
        // Long-running export operation
    }
}
```

## Explicit Control

Use `@AutoTransaction` when you need to override conventions:

```java
// Method name doesn't match convention but needs transaction
@AutoTransaction(type = TransactionType.REQUIRED)
public void performBatchOperation() {
    // Batch operations
}

// Special isolation level for consistency
@AutoTransaction(type = TransactionType.READ_ONLY, isolation = Isolation.SERIALIZABLE)
public List<Account> getAccountBalance() {
    // Critical read operation
}

// Override no-transaction convention
@AutoTransaction(type = TransactionType.READ_ONLY)
public void exportWithConsistency() {
    // Export with data consistency
}
```

## Transaction Monitoring

The `TransactionMonitorAspect` tracks transaction performance:

```java
@Aspect
@Component
@Order(200) // Lower priority than AutoTransactionAspect
public class TransactionMonitorAspect {
    
    @Around("@annotation(org.springframework.transaction.annotation.Transactional)")
    public Object monitor(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();
        try {
            return joinPoint.proceed();
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            if (duration > 1000) { // Log slow transactions
                log.warn("Slow transaction: {} took {}ms", 
                    joinPoint.getSignature().toShortString(), duration);
            }
        }
    }
}
```

## Best Practices

1. **Follow Naming Conventions**: Use standard prefixes for methods
   - Read operations: `get*`, `find*`, `query*`, `list*`
   - Write operations: `save*`, `update*`, `delete*`, `create*`
   - Non-transactional: `export*`, `download*`, `generate*`

2. **Use Explicit Annotation When Needed**:
   - Methods with non-standard names
   - Special transaction requirements
   - Override default behavior

3. **Monitor Transaction Performance**:
   - Enable transaction monitoring in production
   - Set appropriate timeout values
   - Watch for long-running transactions

4. **Transaction Scope**:
   - Keep transactions as short as possible
   - Avoid external calls within transactions
   - Be aware of transaction propagation

## Configuration Options

```yaml
# Full transaction configuration
transaction:
  # Method prefix configuration
  prefix:
    readonly: [get, query, find]
    required: [save, update, delete]
    none: [export, download]
  
  # Monitoring configuration
  monitor:
    enabled: true
    slow-threshold: 1000  # milliseconds
    
  # Default timeout
  default-timeout: 30  # seconds
```

## Utilities

```java
// Check current transaction status
boolean inTransaction = TransactionUtils.isActualTransactionActive();
boolean isReadOnly = TransactionUtils.isCurrentTransactionReadOnly();
String transactionName = TransactionUtils.getCurrentTransactionName();
```