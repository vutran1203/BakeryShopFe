import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Button, Typography, message, Pagination, Skeleton, Badge, Grid, Input } from 'antd';
import { FacebookOutlined, ShoppingCartOutlined } from '@ant-design/icons'; // Import đủ 2 icon
import api from '../services/api';
import { addToCart } from '../utils/cart'; // Nhớ import hàm này
import { motion } from 'framer-motion';
import { useNavigate, useLocation, useOutletContext } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

const HomePage = () => {
    // --- STATE ---
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const pageSize = 8;

    // --- HOOKS ---
    const navigate = useNavigate();
    const location = useLocation();
    const screens = useBreakpoint();
    const isMobile = !screens.md;
    
    // Lấy thông tin Website từ MainLayout
    const { siteInfo } = useOutletContext() || {}; 

    // --- 1. LOGIC GỌI API ---
    const fetchProducts = async (page, keyword) => {
        try {
            setLoading(true);
            const keywordParam = keyword ? `&search=${encodeURIComponent(keyword)}` : "";
            const url = `/Products?page=${page}&pageSize=${pageSize}${keywordParam}`;
            
            const response = await api.get(url);
            const payload = response.data;

            // Logic an toàn dữ liệu
            let safeData = [];
            if (payload?.data && Array.isArray(payload.data)) safeData = payload.data;
            else if (payload?.Data && Array.isArray(payload.Data)) safeData = payload.Data;
            else if (Array.isArray(payload)) safeData = payload;

            const safeTotal = payload?.total ?? payload?.Total ?? safeData.length;

            setProducts(safeData);
            setTotalItems(safeTotal);
        } catch (err) {
            console.error("Fetch error:", err);
            setProducts([]); 
        } finally {
            setLoading(false);
        }
    };

    // --- 2. TRIGGER API ---
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const searchFromUrl = params.get('q') || params.get('search') || "";
        setSearchTerm(searchFromUrl); 
        fetchProducts(currentPage, searchFromUrl);
    }, [currentPage, location.search]);

    // --- 3. HÀM XỬ LÝ ---
    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const onSearch = (value) => {
        setCurrentPage(1);
        navigate(`?q=${encodeURIComponent(value)}`);
    };

    // Hàm thêm vào giỏ (Đã khôi phục)
    const handleAddToCart = (product) => {
        addToCart(product);
        message.success({
            content: `Đã thêm ${product.name} vào giỏ! 🍰`,
            style: { marginTop: '20vh' },
        });
    };

    // --- 4. RENDER GIAO DIỆN ---
    return (
        <div>
            {/* MOBILE SEARCH */}
            {isMobile && (
                <div style={{ padding: "15px 20px", background: "#FFFAE6", position: "sticky", top: 0, zIndex: 10 }}>
                    <Input.Search
                        placeholder="Bạn muốn ăn bánh gì?"
                        onSearch={onSearch}
                        enterButton allowClear size="large"
                        defaultValue={searchTerm}
                    />
                </div>
            )}

            {/* BANNER */}
            <div style={{
                background: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url("${siteInfo?.bannerUrl || 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?q=80&w=1920'}")`,
                backgroundSize: "cover", backgroundPosition: "center",
                height: isMobile ? "250px" : "400px",
                color: "white", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
                marginBottom: 40
            }}>
                <h1 style={{ fontFamily: "Pacifico", fontSize: isMobile ? 40 : 60 }}>
                    {siteInfo?.shopName || "Bakery Love"}
                </h1>
                <p style={{ fontSize: isMobile ? 16 : 20 }}>
                    {siteInfo?.slogan || "Đánh thức vị giác với những chiếc bánh ngọt ngào nhất."}
                </p>
            </div>

            {/* DANH SÁCH SẢN PHẨM */}
            <div style={{ padding: isMobile ? "0 20px 50px" : "0 50px 50px" }}>
                <Title level={2} style={{ textAlign: "center", marginBottom: 40 }}>
                    {searchTerm ? `Kết quả cho: "${searchTerm}"` : "✨ Sản phẩm nổi bật ✨"}
                </Title>

                {loading ? (
                    <Row gutter={[24, 32]}>
                        {[...Array(8)].map((_, i) => (
                            <Col xs={24} sm={12} md={8} lg={6} key={i}>
                                <Card style={{ borderRadius: 16 }}><Skeleton active /></Card>
                            </Col>
                        ))}
                    </Row>
                ) : (
                    <>
                        {Array.isArray(products) && products.length > 0 ? (
                            <Row gutter={[24, 32]}>
                                {products.map((product, index) => {
                                    if (!product) return null;

                                    const imageUrl = !product.imageUrl || !product.imageUrl.startsWith("http")
                                            ? "https://placehold.co/300x200?text=No+Image" : product.imageUrl;

                                    const ribbonText = product.isBestSeller ? "Best Seller" : null;
                                    
                                    const card = (
                                        <ProductCard 
                                            product={product} 
                                            imageUrl={imageUrl} 
                                            navigate={navigate} 
                                            siteInfo={siteInfo}
                                            onAdd={handleAddToCart} // 👇 Truyền hàm thêm giỏ hàng xuống
                                        />
                                    );

                                    return (
                                        <Col xs={24} sm={12} md={8} lg={6} key={product.id || index}>
                                            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
                                                {ribbonText ? <Badge.Ribbon text={ribbonText} color="red">{card}</Badge.Ribbon> : card}
                                            </motion.div>
                                        </Col>
                                    );
                                })}
                            </Row>
                        ) : (
                            <div style={{ textAlign: "center", padding: "50px 0" }}>
                                <p style={{ fontSize: 18, color: "#888" }}>Không tìm thấy bánh nào! 🍪</p>
                                {searchTerm && <Button onClick={() => onSearch("")}>Xem tất cả</Button>}
                            </div>
                        )}

                        {totalItems > 0 && (
                            <div style={{ marginTop: 50, textAlign: "center" }}>
                                <Pagination
                                    current={currentPage} total={totalItems} pageSize={pageSize}
                                    showSizeChanger={false} onChange={handlePageChange}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

/* ==================== PRODUCT CARD (CÓ CẢ 2 NÚT) ==================== */
const ProductCard = ({ product, imageUrl, navigate, siteInfo, onAdd }) => {
    
    const handleContact = (e) => {
        e.stopPropagation();
        const text = `Chào shop 👋, mình muốn mua bánh "${product.name}" giá ${product.price?.toLocaleString()}đ. Tư vấn giúp mình nhé!`;
        navigator.clipboard.writeText(text);
        Modal.success({
  title: "Đã copy đơn hàng!",
  content: "Dán vào Messenger nhé 💬",
  centered: true,
  okText: "OK"
});
        const link = siteInfo?.facebookUrl; 
        

        setTimeout(() => {
        window.open(link, '_blank'); // Mở Messenger
    }, 1000); // Delay 1 giây để user thấy thông báo
    };

    // Hàm xử lý thêm vào giỏ (chặn sự kiện click vào thẻ)
    const handleAddToCartBtn = (e) => {
        e.stopPropagation();
        onAdd(product);
    };

    return (
        <Card
            hoverable
            style={{ borderRadius: 16, overflow: "hidden", height: "100%", display: "flex", flexDirection: "column" }}
            cover={
                <div style={{ height: 220, overflow: "hidden", cursor: "pointer" }} onClick={() => navigate(`/product/${product?.id}`)}>
                    <img src={imageUrl} alt={product?.name} 
                         style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }} 
                         onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'} 
                         onMouseOut={e => e.currentTarget.style.transform = 'scale(1.0)'} />
                </div>
            }
        >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Title level={4} style={{ margin: 0, fontSize: 18 }} ellipsis>{product?.name}</Title>
                <Text strong style={{ color: "#d48806", fontSize: 18 }}>{product?.price?.toLocaleString()}đ</Text>
            </div>
            
            <Paragraph ellipsis={{ rows: 2 }} style={{ color: "#888", marginTop: 10, flex: 1 }}>
                {product?.description || "Chưa có mô tả"}
            </Paragraph>

            {/* 👇 KHU VỰC 2 NÚT BẤM 👇 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 15 }}>
                
                {/* 1. NÚT THÊM VÀO GIỎ (Màu vàng thương hiệu) */}
                <Button 
                    type="primary" 
                    block 
                    icon={<ShoppingCartOutlined />} 
                    onClick={handleAddToCartBtn} 
                    size="large"
                >
                    Thêm vào giỏ
                </Button>

                {/* 2. NÚT LIÊN HỆ FB (Màu xanh Facebook) */}
                <Button 
                    block 
                    icon={<FacebookOutlined />} 
                    onClick={handleContact} 
                    size="large" 
                    style={{ background: '#1877F2', borderColor: '#1877F2', color: '#fff', fontWeight: 600 }}
                >
                    Liên hệ người bán 
                    
                </Button>
            </div>
        </Card>
    );
};

export default HomePage;