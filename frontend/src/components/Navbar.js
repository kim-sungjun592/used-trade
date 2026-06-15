import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Heart, RefreshCw, ShoppingBag, MessageSquare, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './Navbar.css';

export default function Navbar() {
  const { isHeaderMenuOpen, toggleHeaderMenu, myPoints } = useApp();
  const navigate = useNavigate();

  return (
    <nav className="app-navbar">
      <div className="container navbar-inner">
        <Link to="/" className="logo">
          <span>🥕 secondhand-market</span>
        </Link>

        <div className="navbar-links">
          <Link to="/sell" className="btn-sell-nav">물품 등록</Link>
          <Link to="/chat" className="nav-icon-link" title="채팅방"><MessageSquare size={22} /></Link>
          
          {/* 🍔 하나로 통합된 '내 메뉴' 드롭다운 */}
          <div className="my-menu-wrapper">
            <button className="my-menu-btn" onClick={toggleHeaderMenu}>
              <div className="nav-avatar"><User size={18} /></div>
              <span className="nav-user-name">내 메뉴</span>
              <ChevronDown size={14} className={`nav-arrow ${isHeaderMenuOpen ? 'open' : ''}`} />
            </button>

            {isHeaderMenuOpen && (
              <div className="my-menu-popover">
                <div className="popover-user">
                  <strong>나 (테스트)</strong>
                  <span className="popover-points">{myPoints.toLocaleString()}P</span>
                </div>
                <hr />
                <button onClick={() => { navigate('/barter'); toggleHeaderMenu(); }} className="popover-item">
                  <RefreshCw size={16} /> 물물교환 내역
                </button>
                <button onClick={() => { navigate('/wishlist'); toggleHeaderMenu(); }} className="popover-item">
                  <Heart size={16} /> 찜한 상품
                </button>
                <button onClick={() => { navigate('/mypage'); toggleHeaderMenu(); }} className="popover-item">
                  <ShoppingBag size={16} /> 마이페이지
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}