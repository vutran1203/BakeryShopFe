import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Button, Typography, Spin, message, Divider, Pagination, Select, Grid, Badge } from 'antd';
import { ShoppingCartOutlined, AppstoreOutlined, FilterOutlined } from '@ant-design/icons';
import api from '../services/api';
import { addToCart } from '../utils/cart';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;
const { Meta } = Card;
const { Option } = Select;
const { useBreakpoint } = Grid;

const ProductsPage = () => {
    const navigate = useNavigate();
    const screens = useBreakpoint();
    const isMobile = !screens.md; // Kiểm tra xem có phải mobile không

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState(null);
    
    const pageSize = 12;

    // Load danh mục
    useEffect(() => {
        api.get('/Categories').then(res => setCategories(res.data));
    }, []);

    // Load sản phẩm
    const fetchProducts = async () => {
        setLoading(true);
        try {
            let url = `/Products?page=${currentPage}&pageSize=${pageSize}`;
            if (selectedCategory) url += `&categoryId=${selectedCategory}`;

            const res = await api.get(url);
            
            // Xử lý dữ liệu an toàn (tránh lỗi null)
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

    // Xử lý khi chọn danh mục từ Dropdown
    const handleCategoryChange = (value) => {
        setSelectedCategory(value === 'all' ? null : value);
        setCurrentPage(1);
    };

    return (
        <div style={{ padding: isMobile ? '20px 10px' : '40px 50px', maxWidth: 1200, margin: '0 auto' }}>
            
            {/* 1. HEADER & BỘ LỌC DANH MỤC */}
            <div style={{ textAlign: 'center', marginBottom: 30 }}>
                <Title level={isMobile ? 3 : 2} style={{ fontFamily: 'Pacifico', marginBottom: 10 }}>
                    Thực Đơn Bánh 🍰
                </Title>
                <Text type="secondary" style={{ display: 'block', marginBottom: 20 }}>
                    Hương vị ngọt ngào đang chờ bạn
                </Text>

                {/* 👇 DROPDOWN CHỌN DANH MỤC (Thay cho Sidebar) 👇 */}
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

            {/* 2. DANH SÁCH SẢN PHẨM */}
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
            <Badge.Ribbon text={product.isBestSeller ? "Hot" : null} color="red">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                    <Card
                        hoverable
                        style={{ borderRadius: 12, overflow: "hidden" }}
                        bodyStyle={{ padding: isMobile ? "10px" : "20px" }}
                        onClick={() => goToDetail(product.id)}
                        cover={
                            <div style={{ height: isMobile ? 140 : 200, overflow: "hidden" }}>
                                <img 
                                    src={imageUrl}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                            </div>
                        }
                    >
                        <Title level={5} style={{ fontSize: isMobile ? 14 : 16 }}>
                            {product.name}
                        </Title>
                        <Text strong style={{ color: '#d48806' }}>
                            {product.price.toLocaleString()} đ
                        </Text>

                        <Button 
                            type="primary"
                            block
                            icon={<ShoppingCartOutlined />}
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


                    {/* 3. PHÂN TRANG */}
                    {totalItems > 0 && (
                        <div style={{ marginTop: 40, textAlign: 'center' }}>
                            <Pagination 
                                current={currentPage} 
                                total={totalItems} 
                                pageSize={pageSize}
                                onChange={(page) => {
                                    setCurrentPage(page);
                                }}
                                showSizeChanger={false}
                                size={isMobile ? 'small' : 'default'}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ProductsPage;