import axios from 'axios';

const api = axios.create({
    // Tự động lấy link
    baseURL: import.meta.env.VITE_API_URL || 'https://localhost:7050/api',
    // 👇 ĐÃ XÓA PHẦN HEADERS CỨNG Ở ĐÂY
});

// Interceptor giữ nguyên (để tự động gửi Token)
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