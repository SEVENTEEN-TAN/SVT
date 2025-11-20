import React from 'react';
import { SchemaPage } from '@/components/SchemaPage';
import { roleSchema } from './schema';

/**
 * 角色管理页面
 * 
 * 使用 SchemaPage 框架快速构建 CRUD 页面
 * 
 * @returns 角色管理页面组件
 */
const RoleManagement: React.FC = () => {
  return <SchemaPage schema={roleSchema} />;
};

export default RoleManagement;
