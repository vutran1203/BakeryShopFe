import React, { useEffect, useState } from 'react';
import { Menu, Button, Badge, Input, Avatar, Dropdown, Space, theme, message, Drawer, List, Typography, Grid, App } from 'antd';
import { 
    HomeOutlined, HistoryOutlined, LogoutOutlined, AppstoreOutlined, 
    ShoppingCartOutlined, DeleteOutlined, UserOutlined, 
    MenuOutlined 
} from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getCart, removeFromCart } from '../utils/cart';

const { useBreakpoint } = Grid;

// Nhận siteInfo từ props (được truyền từ MainLayout)
const Header = ({ siteInfo }) => {
    const screens = useBreakpoint();
    const navigate = useNavigate();
    const location = useLocation();
    
    
    // --- STATE ---
    const [user, setUser] = useState(null);
    const [cartItems, setCartItems] = useState([]); 
    const [cartCount, setCartCount] = useState(0); 
    const [openDrawer, setOpenDrawer] = useState(false);
    const [openMobileMenu, setOpenMobileMenu] = useState(false); 
    
    const { token: { colorPrimary } } = theme.useToken();
    const isMobile = !screens.md;
    const subTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const refreshCart = () => {
        const cart = getCart();
        setCartItems(cart);
        const total = cart.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(total);
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (token && userStr) {
            setUser(JSON.parse(userStr));
        } else {
            setUser(null);
        }

        refreshCart();

        const handleOpenDrawer = () => setOpenDrawer(true);
        window.addEventListener('storage', refreshCart);
        window.addEventListener('open_cart_drawer', handleOpenDrawer);
        
        return () => {
            window.removeEventListener('storage', refreshCart);
            window.removeEventListener('open_cart_drawer', handleOpenDrawer);
        };
    }, [location]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('admin_notifications');
        setUser(null);
        message.success("Đăng xuất thành công");
        navigate('/login');
    };

    const handleDeleteItem = (id) => {
        removeFromCart(id);
        refreshCart();
        message.success("Đã xóa món khỏi giỏ");
    };

    const userMenuItems = [
        user && { key: '1', label: <Link to="/my-orders">Lịch sử đơn hàng</Link>, icon: <HistoryOutlined /> },
        (user && user.role === 'Admin') && { key: '2', label: <Link to="/admin">Trang quản trị</Link>, icon: <AppstoreOutlined /> },
        user && { type: 'divider' },
        user && { key: '3', label: 'Đăng xuất', icon: <LogoutOutlined />, danger: true, onClick: handleLogout },
    ].filter(Boolean);

    const mainMenuItems = [
        { label: <Link to="/">Trang chủ</Link>, key: '/' },
        { label: <Link to="/products">Sản phẩm</Link>, key: '/products' },
        { label: <Link to="/about">Về chúng tôi</Link>, key: '/about' },
    ];

    return (
        <>
            <div style={{
                position: 'sticky', top: 0, zIndex: 1000, width: '100%', height: '70px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', padding: isMobile ? '0 20px' : '0 50px', boxSizing: 'border-box'
            }}>
                {/* 1. LOGO & HAMBURGER (DÙNG DỮ LIỆU ĐỘNG) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {isMobile && (
                        <Button type="text" icon={<MenuOutlined style={{ fontSize: 20 }} />} onClick={() => setOpenMobileMenu(true)} />
                    )}
                    <div onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {/* Nếu có LogoUrl thì hiện ảnh, không thì hiện icon bánh */}
                        {siteInfo?.logoUrl ? (
                            <img src={siteInfo.logoUrl} alt="Logo" style={{ height: 40, objectFit: 'contain' }} />
                        ) : (
                            <span style={{ fontSize: 24 }}>🍰</span>
                        )}
                        
                        <span style={{ fontFamily: "'Pacifico', cursive", fontSize: isMobile ? '20px' : '24px', color: colorPrimary }}>
                            {siteInfo?.shopName || "Bakery Shop"}
                        </span>
                    </div>
                </div>

                {/* 2. SEARCH & MENU (DESKTOP) */}
                {!isMobile && (
                    <>
                        <div style={{ flex: 1, maxWidth: '400px', margin: '0 40px' }}>
                            <Input.Search 
                                placeholder="Tìm kiếm bánh..." 
                                allowClear 
                                onSearch={(val) => {
                                    // Sửa lại dùng tham số 'q' cho chuẩn code mới
                                    if(val.trim()) navigate(`/?q=${encodeURIComponent(val)}`) 
                                }} 
                                style={{ borderRadius: '20px' }} size="large" 
                            />
                        </div>
                        <Menu mode="horizontal" selectedKeys={[location.pathname]} items={mainMenuItems} style={{ borderBottom: 'none', background: 'transparent', minWidth: '300px', fontSize: '16px', fontWeight: 500 }} />
                    </>
                )}

                {/* 3. ACTIONS */}
                <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '15px' : '25px' }}>
                    <Badge count={cartCount} showZero color={colorPrimary}>
                        <Button type="text" shape="circle" icon={<ShoppingCartOutlined style={{ fontSize: '22px' }} />} onClick={() => setOpenDrawer(true)} />
                    </Badge>

                    {user ? (
                        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
                            <a onClick={(e) => e.preventDefault()} style={{ display: 'inline-block' }}>
                                <Space style={{ cursor: 'pointer' }}>
                                    <Avatar style={{ backgroundColor: colorPrimary, verticalAlign: 'middle' }} size={isMobile ? "default" : "large"}>
                                        {user.username?.charAt(0).toUpperCase()}
                                    </Avatar>
                                    {!isMobile && (
                                        <span style={{ fontWeight: 600, color: '#333', display: 'inline-block', marginLeft: 8, whiteSpace: 'nowrap' }}>
                                            {user.fullName || user.username}
                                        </span>
                                    )}
                                </Space>
                            </a>
                        </Dropdown>
                    ) : (
                        <Button type="primary" shape="round" icon={<UserOutlined />} size={isMobile ? "small" : "large"} onClick={() => navigate('/login')}>
                            {!isMobile ? 'Đăng nhập' : ''}
                        </Button>
                    )}
                </div>
            </div>

            {/* MOBILE MENU DRAWER */}
            <Drawer 
                title="Menu"
                placement="left"
                onClose={() => setOpenMobileMenu(false)}
                open={openMobileMenu}
                size="default"
                styles={{
                    body: { padding: 0 },
                    content: { width: 250 }}}>
                <div style={{ padding: 20 }}>
                    <Input.Search placeholder="Tìm kiếm..." onSearch={(val) => { if(val.trim()) { navigate(`/?q=${encodeURIComponent(val)}`); setOpenMobileMenu(false); } }} />
                </div>
                <Menu mode="inline" items={mainMenuItems} selectedKeys={[location.pathname]} onClick={() => setOpenMobileMenu(false)} />
            </Drawer>
            
            {/* CART DRAWER */}
            <Drawer
                title={`Giỏ hàng (${cartCount} món)`}
    placement="right"
    onClose={() => setOpenDrawer(false)}
    open={openDrawer}
    size="default"
    styles={{
        content: { width: isMobile ? '85%' : 400 }
    }}
    footer={
        <div style={{ textAlign: 'right' }}>
            <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 15,
                fontSize: 16,
                fontWeight: 'bold'
            }}>
                <span>Tạm tính:</span>
                <span style={{ color: colorPrimary }}>{subTotal.toLocaleString()} đ</span>
            </div>
            <Button 
                type="primary" 
                block 
                size="large" 
                onClick={() => { setOpenDrawer(false); navigate('/cart'); }}
            >
                Xem giỏ hàng & Thanh toán
            </Button>
        </div>
                }
            >
                {cartItems.length === 0 ? (
                    <div style={{ textAlign: 'center', marginTop: 50, color: '#999' }}>Giỏ hàng đang trống <br/> 😢</div>
                ) : (
                    <List
                        itemLayout="horizontal"
                        dataSource={cartItems}
                        renderItem={(item) => (
                            <List.Item actions={[<Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDeleteItem(item.id)} />]}>
                                <List.Item.Meta
                                    avatar={<Avatar src={item.imageUrl} shape="square" size={60} />}
                                    title={<Typography.Text strong>{item.name}</Typography.Text>}
                                    description={
                                        <div>
                                            <div>{item.price.toLocaleString()} đ x {item.quantity}</div>
                                            <Typography.Text type="warning" strong>{(item.price * item.quantity).toLocaleString()} đ</Typography.Text>
                                        </div>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                )}
            </Drawer>
        </>
    );
};

export default Header;