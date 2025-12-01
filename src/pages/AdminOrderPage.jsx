import React, { useEffect, useState } from 'react';
import { Table, Tag, Select, message, Card, Typography, List, Grid, Avatar, Divider, Space } from 'antd';
import { ShoppingCartOutlined, UserOutlined, CalendarOutlined, EnvironmentOutlined } from '@ant-design/icons';
import api from '../services/api';

const { Title, Text } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;

const AdminOrderPage = () => {
    const screens = useBreakpoint();
    const isMobile = !screens.md; // Kiểm tra màn hình nhỏ

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await api.get('/Orders/admin/all');
            setOrders(res.data);
        } catch (err) {
            message.error("Lỗi tải danh sách đơn hàng!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await api.put(`/Orders/admin/${orderId}/status`, JSON.stringify(newStatus), {
                headers: { 'Content-Type': 'application/json' }
            });
            message.success(`Đơn #${orderId} -> ${newStatus}`);
            fetchOrders();
        } catch (err) {
            message.error("Cập nhật thất bại!");
        }
    };

    // --- CẤU HÌNH CHO DESKTOP (TABLE) ---
    const columns = [
        { title: 'ID', dataIndex: 'id', width: 60 },
        { 
            title: 'Khách hàng', 
            dataIndex: 'customerName',
            render: (text, record) => (
                <div>
                    <b>{text}</b><br/><small style={{color:'#888'}}>{record.customerEmail}</small>
                </div>
            )
        },
        { title: 'Ngày đặt', dataIndex: 'orderDate', render: (d) => new Date(d).toLocaleString('vi-VN') },
        { title: 'Tổng tiền', dataIndex: 'totalAmount', render: (v) => <b style={{color: '#d48806'}}>{v.toLocaleString()} đ</b> },
        { 
            title: 'Trạng thái', 
            dataIndex: 'status',
            render: (status, record) => (
                <Select defaultValue={status} style={{ width: 120 }} onChange={(val) => handleStatusChange(record.id, val)}>
                    <Option value="Pending">Pending</Option>
                    <Option value="Shipped">Shipped</Option>
                    <Option value="Delivered">Delivered</Option>
                    <Option value="Cancelled">Cancelled</Option>
                </Select>
            )
        },
    ];

    const expandedRowRender = (order) => {
        const detailColumns = [
            { title: 'Bánh', dataIndex: 'productName' },
            { title: 'SL', dataIndex: 'quantity' },
            { title: 'Giá', dataIndex: 'unitPrice', render: v => v.toLocaleString() },
            { title: 'Ảnh', dataIndex: 'productImage', render: src => <img src={src} width={40} style={{borderRadius: 4}}/> },
        ];
        return <Table columns={detailColumns} dataSource={order.items} pagination={false} size="small" />;
    };

    // --- CẤU HÌNH CHO MOBILE (CARD LIST) ---
    const renderMobileItem = (order) => {
        // Hàm chọn màu cho trạng thái
        let statusColor = 'geekblue';
        if (order.status === 'Pending') statusColor = 'orange';
        if (order.status === 'Shipped') statusColor = 'green';
        if (order.status === 'Cancelled') statusColor = 'red';

        return (
            <List.Item key={order.id} style={{ padding: 0, marginBottom: 16 }}>
                <Card 
                    title={<Space><ShoppingCartOutlined /> Đơn hàng #{order.id}</Space>} 
                    extra={<Tag color={statusColor}>{order.status}</Tag>}
                    style={{ width: '100%', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                    bodyStyle={{ padding: '12px' }}
                >
                    {/* Thông tin khách */}
                    <div style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <UserOutlined style={{ color: '#1677ff' }} /> 
                            <Text strong>{order.customerName}</Text>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#666', fontSize: 13 }}>
                            <CalendarOutlined /> {new Date(order.orderDate).toLocaleString('vi-VN')}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#666', fontSize: 13, marginTop: 4 }}>
                            <EnvironmentOutlined /> {order.shippingAddress || "Không có địa chỉ"}
                        </div>
                    </div>

                    <Divider style={{ margin: '8px 0' }} />

                    {/* Danh sách món ăn rút gọn */}
                    <div style={{ background: '#fafafa', padding: 8, borderRadius: 8 }}>
                        {order.items.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                                <span>{item.quantity}x {item.productName}</span>
                                <span>{(item.unitPrice * item.quantity).toLocaleString()}đ</span>
                            </div>
                        ))}
                    </div>

                    <Divider style={{ margin: '8px 0' }} />

                    {/* Tổng tiền & Hành động */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: 12, color: '#888' }}>Tổng tiền:</div>
                            <Text strong style={{ fontSize: 18, color: '#d48806' }}>
                                {order.totalAmount.toLocaleString()} đ
                            </Text>
                        </div>
                        
                        {/* Dropdown đổi trạng thái ngay trên Card */}
                        <Select 
                            defaultValue={order.status} 
                            style={{ width: 130 }} 
                            onChange={(val) => handleStatusChange(order.id, val)}
                            size="middle"
                        >
                            <Option value="Pending">🕒 Pending</Option>
                            <Option value="Shipped">🚚 Shipped</Option>
                            <Option value="Delivered">✅ Delivered</Option>
                            <Option value="Cancelled">❌ Cancelled</Option>
                        </Select>
                    </div>
                </Card>
            </List.Item>
        );
    };

    return (
        <div style={{ padding: isMobile ? 10 : 20 }}>
            <Title level={3} style={{ marginBottom: 20 }}>📦 Quản lý Đơn hàng</Title>
            
            {!isMobile ? (
                // 🖥️ GIAO DIỆN PC: Bảng (Table)
                <Table
                    dataSource={orders}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    expandable={{ expandedRowRender }}
                    bordered
                />
            ) : (
                // 📱 GIAO DIỆN MOBILE: Danh sách Thẻ (List)
                <List
                    loading={loading}
                    dataSource={orders}
                    renderItem={renderMobileItem}
                    split={false} // Bỏ đường kẻ ngang mặc định của List vì Card đã có viền
                />
            )}
        </div>
    );
};

export default AdminOrderPage;