import React, { useEffect, useState } from 'react';
import { Layout, Spin } from 'antd';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header'; // Import Header vừa sửa
import api from '../services/api';

const { Footer, Content } = Layout;

const MainLayout = () => {
    const [siteInfo, setSiteInfo] = useState(null);
    const [loadingInfo, setLoadingInfo] = useState(true);

    // Gọi API lấy thông tin website (1 lần duy nhất khi vào web)
    useEffect(() => {
        const fetchSiteInfo = async () => {
            try {
                const res = await api.get('/WebsiteInfo');
                setSiteInfo(res.data);
            } catch (error) {
                console.error("Lỗi tải thông tin web:", error);
                // Nếu lỗi thì set mặc định để không trắng trang
                setSiteInfo({
                    shopName: "Bakery Love",
                    footerContent: "© 2025 All Rights Reserved.",
                    address: "Đang cập nhật...",
                    contactPhone: "..."
                });
            } finally {
                setLoadingInfo(false);
            }
        };
        fetchSiteInfo();
    }, []);

    // Hiển thị loading nhẹ nếu chưa có thông tin
    if (loadingInfo && !siteInfo) return <div style={{height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center'}}><Spin size="large" /></div>;

    return (
        <Layout style={{ minHeight: '100vh', background: '#fff' }}>
            {/* Truyền siteInfo xuống Header để hiện Logo/Tên */}
            <Header siteInfo={siteInfo} />
            
            <Content style={{ minHeight: '80vh' }}>
                {/* Truyền siteInfo xuống các trang con (HomePage, AboutPage) */}
                <Outlet context={{ siteInfo }} /> 
            </Content>

            {/* FOOTER ĐỘNG (Lấy từ siteInfo) */}
            <Footer style={{ 
                textAlign: 'center', 
                padding: '40px 20px', 
                background: '#2d3436', 
                color: '#dfe6e9',
                marginTop: 'auto' 
            }}>
                <div style={{ 
                    fontSize: 24, 
                    fontFamily: "'Pacifico', cursive", 
                    marginBottom: 10, 
                    color: '#d48806' 
                }}>
                    {siteInfo?.shopName || "Bakery Love"}
                </div>
                
                <div style={{ fontSize: 14, lineHeight: '1.6', opacity: 0.9 }}>
                    <p style={{ margin: 5 }}>📍 Địa chỉ: {siteInfo?.address || "Đang cập nhật..."}</p>
                    <p style={{ margin: 5 }}>📞 Hotline: {siteInfo?.contactPhone} | 📧 Email: {siteInfo?.contactEmail}</p>
                </div>

                <div style={{ 
                    marginTop: 20, 
                    borderTop: '1px solid #444', 
                    paddingTop: 20, 
                    fontSize: 12, 
                    color: '#636e72',
                    maxWidth: 600,
                    marginLeft: 'auto',
                    marginRight: 'auto'
                }}>
                    {siteInfo?.footerContent || "© 2025 BakeryShop. All rights reserved."}
                </div>
            </Footer>
        </Layout>
    );
};

export default MainLayout;