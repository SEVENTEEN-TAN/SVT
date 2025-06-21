-- 清空关联表数据
TRUNCATE TABLE role_permission;
TRUNCATE TABLE role_menu;
TRUNCATE TABLE user_role;
TRUNCATE TABLE user_org;
TRUNCATE TABLE permission_info;
TRUNCATE TABLE menu_info;
TRUNCATE TABLE role_info;
TRUNCATE TABLE org_info;
TRUNCATE TABLE code_library;
TRUNCATE TABLE user_info;

-- 初始化管理员 (密码: admin)
INSERT INTO user_info (user_id, login_id, password, user_name_zh, user_name_en, status, del_flag, create_by, create_org_id, create_time, update_by, update_org_id, update_time, remark)
VALUES (N'admin', N'admin', N'$argon2id$v=19$m=4096,t=3,p=1$GrxWchukGBY/T1ag1oTUBA$6vEgh4D7JHlmjwytpkH2SPHaeTKNYpmIO9YLNda1+E4', N'系统管理员', N'System Administrator', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null);

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

-- 初始化用户数据 (密码: admin)
INSERT INTO user_info (user_id, login_id, password, user_name_zh, user_name_en, status, del_flag, create_by, create_org_id, create_time, update_by, update_org_id, update_time, remark)
VALUES
(N'USER001', N'hzadmin', N'$argon2id$v=19$m=4096,t=3,p=1$GrxWchukGBY/T1ag1oTUBA$6vEgh4D7JHlmjwytpkH2SPHaeTKNYpmIO9YLNda1+E4', N'杭州管理员', N'Hangzhou Administrator', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'USER002', N'nbadmin', N'$argon2id$v=19$m=4096,t=3,p=1$GrxWchukGBY/T1ag1oTUBA$6vEgh4D7JHlmjwytpkH2SPHaeTKNYpmIO9YLNda1+E4', N'宁波管理员', N'Ningbo Administrator', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'USER003', N'xhadmin', N'$argon2id$v=19$m=4096,t=3,p=1$GrxWchukGBY/T1ag1oTUBA$6vEgh4D7JHlmjwytpkH2SPHaeTKNYpmIO9YLNda1+E4', N'西湖管理员', N'Xihu Administrator', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'USER004', N'bjadmin', N'$argon2id$v=19$m=4096,t=3,p=1$GrxWchukGBY/T1ag1oTUBA$6vEgh4D7JHlmjwytpkH2SPHaeTKNYpmIO9YLNda1+E4', N'滨江管理员', N'Binjiang Administrator', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'USER005', N'hsadmin', N'$argon2id$v=19$m=4096,t=3,p=1$GrxWchukGBY/T1ag1oTUBA$6vEgh4D7JHlmjwytpkH2SPHaeTKNYpmIO9YLNda1+E4', N'海曙管理员', N'Haishu Administrator', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'USER006', N'tech001', N'$argon2id$v=19$m=4096,t=3,p=1$GrxWchukGBY/T1ag1oTUBA$6vEgh4D7JHlmjwytpkH2SPHaeTKNYpmIO9YLNda1+E4', N'技术员1', N'Technician 1', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'USER007', N'biz001', N'$argon2id$v=19$m=4096,t=3,p=1$GrxWchukGBY/T1ag1oTUBA$6vEgh4D7JHlmjwytpkH2SPHaeTKNYpmIO9YLNda1+E4', N'业务员1', N'Business Staff 1', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'USER008', N'risk001', N'$argon2id$v=19$m=4096,t=3,p=1$GrxWchukGBY/T1ag1oTUBA$6vEgh4D7JHlmjwytpkH2SPHaeTKNYpmIO9YLNda1+E4', N'风控员1', N'Risk Controller 1', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null);

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
(N'M001004', N'M001', N'权限管理', N'Permission Management', N'/system/permission', N'safety', N'4', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'M001005', N'M001', N'机构管理', N'Organization Management', N'/system/org', N'apartment', N'5', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
-- 业务管理
(N'M002', null, N'业务管理', N'Business Management', N'/business', N'shop', N'2', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'M002001', N'M002', N'业务处理', N'Business Process', N'/business/process', N'form', N'1', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'M002002', N'M002', N'业务查询', N'Business Query', N'/business/query', N'search', N'2', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null);

-- 初始化权限数据
INSERT INTO permission_info (permission_id, permission_key, permission_name_zh, permission_name_en, permission_group, permission_sort, status, del_flag, create_by, create_org_id, create_time, update_by, update_org_id, update_time, remark)
VALUES
-- 系统管理权限
(N'P001001', N'system:user:view', N'用户查看', N'User View', N'SYSTEM', N'1', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'P001002', N'system:user:add', N'用户新增', N'User Add', N'SYSTEM', N'2', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'P001003', N'system:user:edit', N'用户编辑', N'User Edit', N'SYSTEM', N'3', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'P001004', N'system:user:delete', N'用户删除', N'User Delete', N'SYSTEM', N'4', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'P001005', N'system:user:reset', N'用户重置密码', N'User Reset Password', N'SYSTEM', N'5', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),

(N'P002001', N'system:role:view', N'角色查看', N'Role View', N'SYSTEM', N'11', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'P002002', N'system:role:add', N'角色新增', N'Role Add', N'SYSTEM', N'12', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'P002003', N'system:role:edit', N'角色编辑', N'Role Edit', N'SYSTEM', N'13', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'P002004', N'system:role:delete', N'角色删除', N'Role Delete', N'SYSTEM', N'14', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'P002005', N'system:role:assign', N'角色分配权限', N'Role Assign Permission', N'SYSTEM', N'15', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),

(N'P003001', N'system:menu:view', N'菜单查看', N'Menu View', N'SYSTEM', N'21', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'P003002', N'system:menu:add', N'菜单新增', N'Menu Add', N'SYSTEM', N'22', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'P003003', N'system:menu:edit', N'菜单编辑', N'Menu Edit', N'SYSTEM', N'23', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'P003004', N'system:menu:delete', N'菜单删除', N'Menu Delete', N'SYSTEM', N'24', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),

(N'P004001', N'system:permission:view', N'权限查看', N'Permission View', N'SYSTEM', N'31', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'P004002', N'system:permission:add', N'权限新增', N'Permission Add', N'SYSTEM', N'32', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'P004003', N'system:permission:edit', N'权限编辑', N'Permission Edit', N'SYSTEM', N'33', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'P004004', N'system:permission:delete', N'权限删除', N'Permission Delete', N'SYSTEM', N'34', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),

(N'P005001', N'system:org:view', N'机构查看', N'Organization View', N'SYSTEM', N'41', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'P005002', N'system:org:add', N'机构新增', N'Organization Add', N'SYSTEM', N'42', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'P005003', N'system:org:edit', N'机构编辑', N'Organization Edit', N'SYSTEM', N'43', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'P005004', N'system:org:delete', N'机构删除', N'Organization Delete', N'SYSTEM', N'44', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),

-- 业务管理权限
(N'P101001', N'business:process:view', N'业务处理查看', N'Business Process View', N'BUSINESS', N'101', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'P101002', N'business:process:add', N'业务处理新增', N'Business Process Add', N'BUSINESS', N'102', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'P101003', N'business:process:edit', N'业务处理编辑', N'Business Process Edit', N'BUSINESS', N'103', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'P101004', N'business:process:approve', N'业务处理审批', N'Business Process Approve', N'BUSINESS', N'104', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),

(N'P102001', N'business:query:view', N'业务查询查看', N'Business Query View', N'BUSINESS', N'111', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'P102002', N'business:query:export', N'业务查询导出', N'Business Query Export', N'BUSINESS', N'112', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null);

-- 为admin用户添加机构关联
INSERT INTO user_org (user_id, org_id, is_primary, status, del_flag, create_by, create_org_id, create_time, update_by, update_org_id, update_time, remark)
VALUES
-- 系统管理员属于总部
(N'admin', N'000000', N'1', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null);

-- 初始化角色菜单关联
INSERT INTO role_menu (role_id, menu_id, status, del_flag, create_by, create_org_id, create_time, update_by, update_org_id, update_time, remark)
VALUES
-- 系统管理员拥有所有菜单
(N'ROLE001', N'M001', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE001', N'M001001', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE001', N'M001002', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE001', N'M001003', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE001', N'M001004', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE001', N'M001005', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE001', N'M002', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE001', N'M002001', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE001', N'M002002', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),

-- 分部管理员拥有部分系统管理和业务管理菜单
(N'ROLE002', N'M001', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE002', N'M001001', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE002', N'M001002', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE002', N'M001005', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE002', N'M002', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE002', N'M002001', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE002', N'M002002', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),

-- 支部管理员拥有用户管理和业务管理菜单
(N'ROLE003', N'M001', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE003', N'M001001', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE003', N'M002', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE003', N'M002001', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE003', N'M002002', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),

-- 普通用户只有业务管理菜单
(N'ROLE004', N'M002', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE004', N'M002001', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE004', N'M002002', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null);

-- 初始化角色权限关联
INSERT INTO role_permission (role_id, permission_id, status, del_flag, create_by, create_org_id, create_time, update_by, update_org_id, update_time, remark)
VALUES
-- 系统管理员拥有所有权限
(N'ROLE001', N'P001001', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE001', N'P001002', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE001', N'P001003', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE001', N'P001004', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE001', N'P001005', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE001', N'P002001', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE001', N'P002002', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE001', N'P002003', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE001', N'P002004', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE001', N'P002005', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE001', N'P003001', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE001', N'P003002', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE001', N'P003003', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE001', N'P003004', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE001', N'P004001', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE001', N'P004002', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE001', N'P004003', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE001', N'P004004', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE001', N'P005001', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE001', N'P005002', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE001', N'P005003', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE001', N'P005004', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE001', N'P101001', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE001', N'P101002', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE001', N'P101003', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE001', N'P101004', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE001', N'P102001', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE001', N'P102002', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),

-- 分部管理员权限
(N'ROLE002', N'P001001', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE002', N'P001002', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE002', N'P001003', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE002', N'P002001', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE002', N'P002002', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE002', N'P002003', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE002', N'P005001', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE002', N'P005002', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE002', N'P005003', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE002', N'P101001', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE002', N'P101002', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE002', N'P101003', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE002', N'P101004', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE002', N'P102001', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE002', N'P102002', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),

-- 支部管理员权限
(N'ROLE003', N'P001001', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE003', N'P001002', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE003', N'P001003', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE003', N'P101001', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE003', N'P101002', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE003', N'P101003', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE003', N'P102001', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE003', N'P102002', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),

-- 普通用户权限
(N'ROLE004', N'P101001', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE004', N'P101002', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ROLE004', N'P102001', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null);

-- 初始化常用码值数据
INSERT INTO code_library (code_type, code_value, code_name, code_desc, code_sort, status, del_flag, create_by, create_org_id, create_time, update_by, update_org_id, update_time, remark)
VALUES
-- 用户状态
(N'USER_STATUS', N'0', N'正常', N'用户状态正常', N'1', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'USER_STATUS', N'1', N'停用', N'用户状态停用', N'2', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'USER_STATUS', N'2', N'锁定', N'用户状态锁定', N'3', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),

-- 机构类型
(N'ORG_TYPE', N'1', N'总部', N'总部机构', N'1', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ORG_TYPE', N'2', N'分部', N'分部机构', N'2', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ORG_TYPE', N'3', N'支部', N'支部机构', N'3', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'ORG_TYPE', N'4', N'组', N'组机构', N'4', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),

-- 菜单类型
(N'MENU_TYPE', N'1', N'目录', N'菜单目录', N'1', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'MENU_TYPE', N'2', N'菜单', N'菜单页面', N'2', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'MENU_TYPE', N'3', N'按钮', N'菜单按钮', N'3', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),

-- 权限分组
(N'PERMISSION_GROUP', N'SYSTEM', N'系统管理', N'系统管理权限组', N'1', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'PERMISSION_GROUP', N'BUSINESS', N'业务管理', N'业务管理权限组', N'2', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'PERMISSION_GROUP', N'REPORT', N'报表管理', N'报表管理权限组', N'3', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),

-- 审计操作结果
(N'AUDIT_RESULT', N'0', N'成功', N'操作成功', N'1', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'AUDIT_RESULT', N'1', N'失败', N'操作失败', N'2', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),

-- 通用状态
(N'COMMON_STATUS', N'0', N'正常', N'状态正常', N'1', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'COMMON_STATUS', N'1', N'停用', N'状态停用', N'2', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),

-- 是否标识
(N'YES_NO', N'0', N'否', N'否', N'1', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null),
(N'YES_NO', N'1', N'是', N'是', N'2', N'0', N'0', N'System', N'000000', GETDATE(), N'System', N'000000', GETDATE(), null);
