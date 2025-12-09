import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Button, Typography, message, Pagination, Skeleton, Badge, Grid, Input } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import api from '../services/api';
import { addToCart } from '../utils/cart';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom'; // Thêm useLocation

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
    const location = useLocation(); // Hook để đọc URL
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    // --- 1. API ANTI-CRASH (Logic gọi API an toàn) ---
    const fetchProducts = async (page, keyword) => {
        try {
            setLoading(true);

            // Gửi tham số 'search' cho Backend (Backend yêu cầu 'search')
            const keywordParam = keyword ? `&search=${encodeURIComponent(keyword)}` : "";
            const url = `/Products?page=${page}&pageSize=${pageSize}${keywordParam}`;
            
            console.log("Fetching URL:", url); // Debug log

            const response = await api.get(url);
            const payload = response.data;

            // ⭐ Trích dữ liệu an toàn (Chấp nhận cả Data hoa và data thường)
            const safeData =
                Array.isArray(payload.Data) ? payload.Data :
                Array.isArray(payload.data) ? payload.data :
                Array.isArray(payload) ? payload : // Trường hợp trả về mảng trực tiếp
                [];

            const safeTotal = payload.Total ?? payload.total ?? safeData.length;

            // Lọc bỏ phần tử null/undefined để tránh crash khi render
            const cleanData = safeData.filter(item => item !== null && item !== undefined);

            setProducts(cleanData);
            setTotalItems(safeTotal);

        } catch (err) {
            console.error("Fetch error:", err);
            setProducts([]); // Nếu lỗi, gán mảng rỗng
        } finally {
            setLoading(false);
        }
    };

    // --- 2. TRIGGER API KHI URL HOẶC PAGE THAY ĐỔI ---
    useEffect(() => {
        // Đọc từ khóa từ URL (Ưu tiên 'q', sau đó đến 'search')
        const params = new URLSearchParams(location.search);
        const searchFromUrl = params.get('q') || params.get('search') || "";
        
        setSearchTerm(searchFromUrl); // Cập nhật ô input
        fetchProducts(currentPage, searchFromUrl); // Gọi API

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, location.search]); 

    // --- 3. CÁC HÀM XỬ LÝ SỰ KIỆN ---
    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const onSearch = (value) => {
        setCurrentPage(1);
        // Đổi URL sang dạng ?q=... (Chuẩn SEO và UX hơn)
        navigate(`?q=${encodeURIComponent(value)}`);
    };

    const handleAddToCart = (product) => {
        addToCart(product);
        message.success({
            content: `Đã thêm ${product?.name} vào giỏ!`,
            style: { marginTop: "20vh" },
        });
    };

    // --- 4. GUARD ANTI-CRASH (Bảo vệ lần cuối) ---
    if (!Array.isArray(products)) {
        return <div style={{ textAlign: "center", padding: 50 }}>Đang tải dữ liệu...</div>;
    }

    // --- RENDER GIAO DIỆN ---
    return (
        <div>
            {/* Dòng chữ đánh dấu phiên bản mới (Xóa đi khi đã test xong) */}
            <h1 style={{color: 'red', textAlign: 'center'}}>PHIÊN BẢN V3 - ĐÃ FIX LỖI</h1>
            
            {/* MOBILE SEARCH */}
            {isMobile && (
                <div style={{ padding: "15px 20px", background: "#fff", position: "sticky", top: 0, zIndex: 10 }}>
                    <Input.Search
                        placeholder="Bạn muốn ăn bánh gì?"
                        onSearch={onSearch}
                        enterButton
                        allowClear
                        size="large"
                        defaultValue={searchTerm} // Giữ lại từ khóa khi reload
                    />
                </div>
            )}

            {/* BANNER */}
            <div style={{
                background:
                    'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url("https://images.unsplash.com/photo-1509365465985-25d11c17e812?q=80&w=1920")',
                backgroundSize: "cover",
                backgroundPosition: "center",
                height: isMobile ? "250px" : "400px",
                color: "white",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 40
            }}>
                <h1 style={{ fontFamily: "Pacifico", fontSize: isMobile ? 40 : 60 }}>Bakery Love</h1>
                <p style={{ fontSize: isMobile ? 16 : 20 }}>Đánh thức vị giác với những chiếc bánh ngọt ngào nhất.</p>
            </div>

            {/* PRODUCT LIST */}
            <div style={{ padding: isMobile ? "0 20px 50px" : "0 50px 50px" }}>
                <Title level={2} style={{ textAlign: "center", marginBottom: 40 }}>
                    {searchTerm ? `Kết quả cho: "${searchTerm}"` : "✨ Sản phẩm nổi bật ✨"}
                </Title>

                {loading ? (
                    <Row gutter={[24, 32]}>
                        {[...Array(8)].map((_, i) => (
                            <Col xs={24} sm={12} md={8} lg={6} key={i}>
                                <Card style={{ borderRadius: 16 }}>
                                    <Skeleton.Image active style={{ width: "100%", height: 200 }} />
                                    <Skeleton active paragraph={{ rows: 2 }} style={{ marginTop: 20 }} />
                                </Card>
                            </Col>
                        ))}
                    </Row>
                ) : (
                    <>
                        {products.length > 0 ? (
                            <Row gutter={[24, 32]}>
                                {products.map((product, index) => {
                                    // Kiểm tra null an toàn
                                    if (!product) return null;

                                    const imageUrl =
                                        !product.imageUrl || !product.imageUrl.startsWith("http")
                                            ? "https://placehold.co/300x200?text=No+Image"
                                            : product.imageUrl;

                                    const ribbonText =
                                        index % 3 === 0 ? "Best Seller" :
                                        index % 4 === 0 ? "New" :
                                        null;

                                    const ribbonColor =
                                        index % 3 === 0 ? "red" : "green";

                                    const card = (
                                        <ProductCard
                                            product={product}
                                            imageUrl={imageUrl}
                                            navigate={navigate}
                                            onAdd={handleAddToCart}
                                        />
                                    );

                                    return (
                                        <Col xs={24} sm={12} md={8} lg={6} key={product.id || index}>
                                            <motion.div
                                                initial={{ opacity: 0, y: 50 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                            >
                                                {ribbonText ? (
                                                    <Badge.Ribbon text={ribbonText} color={ribbonColor}>
                                                        {card}
                                                    </Badge.Ribbon>
                                                ) : card}
                                            </motion.div>
                                        </Col>
                                    );
                                })}
                            </Row>
                        ) : (
                            <div style={{ textAlign: "center", padding: "50px 0" }}>
                                <p style={{ fontSize: 18, color: "#888" }}>Không tìm thấy bánh nào! 🍪</p>
                                {searchTerm && (
                                    <Button onClick={() => onSearch("")}>Xem tất cả</Button>
                                )}
                            </div>
                        )}

                        {/* PAGINATION */}
                        {totalItems > 0 && (
                            <div style={{ marginTop: 50, textAlign: "center" }}>
                                <Pagination
                                    current={currentPage}
                                    total={totalItems}
                                    pageSize={pageSize}
                                    showSizeChanger={false}
                                    onChange={handlePageChange}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

/* ==================== PRODUCT CARD (COMPONENT CON) ==================== */
const ProductCard = ({ product, imageUrl, navigate, onAdd }) => (
    <Card
        hoverable
        style={{ borderRadius: 16, overflow: "hidden", height: "100%", display: "flex", flexDirection: "column" }}
        cover={
            <div style={{ height: 220, overflow: "hidden", cursor: "pointer" }}
                onClick={() => navigate(`/product/${product?.id}`)}>
                <img src={imageUrl} alt={product?.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }}
                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'} 
                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1.0)'}
                />
            </div>
        }
    >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Title level={4} style={{ margin: 0, fontSize: 18 }} ellipsis>{product?.name || "Bánh chưa có tên"}</Title>
            <Text strong style={{ color: "#d48806", fontSize: 18 }}>
                {product?.price?.toLocaleString()}đ
            </Text>
        </div>

        <Paragraph ellipsis={{ rows: 2 }} style={{ color: "#888", marginTop: 10 }}>
            {product?.description || "Chưa có mô tả"}
        </Paragraph>

        <Button type="primary" block icon={<ShoppingCartOutlined />}
            onClick={() => onAdd(product)}
            size="large" style={{ marginTop: 10 }}>
            Thêm vào giỏ
        </Button>
    </Card>
);

export default HomePage;