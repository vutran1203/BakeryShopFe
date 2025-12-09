import React, { useEffect, useState } from 'react';
import { Typography, Row, Col, Image } from 'antd';
import api from '../services/api';

const { Title, Paragraph } = Typography;

const AboutPage = () => {
    const [info, setInfo] = useState(null);

    useEffect(() => {
        api.get('/WebsiteInfo').then(res => setInfo(res.data));
    }, []);

    return (
        <div style={{ maxWidth: 1200, margin: '50px auto', padding: '0 20px' }}>
            <Row gutter={[40, 40]} align="middle">
                <Col xs={24} md={12}>
                    <Image src={info?.aboutUsImageUrl} style={{ borderRadius: 10 }} />
                </Col>
                <Col xs={24} md={12}>
                    <Title level={1} style={{ color: '#d48806', fontFamily: 'Pacifico' }}>
                        {info?.aboutUsTitle}
                    </Title>
                    <div style={{ whiteSpace: 'pre-line', fontSize: 16, color: '#555' }}>
                        {info?.aboutUsContent}
                    </div>
                </Col>
            </Row>
        </div>
    );
};
export default AboutPage;