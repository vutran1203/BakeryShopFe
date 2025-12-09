import React, { useEffect, useState, useRef  } from 'react';
import {
    Layout,
    Menu,
    notification,
    Badge,
    Popover,
    List,
    Avatar,
    Typography,
    Button,
    Grid
} from 'antd';
import {
    DashboardOutlined,
    ShopOutlined,
    LogoutOutlined,
    ShoppingCartOutlined,
    BellOutlined,
    UserOutlined,
    MenuOutlined,
    SettingOutlined
} from '@ant-design/icons';
import { useNavigate, Outlet, useLocation, Link } from 'react-router-dom';

// Import SignalR CHUẨN (chỉ 1 cái)
import * as signalR from "@microsoft/signalr";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

const BASE_URL = import.meta.env.VITE_API_URL; // https://domain/api

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const screens = useBreakpoint();
    const isMobile = !screens.md;
    const startedRef = useRef(false);
    const [collapsed, setCollapsed] = useState(isMobile);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const siderStyle = isMobile
        ? { position: "fixed", height: "100vh", zIndex: 999, left: 0, top: 0 }
        : {};

    const overlayStyle = {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 998,
        display: isMobile && !collapsed ? "block" : "none"
    };

    useEffect(() => {
        const saved = localStorage.getItem("admin_notifications");
        if (saved) setNotifications(JSON.parse(saved));
    }, []);

    useEffect(() => {
        setCollapsed(isMobile);
    }, [isMobile]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    const handleMenuClick = (e) => {
        if (e.key === "logout") handleLogout();
        else navigate(e.key);

        if (isMobile) setCollapsed(true);
    };

    // 🔥 SIGNALR — FIX CHUẨN CHO LOCAL + PRODUCTION
   useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_URL; 
    const HUB_BASE = API_BASE.replace("/api", "");
    const hubUrl = `${HUB_BASE}/hub/notification`;

    console.log("[SignalR] Connecting to:", hubUrl);

    const connection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
            skipNegotiation: true,
            transport: signalR.HttpTransportType.WebSockets
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();

    if (!startedRef.current) {
    startedRef.current = true;
    connection.start()
        .then(() => console.log("[SignalR] Connected!"))
        .catch(err => console.error("[SignalR] Connect error:", err));
}

    connection.on("ReceiveOrder", (message) => {
        notification.success({
            message: "Đơn hàng mới!",
            description: message,
            placement: "topRight"
        });
    });

    return () => {
        connection.off("ReceiveOrder");
        connection.stop();
    };
}, []);


    const handleOpenNotification = (open) => {
        if (open) setUnreadCount(0);
    };

    const notificationContent = (
        <div style={{ width: 300, maxHeight: 400, overflowY: "auto" }}>
            <List
                dataSource={notifications}
                renderItem={(item) => (
                    <List.Item>
                        <List.Item.Meta
                            avatar={
                                <Avatar
                                    style={{ backgroundColor: "#87d068" }}
                                    icon={<ShoppingCartOutlined />}
                                />
                            }
                            title={<Text strong>Đơn hàng mới</Text>}
                            description={
                                <div>
                                    <div>{item.content}</div>
                                    <div style={{ fontSize: 11, color: "#999", marginTop: 4 }}>
                                        {item.time}
                                    </div>
                                </div>
                            }
                        />
                    </List.Item>
                )}
                locale={{ emptyText: "Chưa có thông báo nào" }}
            />

            {notifications.length > 0 && (
                <div style={{
                    textAlign: "center",
                    marginTop: 10,
                    borderTop: "1px solid #eee",
                    paddingTop: 8
                }}>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            setNotifications([]);
                            localStorage.removeItem("admin_notifications");
                        }}
                    >
                        Xóa tất cả
                    </Button>
                </div>
            )}
        </div>
    );

    const menuItems = [
        { key: "/admin", icon: <DashboardOutlined />, label: "Tổng quan" },
        { key: "/admin/products", icon: <ShopOutlined />, label: "QL Sản phẩm" },
        { key: "/admin/categories", icon: <ShopOutlined />, label: "QL Danh mục" },
        { key: "/admin/orders", icon: <ShoppingCartOutlined />, label: "QL Đơn hàng" },
        {
            key: "/admin/settings",
            icon: <SettingOutlined />,
            label: <Link to="/admin/settings">Cấu hình Website</Link>
        },
        { key: "logout", icon: <LogoutOutlined />, label: "Đăng xuất", danger: true }
    ];

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <div style={overlayStyle} onClick={() => setCollapsed(true)} />

            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={(value) => setCollapsed(value)}
                collapsedWidth={isMobile ? 0 : 80}
                width={220}
                style={siderStyle}
                trigger={null}
                theme="dark"
            >
                <div
                    style={{
                        height: 32,
                        margin: 16,
                        background: "rgba(255,255,255,0.2)",
                        textAlign: "center",
                        color: "white",
                        lineHeight: "32px",
                        fontWeight: "bold"
                    }}
                >
                    BAKERY ADMIN
                </div>

                <Menu
                    theme="dark"
                    defaultSelectedKeys={[location.pathname]}
                    mode="inline"
                    items={menuItems}
                    onClick={handleMenuClick}
                />
            </Sider>

            <Layout>
                <Header
                    style={{
                        padding: "0 24px",
                        background: "#fff",
                        display: "flex",
                        justifyContent: isMobile ? "space-between" : "flex-end",
                        alignItems: "center",
                        boxShadow: "0 1px 4px rgba(0,21,41,0.08)"
                    }}
                >
                    {isMobile && (
                        <Button
                            type="text"
                            icon={<MenuOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
                            style={{ fontSize: 16, width: 64, height: 64 }}
                        />
                    )}

                    <div style={{ display: "flex", alignItems: "center" }}>
                        <Popover
                            content={notificationContent}
                            title="Thông báo"
                            trigger="click"
                            placement="bottomRight"
                            onOpenChange={handleOpenNotification}
                        >
                            <Badge count={unreadCount} style={{ backgroundColor: "#f5222d" }}>
                                <Button type="text" shape="circle" icon={<BellOutlined style={{ fontSize: 20 }} />} />
                            </Badge>
                        </Popover>

                        <div style={{ marginLeft: 24, display: "flex", alignItems: "center" }}>
                            <Avatar
                                style={{ backgroundColor: "#1677ff", marginRight: 8 }}
                                icon={<UserOutlined />}
                            />
                            {!isMobile && <span style={{ fontWeight: "bold" }}>Quản trị viên</span>}
                        </div>
                    </div>
                </Header>

                <Content style={{ margin: "16px" }}>
                    <div style={{ padding: 24, minHeight: 360, background: "#fff", borderRadius: 8 }}>
                        <Outlet />
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;
