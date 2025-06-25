import React from 'react';
import { Form, Input, Select, DatePicker, Button, Row, Col, Space, Collapse } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { SearchPanelProps, SearchField } from './types';
import './SearchPanel.css';

const { RangePicker } = DatePicker;

const SearchPanel: React.FC<SearchPanelProps> = ({
  fields,
  onSearch,
  onReset,
  loading = false,
  defaultValues,
  layout = 'horizontal',
  className,
  style
}) => {
  const [form] = Form.useForm();

  // 判断是否应该显示折叠功能
  const hasMoreFields = fields.length > 4;

  // 默认展开状态
  const defaultActiveKey = ['search'];

  // 处理搜索
  const handleSearch = () => {
    form.validateFields().then((values) => {
      onSearch(values);
    });
  };

  // 处理重置
  const handleReset = () => {
    form.resetFields();
    if (onReset) {
      onReset();
    } else {
      onSearch({});
    }
  };

  // 渲染表单项
  const renderFormItem = (field: SearchField) => {
    const { name, label, type, placeholder, options, style: fieldStyle, rules, disabled } = field;

    let formControl: React.ReactNode;

    switch (type) {
      case 'input':
        formControl = (
          <Input
            placeholder={placeholder || `请输入${label}`}
            disabled={disabled}
            style={fieldStyle}
          />
        );
        break;

      case 'select':
        formControl = (
          <Select
            placeholder={placeholder || `请选择${label}`}
            disabled={disabled}
            style={fieldStyle}
            allowClear
            showSearch
            optionFilterProp="children"
          >
            {options?.map((option) => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        );
        break;

      case 'date':
        formControl = (
          <DatePicker
            placeholder={placeholder || `请选择${label}`}
            disabled={disabled}
            style={fieldStyle}
          />
        );
        break;

      case 'dateRange':
        formControl = (
          <RangePicker
            placeholder={[`开始${label}`, `结束${label}`]}
            disabled={disabled}
            style={fieldStyle}
          />
        );
        break;

      default:
        formControl = (
          <Input
            placeholder={placeholder || `请输入${label}`}
            disabled={disabled}
            style={fieldStyle}
          />
        );
    }

    return (
      <Form.Item
        key={name}
        name={name}
        label={label}
        rules={rules}
      >
        {formControl}
      </Form.Item>
    );
  };

  // 渲染搜索表单内容
  const renderSearchForm = () => (
    <Form
      form={form}
      layout={layout}
      className="search-panel-form"
      initialValues={defaultValues}
      onFinish={handleSearch}
    >
      <Row gutter={[16, 8]} align="top">
        {/* 渲染所有搜索字段 */}
        {fields.map((field) => (
          <Col
            key={field.name}
            span={6}
          >
            {renderFormItem(field)}
          </Col>
        ))}

        {/* 操作按钮 - 占据标准网格位置，内部右对齐 */}
        <Col span={6}>
          <Form.Item label=" " colon={false}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Space>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  loading={loading}
                  onClick={handleSearch}
                  size="middle"
                >
                  搜索
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleReset}
                  size="middle"
                >
                  重置
                </Button>
              </Space>
            </div>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );

  // 如果字段少于等于4个，不使用折叠面板
  if (!hasMoreFields) {
    return (
      <div className={`search-panel ${className || ''}`} style={style}>
        {renderSearchForm()}
      </div>
    );
  }

  // 使用Collapse组件
  const collapseItems = [
    {
      key: 'search',
      label: '搜索条件',
      children: renderSearchForm(),
    }
  ];

  return (
    <div className={`search-panel ${className || ''}`} style={style}>
      <Collapse
        items={collapseItems}
        defaultActiveKey={defaultActiveKey}
        size="small"
      />
    </div>
  );
};

export default SearchPanel; 