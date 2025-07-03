-- 删除表(注意删除顺序要考虑外键约束)

-- 创建用户表
DROP TABLE IF EXISTS user_info;
CREATE TABLE user_info (
   user_id NVARCHAR(32) PRIMARY KEY,
   login_id NVARCHAR(32) NOT NULL UNIQUE,
   password NVARCHAR(100) NOT NULL,
   user_name_zh NVARCHAR(50),
   user_name_en NVARCHAR(50),
   status CHAR(1) DEFAULT '0',
   del_flag CHAR(1) DEFAULT '0',
   create_by NVARCHAR(32),
   create_org_id NVARCHAR(32),
   create_time DATETIME DEFAULT GETDATE(),
   update_by NVARCHAR(32),
   update_org_id NVARCHAR(32),
   update_time DATETIME DEFAULT GETDATE(),
   remark NVARCHAR(500)
);

-- 添加表注释
EXEC sp_addextendedproperty N'MS_Description', N'用户表', N'SCHEMA', N'dbo', N'TABLE', N'user_info';

-- 添加列注释
EXEC sp_addextendedproperty N'MS_Description', N'用户ID', N'SCHEMA', N'dbo', N'TABLE', N'user_info', N'COLUMN', N'user_id';
EXEC sp_addextendedproperty N'MS_Description', N'登录ID', N'SCHEMA', N'dbo', N'TABLE', N'user_info', N'COLUMN', N'login_id';
EXEC sp_addextendedproperty N'MS_Description', N'密码', N'SCHEMA', N'dbo', N'TABLE', N'user_info', N'COLUMN', N'password';
EXEC sp_addextendedproperty N'MS_Description', N'中文名', N'SCHEMA', N'dbo', N'TABLE', N'user_info', N'COLUMN', N'user_name_zh';
EXEC sp_addextendedproperty N'MS_Description', N'英文名', N'SCHEMA', N'dbo', N'TABLE', N'user_info', N'COLUMN', N'user_name_en';
EXEC sp_addextendedproperty N'MS_Description', N'状态（0：正常，1：停用）', N'SCHEMA', N'dbo', N'TABLE', N'user_info', N'COLUMN', N'status';
EXEC sp_addextendedproperty N'MS_Description', N'删除标志（0：存在，1：删除）', N'SCHEMA', N'dbo', N'TABLE', N'user_info', N'COLUMN', N'del_flag';
EXEC sp_addextendedproperty N'MS_Description', N'创建者', N'SCHEMA', N'dbo', N'TABLE', N'user_info', N'COLUMN', N'create_by';
EXEC sp_addextendedproperty N'MS_Description', N'创建者机构ID', N'SCHEMA', N'dbo', N'TABLE', N'user_info', N'COLUMN', N'create_org_id';
EXEC sp_addextendedproperty N'MS_Description', N'创建时间', N'SCHEMA', N'dbo', N'TABLE', N'user_info', N'COLUMN', N'create_time';
EXEC sp_addextendedproperty N'MS_Description', N'更新者', N'SCHEMA', N'dbo', N'TABLE', N'user_info', N'COLUMN', N'update_by';
EXEC sp_addextendedproperty N'MS_Description', N'更新者机构ID', N'SCHEMA', N'dbo', N'TABLE', N'user_info', N'COLUMN', N'update_org_id';
EXEC sp_addextendedproperty N'MS_Description', N'更新时间', N'SCHEMA', N'dbo', N'TABLE', N'user_info', N'COLUMN', N'update_time';
EXEC sp_addextendedproperty N'MS_Description', N'备注', N'SCHEMA', N'dbo', N'TABLE', N'user_info', N'COLUMN', N'remark';

-- 创建机构表
DROP TABLE IF EXISTS org_info;
CREATE TABLE org_info (
      org_id NVARCHAR(32) PRIMARY KEY,
      org_key NVARCHAR(32) NOT NULL UNIQUE,
      org_name_zh NVARCHAR(100) NOT NULL,
      org_name_en NVARCHAR(100) NOT NULL,
      parent_id NVARCHAR(32),
      org_type NVARCHAR(8),
      org_sort INT NOT NULL DEFAULT 1,
      status CHAR(1) DEFAULT '0',
      del_flag CHAR(1) DEFAULT '0',
      create_by NVARCHAR(32),
      create_org_id NVARCHAR(32),
      create_time DATETIME DEFAULT GETDATE(),
      update_by NVARCHAR(32),
      update_org_id NVARCHAR(32),
      update_time DATETIME DEFAULT GETDATE(),
      remark NVARCHAR(500)
);

-- 添加表注释
EXEC sp_addextendedproperty N'MS_Description', N'机构表', N'SCHEMA', N'dbo', N'TABLE', N'org_info';

