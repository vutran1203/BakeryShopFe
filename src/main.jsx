import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ConfigProvider } from 'antd'; // Import này

// Bảng màu Bakery
const bakeryTheme = {
  token: {
    colorPrimary: '#d48806', // Màu vàng cam chủ đạo (màu bánh nướng)
    fontFamily: "'Nunito', sans-serif",
    borderRadius: 8, // Bo góc mềm mại hơn
    colorBgContainer: '#ffffff',
  },
  components: {
    Button: {
      fontWeight: 700, // Nút bấm đậm hơn
      borderRadius: 20, // Nút tròn trịa
    },
    Card: {
      borderRadiusLG: 16, // Card bo tròn nhiều hơn
    }
  }
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider theme={bakeryTheme}> {/* Áp dụng theme */}
      <App />
    </ConfigProvider>
  </React.StrictMode>,
)