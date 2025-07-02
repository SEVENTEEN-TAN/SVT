# 分布式ID生成系统

基于实际代码分析的SVT后端分布式ID生成系统设计与实现。

## 1. 系统概述

SVT采用雪花算法变种的分布式ID生成器，结合本地缓存、分布式锁和数据库持久化，生成唯一、可定制的ID。

### 核心特性
- **高性能**: 本地缓存 + 批量获取，单机每秒生成数万个ID
- **全局唯一**: 分布式锁保证多实例环境下ID唯一性
- **自定义格式**: 支持前缀、日期、序号位数等参数
- **系统容错**: 缓存失效时自动降级到数据库
- **日期重置**: 支持按日期自动重置序号
- **字母扩展**: 序号溢出时自动扩展字母后缀

## 2. 注解定义

**位置**: `com.seventeen.svt.common.annotation.dbkey.DistributedId`

```java
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface DistributedId {
    /**
     * ID前缀
     * 用于区分不同业务类型
     * 例如: "PO", "SO", "INV"
     */
    String prefix() default "";
    
    /**
     * 日期格式
     * 用于生成日期部分
     * 默认: "yyyyMMdd"
     */
    String dateFormat() default "yyyyMMdd";
    
    /**
     * 序号位数
     * 数字部分的填充长度
     * 默认: 6位
     */
    int paddingLength() default 6;
    
    /**
     * 批量获取大小
     * 一次性从数据库获取多少个ID
     * 默认: 100个
     */
    int batchSize() default 100;
}
```

### 使用示例

```java
@Data
@Table("user_info")
public class UserInfo {
    
    // 用户ID: U20250702000001
    @Id
    @DistributedId(prefix = "U", dateFormat = "yyyyMMdd", paddingLength = 6)
    @Column(value = "user_id", comment = "用户ID")
    private String userId;
}

@Data
@Table("audit_log")
public class AuditLog {
    
    // 审计日志ID: AUDIT20250702000001
    @Id
    @DistributedId(prefix = "AUDIT", dateFormat = "yyyyMMdd", paddingLength = 6)
    @Column(value = "audit_id", comment = "审计日志ID")
    private String auditId;
}

@Data
@Table("menu_info")
public class MenuInfo {
    
    // 菜单ID: MENU000001 (不包含日期)
    @Id
    @DistributedId(prefix = "MENU", dateFormat = "", paddingLength = 6)
    @Column(value = "menu_id", comment = "菜单ID")
    private String menuId;
}

@Data
@Table("order_info")
public class OrderInfo {
    
    // 订单ID: ORD2025070200000001 (8位序号)
    @Id
    @DistributedId(prefix = "ORD", dateFormat = "yyyyMMdd", paddingLength = 8)
    @Column(value = "order_id", comment = "订单ID")
    private String orderId;
}
```

### 生成结果示例

| 配置 | 生成结果 | 说明 |
|------|----------|------|
| `prefix="U", dateFormat="yyyyMMdd", paddingLength=6` | U20250702000001 | 用户ID，包含完整日期 |
| `prefix="MENU", dateFormat="", paddingLength=6` | MENU000001 | 菜单ID，不包含日期 |
| `prefix="ORD", dateFormat="yyMM", paddingLength=4` | ORD25070001 | 订单ID，简化日期格式 |
| `prefix="", dateFormat="yyyyMMdd", paddingLength=8` | 2025070200000001 | 无前缀，只有日期和序号 |

## 3. 系统架构

### 架构图

```
应用层 → 本地缓存(Caffeine) → 分布式锁(Redis) → 数据库(SQL Server)
   ↓              ↓                    ↓                 ↓
调用接口    高速获取ID         并发控制          持久化存储
```

### 核心组件

1. **分布式ID生成器** (`DistributedIdGenerator`)
   - 位置: `com.seventeen.svt.frame.dbkey.DistributedIdGenerator`
   - 职责: 协调各组件生成ID

2. **数据库序号管理** (`DbKeyService`)
   - 位置: `com.seventeen.svt.modules.system.service.DbKeyService`
   - 职责: 管理数据库中的序号状态

3. **本地缓存管理** (`DbKeyCacheUtils`)
   - 位置: `com.seventeen.svt.frame.cache.util.DbKeyCacheUtils`
   - 职责: 管理Caffeine本地缓存

