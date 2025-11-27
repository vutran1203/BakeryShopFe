import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom'; // Hook để lấy từ khóa trên URL
import { Row, Col, Card, Typography, Spin, Button, message } from 'antd';
import { ShoppingCartOutlined, FrownOutlined } from '@ant-design/icons';
import api from '../services/api';
import { addToCart } from '../utils/cart';

const { Title, Text } = Typography;
const { Meta } = Card;

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const keyword = searchParams.get('q'); // Lấy chữ 'q' trên thanh địa chỉ
    
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchSearch = async () => {
            setLoading(true);
            try {
                // Gọi API với tham số search
                const res = await api.get(`/Products?search=${keyword}`);
                setProducts(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (keyword) {
            fetchSearch();
        }
    }, [keyword]); // Chạy lại khi từ khóa thay đổi

    const handleAddToCart = (product) => {
        addToCart(product);
        message.success(`Đã thêm ${product.name} vào giỏ!`);
    };

    return (
        <div style={{ padding: '20px 50px' }}>
            <Title level={3} style={{ textAlign: 'center', marginBottom: 30 }}>
                🔍 Kết quả tìm kiếm cho: "{keyword}"
            </Title>

            {loading ? (
                <div style={{ textAlign: 'center' }}><Spin size="large" /></div>
            ) : products.length === 0 ? (
                <div style={{ textAlign: 'center', fontSize: 18, color: '#888', marginTop: 50 }}>
                    <FrownOutlined style={{ fontSize: 40, marginBottom: 10 }} /> <br/>
                    Không tìm thấy bánh nào tên là "{keyword}" cả.
                </div>
            ) : (
                <Row gutter={[16, 24]}>
                    {products.map((product) => (
                        <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                            <Card
                                hoverable
                                cover={
                                    <img
                                        alt={product.name}
                                        src={product.imageUrl || "https://placehold.co/300x200"}
                                        style={{ height: 200, objectFit: 'cover' }}
                                    />
                                }
                                actions={[
                                    <Button type="primary" icon={<ShoppingCartOutlined />} onClick={() => handleAddToCart(product)}>
                                        Thêm vào giỏ
                                    </Button>
                                ]}
                            >
                                <Meta
                                    title={product.name}
                                    description={<Text strong style={{ color: '#d48806' }}>{product.price.toLocaleString()} đ</Text>}
                                />
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </div>
    );
};

export default SearchPage;