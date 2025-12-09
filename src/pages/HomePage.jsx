import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Button, Typography, message, Pagination, Skeleton, Badge, Grid, Input } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import api from '../services/api';
import { addToCart } from '../utils/cart';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

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

    // --- 1. LOGIC GỌI API (Đã được kiểm chứng qua màn hình Debug) ---
    const fetchProducts = async (page, keyword) => {
        try {
            setLoading(true);

            // Xử lý từ khóa
            const keywordParam = keyword ? `&search=${encodeURIComponent(keyword)}` : "";
            const url = `/Products?page=${page}&pageSize=${pageSize}${keywordParam}`;
            
            console.log("Fetching URL:", url);

            const response = await api.get(url);
            const payload = response.data; // Đây là cục { data: [...], total: ... }

            // 👇 LOGIC TRÍCH XUẤT DỮ LIỆU AN TOÀN (GIỐNG CODE DEBUG)
            let safeData = [];
            
            if (payload?.data && Array.isArray(payload.data)) {
                // Trường hợp chuẩn: payload.data là mảng
                safeData = payload.data;
            } else if (payload?.Data && Array.isArray(payload.Data)) {
                // Trường hợp chữ hoa: payload.Data là mảng
                safeData = payload.Data;
            } else if (Array.isArray(payload)) {
                // Trường hợp trả về mảng trực tiếp
                safeData = payload;
            } else {
                // Trường hợp không có dữ liệu
                safeData = [];
            }

            const safeTotal = payload?.total ?? payload?.Total ?? safeData.length;

            setProducts(safeData);
            setTotalItems(safeTotal);

        } catch (err) {
            console.error("Fetch error:", err);
            setProducts([]); // Nếu lỗi mạng, gán rỗng để không crash
        } finally {
            setLoading(false);
        }
    };

    // --- 2. TRIGGER API KHI URL THAY ĐỔI ---
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        // Ưu tiên đọc tham số 'q', dự phòng 'search'
        const searchFromUrl = params.get('q') || params.get('search') || "";
        
        setSearchTerm(searchFromUrl); 
        fetchProducts(currentPage, searchFromUrl);
        
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const handleAddToCart = (product) => {
        addToCart(product);
        message.success({
            content: `Đã thêm ${product?.name} vào giỏ!`,
            style: { marginTop: "20vh" },
        });
    };

    // --- 4. RENDER GIAO DIỆN ---
    return (
        <div>
            {/* Dòng chữ xác nhận phiên bản mới */}
            <h1 style={{color: 'green', textAlign: 'center', fontSize: 12}}>V4 - FINAL STABLE</h1>

            {/* THANH TÌM KIẾM MOBILE */}
            {isMobile && (
                <div style={{ padding: "15px 20px", background: "#fff", position: "sticky", top: 0, zIndex: 10 }}>
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
                background: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url("https://images.unsplash.com/photo-1509365465985-25d11c17e812?q=80&w=1920")',
                backgroundSize: "cover", backgroundPosition: "center",
                height: isMobile ? "250px" : "400px",
                color: "white", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
                marginBottom: 40
            }}>
                <h1 style={{ fontFamily: "Pacifico", fontSize: isMobile ? 40 : 60 }}>Bakery Love</h1>
                <p style={{ fontSize: isMobile ? 16 : 20 }}>Đánh thức vị giác với những chiếc bánh ngọt ngào nhất.</p>
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
                        {/* CHỈ RENDER KHI products LÀ MẢNG (AN TOÀN TUYỆT ĐỐI) */}
                        {Array.isArray(products) && products.length > 0 ? (
                            <Row gutter={[24, 32]}>
                                {products.map((product, index) => {
                                    if (!product) return null; // Bỏ qua nếu null

                                    const imageUrl = !product.imageUrl || !product.imageUrl.startsWith("http")
                                            ? "https://placehold.co/300x200?text=No+Image" : product.imageUrl;

                                    const ribbonText = index % 3 === 0 ? "Best Seller" : (index % 4 === 0 ? "New" : null);
                                    const ribbonColor = index % 3 === 0 ? "red" : "green";

                                    const card = (
                                        <ProductCard product={product} imageUrl={imageUrl} navigate={navigate} onAdd={handleAddToCart} />
                                    );

                                    return (
                                        <Col xs={24} sm={12} md={8} lg={6} key={product.id || index}>
                                            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
                                                {ribbonText ? <Badge.Ribbon text={ribbonText} color={ribbonColor}>{card}</Badge.Ribbon> : card}
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

                        {/* PHÂN TRANG */}
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

// COMPONENT CARD
const ProductCard = ({ product, imageUrl, navigate, onAdd }) => (
    <Card
        hoverable
        style={{ borderRadius: 16, overflow: "hidden", height: "100%", display: "flex", flexDirection: "column" }}
        cover={
            <div style={{ height: 220, overflow: "hidden", cursor: "pointer" }} onClick={() => navigate(`/product/${product?.id}`)}>
                <img src={imageUrl} alt={product?.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }} 
                     onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'} 
                     onMouseOut={e => e.currentTarget.style.transform = 'scale(1.0)'} />
            </div>
        }
    >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Title level={4} style={{ margin: 0, fontSize: 18 }} ellipsis>{product?.name || "Bánh ngon"}</Title>
            <Text strong style={{ color: "#d48806", fontSize: 18 }}>{product?.price?.toLocaleString()}đ</Text>
        </div>
        <Paragraph ellipsis={{ rows: 2 }} style={{ color: "#888", marginTop: 10 }}>{product?.description || "Mô tả đang cập nhật"}</Paragraph>
        <Button type="primary" block icon={<ShoppingCartOutlined />} onClick={() => onAdd(product)} size="large" style={{ marginTop: 10 }}>Thêm vào giỏ</Button>
    </Card>
);

export default HomePage;