import React, { useEffect, useState, useCallback } from 'react';
import { Form, Input, Button, Checkbox, Typography, message, Modal, Select, Spin } from 'antd';
import type { ValidateErrorEntity } from 'rc-field-form/lib/interface';
import { 
  UserOutlined, 
  LockOutlined,
  BankOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/stores/useAuth';
import { getUserOrgList, getUserRoleList, getUserDetails } from '@/api/auth';
import type { LoginRequest } from '@/types/user';
import type { UserOrgInfo, UserRoleInfo, OrgRoleSelectForm } from '@/types/org-role';
import { appConfig, getAdminContactText } from '@/config/env';
import loginBg from '@/assets/login-bg.png';
import './LoginPage.css';

const { Title, Paragraph } = Typography;
const { Option } = Select;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const authHook = useAuth();
  const { login, logout, isLoading: loading, isAuthenticated, hasSelectedOrgRole, completeOrgRoleSelection } = authHook;
  const [form] = Form.useForm();
  const [orgRoleForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  
  const [isFormValid, setIsFormValid] = useState(false);
  
  // 机构角色选择弹窗相关状态
  const [showOrgRoleModal, setShowOrgRoleModal] = useState(false);
  const [orgRoleLoading, setOrgRoleLoading] = useState(false);
  const [roleLoading, setRoleLoading] = useState(false);
  const [orgRoleSubmitting, setOrgRoleSubmitting] = useState(false);
  const [orgList, setOrgList] = useState<UserOrgInfo[]>([]);
  const [roleList, setRoleList] = useState<UserRoleInfo[]>([]);
  const [hasError, setHasError] = useState(false);

  // 显示机构角色选择弹窗
  const showOrgRoleSelection = useCallback(async () => {
    try {
      setOrgRoleLoading(true);
      setHasError(false);
      setShowOrgRoleModal(true);

      // 清空之前的选择和角色列表
      orgRoleForm.resetFields();
      setRoleList([]);

      // 🔧 修复：动态获取token，避免依赖数组包含token导致无限循环
      let currentToken = authHook.auth.token;
      let retryCount = 0;
      const maxRetries = 10; // 最多等待1秒

      while (!currentToken && retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 100));
        currentToken = authHook.auth.token;
        retryCount++;
      }

      if (!currentToken) {
        throw new Error('无法获取认证token，请重新登录');
      }

      // 只加载机构列表
      const orgList = await getUserOrgList();
      setOrgList(orgList || []);

      // 如果只有一个机构，自动选择并加载对应的角色
      if (orgList?.length === 1 && orgList[0]?.orgId) {
        orgRoleForm.setFieldValue('orgId', orgList[0].orgId);
        // 🔧 直接调用角色加载逻辑，避免依赖handleOrgChange
        try {
          setRoleLoading(true);
          const roles = await getUserRoleList(orgList[0].orgId);
          setRoleList(roles || []);

          // 如果只有一个角色，自动选择
          if (roles?.length === 1 && roles[0]?.roleId) {
            orgRoleForm.setFieldValue('roleId', roles[0].roleId);
          }
        } catch (roleError) {
          console.error('加载角色列表失败:', roleError);
          messageApi.error('加载角色列表失败，请重试');
        } finally {
          setRoleLoading(false);
        }
      }

    } catch (error) {
      console.error('加载机构列表失败:', error);
      setHasError(true);
      messageApi.error('加载机构列表失败，将退出登录');
      // 如果加载失败，退出登录而不是跳转到dashboard
      setShowOrgRoleModal(false);
      await logout();
      navigate('/login', { replace: true });
    } finally {
      setOrgRoleLoading(false);
    }
  }, [navigate, orgRoleForm, logout, messageApi]); // 🔧 移除authHook.auth.token和handleOrgChange依赖，避免循环

  // 处理机构选择变化
  const handleOrgChange = useCallback(async (orgId: string) => {
    try {
      // 清空角色选择
      orgRoleForm.setFieldValue('roleId', undefined);
      setRoleList([]);
      
      if (!orgId) return;
      
      setRoleLoading(true);
      // 根据选择的机构加载对应的角色列表
      const roles = await getUserRoleList(orgId);
      setRoleList(roles || []);
      
      // 如果只有一个角色，自动选择
      if (roles?.length === 1 && roles[0]?.roleId) {
        orgRoleForm.setFieldValue('roleId', roles[0].roleId);
      }
    } catch (error) {
      console.error('加载角色列表失败:', error);
      messageApi.error('加载角色列表失败，请重试');
    } finally {
      setRoleLoading(false);
    }
  }, [orgRoleForm, messageApi]);

  useEffect(() => {
    // 🔧 如果用户已完整认证，直接跳转到目标页面或首页
    if (isAuthenticated && hasSelectedOrgRole) {
      const state = location.state as { from?: { pathname: string } };
      const targetPath = state?.from?.pathname || '/home';
      navigate(targetPath, { replace: true });
      return;
    }

    // 🔧 只有在登录成功但未选择机构角色时才显示弹窗
    // 这包括：1. 刚完成登录认证 2. 从受保护页面重定向过来需要选择机构角色
    if (isAuthenticated && !hasSelectedOrgRole) {
      // 添加小延迟确保token已经设置
      const timer = setTimeout(() => {
        showOrgRoleSelection();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, hasSelectedOrgRole, navigate, location.state]); // 🔧 移除showOrgRoleSelection依赖，避免循环

  const handleSubmit = async (values: LoginRequest) => {
    try {
      await login(values);



      messageApi.success('验证成功！请选择登录机构与角色....');
      // 登录成功后，useEffect会自动显示机构角色选择弹窗
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || '登录失败，请检查您的凭据';
      messageApi.error(errorMessage);
    }
  };

  const handleSubmitFailed = (errorInfo: ValidateErrorEntity<LoginRequest>) => {
    console.log('表单验证失败:', errorInfo);
  };

  // 处理机构角色选择提交
  const handleOrgRoleSubmit = async (values: OrgRoleSelectForm) => {
    try {
      setOrgRoleSubmitting(true);
      messageApi.loading('正在获取用户详情...', 0);
      
      // 获取用户详情
      const userDetails = await getUserDetails({
        orgId: values.orgId,
        roleId: values.roleId
      });
      
      // 🔧 使用新的completeOrgRoleSelection方法
      completeOrgRoleSelection(userDetails);
      
      messageApi.destroy();
      messageApi.success('即将跳转...');
      
      // 关闭弹窗并跳转到目标页面或首页
      setShowOrgRoleModal(false);
      setTimeout(() => {
        const state = location.state as { from?: { pathname: string } };
        const targetPath = state?.from?.pathname || '/home';
        navigate(targetPath, { replace: true });
      }, 1000);
      
    } catch (error) {
      messageApi.destroy();
      console.error('获取用户详情失败:', error);
      messageApi.error('获取用户详情失败，请重试');
    } finally {
      setOrgRoleSubmitting(false);
    }
  };

  // 取消机构角色选择（调用退出登录API）
  const handleOrgRoleCancel = async () => {
    try {
      setShowOrgRoleModal(false);
      // 调用退出登录API
      await logout();
      // 跳转到登录页
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('退出登录失败:', error);
      messageApi.error('退出登录失败');
    }
  };

  return (
    <div className="login-page">
      {contextHolder}
      {/* --- 左侧面板 --- */}
      <div className="login-left">
        <div className="left-content">
          <Title level={2} className="left-title">
            欢迎来到 {appConfig.appTitle}
          </Title>
          <Paragraph className="left-description">
            {appConfig.appDescription}
          </Paragraph>
          <img 
            src={loginBg}
            alt="企业管理平台插图" 
            className="illustration"
          />
        </div>
      </div>

      {/* --- 右侧面板 --- */}
      <div className="login-right">
        <div className="form-container">
          <Title level={3} className="form-title">
            账户登录
          </Title>

          <Form
            form={form}
            name="login"
            className="login-form"
            onFinish={handleSubmit}
            onFinishFailed={handleSubmitFailed}
            autoComplete="off"
            layout="vertical"
            initialValues={{ remember: false }}
            requiredMark={false}
          >
            <Form.Item
              label="用户名"
              name="loginId"
              rules={[{ required: true, message: '请输入您的用户名' }]}
            >
              <Input
                prefix={<UserOutlined className="input-icon" />}
                placeholder="用户名"
                disabled={loading}
                size="large"
                onBlur={() => {
                  form.validateFields(['loginId', 'password'])
                    .then(() => setIsFormValid(true))
                    .catch(() => setIsFormValid(false));
                }}
              />
            </Form.Item>

            <Form.Item
              label="密码"
              name="password"
              rules={[{ required: true, message: '请输入您的密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="input-icon" />}
                placeholder="密码"
                disabled={loading}
                size="large"
                onBlur={() => {
                  form.validateFields(['loginId', 'password'])
                    .then(() => setIsFormValid(true))
                    .catch(() => setIsFormValid(false));
                }}
              />
            </Form.Item>
            
            <div className="remember-section">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox className="remember-me">记住我</Checkbox>
              </Form.Item>
              <a 
                href="#" 
                className="forgot-password"
                onClick={(e) => {
                  e.preventDefault(); // 阻止默认跳转行为
                  messageApi.info(getAdminContactText());
                }}
              >
                需求帮助?
              </a>
            </div>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="login-button"
                loading={loading}
                disabled={!isFormValid || loading}
                block
                size="large"
              >
                {loading ? '登录中...' : '登 录'}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>

      {/* 机构角色选择弹窗 */}
      <Modal
        title="选择机构和角色"
        open={showOrgRoleModal}
        onCancel={handleOrgRoleCancel}
        footer={null}
        width={500}
        centered
        maskClosable={false}
        destroyOnClose
      >
        <div style={{ padding: '20px 0' }}>
          <Paragraph style={{ marginBottom: 24, color: '#666' }}>
            请选择您要登录的机构和角色，系统将为您配置相应的权限和菜单。
          </Paragraph>
          
          {orgRoleLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Spin size="large" />
              <div style={{ marginTop: 16, color: '#666' }}>正在加载机构和角色信息...</div>
            </div>
          ) : hasError ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ color: '#ff4d4f', marginBottom: 16 }}>加载失败，正在重新登录...</div>
            </div>
          ) : (
            <Form
              form={orgRoleForm}
              name="orgRoleSelect"
              onFinish={handleOrgRoleSubmit}
              layout="vertical"
              requiredMark={false}
            >
              <Form.Item
                label="选择机构"
                name="orgId"
                rules={[{ required: true, message: '请选择您的机构' }]}
              >
                <Select
                  placeholder="请选择机构"
                  size="large"
                  disabled={orgRoleSubmitting || !orgList || orgList.length === 0}
                  suffixIcon={<BankOutlined />}
                  showSearch
                  onChange={handleOrgChange}
                  filterOption={(input, option) => {
                    const label = option?.label;
                    if (typeof label === 'string') {
                      return label.toLowerCase().includes(input.toLowerCase());
                    }
                    return false;
                  }}
                >
                  {orgList?.filter(org => org && org.orgId).map(org => (
                    <Option key={org.orgId} value={org.orgId} label={org.orgNameZh}>
                      {org.orgNameZh}
                      {org.orgNameEn && org.orgNameEn !== org.orgNameZh && (
                        <span style={{ color: '#999', marginLeft: 8 }}>
                          ({org.orgNameEn})
                        </span>
                      )}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="选择角色"
                name="roleId"
                rules={[{ required: true, message: '请选择您的角色' }]}
              >
                <Select
                  placeholder={roleLoading ? "正在加载角色列表..." : (roleList.length === 0 ? "请先选择机构" : "请选择角色")}
                  size="large"
                  disabled={orgRoleSubmitting || roleList.length === 0 || roleLoading}
                  loading={roleLoading}
                  suffixIcon={<UserOutlined />}
                  showSearch
                  filterOption={(input, option) => {
                    const label = option?.label;
                    if (typeof label === 'string') {
                      return label.toLowerCase().includes(input.toLowerCase());
                    }
                    return false;
                  }}
                >
                  {roleList?.filter(role => role && role.roleId).map(role => (
                    <Option key={role.roleId} value={role.roleId} label={role.roleNameZh}>
                      {role.roleNameZh}
                      {role.roleNameEn && role.roleNameEn !== role.roleNameZh && (
                        <span style={{ color: '#999', marginLeft: 8 }}>
                          ({role.roleNameEn})
                        </span>
                      )}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item style={{ marginBottom: 0, marginTop: 32 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={orgRoleSubmitting}
                  disabled={!orgList || !roleList || orgList.length === 0 || roleList.length === 0}
                  icon={<CheckCircleOutlined />}
                  block
                  size="large"
                >
                  {orgRoleSubmitting ? '正在进入系统...' : '确认进入系统'}
                </Button>
              </Form.Item>
            </Form>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default LoginPage; 