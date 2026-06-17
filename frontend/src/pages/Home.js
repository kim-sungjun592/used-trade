import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, KOREA_REGION_TREE } from '../context/AppContext';
import './Home.css';

const CATEGORIES = ['전체', '전자기기', '패션', '가구/인테리어', '미용/건강', '스포츠', '도서', '취미', '음악', '기타'];

export default function Home() {
  const { 
    filteredProducts, selectedCategory, setSelectedCategory, 
    regionFilter, setRegionFilter, searchQuery, setSearchQuery,
    likedItems, toggleLike
  } = useApp();
  
  const navigate = useNavigate();
  
  // 🗺️ 지역 선택 모달 상태
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [tmpSido, setTmpSido] = useState('');
  const [tmpSigungu, setTmpSigungu] = useState('');

  // 💡 [수정] regionFilter가 정의되지 않았거나 비어있을 때를 대비한 안전 가드 추가
  const getRegionLabel = () => {
    if (!regionFilter || regionFilter.sido === '전국' || !regionFilter.sido) {
      return '📍 지역: 전국구';
    }
    if (regionFilter.sigungu === '전체' || !regionFilter.sigungu) {
      return `📍 ${regionFilter.sido} 전체`;
    }
    if (regionFilter.dong === '전체' || !regionFilter.dong) {
      return `📍 ${regionFilter.sido} ${regionFilter.sigungu}`;
    }
    return `📍 ${regionFilter.sido} ${regionFilter.sigungu} ${regionFilter.dong}`;
  };

  return (
    <div className="home-page">
      
      {/* 🔍 상단 필터/검색바 구역 */}
      <div className="home-filter-bar">
        <button className="region-toggle-btn" onClick={() => setShowRegionModal(!showRegionModal)}>
          {getRegionLabel()}
        </button>

        <div className="search-box">
          <input 
            type="text" 
            placeholder="어떤 상품을 찾으시나요?" 
            value={searchQuery || ''} // 💡 searchQuery가 혹시 비어있어도 에러 안 나게 안전 처리
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {showRegionModal && (
          <div className="triple-modal">
            <div className="modal-top">
              <h5>동네 선택 (시/도 ➡️ 구 ➡️ 동)</h5>
              <button className="reset-btn" onClick={() => {
                setRegionFilter({ sido: '전국', sigungu: '전체', dong: '전체' });
                setTmpSido(''); setTmpSigungu(''); setShowRegionModal(false);
              }}>전국 초기화</button>
            </div>

            <div className="triple-box">
              <div className="col-box">
                {KOREA_REGION_TREE && Object.keys(KOREA_REGION_TREE).map(sido => (
                  <div key={sido} className={`col-item ${tmpSido === sido ? 'active' : ''}`}
                    onClick={() => { setTmpSido(sido); setTmpSigungu(''); }}>{sido}</div>
                ))}
              </div>
              <div className="col-box">
                {tmpSido && KOREA_REGION_TREE[tmpSido] ? (
                  <>
                    <div className="col-item all-item" onClick={() => {
                      setRegionFilter({ sido: tmpSido, sigungu: '전체', dong: '전체' }); setShowRegionModal(false);
                    }}>{tmpSido} 전체 선택</div>
                    {Object.keys(KOREA_REGION_TREE[tmpSido]).map(sigungu => (
                      <div key={sigungu} className={`col-item ${tmpSigungu === sigungu ? 'active' : ''}`}
                        onClick={() => setTmpSigungu(sigungu)}>{sigungu}</div>
                    ))}
                  </>
                ) : <div className="col-empty">시/도 선택</div>}
              </div>
              <div className="col-box">
                {tmpSido && tmpSigungu && KOREA_REGION_TREE[tmpSido][tmpSigungu] ? (
                  <>
                    <div className="col-item all-item" onClick={() => {
                      setRegionFilter({ sido: tmpSido, sigungu: tmpSigungu, dong: '전체' }); setShowRegionModal(false);
                    }}>{tmpSigungu} 전체 선택</div>
                    {KOREA_REGION_TREE[tmpSido][tmpSigungu].map(dong => (
                      <div key={dong} className="col-item" onClick={() => {
                          setRegionFilter({ sido: tmpSido, sigungu: tmpSigungu, dong: dong }); setShowRegionModal(false);
                        }}>{dong}</div>
                    ))}
                  </>
                ) : <div className="col-empty">구/군 선택</div>}
              </div>
            </div>
            <button className="close-btn" onClick={() => setShowRegionModal(false)}>닫기</button>
          </div>
        )}
      </div>

      {/* 🏷️ 카테고리 로우 */}
      <div className="category-row">
        {CATEGORIES.map(cat => (
          <button 
            key={cat} 
            className={`category-item-btn ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 📦 상품 리스트 그리드 */}
      <div className="main-product-grid">
        {filteredProducts && filteredProducts.map(product => {
          const isLiked = likedItems && (
            Array.isArray(likedItems) 
              ? likedItems.includes(product.id) || likedItems.includes(String(product.id))
              : typeof likedItems.has === 'function' ? likedItems.has(String(product.id)) : false
          );

          return (
            <div key={product.id} className="main-card">
              
              <div 
                className="card-img-holder" 
                onClick={() => navigate(`/product/${product.id}`)}
                style={{ position: 'relative', cursor: 'pointer' }} 
              >
                <img src={product.image} alt={product.title} />
                
                <button 
                  className={`main-card-like-btn ${isLiked ? 'liked' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(product.id);
                  }}
                >
                  {isLiked ? '❤️' : '🤍'}
                </button>
              </div>

              <div className="card-details" onClick={() => navigate(`/product/${product.id}`)} style={{ cursor: 'pointer' }}>
                <span className="card-cat">{product.category}</span>
                <h4 className="card-title">{product.title}</h4>
                <p className="card-meta">{product.location}</p>
                <div className="card-price-row">
                  <strong>{product.price.toLocaleString()}원</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}