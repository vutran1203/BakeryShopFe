import React, { useEffect, useState } from 'react';
import { Form, Input, Button, message, Card, Upload, Image, Tabs } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import api from '../services/api';

const WebsiteSettings = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [currentInfo, setCurrentInfo] = useState(null);

    const fetchInfo = async () => {
        try {
            const res = await api.get('/WebsiteInfo');
            setCurrentInfo(res.data);
            form.setFieldsValue(res.data);
        } catch (err) { message.error("Lỗi tải dữ liệu!"); }
    };

    useEffect(() => { fetchInfo(); }, []);

    const handleSave = async (values) => {
        setLoading(true);
        try {
            const formData = new FormData();
            // Append Text Fields (Lấy hết key từ values)
            Object.keys(values).forEach(key => {
                if (values[key] && !key.includes('File')) formData.append(key, values[key]);
            });

            // Append Files
            if (values.logoFile?.file) formData.append('LogoFile', values.logoFile.file.originFileObj);
            if (values.bannerFile?.file) formData.append('BannerFile', values.bannerFile.file.originFileObj);
            if (values.aboutUsImageFile?.file) formData.append('AboutUsImageFile', values.aboutUsImageFile.file.originFileObj);

            await api.put('/WebsiteInfo', formData);
            message.success("Cập nhật thành công!");
            fetchInfo(); // Refresh ảnh
        } catch (err) { message.error("Lỗi cập nhật!"); } 
        finally { setLoading(false); }
    };

    // --- CẤU HÌNH TABS ---
    const items = [
        {
            key: '1', label: '🏠 Trang Chủ & Chung',
            children: (
                <>
                    <Form.Item label="Tên Cửa Hàng" name="shopName"><Input /></Form.Item>
                    <Form.Item label="Slogan (Banner)" name="slogan"><Input /></Form.Item>
                    <div style={{display:'flex', gap: 20}}>
                        <Form.Item label="Logo" name="logoFile">
                            <Upload maxCount={1} beforeUpload={() => false} listType="picture"><Button icon={<UploadOutlined />}>Đổi Logo</Button></Upload>
                            {currentInfo?.logoUrl && <Image width={80} src={currentInfo.logoUrl} />}
                        </Form.Item>
                        <Form.Item label="Banner Chính" name="bannerFile">
                            <Upload maxCount={1} beforeUpload={() => false} listType="picture"><Button icon={<UploadOutlined />}>Đổi Banner</Button></Upload>
                            {currentInfo?.bannerUrl && <Image width={150} src={currentInfo.bannerUrl} />}
                        </Form.Item>
                    </div>
                </>
            )
        },
        {
            key: '2', label: '📞 Liên Hệ (Footer)',
            children: (
                <>
                    <Form.Item label="Địa chỉ" name="address"><Input.TextArea rows={2} /></Form.Item>
                    <Form.Item label="Email" name="contactEmail"><Input /></Form.Item>
                    <Form.Item label="Số điện thoại" name="contactPhone"><Input /></Form.Item>
                    <Form.Item label="Copyright Footer" name="footerContent"><Input /></Form.Item>
                </>
            )
        },
        {
            key: '3', label: '📖 Giới Thiệu (About Us)',
            children: (
                <>
                    <Form.Item label="Tiêu đề bài viết" name="aboutUsTitle"><Input /></Form.Item>
                    <Form.Item label="Nội dung chi tiết" name="aboutUsContent"><Input.TextArea rows={6} /></Form.Item>
                    <Form.Item label="Ảnh minh họa" name="aboutUsImageFile">
                        <Upload maxCount={1} beforeUpload={() => false} listType="picture"><Button icon={<UploadOutlined />}>Đổi Ảnh</Button></Upload>
                        {currentInfo?.aboutUsImageUrl && <Image width={150} src={currentInfo.aboutUsImageUrl} />}
                    </Form.Item>
                </>
            )
        }
    ];

    return (
        <Card title="⚙️ Quản lý thông tin Website">
            <Form form={form} layout="vertical" onFinish={handleSave}>
                <Tabs defaultActiveKey="1" items={items} />
                <Button type="primary" htmlType="submit" loading={loading} block size="large" style={{marginTop: 20}}>Lưu Thay Đổi</Button>
            </Form>
        </Card>
    );
};
export default WebsiteSettings;