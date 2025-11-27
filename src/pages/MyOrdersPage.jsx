import React, { useEffect, useState } from 'react';
import { Table, Tag, Typography, message, Card } from 'antd';
import api from '../services/api';

const { Title } = Typography;

const MyOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const res = await api.get('/Orders/my-orders');
                setOrders(res.data);
            } catch (error) {
                message.error("Lỗi tải lịch sử đơn hàng!");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    // Cấu hình cột cho bảng Đơn hàng (Cha)
    const columns = [
        { title: 'Mã đơn', dataIndex: 'id', key: 'id' },
        { 
            title: 'Ngày đặt', 
            dataIndex: 'orderDate', 
            key: 'orderDate',
            render: (text) => new Date(text).toLocaleString('vi-VN') 
        },
        { title: 'Địa chỉ', dataIndex: 'shippingAddress', key: 'shippingAddress' },
        { 
            title: 'Tổng tiền', 
            dataIndex: 'totalAmount', 
            key: 'totalAmount',
            render: (money) => <b style={{color: '#d48806'}}>{money.toLocaleString()} đ</b>
        },
        { 
            title: 'Trạng thái', 
            dataIndex: 'status', 
            key: 'status',
            render: (status) => {
                let color = 'geekblue';
                if (status === 'Pending') color = 'orange';
                if (status === 'Shipped') color = 'green';
                if (status === 'Cancelled') color = 'red';
                return <Tag color={color}>{status.toUpperCase()}</Tag>;
            }
        },
    ];

    // Cấu hình cột cho bảng Chi tiết (Con - Khi bấm dấu cộng)
    const expandedRowRender = (order) => {
        const detailColumns = [
            { 
                title: 'Hình ảnh', 
                dataIndex: 'productImage', 
                key: 'productImage',
                render: (src) => <img src={src || "https://placehold.co/50"} alt="" style={{width: 50, height: 50, objectFit:'cover', borderRadius: 4}} />
            },
            { title: 'Tên bánh', dataIndex: 'productName', key: 'productName' },
            { 
                title: 'Đơn giá', 
                dataIndex: 'unitPrice', 
                key: 'unitPrice',
                render: (price) => `${price.toLocaleString()} đ`
            },
            { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity' },
            { 
                title: 'Thành tiền', 
                key: 'total',
                render: (_, record) => <b>{(record.unitPrice * record.quantity).toLocaleString()} đ</b>
            },
        ];

        return <Table columns={detailColumns} dataSource={order.items} pagination={false} size="small" />;
    };

    return (
        <div style={{ padding: '20px 50px' }}>
            <Title level={3} style={{ textAlign: 'center', marginBottom: 30 }}>
                📜 Lịch sử mua hàng của tôi
            </Title>
            
            <Table
                columns={columns}
                dataSource={orders}
                rowKey="id"
                loading={loading}
                expandable={{ expandedRowRender }} // Tính năng xổ xuống xem chi tiết
            />
        </div>
    );
};

export default MyOrdersPage;