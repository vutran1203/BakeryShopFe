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

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const pageSize = 8;

    const navigate = useNavigate();
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    /* ==================== API ANTI-CRASH ==================== */
    const fetchProducts = async (page, keyword) => {
        try {
            setLoading(true);

            const keywordParam = keyword ? `&search=${encodeURIComponent(keyword)}` : "";
            const url = `/Products?page=${page}&pageSize=${pageSize}${keywordParam}`;

            const response = await api.get(url);
            const payload = response.data;

            // ⭐ Trích dữ liệu an toàn
            const safeData =
                Array.isArray(payload.Data) ? payload.Data :
                Array.isArray(payload.data) ? payload.data :
                [];

            const safeTotal = payload.Total ?? payload.total ?? safeData.length;

            setProducts(safeData);
            setTotalItems(safeTotal);

        } catch (err) {
            console.error("Fetch error:", err);
            setProducts([]);  
        } finally {
            setLoading(false);
        }
    };

    /* ==================== TRIGGER API ==================== */
    useEffect(() => {
        fetchProducts(currentPage, searchTerm);
    }, [currentPage, searchTerm]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const onSearch = (value) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const handleAddToCart = (product) => {
        addToCart(product);
        message.success({
            content: `Đã thêm ${product.name} vào giỏ!`,
            style: { marginTop: "20vh" },
        });
    };

    /* ==================== GUARD ANTI-CRASH ==================== */
    if (!Array.isArray(products)) {
        console.error("❌ products IS NOT ARRAY:", products);
        return (
            <div style={{ textAlign: "center", padding: 50 }}>
                <h2>Lỗi dữ liệu sản phẩm!</h2>
                <p>Vui lòng thử lại sau.</p>
            </div>
        );
    }

    return (
        <div>
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
                <Title level={2} style={{ textAlign: "center", marginBottom: 40 }}>✨ Sản phẩm nổi bật ✨</Title>

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
                                        <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
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
                                    <Button onClick={() => onSearch("")}>Xóa tìm kiếm</Button>
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

/* ==================== PRODUCT CARD ==================== */
const ProductCard = ({ product, imageUrl, navigate, onAdd }) => (
    <Card
        hoverable
        style={{ borderRadius: 16, overflow: "hidden", height: "100%", display: "flex", flexDirection: "column" }}
        cover={
            <div style={{ height: 220, overflow: "hidden", cursor: "pointer" }}
                onClick={() => navigate(`/product/${product.id}`)}>
                <img src={imageUrl} alt={product.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
            </div>
        }
    >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Title level={4} style={{ margin: 0, fontSize: 18 }} ellipsis>{product.name}</Title>
            <Text strong style={{ color: "#d48806", fontSize: 18 }}>
                {product.price.toLocaleString()}đ
            </Text>
        </div>

        <Paragraph ellipsis={{ rows: 2 }} style={{ color: "#888", marginTop: 10 }}>
            {product.description || "Chưa có mô tả"}
        </Paragraph>

        <Button type="primary" block icon={<ShoppingCartOutlined />}
            onClick={() => onAdd(product)}
            size="large" style={{ marginTop: 10 }}>
            Thêm vào giỏ
        </Button>
    </Card>
);

export default HomePage;
