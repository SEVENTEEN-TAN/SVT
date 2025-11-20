import React, { useEffect } from 'react';
import { Drawer, Form, Button, Space, Input, Select, DatePicker, InputNumber, Switch } from 'antd';
import type { TableColumn, SearchFieldType } from './types';

interface ActionDrawerProps {
    open: boolean;
    mode: 'create' | 'edit' | 'view';
    title: string;
    columns: TableColumn[];
    initialValues?: any;
    loading?: boolean;
    onClose: () => void;
    onSubmit: (values: any) => void;
}

const ActionDrawer: React.FC<ActionDrawerProps> = ({
    open,
    mode,
    title,
    columns,
    initialValues,
    loading,
    onClose,
    onSubmit,
}) => {
    const [form] = Form.useForm();
    const isView = mode === 'view';

    useEffect(() => {
        if (open) {
            form.resetFields();
            if (initialValues && (mode === 'edit' || mode === 'view')) {
                form.setFieldsValue(initialValues);
            }
        }
    }, [open, mode, initialValues, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            onSubmit(values);
        } catch (error) {
            console.error('Validate Failed:', error);
        }
    };

    const renderFormItem = (col: TableColumn) => {
        if (col.hideInForm) return null;

        let inputNode: React.ReactNode;
        const type: SearchFieldType = col.formType || 'input';

        switch (type) {
            case 'select':
                // TODO: 需要支持 options 配置，目前 TableColumn 定义中尚未包含 options
                // 临时处理：如果 columns 中没有 options，需要扩展 TableColumn 定义
                inputNode = <Select placeholder={`请选择${col.title}`} />;
                break;
            case 'date':
                inputNode = <DatePicker style={{ width: '100%' }} />;
                break;
            case 'number':
                inputNode = <InputNumber style={{ width: '100%' }} />;
                break;
            case 'switch':
                inputNode = <Switch />;
                break;
            case 'input':
            default:
                inputNode = <Input placeholder={`请输入${col.title}`} />;
                break;
        }

        // View 模式下只展示文本
        if (isView) {
            return (
                <Form.Item key={col.dataIndex as string} label={col.title}>
                    <span className="ant-form-text">{initialValues?.[col.dataIndex as string]}</span>
                </Form.Item>
            );
        }

        return (
            <Form.Item
                key={col.dataIndex as string}
                name={col.dataIndex as string}
                label={col.title}
                rules={col.formRules}
                valuePropName={type === 'switch' ? 'checked' : 'value'}
            >
                {inputNode}
            </Form.Item>
        );
    };

    return (
        <Drawer
            title={`${mode === 'create' ? '新增' : mode === 'edit' ? '编辑' : '查看'}${title}`}
            width={600}
            onClose={onClose}
            open={open}
            extra={
                !isView && (
                    <Space>
                        <Button onClick={onClose}>取消</Button>
                        <Button type="primary" onClick={handleSubmit} loading={loading}>
                            提交
                        </Button>
                    </Space>
                )
            }
        >
            <Form form={form} layout="vertical" disabled={isView}>
                {columns.map(col => renderFormItem(col))}
            </Form>
        </Drawer>
    );
};

export default ActionDrawer;
