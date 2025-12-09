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
        try {
            setLoading(true);
            const formData = new FormData();

            // 1. XỬ LÝ TEXT (Chống lỗi null/undefined gây 400)
            // Nếu không có giá trị thì gửi chuỗi rỗng ""
            formData.append('ShopName', values.shopName || ""); 
            formData.append('Slogan', values.slogan || "");
            formData.append('Address', values.address || "");
            formData.append('ContactEmail', values.contactEmail || "");
            formData.append('ContactPhone', values.contactPhone || "");
            formData.append('FooterContent', values.footerContent || "");
            formData.append('AboutUsTitle', values.aboutUsTitle || "");
            formData.append('AboutUsContent', values.aboutUsContent || "");

            formData.append('FacebookUrl', values.facebookUrl || "");

            // 2. XỬ LÝ ẢNH (Chỉ append khi có file thực sự)
            // Ant Design Upload đôi khi trả về mảng rỗng hoặc file ảo, cần check kỹ
            
            // >> Logo
            if (values.logoFile?.file?.originFileObj) {
                formData.append('LogoFile', values.logoFile.file.originFileObj);
            } else if (values.logoFile?.fileList?.[0]?.originFileObj) {
                 formData.append('LogoFile', values.logoFile.fileList[0].originFileObj);
            }

            // >> Banner
            if (values.bannerFile?.file?.originFileObj) {
                formData.append('BannerFile', values.bannerFile.file.originFileObj);
            } else if (values.bannerFile?.fileList?.[0]?.originFileObj) {
                formData.append('BannerFile', values.bannerFile.fileList[0].originFileObj);
            }

            // >> Ảnh About Us
            if (values.aboutUsImageFile?.file?.originFileObj) {
                formData.append('AboutUsImageFile', values.aboutUsImageFile.file.originFileObj);
            } else if (values.aboutUsImageFile?.fileList?.[0]?.originFileObj) {
                formData.append('AboutUsImageFile', values.aboutUsImageFile.fileList[0].originFileObj);
            }

            // 3. GỌI API (DÙNG PATCH)
            await api.patch('/WebsiteInfo', formData); // 👈 Đổi put -> patch
            
            message.success("Cập nhật thành công!");
            fetchInfo(); 
        } catch (err) {
            console.error(err);
            // In lỗi chi tiết ra để biết sai ở đâu
            if (err.response?.data?.errors) {
                message.error("Lỗi dữ liệu: " + JSON.stringify(err.response.data.errors));
            } else {
                message.error("Có lỗi xảy ra! Kiểm tra lại kết nối.");
            }
        } finally {
            setLoading(false);
        }
    };

    // --- CẤU HÌNH TABS ---
    const items = [
        {
            key: '1', label: '🏠 Trang Chủ & Chung',
            children: (
                <>
                    <Form.Item label="Tên Cửa Hàng" name="shopName"><Input /></Form.Item>
                    <Form.Item label="Slogan (Banner)" name="slogan"><Input /></Form.Item>
                    <Form.Item label="Link Facebook Messenger" name="facebookUrl">
                        <Input placeholder="https://m.me/..." />
                    </Form.Item>
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