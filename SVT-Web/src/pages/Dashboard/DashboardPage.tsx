import React from 'react';
import { Card, Row, Col, Statistic, Typography, Space } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  SafetyOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/stores/authStore';

const { Title, Text } = Typography;

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div>
      {/* 欢迎区域 */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>欢迎回来，{user?.username}！</Title>
        <Text type="secondary">
          今天是 {new Date().toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
          })}
        </Text>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总用户数"
              value={1234}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="在线用户"
              value={89}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="系统状态"
              value="正常"
              prefix={<SafetyOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="服务数量"
              value={12}
              prefix={<SettingOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 快速操作 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="快速操作" extra={<a href="#">更多</a>}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div style={{ padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}>
                <Text strong>用户管理</Text>
                <br />
                <Text type="secondary">管理系统用户和权限</Text>
              </div>
              <div style={{ padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}>
                <Text strong>系统设置</Text>
                <br />
                <Text type="secondary">配置系统参数和选项</Text>
              </div>
              <div style={{ padding: '16px 0' }}>
                <Text strong>数据统计</Text>
                <br />
                <Text type="secondary">查看系统运行数据</Text>
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="系统信息" extra={<a href="#">详情</a>}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                <Text type="secondary">系统版本</Text>
                <Text>v1.0.0</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                <Text type="secondary">运行时间</Text>
                <Text>7天 12小时</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                <Text type="secondary">数据库状态</Text>
                <Text style={{ color: '#52c41a' }}>正常</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                <Text type="secondary">最后更新</Text>
                <Text>{new Date().toLocaleString('zh-CN')}</Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* 测试滚动区域 - 添加大量内容 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card title="滚动测试区域" extra={<Text type="secondary">测试内容区域滚动</Text>}>
            <div style={{ height: '800px', background: 'linear-gradient(45deg, #f0f2f5 25%, transparent 25%), linear-gradient(-45deg, #f0f2f5 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f2f5 75%), linear-gradient(-45deg, transparent 75%, #f0f2f5 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <Title level={3} style={{ color: '#1890ff' }}>这是一个高度为800px的测试区域</Title>
              <Text style={{ fontSize: '16px', marginBottom: '20px' }}>用于测试内容区域的滚动效果</Text>
              <Text type="secondary">左侧菜单和顶部导航应该保持固定</Text>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card title="更多测试内容">
            {Array.from({ length: 20 }, (_, index) => (
              <div key={index} style={{ padding: '16px 0', borderBottom: index < 19 ? '1px solid #f0f0f0' : 'none' }}>
                <Text strong>测试项目 {index + 1}</Text>
                <br />
                <Text type="secondary">这是第 {index + 1} 个测试项目，用于验证滚动效果是否正常工作。内容区域应该可以独立滚动，而左侧菜单和顶部导航保持固定位置。</Text>
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="底部测试区域" style={{ marginBottom: '50px' }}>
            <div style={{ height: '300px', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <Title level={4}>页面底部</Title>
              <Text>如果你能看到这里，说明滚动功能正常工作！</Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage; 