-- 添加列注释
EXEC sp_addextendedproperty N'MS_Description', N'机构ID', N'SCHEMA', N'dbo', N'TABLE', N'org_info', N'COLUMN', N'org_id';
EXEC sp_addextendedproperty N'MS_Description', N'机构关键字', N'SCHEMA', N'dbo', N'TABLE', N'org_info', N'COLUMN', N'org_key';
EXEC sp_addextendedproperty N'MS_Description', N'机构中文名称', N'SCHEMA', N'dbo', N'TABLE', N'org_info', N'COLUMN', N'org_name_zh';
EXEC sp_addextendedproperty N'MS_Description', N'机构英文名称', N'SCHEMA', N'dbo', N'TABLE', N'org_info', N'COLUMN', N'org_name_en';
EXEC sp_addextendedproperty N'MS_Description', N'父机构ID', N'SCHEMA', N'dbo', N'TABLE', N'org_info', N'COLUMN', N'parent_id';
EXEC sp_addextendedproperty N'MS_Description', N'机构类型（1：总部，2：分部，3：支部，4：组）', N'SCHEMA', N'dbo', N'TABLE', N'org_info', N'COLUMN', N'org_type';
EXEC sp_addextendedproperty N'MS_Description', N'机构排序', N'SCHEMA', N'dbo', N'TABLE', N'org_info', N'COLUMN', N'org_sort';
EXEC sp_addextendedproperty N'MS_Description', N'状态（0：正常，1：停用）', N'SCHEMA', N'dbo', N'TABLE', N'org_info', N'COLUMN', N'status';
EXEC sp_addextendedproperty N'MS_Description', N'删除标志（0：存在，1：删除）', N'SCHEMA', N'dbo', N'TABLE', N'org_info', N'COLUMN', N'del_flag';
EXEC sp_addextendedproperty N'MS_Description', N'创建者', N'SCHEMA', N'dbo', N'TABLE', N'org_info', N'COLUMN', N'create_by';
EXEC sp_addextendedproperty N'MS_Description', N'创建者机构ID', N'SCHEMA', N'dbo', N'TABLE', N'org_info', N'COLUMN', N'create_org_id';
EXEC sp_addextendedproperty N'MS_Description', N'创建时间', N'SCHEMA', N'dbo', N'TABLE', N'org_info', N'COLUMN', N'create_time';
EXEC sp_addextendedproperty N'MS_Description', N'更新者', N'SCHEMA', N'dbo', N'TABLE', N'org_info', N'COLUMN', N'update_by';
EXEC sp_addextendedproperty N'MS_Description', N'更新者机构ID', N'SCHEMA', N'dbo', N'TABLE', N'org_info', N'COLUMN', N'update_org_id';
EXEC sp_addextendedproperty N'MS_Description', N'更新时间', N'SCHEMA', N'dbo', N'TABLE', N'org_info', N'COLUMN', N'update_time';
EXEC sp_addextendedproperty N'MS_Description', N'备注', N'SCHEMA', N'dbo', N'TABLE', N'org_info', N'COLUMN', N'remark';

-- 创建用户机构关联表
DROP TABLE IF EXISTS user_org;
CREATE TABLE user_org (
    user_id NVARCHAR(32) NOT NULL,
    org_id NVARCHAR(32) NOT NULL,
    is_primary CHAR(1) DEFAULT '0',
    status CHAR(1) DEFAULT '0',
    del_flag CHAR(1) DEFAULT '0',
    create_by NVARCHAR(32),
    create_org_id NVARCHAR(32),
    create_time DATETIME DEFAULT GETDATE(),
    update_by NVARCHAR(32),
    update_org_id NVARCHAR(32),
    update_time DATETIME DEFAULT GETDATE(),
    remark NVARCHAR(500),
    PRIMARY KEY (user_id, org_id)
);

-- 添加表注释
EXEC sp_addextendedproperty N'MS_Description', N'用户机构关联表', N'SCHEMA', N'dbo', N'TABLE', N'user_org';

-- 添加列注释
EXEC sp_addextendedproperty N'MS_Description', N'用户ID', N'SCHEMA', N'dbo', N'TABLE', N'user_org', N'COLUMN', N'user_id';
EXEC sp_addextendedproperty N'MS_Description', N'机构ID', N'SCHEMA', N'dbo', N'TABLE', N'user_org', N'COLUMN', N'org_id';
EXEC sp_addextendedproperty N'MS_Description', N'是否主机构（0：否，1：是）', N'SCHEMA', N'dbo', N'TABLE', N'user_org', N'COLUMN', N'is_primary';
EXEC sp_addextendedproperty N'MS_Description', N'状态（0：正常，1：停用）', N'SCHEMA', N'dbo', N'TABLE', N'user_org', N'COLUMN', N'status';
EXEC sp_addextendedproperty N'MS_Description', N'删除标志（0：存在，1：删除）', N'SCHEMA', N'dbo', N'TABLE', N'user_org', N'COLUMN', N'del_flag';
EXEC sp_addextendedproperty N'MS_Description', N'创建者', N'SCHEMA', N'dbo', N'TABLE', N'user_org', N'COLUMN', N'create_by';
EXEC sp_addextendedproperty N'MS_Description', N'创建者机构ID', N'SCHEMA', N'dbo', N'TABLE', N'user_org', N'COLUMN', N'create_org_id';
EXEC sp_addextendedproperty N'MS_Description', N'创建时间', N'SCHEMA', N'dbo', N'TABLE', N'user_org', N'COLUMN', N'create_time';
EXEC sp_addextendedproperty N'MS_Description', N'更新者', N'SCHEMA', N'dbo', N'TABLE', N'user_org', N'COLUMN', N'update_by';
EXEC sp_addextendedproperty N'MS_Description', N'更新者机构ID', N'SCHEMA', N'dbo', N'TABLE', N'user_org', N'COLUMN', N'update_org_id';
EXEC sp_addextendedproperty N'MS_Description', N'更新时间', N'SCHEMA', N'dbo', N'TABLE', N'user_org', N'COLUMN', N'update_time';
EXEC sp_addextendedproperty N'MS_Description', N'备注', N'SCHEMA', N'dbo', N'TABLE', N'user_org', N'COLUMN', N'remark';

