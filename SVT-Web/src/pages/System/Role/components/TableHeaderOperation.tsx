import React from 'react';
import { Button } from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  CheckOutlined,
  TeamOutlined
} from '@ant-design/icons';
import type { RoleData } from '@/api/system/roleApi';
import Permission from '@/components/Permission';

interface TableHeaderOperationProps {
  selectedRole: RoleData | null;
  loading: boolean;
  onAdd: () => void;
  onBatchDelete: () => void;
  onPermissionConfig?: () => void;
  onRelatedUsers?: () => void;
}

const TableHeaderOperation: React.FC<TableHeaderOperationProps> = ({
  selectedRole,
  onAdd,
  onBatchDelete,
  onPermissionConfig,
  onRelatedUsers
}) => {
  return (
    <div className="action-buttons">
      <div className="action-buttons-left">
        <Permission perm="system:role:add">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onAdd}
          >
            新增角色
          </Button>
        </Permission>
        <Permission perm="system:role:perm">
          <Button
            icon={<CheckOutlined />}
            disabled={!selectedRole}
            onClick={onPermissionConfig}
          >
            权限配置
          </Button>
        </Permission>
        <Permission perm="system:role:user">
          <Button
            icon={<TeamOutlined />}
            disabled={!selectedRole}
            onClick={onRelatedUsers}
          >
            关联用户
          </Button>
        </Permission>
        <Permission perm="system:role:delete">
          <Button
            danger
            icon={<DeleteOutlined />}
            disabled={!selectedRole}
            onClick={onBatchDelete}
          >
            删除
          </Button>
        </Permission>
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