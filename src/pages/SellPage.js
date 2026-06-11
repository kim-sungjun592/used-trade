import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Camera, X, MapPin, Tag, RefreshCw } from 'lucide-react';
import './SellPage.css';

export default function SellPage() {
  const { addProduct } = useApp();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // 📝 입력 폼 상태 관리
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('전자기기');
  const [location, setLocation] = useState('서울 강남구');
  const [description, setDescription] = useState('');
  
  // 🔄 물물교환 토글 및 입력 상태
  const [isBarterEnabled, setIsBarterEnabled] = useState(false); // 토글 활성화 여부
  const [exchangeItem, setExchangeItem] = useState('');
  
  // 🖼️ 이미지 파일 상태 관리
  const [imagePreview, setImagePreview] = useState(null);

  const handleTriggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !price) {
      alert('💥 글 제목과 가격은 필수 입력 항목입니다!');
      return;
    }

    const newProduct = {
      id: Date.now(),
      title,
      price: Number(price),
      category,
      location,
      // 토글이 켜져있을 때만 입력값을 저장하고, 꺼져있으면 '없음(판매만)'으로 저장
      exchangeItem: isBarterEnabled && exchangeItem ? exchangeItem : '없음 (판매만 가능)',
      description: description || '등록된 상세 설명이 없습니다.',
      image: imagePreview || 'https://via.placeholder.com/400?text=No+Image',
      seller: '박민준',
      status: '상',
      date: new Date().toISOString().split('T')[0]
    };

    if (addProduct) {
      addProduct(newProduct);
    }

    alert('🎉 상품 등록이 성공적으로 완료되었습니다!');
    navigate('/');
  };

  return (
    <div className="sell-page-container">
      <div className="sell-header">
        <h2>물품 등록하기</h2>
        <p>판매하거나 교환할 물품의 정보를 이쁘게 입력해주세요 🥕</p>
      </div>

      <form onSubmit={handleSubmit} className="sell-form-card">
        
        {/* 📸 1. 이미지 업로드 섹션 */}
        <div className="form-section image-upload-section">
          <label className="section-label">상품 이미지</label>
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
          />
          <div className="image-pickers-row">
            <div className="uploader-trigger-box" onClick={handleTriggerFileInput}>
              <Camera size={28} color="#94a3b8" />
              <span>사진 올리기</span>
            </div>
            {imagePreview && (
              <div className="preview-image-container">
                <img src={imagePreview} alt="업로드 미리보기" />
                <button type="button" className="btn-remove-preview" onClick={handleRemoveImage}>
                  <X size={14} color="#fff" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ✏️ 2. 글 제목 */}
        <div className="form-section">
          <label className="section-label">글 제목</label>
          <div className="input-with-icon">
            <Tag size={18} className="input-icon" />
            <input 
              type="text" 
              placeholder="물품 제목을 입력하세요" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
        </div>

        {/* 💵 3. 가격 */}
        <div className="form-section">
          <label className="section-label">가격 (원)</label>
          <div className="input-with-icon">
            <span className="currency-won">₩</span>
            <input 
              type="number" 
              placeholder="가격을 입력하세요 (예: 15000)" 
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
        </div>

        {/* 🔄 4. 물물교환 활성화 토글 버튼 옵션 */}
        <div className="form-section barter-toggle-section">
          <div className="barter-toggle-container">
            <div className="barter-toggle-text">
              <span className="section-label">다른 물건과 교환도 원해요</span>
              <p className="section-sub-label">돈 대신 다른 물품으로 교환 신청을 받을 수 있습니다.</p>
            </div>
            {/* 스위치 스타일의 버튼 */}
            <button 
              type="button" 
              className={`barter-switch ${isBarterEnabled ? 'active' : ''}`}
              onClick={() => setIsBarterEnabled(!isBarterEnabled)}
            >
              <div className="switch-handle" />
            </button>
          </div>

          {/* ⚡ 활성화 상태일 때만 드러나는 입력창 */}
          {isBarterEnabled && (
            <div className="input-with-icon animated-fade-in">
              <RefreshCw size={18} className="input-icon spin-slow" />
              <input 
                type="text" 
                placeholder="어떤 물건과 바꾸고 싶으신가요? (예: 아이패드, 에어팟)" 
                value={exchangeItem}
                onChange={(e) => setExchangeItem(e.target.value)}
                required={isBarterEnabled} // 활성화 시 필수 입력
              />
            </div>
          )}
        </div>

        {/* 📍 5. 거래 희망 지역 */}
        <div className="form-section">
          <label className="section-label">거래 희망 지역</label>
          <div className="input-with-icon">
            <MapPin size={18} className="input-icon" />
            <input 
              type="text" 
              placeholder="예: 서울 강남구 역삼동" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>

        {/* 📝 6. 상세 설명 */}
        <div className="form-section">
          <label className="section-label">신뢰감 주는 상세 설명</label>
          <textarea 
            rows="5" 
            placeholder="구매자에게 물품의 상태(사용 기간, 하자 여부 등)를 상세히 공유해 주세요!"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        {/* 🚀 7. 전송 버튼 */}
        <button type="submit" className="sell-submit-btn">
          작성 완료 및 상품 등록
        </button>
      </form>
    </div>
  );
}