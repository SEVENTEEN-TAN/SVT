import type { PageSchema } from '@/components/ProTable/types';
import roleApi from '@/api/system/roleApi';
import { message, Modal, Tag } from 'antd';
import React from 'react';
import { PermissionEnum } from '@/constants/permissions';

export const roleSchema: PageSchema = {
    title: '角色管理',

    // API 配置
    api: {
        listApi: async (params) => {
            const { pageNumber, pageSize, ...condition } = params;
            const result = await roleApi.getRoleList({
                pageNumber,
                pageSize,
                condition,
            });
            return {
                records: result.records,
                total: result.total,
            };
        },
        getApi: async (roleId) => {
            return await roleApi.getRoleDetail(roleId as string);
        },
        createApi: async (data) => {
            await roleApi.insertOrUpdateRole(data);
        },
        updateApi: async (data) => {
            await roleApi.insertOrUpdateRole(data);
        },
        deleteApi: async (roleId) => {
            await roleApi.deleteRole(roleId as string);
        },
        batchDeleteApi: async (roleIds) => {
            await roleApi.batchDelete(roleIds as string[]);
        },
    },

    // 表格配置
    table: {
        rowKey: 'roleId',
        rowSelection: true,
        columns: [
            {
                title: '角色ID',
                dataIndex: 'roleId',
                width: 200,
                hideInForm: true,
                hideInSearch: true,
            },
            {
                title: '角色编码',
                dataIndex: 'roleCode',
                width: 150,
                valueType: 'input',
                hideInSearch: false,
                formRules: [
                    { required: true, message: '请输入角色编码' },
                    { pattern: /^[A-Z_]+$/, message: '角色编码只能包含大写字母和下划线' },
                ],
            },
            {
                title: '中文名称',
                dataIndex: 'roleNameZh',
                width: 150,
                valueType: 'input',
                hideInSearch: false,
                formRules: [
                    { required: true, message: '请输入中文名称' },
                ],
            },
            {
                title: '英文名称',
                dataIndex: 'roleNameEn',
                width: 150,
                valueType: 'input',
                hideInSearch: false,
                formRules: [
                    { required: true, message: '请输入英文名称' },
                ],
            },
            {
                title: '排序',
                dataIndex: 'roleSort',
                width: 100,
                valueType: 'number',
                formRules: [
                    { required: true, message: '请输入排序' },
                ],
                formProps: {
                    defaultValue: 0,
                },
            },
            {
                title: '状态',
                dataIndex: 'status',
                width: 100,
                valueType: 'select',
                hideInSearch: false,
                options: [
                    { label: '启用', value: '0' },
                    { label: '停用', value: '1' },
                ],
                render: (val: string) => {
                    return val === '0'
                        ? React.createElement(Tag, { color: 'green' }, '启用')
                        : React.createElement(Tag, { color: 'red' }, '停用');
                },
                formProps: {
                    defaultValue: '0',
                },
            },
            {
                title: '备注',
                dataIndex: 'remark',
                valueType: 'textarea',
                hideInTable: true,
            },
            {
                title: '创建时间',
                dataIndex: 'createTime',
                width: 180,
                hideInForm: true,
                hideInSearch: true,
            },
            {
                title: '更新时间',
                dataIndex: 'updateTime',
                width: 180,
                hideInForm: true,
                hideInSearch: true,
            },
        ],
    },

    // 工具栏按钮 (🔑 添加权限控制)
    toolbar: {
        buttons: [
            {
                text: '新增角色',
                type: 'primary',
                permission: PermissionEnum.ROLE_ADD, // 🔑 新增权限
                onClick: async () => {
                    console.log('新增角色');
                },
            },
            {
                text: '批量启用',
                permission: PermissionEnum.ROLE_EDIT, // 🔑 修改权限
                onClick: async (selectedRowKeys) => {
                    if (selectedRowKeys.length === 0) {
                        message.warning('请先选择要启用的角色');
                        return;
                    }
                    Modal.confirm({
                        title: '确认启用',
                        content: `确定要启用选中的 ${selectedRowKeys.length} 个角色吗？`,
                        onOk: async () => {
                            try {
                                await roleApi.batchUpdateStatus(selectedRowKeys as string[], '0');
                                message.success('批量启用成功');
                                window.location.reload();
                            } catch (error: any) {
                                message.error(error.message || '批量启用失败');
                            }
                        },
                    });
                },
                needSelection: true,
            },
            {
                text: '批量停用',
                permission: PermissionEnum.ROLE_EDIT, // 🔑 修改权限
                onClick: async (selectedRowKeys) => {
                    if (selectedRowKeys.length === 0) {
                        message.warning('请先选择要停用的角色');
                        return;
                    }
                    Modal.confirm({
                        title: '确认停用',
                        content: `确定要停用选中的 ${selectedRowKeys.length} 个角色吗？`,
                        onOk: async () => {
                            try {
                                await roleApi.batchUpdateStatus(selectedRowKeys as string[], '1');
                                message.success('批量停用成功');
                                window.location.reload();
                            } catch (error: any) {
                                message.error(error.message || '批量停用失败');
                            }
                        },
                    });
                },
                needSelection: true,
            },
            {
                text: '批量删除',
                permission: PermissionEnum.ROLE_DELETE, // 🔑 删除权限
                onClick: async (selectedRowKeys) => {
                    if (selectedRowKeys.length === 0) {
                        message.warning('请先选择要删除的角色');
                        return;
                    }
                    Modal.confirm({
                        title: '确认删除',
                        content: `确定要删除选中的 ${selectedRowKeys.length} 个角色吗？此操作不可恢复。`,
                        onOk: async () => {
                            try {
                                await roleApi.batchDelete(selectedRowKeys as string[]);
                                message.success('批量删除成功');
                                window.location.reload();
                            } catch (error: any) {
                                message.error(error.message || '批量删除失败');
                            }
                        },
                    });
                },
                needSelection: true,
            },
        ],
    },

    // 行操作按钮 (🔑 添加权限控制)
    rowActions: {
        buttons: [
            {
                text: '查看',
                permission: PermissionEnum.ROLE_QUERY, // 🔑 查询权限
                onClick: (record) => {
                    console.log('查看角色:', record);
                },
            },
            {
                text: '编辑',
                permission: PermissionEnum.ROLE_EDIT, // 🔑 修改权限
                onClick: (record) => {
                    console.log('编辑角色:', record);
                },
            },
            {
                text: '删除',
                permission: PermissionEnum.ROLE_DELETE, // 🔑 删除权限
                onClick: (record) => {
                    Modal.confirm({
                        title: '确认删除',
                        content: `确定要删除角色"${record.roleNameZh}"吗？此操作不可恢复。`,
                        onOk: async () => {
                            try {
                                await roleApi.deleteRole(record.roleId);
                                message.success('删除成功');
                                window.location.reload();
                            } catch (error: any) {
                                message.error(error.message || '删除失败');
                            }
                        },
                    });
                },
                style: { color: '#ff4d4f' },
            },
        ],
        width: 200,
    },
};
