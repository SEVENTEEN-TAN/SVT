import React from 'react';
import { Button, Space, Popconfirm } from 'antd';
import { 
  PlusOutlined, 
  DeleteOutlined, 
  ReloadOutlined,
  CheckOutlined,
  TeamOutlined,
  SettingOutlined
} from '@ant-design/icons';
import type { RoleData } from '@/api/system/roleApi';

interface TableHeaderOperationProps {
  selectedRole: RoleData | null;
  loading: boolean;
  onAdd: () => void;
  onBatchDelete: () => void;
  onRefresh: () => void;
  onPermissionConfig?: () => void;
  onRelatedUsers?: () => void;
}

const TableHeaderOperation: React.FC<TableHeaderOperationProps> = ({
  selectedRole,
  loading,
  onAdd,
  onBatchDelete,
  onRefresh,
  onPermissionConfig,
  onRelatedUsers
}) => {
  return (
    <div className="action-buttons">
      <div className="action-buttons-left">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onAdd}
        >
          新增角色
        </Button>
        <Button
          icon={<CheckOutlined />}
          disabled={!selectedRole}
          onClick={onPermissionConfig}
        >
          权限配置
        </Button>
        <Button
          icon={<TeamOutlined />}
          disabled={!selectedRole}
          onClick={onRelatedUsers}
        >
          关联用户
        </Button>
        <Button
          danger
          icon={<DeleteOutlined />}
          disabled={!selectedRole}
          onClick={onBatchDelete}
        >
          删除
        </Button>
        <Button
          icon={<ReloadOutlined />}
          onClick={onRefresh}
        >
          刷新
        </Button>
      </div>
      {selectedRole && (
        <div className="batch-info">
          已选择角色: {selectedRole.roleNameZh}
        </div>
      )}
    </div>
  );
};

export default TableHeaderOperation;