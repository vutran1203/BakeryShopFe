import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Button, Typography, message, Pagination, Skeleton, Badge, Grid, Input } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import api from '../services/api';
import { addToCart } from '../utils/cart';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

const HomePage = () => {
    // --- STATE ---
    const [products, setProducts] = useState([]); // Luôn khởi tạo là mảng rỗng
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [searchTerm, setSearchTerm] = useState(""); // Lưu từ khóa tìm kiếm
    const pageSize = 8; 

    // --- HOOKS ---
    const navigate = useNavigate();
    const screens = useBreakpoint();
    const isMobile = !screens.md; // Kiểm tra màn hình nhỏ

    // --- HÀM GỌI API (ĐÃ NÂNG CẤP CHỐNG LỖI) ---
    const fetchProducts = async (page, searchKeyword = searchTerm) => {
        try {
            setLoading(true);
            
            // Xây dựng URL: Nếu có từ khóa thì thêm vào, không thì thôi
            const keywordParam = searchKeyword ? `&search=${encodeURIComponent(searchKeyword)}` : '';
            const url = `/Products?page=${page}&pageSize=${pageSize}${keywordParam}`;
            
            const response = await api.get(url);
            
            // 👇 LOGIC CHỐNG LỖI "TRẮNG TRANG" (QUAN TRỌNG)
            // Kiểm tra mọi trường hợp: data thường, Data hoa, hoặc không có gì
            const listData = response.data?.data || response.data?.Data || [];
            
            if (Array.isArray(listData)) {
                setProducts(listData);
            } else {
                // Nếu API trả về linh tinh không phải mảng -> Gán rỗng ngay
                setProducts([]); 
            }

            setTotalItems(response.data?.total || response.data?.Total || 0);

        } catch (error) {
            console.error("Lỗi tải sản phẩm:", error);
            setProducts([]); // Lỗi mạng cũng gán rỗng để không crash web
        } finally {
            setLoading(false);
        }
    };

    // --- EFFECT: GỌI KHI ĐỔI TRANG ---
    useEffect(() => {
        fetchProducts(currentPage);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage]);

    // --- HÀM XỬ LÝ ---
    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleAddToCart = (product) => {
        addToCart(product);
        message.success({
            content: `Đã thêm ${product.name} vào giỏ! 🍰`,
            style: { marginTop: '20vh' },
        });
    };

    const onSearch = (value) => {
        setSearchTerm(value); // Lưu từ khóa
        setCurrentPage(1);    // Reset về trang 1
        fetchProducts(1, value); // Gọi API ngay lập tức
    };

    // --- RENDER ---
    return (
        <div>
            {/* 1. THANH TÌM KIẾM CHO MOBILE */}
            {isMobile && (
                <div style={{ padding: '15px 20px', background: '#fff', position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <Input.Search 
                        placeholder="Bạn muốn ăn bánh gì?" 
                        onSearch={onSearch} 
                        enterButton 
                        size="large" 
                        allowClear
                    />
                </div>
            )}
            
            {/* 2. BANNER */}
            <div style={{
                background: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url("https://images.unsplash.com/photo-1509365465985-25d11c17e812?q=80&w=1920")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: isMobile ? '250px' : '400px',
                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                color: 'white', textAlign: 'center', marginBottom: '40px', borderRadius: '0 0 50% 50% / 20px'
            }}>
                <h1 style={{ fontFamily: "'Pacifico', cursive", fontSize: isMobile ? '40px' : '60px', margin: 0, textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>Bakery Love</h1>
                <p style={{ fontSize: isMobile ? '16px' : '20px', maxWidth: '600px', margin: '10px 20px' }}>Đánh thức vị giác với những chiếc bánh ngọt ngào nhất.</p>
            </div>

            <div style={{ padding: isMobile ? '0 20px 50px' : '0 50px 50px' }}>
                <Title level={2} style={{ textAlign: 'center', marginBottom: 40, color: '#434343' }}>✨ Sản phẩm nổi bật ✨</Title>

                {loading ? (
                    // LOADING SKELETON
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
                        {/* 3. DANH SÁCH SẢN PHẨM (ĐÃ BẢO VỆ CHẶT CHẼ) */}
                        {Array.isArray(products) && products.length > 0 ? (
                            <Row gutter={[24, 32]}>
                                {products.map((product, index) => {
                                    // Fallback ảnh nếu lỗi hoặc null
                                    const imageUrl = (!product.imageUrl || !product.imageUrl.startsWith('http')) 
                                        ? "https://placehold.co/300x200?text=No+Image" : product.imageUrl;
                                    
                                    const ribbonText = index % 3 === 0 ? "Best Seller" : (index % 4 === 0 ? "New" : null);
                                    const ribbonColor = index % 3 === 0 ? "red" : "green";

                                    return (
                                        <Col xs={24} sm={12} md={8} lg={6} key={product.id || index}>
                                            <motion.div
                                                initial={{ opacity: 0, y: 50 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                            >
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
                        ) : (
                            // UI KHI KHÔNG CÓ DỮ LIỆU
                            <div style={{ textAlign: 'center', padding: '50px 0' }}>
                                <p style={{ fontSize: 18, color: '#888' }}>Không tìm thấy bánh nào! 🍪</p>
                                {searchTerm && <Button onClick={() => onSearch("")}>Xóa tìm kiếm</Button>}
                            </div>
                        )}

                        {/* 4. THANH PHÂN TRANG */}
                        {totalItems > 0 && (
                            <div style={{ marginTop: 50, textAlign: 'center' }}>
                                <Pagination 
                                    current={currentPage} 
                                    total={totalItems} 
                                    pageSize={pageSize}
                                    onChange={handlePageChange}
                                    showSizeChanger={false} 
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

// --- COMPONENT CON: PRODUCT CARD ---
const ProductCard = ({ product, imageUrl, navigate, onAdd }) => (
    <Card
        hoverable
        style={{ borderRadius: 16, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}
        styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column' } }}
        cover={
            <div 
                style={{ overflow: 'hidden', height: 220, cursor: 'pointer' }}
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
        <Paragraph ellipsis={{ rows: 2 }} style={{ color: '#888', flex: 1, marginTop: 10 }}>
            {product.description || "Chưa có mô tả"}
        </Paragraph>
        
        <Button type="primary" icon={<ShoppingCartOutlined />} block size="large" onClick={() => onAdd(product)} style={{ marginTop: 10 }}>
            Thêm vào giỏ
        </Button>
    </Card>
);

export default HomePage;