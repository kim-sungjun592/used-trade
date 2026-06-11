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
import ChatPage from './pages/ChatPage'; // 👈 누락되었던 진짜 채팅 페이지 복구!

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
            
            {/* 상단 [물품 등록] 버튼이 연결되는 주소창 경로들 완벽 매칭 */}
            <Route path="/write" element={<SellPage />} />
            <Route path="/sell" element={<SellPage />} /> 
            
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/likes" element={<WishlistPage />} />
            <Route path="/barter" element={<BarterPage />} />
            
            {/* 👈 하단 [채팅으로 거래하기] 버튼 누르면 연동되는 진짜 채팅 경로 연결 */}
            <Route path="/chat" element={<ChatPage />} />
          </Routes>
        </main>
      </div>
    </AppProvider>
  );
}