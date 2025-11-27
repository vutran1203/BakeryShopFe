import React, { useEffect, useState } from 'react';
import { Table, Tag, Select, message, Card, Typography } from 'antd';
import api from '../services/api';

const { Title } = Typography;
const { Option } = Select;

const AdminOrderPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    // Load tất cả đơn hàng
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

    // Xử lý thay đổi trạng thái
    const handleStatusChange = async (orderId, newStatus) => {
        try {
            // Gọi API PUT /api/Orders/admin/{id}/status
            // Lưu ý: Backend nhận chuỗi status từ Body, nên cần bọc trong dấu ngoặc kép hoặc gửi raw string tùy cấu hình
            // Với code backend C# mình đưa trước đó ([FromBody] string status), axios gửi string trực tiếp cần set header đúng
            // Cách an toàn nhất: Gửi object JSON hoặc dùng config header
            
            await api.put(`/Orders/admin/${orderId}/status`, JSON.stringify(newStatus), {
                headers: { 'Content-Type': 'application/json' }
            });
            
            message.success(`Đã cập nhật đơn #${orderId} thành ${newStatus}`);
            fetchOrders(); // Load lại dữ liệu
        } catch (err) {
            message.error("Cập nhật thất bại!");
        }
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', width: 60 },
        { 
            title: 'Khách hàng', 
            dataIndex: 'customerName',
            render: (text, record) => (
                <div>
                    <b>{text}</b>
                    <br/>
                    <small style={{color:'#888'}}>{record.customerEmail}</small>
                </div>
            )
        },
        { title: 'Ngày đặt', dataIndex: 'orderDate', render: (d) => new Date(d).toLocaleString('vi-VN') },
        { title: 'Tổng tiền', dataIndex: 'totalAmount', render: (v) => <b>{v.toLocaleString()} đ</b> },
        { 
            title: 'Trạng thái (Click để sửa)', 
            dataIndex: 'status',
            render: (status, record) => (
                <Select 
                    defaultValue={status} 
                    style={{ width: 120 }} 
                    onChange={(val) => handleStatusChange(record.id, val)}
                >
                    <Option value="Pending">Pending</Option>
                    <Option value="Shipped">Shipped</Option>
                    <Option value="Delivered">Delivered</Option>
                    <Option value="Cancelled">Cancelled</Option>
                </Select>
            )
        },
    ];

    // Bảng chi tiết bên trong (Giống bên MyOrders)
    const expandedRowRender = (order) => {
        const detailColumns = [
            { title: 'Bánh', dataIndex: 'productName' },
            { title: 'SL', dataIndex: 'quantity' },
            { title: 'Giá', dataIndex: 'unitPrice', render: v => v.toLocaleString() },
            { title: 'Ảnh', dataIndex: 'productImage', render: src => <img src={src} width={40}/> },
        ];
        return <Table columns={detailColumns} dataSource={order.items} pagination={false} size="small" />;
    };

    return (
        <div style={{ padding: 20 }}>
            <Title level={3}>📦 Quản lý Đơn hàng</Title>
            <Table
                dataSource={orders}
                columns={columns}
                rowKey="id"
                loading={loading}
                expandable={{ expandedRowRender }}
                bordered
            />
        </div>
    );
};

export default AdminOrderPage;