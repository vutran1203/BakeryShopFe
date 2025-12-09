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
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const pageSize = 8;

    const navigate = useNavigate();
    const location = useLocation();
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    // -------------------------
    // FETCH PRODUCTS
    // -------------------------
    const fetchProducts = async (page, keyword) => {
        try {
            setLoading(true);

            const keywordParam = keyword ? `&search=${encodeURIComponent(keyword)}` : "";
            const url = `/Products?page=${page}&pageSize=${pageSize}${keywordParam}`;
            console.log("Fetching URL:", url);

            const response = await api.get(url);
            const payload = response.data;

            let safeData = [];

            if (payload?.data && Array.isArray(payload.data)) safeData = payload.data;
            else if (payload?.Data && Array.isArray(payload.Data)) safeData = payload.Data;
            else if (Array.isArray(payload)) safeData = payload;
            else safeData = [];

            const safeTotal = Number(payload?.total ?? payload?.Total ?? safeData.length);

            setProducts(safeData);
            setTotalItems(safeTotal);

        } catch (err) {
            console.error("Fetch error:", err);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    // -------------------------
    // EFFECT 1: Đọc search param từ URL → Update searchTerm & reset page
    // -------------------------
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const searchFromUrl = params.get('q') || params.get('search') || "";

        setSearchTerm(searchFromUrl);
        setCurrentPage(1); // reset page khi search thay đổi

    }, [location.search]);

    // -------------------------
    // EFFECT 2: Fetch khi currentPage hoặc searchTerm thay đổi
    // -------------------------
    useEffect(() => {
        fetchProducts(currentPage, searchTerm);
    }, [currentPage, searchTerm]);

    // -------------------------
    // HANDLERS
    // -------------------------
    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const onSearch = (value) => {
        navigate(`?q=${encodeURIComponent(value)}`);
    };

    const handleAddToCart = (product) => {
        addToCart(product);
        message.success({
            content: `Đã thêm ${product?.name} vào giỏ!`,
            style: { marginTop: "20vh" },
        });
    };

    // -------------------------
    // RENDER
    // -------------------------
    return (
        <div>

            {/* SEARCH MOBILE */}
            {isMobile && (
                <div style={{ padding: "15px 20px", background: "#fff", position: "sticky", top: 0, zIndex: 10 }}>
                    <Input.Search
                        placeholder="Bạn muốn ăn bánh gì?"
                        onSearch={onSearch}
                        allowClear
                        size="large"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            )}

            {/* BANNER */}
            <div style={{
                background: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url("https://images.unsplash.com/photo-1509365465985-25d11c17e812?q=80&w=1920")',
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
                                    <Skeleton active />
                                </Card>
                            </Col>
                        ))}
                    </Row>
                ) : (
                    <>
                        {Array.isArray(products) && products.length > 0 ? (
                            <Row gutter={[24, 32]}>
                                {products.map((product, index) => {
                                    const imageUrl =
                                        !product?.imageUrl || !product.imageUrl.startsWith("http")
                                            ? "https://placehold.co/300x200?text=No+Image"
                                            : product.imageUrl;

                                    const ribbonText =
                                        index % 3 === 0
                                            ? "Best Seller"
                                            : index % 4 === 0
                                            ? "New"
                                            : null;

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
                                                    <Badge.Ribbon
                                                        text={ribbonText}
                                                        color={ribbonText === "Best Seller" ? "red" : "green"}
                                                    >
                                                        {card}
                                                    </Badge.Ribbon>
                                                ) : (
                                                    card
                                                )}
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

// -------------------------
// PRODUCT CARD COMPONENT
// -------------------------
const ProductCard = ({ product, imageUrl, navigate, onAdd }) => (
    <Card
        hoverable
        style={{ borderRadius: 16, overflow: "hidden" }}
        cover={
            <div style={{ height: 220, overflow: "hidden", cursor: "pointer" }} onClick={() => navigate(`/product/${product?.id}`)}>
                <img
                    src={imageUrl}
                    alt={product?.name}
                    className="card-img"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
            </div>
        }
    >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Title level={4} style={{ margin: 0, fontSize: 18 }} ellipsis>
                {product?.name}
            </Title>
            <Text strong style={{ color: "#d48806", fontSize: 18 }}>
                {product?.price?.toLocaleString()}đ
            </Text>
        </div>

        <Paragraph ellipsis={{ rows: 2 }} style={{ color: "#888", marginTop: 10 }}>
            {product?.description || "Mô tả đang cập nhật"}
        </Paragraph>

        <Button
            type="primary"
            block
            icon={<ShoppingCartOutlined />}
            size="large"
            onClick={() => onAdd(product)}
            style={{ marginTop: 10 }}
        >
            Thêm vào giỏ
        </Button>
    </Card>
);

export default HomePage;
