import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Upload, message, Popconfirm, Select, Grid, Space } from 'antd';
import { PlusOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const { useBreakpoint } = Grid;

const AdminPage = () => {
    const navigate = useNavigate();
    const screens = useBreakpoint();
    const isMobile = !screens.md;
    
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    
    // 1. STATE RIÊNG ĐỂ QUẢN LÝ FILE ẢNH (Không dùng chung với Form)
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

    // --- LOGIC THÊM MỚI (Đã sửa lại dùng State fileList) ---
    const handleAddProduct = async (values) => {
        try {
            const formData = new FormData();
            formData.append('Name', values.name);
            formData.append('Price', values.price);
            formData.append('Description', values.description || ""); // Tránh null
            formData.append('CategoryId', values.categoryId);
            
            // LẤY FILE TỪ STATE (Cách này chắc chắn 100% có file)
            if (fileList.length > 0) {
                const file = fileList[0].originFileObj;
                formData.append('ImageFile', file);
                console.log("File gửi đi:", file); // Debug xem có file chưa
            } else {
                // Nếu backend bắt buộc ảnh thì báo lỗi ở đây
                // message.error("Vui lòng chọn ảnh!"); return;
            }

            // Gửi API (Để Axios tự xử lý header)
            await api.post('/Products', formData);

            message.success("Thêm bánh thành công!");
            setIsModalOpen(false);
            setFileList([]); // Reset file sau khi thêm
            fetchProducts();
        } catch (err) {
            console.error(err);
            message.error("Thêm thất bại: " + (err.response?.data?.title || "Lỗi server"));
        }
    };

    // Xử lý khi chọn ảnh
    const handleFileChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    }

    const columns = [
        { title: 'ID', dataIndex: 'id', responsive: ['md', 'lg'] },
        { title: 'Ảnh', dataIndex: 'imageUrl', render: (url) => <img src={url} alt="" style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }} /> },
        { title: 'Tên bánh', dataIndex: 'name', width: 200 },
        { title: 'Giá', dataIndex: 'price', render: (p) => `${p.toLocaleString()} đ` },
        { title: 'Hành động', render: (_, record) => (
            <Popconfirm title="Xóa bánh này?" onConfirm={() => handleDelete(record.id)}>
                <Button danger icon={<DeleteOutlined />} size={isMobile ? "small" : "middle"}>Xóa</Button>
            </Popconfirm>
        )}
    ];

    return (
        <div style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2>Quản lý Sản phẩm</h2>
                <Space size="middle"> 
                    <Button onClick={() => navigate('/admin/orders')} size={isMobile ? "small" : "large"}>📦 Xem Đơn Hàng</Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)} size={isMobile ? "small" : "large"}>Thêm bánh mới</Button>
                </Space>
            </div>

            <Table dataSource={products} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />

            <Modal 
                title="Thêm bánh mới" 
                open={isModalOpen} 
                onCancel={() => setIsModalOpen(false)} 
                footer={null}
                destroyOnClose // Reset form khi đóng
            >
                <Form layout="vertical" onFinish={handleAddProduct}>
                    <Form.Item label="Tên bánh" name="name" rules={[{ required: true, message: 'Nhập tên bánh!' }]}><Input /></Form.Item>
                    <Form.Item label="Giá tiền" name="price" rules={[{ required: true, message: 'Nhập giá tiền!' }]}><InputNumber style={{ width: '100%' }} min={0} /></Form.Item>
                    <Form.Item label="Loại bánh" name="categoryId" rules={[{ required: true, message: 'Chọn loại bánh!' }]}>
                        <Select placeholder="Chọn loại bánh">
                            {categories.map(cat => (
                                <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item label="Mô tả" name="description"><Input.TextArea /></Form.Item>

                    {/* Form Item cho Upload - Đã tách khỏi logic Form Validation */}
                    <Form.Item label="Hình ảnh">
                        <Upload 
                            listType="picture" 
                            maxCount={1} 
                            beforeUpload={() => false}
                            fileList={fileList} // Điều khiển bằng State
                            onChange={handleFileChange}
                        >
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