# 分布式ID生成器设计文档

## 主要功能点

### 1. 自定义ID格式支持
- 支持前缀(如AB)
- 支持日期格式(如yyyyMMdd)
- 支持补充位数(如6位)
- 支持批量获取数量(默认100)
- 最终格式如: AB20250326000001

### 2. 数据库存储
- 使用db_key表存储配置信息
- 包含字段:
  * entity_name: 实体类名
  * table_name: 表名
  * prefix: 前缀
  * date_format: 日期格式
  * padding_length: 补充位数
  * batch_size: 批量获取数量
  * current_id: 当前起始ID
  * record_date: 当前日期(避免使用current_date关键字)
  * current_letter_position: 当前字母位置
  * last_update_time: 最后更新时间

### 3. 分布式锁
- 使用Redis实现分布式锁
- 防止多服务同时更新DB中的ID记录
- 锁粒度: 表名
- 锁值使用UUID保证唯一性
- 锁超时时间: 10秒
- 锁等待时间: 5秒

### 4. 本地缓存
- 使用Caffeine实现本地缓存(DbKeyCacheUtil)
- 两级缓存设计:
  * 配置缓存: 缓存DbKey配置对象
  * ID缓存: 缓存预生成的ID列表
- 缓存失效时间: 1天
- 缓存大小: 初始容量100,最大1000

## 工作流程

### 1. ID生成触发
- 实体插入时通过MyBatis-Plus自动填充机制检查@DistributedId注解
- 获取实体类上的@TableName注解值作为表名
- 使用@DistributedId注解配置的参数

### 2. ID获取流程
- 首先从ID缓存获取已生成的ID
  * 如果有ID可用,直接返回
  * 如果ID用完,进入获取新批次流程

### 3. 获取新批次ID
- 获取分布式锁(防止并发问题)
- 再次检查缓存(可能其他线程已更新)
- 从DB获取或创建配置
- 检查日期是否变更
- 生成一批新ID并缓存
- 更新DB中的配置
- 释放分布式锁

### 4. 日期变更处理
- 配置中保存最后生成ID的日期
- 生成ID时检查当前日期与配置日期
- 如果日期变更:
  * 重置ID计数器为1
  * 更新DB中的日期记录
  * 重置字母位置为0

### 5. ID溢出处理
- 当ID超过补充位数上限时:
  * 如6位数字用完(>999999)
  * 增加字母位置(A00001, B00001等)
  * 更新DB中的字母位置记录

## 异常处理

### 1. 分布式锁获取失败
- 等待100ms后重试
- 最多重试50次(约5秒)
- 重试失败时抛出RuntimeException
- 上层捕获并友好提示

### 2. 缓存处理
- 缓存失效时自动重新获取
- 服务重启后缓存重建
- ID缓存用完时重新获取批次

### 3. 数据库异常
- 获取配置失败时创建新配置
- 更新配置失败时记录日志并重试
- 持续失败时抛出异常

### 4. 循环依赖处理
- 使用@Lazy注解延迟加载DistributedIdGenerator
- 使用构造器注入避免字段注入
- 避免递归调用导致栈溢出

## 注解设计

```java
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface DistributedId {
    // 前缀
    String prefix() default "";
    
    // 日期格式
    String dateFormat() default "yyyyMMdd";
    
    // 补充位数
    int paddingLength() default 6;
    
    // 批量获取数量
    int batchSize() default 100;
}
```

## 使用示例

```java
@Data
@TableName("order")
public class Order {
    @TableField(fill = FieldFill.INSERT)
    @DistributedId(prefix = "ORD", dateFormat = "yyyyMMdd", paddingLength = 6)
    private String orderId;
    
    // 其他字段...
}
```

## 数据库设计

```sql
CREATE TABLE db_key (
    -- 表名
    table_name VARCHAR(100) NOT NULL,
    -- 实体类名
    entity_name VARCHAR(100) NOT NULL,
    -- ID前缀
    prefix VARCHAR(10) NOT NULL,
    -- 日期格式
    date_format VARCHAR(20) NOT NULL DEFAULT 'yyyyMMdd',
    -- 补充位数
    padding_length INT NOT NULL DEFAULT 6,
    -- 批量获取数量
    batch_size INT NOT NULL DEFAULT 100,
    -- 当前起始ID
    current_id BIGINT NOT NULL DEFAULT 1,
    -- 当前日期(避免使用current_date关键字)
    record_date DATE,
    -- 当前字母位置(用于扩展容量)
    current_letter_position INT NOT NULL DEFAULT 0,
    -- 最后更新时间
    last_update_time DATETIME NOT NULL DEFAULT GETDATE(),
    -- 唯一索引
    CONSTRAINT uk_db_key_table_name UNIQUE (table_name)
);

-- 创建索引
CREATE INDEX idx_db_key_entity_name ON db_key(entity_name);
```

## 核心组件

### 1. DistributedIdGenerator
- 负责生成和管理分布式ID
- 使用分布式锁保证并发安全
- 管理ID缓存池
- 处理日期变更和ID溢出

### 2. DbKeyCacheUtil
- 使用Caffeine实现高性能本地缓存
- 缓存DbKey配置对象
- 缓存预生成ID列表
- 提供缓存统计功能

### 3. DistributedLockUtil
- 基于Redis实现分布式锁
- 支持锁超时和重试机制
- 使用UUID作为锁值
- 安全释放锁逻辑

### 4. AutoFillHandler
- 实现MyBatis-Plus的MetaObjectHandler接口
- 自动填充ID字段
- 获取@TableName和@DistributedId注解信息
- 处理不同字段类型

## 注意事项

### 1. SQL Server关键字
- 避免使用SQL Server关键字(如current_date)作为列名
- 使用record_date替代current_date
- 如必须使用关键字,需用方括号包裹,如[current_date]

### 2. ID类型匹配
- 确保实体类的ID字段类型与生成ID类型一致(通常是String)
- 使用适当的类型转换避免类型不匹配错误

### 3. 字段类型匹配
- 确保DbKey实体中的lastUpdateTime字段类型与自动填充类型一致
- 使用合适的日期类型(DateTime、Date、LocalDateTime等)

### 4. 锁超时设置
- 设置合理的锁超时时间,过短可能导致锁提前释放
- 设置合理的等待时间,过长会影响响应时间

### 5. 缓存大小设置
- 根据系统规模设置适当的缓存大小
- 过大会占用过多内存,过小会频繁重建缓存

### 6. ID容量规划
- 根据业务预估每日ID使用量
- 设置合理的批量获取数量
- 考虑ID溢出后的字母扩展策略

## 性能优化

### 1. 批量生成策略
- 一次性生成batchSize个ID
- 减少数据库访问次数
- 减少分布式锁竞争

### 2. 缓存优化
- 使用高性能缓存库(Caffeine)
- 配置合理的过期策略
- 缓存统计监控使用情况

### 3. 并发处理
- 按表名粒度加锁,提高并发度
- 双重检查减少锁竞争
- 使用ConcurrentHashMap保证线程安全

### 4. 数据库优化
- 使用批量更新减少数据库操作
- 索引优化提高查询性能
- 定期清理长期不用的配置
