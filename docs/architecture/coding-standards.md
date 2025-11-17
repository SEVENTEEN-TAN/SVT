# SVT 编码标准文档

## 文档版本

| 版本 | 日期 | 作者 | 说明 |
|------|------|------|------|
| 1.0.0 | 2025-11-17 | Winston (Architect) | 初始版本 |

---

## 一、通用编码规范

### 1.1 代码风格原则

遵循 **SOLID**、**KISS**、**DRY**、**YAGNI** 原则：

- **SOLID**: 单一职责、开闭原则、里氏替换、接口隔离、依赖倒置
- **KISS** (Keep It Simple, Stupid): 追求代码和设计的极致简洁
- **DRY** (Don't Repeat Yourself): 杜绝重复代码，提取共性
- **YAGNI** (You Aren't Gonna Need It): 仅实现当前明确所需的功能

### 1.2 命名规范

| 类型 | 规范 | 示例 | 说明 |
|------|------|------|------|
| 类名 | PascalCase | `UserInfo`, `MenuManagementController` | 名词，体现业务含义 |
| 接口名 | PascalCase | `UserService`, `Serializable` | 名词或形容词 |
| 方法名 | camelCase | `getUserInfo()`, `saveUser()` | 动词开头 |
| 变量名 | camelCase | `userName`, `menuList` | 名词，见名知义 |
| 常量名 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT`, `DEFAULT_TIMEOUT` | 全大写+下划线 |
| 包名 | 小写 | `com.seventeen.svt.common` | 全小写，不使用下划线 |

### 1.3 注释规范

```java
/**
 * 类注释: 简要说明类的职责和用途
 *
 * @author Winston
 * @since 2025-01-01
 */
public class UserService {

    /**
     * 方法注释: 说明方法的功能、参数、返回值
     *
     * @param userId 用户ID
     * @return 用户信息
     * @throws BusinessException 用户不存在时抛出
     */
    public User getUserById(String userId) {
        // 单行注释: 解释关键逻辑
        if (StringUtils.isBlank(userId)) {
            throw new BusinessException("用户ID不能为空");
        }

        return userMapper.selectById(userId);
    }
}
```

**注释原则:**
- ✅ 公开API必须有完整的JavaDoc/JSDoc
- ✅ 复杂逻辑必须有注释说明
- ✅ TODO/FIXME注释必须包含责任人和日期
- ❌ 不要注释显而易见的代码
- ❌ 删除注释掉的旧代码（使用Git历史）

---

## 二、后端编码规范 (Java)

### 2.1 项目结构

```
com.seventeen.svt/
├── common/                      # 通用工具和配置
│   ├── annotation/              # 自定义注解
│   ├── config/                  # 配置类
│   ├── constant/                # 常量定义
│   ├── exception/               # 自定义异常
│   ├── filter/                  # 过滤器
│   └── util/                    # 工具类
│
├── frame/                       # 框架层（AOP、缓存、安全等）
│   ├── aspect/                  # AOP切面
│   ├── cache/                   # 缓存管理
│   ├── security/                # 安全框架
│   ├── lock/                    # 分布式锁
│   └── dbkey/                   # 分布式ID
│
└── modules/                     # 业务模块
    └── system/                  # 系统管理模块
        ├── controller/          # 控制器层
        ├── service/             # 业务逻辑层
        │   └── impl/            # 实现类
        ├── entity/              # 实体类
        ├── dto/                 # 数据传输对象
        │   ├── request/         # 请求DTO
        │   └── response/        # 响应DTO
        └── mapper/              # 数据访问层
```

### 2.2 Controller 层规范

```java
@Tag(name = "用户管理", description = "用户管理API")
@RestController
@RequestMapping("/system/user")
public class UserManagementController {

    private final UserInfoService userInfoService;

    // 构造器注入（推荐）
    public UserManagementController(UserInfoService userInfoService) {
        this.userInfoService = userInfoService;
    }

    /**
     * 获取用户列表
     *
     * @param conditionDTO 查询条件
     * @return 用户列表
     */
    @PostMapping("/list")
    @Operation(summary = "获取用户列表")
    @ApiOperationSupport(order = 1)
    @Audit(description = "查询用户列表", recordParams = true)
    @RequiresPermission("user:list")
    public Result<List<UserDTO>> getUserList(@RequestBody UserConditionDTO conditionDTO) {
        // 1. 参数校验（使用@Valid自动校验）
        // 2. 调用Service处理业务逻辑
        List<UserDTO> userList = userInfoService.getUserList(conditionDTO);
        // 3. 返回统一响应格式
        return Result.success(userList);
    }

    /**
     * 创建用户
     *
     * @param userDTO 用户信息
     * @return 用户ID
     */
    @PostMapping("/create")
    @Operation(summary = "创建用户")
    @ApiOperationSupport(order = 2)
    @Audit(description = "创建用户", recordParams = true, sensitive = true)
    @RequiresPermission("user:create")
    @AutoTransaction(type = TransactionType.REQUIRED)
    public Result<String> createUser(@RequestBody @Valid UserDTO userDTO) {
        String userId = userInfoService.createUser(userDTO);
        return Result.success("创建成功", userId);
    }
}
```

**Controller 层规范:**
- ✅ 只负责接收请求和返回响应，不包含业务逻辑
- ✅ 使用构造器注入依赖（推荐）或@Autowired
- ✅ 统一返回 `Result<T>` 包装类
- ✅ 使用 `@Valid` 自动校验参数
- ✅ 合理使用自定义注解：`@Audit`、`@RequiresPermission`、`@AutoTransaction`

### 2.3 Service 层规范

```java
@Service
public class UserInfoServiceImpl implements UserInfoService {

    private final UserInfoMapper userInfoMapper;
    private final DatabaseDistributedLockManager lockManager;

    public UserInfoServiceImpl(UserInfoMapper userInfoMapper,
                              DatabaseDistributedLockManager lockManager) {
        this.userInfoMapper = userInfoMapper;
        this.lockManager = lockManager;
    }

    @Override
    public List<UserDTO> getUserList(UserConditionDTO conditionDTO) {
        // 1. 构建查询条件
        QueryWrapper query = QueryWrapper.create()
            .select()
            .from(USER_INFO)
            .where(USER_INFO.DEL_FLAG.eq("0"));

        // 2. 动态添加查询条件
        if (StringUtils.isNotBlank(conditionDTO.getUserName())) {
            query.and(USER_INFO.USER_NAME.like(conditionDTO.getUserName()));
        }

        // 3. 执行查询
        List<UserInfo> userList = userInfoMapper.selectListByQuery(query);

        // 4. 转换为DTO
        return userList.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public String createUser(UserDTO userDTO) {
        // 1. 参数校验
        validateUser(userDTO);

        // 2. 获取分布式锁（防止重复创建）
        String lockKey = "user:create:" + userDTO.getLoginId();
        String lockValue = lockManager.tryLock(lockKey, 5, 10, TimeUnit.SECONDS);

        try {
            // 3. 检查用户是否已存在
            if (existsByLoginId(userDTO.getLoginId())) {
                throw new BusinessException("用户已存在");
            }

            // 4. 创建用户
            UserInfo userInfo = convertToEntity(userDTO);
            userInfoMapper.insert(userInfo);

            return userInfo.getUserId();

        } finally {
            // 5. 释放锁
            if (lockValue != null) {
                lockManager.unlock(lockKey, lockValue);
            }
        }
    }

    /**
     * 转换为DTO
     */
    private UserDTO convertToDTO(UserInfo userInfo) {
        return UserDTO.builder()
            .userId(userInfo.getUserId())
            .userName(userInfo.getUserName())
            .build();
    }

    /**
     * 转换为实体
     */
    private UserInfo convertToEntity(UserDTO userDTO) {
        return UserInfo.builder()
            .loginId(userDTO.getLoginId())
            .userName(userDTO.getUserName())
            .build();
    }

    /**
     * 校验用户信息
     */
    private void validateUser(UserDTO userDTO) {
        if (StringUtils.isBlank(userDTO.getLoginId())) {
            throw new BusinessException("登录ID不能为空");
        }
        // 更多校验逻辑...
    }
}
```

**Service 层规范:**
- ✅ 业务逻辑的核心实现层
- ✅ 一个Service类对应一个业务领域
- ✅ 复杂逻辑拆分为私有方法，保持公共方法简洁
- ✅ 合理使用分布式锁防止并发问题
- ✅ 实体和DTO之间明确转换

### 2.4 Entity 层规范

```java
@Table(value = "user_info", comment = "用户表",
       onInsert = FlexInsertListener.class,
       onUpdate = FlexUpdateListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserInfo implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 用户ID（分布式ID自动生成）
     */
    @DistributedId(prefix = "U")
    @Column(value = "user_id", comment = "用户ID")
    private String userId;

    /**
     * 登录ID
     */
    @Column(value = "login_id", comment = "登录ID")
    private String loginId;

    /**
     * 用户名
     */
    @Column(value = "user_name", comment = "用户名")
    private String userName;

    /**
     * 密码（脱敏处理）
     */
    @SensitiveLog(strategy = SensitiveStrategy.PASSWORD)
    @Column(value = "password", comment = "密码")
    private String password;

    /**
     * 创建者（自动填充）
     */
    @AutoFill(type = FillType.USER_ID, operation = OperationType.INSERT)
    @Column(value = "create_by", comment = "创建者")
    private String createBy;

    /**
     * 创建时间（自动填充）
     */
    @AutoFill(type = FillType.TIME, operation = OperationType.INSERT)
    @Column(value = "create_time", comment = "创建时间",
            typeHandler = StringToDateTimeTypeHandler.class)
    private String createTime;

    /**
     * 删除标志（逻辑删除）
     */
    @Column(value = "del_flag", comment = "删除标志", isLogicDelete = true)
    private String delFlag;
}
```

**Entity 层规范:**
- ✅ 使用Lombok简化getter/setter/builder
- ✅ 字段必须添加注释
- ✅ 合理使用自定义注解：`@DistributedId`、`@AutoFill`、`@SensitiveLog`
- ✅ 实现 `Serializable` 接口
- ✅ 使用 `isLogicDelete = true` 标记逻辑删除字段

### 2.5 异常处理规范

```java
/**
 * 业务异常
 */
public class BusinessException extends RuntimeException {
    private final int code;

    public BusinessException(String message) {
        super(message);
        this.code = HttpStatus.BAD_REQUEST.value();
    }

    public BusinessException(int code, String message) {
        super(message);
        this.code = code;
    }
}

/**
 * 全局异常处理器
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 业务异常
     */
    @ExceptionHandler(BusinessException.class)
    public Result<Void> handleBusinessException(BusinessException e) {
        log.error("业务异常: {}", e.getMessage());
        return Result.failure(e.getCode(), e.getMessage());
    }

    /**
     * 参数校验异常
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result<Void> handleValidationException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
            .map(error -> error.getField() + ": " + error.getDefaultMessage())
            .collect(Collectors.joining(", "));

        return Result.failure(HttpStatus.BAD_REQUEST.value(), message);
    }

    /**
     * 系统异常
     */
    @ExceptionHandler(Exception.class)
    public Result<Void> handleException(Exception e) {
        log.error("系统异常", e);
        return Result.failure(HttpStatus.INTERNAL_SERVER_ERROR.value(), "系统错误");
    }
}
```

**异常处理规范:**
- ✅ 使用 `@RestControllerAdvice` 统一异常处理
- ✅ 业务异常使用 `BusinessException`
- ✅ 参数校验异常单独处理
- ✅ 敏感信息不返回给客户端

---

## 三、前端编码规范 (React + TypeScript)

### 3.1 项目结构

```
src/
├── api/                         # API服务层
│   ├── auth.ts                  # 认证API
│   └── system/                  # 系统管理API
│       ├── menu.ts
│       ├── role.ts
│       └── user.ts
│
├── components/                  # 公共组件
│   ├── Common/                  # 通用组件
│   ├── Layout/                  # 布局组件
│   │   ├── core/                # 核心逻辑
│   │   ├── modules/             # 功能模块
│   │   └── shared/              # 共享类型
│   └── DynamicPage/             # 动态页面加载
│
├── pages/                       # 页面组件
│   ├── Auth/                    # 认证页面
│   ├── Home/                    # 首页
│   ├── System/                  # 系统管理
│   │   ├── Menu/
│   │   ├── Role/
│   │   └── User/
│   └── Error/                   # 错误页面
│
├── stores/                      # 状态管理
│   ├── authStore.ts             # 认证状态
│   ├── userStore.ts             # 用户状态
│   └── useAuth.ts               # 组合Hook
│
├── hooks/                       # 自定义Hooks
│   ├── useUserStatus.ts
│   └── useMobile.ts
│
├── utils/                       # 工具函数
│   ├── request.ts               # HTTP客户端
│   ├── tokenManager.ts          # Token管理
│   ├── crypto.ts                # 加密工具
│   └── debugManager.ts          # 调试工具
│
├── types/                       # 类型定义
│   ├── user.ts
│   ├── api.ts
│   └── session.ts
│
├── router/                      # 路由配置
│   ├── index.tsx
│   └── ProtectedRoute.tsx
│
└── styles/                      # 样式文件
    ├── theme.ts                 # 主题配置
    └── global.css               # 全局样式
```

### 3.2 组件规范

```typescript
/**
 * 组件Props接口定义
 */
interface UserListProps {
  users: User[];
  loading?: boolean;
  onUserClick?: (user: User) => void;
}

/**
 * 用户列表组件
 *
 * @param props - 组件属性
 * @returns React组件
 */
const UserList: React.FC<UserListProps> = ({ users, loading, onUserClick }) => {
  // 1. Hooks（按顺序：状态、Effect、自定义Hook）
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    // 副作用逻辑
  }, []);

  const { isAuthenticated } = useAuth();

  // 2. 事件处理函数（使用useCallback优化）
  const handleUserClick = useCallback((user: User) => {
    setSelectedUser(user);
    onUserClick?.(user);
  }, [onUserClick]);

  // 3. 计算值（使用useMemo优化）
  const activeUsers = useMemo(() =>
    users.filter(user => user.status === 'active'),
    [users]
  );

  // 4. 条件渲染
  if (loading) {
    return <Spin size="large" />;
  }

  if (users.length === 0) {
    return <Empty description="暂无用户数据" />;
  }

  // 5. 主渲染
  return (
    <div className="user-list">
      {activeUsers.map(user => (
        <UserCard
          key={user.id}
          user={user}
          onClick={handleUserClick}
        />
      ))}
    </div>
  );
};

