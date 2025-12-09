import React, { useEffect, useState } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import api from '../services/api';

const { Footer, Content } = Layout;

const MainLayout = () => {
    const [info, setInfo] = useState(null);

    // Gọi API 1 lần duy nhất ở đây
    useEffect(() => {
        api.get('/WebsiteInfo').then(res => setInfo(res.data)).catch(console.error);
    }, []);

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* Header của bạn ở đây */}
            
            <Content>
                {/* Truyền biến info xuống cho HomePage dùng */}
                <Outlet context={{ siteInfo: info }} />
            </Content>

            {/* FOOTER ĐỘNG */}
            <Footer style={{ textAlign: 'center', background: '#222', color: '#fff', padding: '40px 0' }}>
                <h2 style={{ color: '#d48806', fontFamily: 'Pacifico', fontSize: 24 }}>
                    {info?.shopName || "Loading..."}
                </h2>
                <div style={{ opacity: 0.8, marginTop: 10 }}>
                    <p>📍 {info?.address}</p>
                    <p>📞 {info?.contactPhone} | 📧 {info?.contactEmail}</p>
                </div>
                <div style={{ borderTop: '1px solid #444', marginTop: 20, paddingTop: 10, fontSize: 12 }}>
                    {info?.footerContent}
                </div>
            </Footer>
        </Layout>
    );
};
export default MainLayout;