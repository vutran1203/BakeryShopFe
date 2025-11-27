import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, message } from 'antd';
import { ShoppingCartOutlined, UserOutlined, DollarCircleOutlined, AppstoreOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../services/api';

const DashboardPage = () => {
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalRevenue: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/Dashboard/summary');
                setStats(res.data);
            } catch (err) {
                message.error("Lỗi tải thống kê!");
            }
        };
        fetchStats();
    }, []);

    // Dữ liệu giả lập cho biểu đồ (Vì DB chưa đủ dữ liệu theo ngày)
    const dataChart = [
        { name: 'T1', doanhThu: 4000000 },
        { name: 'T2', doanhThu: 3000000 },
        { name: 'T3', doanhThu: 2000000 },
        { name: 'T4', doanhThu: 2780000 },
        { name: 'T5', doanhThu: 1890000 },
        { name: 'T6', doanhThu: 2390000 },
        { name: 'T7', doanhThu: 3490000 },
    ];

    return (
        <div style={{ padding: 20 }}>
            <h2>📊 Tổng quan hệ thống</h2>
            
            {/* Phần thẻ số liệu */}
            <Row gutter={16} style={{ marginBottom: 30 }}>
                <Col span={6}>
                    <Card bordered={false}>
                        <Statistic 
                            title="Doanh thu" 
                            value={stats.totalRevenue} 
                            prefix={<DollarCircleOutlined />} 
                            suffix="đ" 
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false}>
                        <Statistic 
                            title="Đơn hàng" 
                            value={stats.totalOrders} 
                            prefix={<ShoppingCartOutlined />} 
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false}>
                        <Statistic 
                            title="Sản phẩm" 
                            value={stats.totalProducts} 
                            prefix={<AppstoreOutlined />} 
                            valueStyle={{ color: '#1677ff' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false}>
                        <Statistic 
                            title="Khách hàng" 
                            value={stats.totalUsers} 
                            prefix={<UserOutlined />} 
                        />
                    </Card>
                </Col>
            </Row>

            {/* Phần biểu đồ */}
            <Card title="Biểu đồ doanh thu tuần qua (Demo)">
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <BarChart data={dataChart}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => new Intl.NumberFormat('vi-VN').format(value) + ' đ'} />
                            <Legend />
                            <Bar dataKey="doanhThu" name="Doanh thu" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
    );
};

export default DashboardPage;