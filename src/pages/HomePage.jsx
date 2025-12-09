import React, { useEffect, useState } from 'react';
import { Typography, Grid } from 'antd';
import api from '../services/api';

const HomePage = () => {
    const [products, setProducts] = useState([]);
    const [rawResponse, setRawResponse] = useState(null); // Lưu response gốc để soi

    const fetchProducts = async () => {
        try {
            const url = `/Products?page=1&pageSize=8`;
            console.log("Fetching URL:", url);
            
            const response = await api.get(url);
            console.log("Response gốc:", response);
            
            setRawResponse(response); // Lưu lại toàn bộ cục response

            const payload = response.data;
            
            // Logic bóc tách dữ liệu
            let safeData = [];
            if (Array.isArray(payload)) safeData = payload;
            else if (payload?.data && Array.isArray(payload.data)) safeData = payload.data;
            else if (payload?.Data && Array.isArray(payload.Data)) safeData = payload.Data;
            
            setProducts(safeData); // Gán vào state

        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // --- GIAO DIỆN DEBUG (KHÔNG DÙNG MAP ĐỂ TRÁNH CRASH) ---
    return (
        <div style={{ padding: 50, fontFamily: 'monospace' }}>
            <h1 style={{ color: 'red' }}>CHẾ ĐỘ DEBUG DỮ LIỆU</h1>
            
            <div style={{ marginBottom: 20, padding: 20, border: '2px solid blue' }}>
                <h3>1. Kiểm tra biến 'products':</h3>
                <p>Là mảng (Array)? : <b style={{fontSize: 20}}>{Array.isArray(products) ? "✅ ĐÚNG" : "❌ SAI (Nó là Object/Null)"}</b></p>
                <p>Số lượng phần tử: <b>{products?.length}</b></p>
            </div>

            <div style={{ display: 'flex', gap: 20 }}>
                <div style={{ flex: 1, padding: 20, background: '#f5f5f5' }}>
                    <h3>2. Dữ liệu 'products' hiện tại:</h3>
                    <pre style={{ whiteSpace: 'pre-wrap' }}>
                        {JSON.stringify(products, null, 2)}
                    </pre>
                </div>

                <div style={{ flex: 1, padding: 20, background: '#fff0f0' }}>
                    <h3>3. Dữ liệu Response gốc từ API:</h3>
                    <pre style={{ whiteSpace: 'pre-wrap' }}>
                        {JSON.stringify(rawResponse, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    );
};

export default HomePage;