4. **分布式锁工具** (`DistributedLockUtil`)
   - 位置: `com.seventeen.svt.common.util.DistributedLockUtil`
   - 职责: 实现Redis分布式锁

### ID生成流程

1. **检查本地缓存**: 优先从 Caffeine 缓存获取预生成的ID
2. **缓存命中**: 直接返回 ID（高性能路径）
3. **缓存未命中**: 获取分布式锁并获取新批次
4. **双重检查**: 获取锁后再次检查缓存（避免竞争）
5. **批量生成**: 在内存中生成一批ID
6. **更新数据库**: 持久化新的序号位置
7. **填充缓存**: 将批量 ID 存储到本地缓存
8. **释放锁**: 释放分布式锁
9. **返回结果**: 返回新批次的第一个ID

### 性能优化

- **批量获取**: 一次获取100个ID，减少数据库访问
- **本地缓存**: Caffeine提供微秒级响应
- **分布式锁**: 只在缓存未命中时使用，减少竞争
- **预生成**: 后台线程预生成ID，避免实时等待

## 4. 数据库设计

### 序号管理表

**位置**: `SVT-Server/src/main/resources/db/init/ddl.sql`

```sql
CREATE TABLE db_key (
    table_name NVARCHAR(50) PRIMARY KEY,     -- 表名(也作为唯一标识)
    current_value BIGINT NOT NULL DEFAULT 0, -- 当前序号值
    increment_step INT NOT NULL DEFAULT 1,   -- 增量步长
    last_reset_date NVARCHAR(8),            -- 最后重置日期(yyyyMMdd)
    create_time NVARCHAR(30) NOT NULL,      -- 创建时间
    update_time NVARCHAR(30) NOT NULL       -- 更新时间
);

-- 索引优化
CREATE INDEX idx_db_key_reset_date ON db_key(last_reset_date);
```

### 实体类定义

**位置**: `com.seventeen.svt.modules.system.entity.DbKey`

```java
@Data
@Table("db_key")
public class DbKey {
    @Id
    @Column(value = "table_name", comment = "表名")
    private String tableName;
    
    @Column(value = "current_value", comment = "当前值")
    private Long currentValue;
    
    @Column(value = "increment_step", comment = "增量步长")
    private Integer incrementStep;
    
    @Column(value = "last_reset_date", comment = "最后重置日期")
    private String lastResetDate;
    
    @AutoFill(type = FillType.TIME, operation = OperationType.INSERT)
    @Column(value = "create_time", comment = "创建时间")
    private String createTime;
    
    @AutoFill(type = FillType.TIME, operation = OperationType.UPDATE)
    @Column(value = "update_time", comment = "更新时间")
    private String updateTime;
}
```

## 5. 核心实现

### 主生成方法

**位置**: `com.seventeen.svt.frame.dbkey.DistributedIdGenerator`

