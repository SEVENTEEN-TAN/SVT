import React, { useState, useMemo } from 'react';
import { Form, Input, Select, DatePicker, InputNumber, Button, Space, Popover, Badge, theme } from 'antd';
import { SearchOutlined, ReloadOutlined, FilterOutlined } from '@ant-design/icons';
import type { SearchField, SearchFieldType } from './types';

const { RangePicker } = DatePicker;

interface SearchSectionProps {
    fields: SearchField[];
    onSearch: (values: any) => void;
    onReset: () => void;
    loading?: boolean;
}

const SearchSection: React.FC<SearchSectionProps> = ({ fields, onSearch, onReset, loading }) => {
    const [form] = Form.useForm();
    const { token } = theme.useToken();
    const [popoverOpen, setPopoverOpen] = useState(false);

    // 渲染单个表单项
    const renderFormItem = (field: SearchField) => {
        let inputNode: React.ReactNode;

        switch (field.type) {
            case 'select':
                inputNode = <Select placeholder={field.placeholder} options={field.options} allowClear />;
                break;
            case 'date':
                inputNode = <DatePicker placeholder={field.placeholder} style={{ width: '100%' }} />;
                break;
            case 'dateRange':
                inputNode = <RangePicker style={{ width: '100%' }} />;
                break;
            case 'number':
                inputNode = <InputNumber placeholder={field.placeholder} style={{ width: '100%' }} />;
                break;
            case 'custom':
                inputNode = field.render ? field.render() : null;
                break;
            case 'input':
            default:
                inputNode = <Input placeholder={field.placeholder} allowClear />;
                break;
        }

        return (
            <Form.Item
                key={field.name}
                name={field.name}
                label={field.label}
                initialValue={field.defaultValue}
                style={{ marginBottom: 0 }} // 紧凑布局
            >
                {inputNode}
            </Form.Item>
        );
    };

    // 分离可见字段和隐藏字段 (3+N 逻辑)
    const visibleFields = fields.slice(0, 3);
    const hiddenFields = fields.slice(3);
    const hasHiddenFields = hiddenFields.length > 0;

    // 计算隐藏字段中是否有值 (用于显示角标)
    const hiddenFieldsValueCount = useMemo(() => {
        const values = form.getFieldsValue();
        let count = 0;
        hiddenFields.forEach(field => {
            const value = values[field.name];
            if (value !== undefined && value !== null && value !== '') {
                count++;
            }
        });
        return count;
    }, [form, hiddenFields, popoverOpen]); // 依赖 popoverOpen 触发重新计算

    const handleSearch = () => {
        const values = form.getFieldsValue();
        onSearch(values);
        setPopoverOpen(false);
    };

    const handleReset = () => {
        form.resetFields();
        onReset();
        setPopoverOpen(false);
    };

    // 更多筛选的内容
    const moreContent = (
        <div style={{ width: 300, padding: '8px 0' }}>
            <Form
                form={form}
                layout="vertical"
                component={false} // 不创建新的 Form Context，复用外部的
            >
                {hiddenFields.map(field => (
                    <div key={field.name} style={{ marginBottom: 12 }}>
                        {renderFormItem(field)}
                    </div>
                ))}
            </Form>
        </div>
    );

    return (
        <div style={{
            background: token.colorBgContainer,
            padding: '16px 24px',
            borderRadius: token.borderRadiusLG,
            marginBottom: 16,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16
        }}>
            <Form form={form} layout="inline" style={{ flex: 1, gap: 16 }}>
                {visibleFields.map(field => renderFormItem(field))}
            </Form>

            <Space>
                {hasHiddenFields && (
                    <Popover
                        content={moreContent}
                        title="更多筛选条件"
                        trigger="click"
                        open={popoverOpen}
                        onOpenChange={setPopoverOpen}
                        placement="bottomRight"
                    >
                        <Badge count={hiddenFieldsValueCount} offset={[-2, 2]}>
                            <Button icon={<FilterOutlined />}>更多筛选</Button>
                        </Badge>
                    </Popover>
                )}
                <Button onClick={handleReset} icon={<ReloadOutlined />}>重置</Button>
                <Button type="primary" onClick={handleSearch} loading={loading} icon={<SearchOutlined />}>
                    查询
                </Button>
            </Space>
        </div>
    );
};

export default SearchSection;
