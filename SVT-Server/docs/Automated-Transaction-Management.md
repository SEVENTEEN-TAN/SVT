# 自动化事务管理

本文档旨在说明项目中的自动化事务管理方案。该方案通过AOP（面向切面编程）技术，结合"约定优于配置"的思想，实现了基于方法名约定的声明式事务，极大地简化了开发人员在事务管理上的心智负担。

## 1. 设计思想

传统的Spring事务管理依赖于在每个需要事务的方法上显式添加`@Transactional`注解，这在大型项目中会导致注解泛滥，且容易遗漏。

本方案的核心思想是：**通过约定服务层（Service）的方法名称，来自动判断并应用相应的事务策略。**

-   **读操作约定**: 以`get`, `query`, `find`, `list`, `count`等前缀命名的方法，自动应用**只读事务**。
-   **写操作约定**: 以`save`, `update`, `delete`, `insert`, `add`, `modify`, `remove`等前缀命名的方法，自动应用**读写事务**。
-   **无事务约定**: 对于导出等耗时且无需事务的操作，以`export`, `download`, `print`等前缀命名的方法，可以配置为**不开启事务**。

同时，方案提供`@AutoTransaction`注解作为补充，允许在不符合命名约定的方法或需要精细控制事务属性的场景下进行显式配置。

## 2. 实现机制

```mermaid
graph TD
    A[Service方法调用] --> B{AutoTransactionAspect};
    subgraph B [AOP切面]
        C{有@AutoTransaction注解?} -- Yes --> D[按注解配置事务];
        C -- No --> E{匹配方法名前缀};
        E -- 读前缀 --> F[配置只读事务];
        E -- 写前缀 --> G[配置读写事务];
        E -- 无事务前缀 --> H[不开启事务];
    end
    
    I(TransactionMonitorAspect) --> J((日志记录));
    
    subgraph B
        D --> K(执行业务方法);
        F --> K;
        G --> K;
        H --> K;
    end
    K --> I;
```

1.  **`AutoTransactionAspect`切面**: 这是实现自动事务的核心。它通过一个`Pointcut`（切点）拦截所有`*..service.impl.*.*(..)`下的方法执行。
2.  **优先级判断**:
    -   首先，切面检查方法上是否存在`@AutoTransaction`注解。如果存在，则完全按照注解定义的事务类型、传播行为、隔离级别等属性来执行。
    -   如果不存在注解，切面会获取方法名，并与`TransactionPrefixConfig`中配置的只读、读写、无事务前缀列表进行匹配。
3.  **事务应用**: 根据匹配结果，动态地应用相应的事务策略（开启事务、设置为只读或不开启事务）。
4.  **事务监控**: `TransactionMonitorAspect`切面（优先级低于`AutoTransactionAspect`）用于监控事务的执行性能，并记录相关日志。

## 3. 配置与使用

### 3.1 事务前缀配置
在`application.yml`中可以灵活配置方法名前缀对应的事务类型。
```yaml
transaction:
  prefix:
    readonly:
      - get
      - query
      - find
    required:
      - save
      - update
      - delete
    none:
      - export
```

### 3.2 默认约定使用
在Service中，只需遵循命名约定即可，无需任何注解。
```java
@Service
public class UserServiceImpl implements UserService {
    
    // 自动应用只读事务
    public UserInfo getUserById(String id) { ... }
    
    // 自动应用读写事务
    public void saveUser(UserDTO dto) { ... }
}
```

### 3.3 `@AutoTransaction`显式控制
当命名不符合约定或需要特殊事务属性时，使用注解。
```java
@Service
public class UserServiceImpl implements UserService {

    // 假设有一个方法叫 `dataConsistencyCheck`，名字不符合约定，但需要事务
    @AutoTransaction(type = TransactionType.REQUIRED)
    public void dataConsistencyCheck() { ... }

    // 一个查询方法，但需要设置特殊的隔离级别
    @AutoTransaction(type = TransactionType.READ_ONLY, isolation = Isolation.SERIALIZABLE)
    public UserInfo findUserByName(String name) { ... }
    
    // 一个导出方法，按约定是无事务，但此处强制要求一个只读事务来保证数据一致性
    @AutoTransaction(type = TransactionType.READ_ONLY)
    public void exportUsers() { ... }
}
```

## 4. 核心组件
- **`@AutoTransaction`**: 显式事务配置注解。
- **`TransactionPrefixConfig`**: YML配置的映射类，存储方法名前缀。
- **`AutoTransactionAspect`**: 自动事务管理的核心AOP切面。
- **`TransactionMonitorAspect`**: 事务监控AOP切面。
- **`TransactionUtils`**: 用于在代码中获取当前事务状态的工具类，方便调试和日志记录。 