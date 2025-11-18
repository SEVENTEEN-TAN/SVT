-- MySQL 8.0 DML Script

-- 清空关联表数据
TRUNCATE TABLE role_permission;
TRUNCATE TABLE role_menu;
TRUNCATE TABLE user_org_role;
TRUNCATE TABLE user_org;
TRUNCATE TABLE permission_info;
TRUNCATE TABLE menu_info;
TRUNCATE TABLE role_info;
TRUNCATE TABLE org_info;
TRUNCATE TABLE code_library;
TRUNCATE TABLE user_info;

-- 初始化管理员 (密码: admin)
INSERT INTO user_info (user_id, login_id, password, user_name_zh, user_name_en, status, del_flag, create_by, create_org_id, create_time, update_by, update_org_id, update_time, remark)
VALUES ('admin', 'admin', '$argon2id$v=19$m=4096,t=3,p=1$GrxWchukGBY/T1ag1oTUBA$6vEgh4D7JHlmjwytpkH2SPHaeTKNYpmIO9YLNda1+E4', '系统管理员', 'System Administrator', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null);

-- 初始化操作类型代码
INSERT INTO code_library (code_type, code_value, code_name, code_desc, code_sort, status, del_flag, create_by, create_org_id, create_time, update_by, update_org_id, update_time, remark)
VALUES
-- 基础操作
('OPERATE_TYPE', 'view', '查看', '查看数据权限', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('OPERATE_TYPE', 'add', '新增', '新增数据权限', '2', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('OPERATE_TYPE', 'edit', '编辑', '编辑数据权限', '3', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('OPERATE_TYPE', 'delete', '删除', '删除数据权限', '4', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
-- 审批操作
('OPERATE_TYPE', 'approve', '审批', '审批数据权限', '5', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('OPERATE_TYPE', 'reject', '拒绝', '拒绝数据权限', '6', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
-- 导入导出
('OPERATE_TYPE', 'export', '导出', '导出数据权限', '7', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('OPERATE_TYPE', 'import', '导入', '导入数据权限', '8', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
-- 文件操作
('OPERATE_TYPE', 'print', '打印', '打印数据权限', '9', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('OPERATE_TYPE', 'download', '下载', '下载数据权限', '10', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('OPERATE_TYPE', 'upload', '上传', '上传数据权限', '11', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
-- 其他操作
('OPERATE_TYPE', 'search', '搜索', '搜索数据权限', '12', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('OPERATE_TYPE', 'reset', '重置', '重置数据权限', '13', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('OPERATE_TYPE', 'lock', '锁定', '锁定数据权限', '14', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('OPERATE_TYPE', 'unlock', '解锁', '解锁数据权限', '15', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('OPERATE_TYPE', 'enable', '启用', '启用数据权限', '16', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('OPERATE_TYPE', 'disable', '禁用', '禁用数据权限', '17', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null);

-- 初始化机构数据
INSERT INTO org_info (org_id, org_key, org_name_zh, org_name_en, parent_id, org_type, org_sort, status, del_flag, create_by, create_org_id, create_time, update_by, update_org_id, update_time, remark)
VALUES
-- 总部
('000000', 'HQ', '浙江总部', 'Zhejiang Headquarters', null, '1', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
-- 分部
('100000', 'HZ', '杭州分部', 'Hangzhou Branch', '000000', '2', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('200000', 'NB', '宁波分部', 'Ningbo Branch', '000000', '2', '2', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
-- 支部
('110000', 'XH', '西湖支部', 'Xihu Branch', '100000', '3', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('120000', 'BJ', '滨江支部', 'Binjiang Branch', '100000', '3', '2', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('210000', 'HS', '海曙支部', 'Haishu Branch', '200000', '3', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
-- 组
('111000', 'TECH', '技术组', 'Technology Group', '110000', '4', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('112000', 'BIZ', '业务组', 'Business Group', '110000', '4', '2', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('113000', 'RISK', '风控组', 'Risk Control Group', '110000', '4', '3', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null);

-- 初始化角色数据
INSERT INTO role_info (role_id, role_code, role_name_zh, role_name_en, role_sort, status, del_flag, create_by, create_org_id, create_time, update_by, update_org_id, update_time, remark)
VALUES
('ROLE001', 'SYSTEM_ADMIN', '系统管理员', 'System Administrator', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), '最高权限管理员'),
('ROLE002', 'BRANCH_ADMIN', '分部管理员', 'Branch Administrator', '2', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), '分部级别管理员'),
('ROLE003', 'DEPARTMENT_ADMIN', '支部管理员', 'Department Administrator', '3', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), '支部级别管理员'),
('ROLE004', 'NORMAL_USER', '普通用户', 'Normal User', '4', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), '普通业务用户'),
('ROLE005', 'TECH_LEADER', '技术主管', 'Tech Leader', '5', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), '技术团队主管'),
('ROLE006', 'BIZ_LEADER', '业务主管', 'Business Leader', '6', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), '业务团队主管'),
('ROLE007', 'RISK_LEADER', '风控主管', 'Risk Leader', '7', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), '风控团队主管'),
('ROLE008', 'TECH_ENGINEER', '技术工程师', 'Tech Engineer', '8', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), '技术开发人员'),
('ROLE009', 'BIZ_SPECIALIST', '业务专员', 'Business Specialist', '9', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), '业务处理专员'),
('ROLE010', 'RISK_ANALYST', '风控分析师', 'Risk Analyst', '10', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), '风险分析专员'),
('ROLE011', 'AUDITOR', '审计员', 'Auditor', '11', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), '内部审计人员'),
('ROLE012', 'GUEST', '访客', 'Guest', '12', '1', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), '临时访客账号'),
('ROLE013', 'OPERATOR', '操作员', 'Operator', '13', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), '系统操作员'),
('ROLE014', 'VIEWER', '查看者', 'Viewer', '14', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), '只读权限用户'),
('ROLE015', 'TEMP_ADMIN', '临时管理员', 'Temporary Admin', '15', '1', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), '临时管理权限');

-- 初始化用户数据 (密码: admin)
INSERT INTO user_info (user_id, login_id, password, user_name_zh, user_name_en, status, del_flag, create_by, create_org_id, create_time, update_by, update_org_id, update_time, remark)
VALUES
-- 分部管理员
('USER001', 'hzadmin', '$argon2id$v=19$m=4096,t=3,p=1$GrxWchukGBY/T1ag1oTUBA$6vEgh4D7JHlmjwytpkH2SPHaeTKNYpmIO9YLNda1+E4', '杭州管理员', 'Hangzhou Administrator', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), '杭州分部管理员'),
('USER002', 'nbadmin', '$argon2id$v=19$m=4096,t=3,p=1$GrxWchukGBY/T1ag1oTUBA$6vEgh4D7JHlmjwytpkH2SPHaeTKNYpmIO9YLNda1+E4', '宁波管理员', 'Ningbo Administrator', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), '宁波分部管理员'),
-- 支部管理员
('USER003', 'xhadmin', '$argon2id$v=19$m=4096,t=3,p=1$GrxWchukGBY/T1ag1oTUBA$6vEgh4D7JHlmjwytpkH2SPHaeTKNYpmIO9YLNda1+E4', '西湖管理员', 'Xihu Administrator', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), '西湖支部管理员'),
('USER004', 'bjadmin', '$argon2id$v=19$m=4096,t=3,p=1$GrxWchukGBY/T1ag1oTUBA$6vEgh4D7JHlmjwytpkH2SPHaeTKNYpmIO9YLNda1+E4', '滨江管理员', 'Binjiang Administrator', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), '滨江支部管理员'),
('USER005', 'hsadmin', '$argon2id$v=19$m=4096,t=3,p=1$GrxWchukGBY/T1ag1oTUBA$6vEgh4D7JHlmjwytpkH2SPHaeTKNYpmIO9YLNda1+E4', '海曙管理员', 'Haishu Administrator', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), '海曙支部管理员'),
-- 技术组成员
('USER006', 'tech001', '$argon2id$v=19$m=4096,t=3,p=1$GrxWchukGBY/T1ag1oTUBA$6vEgh4D7JHlmjwytpkH2SPHaeTKNYpmIO9YLNda1+E4', '张三', 'Zhang San', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), '高级技术工程师'),
('USER007', 'tech002', '$argon2id$v=19$m=4096,t=3,p=1$GrxWchukGBY/T1ag1oTUBA$6vEgh4D7JHlmjwytpkH2SPHaeTKNYpmIO9YLNda1+E4', '李四', 'Li Si', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), '后端开发工程师'),
('USER008', 'tech003', '$argon2id$v=19$m=4096,t=3,p=1$GrxWchukGBY/T1ag1oTUBA$6vEgh4D7JHlmjwytpkH2SPHaeTKNYpmIO9YLNda1+E4', '王五', 'Wang Wu', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), '前端开发工程师'),
('USER009', 'tech004', '$argon2id$v=19$m=4096,t=3,p=1$GrxWchukGBY/T1ag1oTUBA$6vEgh4D7JHlmjwytpkH2SPHaeTKNYpmIO9YLNda1+E4', '赵六', 'Zhao Liu', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), '测试工程师'),
('USER010', 'tech005', '$argon2id$v=19$m=4096,t=3,p=1$GrxWchukGBY/T1ag1oTUBA$6vEgh4D7JHlmjwytpkH2SPHaeTKNYpmIO9YLNda1+E4', '钱七', 'Qian Qi', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), '运维工程师'),
-- 业务组成员
('USER011', 'biz001', '$argon2id$v=19$m=4096,t=3,p=1$GrxWchukGBY/T1ag1oTUBA$6vEgh4D7JHlmjwytpkH2SPHaeTKNYpmIO9YLNda1+E4', '孙八', 'Sun Ba', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), '业务主管'),
('USER012', 'biz002', '$argon2id$v=19$m=4096,t=3,p=1$GrxWchukGBY/T1ag1oTUBA$6vEgh4D7JHlmjwytpkH2SPHaeTKNYpmIO9YLNda1+E4', '周九', 'Zhou Jiu', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), '高级业务专员'),
('USER013', 'biz003', '$argon2id$v=19$m=4096,t=3,p=1$GrxWchukGBY/T1ag1oTUBA$6vEgh4D7JHlmjwytpkH2SPHaeTKNYpmIO9YLNda1+E4', '吴十', 'Wu Shi', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), '业务专员'),
('USER014', 'biz004', '$argon2id$v=19$m=4096,t=3,p=1$GrxWchukGBY/T1ag1oTUBA$6vEgh4D7JHlmjwytpkH2SPHaeTKNYpmIO9YLNda1+E4', '郑十一', 'Zheng Shiyi', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), '客户经理'),
('USER015', 'biz005', '$argon2id$v=19$m=4096,t=3,p=1$GrxWchukGBY/T1ag1oTUBA$6vEgh4D7JHlmjwytpkH2SPHaeTKNYpmIO9YLNda1+E4', '王十二', 'Wang Shier', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), '销售经理'),
-- 风控组成员
('USER016', 'risk001', '$argon2id$v=19$m=4096,t=3,p=1$GrxWchukGBY/T1ag1oTUBA$6vEgh4D7JHlmjwytpkH2SPHaeTKNYpmIO9YLNda1+E4', '冯十三', 'Feng Shisan', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), '风控主管'),
('USER017', 'risk002', '$argon2id$v=19$m=4096,t=3,p=1$GrxWchukGBY/T1ag1oTUBA$6vEgh4D7JHlmjwytpkH2SPHaeTKNYpmIO9YLNda1+E4', '陈十四', 'Chen Shisi', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), '高级风控分析师'),
('USER018', 'risk003', '$argon2id$v=19$m=4096,t=3,p=1$GrxWchukGBY/T1ag1oTUBA$6vEgh4D7JHlmjwytpkH2SPHaeTKNYpmIO9YLNda1+E4', '褚十五', 'Chu Shiwu', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), '风控分析师'),
('USER019', 'risk004', '$argon2id$v=19$m=4096,t=3,p=1$GrxWchukGBY/T1ag1oTUBA$6vEgh4D7JHlmjwytpkH2SPHaeTKNYpmIO9YLNda1+E4', '卫十六', 'Wei Shiliu', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), '风控专员'),
('USER020', 'audit001', '$argon2id$v=19$m=4096,t=3,p=1$GrxWchukGBY/T1ag1oTUBA$6vEgh4D7JHlmjwytpkH2SPHaeTKNYpmIO9YLNda1+E4', '蒋十七', 'Jiang Shiqi', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), '内部审计师'),
-- 其他员工
('USER021', 'staff001', '$argon2id$v=19$m=4096,t=3,p=1$GrxWchukGBY/T1ag1oTUBA$6vEgh4D7JHlmjwytpkH2SPHaeTKNYpmIO9YLNda1+E4', '沈十八', 'Shen Shiba', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), '行政专员'),
('USER022', 'staff002', '$argon2id$v=19$m=4096,t=3,p=1$GrxWchukGBY/T1ag1oTUBA$6vEgh4D7JHlmjwytpkH2SPHaeTKNYpmIO9YLNda1+E4', '韩十九', 'Han Shijiu', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), '人事专员'),
('USER023', 'staff003', '$argon2id$v=19$m=4096,t=3,p=1$GrxWchukGBY/T1ag1oTUBA$6vEgh4D7JHlmjwytpkH2SPHaeTKNYpmIO9YLNda1+E4', '杨二十', 'Yang Ershi', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), '财务专员'),
('USER024', 'staff004', '$argon2id$v=19$m=4096,t=3,p=1$GrxWchukGBY/T1ag1oTUBA$6vEgh4D7JHlmjwytpkH2SPHaeTKNYpmIO9YLNda1+E4', '朱廿一', 'Zhu Nianyi', '1', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), '已停用员工'),
('USER025', 'temp001', '$argon2id$v=19$m=4096,t=3,p=1$GrxWchukGBY/T1ag1oTUBA$6vEgh4D7JHlmjwytpkH2SPHaeTKNYpmIO9YLNda1+E4', '秦廿二', 'Qin Nian\'er', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), '临时员工');

