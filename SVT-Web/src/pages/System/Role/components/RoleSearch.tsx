import React, { memo, useState, useMemo } from 'react';
import { Form, Input, Select, Row, Col, Button, Flex, Popover, Badge } from 'antd';
import { SearchOutlined, ReloadOutlined, FilterOutlined, FilterFilled } from '@ant-design/icons';
import type { FormInstance } from 'antd';
import type { RoleConditionDTO } from '@/api/system/roleApi';

interface RoleSearchProps {
  form: FormInstance<RoleConditionDTO>;
  searchParams: RoleConditionDTO;
  onSearch: () => void;
  onReset: () => void;
}

const RoleSearch: React.FC<RoleSearchProps> = memo(({
  form,
  searchParams,
  onSearch,
  onReset
}) => {
  const [advancedFilterVisible, setAdvancedFilterVisible] = useState(false);

  // 检查是否有高级筛选条件
  const hasAdvancedFilters = useMemo(() => {
    const values = form.getFieldsValue();
    return !!(values.roleNameEn || values.roleId);
  }, [form]);

  // 高级筛选内容
  const AdvancedFilterContent = () => (
    <div style={{ width: 300, padding: '16px' }}>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}>
        <span style={{ width: 60, textAlign: 'right', marginRight: 8, fontSize: 14, color: '#262626', fontWeight: 500 }}>英文名称</span>
        <Form.Item name="roleNameEn" style={{ margin: 0, flex: 1 }}>
          <Input
            placeholder="请输入英文名称"
            onPressEnter={onSearch}
          />
        </Form.Item>
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ width: 60, textAlign: 'right', marginRight: 8, fontSize: 14, color: '#262626', fontWeight: 500 }}>角色ID</span>
        <Form.Item name="roleId" style={{ margin: 0, flex: 1 }}>
          <Input
            placeholder="请输入角色ID"
            onPressEnter={onSearch}
          />
        </Form.Item>
      </div>
    </div>
  );

  return (
    <Form
      form={form}
      className="search-form-inline"
      initialValues={searchParams}
      labelCol={{
        md: 7,
        span: 5
      }}
    >
      <Row
        wrap
        gutter={[16, 16]}
        align="middle"
      >
        {/* 搜索字段1 - 角色名称 */}
        <Col
          xxl={6}
          xl={6}
          lg={6}
          md={6}
          sm={12}
          span={24}
        >
          <Form.Item
            className="m-0"
            label="角色名称"
            name="roleNameZh"
          >
            <Input
              placeholder="请输入角色名称"
              onPressEnter={onSearch}
            />
          </Form.Item>
        </Col>

        {/* 搜索字段2 - 角色编码 */}
        <Col
          xxl={6}
          xl={6}
          lg={6}
          md={6}
          sm={12}
          span={24}
        >
          <Form.Item
            className="m-0"
            label="角色编码"
            name="roleCode"
          >
            <Input
              placeholder="请输入角色编码"
              onPressEnter={onSearch}
            />
          </Form.Item>
        </Col>

        {/* 搜索字段3 - 状态 */}
        <Col
          xxl={6}
          xl={6}
          lg={6}
          md={6}
          sm={12}
          span={24}
        >
          <Form.Item
            className="m-0"
            label="状态"
            name="status"
          >
            <Select
              allowClear
              placeholder="请选择状态"
            >
              <Select.Option value="0">启用</Select.Option>
              <Select.Option value="1">停用</Select.Option>
            </Select>
          </Form.Item>
        </Col>

        {/* 按钮组区域 - 右对齐，占满剩余空间 */}
        <Col
          xxl={6}
          xl={6}
          lg={6}
          md={6}
          sm={24}
          span={24}
        >
          <Form.Item className="m-0">
            <Flex
              align="center"
              gap={12}
              justify="end"
            >
              <Popover
                content={<AdvancedFilterContent />}
                trigger="click"
                placement="bottomRight"
                open={advancedFilterVisible}
                onOpenChange={setAdvancedFilterVisible}
                overlayClassName="advanced-filter-popover"
              >
                <Button
                  icon={hasAdvancedFilters ? <FilterFilled /> : <FilterOutlined />}
                  type={hasAdvancedFilters ? "primary" : "default"}
                >
                  更多筛选
                  {hasAdvancedFilters && <Badge dot style={{ marginLeft: 4 }} />}
                </Button>
              </Popover>
              <Button
                  icon={<ReloadOutlined />}
                  onClick={onReset}
              >
                重置
              </Button>
              <Button
                  ghost
                  icon={<SearchOutlined />}
                  type="primary"
                  onClick={onSearch}
              >
                搜索
              </Button>
            </Flex>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
});

RoleSearch.displayName = 'RoleSearch';

export default RoleSearch;