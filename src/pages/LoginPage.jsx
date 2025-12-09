import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, App } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

const { Title } = Typography;



const LoginPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { message } = App.useApp();

    const onFinish = async (values) => {
        try {
            setLoading(true);
        const response = await api.post('/Auth/login', values);
        
        // 1. Lưu Token
        localStorage.setItem('token', response.data.token);
        
        // 2. Lưu thông tin User (để dùng hiển thị tên, check quyền)
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        message.success('Đăng nhập thành công!');

        // 3. KIỂM TRA QUYỀN ĐỂ ĐIỀU HƯỚNG
        if (response.data.user.role === 'Admin') {
            navigate('/admin'); // Admin vào trang quản trị
        } else {
            navigate('/'); // Khách về trang chủ
        }
        } catch (error) {
            const msg = error.response?.data?.message || 'Đăng nhập thất bại!';
            message.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5' }}>
            <Card style={{ width: 400, padding: 20 }}>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <Title level={3}>🔐 Đăng Nhập</Title>
                </div>
                <Form layout="vertical" onFinish={onFinish}>
                    <Form.Item name="username" rules={[{ required: true, message: 'Nhập username!' }]}>
                        <Input prefix={<UserOutlined />} placeholder="Username" size="large" />
                    </Form.Item>
                    <Form.Item name="password" rules={[{ required: true, message: 'Nhập password!' }]}>
                        <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                            Đăng nhập
                        </Button>
                    </Form.Item>
                    <div style={{ textAlign: 'center' }}>
        Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
    </div>
                </Form>
            </Card>
            
        </div>
        
    );
};

export default LoginPage;