-- 初始化用户机构关联
INSERT INTO user_org (user_id, org_id, is_primary, status, del_flag, create_by, create_org_id, create_time, update_by, update_org_id, update_time, remark)
VALUES
-- 系统管理员
('admin', '000000', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
-- 分部管理员
('USER001', '100000', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('USER002', '200000', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
-- 支部管理员
('USER003', '110000', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('USER004', '120000', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('USER005', '210000', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
-- 技术组成员
('USER006', '111000', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('USER007', '111000', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('USER008', '111000', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('USER009', '111000', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('USER010', '111000', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
-- 业务组成员
('USER011', '112000', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('USER012', '112000', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('USER013', '112000', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('USER014', '112000', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('USER015', '112000', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
-- 风控组成员
('USER016', '113000', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('USER017', '113000', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('USER018', '113000', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('USER019', '113000', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
-- 其他员工 (分配到不同的支部)
('USER020', '110000', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('USER021', '110000', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('USER022', '120000', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('USER023', '120000', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('USER024', '210000', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('USER025', '100000', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null);

-- 初始化用户机构角色关联
INSERT INTO user_org_role (user_id, org_id, role_id, is_default, status, del_flag, create_by, create_org_id, create_time, update_by, update_org_id, update_time, remark)
VALUES
-- 系统管理员
('admin', '000000', 'ROLE001', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
-- 分部管理员
('USER001', '100000', 'ROLE002', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('USER002', '200000', 'ROLE002', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
-- 支部管理员
('USER003', '110000', 'ROLE003', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('USER004', '120000', 'ROLE003', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('USER005', '210000', 'ROLE003', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
-- 技术组角色
('USER006', '111000', 'ROLE005', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null), -- 技术主管
('USER007', '111000', 'ROLE008', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null), -- 技术工程师
('USER008', '111000', 'ROLE008', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null), -- 技术工程师
('USER009', '111000', 'ROLE008', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null), -- 技术工程师
('USER010', '111000', 'ROLE008', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null), -- 技术工程师
-- 业务组角色
('USER011', '112000', 'ROLE006', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null), -- 业务主管
('USER012', '112000', 'ROLE009', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null), -- 业务专员
('USER013', '112000', 'ROLE009', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null), -- 业务专员
('USER014', '112000', 'ROLE009', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null), -- 业务专员
('USER015', '112000', 'ROLE009', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null), -- 业务专员
-- 风控组角色
('USER016', '113000', 'ROLE007', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null), -- 风控主管
('USER017', '113000', 'ROLE010', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null), -- 风控分析师
('USER018', '113000', 'ROLE010', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null), -- 风控分析师
('USER019', '113000', 'ROLE010', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null), -- 风控分析师
-- 其他员工角色
('USER020', '110000', 'ROLE011', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null), -- 审计员
('USER021', '110000', 'ROLE013', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null), -- 操作员
('USER022', '120000', 'ROLE013', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null), -- 操作员
('USER023', '120000', 'ROLE004', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null), -- 普通用户
('USER024', '210000', 'ROLE014', '1', '1', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null), -- 查看者(停用)
('USER025', '100000', 'ROLE004', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null); -- 普通用户

-- 初始化菜单数据
INSERT INTO menu_info (menu_id, parent_id, menu_name_zh, menu_name_en, menu_path, menu_icon, menu_sort, status, del_flag, create_by, create_org_id, create_time, update_by, update_org_id, update_time, remark) VALUES ('M001', null, '系统管理', 'System Management', '/System', 'setting', '2', '0', '0', 'System', '000000', '2025-06-25 13:52:14', 'System', '000000', '2025-06-25 13:52:14', null);
INSERT INTO menu_info (menu_id, parent_id, menu_name_zh, menu_name_en, menu_path, menu_icon, menu_sort, status, del_flag, create_by, create_org_id, create_time, update_by, update_org_id, update_time, remark) VALUES ('M001001', 'M001', '用户管理', 'User Management', '/System/User', 'user', '1', '0', '0', 'System', '000000', '2025-06-25 13:52:14', 'System', '000000', '2025-06-25 13:52:14', null);
INSERT INTO menu_info (menu_id, parent_id, menu_name_zh, menu_name_en, menu_path, menu_icon, menu_sort, status, del_flag, create_by, create_org_id, create_time, update_by, update_org_id, update_time, remark) VALUES ('M001002', 'M001', '角色管理', 'Role Management', '/System/Role', 'idcard', '2', '0', '0', 'System', '000000', '2025-06-25 13:52:14', 'System', '000000', '2025-06-25 13:52:14', null);
INSERT INTO menu_info (menu_id, parent_id, menu_name_zh, menu_name_en, menu_path, menu_icon, menu_sort, status, del_flag, create_by, create_org_id, create_time, update_by, update_org_id, update_time, remark) VALUES ('M001003', 'M001', '菜单管理', 'Menu Management', '/System/Menu', 'menu', '3', '0', '0', 'System', '000000', '2025-06-25 13:52:14', 'System', '000000', '2025-06-25 13:52:14', null);
INSERT INTO menu_info (menu_id, parent_id, menu_name_zh, menu_name_en, menu_path, menu_icon, menu_sort, status, del_flag, create_by, create_org_id, create_time, update_by, update_org_id, update_time, remark) VALUES ('M001004', 'M001', '权限管理', 'Permission Management', '/System/Permission', 'safety', '4', '0', '0', 'System', '000000', '2025-06-25 13:52:14', 'System', '000000', '2025-06-25 13:52:14', null);
INSERT INTO menu_info (menu_id, parent_id, menu_name_zh, menu_name_en, menu_path, menu_icon, menu_sort, status, del_flag, create_by, create_org_id, create_time, update_by, update_org_id, update_time, remark) VALUES ('M001005', 'M001', '机构管理', 'Organization Management', '/System/Org', 'apartment', '5', '0', '0', 'System', '000000', '2025-06-25 13:52:14', 'System', '000000', '2025-06-25 13:52:14', null);
INSERT INTO menu_info (menu_id, parent_id, menu_name_zh, menu_name_en, menu_path, menu_icon, menu_sort, status, del_flag, create_by, create_org_id, create_time, update_by, update_org_id, update_time, remark) VALUES ('M002', null, '业务管理', 'Business Management', '/Business', 'shop', '1', '0', '0', 'System', '000000', '2025-06-25 13:52:14', 'System', '000000', '2025-06-25 13:52:14', null);
INSERT INTO menu_info (menu_id, parent_id, menu_name_zh, menu_name_en, menu_path, menu_icon, menu_sort, status, del_flag, create_by, create_org_id, create_time, update_by, update_org_id, update_time, remark) VALUES ('M002001', 'M002', '业务处理', 'Business Process', '/Business/Process', 'form', '1', '0', '0', 'System', '000000', '2025-06-25 13:52:14', 'System', '000000', '2025-06-25 13:52:14', null);
INSERT INTO menu_info (menu_id, parent_id, menu_name_zh, menu_name_en, menu_path, menu_icon, menu_sort, status, del_flag, create_by, create_org_id, create_time, update_by, update_org_id, update_time, remark) VALUES ('M002002', 'M002', '业务查询', 'Business Query', '/Business/Query', 'search', '2', '0', '0', 'System', '000000', '2025-06-25 13:52:14', 'System', '000000', '2025-06-25 13:52:14', null);

-- 初始化权限数据
INSERT INTO permission_info (permission_id, permission_key, permission_name_zh, permission_name_en, permission_group, permission_sort, status, del_flag, create_by, create_org_id, create_time, update_by, update_org_id, update_time, remark)
VALUES
-- 系统管理权限
('P001001', 'system:user:view', '用户查看', 'User View', 'SYSTEM', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('P001002', 'system:user:add', '用户新增', 'User Add', 'SYSTEM', '2', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('P001003', 'system:user:edit', '用户编辑', 'User Edit', 'SYSTEM', '3', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('P001004', 'system:user:delete', '用户删除', 'User Delete', 'SYSTEM', '4', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('P001005', 'system:user:reset', '用户重置密码', 'User Reset Password', 'SYSTEM', '5', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),

('P002001', 'system:role:view', '角色查看', 'Role View', 'SYSTEM', '11', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('P002002', 'system:role:add', '角色新增', 'Role Add', 'SYSTEM', '12', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('P002003', 'system:role:edit', '角色编辑', 'Role Edit', 'SYSTEM', '13', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('P002004', 'system:role:delete', '角色删除', 'Role Delete', 'SYSTEM', '14', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('P002005', 'system:role:assign', '角色分配权限', 'Role Assign Permission', 'SYSTEM', '15', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),

('P003001', 'system:menu:view', '菜单查看', 'Menu View', 'SYSTEM', '21', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('P003002', 'system:menu:add', '菜单新增', 'Menu Add', 'SYSTEM', '22', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('P003003', 'system:menu:edit', '菜单编辑', 'Menu Edit', 'SYSTEM', '23', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('P003004', 'system:menu:delete', '菜单删除', 'Menu Delete', 'SYSTEM', '24', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),

('P004001', 'system:permission:view', '权限查看', 'Permission View', 'SYSTEM', '31', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('P004002', 'system:permission:add', '权限新增', 'Permission Add', 'SYSTEM', '32', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('P004003', 'system:permission:edit', '权限编辑', 'Permission Edit', 'SYSTEM', '33', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('P004004', 'system:permission:delete', '权限删除', 'Permission Delete', 'SYSTEM', '34', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),

('P005001', 'system:org:view', '机构查看', 'Organization View', 'SYSTEM', '41', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('P005002', 'system:org:add', '机构新增', 'Organization Add', 'SYSTEM', '42', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('P005003', 'system:org:edit', '机构编辑', 'Organization Edit', 'SYSTEM', '43', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('P005004', 'system:org:delete', '机构删除', 'Organization Delete', 'SYSTEM', '44', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),

-- 业务管理权限
('P101001', 'business:process:view', '业务处理查看', 'Business Process View', 'BUSINESS', '101', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('P101002', 'business:process:add', '业务处理新增', 'Business Process Add', 'BUSINESS', '102', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('P101003', 'business:process:edit', '业务处理编辑', 'Business Process Edit', 'BUSINESS', '103', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('P101004', 'business:process:approve', '业务处理审批', 'Business Process Approve', 'BUSINESS', '104', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),

('P102001', 'business:query:view', '业务查询查看', 'Business Query View', 'BUSINESS', '111', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('P102002', 'business:query:export', '业务查询导出', 'Business Query Export', 'BUSINESS', '112', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null);


-- 初始化角色菜单关联
INSERT INTO role_menu (role_id, menu_id, create_by, create_org_id, create_time, update_by, update_org_id, update_time, remark)
VALUES
-- 系统管理员拥有所有菜单
('ROLE001', 'M001',  'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE001', 'M001001',  'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE001', 'M001002',  'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE001', 'M001003',  'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE001', 'M001004',  'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE001', 'M001005',  'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE001', 'M002',  'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE001', 'M002001',  'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE001', 'M002002',  'System', '000000', NOW(), 'System', '000000', NOW(), null),

-- 分部管理员拥有部分系统管理和业务管理菜单
('ROLE002', 'M001',  'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE002', 'M001001',  'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE002', 'M001002',  'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE002', 'M001005',  'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE002', 'M002',  'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE002', 'M002001',  'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE002', 'M002002',  'System', '000000', NOW(), 'System', '000000', NOW(), null),

-- 支部管理员拥有用户管理和业务管理菜单
('ROLE003', 'M001',  'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE003', 'M001001',  'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE003', 'M002',  'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE003', 'M002001',  'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE003', 'M002002',  'System', '000000', NOW(), 'System', '000000', NOW(), null),

-- 普通用户只有业务管理菜单
('ROLE004', 'M002',  'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE004', 'M002001',  'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE004', 'M002002',  'System', '000000', NOW(), 'System', '000000', NOW(), null);

-- 初始化角色权限关联
INSERT INTO role_permission (role_id, permission_id, status, del_flag, create_by, create_org_id, create_time, update_by, update_org_id, update_time, remark)
VALUES
-- 系统管理员拥有所有权限
('ROLE001', 'P001001', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE001', 'P001002', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE001', 'P001003', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE001', 'P001004', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE001', 'P001005', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE001', 'P002001', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE001', 'P002002', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE001', 'P002003', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE001', 'P002004', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE001', 'P002005', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE001', 'P003001', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE001', 'P003002', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE001', 'P003003', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE001', 'P003004', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE001', 'P004001', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE001', 'P004002', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE001', 'P004003', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE001', 'P004004', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE001', 'P005001', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE001', 'P005002', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE001', 'P005003', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE001', 'P005004', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE001', 'P101001', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE001', 'P101002', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE001', 'P101003', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE001', 'P101004', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE001', 'P102001', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE001', 'P102002', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),

-- 分部管理员权限
('ROLE002', 'P001001', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE002', 'P001002', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE002', 'P001003', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE002', 'P002001', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE002', 'P002002', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE002', 'P002003', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE002', 'P005001', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE002', 'P005002', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE002', 'P005003', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE002', 'P101001', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE002', 'P101002', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE002', 'P101003', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE002', 'P101004', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE002', 'P102001', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE002', 'P102002', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),

-- 支部管理员权限
('ROLE003', 'P001001', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE003', 'P001002', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE003', 'P001003', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE003', 'P101001', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE003', 'P101002', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE003', 'P101003', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE003', 'P102001', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE003', 'P102002', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),

-- 普通用户权限
('ROLE004', 'P101001', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE004', 'P101002', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ROLE004', 'P102001', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null);

-- 初始化常用码值数据
INSERT INTO code_library (code_type, code_value, code_name, code_desc, code_sort, status, del_flag, create_by, create_org_id, create_time, update_by, update_org_id, update_time, remark)
VALUES
-- 用户状态
('USER_STATUS', '0', '正常', '用户状态正常', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('USER_STATUS', '1', '停用', '用户状态停用', '2', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('USER_STATUS', '2', '锁定', '用户状态锁定', '3', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),

-- 机构类型
('ORG_TYPE', '1', '总部', '总部机构', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ORG_TYPE', '2', '分部', '分部机构', '2', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ORG_TYPE', '3', '支部', '支部机构', '3', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('ORG_TYPE', '4', '组', '组机构', '4', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),

-- 菜单类型
('MENU_TYPE', '1', '目录', '菜单目录', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('MENU_TYPE', '2', '菜单', '菜单页面', '2', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('MENU_TYPE', '3', '按钮', '菜单按钮', '3', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),

-- 权限分组
('PERMISSION_GROUP', 'SYSTEM', '系统管理', '系统管理权限组', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('PERMISSION_GROUP', 'BUSINESS', '业务管理', '业务管理权限组', '2', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('PERMISSION_GROUP', 'REPORT', '报表管理', '报表管理权限组', '3', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),

-- 审计操作结果
('AUDIT_RESULT', '0', '成功', '操作成功', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('AUDIT_RESULT', '1', '失败', '操作失败', '2', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),

-- 通用状态
('COMMON_STATUS', '0', '正常', '状态正常', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('COMMON_STATUS', '1', '停用', '状态停用', '2', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),

-- 是否标识
('YES_NO', '0', '否', '否', '1', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null),
('YES_NO', '1', '是', '是', '2', '0', '0', 'System', '000000', NOW(), 'System', '000000', NOW(), null);
