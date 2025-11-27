import axios from 'axios';

const api = axios.create({
    // Tự động lấy link: Nếu có biến môi trường thì dùng, không thì dùng localhost
    baseURL: import.meta.env.VITE_API_URL || 'https://localhost:7050/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Cấu hình tự động gửi Token nếu có (để sau này dùng cho Admin/Đặt hàng)
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;