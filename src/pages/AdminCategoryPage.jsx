import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../services/api';

const AdminCategoryPage = () => {
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
            // Backend nhận chuỗi string name, nên gửi object { name: ... } hoặc string tùy cấu hình
            // Ở controller C# mình để [FromBody] string name -> Axios cần gửi đúng header hoặc wrap
            // Cách an toàn nhất cho .NET là gửi object DTO, nhưng để nhanh ta gửi header JSON
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

    return (
        <div style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2>Quản lý Danh mục</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
                    Thêm danh mục
                </Button>
            </div>

            <Table dataSource={categories} columns={columns} rowKey="id" loading={loading} bordered pagination={false} />

            <Modal title="Thêm danh mục mới" open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null}>
                <Form onFinish={handleAdd} layout="vertical">
                    <Form.Item name="name" label="Tên danh mục" rules={[{ required: true }]}>
                        <Input placeholder="Ví dụ: Bánh Trung Thu" />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" block>Lưu</Button>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminCategoryPage;