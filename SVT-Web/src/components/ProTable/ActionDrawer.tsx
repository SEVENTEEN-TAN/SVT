import React, { useEffect } from 'react';
import { Drawer, Form, Button, Space, Input, Select, DatePicker, InputNumber, Switch } from 'antd';
import type { TableColumn, ValueType } from './types';

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
        const type: ValueType = col.valueType || 'input';
        const options = col.formProps?.options || col.options;

        switch (type) {
            case 'select':
                inputNode = <Select placeholder={`请选择${col.title}`} options={options} />;
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
            case 'textarea':
                inputNode = <Input.TextArea rows={4} placeholder={`请输入${col.title}`} />;
                break;
            case 'password':
                inputNode = <Input.Password placeholder={`请输入${col.title}`} />;
                break;
            case 'input':
            default:
                inputNode = <Input placeholder={`请输入${col.title}`} />;
                break;
        }

        // View 模式下只展示文本
        if (isView) {
            let displayValue = initialValues?.[col.dataIndex as string];
            if (type === 'select' && options) {
                const option = options.find(opt => opt.value === displayValue);
                if (option) displayValue = option.label;
            }
            return (
                <Form.Item key={col.dataIndex as string} label={col.title as React.ReactNode}>
                    <span className="ant-form-text">{displayValue}</span>
                </Form.Item>
            );
        }

        return (
            <Form.Item
                key={col.dataIndex as string}
                name={col.dataIndex as string}
                label={col.title as React.ReactNode}
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
