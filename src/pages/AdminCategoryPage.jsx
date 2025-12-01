import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, List, Card, Grid, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../services/api';

const { useBreakpoint } = Grid;
const { Text } = Typography;

const AdminCategoryPage = () => {
    const screens = useBreakpoint();
    const isMobile = !screens.md; // Kiểm tra màn hình nhỏ

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await api.get('/Categories');
            setCategories(res.data);
        } catch (err) {
            message.error("Lỗi tải danh mục!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleAdd = async (values) => {
        try {
            await api.post('/Categories', JSON.stringify(values.name), {
                headers: { 'Content-Type': 'application/json' }
            });
            message.success("Thêm thành công!");
            setIsModalOpen(false);
            fetchCategories();
        } catch (err) {
            message.error("Thêm thất bại!");
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/Categories/${id}`);
            message.success("Xóa thành công!");
            fetchCategories();
        } catch (err) {
            message.error("Xóa thất bại! (Danh mục đang chứa sản phẩm)");
        }
    };

    // --- CẤU HÌNH CHO DESKTOP (TABLE) ---
    const columns = [
        { title: 'ID', dataIndex: 'id', width: 80 },
        { title: 'Tên danh mục', dataIndex: 'name' },
        {
            title: 'Hành động',
            render: (_, record) => (
                <Popconfirm title="Xóa danh mục này?" onConfirm={() => handleDelete(record.id)}>
                    <Button danger icon={<DeleteOutlined />} size="small">Xóa</Button>
                </Popconfirm>
            )
        }
    ];

    // --- CẤU HÌNH CHO MOBILE (CARD LIST) ---
    const renderMobileItem = (item) => (
        <List.Item>
            <Card 
                hoverable
                style={{ width: '100%', borderRadius: 12 }}
                bodyStyle={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
                <div>
                    <div style={{ fontSize: 12, color: '#888' }}>ID: {item.id}</div>
                    <Text strong style={{ fontSize: 16 }}>{item.name}</Text>
                </div>
                
                <Popconfirm title="Xóa danh mục này?" onConfirm={() => handleDelete(item.id)}>
                    <Button danger icon={<DeleteOutlined />}>Xóa</Button>
                </Popconfirm>
            </Card>
        </List.Item>
    );

    return (
        <div style={{ padding: isMobile ? 10 : 20 }}>
            {/* Header Responsive */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: 20 
            }}>
                <h2 style={{ margin: 0 }}>Quản lý Danh mục</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)} size={isMobile ? "small" : "middle"}>
                    {isMobile ? 'Thêm' : 'Thêm danh mục'}
                </Button>
            </div>

            {/* Chuyển đổi giao diện Table / List */}
            {!isMobile ? (
                <Table 
                    dataSource={categories} 
                    columns={columns} 
                    rowKey="id" 
                    loading={loading} 
                    bordered 
                    pagination={{ pageSize: 8 }} 
                />
            ) : (
                <List
                    loading={loading}
                    dataSource={categories}
                    renderItem={renderMobileItem}
                    split={false}
                />
            )}

            <Modal title="Thêm danh mục mới" open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} width={isMobile ? '90%' : 520}>
                <Form onFinish={handleAdd} layout="vertical">
                    <Form.Item name="name" label="Tên danh mục" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
                        <Input placeholder="Ví dụ: Bánh Trung Thu" />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" block>Lưu</Button>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminCategoryPage;