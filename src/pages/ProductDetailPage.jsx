import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Typography, Button, Rate, Divider, Image, message, Spin, Skeleton } from 'antd';
import { ShoppingCartOutlined, CarOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import api from '../services/api';
import { addToCart } from '../utils/cart';

const { Title, Text, Paragraph } = Typography;

const ProductDetailPage = () => {
    const { id } = useParams(); // Lấy ID từ URL
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Lấy thông tin chi tiết bánh
                const resProduct = await api.get(`/Products/${id}`);
                setProduct(resProduct.data);

                // 2. Lấy danh sách gợi ý (Tạm thời lấy 4 cái bánh bất kỳ làm "Sản phẩm liên quan")
                // Nếu muốn xịn hơn, bạn có thể lọc theo CategoryId
                const resRelated = await api.get(`/Products?pageSize=4`);
                setRelatedProducts(resRelated.data.data || []);
            } catch (error) {
                message.error("Không tìm thấy sản phẩm!");
                navigate('/');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        // Scroll lên đầu trang khi chuyển sang bánh khác
        window.scrollTo(0, 0);
    }, [id]);

    const handleAddToCart = (item) => {
        addToCart(item);
        message.success(`Đã thêm ${item.name} vào giỏ!`);
    };

    if (loading) return <div style={{ padding: 50 }}><Skeleton active paragraph={{ rows: 10 }} /></div>;
    if (!product) return null;

    // Xử lý ảnh
    const imageUrl = product.imageUrl && product.imageUrl.startsWith('http') 
        ? product.imageUrl 
        : "https://placehold.co/500x500?text=No+Image";

    return (
<>
<Helmet>
    <title>{`${product.name} - Mia Cake`}</title> 
    <meta name="description" content={`Mua bánh ${product.name} giá chỉ ${product.price}đ...`} />
</Helmet>
        <div style={{ padding: '40px 50px', maxWidth: 1200, margin: '0 auto' }}>
            <Row gutter={[40, 40]}>
                {/* CỘT TRÁI: ẢNH */}
                <Col xs={24} md={12}>
                    <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                        <Image src={imageUrl} width="100%" />
                    </div>
                </Col>

                {/* CỘT PHẢI: THÔNG TIN */}
                <Col xs={24} md={12}>
                    <Title level={2} style={{ color: '#d48806', marginTop: 0 }}>{product.name}</Title>
                    <Rate disabled defaultValue={5} /> <Text type="secondary">(102 đánh giá)</Text>
                    
                    <div style={{ margin: '20px 0' }}>
                        <Text delete style={{ color: '#999', fontSize: 16, marginRight: 10 }}>
                            {(product.price * 1.2).toLocaleString()} đ
                        </Text>
                        <Text strong style={{ color: '#ff4d4f', fontSize: 32 }}>
                            {product.price.toLocaleString()} đ
                        </Text>
                    </div>

                    <Paragraph style={{ fontSize: 16, lineHeight: 1.8 }}>
                        {product.description || "Bánh được làm từ nguyên liệu tự nhiên 100%, không chất bảo quản. Hương vị ngọt ngào, cốt bánh mềm mịn tan trong miệng."}
                    </Paragraph>

                    <div style={{ margin: '30px 0' }}>
                        <Button 
                            type="primary" 
                            size="large" 
                            icon={<ShoppingCartOutlined />} 
                            style={{ height: 50, padding: '0 40px', fontSize: 18, borderRadius: 25 }}
                            onClick={() => handleAddToCart(product)}
                        >
                            Thêm vào giỏ ngay
                        </Button>
                    </div>

                    <Card size="small" style={{ background: '#f9f9f9', borderRadius: 8 }}>
                        <p><CarOutlined /> Freeship cho đơn hàng trên 500k</p>
                        <p><SafetyCertificateOutlined /> Hoàn tiền 100% nếu bánh bị hư hỏng</p>
                    </Card>
                </Col>
            </Row>

            <Divider style={{ marginTop: 60, fontSize: 24 }}>Có thể bạn cũng thích</Divider>
            
            <Row gutter={[16, 24]}>
                {relatedProducts.map(item => (
                    <Col xs={12} sm={6} key={item.id}>
                        <Card 
                            hoverable 
                            cover={<img alt={item.name} src={item.imageUrl || "https://placehold.co/300"} style={{height: 150, objectFit:'cover'}} />}
                            onClick={() => navigate(`/product/${item.id}`)}
                        >
                            <Card.Meta title={item.name} description={<b style={{color:'#d48806'}}>{item.price.toLocaleString()} đ</b>} />
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
        </>
    );
};

export default ProductDetailPage;