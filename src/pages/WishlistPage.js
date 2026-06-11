import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './WishlistPage.css'; 

export default function WishlistPage() {
  const context = useApp() || {};
  const products = context.products || [];
  const likedItems = context.likedItems || new Set();
  const toggleLike = context.toggleLike || (() => {});
  const navigate = useNavigate();

  const wishlist = products.filter(p => {
    try {
      if (typeof likedItems.has === 'function') {
        return likedItems.has(p.id) || likedItems.has(String(p.id)) || likedItems.has(Number(p.id));
      } else if (Array.isArray(likedItems)) {
        return likedItems.includes(p.id) || likedItems.includes(String(p.id)) || likedItems.includes(Number(p.id));
      }
      return false;
    } catch (error) {
      return false;
    }
  });

  return (
    <div className="wishlist-layout">
      <div className="wishlist-container">
        
        <div className="wishlist-header">
          <div className="header-title-box">
            <Heart className="header-icon" size={28} fill="#ff6f61" stroke="#ff6f61" />
            <h1>나의 찜 목록</h1>
            <span className="wish-badge">{wishlist.length}</span>
          </div>
          <p className="header-subtitle">마음에 쏙 든 상품들을 모아봤어요 💕</p>
        </div>

        {wishlist.length === 0 ? (
          <div className="wishlist-empty">
            <div className="empty-icon-circle">
              <ShoppingBag size={48} color="#cbd5e1" strokeWidth={1.5} />
            </div>
            <h3>아직 찜한 상품이 없어요</h3>
            <p>마음에 드는 상품에 하트를 꾹 눌러보세요!</p>
            <Link to="/" className="btn-browse">인기 상품 둘러보기</Link>
          </div>
        ) : (
          <div className="wish-product-grid">
            {wishlist.map(p => (
              <div key={p.id} className="wish-card">
                <div className="wish-img-holder" onClick={() => navigate(`/product/${p.id}`)}>
                  <img src={p.image} alt={p.title} />
                  <button 
                    className="wish-like-btn liked"
                    onClick={(e) => {
                      e.stopPropagation(); 
                      toggleLike(p.id); 
                    }}
                  >
                    ❤️
                  </button>
                </div>

                <div className="wish-details" onClick={() => navigate(`/product/${p.id}`)}>
                  <span className="wish-cat">{p.category}</span>
                  <h4 className="wish-title">{p.title}</h4>
                  <p className="wish-meta">📍 {p.location}</p>
                  <div className="wish-price-row">
                    <strong>{p.price.toLocaleString()}원</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}