-- 创建角色表
DROP TABLE IF EXISTS role_info;
CREATE TABLE role_info (
    role_id NVARCHAR(32) PRIMARY KEY,
    role_code NVARCHAR(32) NOT NULL UNIQUE,
    role_name_zh NVARCHAR(100) NOT NULL,
    role_name_en NVARCHAR(100) NOT NULL,
    role_sort INT DEFAULT 1,
    status CHAR(1) DEFAULT '0',
    del_flag CHAR(1) DEFAULT '0',
    create_by NVARCHAR(32),
    create_org_id NVARCHAR(32),
    create_time DATETIME DEFAULT GETDATE(),
    update_by NVARCHAR(32),
    update_org_id NVARCHAR(32),
    update_time DATETIME DEFAULT GETDATE(),
    remark NVARCHAR(500)
);

-- 添加表注释
EXEC sp_addextendedproperty N'MS_Description', N'角色表', N'SCHEMA', N'dbo', N'TABLE', N'role_info';

-- 添加列注释
EXEC sp_addextendedproperty N'MS_Description', N'角色ID', N'SCHEMA', N'dbo', N'TABLE', N'role_info', N'COLUMN', N'role_id';
EXEC sp_addextendedproperty N'MS_Description', N'角色编码', N'SCHEMA', N'dbo', N'TABLE', N'role_info', N'COLUMN', N'role_code';
EXEC sp_addextendedproperty N'MS_Description', N'角色中文名称', N'SCHEMA', N'dbo', N'TABLE', N'role_info', N'COLUMN', N'role_name_zh';
EXEC sp_addextendedproperty N'MS_Description', N'角色英文名称', N'SCHEMA', N'dbo', N'TABLE', N'role_info', N'COLUMN', N'role_name_en';
EXEC sp_addextendedproperty N'MS_Description', N'显示顺序', N'SCHEMA', N'dbo', N'TABLE', N'role_info', N'COLUMN', N'role_sort';
EXEC sp_addextendedproperty N'MS_Description', N'状态（0：正常，1：停用）', N'SCHEMA', N'dbo', N'TABLE', N'role_info', N'COLUMN', N'status';
EXEC sp_addextendedproperty N'MS_Description', N'删除标志（0：存在，1：删除）', N'SCHEMA', N'dbo', N'TABLE', N'role_info', N'COLUMN', N'del_flag';
EXEC sp_addextendedproperty N'MS_Description', N'创建者', N'SCHEMA', N'dbo', N'TABLE', N'role_info', N'COLUMN', N'create_by';
EXEC sp_addextendedproperty N'MS_Description', N'创建者机构ID', N'SCHEMA', N'dbo', N'TABLE', N'role_info', N'COLUMN', N'create_org_id';
EXEC sp_addextendedproperty N'MS_Description', N'创建时间', N'SCHEMA', N'dbo', N'TABLE', N'role_info', N'COLUMN', N'create_time';
EXEC sp_addextendedproperty N'MS_Description', N'更新者', N'SCHEMA', N'dbo', N'TABLE', N'role_info', N'COLUMN', N'update_by';
EXEC sp_addextendedproperty N'MS_Description', N'更新者机构ID', N'SCHEMA', N'dbo', N'TABLE', N'role_info', N'COLUMN', N'update_org_id';
EXEC sp_addextendedproperty N'MS_Description', N'更新时间', N'SCHEMA', N'dbo', N'TABLE', N'role_info', N'COLUMN', N'update_time';
EXEC sp_addextendedproperty N'MS_Description', N'备注', N'SCHEMA', N'dbo', N'TABLE', N'role_info', N'COLUMN', N'remark';


-- 创建用户机构角色关联表
DROP TABLE IF EXISTS user_org_role;
CREATE TABLE user_org_role (
    user_id NVARCHAR(32) NOT NULL,
    org_id NVARCHAR(32) NOT NULL,
    role_id NVARCHAR(32) NOT NULL,
    is_default CHAR(1) DEFAULT '0',
    status CHAR(1) DEFAULT '0',
    del_flag CHAR(1) DEFAULT '0',
    create_by NVARCHAR(32),
    create_org_id NVARCHAR(32),
    create_time DATETIME DEFAULT GETDATE(),
    update_by NVARCHAR(32),
    update_org_id NVARCHAR(32),
    update_time DATETIME DEFAULT GETDATE(),
    remark NVARCHAR(500),
    PRIMARY KEY (user_id, org_id, role_id)
);

-- 添加表注释
EXEC sp_addextendedproperty N'MS_Description', N'用户机构角色关联表', N'SCHEMA', N'dbo', N'TABLE', N'user_org_role';

