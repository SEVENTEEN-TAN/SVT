import React from 'react';
import { Button } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import type { UserInfo } from '../../shared/types/layout';
import { STYLES } from '../../shared/utils/layoutUtils';

interface UserDropdownProps {
  user?: UserInfo | null;
  onLogout: () => void;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ user, onLogout }) => {
  return (
    <div style={STYLES.USER_DROPDOWN.container}>
      {/* 用户信息区域 */}
      <div style={STYLES.USER_DROPDOWN.content}>
        <div style={STYLES.USER_DROPDOWN.infoRow}>
          <div style={STYLES.USER_DROPDOWN.infoItem}>
            <span style={STYLES.USER_DROPDOWN.label}>机构：</span>
            <span style={STYLES.USER_DROPDOWN.value}>
              {user?.orgNameZh || '未知机构'}
            </span>
          </div>
          <div style={STYLES.USER_DROPDOWN.infoItemLast}>
            <span style={STYLES.USER_DROPDOWN.label}>角色：</span>
            <span style={STYLES.USER_DROPDOWN.value}>
              {user?.roleNameZh || '未知角色'}
            </span>
          </div>
        </div>
      </div>

      {/* 退出按钮 */}
      <Button
        type="primary"
        danger
        block
        icon={<LogoutOutlined />}
        onClick={onLogout}
        style={STYLES.USER_DROPDOWN.button}
      >
        退出登录
      </Button>
    </div>
  );
};

export default UserDropdown; 