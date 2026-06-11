import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import './MyPage.css';

export default function MyPage() {
  const { 
    currentUser, 
    myPoints, 
    barterRequests, 
    updateUserInfo,
    products,       
    likedProducts   
  } = useApp();

  const navigate = useNavigate();

  // 🗂️ 하단 탭 상태 관리 ('info' | 'myItems' | 'likes' | 'barter')
  const [activeTab, setActiveTab] = useState('info');

  // 로그인 기능이 제거되었으므로, 가상의 유저 기본값 세팅 (에러 방지)
  const user = currentUser || { id: 'user_guest', name: '홍길동', email: 'guest@example.com', password: '123' };
  const points = myPoints || 0;
  const requests = barterRequests || [];
  const items = products || [];
  const likes = likedProducts || [];

  // 회원정보 수정 모드 상태들
  const [isEditMode, setIsEditMode] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [editName, setEditName] = useState(user.name);
  const [editEmail, setEditEmail] = useState(user.email);
  const [editPassword, setEditPassword] = useState('');

  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // 내가 올린 상품들 필터링
  const myUploadedProducts = items.filter(
    p => p.seller === user.name || p.sellerId === user.id
  );

  // 현재 비밀번호 검증 핸들러
  const handleVerifyPassword = (e) => {
    e.preventDefault();
    if (confirmPassword === user.password) {
      setIsEditMode(true);
      setMessage('');
    } else {
      setMessage('❌ 현재 비밀번호가 일치하지 않습니다. (테스트용 비번: ' + user.password + ')');
      setIsSuccess(false);
    }
  };

  // 변경된 정보 저장 핸들러
  const handleSaveInfo = (e) => {
    e.preventDefault();
    if (!editName || !editEmail) {
      setMessage('❌ 빈칸을 모두 채워주세요.');
      return;
    }

    if (updateUserInfo) {
      updateUserInfo({
        name: editName,
        email: editEmail,
        password: editPassword || user.password
      });
    }
    
    setMessage('✨ 회원정보가 안전하게 변경되었습니다! (시뮬레이션)');
    setIsSuccess(true);
    setIsEditMode(false);
    setConfirmPassword('');
    setEditPassword('');
  };

  return (
    <div className="mypage-container">
      
      {/* 💳 1. 최상단 대시보드 */}
      <div className="user-dash-card">
        <div className="user-avatar">👤</div>
        <div className="user-dash-info">
          <h3>{user.name} <span>({user.id})</span></h3>
          <p>보유 포인트: <strong>{points.toLocaleString()} P</strong></p>
        </div>
      </div>

      {/* 🗂️ 2. 네비게이션 탭 메뉴 */}
      <div className="mypage-tabs">
        <button className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>⚙️ 정보 수정</button>
        <button className={`tab-btn ${activeTab === 'myItems' ? 'active' : ''}`} onClick={() => setActiveTab('myItems')}>📦 내 등록 상품 ({myUploadedProducts.length})</button>
        <button className={`tab-btn ${activeTab === 'likes' ? 'active' : ''}`} onClick={() => setActiveTab('likes')}>❤️ 찜 목록 ({likes.length})</button>
        <button className={`tab-btn ${activeTab === 'barter' ? 'active' : ''}`} onClick={() => setActiveTab('barter')}>🔄 교환 내역 ({requests.length})</button>
      </div>

      {/* 📺 3. 탭 결과 화면 컨텐츠 구역 */}
      <div className="mypage-main-content">
        
        {/* ⚙️ 탭 [A] : 회원정보 수정 */}
        {activeTab === 'info' && (
          <div className="mypage-tab-pane">
            <div className="pane-header"><h4>회원정보 관리</h4></div>
            
            {message && <div className={`mypage-alert ${isSuccess ? 'alert-success' : 'alert-danger'}`}>{message}</div>}

            {!isEditMode ? (
              <div className="info-view-box">
                <div className="info-row"><span className="info-label">아이디</span><span className="info-value readonly">{user.id}</span></div>
                <div className="info-row"><span className="info-label">닉네임</span><span className="info-value">{user.name}</span></div>
                <div className="info-row"><span className="info-label">이메일</span><span className="info-value">{user.email}</span></div>
                <hr className="info-divider" />
                <form onSubmit={handleVerifyPassword} className="password-check-form">
                  <p className="form-guide">⚠️ 안전을 위해 현재 비밀번호를 입력해야 정보 수정이 가능합니다.</p>
                  <div className="input-group">
                    <input type="password" placeholder="현재 비밀번호 입력" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    <button type="submit" className="btn-verify">인증 후 수정</button>
                  </div>
                </form>
              </div>
            ) : (
              <form onSubmit={handleSaveInfo} className="info-edit-form">
                <div className="edit-field"><label>닉네임 변경</label><input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required /></div>
                <div className="edit-field"><label>이메일 변경</label><input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} required /></div>
                <div className="edit-field"><label>새 비밀번호 (변경할 경우만 입력)</label><input type="password" placeholder="새비밀번호" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} /></div>
                <div className="edit-btn-group">
                  <button type="submit" className="btn-save-changes">저장하기</button>
                  <button type="button" className="btn-cancel-edit" onClick={() => { setIsEditMode(false); setMessage(''); }}>취소</button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* 📦 탭 [B] : 내가 올린 상품 리스트 */}
        {activeTab === 'myItems' && (
          <div className="mypage-tab-pane">
            <div className="pane-header"><h4>내가 등록한 거래물품</h4></div>
            <div className="mypage-product-list">
              {myUploadedProducts.length === 0 ? (
                <p className="empty-txt">아직 등록한 상품이 없습니다. 첫 상품을 등록해 보세요!</p>
              ) : (
                myUploadedProducts.map(product => (
                  <div key={product.id} className="mypage-item-card" onClick={() => navigate(`/product/${product.id}`)}>
                    <img src={product.image} alt={product.title} className="mini-card-img" />
                    <div className="mini-card-info">
                      <h5>{product.title}</h5>
                      <span>{product.price.toLocaleString()}원</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ❤️ 탭 [C] : 내가 찜한 상품 리스트 */}
        {activeTab === 'likes' && (
          <div className="mypage-tab-pane">
            <div className="pane-header"><h4>내가 하트 누른 찜 목록</h4></div>
            <div className="mypage-product-list">
              {likes.length === 0 ? (
                <p className="empty-txt">❤️ 찜한 상품이 없습니다. 메인에서 하트를 날려보세요!</p>
              ) : (
                likes.map(product => (
                  <div key={product.id} className="mypage-item-card" onClick={() => navigate(`/product/${product.id}`)}>
                    <img src={product.image} alt={product.title} className="mini-card-img" />
                    <div className="mini-card-info">
                      <h5>{product.title}</h5>
                      <span>{product.price.toLocaleString()}원</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 🔄 탭 [D] : 물물교환 요청 기록 */}
        {activeTab === 'barter' && (
          <div className="mypage-tab-pane">
            <div className="pane-header"><h4>물물교환 신청 내역</h4></div>
            <div className="barter-list">
              {requests.length === 0 ? (
                <p className="empty-txt">교환 신청 내역이 깨끗합니다.</p>
              ) : (
                requests.map(req => (
                  <div key={req.id} className="barter-card-item">
                    <div className="barter-item-title">{req.productTitle}</div>
                    <div className="barter-item-detail">
                      <span>제안 물품: <b>{req.proposedItem}</b></span>
                      <span className={`status-badge ${req.status}`}>{req.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}