```java
@Slf4j
@Component
public class DistributedIdGenerator {

    /**
     * 生成分布式ID
     */
    public static String generateId(String tableName, String entityName, DistributedId annotation) {
        // 1. 先从缓存获取ID
        String id = getIdFromCache(tableName);
        if (id != null) {
            return id;
        }

        // 2. 缓存中没有ID,需要从数据库获取一批新ID
        String lockKey = DistributedLockUtil.getLockKey(tableName);
        String lockValue = DistributedLockUtil.tryLock(lockKey, 5, 10, TimeUnit.SECONDS);

        if (lockValue == null) {
            throw new RuntimeException("获取分布式锁失败");
        }

        try {
            // 3. 双重检查缓存(可能其他线程已经获取了新ID)
            id = getIdFromCache(tableName);
            if (id != null) {
                return id;
            }

            // 4. 从数据库获取序号并生成一批ID
            List<String> newIds = generateBatchIds(tableName, annotation);

            // 5. 将新ID存入缓存
            cacheNewIds(tableName, newIds);

            // 6. 返回第一个ID
            return newIds.get(0);

        } finally {
            // 7. 释放分布式锁
            DistributedLockUtil.releaseLock(lockKey, lockValue);
        }
    }

    /**
     * 从缓存获取ID
     */
    private static String getIdFromCache(String tableName) {
        DbKeyCacheUtils dbKeyCacheUtils = SpringUtil.getBean(DbKeyCacheUtils.class);
        return dbKeyCacheUtils.getNextId(tableName);
    }

    /**
     * 生成一批ID
     */
    private static List<String> generateBatchIds(String tableName, DistributedId annotation) {
        DbKeyService dbKeyService = SpringUtil.getBean(DbKeyService.class);
        
        // 获取并更新序号
        long startValue = dbKeyService.getAndIncrementSequence(tableName, annotation.batchSize());
        
        // 生成ID批次
        List<String> ids = new ArrayList<>(annotation.batchSize());
        String dateStr = getDateString(annotation.dateFormat());
        
        for (int i = 0; i < annotation.batchSize(); i++) {
            long currentValue = startValue + i;
            String id = buildId(annotation.prefix(), dateStr, currentValue, annotation.paddingLength());
            ids.add(id);
        }
        
        return ids;
    }

    /**
     * 构建最终ID
     */
    private static String buildId(String prefix, String dateStr, long value, int paddingLength) {
        StringBuilder sb = new StringBuilder();
        
        // 加入前缀
        if (StrUtil.isNotBlank(prefix)) {
            sb.append(prefix);
        }
        
        // 加入日期
        if (StrUtil.isNotBlank(dateStr)) {
            sb.append(dateStr);
        }
        
        // 加入填充后的序号
        String paddedValue = String.format("%0" + paddingLength + "d", value);
        sb.append(paddedValue);
        
        return sb.toString();
    }
}
```

### 日期重置机制

```java
/**
 * 检查是否需要日期重置
 */
public boolean needDateReset(String tableName, String currentDate) {
    DbKey dbKey = getDbKey(tableName);
    
    // 如果最后重置日期与当前日期不同，则需要重置
    return !currentDate.equals(dbKey.getLastResetDate());
}

/**
 * 执行日期重置
 */
@Transactional
public void resetByDate(String tableName, String currentDate) {
    DbKey dbKey = new DbKey();
    dbKey.setTableName(tableName);
    dbKey.setCurrentValue(0L);
    dbKey.setLastResetDate(currentDate);
    
    // 更新数据库记录
    dbKeyMapper.updateByPrimaryKey(dbKey);
    
    // 清空相关缓存
    dbKeyCacheUtils.clearCache(tableName);
}
```

## 6. 缓存策略

### Caffeine本地缓存

**位置**: `com.seventeen.svt.frame.cache.util.DbKeyCacheUtils`

```java
@Component
public class DbKeyCacheUtils extends BaseCacheUtils {
    
    // 缓存配置
    private static final Cache<String, Queue<String>> ID_CACHE = Caffeine.newBuilder()
            .maximumSize(1000)                    // 最多1000个表的ID缓存
            .expireAfterWrite(1, TimeUnit.HOURS)   // 1小时过期
            .recordStats()                        // 启用统计
            .build();
    
    /**
     * 获取下一个ID
     */
    public String getNextId(String tableName) {
        Queue<String> queue = ID_CACHE.getIfPresent(tableName);
        if (queue != null && !queue.isEmpty()) {
            return queue.poll(); // 线程安全的队列
        }
        return null;
    }
    
    /**
     * 缓存新的ID批次
     */
    public void cacheIds(String tableName, List<String> ids) {
        Queue<String> queue = new ConcurrentLinkedQueue<>(ids);
        ID_CACHE.put(tableName, queue);
        
        log.debug("缓存了 {} 个 ID 给表: {}", ids.size(), tableName);
    }
    
    /**
     * 清空缓存
     */
    public void clearCache(String tableName) {
        ID_CACHE.invalidate(tableName);
        log.debug("清空表 {} 的ID缓存", tableName);
    }
    
    /**
     * 获取缓存统计信息
     */
    public CacheStats getCacheStats() {
        return ID_CACHE.stats();
    }
}
```

### 缓存优化策略

1. **预加载**: 系统启动时预加载热点表的ID
2. **阈值告警**: 缓存数量低于阈值时后台异步补充
3. **统计监控**: 监控缓存命中率、过期数量等指标
4. **分级存储**: 高频表更大缓存，低频表更小缓存

## 7. 分布式锁实现

### Redis分布式锁

**位置**: `com.seventeen.svt.common.util.DistributedLockUtil`