-- 添加列注释
EXEC sp_addextendedproperty N'MS_Description', N'用户ID', N'SCHEMA', N'dbo', N'TABLE', N'user_org_role', N'COLUMN', N'user_id';
EXEC sp_addextendedproperty N'MS_Description', N'机构ID', N'SCHEMA', N'dbo', N'TABLE', N'user_org_role', N'COLUMN', N'org_id';
EXEC sp_addextendedproperty N'MS_Description', N'角色ID', N'SCHEMA', N'dbo', N'TABLE', N'user_org_role', N'COLUMN', N'role_id';
EXEC sp_addextendedproperty N'MS_Description', N'是否默认角色（0：否，1：是）', N'SCHEMA', N'dbo', N'TABLE', N'user_org_role', N'COLUMN', N'is_default';
EXEC sp_addextendedproperty N'MS_Description', N'状态（0：正常，1：停用）', N'SCHEMA', N'dbo', N'TABLE', N'user_org_role', N'COLUMN', N'status';
EXEC sp_addextendedproperty N'MS_Description', N'删除标志（0：存在，1：删除）', N'SCHEMA', N'dbo', N'TABLE', N'user_org_role', N'COLUMN', N'del_flag';
EXEC sp_addextendedproperty N'MS_Description', N'创建者', N'SCHEMA', N'dbo', N'TABLE', N'user_org_role', N'COLUMN', N'create_by';
EXEC sp_addextendedproperty N'MS_Description', N'创建者机构ID', N'SCHEMA', N'dbo', N'TABLE', N'user_org_role', N'COLUMN', N'create_org_id';
EXEC sp_addextendedproperty N'MS_Description', N'创建时间', N'SCHEMA', N'dbo', N'TABLE', N'user_org_role', N'COLUMN', N'create_time';
EXEC sp_addextendedproperty N'MS_Description', N'更新者', N'SCHEMA', N'dbo', N'TABLE', N'user_org_role', N'COLUMN', N'update_by';
EXEC sp_addextendedproperty N'MS_Description', N'更新者机构ID', N'SCHEMA', N'dbo', N'TABLE', N'user_org_role', N'COLUMN', N'update_org_id';
EXEC sp_addextendedproperty N'MS_Description', N'更新时间', N'SCHEMA', N'dbo', N'TABLE', N'user_org_role', N'COLUMN', N'update_time';
EXEC sp_addextendedproperty N'MS_Description', N'备注', N'SCHEMA', N'dbo', N'TABLE', N'user_org_role', N'COLUMN', N'remark';

-- 创建菜单表
DROP TABLE IF EXISTS menu_info;
CREATE TABLE menu_info (
    menu_id NVARCHAR(32) PRIMARY KEY,
    parent_id NVARCHAR(32),
    menu_name_zh NVARCHAR(100) NOT NULL,
    menu_name_en NVARCHAR(100) NOT NULL,
    menu_path NVARCHAR(200) NOT NULL UNIQUE,
    menu_icon NVARCHAR(100),
    menu_sort INT DEFAULT 1,
    status CHAR(1) DEFAULT '0',
    del_flag CHAR(1) DEFAULT '0',
    create_by NVARCHAR(32),
    create_org_id NVARCHAR(32),
    create_time DATETIME DEFAULT GETDATE(),
    update_by NVARCHAR(32),
    update_org_id NVARCHAR(32),
    update_time DATETIME DEFAULT GETDATE(),
    remark NVARCHAR(500)
);

-- 添加表注释
EXEC sp_addextendedproperty N'MS_Description', N'菜单表', N'SCHEMA', N'dbo', N'TABLE', N'menu_info';

-- 添加列注释
EXEC sp_addextendedproperty N'MS_Description', N'菜单ID', N'SCHEMA', N'dbo', N'TABLE', N'menu_info', N'COLUMN', N'menu_id';
EXEC sp_addextendedproperty N'MS_Description', N'父菜单ID', N'SCHEMA', N'dbo', N'TABLE', N'menu_info', N'COLUMN', N'parent_id';
EXEC sp_addextendedproperty N'MS_Description', N'菜单中文名称', N'SCHEMA', N'dbo', N'TABLE', N'menu_info', N'COLUMN', N'menu_name_zh';
EXEC sp_addextendedproperty N'MS_Description', N'菜单英文名称', N'SCHEMA', N'dbo', N'TABLE', N'menu_info', N'COLUMN', N'menu_name_en';
EXEC sp_addextendedproperty N'MS_Description', N'菜单路径', N'SCHEMA', N'dbo', N'TABLE', N'menu_info', N'COLUMN', N'menu_path';
EXEC sp_addextendedproperty N'MS_Description', N'菜单图标', N'SCHEMA', N'dbo', N'TABLE', N'menu_info', N'COLUMN', N'menu_icon';
EXEC sp_addextendedproperty N'MS_Description', N'显示顺序', N'SCHEMA', N'dbo', N'TABLE', N'menu_info', N'COLUMN', N'menu_sort';
EXEC sp_addextendedproperty N'MS_Description', N'状态（0：正常，1：停用）', N'SCHEMA', N'dbo', N'TABLE', N'menu_info', N'COLUMN', N'status';
EXEC sp_addextendedproperty N'MS_Description', N'删除标志（0：存在，1：删除）', N'SCHEMA', N'dbo', N'TABLE', N'menu_info', N'COLUMN', N'del_flag';
EXEC sp_addextendedproperty N'MS_Description', N'创建者', N'SCHEMA', N'dbo', N'TABLE', N'menu_info', N'COLUMN', N'create_by';
EXEC sp_addextendedproperty N'MS_Description', N'创建者机构ID', N'SCHEMA', N'dbo', N'TABLE', N'menu_info', N'COLUMN', N'create_org_id';
EXEC sp_addextendedproperty N'MS_Description', N'创建时间', N'SCHEMA', N'dbo', N'TABLE', N'menu_info', N'COLUMN', N'create_time';
EXEC sp_addextendedproperty N'MS_Description', N'更新者', N'SCHEMA', N'dbo', N'TABLE', N'menu_info', N'COLUMN', N'update_by';
EXEC sp_addextendedproperty N'MS_Description', N'更新者机构ID', N'SCHEMA', N'dbo', N'TABLE', N'menu_info', N'COLUMN', N'update_org_id';
EXEC sp_addextendedproperty N'MS_Description', N'更新时间', N'SCHEMA', N'dbo', N'TABLE', N'menu_info', N'COLUMN', N'update_time';
EXEC sp_addextendedproperty N'MS_Description', N'备注', N'SCHEMA', N'dbo', N'TABLE', N'menu_info', N'COLUMN', N'remark';

-- 创建角色菜单关联表
DROP TABLE IF EXISTS role_menu;
CREATE TABLE role_menu (
    role_id NVARCHAR(32) NOT NULL,
    menu_id NVARCHAR(32) NOT NULL,
    create_by NVARCHAR(32),
    create_org_id NVARCHAR(32),
    create_time DATETIME DEFAULT GETDATE(),
    update_by NVARCHAR(32),
    update_org_id NVARCHAR(32),
    update_time DATETIME DEFAULT GETDATE(),
    remark NVARCHAR(500),
    PRIMARY KEY (role_id, menu_id)
);

-- 添加表注释
EXEC sp_addextendedproperty N'MS_Description', N'菜单角色关联表', N'SCHEMA', N'dbo', N'TABLE', N'role_menu';

-- 添加列注释
EXEC sp_addextendedproperty N'MS_Description', N'菜单ID', N'SCHEMA', N'dbo', N'TABLE', N'role_menu', N'COLUMN', N'menu_id';
EXEC sp_addextendedproperty N'MS_Description', N'角色ID', N'SCHEMA', N'dbo', N'TABLE', N'role_menu', N'COLUMN', N'role_id';
EXEC sp_addextendedproperty N'MS_Description', N'创建者', N'SCHEMA', N'dbo', N'TABLE', N'role_menu', N'COLUMN', N'create_by';
EXEC sp_addextendedproperty N'MS_Description', N'创建者机构ID', N'SCHEMA', N'dbo', N'TABLE', N'role_menu', N'COLUMN', N'create_org_id';
EXEC sp_addextendedproperty N'MS_Description', N'创建时间', N'SCHEMA', N'dbo', N'TABLE', N'role_menu', N'COLUMN', N'create_time';
EXEC sp_addextendedproperty N'MS_Description', N'更新者', N'SCHEMA', N'dbo', N'TABLE', N'role_menu', N'COLUMN', N'update_by';
EXEC sp_addextendedproperty N'MS_Description', N'更新者机构ID', N'SCHEMA', N'dbo', N'TABLE', N'role_menu', N'COLUMN', N'update_org_id';
EXEC sp_addextendedproperty N'MS_Description', N'更新时间', N'SCHEMA', N'dbo', N'TABLE', N'role_menu', N'COLUMN', N'update_time';
EXEC sp_addextendedproperty N'MS_Description', N'备注', N'SCHEMA', N'dbo', N'TABLE', N'role_menu', N'COLUMN', N'remark';


-- 创建权限表
DROP TABLE IF EXISTS permission_info;
CREATE TABLE permission_info (
    permission_id NVARCHAR(32) PRIMARY KEY,
    permission_key NVARCHAR(100) NOT NULL UNIQUE,
    permission_name_zh NVARCHAR(100) NOT NULL,
    permission_name_en NVARCHAR(100) NOT NULL,
    permission_group NVARCHAR(32) NOT NULL,
    permission_sort INT DEFAULT 1,
    status CHAR(1) DEFAULT '0',
    del_flag CHAR(1) DEFAULT '0',
    create_by NVARCHAR(32),
    create_org_id NVARCHAR(32),
    create_time DATETIME DEFAULT GETDATE(),
    update_by NVARCHAR(32),
    update_org_id NVARCHAR(32),
    update_time DATETIME DEFAULT GETDATE(),
    remark NVARCHAR(500)
);

-- 添加表注释
EXEC sp_addextendedproperty N'MS_Description', N'权限表', N'SCHEMA', N'dbo', N'TABLE', N'permission_info';

-- 添加列注释
EXEC sp_addextendedproperty N'MS_Description', N'权限ID', N'SCHEMA', N'dbo', N'TABLE', N'permission_info', N'COLUMN', N'permission_id';
EXEC sp_addextendedproperty N'MS_Description', N'权限标识', N'SCHEMA', N'dbo', N'TABLE', N'permission_info', N'COLUMN', N'permission_key';
EXEC sp_addextendedproperty N'MS_Description', N'权限中文名称', N'SCHEMA', N'dbo', N'TABLE', N'permission_info', N'COLUMN', N'permission_name_zh';
EXEC sp_addextendedproperty N'MS_Description', N'权限英文名称', N'SCHEMA', N'dbo', N'TABLE', N'permission_info', N'COLUMN', N'permission_name_en';
EXEC sp_addextendedproperty N'MS_Description', N'权限分组（如：system, business等）', N'SCHEMA', N'dbo', N'TABLE', N'permission_info', N'COLUMN', N'permission_group';
EXEC sp_addextendedproperty N'MS_Description', N'显示顺序', N'SCHEMA', N'dbo', N'TABLE', N'permission_info', N'COLUMN', N'permission_sort';
EXEC sp_addextendedproperty N'MS_Description', N'状态（0：正常，1：停用）', N'SCHEMA', N'dbo', N'TABLE', N'permission_info', N'COLUMN', N'status';
EXEC sp_addextendedproperty N'MS_Description', N'删除标志（0：存在，1：删除）', N'SCHEMA', N'dbo', N'TABLE', N'permission_info', N'COLUMN', N'del_flag';
EXEC sp_addextendedproperty N'MS_Description', N'创建者', N'SCHEMA', N'dbo', N'TABLE', N'permission_info', N'COLUMN', N'create_by';
EXEC sp_addextendedproperty N'MS_Description', N'创建者机构ID', N'SCHEMA', N'dbo', N'TABLE', N'permission_info', N'COLUMN', N'create_org_id';
EXEC sp_addextendedproperty N'MS_Description', N'创建时间', N'SCHEMA', N'dbo', N'TABLE', N'permission_info', N'COLUMN', N'create_time';
EXEC sp_addextendedproperty N'MS_Description', N'更新者', N'SCHEMA', N'dbo', N'TABLE', N'permission_info', N'COLUMN', N'update_by';
EXEC sp_addextendedproperty N'MS_Description', N'更新者机构ID', N'SCHEMA', N'dbo', N'TABLE', N'permission_info', N'COLUMN', N'update_org_id';
EXEC sp_addextendedproperty N'MS_Description', N'更新时间', N'SCHEMA', N'dbo', N'TABLE', N'permission_info', N'COLUMN', N'update_time';
EXEC sp_addextendedproperty N'MS_Description', N'备注', N'SCHEMA', N'dbo', N'TABLE', N'permission_info', N'COLUMN', N'remark';


-- 创建角色权限关联表
DROP TABLE IF EXISTS role_permission;
CREATE TABLE role_permission (
    role_id NVARCHAR(32) NOT NULL,
    permission_id NVARCHAR(32) NOT NULL,
    status CHAR(1) DEFAULT '0',
    del_flag CHAR(1) DEFAULT '0',
    create_by NVARCHAR(32),
    create_org_id NVARCHAR(32),
    create_time DATETIME DEFAULT GETDATE(),
    update_by NVARCHAR(32),
    update_org_id NVARCHAR(32),
    update_time DATETIME DEFAULT GETDATE(),
    remark NVARCHAR(500),
    PRIMARY KEY (role_id, permission_id)
);

-- 添加表注释
EXEC sp_addextendedproperty N'MS_Description', N'角色权限关联表', N'SCHEMA', N'dbo', N'TABLE', N'role_permission';

-- 添加列注释
EXEC sp_addextendedproperty N'MS_Description', N'角色ID', N'SCHEMA', N'dbo', N'TABLE', N'role_permission', N'COLUMN', N'role_id';
EXEC sp_addextendedproperty N'MS_Description', N'权限ID', N'SCHEMA', N'dbo', N'TABLE', N'role_permission', N'COLUMN', N'permission_id';
EXEC sp_addextendedproperty N'MS_Description', N'状态（0：正常，1：停用）', N'SCHEMA', N'dbo', N'TABLE', N'role_permission', N'COLUMN', N'status';
EXEC sp_addextendedproperty N'MS_Description', N'删除标志（0：存在，1：删除）', N'SCHEMA', N'dbo', N'TABLE', N'role_permission', N'COLUMN', N'del_flag';
EXEC sp_addextendedproperty N'MS_Description', N'创建者', N'SCHEMA', N'dbo', N'TABLE', N'role_permission', N'COLUMN', N'create_by';
EXEC sp_addextendedproperty N'MS_Description', N'创建者机构ID', N'SCHEMA', N'dbo', N'TABLE', N'role_permission', N'COLUMN', N'create_org_id';
EXEC sp_addextendedproperty N'MS_Description', N'创建时间', N'SCHEMA', N'dbo', N'TABLE', N'role_permission', N'COLUMN', N'create_time';
EXEC sp_addextendedproperty N'MS_Description', N'更新者', N'SCHEMA', N'dbo', N'TABLE', N'role_permission', N'COLUMN', N'update_by';
EXEC sp_addextendedproperty N'MS_Description', N'更新者机构ID', N'SCHEMA', N'dbo', N'TABLE', N'role_permission', N'COLUMN', N'update_org_id';
EXEC sp_addextendedproperty N'MS_Description', N'更新时间', N'SCHEMA', N'dbo', N'TABLE', N'role_permission', N'COLUMN', N'update_time';
EXEC sp_addextendedproperty N'MS_Description', N'备注', N'SCHEMA', N'dbo', N'TABLE', N'role_permission', N'COLUMN', N'remark';

-- 创建审计日志表
DROP TABLE IF EXISTS audit_log;
CREATE TABLE audit_log (
    audit_id NVARCHAR(32) PRIMARY KEY,
    operation_time DATETIME NOT NULL,
    operation_ip NVARCHAR(50),
    operator_id NVARCHAR(32),
    operator_org_id NVARCHAR(32),
    role_id NVARCHAR(32),
    request_params NVARCHAR(MAX),
    response_result NVARCHAR(MAX),
    operation_url NVARCHAR(500),
    operation_desc NVARCHAR(500),
    operation_result CHAR(1) DEFAULT '0',
    error_msg NVARCHAR(1000)
);

