import React, { useState } from 'react';
import { Heart, Search, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import './WishlistPage.css';

export default function WishlistPage() {
  const { likedProducts } = useApp();
  const { toggleLike } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [removingId, setRemovingId] = useState(null);

  // likedProducts 는 AppContext에서 이미 products.filter(...)로 만들어진 배열
  const likes = Array.isArray(likedProducts) ? likedProducts : [];

  const filtered = likes.filter(p =>
    (p.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleRemove = (e, id) => {
    e.stopPropagation();
    setRemovingId(id);
    setTimeout(() => {
      toggleLike(id);
      setRemovingId(null);
    }, 300);
  };

  return (
    <div className="wishlist-page">
      <div className="wishlist-inner">

        {/* 헤더 */}
        <div className="wishlist-header">
          <div className="wishlist-title-row">
            <div className="wishlist-icon-wrap">
              <Heart size={24} fill="white" color="white" />
            </div>
            <div>
              <h1>찜한 상품</h1>
              <p>관심 있는 상품을 모아뒀어요</p>
            </div>
          </div>
          <div className="wishlist-count-badge">
            총 <strong>{likes.length}</strong>개
          </div>
        </div>

        {/* 검색바 */}
        {likes.length > 0 && (
          <div className="wishlist-search-wrap">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="찜 목록에서 검색..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        )}

        {/* 빈 상태 */}
        {likes.length === 0 ? (
          <div className="wishlist-empty">
            <div className="empty-heart-anim">
              <Heart size={56} color="#e2e8f0" />
            </div>
            <h3>아직 찜한 상품이 없어요</h3>
            <p>마음에 드는 상품에 하트를 눌러보세요</p>
            <button className="go-home-btn" onClick={() => navigate('/')}>
              <ShoppingBag size={16} />
              상품 둘러보기
              <ArrowRight size={16} />
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="wishlist-empty">
            <p style={{ color: '#94a3b8' }}>"{search}" 와 일치하는 상품이 없어요</p>
          </div>
        ) : (
          <div className="wishlist-grid">
            {filtered.map(product => (
              <div
                key={product.id}
                className={`wishlist-card ${removingId === product.id ? 'removing' : ''}`}
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <div className="wl-img-wrap">
                  <img
                    src={product.image}
                    alt={product.title}
                    onError={e => {
                      e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop';
                    }}
                  />
                  <button
                    className="wl-remove-btn"
                    onClick={e => handleRemove(e, product.id)}
                    title="찜 해제"
                  >
                    <Trash2 size={14} />
                  </button>
                  {product.category && (
                    <span className="wl-category-chip">{product.category}</span>
                  )}
                </div>

                <div className="wl-card-body">
                  <p className="wl-title">{product.title}</p>
                  <div className="wl-bottom-row">
                    <span className="wl-price">
                      {product.price != null
                        ? product.price.toLocaleString() + '원'
                        : '가격 미정'}
                    </span>
                    {product.location && (
                      <span className="wl-location">{product.location}</span>
                    )}
                  </div>
                  {product.exchangeItem && (
                    <div className="wl-exchange-tag">🔄 {product.exchangeItem}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}