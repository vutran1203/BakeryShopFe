import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Upload, message, Popconfirm, Select, Space, Grid, List, Card } from 'antd';
import { PlusOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const { useBreakpoint } = Grid;

const AdminPage = () => {
    const navigate = useNavigate();
    const screens = useBreakpoint();
    const isMobile = !screens.md; // Kiểm tra màn hình nhỏ

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [fileList, setFileList] = useState([]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await api.get('/Products?pageSize=100');
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
            formData.append('Description', values.description || "");
            formData.append('CategoryId', values.categoryId);
            
            if (fileList.length > 0) {
                formData.append('ImageFile', fileList[0].originFileObj);
            }

            await api.post('/Products', formData);

            message.success("Thêm bánh thành công!");
            setIsModalOpen(false);
            setFileList([]); 
            fetchProducts();
        } catch (err) {
            console.error(err);
            message.error("Thêm thất bại!");
        }
    };

    const handleFileChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    };

    // Cấu hình cột (Ẩn bớt cột trên mobile)
    const columns = [
        { 
            title: 'ID', 
            dataIndex: 'id', 
            width: 50, 
            responsive: ['md'] // Ẩn trên mobile
        },
        { 
            title: 'Ảnh', 
            dataIndex: 'imageUrl', 
            render: (url) => <img src={url} alt="" style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }} /> 
        },
        { title: 'Tên bánh', dataIndex: 'name', width: isMobile ? 120 : 200 },
        { 
            title: 'Giá', 
            dataIndex: 'price', 
            render: (p) => `${p.toLocaleString()} đ`,
            width: 100
        },
        { 
            title: 'Hành động', 
            render: (_, record) => (
                <Popconfirm title="Xóa?" onConfirm={() => handleDelete(record.id)}>
                    <Button danger icon={<DeleteOutlined />} size="small">Xóa</Button>
                </Popconfirm>
            ),
            width: 80
        }
    ];

    return (
        <div style={{ padding: isMobile ? 10 : 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0 }}>Quản lý Sản phẩm</h2>
                <Space> 
                    {!isMobile && <Button onClick={() => navigate('/admin/orders')}>📦 Đơn Hàng</Button>}
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
                        {isMobile ? 'Thêm' : 'Thêm bánh mới'}
                    </Button>
                </Space>
            </div>

            {/* 👇 LOGIC CHUYỂN ĐỔI GIAO DIỆN 👇 */}
            
            {!isMobile ? (
                // 1. GIAO DIỆN PC: Hiện Bảng (Table)
                <Table 
                    dataSource={products} 
                    columns={columns} 
                    rowKey="id" 
                    loading={loading} 
                    pagination={{ pageSize: 8 }}
                />
            ) : (
                // 2. GIAO DIỆN MOBILE: Hiện Danh sách Thẻ (List Card)
                <List
                    loading={loading}
                    dataSource={products}
                    renderItem={(item) => (
                        <List.Item>
                            <Card 
                                hoverable
                                style={{ width: '100%', borderRadius: 12, overflow: 'hidden' }}
                                bodyStyle={{ padding: 12 }}
                                actions={[
                                    <Popconfirm title="Xóa?" onConfirm={() => handleDelete(item.id)}>
                                        <Button danger type="text" icon={<DeleteOutlined />}>Xóa</Button>
                                    </Popconfirm>
                                ]}
                            >
                                <div style={{ display: 'flex', gap: 12 }}>
                                    {/* Ảnh bên trái */}
                                    <img 
                                        alt={item.name} 
                                        src={item.imageUrl} 
                                        style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }} 
                                    />
                                    
                                    {/* Thông tin bên phải */}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>
                                            {item.name}
                                        </div>
                                        <div style={{ color: '#d48806', fontWeight: 'bold' }}>
                                            {item.price.toLocaleString()} đ
                                        </div>
                                        <div style={{ fontSize: 12, color: '#888', marginTop: 4 }} className="text-truncate">
                                            {item.description || "Không có mô tả"}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </List.Item>
                    )}
                />
            )}

            {/* ... (Phần Modal giữ nguyên không đổi) ... */}
            <Modal title="Thêm bánh mới" open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} destroyOnClose width={isMobile ? '95%' : 520}>
               {/* ... Giữ nguyên Form ... */}
               <Form layout="vertical" onFinish={handleAddProduct}>
                    <Form.Item label="Tên bánh" name="name" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item label="Giá tiền" name="price" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item>
                    <Form.Item label="Loại bánh" name="categoryId" rules={[{ required: true }]} initialValue={categories[0]?.id}>
                        <Select>
                            {categories.map(cat => <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item label="Mô tả" name="description"><Input.TextArea /></Form.Item>
                    <Form.Item label="Hình ảnh">
                        <Upload listType="picture" maxCount={1} beforeUpload={() => false} fileList={fileList} onChange={handleFileChange}>
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