-- 添加表注释
EXEC sp_addextendedproperty N'MS_Description', N'审计日志表', N'SCHEMA', N'dbo', N'TABLE', N'audit_log';

-- 添加列注释
EXEC sp_addextendedproperty N'MS_Description', N'审计ID', N'SCHEMA', N'dbo', N'TABLE', N'audit_log', N'COLUMN', N'audit_id';
EXEC sp_addextendedproperty N'MS_Description', N'操作时间', N'SCHEMA', N'dbo', N'TABLE', N'audit_log', N'COLUMN', N'operation_time';
EXEC sp_addextendedproperty N'MS_Description', N'操作IP', N'SCHEMA', N'dbo', N'TABLE', N'audit_log', N'COLUMN', N'operation_ip';
EXEC sp_addextendedproperty N'MS_Description', N'操作人ID', N'SCHEMA', N'dbo', N'TABLE', N'audit_log', N'COLUMN', N'operator_id';
EXEC sp_addextendedproperty N'MS_Description', N'操作机构ID', N'SCHEMA', N'dbo', N'TABLE', N'audit_log', N'COLUMN', N'operator_org_id';
EXEC sp_addextendedproperty N'MS_Description', N'操作角色ID', N'SCHEMA', N'dbo', N'TABLE', N'audit_log', N'COLUMN', N'role_id';
EXEC sp_addextendedproperty N'MS_Description', N'请求参数', N'SCHEMA', N'dbo', N'TABLE', N'audit_log', N'COLUMN', N'request_params';
EXEC sp_addextendedproperty N'MS_Description', N'响应结果', N'SCHEMA', N'dbo', N'TABLE', N'audit_log', N'COLUMN', N'response_result';
EXEC sp_addextendedproperty N'MS_Description', N'操作URL', N'SCHEMA', N'dbo', N'TABLE', N'audit_log', N'COLUMN', N'operation_url';
EXEC sp_addextendedproperty N'MS_Description', N'操作描述', N'SCHEMA', N'dbo', N'TABLE', N'audit_log', N'COLUMN', N'operation_desc';
EXEC sp_addextendedproperty N'MS_Description', N'操作结果(0:成功,1:失败)', N'SCHEMA', N'dbo', N'TABLE', N'audit_log', N'COLUMN', N'operation_result';
EXEC sp_addextendedproperty N'MS_Description', N'错误信息', N'SCHEMA', N'dbo', N'TABLE', N'audit_log', N'COLUMN', N'error_msg';

-- 创建码值库表
DROP TABLE IF EXISTS code_library;
CREATE TABLE code_library (
    code_type NVARCHAR(32) NOT NULL,
    code_value NVARCHAR(32) NOT NULL,
    code_name NVARCHAR(100) NOT NULL,
    code_sort INT DEFAULT 1,
    status CHAR(1) DEFAULT '0',
    del_flag CHAR(1) DEFAULT '0',
    code_desc NVARCHAR(500),
    attribute1 NVARCHAR(250),
    attribute2 NVARCHAR(250),
    attribute3 NVARCHAR(250),
    attribute4 NVARCHAR(250),
    attribute5 NVARCHAR(250),
    create_by NVARCHAR(32),
    create_org_id NVARCHAR(32),
    create_time DATETIME DEFAULT GETDATE(),
    update_by NVARCHAR(32),
    update_org_id NVARCHAR(32),
    update_time DATETIME DEFAULT GETDATE(),
    remark NVARCHAR(500),
    PRIMARY KEY (code_type, code_value)
);

-- 添加表注释
EXEC sp_addextendedproperty N'MS_Description', N'码值库表', N'SCHEMA', N'dbo', N'TABLE', N'code_library';

