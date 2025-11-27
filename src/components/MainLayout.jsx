import React from 'react';
import Header from './Header'; // Header bán hàng cũ của bạn
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
    return (
        <div>
            <Header />
            <div style={{ minHeight: '80vh' }}>
                <Outlet /> {/* Nơi hiển thị HomePage, CartPage... */}
            </div>
            <div style={{ 
    textAlign: 'center', 
    padding: '40px 20px', 
    background: '#2d3436', 
    color: '#dfe6e9',
    marginTop: 'auto' // Đẩy footer xuống đáy
}}>
    <div style={{ fontSize: 24, fontFamily: "'Pacifico', cursive", marginBottom: 10, color: '#d48806' }}>
        Bakery Love
    </div>
    <p>Địa chỉ: 123 Đường Bánh Ngọt, Quận 1, TP.HCM</p>
    <p>Hotline: 0909 123 456 | Email: order@bakerylove.com</p>
    <div style={{ marginTop: 20, borderTop: '1px solid #444', paddingTop: 20, fontSize: 12, color: '#636e72' }}>
        ©2025 BakeryShop Project. All rights reserved.
    </div>
</div>
        </div>
    );
};

export default MainLayout;