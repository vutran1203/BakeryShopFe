import React, { useEffect, useState } from 'react';
import { Menu, Button, Badge, Input, Avatar, Dropdown, Space, theme, message, Drawer, List, Typography, Grid } from 'antd'; // Thêm Grid
import { 
    HomeOutlined, HistoryOutlined, LogoutOutlined, AppstoreOutlined, 
    ShoppingCartOutlined, SearchOutlined, DeleteOutlined, UserOutlined, MenuOutlined 
} from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getCart, removeFromCart } from '../utils/cart';

const { Text } = Typography;
const { useBreakpoint } = Grid; // Hook để check màn hình

const Header = () => {
    const screens = useBreakpoint(); // Lấy kích thước màn hình
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [cartCount, setCartCount] = useState(0);
    const [openDrawer, setOpenDrawer] = useState(false);
    const { token: { colorPrimary } } = theme.useToken();

    // ... (Giữ nguyên các hàm refreshCart, useEffect, handleLogout, handleDeleteItem như cũ) ...
    // ... Bạn copy lại logic JS cũ vào đây nhé, không thay đổi logic ...
    const refreshCart = () => {
        const cart = getCart();
        setCartItems(cart);
        const total = cart.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(total);
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        if (token && userStr) setUser(JSON.parse(userStr));
        else setUser(null);
        refreshCart();
        window.addEventListener('storage', refreshCart);
        // Lắng nghe sự kiện mở drawer
        const handleOpenDrawer = () => setOpenDrawer(true);
        window.addEventListener('open_cart_drawer', handleOpenDrawer);
        return () => {
            window.removeEventListener('storage', refreshCart);
            window.removeEventListener('open_cart_drawer', handleOpenDrawer);
        };
    }, [location]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
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

    const menuItems = [
        { label: <Link to="/">Trang chủ</Link>, key: '/' },
        { label: <Link to="/products">Sản phẩm</Link>, key: '/products' },
        { label: <Link to="/about">Về chúng tôi</Link>, key: '/about' },
    ];

    const subTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return (
        <>
            <div style={{
                position: 'sticky', top: 0, zIndex: 1000, width: '100%', height: '70px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', 
                // Responsive Padding: Máy tính 50px, Điện thoại 20px
                padding: screens.md ? '0 50px' : '0 20px', 
                boxSizing: 'border-box'
            }}>
                {/* LOGO - Luôn hiện */}
                <div onClick={() => navigate('/')} style={{ fontFamily: "'Pacifico', cursive", fontSize: screens.md ? '28px' : '24px', color: colorPrimary, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {!screens.md ? 'Bakery' : '🍰 BakeryShop'} {/* Mobile hiện tên ngắn hơn */}
                </div>

                {/* SEARCH & MENU - Chỉ hiện trên máy tính (screens.md = true) */}
                {screens.md && (
                    <>
                        <div style={{ flex: 1, maxWidth: '400px', margin: '0 40px' }}>
                            <Input.Search 
                                placeholder="Tìm kiếm bánh..." allowClear
                                onSearch={(val) => val.trim() && navigate(`/search?q=${val}`)}
                                style={{ borderRadius: '20px' }} size="large"
                            />
                        </div>
                        <Menu mode="horizontal" selectedKeys={[location.pathname]} items={menuItems} style={{ borderBottom: 'none', background: 'transparent', width: '300px', fontSize: '16px', fontWeight: 500 }} />
                    </>
                )}

                {/* ACTIONS - Luôn hiện nhưng thu gọn trên mobile */}
                <div style={{ display: 'flex', alignItems: 'center', gap: screens.md ? '25px' : '15px' }}>
                    {/* Nút Search cho Mobile (Khi bị ẩn thanh search to) */}
                    {!screens.md && (
                        <Button type="text" shape="circle" icon={<SearchOutlined />} onClick={() => navigate('/products')} />
                    )}

                    <Badge count={cartCount} showZero color={colorPrimary}>
                        <Button type="text" shape="circle" icon={<ShoppingCartOutlined style={{ fontSize: '22px' }} />} onClick={() => setOpenDrawer(true)} />
                    </Badge>

                    {user ? (
                        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
                            <a onClick={(e) => e.preventDefault()} style={{ display: 'inline-block' }}>
                                <Space style={{ cursor: 'pointer' }}>
                                    <Avatar style={{ backgroundColor: colorPrimary, verticalAlign: 'middle' }} size={screens.md ? "large" : "default"}>
                                        {user.username?.charAt(0).toUpperCase()}
                                    </Avatar>
                                    {/* Trên Mobile ẩn tên đi cho gọn */}
                                    {screens.md && (
                                        <span style={{ fontWeight: 600, color: '#333', display: 'inline-block', marginLeft: 8, whiteSpace: 'nowrap' }}>
                                            {user.fullName || user.username}
                                        </span>
                                    )}
                                </Space>
                            </a>
                        </Dropdown>
                    ) : (
                        <Button type="primary" shape="round" icon={<UserOutlined />} size={screens.md ? "large" : "middle"} onClick={() => navigate('/login')}>
                            {screens.md ? 'Đăng nhập' : ''} {/* Mobile chỉ hiện icon */}
                        </Button>
                    )}
                </div>
            </div>

            {/* ... (Phần Drawer Giỏ hàng giữ nguyên không đổi) ... */}
            <Drawer
                title={`Giỏ hàng (${cartCount} món)`}
                placement="right"
                onClose={() => setOpenDrawer(false)}
                open={openDrawer}
                footer={
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15, fontSize: 16, fontWeight: 'bold' }}>
                            <span>Tạm tính:</span>
                            <span style={{ color: colorPrimary }}>{subTotal.toLocaleString()} đ</span>
                        </div>
                        <Button type="primary" block size="large" onClick={() => {
                            setOpenDrawer(false);
                            navigate('/cart');
                        }}>
                            Xem giỏ hàng & Thanh toán
                        </Button>
                    </div>
                }
            >
                {/* ... (List item giữ nguyên) ... */}
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
                                    title={<Text strong>{item.name}</Text>}
                                    description={
                                        <div>
                                            <div>{item.price.toLocaleString()} đ x {item.quantity}</div>
                                            <Text type="warning" strong>{(item.price * item.quantity).toLocaleString()} đ</Text>
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