-- 添加列注释
EXEC sp_addextendedproperty N'MS_Description', N'码值类型', N'SCHEMA', N'dbo', N'TABLE', N'code_library', N'COLUMN', N'code_type';
EXEC sp_addextendedproperty N'MS_Description', N'码值', N'SCHEMA', N'dbo', N'TABLE', N'code_library', N'COLUMN', N'code_value';
EXEC sp_addextendedproperty N'MS_Description', N'码值名称', N'SCHEMA', N'dbo', N'TABLE', N'code_library', N'COLUMN', N'code_name';
EXEC sp_addextendedproperty N'MS_Description', N'显示顺序', N'SCHEMA', N'dbo', N'TABLE', N'code_library', N'COLUMN', N'code_sort';
EXEC sp_addextendedproperty N'MS_Description', N'状态（0：正常，1：停用）', N'SCHEMA', N'dbo', N'TABLE', N'code_library', N'COLUMN', N'status';
EXEC sp_addextendedproperty N'MS_Description', N'删除标志（0：存在，1：删除）', N'SCHEMA', N'dbo', N'TABLE', N'code_library', N'COLUMN', N'del_flag';
EXEC sp_addextendedproperty N'MS_Description', N'码值描述', N'SCHEMA', N'dbo', N'TABLE', N'code_library', N'COLUMN', N'code_desc';
EXEC sp_addextendedproperty N'MS_Description', N'拓展字段1', N'SCHEMA', N'dbo', N'TABLE', N'code_library', N'COLUMN', N'attribute1';
EXEC sp_addextendedproperty N'MS_Description', N'拓展字段2', N'SCHEMA', N'dbo', N'TABLE', N'code_library', N'COLUMN', N'attribute2';
EXEC sp_addextendedproperty N'MS_Description', N'拓展字段3', N'SCHEMA', N'dbo', N'TABLE', N'code_library', N'COLUMN', N'attribute3';
EXEC sp_addextendedproperty N'MS_Description', N'拓展字段4', N'SCHEMA', N'dbo', N'TABLE', N'code_library', N'COLUMN', N'attribute4';
EXEC sp_addextendedproperty N'MS_Description', N'拓展字段5', N'SCHEMA', N'dbo', N'TABLE', N'code_library', N'COLUMN', N'attribute5';
EXEC sp_addextendedproperty N'MS_Description', N'创建者', N'SCHEMA', N'dbo', N'TABLE', N'code_library', N'COLUMN', N'create_by';
EXEC sp_addextendedproperty N'MS_Description', N'创建者机构ID', N'SCHEMA', N'dbo', N'TABLE', N'code_library', N'COLUMN', N'create_org_id';
EXEC sp_addextendedproperty N'MS_Description', N'创建时间', N'SCHEMA', N'dbo', N'TABLE', N'code_library', N'COLUMN', N'create_time';
EXEC sp_addextendedproperty N'MS_Description', N'更新者', N'SCHEMA', N'dbo', N'TABLE', N'code_library', N'COLUMN', N'update_by';
EXEC sp_addextendedproperty N'MS_Description', N'更新者机构ID', N'SCHEMA', N'dbo', N'TABLE', N'code_library', N'COLUMN', N'update_org_id';
EXEC sp_addextendedproperty N'MS_Description', N'更新时间', N'SCHEMA', N'dbo', N'TABLE', N'code_library', N'COLUMN', N'update_time';
EXEC sp_addextendedproperty N'MS_Description', N'备注', N'SCHEMA', N'dbo', N'TABLE', N'code_library', N'COLUMN', N'remark';


-- 创建分布式ID生成表
DROP TABLE IF EXISTS db_key;
CREATE TABLE db_key (
    table_name VARCHAR(100) NOT NULL,
    entity_name VARCHAR(100) NOT NULL,
    prefix VARCHAR(10) NOT NULL,
    date_format VARCHAR(20) NOT NULL DEFAULT 'yyyyMMdd',
    padding_length INT NOT NULL DEFAULT 6,
    batch_size INT NOT NULL DEFAULT 100,
    current_id BIGINT NOT NULL DEFAULT 1,
    record_date DATE,
    current_letter_position INT NOT NULL DEFAULT 0,
    last_update_time DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT uk_db_key_table_name UNIQUE (table_name)
);

-- 添加表注释
EXEC sp_addextendedproperty N'MS_Description', N'分布式ID生成表', N'SCHEMA', N'dbo', N'TABLE', N'db_key';

-- 添加列注释
EXEC sp_addextendedproperty N'MS_Description', N'表名', N'SCHEMA', N'dbo', N'TABLE', N'db_key', N'COLUMN', N'table_name';
EXEC sp_addextendedproperty N'MS_Description', N'实体类名/主键', N'SCHEMA', N'dbo', N'TABLE', N'db_key', N'COLUMN', N'entity_name';
EXEC sp_addextendedproperty N'MS_Description', N'ID前缀', N'SCHEMA', N'dbo', N'TABLE', N'db_key', N'COLUMN', N'prefix';
EXEC sp_addextendedproperty N'MS_Description', N'日期格式', N'SCHEMA', N'dbo', N'TABLE', N'db_key', N'COLUMN', N'date_format';
EXEC sp_addextendedproperty N'MS_Description', N'补充位数', N'SCHEMA', N'dbo', N'TABLE', N'db_key', N'COLUMN', N'padding_length';
EXEC sp_addextendedproperty N'MS_Description', N'批量获取数量', N'SCHEMA', N'dbo', N'TABLE', N'db_key', N'COLUMN', N'batch_size';
EXEC sp_addextendedproperty N'MS_Description', N'当前起始ID', N'SCHEMA', N'dbo', N'TABLE', N'db_key', N'COLUMN', N'current_id';
EXEC sp_addextendedproperty N'MS_Description', N'当前日期', N'SCHEMA', N'dbo', N'TABLE', N'db_key', N'COLUMN', N'record_date';
EXEC sp_addextendedproperty N'MS_Description', N'当前字母位置(用于扩展容量)', N'SCHEMA', N'dbo', N'TABLE', N'db_key', N'COLUMN', N'current_letter_position';
EXEC sp_addextendedproperty N'MS_Description', N'最后更新时间', N'SCHEMA', N'dbo', N'TABLE', N'db_key', N'COLUMN', N'last_update_time';

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
CREATE INDEX idx_role_menu_role ON role_menu(role_id,menu_id);
CREATE INDEX idx_role_permission_role ON role_permission(role_id, status, del_flag);
CREATE INDEX idx_role_permission_perm ON role_permission(permission_id, status, del_flag);

-- 审计日志索引
CREATE INDEX idx_audit_operator_time ON audit_log(operator_id, operation_time);
CREATE INDEX idx_audit_time ON audit_log(operation_time);
CREATE INDEX idx_audit_result ON audit_log(operation_result, operation_time);

