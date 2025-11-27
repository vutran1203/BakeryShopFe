import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, IdcardOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const { Title } = Typography;

const RegisterPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        try {
            setLoading(true);
            // Gọi API đăng ký của Backend
            // values gồm: username, password, email, fullName
            await api.post('/Auth/register', values);
            
            message.success('Đăng ký thành công! Vui lòng đăng nhập.');
            navigate('/login'); // Chuyển sang trang đăng nhập
        } catch (error) {
            // Lấy lỗi từ Backend (VD: "Email đã tồn tại")
            const msg = error.response?.data?.message || 'Đăng ký thất bại!';
            message.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5' }}>
            <Card style={{ width: 400, padding: 20 }}>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <Title level={3}>📝 Đăng Ký Tài Khoản</Title>
                </div>

                <Form layout="vertical" onFinish={onFinish}>
                    <Form.Item 
                        name="fullName" 
                        rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                    >
                        <Input prefix={<IdcardOutlined />} placeholder="Họ và tên" size="large" />
                    </Form.Item>

                    <Form.Item 
                        name="email" 
                        rules={[
                            { required: true, message: 'Vui lòng nhập Email!' },
                            { type: 'email', message: 'Email không hợp lệ!' }
                        ]}
                    >
                        <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
                    </Form.Item>

                    <Form.Item 
                        name="username" 
                        rules={[{ required: true, message: 'Vui lòng nhập Username!' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" size="large" />
                    </Form.Item>

                    <Form.Item 
                        name="password" 
                        rules={[
                            { required: true, message: 'Vui lòng nhập Password!' },
                            { min: 6, message: 'Mật khẩu phải trên 6 ký tự!' }
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" size="large" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                            Đăng ký ngay
                        </Button>
                    </Form.Item>

                    <div style={{ textAlign: 'center' }}>
                        Đã có tài khoản? <Link to="/login">Đăng nhập tại đây</Link>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default RegisterPage;