import React, { useEffect, useState } from 'react';
import { Table, Button, InputNumber, Card, Typography, message, Form, Input, Modal } from 'antd';
import { DeleteOutlined, CreditCardOutlined, FacebookOutlined   } from '@ant-design/icons';
import { getCart, updateQuantity, removeFromCart, clearCart } from '../utils/cart';
import { useNavigate, useOutletContext } from 'react-router-dom';
import api from '../services/api';
import "./CartPage.css" 

const { Title } = Typography;

const CartPage = () => {
    const [cartItems, setCartItems] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();
    const { siteInfo } = useOutletContext() || {};

    // Load giỏ hàng mỗi khi vào trang
    useEffect(() => {
        setCartItems(getCart());
    }, []);

    // Tính tổng tiền
    const totalAmount = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    // 👇 HÀM XỬ LÝ GỬI ĐƠN QUA FACEBOOK
    const handleContactOrder = () => {
        if (cartItems.length === 0) return message.warning("Giỏ hàng đang trống!");

        // 1. Soạn nội dung tin nhắn chi tiết
        let msg = `👋 Chào shop, mình muốn đặt đơn hàng gồm:\n`;
        msg += `--------------------------------\n`;
        
        cartItems.forEach((item, index) => {
            msg += `${index + 1}. ${item.name} \n   SL: ${item.quantity} x ${item.price.toLocaleString()}đ\n`;
        });
        
        msg += `--------------------------------\n`;
        msg += `💰 TỔNG TẠM TÍNH: ${totalAmount.toLocaleString()}đ\n`;
        msg += `Shop tư vấn và giao hàng giúp mình nhé!`;

        // 2. Copy vào Clipboard
        navigator.clipboard.writeText(msg);
        showMobileToastAndRedirect(
  "Đã copy đơn hàng! Dán vào Messenger nhé!",
  2, siteInfo?.facebookUrl
);

    };

    // Xử lý thay đổi số lượng
    const handleQuantity = (id, value) => {
        updateQuantity(id, value);
        setCartItems(getCart()); // Load lại state để giao diện cập nhật
    };

    function showMobileToastAndRedirect(message, seconds, redirectUrl) {
  let timeLeft = seconds;

  // Tạo toast
  const toast = document.createElement("div");
  toast.className = "mobile-toast";
  toast.innerText = `${message} ${timeLeft}s`;
  document.body.appendChild(toast);

  // Interval đếm ngược
  const timer = setInterval(() => {
    timeLeft--;
    toast.innerText = `${message} ${timeLeft}s`;

    if (timeLeft <= 0) {
      clearInterval(timer);
      toast.remove();
      window.location.href = redirectUrl; // Chuyển trang
    }
  }, 1000);
}


    

    // Xử lý xóa
    const handleDelete = (id) => {
        removeFromCart(id);
        setCartItems(getCart());
        message.success("Đã xóa khỏi giỏ!");
    };

    // Xử lý thanh toán
    const handleCheckout = async (values) => {
        const token = localStorage.getItem('token');
        if (!token) {
            message.warning("Vui lòng đăng nhập để thanh toán!");
            navigate('/login');
            return;
        }

        try {
            // Chuẩn bị dữ liệu gửi xuống Backend
            const orderData = {
                shippingAddress: values.address,
                phoneNumber: values.phone,
                items: cartItems.map(item => ({
                    productId: item.id,
                    quantity: item.quantity
                }))
            };

            await api.post('/Orders', orderData);
            
            message.success("Đặt hàng thành công! 🎉");
            clearCart(); // Xóa sạch giỏ
            setCartItems([]);
            setIsModalOpen(false);
            navigate('/my-orders'); // Chuyển hướng xem đơn hàng
        } catch (err) {
            message.error("Đặt hàng thất bại!");
        }
    };

    const columns = [
        { title: 'Ảnh', dataIndex: 'imageUrl', render: src => <img src={src} width={60} /> },
        { title: 'Tên bánh', dataIndex: 'name' },
        { title: 'Giá', dataIndex: 'price', render: v => v.toLocaleString() + ' đ' },
        { 
            title: 'Số lượng', 
            dataIndex: 'quantity',
            render: (qty, record) => (
                <InputNumber min={1} value={qty} onChange={(val) => handleQuantity(record.id, val)} />
            )
        },
        { 
            title: 'Thành tiền', 
            render: (_, record) => <b style={{color: 'orange'}}>{(record.price * record.quantity).toLocaleString()} đ</b> 
        },
        {
            title: '',
            render: (_, record) => <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
        }
    ];

    return (
        <div style={{ padding: '20px 50px' }}>
            <Title level={2}>🛒 Giỏ hàng của bạn</Title>
            
            <Table dataSource={cartItems} columns={columns} rowKey="id" pagination={false} />

            {cartItems.length > 0 ? (
                <Card style={{ marginTop: 20, textAlign: 'right' }}>
                    <Title level={4}>Tổng cộng: <span style={{color: '#d48806'}}>{totalAmount.toLocaleString()} đ</span></Title>
                    
                        <div className="cart-btn-group">
    <Button
        type="primary"
        icon={<FacebookOutlined />}
        onClick={handleContactOrder}
        style={{
            background: '#1877F2',
            height: 50,
            fontSize: 16,
            flex: 1   // chiếm 50%
        }}
    >
        Gửi đơn qua Messenger 
        
    </Button>

    <Button
        type="primary"
        icon={<CreditCardOutlined />}
        size="large"
        disabled={true}
        style={{
            height: 50,
            fontSize: 16,
            flex: 1   // chiếm 50%
        }}
    >
        Tiến hành Thanh toán (Tạm ngưng)
    </Button>
</div>
                </Card>
            ) : (
                <div style={{ textAlign: 'center', margin: 50, color: '#888' }}>Giỏ hàng đang trống trơn... 😢</div>
            )}

            {/* Modal điền địa chỉ */}
            <Modal title="Thông tin giao hàng" open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null}>
                <Form layout="vertical" onFinish={handleCheckout}>
                    <Form.Item label="Địa chỉ" name="address" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Số điện thoại" name="phone" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" block>Xác nhận đặt hàng</Button>
                </Form>
            </Modal>
        </div>
    );
};

export default CartPage;