import React, { memo } from 'react';
import { Form, Input, Select, Row, Col, Button, Flex } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
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
      >
        <Col
          lg={6}
          md={12}
          span={24}
        >
          <Form.Item
            className="m-0"
            label="角色名称"
            name="roleNameZh"
          >
            <Input placeholder="请输入角色名称" />
          </Form.Item>
        </Col>
        <Col
          lg={6}
          md={12}
          span={24}
        >
          <Form.Item
            className="m-0"
            label="角色编码"
            name="roleCode"
          >
            <Input placeholder="请输入角色编码" />
          </Form.Item>
        </Col>
        <Col
          lg={6}
          md={12}
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
        <Col
          lg={6}
          md={12}
          span={24}
        >
          <Form.Item className="m-0">
            <Flex
              align="center"
              gap={12}
              justify="end"
            >
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