import type { PageSchema } from '@/components/ProTable/types';

// 模拟数据
let mockData = Array.from({ length: 20 }).map((_, i) => ({
    id: i + 1,
    name: `商品 ${i + 1}`,
    code: `P${String(i + 1).padStart(4, '0')}`,
    category: i % 3 === 0 ? '电子产品' : i % 3 === 1 ? '家居用品' : '服装',
    price: Math.floor(Math.random() * 1000) + 100,
    stock: Math.floor(Math.random() * 100),
    status: i % 4 === 0 ? 'offline' : 'online',
    createTime: '2025-11-20 10:00:00',
}));

// 模拟 API 延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const productSchema: PageSchema = {
    title: '商品管理',

    api: {
        listApi: async (params) => {
            await delay(500);
            console.log('List API params:', params);

            let list = [...mockData];

            // 模拟搜索
            if (params.name) {
                list = list.filter(item => item.name.includes(params.name));
            }
            if (params.category) {
                list = list.filter(item => item.category === params.category);
            }
            if (params.status) {
                list = list.filter(item => item.status === params.status);
            }

            // 模拟分页
            const page = params.pageNumber || 1;
            const size = params.pageSize || 10;
            const start = (page - 1) * size;
            const end = start + size;

            return {
                records: list.slice(start, end),
                total: list.length,
            };
        },

        getApi: async (id) => {
            await delay(300);
            return mockData.find(item => item.id === id);
        },

        createApi: async (data) => {
            await delay(500);
            const newId = Math.max(...mockData.map(d => d.id)) + 1;
            const newItem = {
                ...data,
                id: newId,
                createTime: new Date().toLocaleString(),
            };
            mockData.unshift(newItem);
            return newItem;
        },

        updateApi: async (data) => {
            await delay(500);
            const index = mockData.findIndex(d => d.id === data.id);
            if (index > -1) {
                mockData[index] = { ...mockData[index], ...data };
            }
            return mockData[index];
        },

        deleteApi: async (id) => {
            await delay(500);
            mockData = mockData.filter(d => d.id !== id);
            return true;
        },

        batchDeleteApi: async (ids) => {
            await delay(500);
            mockData = mockData.filter(d => !ids.includes(d.id));
            return true;
        }
    },

    table: {
        rowKey: 'id',
        columns: [
            {
                title: 'ID',
                dataIndex: 'id',
                width: 80,
                sorter: true,
                hideInForm: true,
            },
            {
                title: '商品名称',
                dataIndex: 'name',
                valueType: 'input',
                hideInSearch: false, // 显示在搜索栏
                formRules: [{ required: true, message: '请输入商品名称' }],
            },
            {
                title: '商品编码',
                dataIndex: 'code',
                valueType: 'input',
                hideInSearch: false, // 显示在搜索栏
                formRules: [{ required: true, message: '请输入商品编码' }],
            },
            {
                title: '分类',
                dataIndex: 'category',
                valueType: 'select',
                hideInSearch: false, // 显示在搜索栏
                options: [
                    { label: '电子产品', value: '电子产品' },
                    { label: '家居用品', value: '家居用品' },
                    { label: '服装', value: '服装' },
                ],
            },
            {
                title: '价格',
                dataIndex: 'price',
                valueType: 'number',
                render: (val: number) => `¥${val}`,
                sorter: true,
            },
            {
                title: '库存',
                dataIndex: 'stock',
                valueType: 'number',
                sorter: true,
            },
            {
                title: '状态',
                dataIndex: 'status',
                valueType: 'select',
                hideInSearch: false, // 显示在搜索栏
                options: [
                    { label: '上架', value: 'online' },
                    { label: '下架', value: 'offline' },
                ],
                render: (val: string) => val === 'online' ? '上架' : '下架',
            },
            {
                title: '创建时间',
                dataIndex: 'createTime',
                width: 180,
                hideInForm: true,
                sorter: true,
            },
        ],
        rowSelection: true,
    },
    toolbar: {
        buttons: [
            {
                text: '新增',
                type: 'primary',
                onClick: async () => {
                    console.log('新增按钮点击');
                },
            },
            {
                text: '批量删除',
                onClick: async (selectedRowKeys, selectedRows) => {
                    console.log('批量删除:', selectedRowKeys, selectedRows);
                },
                needSelection: true,
            },
            {
                text: '导出',
                onClick: async (_selectedRowKeys, selectedRows) => {
                    console.log('导出数据:', selectedRows);
                },
            },
        ],
    },
    rowActions: {
        buttons: [
            {
                text: '查看',
                onClick: (record) => {
                    console.log('查看:', record);
                },
            },
            {
                text: '编辑',
                onClick: (record) => {
                    console.log('编辑:', record);
                },
            },
            {
                text: '删除',
                onClick: (record) => {
                    console.log('删除:', record);
                },
                style: { color: '#ff4d4f' },
            },
        ],
        width: 180,
    },
};
