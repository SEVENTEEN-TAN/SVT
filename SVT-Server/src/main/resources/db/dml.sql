-- 清空关联表数据
TRUNCATE TABLE role_permission;
TRUNCATE TABLE menu_role;
TRUNCATE TABLE user_role;
TRUNCATE TABLE user_org;
TRUNCATE TABLE permission_info;
TRUNCATE TABLE menu_info;
TRUNCATE TABLE role_info;
TRUNCATE TABLE org_info;
TRUNCATE TABLE code_library;
TRUNCATE TABLE user_info;

-- 初始化管理员
INSERT INTO demo.dbo.user_info (user_id, login_id, password, user_name_zh, user_name_en, status, del_flag, create_by, create_org_id, create_time, update_by, update_org_id, update_time, remark)
VALUES (N'admin', N'admin', N'5ac537f82817f1d478fccc441857ef25', N'系统管理员', N'System Administrator', N'0', N'0', N'System', N'000000', N'2025-03-27 16:27:59.000', N'System', N'000000', N'2025-03-27 16:28:14.000', null);

-- 初始化操作类型代码
INSERT INTO code_library (code_type, code_value, code_name, code_desc, code_sort, status, del_flag, create_by, create_org_id, create_time, update_by, update_org_id, update_time, remark)
VALUES 
-- 基础操作
(N'OPERATE_TYPE', N'view', N'查看', N'查看数据权限', N'1', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'OPERATE_TYPE', N'add', N'新增', N'新增数据权限', N'2', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'OPERATE_TYPE', N'edit', N'编辑', N'编辑数据权限', N'3', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'OPERATE_TYPE', N'delete', N'删除', N'删除数据权限', N'4', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
-- 审批操作
(N'OPERATE_TYPE', N'approve', N'审批', N'审批数据权限', N'5', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'OPERATE_TYPE', N'reject', N'拒绝', N'拒绝数据权限', N'6', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
-- 导入导出
(N'OPERATE_TYPE', N'export', N'导出', N'导出数据权限', N'7', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'OPERATE_TYPE', N'import', N'导入', N'导入数据权限', N'8', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
-- 文件操作
(N'OPERATE_TYPE', N'print', N'打印', N'打印数据权限', N'9', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'OPERATE_TYPE', N'download', N'下载', N'下载数据权限', N'10', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'OPERATE_TYPE', N'upload', N'上传', N'上传数据权限', N'11', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
-- 其他操作
(N'OPERATE_TYPE', N'search', N'搜索', N'搜索数据权限', N'12', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'OPERATE_TYPE', N'reset', N'重置', N'重置数据权限', N'13', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'OPERATE_TYPE', N'lock', N'锁定', N'锁定数据权限', N'14', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'OPERATE_TYPE', N'unlock', N'解锁', N'解锁数据权限', N'15', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'OPERATE_TYPE', N'enable', N'启用', N'启用数据权限', N'16', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'OPERATE_TYPE', N'disable', N'禁用', N'禁用数据权限', N'17', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null);

-- 初始化机构数据
INSERT INTO org_info (org_id, org_key, org_name_zh, org_name_en, parent_id, org_type, org_sort, status, del_flag, create_by, create_org_id, create_time, update_by, update_org_id, update_time, remark)
VALUES 
-- 总部
(N'000000', N'HQ', N'浙江总部', N'Zhejiang Headquarters', null, N'1', N'1', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
-- 分部
(N'100000', N'HZ', N'杭州分部', N'Hangzhou Branch', N'000000', N'2', N'1', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'200000', N'NB', N'宁波分部', N'Ningbo Branch', N'000000', N'2', N'2', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
-- 支部
(N'110000', N'XH', N'西湖支部', N'Xihu Branch', N'100000', N'3', N'1', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'120000', N'BJ', N'滨江支部', N'Binjiang Branch', N'100000', N'3', N'2', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'210000', N'HS', N'海曙支部', N'Haishu Branch', N'200000', N'3', N'1', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
-- 组
(N'111000', N'TECH', N'技术组', N'Technology Group', N'110000', N'4', N'1', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'112000', N'BIZ', N'业务组', N'Business Group', N'110000', N'4', N'2', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'113000', N'RISK', N'风控组', N'Risk Control Group', N'110000', N'4', N'3', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null);

-- 初始化角色数据
INSERT INTO role_info (role_id, role_code, role_name_zh, role_name_en, role_sort, status, del_flag, create_by, create_org_id, create_time, update_by, update_org_id, update_time, remark)
VALUES 
(N'ROLE001', N'SYSTEM_ADMIN', N'系统管理员', N'System Administrator', N'1', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE002', N'BRANCH_ADMIN', N'分部管理员', N'Branch Administrator', N'2', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE003', N'DEPARTMENT_ADMIN', N'支部管理员', N'Department Administrator', N'3', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE004', N'NORMAL_USER', N'普通用户', N'Normal User', N'4', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null);

-- 初始化用户数据
INSERT INTO user_info (user_id, login_id, password, user_name_zh, user_name_en, status, del_flag, create_by, create_org_id, create_time, update_by, update_org_id, update_time, remark)
VALUES 
(N'USER001', N'hzadmin', N'5ac537f82817f1d478fccc441857ef25', N'杭州管理员', N'Hangzhou Administrator', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'USER002', N'nbadmin', N'5ac537f82817f1d478fccc441857ef25', N'宁波管理员', N'Ningbo Administrator', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'USER003', N'xhadmin', N'5ac537f82817f1d478fccc441857ef25', N'西湖管理员', N'Xihu Administrator', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'USER004', N'bjadmin', N'5ac537f82817f1d478fccc441857ef25', N'滨江管理员', N'Binjiang Administrator', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'USER005', N'hsadmin', N'5ac537f82817f1d478fccc441857ef25', N'海曙管理员', N'Haishu Administrator', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'USER006', N'tech001', N'5ac537f82817f1d478fccc441857ef25', N'技术员1', N'Technician 1', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'USER007', N'biz001', N'5ac537f82817f1d478fccc441857ef25', N'业务员1', N'Business Staff 1', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'USER008', N'risk001', N'5ac537f82817f1d478fccc441857ef25', N'风控员1', N'Risk Controller 1', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null);

-- 初始化用户机构关联
INSERT INTO user_org (user_id, org_id, is_primary, status, del_flag, create_by, create_org_id, create_time, update_by, update_org_id, update_time, remark)
VALUES 
-- 杭州管理员
(N'USER001', N'100000', N'1', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
-- 宁波管理员
(N'USER002', N'200000', N'1', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
-- 西湖管理员
(N'USER003', N'110000', N'1', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
-- 滨江管理员
(N'USER004', N'120000', N'1', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
-- 海曙管理员
(N'USER005', N'210000', N'1', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
-- 技术员
(N'USER006', N'111000', N'1', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
-- 业务员
(N'USER007', N'112000', N'1', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
-- 风控员
(N'USER008', N'113000', N'1', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null);

-- 初始化用户角色关联
INSERT INTO user_role (user_id, role_id, status, del_flag, create_by, create_org_id, create_time, update_by, update_org_id, update_time, remark)
VALUES 
-- 系统管理员
(N'admin', N'ROLE001', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
-- 杭州管理员
(N'USER001', N'ROLE002', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
-- 宁波管理员
(N'USER002', N'ROLE002', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
-- 西湖管理员
(N'USER003', N'ROLE003', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
-- 滨江管理员
(N'USER004', N'ROLE003', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
-- 海曙管理员
(N'USER005', N'ROLE003', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
-- 普通用户
(N'USER006', N'ROLE004', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'USER007', N'ROLE004', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'USER008', N'ROLE004', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null);

-- 初始化菜单数据
INSERT INTO menu_info (menu_id, parent_id, menu_name_zh, menu_name_en, menu_path, menu_icon, menu_sort, status, del_flag, create_by, create_org_id, create_time, update_by, update_org_id, update_time, remark)
VALUES 
-- 系统管理
(N'M001', null, N'系统管理', N'System Management', N'/system', N'setting', N'1', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'M001001', N'M001', N'用户管理', N'User Management', N'/system/user', N'user', N'1', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'M001002', N'M001', N'角色管理', N'Role Management', N'/system/role', N'team', N'2', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'M001003', N'M001', N'菜单管理', N'Menu Management', N'/system/menu', N'menu', N'3', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
-- 业务管理
(N'M002', null, N'业务管理', N'Business Management', N'/business', N'shop', N'2', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'M002001', N'M002', N'业务处理', N'Business Process', N'/business/process', N'form', N'1', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'M002002', N'M002', N'业务查询', N'Business Query', N'/business/query', N'search', N'2', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null);

-- 初始化菜单角色关联
INSERT INTO menu_role (menu_id, role_id, status, del_flag, create_by, create_org_id, create_time, update_by, update_org_id, update_time, remark)
VALUES 
-- 系统管理员拥有所有菜单权限
(N'M001', N'ROLE001', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'M001001', N'ROLE001', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'M001002', N'ROLE001', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'M001003', N'ROLE001', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'M002', N'ROLE001', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'M002001', N'ROLE001', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'M002002', N'ROLE001', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
-- 分部管理员拥有业务管理权限
(N'M002', N'ROLE002', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'M002001', N'ROLE002', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'M002002', N'ROLE002', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
-- 支部管理员拥有业务管理权限
(N'M002', N'ROLE003', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'M002001', N'ROLE003', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'M002002', N'ROLE003', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
-- 普通用户只有业务查询权限
(N'M002002', N'ROLE004', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null);

-- 初始化权限数据
INSERT INTO permission_info (permission_id, permission_key, permission_name_zh, permission_name_en, permission_group, permission_sort, status, del_flag, create_by, create_org_id, create_time, update_by, update_org_id, update_time, remark)
VALUES 
-- 系统管理权限
(N'P001', N'system:user:view', N'查看用户', N'View User', N'system', N'1', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'P002', N'system:user:add', N'新增用户', N'Add User', N'system', N'2', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'P003', N'system:user:edit', N'编辑用户', N'Edit User', N'system', N'3', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'P004', N'system:user:delete', N'删除用户', N'Delete User', N'system', N'4', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
-- 业务管理权限
(N'P005', N'business:process:view', N'查看业务', N'View Business', N'business', N'1', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'P006', N'business:process:add', N'新增业务', N'Add Business', N'business', N'2', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'P007', N'business:process:edit', N'编辑业务', N'Edit Business', N'business', N'3', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'P008', N'business:process:delete', N'删除业务', N'Delete Business', N'business', N'4', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null);

-- 初始化角色权限关联
INSERT INTO role_permission (role_id, permission_id, status, del_flag, create_by, create_org_id, create_time, update_by, update_org_id, update_time, remark)
VALUES 
-- 系统管理员拥有所有权限
(N'ROLE001', N'P001', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE001', N'P002', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE001', N'P003', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE001', N'P004', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE001', N'P005', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE001', N'P006', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE001', N'P007', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE001', N'P008', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
-- 分部管理员拥有业务管理权限
(N'ROLE002', N'P005', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE002', N'P006', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE002', N'P007', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE002', N'P008', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
-- 支部管理员拥有业务管理权限
(N'ROLE003', N'P005', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE003', N'P006', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE003', N'P007', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE003', N'P008', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
-- 普通用户只有查看权限
(N'ROLE004', N'P005', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null);
