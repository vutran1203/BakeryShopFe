import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Button, Typography, Spin, message, Divider, Pagination, Select, Grid, Badge } from 'antd';
import { ShoppingCartOutlined, FilterOutlined } from '@ant-design/icons';
import api from '../services/api';
import { addToCart } from '../utils/cart';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async'; // Import Helmet

const { Title, Text } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;

const ProductsPage = () => {
    const navigate = useNavigate();
    const screens = useBreakpoint();
    const isMobile = !screens.md; 

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
            
            const data = res.data?.data || res.data?.Data || res.data || [];
            const total = res.data?.total || res.data?.Total || data.length;

            setProducts(Array.isArray(data) ? data : []);
            setTotalItems(total);
        } catch (error) {
            console.error(error);
            message.error("Lỗi tải sản phẩm");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage, selectedCategory]);

    const handleAddToCart = (e, product) => {
        e.stopPropagation();
        addToCart(product);
        message.success({ content: `Đã thêm ${product.name}!`, style: { marginTop: '10vh' } });
    };

    const goToDetail = (id) => {
        navigate(`/product/${id}`);
    };

    const handleCategoryChange = (value) => {
        setSelectedCategory(value === 'all' ? null : value);
        setCurrentPage(1);
    };

    return (
        <> {/* 👈 1. THÊM THẺ BAO (FRAGMENT) ĐỂ KHẮC PHỤC LỖI PARENT */}
            
            {/* 2. SỬA SEO CHO TRANG DANH SÁCH (Không dùng biến product ở đây) */}
            <Helmet>
                <link rel="canonical" href="https://www.miacake.me/products" />
                <title>Thực Đơn Bánh Ngọt - Mia Cake 🍰</title>
                <meta name="description" content="Khám phá thế giới bánh ngọt, bánh kem đa dạng, thơm ngon tại Mia Cake. Đặt hàng online giao ngay!" />
                <meta property="og:title" content="Thực Đơn Bánh Ngọt - Mia Cake" />
            </Helmet>

            <div style={{ padding: isMobile ? '20px 10px' : '40px 50px', maxWidth: 1200, margin: '0 auto' }}>
                
                {/* HEADER & BỘ LỌC */}
                <div style={{ textAlign: 'center', marginBottom: 30 }}>
                    <Title level={isMobile ? 3 : 2} style={{ fontFamily: 'Pacifico', marginBottom: 10 }}>
                        Thực Đơn Bánh 🍰
                    </Title>
                    <Text type="secondary" style={{ display: 'block', marginBottom: 20 }}>
                        Hương vị ngọt ngào đang chờ bạn
                    </Text>

                    <div style={{ maxWidth: 400, margin: '0 auto' }}>
                        <Select
                            defaultValue="all"
                            style={{ width: '100%', height: 45 }}
                            onChange={handleCategoryChange}
                            suffixIcon={<FilterOutlined />}
                            size="large"
                        >
                            <Option value="all">✨ Tất cả các loại bánh</Option>
                            {categories.map(cat => (
                                <Option key={cat.id} value={cat.id}>🍰 {cat.name}</Option>
                            ))}
                        </Select>
                    </div>
                </div>
                
                <Divider />

                {/* DANH SÁCH SẢN PHẨM */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>
                ) : (
                    <>
                        <Row gutter={[12, 24]}>
                            {products.map((product, index) => {
                                const imageUrl = (!product.imageUrl || !product.imageUrl.startsWith('http'))
                                    ? "https://placehold.co/300x200?text=No+Image"
                                    : product.imageUrl;

                                return (
                                    <Col xs={12} sm={12} md={8} lg={6} key={product.id}>
                                        <Badge.Ribbon text={product.isBestSeller ? "Hot" : null} color="red" style={{ display: product.isBestSeller ? 'block' : 'none' }}>
                                            <motion.div 
                                                initial={{ opacity: 0, scale: 0.9 }} 
                                                animate={{ opacity: 1, scale: 1 }} 
                                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                                style={{ height: '100%' }}
                                            >
                                                <Card
                                                    hoverable
                                                    style={{ 
                                                        borderRadius: 12, overflow: "hidden", height: '100%', 
                                                        display: 'flex', flexDirection: 'column',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                                                    }}
                                                    bodyStyle={{ padding: isMobile ? "10px" : "20px", flex: 1, display: 'flex', flexDirection: 'column' }}
                                                    onClick={() => goToDetail(product.id)}
                                                    cover={
                                                        <div style={{ height: isMobile ? 140 : 200, overflow: "hidden" }}>
                                                            <img 
                                                                src={imageUrl} alt={product.name}
                                                                style={{ width: "100%", height: "100%", objectFit: "cover", transition: 'transform 0.5s' }}
                                                                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'} 
                                                                onMouseOut={e => e.currentTarget.style.transform = 'scale(1.0)'}
                                                            />
                                                        </div>
                                                    }
                                                >
                                                    <div style={{ flex: 1 }}>
                                                        <Title level={5} style={{ fontSize: isMobile ? 14 : 16, marginBottom: 5, lineHeight: '1.3em', height: '2.6em', overflow: 'hidden' }}>
                                                            {product.name}
                                                        </Title>
                                                        <Text strong style={{ color: '#d48806', fontSize: isMobile ? 14 : 16 }}>
                                                            {product.price.toLocaleString()} đ
                                                        </Text>
                                                    </div>

                                                    <Button 
                                                        type="primary" block icon={<ShoppingCartOutlined />}
                                                        onClick={(e) => handleAddToCart(e, product)}
                                                        style={{ marginTop: 10 }}
                                                        size={isMobile ? 'small' : 'middle'}
                                                    >
                                                        {isMobile ? "Thêm" : "Thêm giỏ"}
                                                    </Button>
                                                </Card>
                                            </motion.div>
                                        </Badge.Ribbon>
                                    </Col>
                                );
                            })}
                        </Row>

                        {/* PHÂN TRANG */}
                        {totalItems > 0 && (
                            <div style={{ marginTop: 40, textAlign: 'center' }}>
                                <Pagination 
                                    current={currentPage} total={totalItems} pageSize={pageSize}
                                    onChange={(page) => setCurrentPage(page)}
                                    showSizeChanger={false}
                                    size={isMobile ? 'small' : 'default'}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </> 
    );
};

export default ProductsPage;