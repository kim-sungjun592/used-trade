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
    verifyPassword,
    myProducts,
    likedProducts
  } = useApp();

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');

  const user = currentUser || { name: '게스트', email: '', id: 'guest' };
  const points = myPoints || 0;
  const requests = barterRequests || [];
  const likes = likedProducts || [];

  // 회원정보 수정 상태
  const [isEditMode, setIsEditMode] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [editName, setEditName] = useState(user.name);
  const [editEmail, setEditEmail] = useState(user.email);
  const [editPassword, setEditPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // ✅ 백엔드로 비밀번호 검증
  const handleVerifyPassword = async (e) => {
    e.preventDefault();
    if (!confirmPassword) {
      setMessage('❌ 비밀번호를 입력해주세요.');
      return;
    }
    const res = await verifyPassword(confirmPassword);
    if (res.success) {
      setIsEditMode(true);
      setMessage('');
    } else {
      setMessage('❌ 비밀번호가 일치하지 않습니다.');
      setIsSuccess(false);
    }
  };

  // ✅ 회원정보 저장
  const handleSaveInfo = async (e) => {
    e.preventDefault();
    if (!editName || !editEmail) {
      setMessage('❌ 빈칸을 모두 채워주세요.');
      return;
    }
    const updateData = {
      nickname: editName,
      email: editEmail,
    };
    if (editPassword) updateData.password = editPassword;

    const res = await updateUserInfo(updateData);
    if (res.success) {
      setMessage('✨ 회원정보가 변경되었습니다!');
      setIsSuccess(true);
      setIsEditMode(false);
      setConfirmPassword('');
      setEditPassword('');
    } else {
      setMessage(`❌ ${res.message}`);
      setIsSuccess(false);
    }
  };

  return (
    <div className="mypage-container">

      {/* 대시보드 */}
      <div className="user-dash-card">
        <div className="user-avatar">👤</div>
        <div className="user-dash-info">
          <h3>{user.name}</h3>
          <p>보유 포인트: <strong>{points.toLocaleString()} P</strong></p>
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className="mypage-tabs">
        <button className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>⚙️ 정보 수정</button>
        <button className={`tab-btn ${activeTab === 'myItems' ? 'active' : ''}`} onClick={() => setActiveTab('myItems')}>📦 내 등록 상품 ({myProducts.length})</button>
        <button className={`tab-btn ${activeTab === 'likes' ? 'active' : ''}`} onClick={() => setActiveTab('likes')}>❤️ 찜 목록 ({likes.length})</button>
        <button className={`tab-btn ${activeTab === 'barter' ? 'active' : ''}`} onClick={() => setActiveTab('barter')}>🔄 교환 내역 ({requests.length})</button>
      </div>

      <div className="mypage-main-content">

        {/* 탭 A: 회원정보 수정 */}
        {activeTab === 'info' && (
          <div className="mypage-tab-pane">
            <div className="pane-header"><h4>회원정보 관리</h4></div>

            {message && (
              <div className={`mypage-alert ${isSuccess ? 'alert-success' : 'alert-danger'}`}>
                {message}
              </div>
            )}

            {!isEditMode ? (
              <div className="info-view-box">
                {/* ✅ 로그인한 계정 정보 표시 */}
                <div className="info-row">
                  <span className="info-label">닉네임</span>
                  <span className="info-value">{user.name}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">이메일</span>
                  <span className="info-value">{user.email || '이메일 정보 없음'}</span>
                </div>
                <hr className="info-divider" />
                <form onSubmit={handleVerifyPassword} className="password-check-form">
                  <p className="form-guide">⚠️ 안전을 위해 현재 비밀번호를 입력해야 정보 수정이 가능합니다.</p>
                  <div className="input-group">
                    <input
                      type="password"
                      placeholder="현재 비밀번호 입력"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button type="submit" className="btn-verify">인증 후 수정</button>
                  </div>
                </form>
              </div>
            ) : (
              <form onSubmit={handleSaveInfo} className="info-edit-form">
                <div className="edit-field">
                  <label>닉네임 변경</label>
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required />
                </div>
                <div className="edit-field">
                  <label>이메일 변경</label>
                  <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} required />
                </div>
                <div className="edit-field">
                  <label>새 비밀번호 (변경할 경우만 입력)</label>
                  <input type="password" placeholder="새 비밀번호" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} />
                </div>
                <div className="edit-btn-group">
                  <button type="submit" className="btn-save-changes">저장하기</button>
                  <button type="button" className="btn-cancel-edit" onClick={() => { setIsEditMode(false); setMessage(''); }}>취소</button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* 탭 B: 내가 올린 상품 */}
        {activeTab === 'myItems' && (
          <div className="mypage-tab-pane">
            <div className="pane-header"><h4>내가 등록한 거래물품</h4></div>
            <div className="mypage-product-list">
              {myProducts.length === 0 ? (
                <p className="empty-txt">아직 등록한 상품이 없습니다. 첫 상품을 등록해 보세요!</p>
              ) : (
                myProducts.map(product => (
                  <div key={product.id} className="mypage-item-card" onClick={() => navigate(`/product/${product.id}`)}>
                    <img src={product.image} alt={product.title} className="mini-card-img"
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80'; }} />
                    <div className="mini-card-info">
                      <h5>{product.title}</h5>
                      <span>{product.price?.toLocaleString()}원</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 탭 C: 찜 목록 */}
        {activeTab === 'likes' && (
          <div className="mypage-tab-pane">
            <div className="pane-header"><h4>내가 하트 누른 찜 목록</h4></div>
            <div className="mypage-product-list">
              {likes.length === 0 ? (
                <p className="empty-txt">❤️ 찜한 상품이 없습니다. 메인에서 하트를 날려보세요!</p>
              ) : (
                likes.map(product => (
                  <div key={product.id} className="mypage-item-card" onClick={() => navigate(`/product/${product.id}`)}>
                    <img src={product.image} alt={product.title} className="mini-card-img"
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80'; }} />
                    <div className="mini-card-info">
                      <h5>{product.title}</h5>
                      <span>{product.price?.toLocaleString()}원</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 탭 D: 교환 내역 */}
        {activeTab === 'barter' && (
          <div className="mypage-tab-pane">
            <div className="pane-header"><h4>물물교환 내역</h4></div>
            <div className="barter-list">
              {requests.length === 0 ? (
                <p className="empty-txt">교환 신청 내역이 깨끗합니다.</p>
              ) : (
                [...requests].reverse().map(req => {
                  const isMyProposal = req.senderId === currentUser?.id || req.sender === currentUser?.name;
                  return (
                    <div key={req.id} className="barter-card-item"
                      style={{ borderLeft: isMyProposal ? '4px solid #059669' : '4px solid #ff6f61' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div>
                          <span className="status-badge" style={{
                            background: isMyProposal ? '#e6f4ea' : '#fce8e6',
                            color: isMyProposal ? '#137333' : '#c5221f',
                            marginRight: '8px', fontWeight: 'bold'
                          }}>
                            {isMyProposal ? '📤 보낸 제안' : '📥 받은 제안'}
                          </span>
                          <span className={`status-badge ${req.status}`}>{req.status}</span>
                        </div>
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>{req.createdAt || '방금 전'}</span>
                      </div>
                      <div className="barter-item-title">상대 상품: <span>{req.productTitle}</span></div>
                      <div className="barter-item-detail" style={{ marginTop: '6px', fontSize: '13px', color: '#475569' }}>
                        <span>제안한 물건: <b style={{ color: isMyProposal ? '#059669' : '#1e293b' }}>{req.proposedItem}</b></span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}