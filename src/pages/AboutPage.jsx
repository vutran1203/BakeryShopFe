import React from 'react';
import { Row, Col, Typography, Card, Divider, Space, List } from 'antd';
import { ShopOutlined, PhoneOutlined, MailOutlined, SafetyCertificateOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const AboutPage = () => {
    return (
        <div style={{ padding: '40px 50px', maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 50 }}>
                <Title level={1} style={{ fontFamily: "'Pacifico', cursive", color: '#d48806' }}>
                    Câu chuyện của Bakery Love
                </Title>
                <Paragraph style={{ fontSize: 18, color: '#666' }}>
                    Nơi vị ngọt bắt đầu và những kỷ niệm được tạo ra.
                </Paragraph>
            </div>

            <Row gutter={[40, 40]} align="middle">
                <Col xs={24} md={12}>
                    <img 
                        src="https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=1000" 
                        alt="Bakery Shop" 
                        style={{ width: '100%', borderRadius: 16, boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}
                    />
                </Col>
                <Col xs={24} md={12}>
                    <Title level={3}>Chúng tôi là ai?</Title>
                    <Paragraph style={{ fontSize: 16, lineHeight: 1.8 }}>
                        Thành lập năm 2025, <b>Bakery Love</b> không chỉ là một tiệm bánh, mà là nơi chúng tôi gửi gắm tình yêu vào từng thớ bột. 
                        Chúng tôi tin rằng một chiếc bánh ngon không chỉ nằm ở hương vị, mà còn ở nguyên liệu sạch và tâm huyết của người thợ.
                    </Paragraph>
                    <Paragraph style={{ fontSize: 16, lineHeight: 1.8 }}>
                        Tại đây, chúng tôi cam kết:
                    </Paragraph>
                    <ul style={{ fontSize: 16, lineHeight: 1.8 }}>
                        <li>🥖 Sử dụng 100% nguyên liệu tự nhiên.</li>
                        <li>🚫 Không chất bảo quản độc hại.</li>
                        <li>👨‍🍳 Bánh luôn tươi mới mỗi ngày.</li>
                    </ul>
                </Col>
            </Row>

            <Divider style={{ margin: '60px 0' }} />

            <Title level={3} style={{ textAlign: 'center', marginBottom: 40 }}>Tại sao chọn chúng tôi?</Title>
            <Row gutter={[24, 24]}>
                <Col xs={24} md={8}>
                    <Card style={{ textAlign: 'center', border: 'none', background: '#fff8e6' }}>
                        <ShopOutlined style={{ fontSize: 40, color: '#d48806', marginBottom: 20 }} />
                        <Title level={4}>Không gian ấm cúng</Title>
                        <Text>Không gian tuyệt vời để thưởng thức bánh và trà chiều.</Text>
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card style={{ textAlign: 'center', border: 'none', background: '#fff8e6' }}>
                        <SafetyCertificateOutlined style={{ fontSize: 40, color: '#d48806', marginBottom: 20 }} />
                        <Title level={4}>An toàn vệ sinh</Title>
                        <Text>Quy trình chế biến đạt chuẩn ISO, đảm bảo sức khỏe.</Text>
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card style={{ textAlign: 'center', border: 'none', background: '#fff8e6' }}>
                        <PhoneOutlined style={{ fontSize: 40, color: '#d48806', marginBottom: 20 }} />
                        <Title level={4}>Hỗ trợ tận tâm</Title>
                        <Text>Đội ngũ nhân viên luôn sẵn sàng tư vấn và hỗ trợ bạn.</Text>
                    </Card>
                </Col>
            </Row>

            <div style={{ marginTop: 60, textAlign: 'center' }}>
                <Title level={4}>Liên hệ với chúng tôi</Title>
                <Space size="large" style={{ fontSize: 18 }}>
                    <span><PhoneOutlined /> 0909 123 456</span>
                    <span><MailOutlined /> contact@bakerylove.com</span>
                </Space>
            </div>
        </div>
    );
};

// Import Space nếu chưa có (mình bổ sung thêm ở trên)


export default AboutPage;