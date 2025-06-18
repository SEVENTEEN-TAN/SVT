# 分布式ID生成器

本文档详细介绍了项目中的分布式ID生成器方案，该方案旨在为分布式系统提供全局唯一、高性能且格式可定制的ID。

## 1. 设计目标

- **全局唯一**: 在分布式环境下保证生成的ID不重复。
- **高性能**: 低延迟，高吞吐量，减少对数据库的依赖。
- **高可用**: 避免单点故障。
- **格式可定制**: 支持业务前缀、日期、序列号等组合，提高可读性。
- **趋势递增**: 生成的ID在大部分情况下保持趋势递增。

## 2. 整体架构

ID生成器采用"本地缓存 + Redis锁 + 数据库"的三层架构，以平衡性能与一致性。

```mermaid
graph TD
    A(应用服务) -->|1. 请求ID| B{FlexInsertListener};
    B -->|2. 从Caffeine获取| C[本地ID缓存 (Caffeine)];
    C -->|3. 缓存命中| D(返回ID);
    C -->|4. 缓存未命中| E{获取新号段};
    
    subgraph E
        F(获取Redis分布式锁) --> G{查询数据库};
        G --> H(生成一批新ID);
        H --> I(更新数据库当前序列);
        I --> J(写入本地ID缓存);
        J --> K(释放Redis锁);
    end

    E --> D;
```

- **应用层**: 通过MyBatis-Flex的`FlexInsertListener`，在插入数据时自动为标记了`@DistributedId`注解的字段填充ID。
- **缓存层**: 使用**Caffeine**作为本地缓存，预先存储一批ID。应用请求ID时首先从本地获取，性能极高。
- **锁机制**: 使用**Redis**实现分布式锁，确保在多个服务实例同时请求新ID号段时，只有一个实例能够操作数据库，防止ID重复。
- **持久化层**: 使用数据库（`db_key`表）持久化每个业务ID的配置和当前序列的最大值。

## 3. 工作流程

1.  **触发**: 当插入一个带有`@DistributedId`注解的实体时，`FlexInsertListener`被触发。
2.  **本地缓存查询**: `DistributedIdGenerator`首先检查本地Caffeine缓存中是否还有预生成的ID。
3.  **缓存命中**: 如果有，直接取出一个ID并返回，流程结束。
4.  **缓存未命中 (获取新号段)**:
    a.  **获取分布式锁**: 尝试获取该业务ID对应的Redis锁。如果失败，则短暂等待后重试。
    b.  **双重检查**: 成功获取锁后，再次检查本地缓存（防止在等待锁的过程中，其他线程已经获取了新的ID号段）。
    c.  **访问数据库**: 从`db_key`表中查询当前业务ID的配置（前缀、日期格式、当前序列等）。
    d.  **生成ID批次**: 根据配置，在内存中生成一批新的ID（例如100个）。
    e.  **更新数据库**: 将`db_key`表中该业务的`current_id`更新为新批次的起始值。
    f.  **填充本地缓存**: 将新生成的ID批次存入Caffeine缓存。
    g.  **释放分布式锁**: 释放Redis锁。
    h.  从本地缓存中取出一个ID并返回。

## 4. 关键特性

### 4.1 ID格式定制

通过`@DistributedId`注解可以灵活定义ID格式。

```java
@Data
@Table("purchase_order")
public class PurchaseOrder {
    @Column(fill = FieldFill.INSERT)
    @DistributedId(prefix = "PO", dateFormat = "yyyyMMdd", paddingLength = 8)
    private String orderId; // -> PO2025061800000001
}
```

### 4.2 日期变更处理

ID生成器会自动处理日期变更。例如，当从`2025-06-18`变为`2025-06-19`时，序列号会自动重置为1。

### 4.3 ID溢出处理

当纯数字序列号用尽时（例如，6位数字超过`999999`），系统会自动引入字母前缀（A000001, B000001...）来扩展ID容量，确保服务不会中断。

## 5. 核心组件

- **`@DistributedId`**: 注解，用于标记需要自动生成ID的字段并提供配置。
- **`DistributedIdGenerator`**: ID生成的核心服务，管理整个生命周期。
- **`DbKeyCacheUtil`**: 基于Caffeine的本地缓存工具，缓存ID批次和`db_key`配置。
- **`DistributedLockUtil`**: 基于Redis的分布式锁工具。
- **`FlexInsertListener`**: MyBatis-Flex监听器，实现自动填充。

## 6. 数据库设计 (`db_key`)

```sql
CREATE TABLE db_key (
    table_name VARCHAR(100) NOT NULL PRIMARY KEY, -- 表名, 主键
    entity_name VARCHAR(100) NOT NULL,           -- 实体类名
    prefix VARCHAR(10) NOT NULL,                 -- ID前缀
    date_format VARCHAR(20) DEFAULT 'yyyyMMdd',  -- 日期格式
    padding_length INT DEFAULT 6,                -- 序列号填充位数
    batch_size INT DEFAULT 100,                  -- 批量获取数量
    current_id BIGINT DEFAULT 1,                 -- 当前起始ID
    record_date DATE,                            -- 记录日期
    current_letter_position INT DEFAULT 0,       -- 字母扩展位置
    last_update_time DATETIME NOT NULL,          -- 最后更新时间
);
```

## 7. 异常处理与高可用

- **锁获取失败**: 设计了重试机制，若持续失败则抛出异常，防止死循环。
- **Redis宕机**: 如果Redis不可用，ID生成会失败，但由于是插入新数据时的操作，不会影响现有系统的读写。服务会降级为无法创建新实体。
- **数据库宕机**: ID生成会失败，服务降级。

这种设计通过本地缓存保证了绝大部分场景下的高性能，仅在需要获取新号段时才访问Redis和数据库，大大降低了对下游服务的压力。 