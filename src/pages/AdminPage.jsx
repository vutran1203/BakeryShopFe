import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Upload, message, Popconfirm, Select } from 'antd';
import { PlusOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import api from '../services/api';

const AdminPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate(); // Hook chuyển trang

    // Hàm chuẩn hóa file cho Upload
    const normFile = (e) => {
        if (Array.isArray(e)) return e;
        return e?.fileList;
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            // Lấy 100 sản phẩm để Admin dễ quản lý (hoặc làm phân trang sau này)
            const res = await api.get('/Products?pageSize=100');
            
            // 👇 SỬA QUAN TRỌNG: Lấy dữ liệu từ thuộc tính .data
            setProducts(res.data.data || []); 
        } catch (err) {
            message.error("Lỗi tải danh sách bánh!");
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await api.get('/Categories');
            setCategories(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const handleDelete = async (id) => {
        try {
            await api.delete(`/Products/${id}`);
            message.success("Xóa thành công!");
            fetchProducts();
        } catch (err) {
            message.error("Xóa thất bại!");
        }
    };

    const handleAddProduct = async (values) => {
        try {
            const formData = new FormData();
            formData.append('Name', values.name);
            formData.append('Price', values.price);
            formData.append('Description', values.description);
            formData.append('CategoryId', values.categoryId);
            
            if (values.image && values.image.length > 0) {
                formData.append('ImageFile', values.image[0].originFileObj);
            }

            // Gọi API (Axios tự xử lý header multipart)
            await api.post('/Products', formData);

            message.success("Thêm bánh thành công!");
            setIsModalOpen(false);
            fetchProducts();
        } catch (err) {
            console.error(err);
            message.error("Thêm thất bại!");
        }
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', width: 50 },
        {
            title: 'Ảnh',
            dataIndex: 'imageUrl',
            render: (url) => <img src={url} alt="" style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }} />
        },
        { title: 'Tên bánh', dataIndex: 'name', width: 200 },
        { title: 'Giá', dataIndex: 'price', render: (p) => `${p.toLocaleString()} đ` },
        { title: 'Hành động', render: (_, record) => (
            <Popconfirm title="Xóa bánh này?" onConfirm={() => handleDelete(record.id)}>
                <Button danger icon={<DeleteOutlined />} size="small">Xóa</Button>
            </Popconfirm>
        )}
    ];

    return (
        <div style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2>Quản lý Sản phẩm</h2>
                <Space size="middle"> 
                {/* 1. Nút Xem Đơn Hàng */}
                <Button onClick={() => navigate('/admin/orders')} size="large">
                    📦 Xem Đơn Hàng
                </Button>
                
                {/* 2. Nút Thêm Bánh */}
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)} size="large">
                    Thêm bánh mới
                </Button>
            </Space>
            </div>

            <Table 
                dataSource={products} 
                columns={columns} 
                rowKey="id" 
                loading={loading} 
                bordered // Đã sửa lỗi warning bordered
                pagination={{ pageSize: 8 }} // Phân trang tại client cho gọn
            />

            <Modal 
                title="Thêm bánh mới" 
                open={isModalOpen} 
                onCancel={() => setIsModalOpen(false)} 
                footer={null}
            >
                <Form layout="vertical" onFinish={handleAddProduct}>
                    <Form.Item label="Tên bánh" name="name" rules={[{ required: true, message: 'Nhập tên bánh!' }]}>
                        <Input />
                    </Form.Item>
                    
                    <Form.Item label="Giá tiền" name="price" rules={[{ required: true, message: 'Nhập giá tiền!' }]}>
                        <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>
                    
                    <Form.Item label="Loại bánh" name="categoryId" rules={[{ required: true, message: 'Chọn loại bánh!' }]}>
                        <Select placeholder="Chọn loại bánh">
                            {categories.map(cat => (
                                <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item label="Mô tả" name="description">
                        <Input.TextArea />
                    </Form.Item>

                    <Form.Item 
                        label="Hình ảnh" 
                        name="image"
                        valuePropName="fileList"
                        getValueFromEvent={normFile}
                    >
                        <Upload listType="picture" maxCount={1} beforeUpload={() => false}>
                            <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                        </Upload>
                    </Form.Item>

                    <Button type="primary" htmlType="submit" block>Lưu sản phẩm</Button>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminPage;