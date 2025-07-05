import React from 'react';
import { Drawer, Form, Input, InputNumber, Select, Button, Spin } from 'antd';
import type { FormInstance } from 'antd';
import type { RoleData } from '@/api/system/roleApi';

interface RoleOperateDrawerProps {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'view';
  currentRecord: RoleData | null;
  form: FormInstance;
  loading: boolean;
  onSubmit: () => void;
}

const RoleOperateDrawer: React.FC<RoleOperateDrawerProps> = ({
  open,
  onClose,
  mode,
  currentRecord,
  form,
  loading,
  onSubmit
}) => {
  const title = mode === 'create' ? '新增角色' : mode === 'edit' ? '编辑角色' : '查看角色';

  return (
    <Drawer
      title={title}
      width={520}
      open={open}
      onClose={onClose}
      footer={
        mode !== 'view' ? (
          <div className="flex justify-end gap-8px">
            <Button onClick={onClose}>
              取消
            </Button>
            <Button type="primary" onClick={onSubmit}>
              {mode === 'create' ? '创建' : '保存'}
            </Button>
          </div>
        ) : null
      }
    >
      <Spin spinning={loading} tip="加载中...">
        <Form
          form={form}
          layout="vertical"
          disabled={mode === 'view'}
          className="p-16px"
        >
          <Form.Item
            name="roleNameZh"
            label="角色中文名称"
            rules={[{ required: true, message: '请输入角色中文名称' }]}
          >
            <Input placeholder="请输入角色中文名称" />
          </Form.Item>
          
          <Form.Item name="roleNameEn" label="角色英文名称">
            <Input placeholder="请输入角色英文名称" />
          </Form.Item>
          
          <Form.Item
            name="roleCode"
            label="角色编码"
            rules={[{ required: true, message: '请输入角色编码' }]}
          >
            <Input placeholder="请输入角色编码" />
          </Form.Item>
          
          <Form.Item name="roleSort" label="显示排序">
            <InputNumber min={0} className="w-full" placeholder="请输入排序号" />
          </Form.Item>
          
          <Form.Item
            name="status"
            label="角色状态"
            rules={[{ required: true, message: '请选择角色状态' }]}
          >
            <Select placeholder="请选择角色状态">
              <Select.Option value="0">启用</Select.Option>
              <Select.Option value="1">停用</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item name="remark" label="角色描述">
            <Input.TextArea
              placeholder="请输入角色描述"
              rows={3}
              maxLength={200}
              showCount
            />
          </Form.Item>
          
          {mode === 'view' && (
            <>
              <Form.Item name="createTime" label="创建时间">
                <Input disabled />
              </Form.Item>
              <Form.Item name="updateTime" label="更新时间">
                <Input disabled />
              </Form.Item>
            </>
          )}
        </Form>
      </Spin>
    </Drawer>
  );
};

export default RoleOperateDrawer;