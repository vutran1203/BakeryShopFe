import React, { useEffect, useState } from 'react';
import { Layout, Menu, notification, Badge, Popover, List, Avatar, Typography, Button } from 'antd';
import { 
    DashboardOutlined, 
    ShopOutlined, 
    LogoutOutlined, 
    ShoppingCartOutlined,
    BellOutlined,     // Icon cái chuông
    UserOutlined
} from '@ant-design/icons';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { HubConnectionBuilder } from '@microsoft/signalr';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;
const BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7050/api';

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // State lưu danh sách thông báo
    const [notifications, setNotifications] = useState([]);
    // State lưu số lượng chưa đọc (để hiện số đỏ)
    const [unreadCount, setUnreadCount] = useState(0);

    // Load thông báo cũ từ LocalStorage khi mới vào
    useEffect(() => {
        const savedNoti = localStorage.getItem('admin_notifications');
        if (savedNoti) {
            setNotifications(JSON.parse(savedNoti));
        }
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    // Kết nối SignalR
    useEffect(() => {
        const connection = new HubConnectionBuilder()
            .withUrl(BASE_URL.replace('/api', '') + "/hub/notification") 
.withAutomaticReconnect()
.build();

        connection.start()
            .then(() => console.log("SignalR Connected"))
            .catch(err => console.error("SignalR Error", err));

        connection.on("ReceiveOrder", (message) => {
            // 1. Hiện thông báo góc màn hình (như cũ)
            notification.success({
                message: 'Đơn hàng mới!',
                description: message,
                placement: 'topRight',
            });

            // 2. Lưu vào danh sách thông báo
            const newNoti = {
                id: Date.now(), // Tạo ID ngẫu nhiên bằng thời gian
                content: message,
                time: new Date().toLocaleString(),
                read: false
            };

            setNotifications(prev => {
                const updated = [newNoti, ...prev]; // Thêm vào đầu danh sách
                localStorage.setItem('admin_notifications', JSON.stringify(updated)); // Lưu LocalStorage
                return updated;
            });
            
            // Tăng số chưa đọc
            setUnreadCount(prev => prev + 1);
        });

        return () => {
            connection.off("ReceiveOrder");
            connection.stop();
        };
    }, []);

    // Xử lý khi bấm vào chuông -> Đánh dấu là đã xem (xóa số đỏ)
    const handleOpenNotification = (open) => {
        if (open) {
            setUnreadCount(0);
        }
    };

    // Nội dung bên trong cái chuông
    const notificationContent = (
        <div style={{ width: 300, maxHeight: 400, overflowY: 'auto' }}>
            <List
                dataSource={notifications}
                renderItem={(item) => (
                    <List.Item>
                        <List.Item.Meta
                            avatar={<Avatar style={{ backgroundColor: '#87d068' }} icon={<ShoppingCartOutlined />} />}
                            title={<Text strong>Đơn hàng mới</Text>}
                            description={
                                <div>
                                    <div>{item.content}</div>
                                    <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>{item.time}</div>
                                </div>
                            }
                        />
                    </List.Item>
                )}
                locale={{ emptyText: "Chưa có thông báo nào" }}
            />
            {notifications.length > 0 && (
                <div style={{ textAlign: 'center', marginTop: 10, borderTop: '1px solid #eee', paddingTop: 8 }}>
                    <Button type="link" size="small" onClick={() => {
                        setNotifications([]);
                        localStorage.removeItem('admin_notifications');
                    }}>
                        Xóa tất cả
                    </Button>
                </div>
            )}
        </div>
    );

    const menuItems = [
        {
            key: '/admin',
            icon: <DashboardOutlined />,
            label: 'Tổng quan (Dashboard)',
            onClick: () => navigate('/admin'),
        },
        {
            key: '/admin/products',
            icon: <ShopOutlined />,
            label: 'Quản lý Sản phẩm',
            onClick: () => navigate('/admin/products'),
        },
        {
            key: '/admin/categories',
            icon: <ShopOutlined />,
            label: 'Quản lý Danh mục',
            onClick: () => navigate('/admin/categories'),
        },
        {
            key: '/admin/orders',
            icon: <ShoppingCartOutlined />,
            label: 'Quản lý Đơn hàng',
            onClick: () => navigate('/admin/orders'),
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Đăng xuất',
            danger: true,
            onClick: handleLogout,
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider collapsible width={220}>
                <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', textAlign:'center', color:'white', lineHeight:'32px', fontWeight:'bold' }}>
                    BAKERY ADMIN
                </div>
                <Menu theme="dark" defaultSelectedKeys={[location.pathname]} mode="inline" items={menuItems} />
            </Sider>
            <Layout>
                <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,21,41,0.08)', zIndex: 1 }}>
                    
                    {/* --- KHU VỰC CÁI CHUÔNG --- */}
                    <Popover 
                        content={notificationContent} 
                        title="Thông báo mới nhất" 
                        trigger="click" 
                        placement="bottomRight"
                        onOpenChange={handleOpenNotification}
                    >
                        <Badge count={unreadCount} style={{ backgroundColor: '#f5222d' }}>
                            <Button type="text" shape="circle" icon={<BellOutlined style={{ fontSize: 20 }} />} />
                        </Badge>
                    </Popover>
                    {/* -------------------------- */}

                    <div style={{ marginLeft: 24, display: 'flex', alignItems: 'center' }}>
                        <Avatar style={{ backgroundColor: '#1677ff', marginRight: 8 }} icon={<UserOutlined />} />
                        <span style={{ fontWeight: 'bold' }}>Quản trị viên</span>
                    </div>
                </Header>
                <Content style={{ margin: '16px' }}>
                    <div style={{ padding: 24, minHeight: 360, background: '#fff', borderRadius: 8 }}>
                        <Outlet /> 
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;