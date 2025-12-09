import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Upload, message, Popconfirm, Select, Space, Grid, List, Card, Typography, Checkbox } from 'antd';
import { PlusOutlined, DeleteOutlined, UploadOutlined, EditOutlined } from '@ant-design/icons';
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
    const [fileList, setFileList] = useState([]);
    
    // State xác định xem đang ở chế độ Thêm hay Sửa
    const [editingProduct, setEditingProduct] = useState(null); 
    
    const [form] = Form.useForm(); // Hook quản lý form

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

    // --- 1. HÀM MỞ MODAL ĐỂ SỬA ---
    const handleOpenEditModal = (product) => {
        setEditingProduct(product); // Lưu lại sản phẩm đang sửa
        setIsModalOpen(true);
        setFileList([]); // Reset file upload
        
        // Điền dữ liệu cũ vào Form
        form.setFieldsValue({
            name: product.name,
            price: product.price,
            categoryId: product.categoryId,
            description: product.description,
            isBestSeller: product.isBestSeller
        });
    };

    // --- 2. HÀM MỞ MODAL ĐỂ THÊM MỚI ---
    const handleOpenAddModal = () => {
        setEditingProduct(null); // Đặt về null để biết là đang thêm mới
        setIsModalOpen(true);
        setFileList([]);
        form.resetFields(); // Xóa trắng form
    };

    // --- 3. HÀM LƯU (XỬ LÝ CẢ THÊM VÀ SỬA) ---
    const handleSaveProduct = async (values) => {
        try {
            const formData = new FormData();
            
            // Append các trường cơ bản
            formData.append('Name', values.name);
            formData.append('Price', values.price);
            formData.append('CategoryId', values.categoryId);
            
            // Xử lý mô tả: Nếu null/undefined thì gửi chuỗi rỗng
            formData.append('Description', values.description || "");
            formData.append('IsBestSeller', values.isBestSeller || false);
            
            // Xử lý ảnh: Chỉ gửi nếu người dùng chọn ảnh mới
            if (fileList.length > 0) {
                formData.append('ImageFile', fileList[0].originFileObj);
            }

            if (editingProduct) {
                // === LOGIC SỬA (PUT) ===
                formData.append('Id', editingProduct.id); // Quan trọng: Gửi kèm ID
                await api.put(`/Products/${editingProduct.id}`, formData);
                message.success("Cập nhật thành công!");
            } else {
                // === LOGIC THÊM (POST) ===
                await api.post('/Products', formData);
                message.success("Thêm bánh thành công!");
            }

            // Dọn dẹp sau khi lưu xong
            setIsModalOpen(false);
            setFileList([]); 
            fetchProducts(); // Tải lại danh sách
        } catch (err) {
            console.error(err);
            message.error("Có lỗi xảy ra, vui lòng thử lại!");
        }
    };

    const handleFileChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    };

    // Cấu hình cột cho PC
    const columns = [
        { title: 'ID', dataIndex: 'id', width: 50, responsive: ['md'] },
        { 
            title: 'Ảnh', 
            dataIndex: 'imageUrl', 
            render: (url) => <img src={url} alt="" style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }} /> 
        },
        { title: 'Tên bánh', dataIndex: 'name', width: isMobile ? 120 : 200 },
        { title: 'Giá', dataIndex: 'price', render: (p) => `${p.toLocaleString()} đ`, width: 100 },
        { 
            title: 'Hành động', 
            width: 120,
            render: (_, record) => (
                <Space>
                    <Button 
                        icon={<EditOutlined />} 
                        onClick={() => handleOpenEditModal(record)} 
                        type="default"
                    >
                        Sửa
                    </Button>
                    <Popconfirm title="Xóa bánh này?" onConfirm={() => handleDelete(record.id)}>
                        <Button danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: isMobile ? 10 : 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0 }}>Quản lý Sản phẩm</h2>
                <Space> 
                    {!isMobile && <Button onClick={() => navigate('/admin/orders')}>📦 Đơn Hàng</Button>}
                    {/* 👇 Sửa onClick thành handleOpenAddModal */}
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenAddModal}>
                        {isMobile ? 'Thêm' : 'Thêm bánh mới'}
                    </Button>
                </Space>
            </div>

            {/* 👇 LOGIC CHUYỂN ĐỔI GIAO DIỆN 👇 */}
            {!isMobile ? (
                // 1. GIAO DIỆN PC
                <Table 
                    dataSource={products} 
                    columns={columns} 
                    rowKey="id" 
                    loading={loading} 
                    pagination={{ pageSize: 8 }}
                />
            ) : (
                // 2. GIAO DIỆN MOBILE
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
                                    // 👇 Thêm nút Sửa cho Mobile
                                    <Button type="text" icon={<EditOutlined />} onClick={() => handleOpenEditModal(item)}>Sửa</Button>,
                                    <Popconfirm title="Xóa?" onConfirm={() => handleDelete(item.id)}>
                                        <Button danger type="text" icon={<DeleteOutlined />}>Xóa</Button>
                                    </Popconfirm>
                                ]}
                            >
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <img 
                                        alt={item.name} 
                                        src={item.imageUrl} 
                                        style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }} 
                                    />
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

            {/* 👇 MODAL CHUNG CHO THÊM VÀ SỬA 👇 */}
            <Modal 
                title={editingProduct ? "Cập nhật sản phẩm" : "Thêm bánh mới"} 
                open={isModalOpen} 
                onCancel={() => setIsModalOpen(false)} 
                footer={null} 
                destroyOnClose 
                width={isMobile ? '95%' : 520}
            >
                <Form 
                    form={form} // 👇 Quan trọng: Gắn biến form vào đây
                    layout="vertical" 
                    onFinish={handleSaveProduct} // 👇 Gọi hàm Save chung
                >
                    <Form.Item label="Tên bánh" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
                        <Input />
                    </Form.Item>
                    
                    <Form.Item label="Giá tiền" name="price" rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}>
                        <InputNumber style={{ width: '100%' }} min={0} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/\$\s?|(,*)/g, '')} />
                    </Form.Item>
                    
                    <Form.Item label="Loại bánh" name="categoryId" rules={[{ required: true, message: 'Vui lòng chọn loại bánh!' }]}>
                        <Select placeholder="Chọn loại bánh">
                            {categories.map(cat => (
                                <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    
                    <Form.Item label="Mô tả" name="description">
                        <Input.TextArea rows={3} />
                    </Form.Item>

                    <Form.Item name="isBestSeller" valuePropName="checked">
    <Checkbox>"Best Seller (Hiển thị trên Home)" </Checkbox>
</Form.Item>
                    
                    <Form.Item label={editingProduct ? "Thay đổi hình ảnh (Để trống nếu giữ ảnh cũ)" : "Hình ảnh"}>
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
                    
                    <Button type="primary" htmlType="submit" block size="large">
                        {editingProduct ? "Lưu thay đổi" : "Thêm sản phẩm"}
                    </Button>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminPage;