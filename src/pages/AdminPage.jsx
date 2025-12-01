import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Upload, message, Popconfirm, Select, Space } from 'antd';
import { PlusOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AdminPage = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    
    // --- STATE QUẢN LÝ FILE RIÊNG (Quan trọng) ---
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
        // --- DEBUG: Kiểm tra dữ liệu trước khi gửi ---
        console.log("1. Dữ liệu Form:", values);
        console.log("2. Danh sách file:", fileList);

        try {
            const formData = new FormData();
            formData.append('Name', values.name);
            formData.append('Price', values.price);
            formData.append('Description', values.description || "");
            formData.append('CategoryId', values.categoryId);
            
            // LẤY FILE TỪ STATE fileList (Không lấy từ values.image)
            if (fileList.length > 0) {
                // Lấy file gốc
                const file = fileList[0].originFileObj;
                formData.append('ImageFile', file);
                console.log("3. Đã append file:", file.name, file.size);
            } else {
                console.warn("!!! CẢNH BÁO: Chưa chọn file hoặc fileList rỗng");
            }

            // Gửi đi (Để Axios tự xử lý Header)
            await api.post('/Products', formData);

            message.success("Thêm bánh thành công!");
            setIsModalOpen(false);
            setFileList([]); // Reset file
            fetchProducts();
        } catch (err) {
            console.error("Lỗi API:", err);
            // In chi tiết lỗi từ Server trả về
            if (err.response && err.response.data && err.response.data.errors) {
                console.log("Chi tiết lỗi Server:", err.response.data.errors);
                message.error("Lỗi: " + JSON.stringify(err.response.data.errors));
            } else {
                message.error("Thêm thất bại!");
            }
        }
    };

    // Hàm xử lý khi chọn ảnh
    const handleFileChange = ({ fileList: newFileList }) => {
        // Giữ lại file mới nhất
        setFileList(newFileList); 
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', width: 50, responsive: ['md'] },
        { title: 'Ảnh', dataIndex: 'imageUrl', render: (url) => <img src={url} alt="" style={{ width: 50, height: 50, objectFit: 'cover' }} /> },
        { title: 'Tên bánh', dataIndex: 'name' },
        { title: 'Giá', dataIndex: 'price', render: (p) => `${p.toLocaleString()} đ` },
        { title: 'Hành động', render: (_, record) => (
            <Popconfirm title="Xóa?" onConfirm={() => handleDelete(record.id)}>
                <Button danger icon={<DeleteOutlined />} size="small">Xóa</Button>
            </Popconfirm>
        )}
    ];

    return (
        <div style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2>Quản lý Sản phẩm</h2>
                <Space> 
                    <Button onClick={() => navigate('/admin/orders')}>Xem Đơn Hàng</Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>Thêm bánh mới</Button>
                </Space>
            </div>

            <Table dataSource={products} columns={columns} rowKey="id" loading={loading} />

            <Modal 
                title="Thêm bánh mới" 
                open={isModalOpen} 
                onCancel={() => setIsModalOpen(false)} 
                footer={null}
                destroyOnClose
            >
                <Form layout="vertical" onFinish={handleAddProduct}>
                    <Form.Item label="Tên bánh" name="name" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item label="Giá tiền" name="price" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item>
                    <Form.Item label="Loại bánh" name="categoryId" rules={[{ required: true }]} initialValue={categories[0]?.id}>
                        <Select>
                            {categories.map(cat => <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item label="Mô tả" name="description"><Input.TextArea /></Form.Item>

                    {/* FORM ITEM CHO UPLOAD - ĐỘC LẬP */}
                    <Form.Item label="Hình ảnh">
                        <Upload 
                            listType="picture" 
                            maxCount={1} 
                            beforeUpload={() => false} // Quan trọng: Chặn auto upload
                            fileList={fileList} // Liên kết với State
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