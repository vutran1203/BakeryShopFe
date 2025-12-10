import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import AdminLayout from './components/AdminLayout';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CartPage from './pages/CartPage';
import MyOrdersPage from './pages/MyOrdersPage';
import SearchPage from './pages/SearchPage';
import AboutPage from './pages/AboutPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';

import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import AdminOrderPage from './pages/AdminOrderPage';
import AdminCategoryPage from './pages/AdminCategoryPage';
import WebsiteSettings from './pages/WebsiteSettings';
import { useLocation } from 'react-router-dom';
import ReactGA from "react-ga4";
import { useEffect } from 'react';


function App() {

const location = useLocation();
    useEffect(() => {
      ReactGA.send({ hitType: "pageview", page: location.pathname + location.search });
    }, [location]); 

  return (

    <Routes>

      {/* --- KHÁCH HÀNG (dùng MainLayout) --- */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="my-orders" element={<MyOrdersPage />} />

        <Route path="search" element={<SearchPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="product/:id" element={<ProductDetailPage />} />
      </Route>

      {/* --- ADMIN (dùng AdminLayout) --- */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<AdminPage />} />
        <Route path="orders" element={<AdminOrderPage />} />
        <Route path="categories" element={<AdminCategoryPage />} />
        <Route path="settings" element={<WebsiteSettings />} />
      </Route>

      {/* --- 404 fallback --- */}
      <Route path="*" element={<Navigate to="/" />} />

    </Routes>
  );
}

export default App;
