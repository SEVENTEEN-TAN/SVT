/**
 * AES加密配置管理面板
 * 用于动态管理和监控AES加密配置
 * 
 * @author SEVENTEEN
 * @since 2025-06-17
 */

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Switch, 
  Descriptions, 
  Button, 
  Space, 
  Alert, 
  Divider,
  Tag,
  message 
} from 'antd';
import { 
  LockOutlined, 
  UnlockOutlined, 
  SettingOutlined,
  InfoCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { cryptoConfig } from '@/config/crypto';


interface CryptoConfigPanelProps {
  showAdvanced?: boolean;
  onConfigChange?: (enabled: boolean) => void;
}

const CryptoConfigPanel: React.FC<CryptoConfigPanelProps> = ({
  showAdvanced = false,
  onConfigChange
}) => {
  const [enabled, setEnabled] = useState(false);
  const [config, setConfig] = useState<any>({});
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(false);

  // 刷新配置信息
  const refreshConfig = () => {
    setLoading(true);
    try {
      const currentConfig = cryptoConfig.get();
      
      setEnabled(currentConfig.enabled);
      setConfig(currentConfig);
      setStats({ hasKey: false, keyExpiry: 0 }); // 简化stats
      
    } catch (error) {
      console.error('配置刷新失败:', error);
      message.error('配置刷新失败');
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时初始化
  useEffect(() => {
    refreshConfig();
  }, []);

  // 切换加密开关
  const handleToggle = (checked: boolean) => {
    try {
      if (checked) {
        cryptoConfig.enable();
        message.success('AES加密已启用');
      } else {
        cryptoConfig.disable();
        message.warning('AES加密已禁用');
      }
      
      setEnabled(checked);
      refreshConfig();
      
      // 通知父组件
      onConfigChange?.(checked);
      
    } catch (error) {
      console.error('开关切换失败:', error);
      message.error('开关切换失败');
    }
  };

  // 重置配置
  const handleReset = () => {
    try {
      cryptoConfig.reset();
      refreshConfig();
      message.success('配置已重置为默认值');
    } catch (error) {
      console.error('配置重置失败:', error);
      message.error('配置重置失败');
    }
  };

  // 获取状态标签
  const getStatusTag = () => {
    if (enabled) {
      return <Tag color="green" icon={<LockOutlined />}>已启用</Tag>;
    } else {
      return <Tag color="red" icon={<UnlockOutlined />}>已禁用</Tag>;
    }
  };

  return (
    <Card
      title={
        <Space>
          <SettingOutlined />
          AES加密配置
          {getStatusTag()}
        </Space>
      }
      extra={
        <Space>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={refreshConfig}
            loading={loading}
            size="small"
          >
            刷新
          </Button>
          {showAdvanced && (
            <Button 
              icon={<InfoCircleOutlined />} 
              onClick={handleReset}
              size="small"
            >
              重置
            </Button>
          )}
        </Space>
      }
      size="small"
    >
      {/* 状态警告 */}
      {!enabled && (
        <Alert
          message="AES加密已禁用"
          description="API数据将不进行加密传输，请谨慎使用"
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* 主要开关 */}
      <div style={{ marginBottom: 16 }}>
        <Space>
          <span>启用AES加密:</span>
          <Switch
            checked={enabled}
            onChange={handleToggle}
            checkedChildren="启用"
            unCheckedChildren="禁用"
            loading={loading}
          />
        </Space>
      </div>

      <Divider />

      {/* 配置详情 */}
      <Descriptions
        title="配置详情"
        size="small"
        column={2}
        bordered
      >
        <Descriptions.Item label="加密算法">
          {config.algorithm || 'AES-CBC'}
        </Descriptions.Item>
        <Descriptions.Item label="密钥长度">
          {config.keySize ? `${config.keySize * 32} 位` : '256 位'}
        </Descriptions.Item>
        <Descriptions.Item label="最大数据大小">
          {config.maxDataSize ? `${(config.maxDataSize / 1024 / 1024).toFixed(1)} MB` : '10 MB'}
        </Descriptions.Item>
        <Descriptions.Item label="时间戳容差">
          {config.timestampTolerance ? `${config.timestampTolerance / 60000} 分钟` : '10 分钟'}
        </Descriptions.Item>
        <Descriptions.Item label="密钥缓存">
          {stats.hasKey ? '已缓存' : '未缓存'}
        </Descriptions.Item>
        <Descriptions.Item label="调试模式">
          {config.debug ? '已启用' : '已禁用'}
        </Descriptions.Item>
      </Descriptions>

      {/* 高级信息 */}
      {showAdvanced && (
        <>
          <Divider />
          <Descriptions
            title="运行状态"
            size="small"
            column={1}
            bordered
          >
            <Descriptions.Item label="配置摘要">
              <code style={{ fontSize: '12px' }}>
                {cryptoConfig.getSummary()}
              </code>
            </Descriptions.Item>
            <Descriptions.Item label="密钥过期时间">
              {stats.keyExpiry > 0 
                ? new Date(stats.keyExpiry).toLocaleString()
                : '未设置'
              }
            </Descriptions.Item>
            <Descriptions.Item label="环境变量">
              <div style={{ fontSize: '12px' }}>
                <div>VITE_AES_ENABLED: {import.meta.env.VITE_AES_ENABLED || '未设置'}</div>
                <div>VITE_DEBUG: {import.meta.env.VITE_DEBUG || '未设置'}</div>
                <div>VITE_AES_KEY: {import.meta.env.VITE_AES_KEY ? '***已配置***' : '未配置'}</div>
              </div>
            </Descriptions.Item>
          </Descriptions>
        </>
      )}


    </Card>
  );
};

export default CryptoConfigPanel;

// {{CHENGQI:
// Action: Added; Timestamp: 2025-06-17 14:50:00 +08:00; Reason: 创建AES加密配置管理面板组件; Principle_Applied: SOLID-S单一职责原则,用户体验优先;
// }}