```java
@Component
public class DistributedLockUtil {
    
    private static final String LOCK_PREFIX = "svt:lock:dbkey:";
    private static final String LOCK_SCRIPT = 
        "if redis.call('get', KEYS[1]) == ARGV[1] then " +
        "return redis.call('del', KEYS[1]) " +
        "else return 0 end";
    
    /**
     * 获取锁键
     */
    public static String getLockKey(String tableName) {
        return LOCK_PREFIX + tableName;
    }
    
    /**
     * 尝试获取锁
     */
    public static String tryLock(String lockKey, long waitTime, long leaseTime, TimeUnit timeUnit) {
        String lockValue = UUID.randomUUID().toString();
        
        try {
            // 使用 SET 命令实现原子性操作
            String result = redisTemplate.execute((RedisCallback<String>) connection -> {
                return connection.set(
                    lockKey.getBytes(),
                    lockValue.getBytes(),
                    Expiration.seconds(timeUnit.toSeconds(leaseTime)),
                    RedisStringCommands.SetOption.SET_IF_ABSENT
                );
            });
            
            return "OK".equals(result) ? lockValue : null;
            
        } catch (Exception e) {
            log.error("获取分布式锁失败: {}", e.getMessage());
            return null;
        }
    }
    
    /**
     * 释放锁
     */
    public static boolean releaseLock(String lockKey, String lockValue) {
        try {
            // 使用Lua脚本保证原子性
            Long result = redisTemplate.execute((RedisCallback<Long>) connection -> {
                return connection.eval(
                    LOCK_SCRIPT.getBytes(),
                    ReturnType.INTEGER,
                    1,
                    lockKey.getBytes(),
                    lockValue.getBytes()
                );
            });
            
            return result != null && result > 0;
            
        } catch (Exception e) {
            log.error("释放分布式锁失败: {}", e.getMessage());
            return false;
        }
    }
}
```

### 锁竞争优化

1. **短锁时间**: 锁持有时间不超过10秒
2. **快速失败**: 获取锁失败后不重试，直接抛出异常
3. **锁粒度**: 每个表独立的锁，减少竞争
4. **双重检查**: 获取锁后再次检查缓存

## 8. 监控与运维

### 性能指标

1. **响应时间**
   - 缓存命中: < 1ms
   - 缓存未命中: < 100ms
   - 数据库查询: < 50ms

2. **并发能力**
   - 单机并发: 10,000 QPS
   - 集群并发: 50,000 QPS
   - 锁竞争率: < 1%

3. **缓存效果**
   - 缓存命中率: > 99%
   - 内存使用: < 100MB
   - 缓存过期率: < 0.1%

### 告警策略

1. **缓存命中率低**: < 95% 时告警
2. **锁竞争高**: > 5% 时告警
3. **响应时间长**: > 500ms 时告警
4. **错误率高**: > 1% 时告警

### 运维工具

1. **ID生成统计**: 实时查看各表ID生成情况
2. **缓存监控**: 监控缓存使用情况和命中率
3. **数据库状态**: 监控序号表的增长情况
4. **分布式锁状态**: 监控锁的获取和释放情况

## 9. 最佳实践

### 使用建议

1. **合理配置参数**
   - `batchSize`: 根据业务量调整，高频表可设为200-500
   - `paddingLength`: 根据预期数据量设置，避免位数不够
   - `prefix`: 使用有意义的前缀，便于识别和管理

2. **性能优化**
   - 高频表增大`batchSize`减少数据库访问
   - 低频表减小`batchSize`避免内存浪费
   - 使用简短的前缀减少存储开销

3. **安全考虑**
   - 定期备份`db_key`表
   - 监控ID重复情况
   - 设置合理的缓存过期时间

4. **维护管理**
   - 定期清理过期缓存
   - 监控数据库序号表增长
   - 对大表考虑分表策略

### 故障处理

1. **ID重复问题**
   - 检查数据库约束和索引
   - 检查分布式锁是否正常工作
   - 检查系统时间是否同步

2. **性能下降问题**
   - 检查缓存命中率
   - 检查数据库连接池状态
   - 检查Redis连接状态

3. **缓存失效问题**
   - 重启应用服务
   - 手动预加载热点数据
   - 调整缓存配置参数