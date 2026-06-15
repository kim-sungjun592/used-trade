import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import MyPage from './pages/MyPage';
import SellPage from './pages/SellPage';
import ProductDetail from './pages/ProductDetail';
import WishlistPage from './pages/WishlistPage';
import BarterPage from './pages/BarterPage';
import ChatPage from './pages/ChatPage';

import './App.css';

export default function App() {
  return (
    <AppProvider>
      <div className="app-wrapper">
        <Navbar />
        <main className="app-main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/write" element={<SellPage />} />
            <Route path="/sell" element={<SellPage />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/likes" element={<WishlistPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/barter" element={<BarterPage />} />
            <Route path="/chat" element={<ChatPage />} />
          </Routes>
        </main>
      </div>
    </AppProvider>
  );
}