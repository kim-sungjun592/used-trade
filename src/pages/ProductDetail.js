import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, MapPin, Calendar, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './ProductDetail.css'; // ✨ 최고급 디자인 스타일시트 연결

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // AppContext 안전하게 가져오기 (에러 방지 로직 포함)
  const context = useApp() || {};
  const products = context.products || [];
  const likedItems = context.likedItems || new Set();
  const toggleLike = context.toggleLike || (() => {});
  
  // 🔥 1. context에서 채팅 시작 함수(startChat)를 안전하게 꺼내옵니다.
  const startChat = context.startChat || (() => { console.log('채팅 기능이 연결되지 않았습니다.'); });

  // 현재 상품 찾기
  const product = products.find(p => String(p.id) === String(id));

  // 데이터가 없을 때 뻗지 않도록 예외 처리
  if (!product) {
    return (
      <div className="detail-error-screen">
        <h3>상품 정보를 불러올 수 없습니다.</h3>
        <button onClick={() => navigate('/')}>홈으로 돌아가기</button>
      </div>
    );
  }

  // 찜 상태 확인 (Set 또는 Array 구조 모두 완벽 대응)
  const isLiked = typeof likedItems.has === 'function'
    ? likedItems.has(product.id) || likedItems.has(String(product.id)) || likedItems.has(Number(product.id))
    : Array.isArray(likedItems)
      ? likedItems.includes(product.id) || likedItems.includes(String(product.id)) || likedItems.includes(Number(product.id))
      : false;

  // 🔥 2. 버튼을 눌렀을 때 실행될 마법의 함수를 만들어줍니다.
  const handleChatClick = () => {
    startChat(product); // 채팅방을 만들거나 찾고
    navigate('/chat');  // 채팅 페이지로 화면을 넘깁니다!
  };

  return (
    <div className="detail-page-layout">
      <div className="detail-page-container">
        
        {/* ⬅️ 뒤로가기 상단 바 */}
        <div className="detail-top-nav">
          <button className="btn-circle-back" onClick={() => navigate(-1)} aria-label="뒤로가기">
            <ArrowLeft size={20} color="#1e293b" />
            <span>뒤로가기</span>
          </button>
        </div>

        {/* 📦 메인 컨텐츠 영역 (이미지 + 우측 정보) */}
        <div className="detail-main-content">
          
          {/* 왼쪽: 큰 상품 이미지 */}
          <div className="detail-image-wrapper">
            <img src={product.image} alt={product.title} />
          </div>

          {/* 오른쪽: 메타 정보 디테일 */}
          <div className="detail-info-wrapper">
            
            {/* 카테고리 및 상태 뱃지 */}
            <div className="detail-badge-row">
              <span className="badge-category">{product.category || '카테고리'}</span>
              <span className="badge-status">상태: {product.status || product.condition || '상'}</span>
            </div>

            {/* 상품 제목 */}
            <h1 className="detail-product-title">{product.title}</h1>

            {/* 위치 및 날짜 */}
            <div className="detail-meta-row">
              <span className="meta-item">
                <MapPin size={14} /> {product.location || '위치 정보 없음'}
              </span>
              <span className="meta-divider">•</span>
              <span className="meta-item">
                <Calendar size={14} /> {product.date || '2024-01-18'}
              </span>
            </div>

            {/* 가격 표시 */}
            <div className="detail-price-box">
              <h2>{(product.price || 0).toLocaleString()}<span>원</span></h2>
            </div>

            <div className="detail-divider"></div>

            {/* 상품 설명 문구 */}
            <div className="detail-description-box">
              <p>{product.description || '등록된 상세 설명이 없습니다.'}</p>
            </div>

            {/* 🔄 희망 교환 물건 섹션 */}
            <div className="detail-exchange-card">
              <div className="exchange-icon-circle">
                <RefreshCw size={16} color="#059669" />
              </div>
              <div className="exchange-info-text">
                <span className="exchange-label">희망 교환 물건</span>
                <strong className="exchange-value">{product.exchangeItem || product.exchange || '아디다스 운동화'}</strong>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* 📱 고정식 하단 액션 바 (글래스모피즘 효과) */}
      <div className="detail-bottom-bar">
        <div className="bottom-bar-inner">
          
          {/* 하트 찜 버튼 */}
          <button 
            className={`bottom-heart-btn ${isLiked ? 'active' : ''}`}
            onClick={() => toggleLike(product.id)}
          >
            <Heart size={24} fill={isLiked ? '#ff6f61' : 'none'} color={isLiked ? '#ff6f61' : '#64748b'} />
          </button>
          
          <div className="bottom-vertical-divider"></div>

          {/* 🔥 3. 기존의 alert 창을 지우고, 방금 만든 handleChatClick 함수를 연결합니다. */}
          <button className="bottom-chat-btn" onClick={handleChatClick}>
            <MessageCircle size={20} />
            <span>채팅으로 거래하기</span>
          </button>

        </div>
      </div>
    </div>
  );
}