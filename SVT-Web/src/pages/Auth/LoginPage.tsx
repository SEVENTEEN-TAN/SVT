import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Checkbox, Typography, message } from 'antd';
import type { ValidateErrorEntity } from 'rc-field-form/lib/interface';
import { 
  UserOutlined, 
  LockOutlined, 
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import type { LoginRequest } from '@/types/user';
import loginBg from '@/assets/login-bg.png';
import './LoginPage.css';

const { Title, Text, Paragraph } = Typography;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, isAuthenticated } = useAuthStore();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  const handleSubmit = async (values: LoginRequest) => {
    try {
      await login(values);
      messageApi.success('登录成功！即将跳转...');
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || '登录失败，请检查您的凭据';
      messageApi.error(errorMessage);
    }
  };

  const handleSubmitFailed = (errorInfo: ValidateErrorEntity<LoginRequest>) => {
    console.log('表单验证失败:', errorInfo);
  };

  return (
    <div className="login-page">
      {contextHolder}
      {/* --- 左侧面板 --- */}
      <div className="login-left">
        <div className="left-content">
          <Title level={2} className="left-title">
            欢迎来到 SVT 管理系统
          </Title>
          <Paragraph className="left-description">
            一个现代化、高效、可靠的企业级解决方案，助力您的业务增长与数字化转型。
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
              <a href="#" className="forgot-password">
                忘记密码?
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

          <div className="form-footer">
            <Text>还没有账户?</Text>{' '}
            <a 
              href="#" 
              className="signup-link"
              onClick={(e) => {
                e.preventDefault(); // 阻止默认跳转行为
                messageApi.info('请联系管理员：admin@svt.com');
              }}
            >
              联系管理员
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 