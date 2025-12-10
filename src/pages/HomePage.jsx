import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Button, Typography, message, Pagination, Skeleton, Badge, Grid, Input } from 'antd';
import { FacebookOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import api from '../services/api';
import { addToCart } from '../utils/cart';
import { motion } from 'framer-motion';
import { useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

const HomePage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Mobile hiển thị nhiều hơn thì load 10 sản phẩm/trang cho đẹp
    const pageSize = 10; 

    const navigate = useNavigate();
    const location = useLocation();
    const screens = useBreakpoint();
    const isMobile = !screens.md;
    
    const { siteInfo } = useOutletContext() || {}; 

    // --- LOGIC FETCH API (Giữ nguyên) ---
  const fetchProducts = async (page, keyword, retryCount = 0) => {
    try {
        setLoading(true);

        const keywordParam = keyword ? `&search=${encodeURIComponent(keyword)}` : "";
        const bestSellerParam = keyword ? "" : "&isBestSeller=true";
        const url = `/Products?page=${page}&pageSize=${pageSize}${keywordParam}${bestSellerParam}`;
        
        const response = await api.get(url);
        const payload = response.data;

        let safeData = [];
        if (Array.isArray(payload?.data)) safeData = payload.data;
        else if (Array.isArray(payload?.Data)) safeData = payload.Data;
        else if (Array.isArray(payload)) safeData = payload;

        const safeTotal = payload?.total ?? payload?.Total ?? safeData.length;

        setProducts(safeData);
        setTotalItems(safeTotal);
    } catch (err) {
        console.error("Lỗi:", err);
        if (retryCount < 2) {
            return setTimeout(() => fetchProducts(page, keyword, retryCount + 1), 3000);
        }
    } finally {
        setLoading(false);
    }
};


    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const searchFromUrl = params.get('q') || "";
        setSearchTerm(searchFromUrl); 
        fetchProducts(currentPage, searchFromUrl);
    }, [currentPage, location.search]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const onSearch = (value) => {
        setCurrentPage(1);
        navigate(`?q=${encodeURIComponent(value)}`);
    };

    const handleAddToCart = (product) => {
        addToCart(product);
        message.success({ content: `Đã thêm ${product.name}!`, style: { marginTop: '10vh' } });
    };

    return (
        <div>
          <Helmet>
                <title>Trang Chủ - Mia Cake | Bánh Ngọt & Bánh Kem</title>
                <meta name="description" content="Mia Cake chuyên cung cấp các loại bánh kem, bánh ngọt, bánh sinh nhật ngon nhất. Giao hàng nhanh chóng." />
            </Helmet>
            {isMobile && (
                <div style={{ padding: "10px 15px", background: "#fff", position: "sticky", top: 0, zIndex: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <Input.Search placeholder="Tìm bánh..." onSearch={onSearch} enterButton allowClear size="middle" defaultValue={searchTerm} />
                </div>
            )}

            <div style={{
                background: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url("${siteInfo?.bannerUrl || 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?q=80&w=1920'}")`,
                backgroundSize: "cover", backgroundPosition: "center",
                height: isMobile ? "200px" : "400px", // Thu nhỏ banner mobile chút
                color: "white", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
                marginBottom: 30
            }}>
                <h1 style={{ fontFamily: "Pacifico", fontSize: isMobile ? 32 : 60, margin: 0 }}>
                    {siteInfo?.shopName || "Mia Cake"}
                </h1>
                <p style={{ fontSize: isMobile ? 14 : 20, textAlign: 'center', padding: '0 10px' }}>
                    {siteInfo?.slogan || "Hương vị ngọt ngào"}
                </p>
            </div>

            <div style={{ padding: isMobile ? "0 10px 50px" : "0 50px 50px" }}>
                <Title level={isMobile ? 4 : 2} style={{ textAlign: "center", marginBottom: 30 }}>
                    {searchTerm ? `Kết quả: "${searchTerm}"` : "✨ Bánh Ngon ✨"}
                </Title>

                {loading ? (
                    <Row gutter={[10, 10]}> 
                        {[...Array(6)].map((_, i) => (
                            <Col xs={12} sm={12} md={8} lg={6} key={i}>
                                <Card><Skeleton active paragraph={{ rows: 1 }} /></Card>
                            </Col>
                        ))}
                    </Row>
                ) : (
                    <>
                        {Array.isArray(products) && products.length > 0 ? (
                            // 👇 QUAN TRỌNG: Gutter nhỏ cho mobile (10px), lớn cho desktop (24px)
                            <Row gutter={isMobile ? [10, 10] : [24, 32]}>
                                {products.map((product, index) => {
                                    if (!product) return null;
                                    const imageUrl = !product.imageUrl || !product.imageUrl.startsWith("http") ? "https://placehold.co/300x200?text=No+Image" : product.imageUrl;
                                    const ribbonText = product.isBestSeller ? "Hot" : null;

                                    const card = (
                                        <ProductCard 
                                            product={product} 
                                            imageUrl={imageUrl} 
                                            navigate={navigate} 
                                            siteInfo={siteInfo}
                                            onAdd={handleAddToCart}
                                            isMobile={isMobile} // Truyền biến isMobile xuống để chỉnh CSS
                                        />
                                    );

                                    return (
                                        // 👇 SỬA Ở ĐÂY: xs={12} (2 cột) thay vì xs={24} (1 cột)
                                        <Col xs={12} sm={12} md={8} lg={6} key={product.id || index}>
                                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                                                {ribbonText ? <Badge.Ribbon text={ribbonText} color="red">{card}</Badge.Ribbon> : card}
                                            </motion.div>
                                        </Col>
                                    );
                                })}
                            </Row>
                        ) : (
                            <div style={{ textAlign: "center", padding: "50px 0", color: "#888" }}>
                                <p>Không tìm thấy bánh nào! 🍪</p>
                                {searchTerm && <Button onClick={() => onSearch("")}>Xem tất cả</Button>}
                            </div>
                        )}

                        {totalItems > 0 && (
                            <div style={{ marginTop: 40, textAlign: "center" }}>
                                <Pagination current={currentPage} total={totalItems} pageSize={pageSize} showSizeChanger={false} onChange={handlePageChange} size={isMobile ? "small" : "default"} />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

/* ==================== PRODUCT CARD (TỐI ƯU MOBILE) ==================== */
const ProductCard = ({ product, imageUrl, navigate, siteInfo, onAdd, isMobile }) => {
    
    const handleContact = (e) => {
        e.stopPropagation();
        const text = `Shop ơi, tư vấn món "${product.name}" giá ${product.price?.toLocaleString()}đ nhé!`;
        navigator.clipboard.writeText(text);
        message.success("Đã copy! Mở Messenger nha 💬");
        const link = siteInfo?.facebookUrl || siteInfo?.FacebookUrl || "https://m.me/"; 
        window.open(link, '_blank');
    };

    const handleAddToCartBtn = (e) => {
        e.stopPropagation();
        onAdd(product);
    };

    return (
        <Card
            hoverable
            style={{ 
                borderRadius: 12, overflow: "hidden", height: "100%", 
                display: "flex", flexDirection: "column",
                // Mobile thì giảm padding của Card xuống cho rộng rãi
                bodyStyle: { padding: isMobile ? '10px' : '24px' } 
            }}
            cover={
                <div style={{ height: isMobile ? 140 : 220, overflow: "hidden", cursor: "pointer" }} onClick={() => navigate(`/product/${product?.id}`)}>
                    <img src={imageUrl} alt={product?.name} 
                         style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
            }
        >
            <div style={{ flex: 1 }}>
                {/* Tên bánh: Mobile chữ nhỏ hơn */}
                <Title level={isMobile ? 5 : 4} style={{ margin: "0 0 5px 0", fontSize: isMobile ? 15 : 18, lineHeight: 1.2 }} ellipsis={{ rows: 2 }}>
                    {product?.name}
                </Title>
                
                {/* Giá tiền */}
                <Text strong style={{ color: "#d48806", fontSize: isMobile ? 15 : 18, display: 'block', marginBottom: 5 }}>
                    {product?.price?.toLocaleString()}đ
                </Text>
            </div>

            {/* Khu vực nút bấm: Mobile dùng size nhỏ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 6 : 10, marginTop: 10 }}>
                <Button 
                    type="primary" block 
                    icon={<ShoppingCartOutlined />} 
                    onClick={handleAddToCartBtn} 
                    size={isMobile ? "small" : "large"} // Mobile nút nhỏ
                    style={{ fontSize: isMobile ? 12 : 16 }}
                >
                    {isMobile ? "Thêm" : "Thêm vào giỏ"}
                </Button>

                <Button 
                    block 
                    icon={<FacebookOutlined />} 
                    onClick={handleContact} 
                    size={isMobile ? "small" : "large"} 
                    style={{ background: '#1877F2', borderColor: '#1877F2', color: '#fff', fontWeight: 600, fontSize: isMobile ? 12 : 16 }}
                >
                    {isMobile ? "Liên hệ" : "Liên hệ người bán"}
                </Button>
            </div>
        </Card>
    );
};

export default HomePage;