import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Button, Typography, Spin, message, Rate, Pagination, Skeleton, Badge } from 'antd'; // Thêm Pagination
import { ShoppingCartOutlined } from '@ant-design/icons';
import api from '../services/api';
import { addToCart } from '../utils/cart';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

const HomePage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // --- State cho phân trang ---
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const pageSize = 8; // Mỗi trang hiện 8 cái bánh
    // ----------------------------
    const navigate = useNavigate();

    const fetchProducts = async (page) => {
        try {
            setLoading(true);
            // Gọi API kèm tham số page và pageSize
            const response = await api.get(`/Products?page=${page}&pageSize=${pageSize}`);
            
            // Backend giờ trả về { Data: [], Total: ... } nên phải .Data
            setProducts(response.data.data || response.data); 
            setTotalItems(response.data.total || 0);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Khi trang load hoặc số trang thay đổi -> Gọi lại API
    useEffect(() => {
        fetchProducts(currentPage);
    }, [currentPage]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        // Cuộn lên đầu trang cho mượt
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleAddToCart = (product) => {
        addToCart(product);
        message.success({
            content: `Đã thêm ${product.name} vào giỏ! 🍰`,
            style: { marginTop: '20vh' },
        });
    };

    return (
        <div>
            {/* Banner giữ nguyên */}
            <div style={{
                background: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url("https://images.unsplash.com/photo-1509365465985-25d11c17e812?q=80&w=1920")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '400px',
                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                color: 'white', textAlign: 'center', marginBottom: '40px', borderRadius: '0 0 50% 50% / 20px'
            }}>
                <h1 style={{ fontFamily: "'Pacifico', cursive", fontSize: '60px', margin: 0, textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>Bakery Love</h1>
                <p style={{ fontSize: '20px', maxWidth: '600px', margin: '10px 20px' }}>Đánh thức vị giác với những chiếc bánh ngọt ngào nhất.</p>
            </div>

            <div style={{ padding: '0 50px 50px' }}>
                <Title level={2} style={{ textAlign: 'center', marginBottom: 40, color: '#434343' }}>✨ Sản phẩm nổi bật ✨</Title>

                {loading ? (
                    <Row gutter={[24, 32]}>
                        {[...Array(8)].map((_, i) => (
                            <Col xs={24} sm={12} md={8} lg={6} key={i}>
                                <Card style={{ borderRadius: 16 }}>
                                    <Skeleton.Image active style={{ width: '100%', height: 200 }} />
                                    <Skeleton active paragraph={{ rows: 2 }} style={{ marginTop: 20 }} />
                                </Card>
                            </Col>
                        ))}
                    </Row>
                ) : (
                    <>
                        <Row gutter={[24, 32]}>
                            {products.map((product, index) => {
                                const imageUrl = (!product.imageUrl || !product.imageUrl.startsWith('http')) 
                                    ? "https://placehold.co/300x200?text=No+Image" : product.imageUrl;
                                
                                // Random nhãn dán cho sinh động
                                const ribbonText = index % 3 === 0 ? "Best Seller" : (index % 4 === 0 ? "New" : null);
                                const ribbonColor = index % 3 === 0 ? "red" : "green";

                                return (
                                    <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                                        <motion.div
                                            initial={{ opacity: 0, y: 50 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5, delay: index * 0.1 }}
                                        >
                                            {/* 2. Badge Ribbon (Nhãn dán) */}
                                            {ribbonText ? (
                                                <Badge.Ribbon text={ribbonText} color={ribbonColor}>
                                                    <ProductCard 
                                                        product={product} 
                                                        imageUrl={imageUrl} 
                                                        navigate={navigate} 
                                                        onAdd={handleAddToCart} 
                                                    />
                                                </Badge.Ribbon>
                                            ) : (
                                                <ProductCard 
                                                    product={product} 
                                                    imageUrl={imageUrl} 
                                                    navigate={navigate} 
                                                    onAdd={handleAddToCart} 
                                                />
                                            )}
                                        </motion.div>
                                    </Col>
                                );
                            })}
                        </Row>

                        {/* --- THANH PHÂN TRANG Ở DƯỚI CÙNG --- */}
                        <div style={{ marginTop: 50, textAlign: 'center' }}>
                            <Pagination 
                                current={currentPage} 
                                total={totalItems} 
                                pageSize={pageSize}
                                onChange={handlePageChange}
                                showSizeChanger={false} // Tắt chọn số lượng/trang cho gọn
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

// Tách nhỏ component Card ra cho code gọn
const ProductCard = ({ product, imageUrl, navigate, onAdd }) => (
    <Card
        hoverable
        style={{ borderRadius: 16, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}
        styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column' } }}
        cover={
            <div 
                style={{ overflow: 'hidden', height: 220, cursor: 'pointer' }}
                // 👇 Bây giờ nó đã hiểu navigate là gì rồi
                onClick={() => navigate(`/product/${product.id}`)} 
            >
                <img alt={product.name} src={imageUrl} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} 
                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'} 
                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1.0)'}
                />
            </div>
        }
    >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Title level={4} style={{ margin: 0, fontSize: 18 }} ellipsis>{product.name}</Title>
            <Text strong style={{ color: '#d48806', fontSize: 18 }}>{product.price.toLocaleString()}đ</Text>
        </div>
        <Paragraph ellipsis={{ rows: 2 }} style={{ color: '#888', flex: 1, marginTop: 10 }}>{product.description}</Paragraph>
        
        <Button type="primary" icon={<ShoppingCartOutlined />} block size="large" onClick={() => onAdd(product)} style={{ marginTop: 10 }}>
            Thêm vào giỏ
        </Button>
    </Card>
);

export default HomePage;