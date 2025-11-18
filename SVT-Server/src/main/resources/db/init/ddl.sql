-- MySQL 8.0 DDL Script
-- Character Set: utf8mb4, Collation: utf8mb4_unicode_ci

-- 删除表(注意删除顺序要考虑外键约束)

-- 创建用户表
DROP TABLE IF EXISTS user_info;
CREATE TABLE user_info (
    user_id VARCHAR(32) PRIMARY KEY COMMENT '用户ID',
    login_id VARCHAR(32) NOT NULL UNIQUE COMMENT '登录ID',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    user_name_zh VARCHAR(50) COMMENT '中文名',
    user_name_en VARCHAR(50) COMMENT '英文名',
    status CHAR(1) DEFAULT '0' COMMENT '状态（0：正常，1：停用）',
    del_flag CHAR(1) DEFAULT '0' COMMENT '删除标志（0：存在，1：删除）',
    create_by VARCHAR(32) COMMENT '创建者',
    create_org_id VARCHAR(32) COMMENT '创建者机构ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_by VARCHAR(32) COMMENT '更新者',
    update_org_id VARCHAR(32) COMMENT '更新者机构ID',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    remark VARCHAR(500) COMMENT '备注'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 创建机构表
DROP TABLE IF EXISTS org_info;
CREATE TABLE org_info (
    org_id VARCHAR(32) PRIMARY KEY COMMENT '机构ID',
    org_key VARCHAR(32) NOT NULL UNIQUE COMMENT '机构关键字',
    org_name_zh VARCHAR(100) NOT NULL COMMENT '机构中文名称',
    org_name_en VARCHAR(100) NOT NULL COMMENT '机构英文名称',
    parent_id VARCHAR(32) COMMENT '父机构ID',
    org_type VARCHAR(8) COMMENT '机构类型（1：总部，2：分部，3：支部，4：组）',
    org_sort INT NOT NULL DEFAULT 1 COMMENT '机构排序',
    status CHAR(1) DEFAULT '0' COMMENT '状态（0：正常，1：停用）',
    del_flag CHAR(1) DEFAULT '0' COMMENT '删除标志（0：存在，1：删除）',
    create_by VARCHAR(32) COMMENT '创建者',
    create_org_id VARCHAR(32) COMMENT '创建者机构ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_by VARCHAR(32) COMMENT '更新者',
    update_org_id VARCHAR(32) COMMENT '更新者机构ID',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    remark VARCHAR(500) COMMENT '备注'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='机构表';

-- 创建用户机构关联表
DROP TABLE IF EXISTS user_org;
CREATE TABLE user_org (
    user_id VARCHAR(32) NOT NULL COMMENT '用户ID',
    org_id VARCHAR(32) NOT NULL COMMENT '机构ID',
    is_primary CHAR(1) DEFAULT '0' COMMENT '是否主机构（0：否，1：是）',
    status CHAR(1) DEFAULT '0' COMMENT '状态（0：正常，1：停用）',
    del_flag CHAR(1) DEFAULT '0' COMMENT '删除标志（0：存在，1：删除）',
    create_by VARCHAR(32) COMMENT '创建者',
    create_org_id VARCHAR(32) COMMENT '创建者机构ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_by VARCHAR(32) COMMENT '更新者',
    update_org_id VARCHAR(32) COMMENT '更新者机构ID',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    remark VARCHAR(500) COMMENT '备注',
    PRIMARY KEY (user_id, org_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户机构关联表';

-- 创建角色表
DROP TABLE IF EXISTS role_info;
CREATE TABLE role_info (
    role_id VARCHAR(32) PRIMARY KEY COMMENT '角色ID',
    role_code VARCHAR(32) NOT NULL UNIQUE COMMENT '角色编码',
    role_name_zh VARCHAR(100) NOT NULL COMMENT '角色中文名称',
    role_name_en VARCHAR(100) NOT NULL COMMENT '角色英文名称',
    role_sort INT DEFAULT 1 COMMENT '显示顺序',
    status CHAR(1) DEFAULT '0' COMMENT '状态（0：正常，1：停用）',
    del_flag CHAR(1) DEFAULT '0' COMMENT '删除标志（0：存在，1：删除）',
    create_by VARCHAR(32) COMMENT '创建者',
    create_org_id VARCHAR(32) COMMENT '创建者机构ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_by VARCHAR(32) COMMENT '更新者',
    update_org_id VARCHAR(32) COMMENT '更新者机构ID',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    remark VARCHAR(500) COMMENT '备注'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色表';

-- 创建用户机构角色关联表
DROP TABLE IF EXISTS user_org_role;
CREATE TABLE user_org_role (
    user_id VARCHAR(32) NOT NULL COMMENT '用户ID',
    org_id VARCHAR(32) NOT NULL COMMENT '机构ID',
    role_id VARCHAR(32) NOT NULL COMMENT '角色ID',
    is_default CHAR(1) DEFAULT '0' COMMENT '是否默认角色（0：否，1：是）',
    status CHAR(1) DEFAULT '0' COMMENT '状态（0：正常，1：停用）',
    del_flag CHAR(1) DEFAULT '0' COMMENT '删除标志（0：存在，1：删除）',
    create_by VARCHAR(32) COMMENT '创建者',
    create_org_id VARCHAR(32) COMMENT '创建者机构ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_by VARCHAR(32) COMMENT '更新者',
    update_org_id VARCHAR(32) COMMENT '更新者机构ID',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    remark VARCHAR(500) COMMENT '备注',
    PRIMARY KEY (user_id, org_id, role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户机构角色关联表';

-- 创建菜单表
DROP TABLE IF EXISTS menu_info;
CREATE TABLE menu_info (
    menu_id VARCHAR(32) PRIMARY KEY COMMENT '菜单ID',
    parent_id VARCHAR(32) COMMENT '父菜单ID',
    menu_name_zh VARCHAR(100) NOT NULL COMMENT '菜单中文名称',
    menu_name_en VARCHAR(100) NOT NULL COMMENT '菜单英文名称',
    menu_path VARCHAR(200) NOT NULL UNIQUE COMMENT '菜单路径',
    menu_icon VARCHAR(100) COMMENT '菜单图标',
    menu_sort INT DEFAULT 1 COMMENT '显示顺序',
    status CHAR(1) DEFAULT '0' COMMENT '状态（0：正常，1：停用）',
    del_flag CHAR(1) DEFAULT '0' COMMENT '删除标志（0：存在，1：删除）',
    create_by VARCHAR(32) COMMENT '创建者',
    create_org_id VARCHAR(32) COMMENT '创建者机构ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_by VARCHAR(32) COMMENT '更新者',
    update_org_id VARCHAR(32) COMMENT '更新者机构ID',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    remark VARCHAR(500) COMMENT '备注'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='菜单表';

-- 创建角色菜单关联表
DROP TABLE IF EXISTS role_menu;
CREATE TABLE role_menu (
    role_id VARCHAR(32) NOT NULL COMMENT '角色ID',
    menu_id VARCHAR(32) NOT NULL COMMENT '菜单ID',
    create_by VARCHAR(32) COMMENT '创建者',
    create_org_id VARCHAR(32) COMMENT '创建者机构ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_by VARCHAR(32) COMMENT '更新者',
    update_org_id VARCHAR(32) COMMENT '更新者机构ID',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    remark VARCHAR(500) COMMENT '备注',
    PRIMARY KEY (role_id, menu_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='菜单角色关联表';

-- 创建权限表
DROP TABLE IF EXISTS permission_info;
CREATE TABLE permission_info (
    permission_id VARCHAR(32) PRIMARY KEY COMMENT '权限ID',
    permission_key VARCHAR(100) NOT NULL UNIQUE COMMENT '权限标识',
    permission_name_zh VARCHAR(100) NOT NULL COMMENT '权限中文名称',
    permission_name_en VARCHAR(100) NOT NULL COMMENT '权限英文名称',
    permission_group VARCHAR(32) NOT NULL COMMENT '权限分组（如：system, business等）',
    permission_sort INT DEFAULT 1 COMMENT '显示顺序',
    status CHAR(1) DEFAULT '0' COMMENT '状态（0：正常，1：停用）',
    del_flag CHAR(1) DEFAULT '0' COMMENT '删除标志（0：存在，1：删除）',
    create_by VARCHAR(32) COMMENT '创建者',
    create_org_id VARCHAR(32) COMMENT '创建者机构ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_by VARCHAR(32) COMMENT '更新者',
    update_org_id VARCHAR(32) COMMENT '更新者机构ID',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    remark VARCHAR(500) COMMENT '备注'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='权限表';

-- 创建角色权限关联表
DROP TABLE IF EXISTS role_permission;
CREATE TABLE role_permission (
    role_id VARCHAR(32) NOT NULL COMMENT '角色ID',
    permission_id VARCHAR(32) NOT NULL COMMENT '权限ID',
    status CHAR(1) DEFAULT '0' COMMENT '状态（0：正常，1：停用）',
    del_flag CHAR(1) DEFAULT '0' COMMENT '删除标志（0：存在，1：删除）',
    create_by VARCHAR(32) COMMENT '创建者',
    create_org_id VARCHAR(32) COMMENT '创建者机构ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_by VARCHAR(32) COMMENT '更新者',
    update_org_id VARCHAR(32) COMMENT '更新者机构ID',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    remark VARCHAR(500) COMMENT '备注',
    PRIMARY KEY (role_id, permission_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色权限关联表';

-- 创建审计日志表
DROP TABLE IF EXISTS audit_log;
CREATE TABLE audit_log (
    audit_id VARCHAR(32) PRIMARY KEY COMMENT '审计ID',
    operation_time DATETIME NOT NULL COMMENT '操作时间',
    operation_ip VARCHAR(50) COMMENT '操作IP',
    operator_id VARCHAR(32) COMMENT '操作人ID',
    operator_org_id VARCHAR(32) COMMENT '操作机构ID',
    role_id VARCHAR(32) COMMENT '操作角色ID',
    request_params TEXT COMMENT '请求参数',
    response_result TEXT COMMENT '响应结果',
    operation_url VARCHAR(500) COMMENT '操作URL',
    operation_desc VARCHAR(500) COMMENT '操作描述',
    operation_result CHAR(1) DEFAULT '0' COMMENT '操作结果(0:成功,1:失败)',
    error_msg VARCHAR(1000) COMMENT '错误信息'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='审计日志表';

-- 创建码值库表
DROP TABLE IF EXISTS code_library;
CREATE TABLE code_library (
    code_type VARCHAR(32) NOT NULL COMMENT '码值类型',
    code_value VARCHAR(32) NOT NULL COMMENT '码值',
    code_name VARCHAR(100) NOT NULL COMMENT '码值名称',
    code_sort INT DEFAULT 1 COMMENT '显示顺序',
    status CHAR(1) DEFAULT '0' COMMENT '状态（0：正常，1：停用）',
    del_flag CHAR(1) DEFAULT '0' COMMENT '删除标志（0：存在，1：删除）',
    code_desc VARCHAR(500) COMMENT '码值描述',
    attribute1 VARCHAR(250) COMMENT '拓展字段1',
    attribute2 VARCHAR(250) COMMENT '拓展字段2',
    attribute3 VARCHAR(250) COMMENT '拓展字段3',
    attribute4 VARCHAR(250) COMMENT '拓展字段4',
    attribute5 VARCHAR(250) COMMENT '拓展字段5',
    create_by VARCHAR(32) COMMENT '创建者',
    create_org_id VARCHAR(32) COMMENT '创建者机构ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_by VARCHAR(32) COMMENT '更新者',
    update_org_id VARCHAR(32) COMMENT '更新者机构ID',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    remark VARCHAR(500) COMMENT '备注',
    PRIMARY KEY (code_type, code_value)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='码值库表';

-- 创建分布式ID生成表
DROP TABLE IF EXISTS db_key;
CREATE TABLE db_key (
    table_name VARCHAR(100) NOT NULL COMMENT '表名',
    field_name VARCHAR(100) NOT NULL COMMENT '字段名',
    entity_name VARCHAR(100) NOT NULL COMMENT '实体类名',
    prefix VARCHAR(10) NOT NULL COMMENT 'ID前缀',
    date_format VARCHAR(20) NOT NULL DEFAULT 'yyyyMMdd' COMMENT '日期格式',
    padding_length INT NOT NULL DEFAULT 6 COMMENT '补充位数',
    batch_size INT NOT NULL DEFAULT 100 COMMENT '批量获取数量',
    current_id BIGINT NOT NULL DEFAULT 1 COMMENT '当前起始ID',
    record_date DATE COMMENT '当前日期',
    current_letter_position INT NOT NULL DEFAULT 0 COMMENT '当前字母位置(用于扩展容量)',
    last_update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间',
    PRIMARY KEY (table_name, field_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='分布式ID生成表';

-- 创建分布式锁表
DROP TABLE IF EXISTS distributed_lock;
CREATE TABLE distributed_lock (
    lock_key VARCHAR(200) NOT NULL COMMENT '锁键(表名_字段名)',
    lock_value VARCHAR(100) NOT NULL COMMENT '锁值(UUID)',
    holder_info VARCHAR(500) COMMENT '持有者信息(服务器IP+线程ID)',
    created_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    expire_time DATETIME NOT NULL COMMENT '过期时间',
    retry_count INT NOT NULL DEFAULT 0 COMMENT '重试次数',
    PRIMARY KEY (lock_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='分布式锁表';

-- 创建索引
CREATE INDEX idx_distributed_lock_expire_time ON distributed_lock (expire_time);

-- ========================================
-- 创建性能索引
-- ========================================

-- 用户表索引
CREATE INDEX idx_user_status_del ON user_info(status, del_flag);
CREATE INDEX idx_user_login_status ON user_info(login_id, status, del_flag);

-- 机构表索引
CREATE INDEX idx_org_parent_status ON org_info(parent_id, status, del_flag);
CREATE INDEX idx_org_type_status ON org_info(org_type, status, del_flag);

-- 菜单表索引
CREATE INDEX idx_menu_parent_status ON menu_info(parent_id, status, del_flag);
CREATE INDEX idx_menu_path ON menu_info(menu_path);

-- 角色表索引
CREATE INDEX idx_role_status_del ON role_info(status, del_flag);

-- 权限表索引
CREATE INDEX idx_permission_group_status ON permission_info(permission_group, status, del_flag);
CREATE INDEX idx_permission_key_status ON permission_info(permission_key, status, del_flag);

-- 码值表索引
CREATE INDEX idx_code_type_status ON code_library(code_type, status, del_flag);
CREATE INDEX idx_code_type_value ON code_library(code_type, code_value, status, del_flag);

-- 关联表索引
CREATE INDEX idx_user_org_role_user ON user_org_role(user_id, status, del_flag);
CREATE INDEX idx_user_org_role_org ON user_org_role(org_id, status, del_flag);
CREATE INDEX idx_user_org_role_role ON user_org_role(role_id, status, del_flag);
CREATE INDEX idx_user_org_user ON user_org(user_id, status, del_flag);
CREATE INDEX idx_user_org_org ON user_org(org_id, status, del_flag);
CREATE INDEX idx_role_menu_role ON role_menu(role_id, menu_id);
CREATE INDEX idx_role_permission_role ON role_permission(role_id, status, del_flag);
CREATE INDEX idx_role_permission_perm ON role_permission(permission_id, status, del_flag);

-- 审计日志索引
CREATE INDEX idx_audit_operator_time ON audit_log(operator_id, operation_time);
CREATE INDEX idx_audit_time ON audit_log(operation_time);
CREATE INDEX idx_audit_result ON audit_log(operation_result, operation_time);