export default UserList;
```

**组件规范:**
- ✅ 使用TypeScript定义Props接口
- ✅ 组件必须有JSDoc注释
- ✅ Hook按顺序：状态Hook → Effect Hook → 自定义Hook
- ✅ 事件处理函数使用 `handleXxx` 命名
- ✅ 合理使用 `useMemo` 和 `useCallback` 优化性能
- ✅ 条件渲染提前return，保持主渲染简洁

### 3.3 自定义Hook规范

```typescript
/**
 * 用户状态验证Hook
 *
 * @returns 用户状态和加载状态
 */
export const useUserStatus = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userStatus, setUserStatus] = useState<UserStatusInfo | null>(null);

  useEffect(() => {
    // 只在登录且有用户信息时验证
    if (isAuthenticated && currentUser) {
      verifyUserStatus();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, currentUser]);

  const verifyUserStatus = async () => {
    try {
      setLoading(true);
      const status = await authApi.verifyUserStatus();
      setUserStatus(status);
    } catch (error) {
      console.error('用户状态验证失败', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    userStatus,
    isValid: userStatus?.isValid ?? false
  };
};
```

**Hook规范:**
- ✅ 以 `use` 开头命名
- ✅ 封装可复用的状态逻辑
- ✅ 返回对象而非数组（语义更清晰）
- ✅ 处理异步操作的loading和error状态

### 3.4 Store规范 (Zustand)

```typescript
/**
 * 认证Store状态接口
 */
interface AuthState {
  // 状态
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;

  // 操作方法
  login: (credentials: LoginRequest) => Promise<void>;
  logout: (options?: { message?: string }) => Promise<void>;
  setToken: (token: string) => void;
  clearAuthState: () => void;
}

/**
 * 认证Store
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 初始状态
      token: null,
      isAuthenticated: false,
      loading: false,

      // 登录
      login: async (credentials) => {
        set({ loading: true });
        try {
          const { accessToken } = await authApi.login(credentials);
          set({ token: accessToken, isAuthenticated: true });
          tokenManager.start();
        } catch (error) {
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      // 登出
      logout: async (options) => {
        const state = get();
        if (state.loading || !state.isAuthenticated) return;

        set({ loading: true });
        try {
          if (state.token) await authApi.logout();
        } finally {
          get().clearAuthState();
        }
      },

      // 设置Token
      setToken: (token) => set({ token, isAuthenticated: true }),

      // 清理状态
      clearAuthState: () => {
        set({ token: null, isAuthenticated: false, loading: false });
        tokenManager.stop();
        localStorage.removeItem('auth-storage');
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
```

**Store规范:**
- ✅ 定义清晰的状态接口
- ✅ 使用 `persist` 中间件持久化
- ✅ 防止重复操作（loading标志）
- ✅ 清理状态时同时清理localStorage

### 3.5 API调用规范

```typescript
/**
 * 用户API服务
 */
export const userApi = {
  /**
   * 获取用户列表
   *
   * @param params - 查询参数
   * @returns 用户列表
   */
  getUserList: (params: UserQueryParams): Promise<User[]> => {
    return api.post<User[]>('/system/user/list', params);
  },

  /**
   * 创建用户
   *
   * @param user - 用户信息
   * @returns 用户ID
   */
  createUser: (user: CreateUserRequest): Promise<string> => {
    return api.post<string>('/system/user/create', user);
  },

  /**
   * 更新用户
   *
   * @param userId - 用户ID
   * @param user - 用户信息
   */
  updateUser: (userId: string, user: UpdateUserRequest): Promise<void> => {
    return api.put<void>(`/system/user/update/${userId}`, user);
  },

  /**
   * 删除用户
   *
   * @param userId - 用户ID
   */
  deleteUser: (userId: string): Promise<void> => {
    return api.delete<void>(`/system/user/delete/${userId}`);
  }
};
```

**API规范:**
- ✅ 使用对象组织相关API
- ✅ 每个API方法必须有JSDoc注释
- ✅ 使用泛型定义返回类型
- ✅ Promise返回值明确类型

### 3.6 类型定义规范

```typescript
/**
 * 用户信息
 */
export interface User {
  /** 用户ID */
  id: string | number;
  /** 用户名 */
  username: string;
  /** 邮箱 */
  email?: string;
  /** 角色列表 */
  roles: string[];
  /** 权限列表 */
  permissions?: string[];
  /** 状态 */
  status: 'active' | 'inactive' | 'locked';
}

/**
 * 登录请求
 */
export interface LoginRequest {
  /** 登录ID */
  loginId: string;
  /** 密码 */
  password: string;
  /** 验证码 */
  captcha?: string;
}

/**
 * API响应格式
 */
export interface ApiResponse<T> {
  /** 状态码 */
  code: number;
  /** 消息 */
  message: string;
  /** 数据 */
  data: T;
  /** 是否成功 */
  success: boolean;
}

/**
 * 分页参数
 */
export interface PaginationParams {
  /** 当前页 */
  current: number;
  /** 每页条数 */
  pageSize: number;
}

/**
 * 分页响应
 */
export interface PaginationResponse<T> {
  /** 数据列表 */
  list: T[];
  /** 总数 */
  total: number;
  /** 当前页 */
  current: number;
  /** 每页条数 */
  pageSize: number;
}
```

**类型定义规范:**
- ✅ 所有接口/类型必须导出
- ✅ 字段必须有注释
- ✅ 使用可选属性 `?` 标记非必填字段
- ✅ 使用字面量类型定义枚举（如 `'active' | 'inactive'`）

---

## 四、数据库设计规范

### 4.1 表命名规范

| 类型 | 规范 | 示例 | 说明 |
|------|------|------|------|
| 表名 | 小写+下划线 | `user_info`, `menu_info` | 见名知义，使用业务术语 |
| 字段名 | 小写+下划线 | `user_id`, `create_time` | 与Java字段对应 |
| 索引名 | `idx_表名_字段名` | `idx_user_info_login_id` | 便于识别 |
| 主键约束 | `pk_表名` | `pk_user_info` | 主键约束名 |
| 外键约束 | `fk_表名_字段名` | `fk_user_role_user_id` | 外键约束名 |

### 4.2 字段设计规范

```sql
CREATE TABLE user_info (
    -- 主键（分布式ID）
    user_id VARCHAR(32) NOT NULL,

    -- 业务字段
    login_id VARCHAR(50) NOT NULL COMMENT '登录ID',
    user_name NVARCHAR(50) NOT NULL COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码（Argon2哈希）',
    email VARCHAR(100) COMMENT '邮箱',
    phone VARCHAR(20) COMMENT '手机号',

    -- 状态字段
    status CHAR(1) DEFAULT '1' NOT NULL COMMENT '状态（0停用 1正常）',

    -- 审计字段（必须）
    create_by VARCHAR(32) COMMENT '创建者',
    create_time DATETIME DEFAULT GETDATE() NOT NULL COMMENT '创建时间',
    update_by VARCHAR(32) COMMENT '更新者',
    update_time DATETIME COMMENT '更新时间',

    -- 逻辑删除（必须）
    del_flag CHAR(1) DEFAULT '0' NOT NULL COMMENT '删除标志（0正常 1删除）',

    -- 主键约束
    CONSTRAINT pk_user_info PRIMARY KEY (user_id),

    -- 唯一约束
    CONSTRAINT uk_user_info_login_id UNIQUE (login_id)
);

-- 创建索引
CREATE INDEX idx_user_info_user_name ON user_info(user_name);
CREATE INDEX idx_user_info_create_time ON user_info(create_time);
```

**字段设计规范:**
- ✅ 主键使用分布式ID（VARCHAR）
- ✅ 所有表必须有审计字段：`create_by`, `create_time`, `update_by`, `update_time`
- ✅ 所有表必须有逻辑删除字段：`del_flag`
- ✅ 字段必须有COMMENT注释
- ✅ 使用NVARCHAR存储中文字符
- ✅ 枚举类型使用CHAR(1)存储

---

## 五、Git提交规范

### 5.1 提交消息格式

采用 **Conventional Commits** 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**类型 (type):**
- `feat`: 新功能
- `fix`: 修复Bug
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具相关

**示例:**
```
feat(user): 添加用户导出功能

- 实现用户列表Excel导出
- 支持筛选条件导出
- 添加导出权限验证

Closes #123
```

### 5.2 分支管理规范

```
master                   # 主分支（生产环境）
  ├── develop            # 开发分支
  │   ├── feature/xxx    # 功能分支
  │   ├── bugfix/xxx     # Bug修复分支
  │   └── hotfix/xxx     # 紧急修复分支
  └── release/vx.x.x     # 发布分支
```

**分支命名:**
- `feature/user-export`: 功能分支
- `bugfix/login-error`: Bug修复
- `hotfix/security-patch`: 紧急修复
- `release/v1.2.0`: 发布分支

---

## 六、代码审查清单

### 6.1 通用检查项

- [ ] 代码符合项目编码规范
- [ ] 变量和方法命名清晰
- [ ] 有必要的注释
- [ ] 没有硬编码的配置
- [ ] 没有注释掉的代码
- [ ] 没有调试代码（console.log等）

### 6.2 后端检查项

- [ ] 使用了合适的注解（@Audit、@RequiresPermission）
- [ ] 异常处理完整
- [ ] 事务边界正确
- [ ] 数据库查询有索引优化
- [ ] 敏感数据已脱敏
- [ ] 分布式锁使用正确

### 6.3 前端检查项

- [ ] 组件拆分合理
- [ ] 使用了TypeScript类型
- [ ] 性能优化（useMemo、useCallback）
- [ ] 错误边界处理
- [ ] 加载和错误状态处理
- [ ] 响应式设计适配

---

## 七、安全编码规范

### 7.1 输入验证

```java
// 后端验证
public Result<?> createUser(@RequestBody @Valid UserDTO userDTO) {
    // @Valid 自动验证
}

// 实体类验证
@Data
public class UserDTO {
    @NotBlank(message = "用户名不能为空")
    @Size(min = 2, max = 50, message = "用户名长度2-50")
    private String userName;

    @Email(message = "邮箱格式不正确")
    private String email;

    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String phone;
}
```

### 7.2 SQL注入防护

```java
// ✅ 正确：使用参数化查询
QueryWrapper query = QueryWrapper.create()
    .where(USER_INFO.LOGIN_ID.eq(loginId));

// ❌ 错误：字符串拼接SQL
String sql = "SELECT * FROM user_info WHERE login_id = '" + loginId + "'";
```

### 7.3 XSS防护

```typescript
// ✅ 正确：使用React自动转义
<div>{userInput}</div>

// ❌ 错误：使用dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// 必须使用时，先进行HTML转义
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(dirty);
```

### 7.4 密码存储

```java
// ✅ 使用Argon2哈希
@Autowired
private Argon2PasswordEncoder passwordEncoder;

String hashedPassword = passwordEncoder.encode(rawPassword);
boolean matches = passwordEncoder.matches(rawPassword, hashedPassword);
```

---

## 八、性能优化规范

### 8.1 数据库优化

```java
// ✅ 批量插入
userInfoMapper.insertBatch(userList);

// ❌ 循环插入
for (UserInfo user : userList) {
    userInfoMapper.insert(user);  // N次数据库访问
}

// ✅ 分页查询
Page<UserInfo> page = userInfoMapper.paginate(pageNumber, pageSize, query);

// ✅ 只查询需要的字段
QueryWrapper query = QueryWrapper.create()
    .select(USER_INFO.USER_ID, USER_INFO.USER_NAME)
    .from(USER_INFO);
```

### 8.2 缓存优化

```java
// 使用Caffeine缓存
@Cacheable(value = "user", key = "#userId")
public UserInfo getUserById(String userId) {
    return userInfoMapper.selectById(userId);
}

// 缓存失效
@CacheEvict(value = "user", key = "#userId")
public void updateUser(String userId, UserInfo userInfo) {
    userInfoMapper.updateById(userInfo);
}
```

### 8.3 前端性能优化

```typescript
// ✅ 组件懒加载
const UserPage = lazy(() => import('./pages/User/UserPage'));

// ✅ 列表虚拟化（大数据量）
import { FixedSizeList } from 'react-window';

// ✅ 防抖
const handleSearch = useMemo(
  () => debounce((value: string) => {
    // 搜索逻辑
  }, 300),
  []
);
```

---

## 九、文档规范

### 9.1 API文档

使用Knife4j自动生成，确保注解完整：

```java
@Tag(name = "用户管理", description = "用户管理相关API")
@Operation(summary = "获取用户列表", description = "根据条件查询用户列表")
@Parameter(name = "userName", description = "用户名（模糊查询）")
```

### 9.2 README文档

每个模块必须有README.md，包含：
- 模块功能说明
- 技术栈
- 本地开发指南
- 部署说明
- 常见问题

---

## 十、更新日志

| 日期 | 版本 | 更新内容 | 作者 |
|------|------|----------|------|
| 2025-11-17 | 1.0.0 | 初始版本，完整编码标准 | Winston (Architect) |

---

**文档维护**: 本文档应定期审查和更新
**最后更新**: 2025-11-17
**负责人**: Winston (System Architect)
