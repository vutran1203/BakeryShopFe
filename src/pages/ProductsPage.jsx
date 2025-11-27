import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Button, Typography, Spin, message, Divider, Pagination, Menu } from 'antd';
import { ShoppingCartOutlined, AppstoreOutlined } from '@ant-design/icons';
import api from '../services/api';
import { addToCart } from '../utils/cart';
import { useNavigate } from 'react-router-dom'; // 1. Đảm bảo đã import cái này

const { Title, Text } = Typography;
const { Meta } = Card;

const ProductsPage = () => {
    const navigate = useNavigate(); // 2. Khởi tạo hook chuyển trang
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState(null);
    
    const pageSize = 12;

    useEffect(() => {
        api.get('/Categories').then(res => setCategories(res.data));
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            let url = `/Products?page=${currentPage}&pageSize=${pageSize}`;
            if (selectedCategory) url += `&categoryId=${selectedCategory}`;

            const res = await api.get(url);
            setProducts(res.data.data || []); 
            setTotalItems(res.data.total || 0);
        } catch (error) {
            console.error(error);
            message.error("Lỗi tải sản phẩm");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [currentPage, selectedCategory]);

    const handleAddToCart = (e, product) => {
        e.stopPropagation(); // Ngăn không cho sự kiện click xuyên qua Card (tránh vừa thêm giỏ vừa chuyển trang)
        addToCart(product);
        message.success(`Đã thêm ${product.name} vào giỏ!`);
    };

    // Hàm chuyển sang trang chi tiết
    const goToDetail = (id) => {
        navigate(`/product/${id}`);
    };

    const handleCategoryClick = (e) => {
        const key = e.key === 'all' ? null : e.key;
        setSelectedCategory(key);
        setCurrentPage(1);
    };

    const menuItems = [
        { label: 'Tất cả bánh', key: 'all', icon: <AppstoreOutlined /> },
        ...categories.map(cat => ({ label: cat.name, key: cat.id }))
    ];

    return (
        <div style={{ padding: '40px 50px' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <Title level={2}>Thực Đơn</Title>
                <Text type="secondary">Chọn loại bánh bạn yêu thích</Text>
            </div>
            
            <Divider />

            <Row gutter={32}>
                <Col xs={24} md={6} lg={5}>
                    <Card title="Danh mục" bordered={false} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <Menu 
                            mode="inline" 
                            selectedKeys={[selectedCategory ? String(selectedCategory) : 'all']}
                            onClick={handleCategoryClick}
                            items={menuItems}
                            style={{ border: 'none' }}
                        />
                    </Card>
                </Col>

                <Col xs={24} md={18} lg={19}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>
                    ) : (
                        <>
                            <Row gutter={[24, 32]}>
                                {products.length === 0 ? (
                                    <div style={{ width: '100%', textAlign: 'center', marginTop: 50, color: '#999' }}>
                                        Chưa có bánh nào thuộc loại này 🍰
                                    </div>
                                ) : products.map((product) => {
                                    const imageUrl = (!product.imageUrl || !product.imageUrl.startsWith('http')) 
                                        ? "https://placehold.co/300x200?text=No+Image" : product.imageUrl;

                                    return (
                                        <Col xs={24} sm={12} lg={8} key={product.id}>
                                            <Card
                                                hoverable
                                                style={{ borderRadius: 16, overflow: 'hidden', cursor: 'pointer' }} // Thêm cursor pointer
                                                // 3. Sự kiện Click vào cả cái Card để chuyển trang
                                                onClick={() => goToDetail(product.id)}
                                                cover={
                                                    <div style={{ overflow: 'hidden', height: 200 }}>
                                                        <img alt={product.name} src={imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} 
                                                            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'} 
                                                            onMouseOut={e => e.currentTarget.style.transform = 'scale(1.0)'}
                                                        />
                                                    </div>
                                                }
                                                actions={[
                                                    // Nút thêm giỏ hàng (đã chặn nổi bọt sự kiện)
                                                    <Button type="text" block icon={<ShoppingCartOutlined />} onClick={(e) => handleAddToCart(e, product)}>
                                                        Thêm vào giỏ
                                                    </Button>
                                                ]}
                                            >
                                                <Meta
                                                    title={product.name}
                                                    description={<Text strong style={{ color: '#d48806' }}>{product.price.toLocaleString()} đ</Text>}
                                                />
                                            </Card>
                                        </Col>
                                    );
                                })}
                            </Row>

                            <div style={{ marginTop: 50, textAlign: 'center' }}>
                                <Pagination 
                                    current={currentPage} total={totalItems} pageSize={pageSize}
                                    onChange={(page) => {
                                        setCurrentPage(page);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    showSizeChanger={false}
                                />
                            </div>
                        </>
                    )}
                </Col>
            </Row>
        </div>
    );
};

export default ProductsPage;