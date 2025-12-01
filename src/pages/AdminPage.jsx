import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Upload, message, Popconfirm, Select, Space, Grid } from 'antd';
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
            {/* Header: Trên Mobile sẽ xếp dọc, trên PC xếp ngang */}
            <div style={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row', 
                justifyContent: 'space-between', 
                alignItems: isMobile ? 'flex-start' : 'center',
                marginBottom: 20,
                gap: 10 
            }}>
                <h2 style={{ margin: 0 }}>Quản lý Sản phẩm</h2>
                <Space> 
                    <Button onClick={() => navigate('/admin/orders')} size={isMobile ? "small" : "middle"}>
                        📦 Đơn Hàng
                    </Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)} size={isMobile ? "small" : "middle"}>
                        Thêm mới
                    </Button>
                </Space>
            </div>

            {/* Table: Thêm scroll x để cuộn ngang trên điện thoại */}
            <Table 
                dataSource={products} 
                columns={columns} 
                rowKey="id" 
                loading={loading} 
                pagination={{ pageSize: 8 }}
                scroll={{ x: 600 }} // <--- QUAN TRỌNG: Cho phép cuộn ngang nếu bảng quá rộng
            />

            <Modal 
                title="Thêm bánh mới" 
                open={isModalOpen} 
                onCancel={() => setIsModalOpen(false)} 
                footer={null}
                destroyOnClose
                width={isMobile ? '95%' : 520} // Modal full màn hình trên mobile
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

                    <Form.Item label="Hình ảnh">
                        <Upload 
                            listType="picture" 
                            maxCount={1} 
                            beforeUpload={() => false}
                            fileList={fileList}
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