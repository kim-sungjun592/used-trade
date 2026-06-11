import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import './AuthModal.css'; // 🔥 스타일시트 연결

export default function AuthModal({ onClose }) {
  const { login, register } = useApp();
  
  // 상태 모드 종류: 'login' | 'register' | 'findId' | 'findPw'
  const [mode, setMode] = useState('login'); 
  
  // 입력 폼 상태들
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // 알림 메시지 상태
  const [message, setMessage] = useState('');

  // 제출 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');

    if (mode === 'login') {
      const res = login(id, password);
      if (res.success) {
        onClose(); // 성공 시 모달 닫기
      } else {
        setMessage(res.message);
      }
    } 
    
    else if (mode === 'register') {
      if (!id || !password || !name || !email) return setMessage('모든 항목을 입력해주세요.');
      const res = register({ id, password, name, email });
      if (res.success) {
        alert('회원가입 성공! 로그인 해주세요.');
        setMode('login');
      } else {
        setMessage(res.message);
      }
    } 
    
    else if (mode === 'findId') {
      setMessage(` 입력하신 이메일(${email})로 가입된 아이디는 [ user123 ] 입니다.`);
    } 
    
    else if (mode === 'findPw') {
      setMessage(` 🦺 ${id}님 계정의 임시 비밀번호를 이메일로 발송했습니다!`);
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-window" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close-x" onClick={onClose}>&times;</button>
        
        {/* 타이틀 영역 */}
        <div className="auth-header">
          <h2>
            {mode === 'login' && '🎮 GAME START'}
            {mode === 'register' && '📝 신규 모험가 등록'}
            {mode === 'findId' && '🔍 아이디 찾기'}
            {mode === 'findPw' && '🔑 비밀번호 찾기'}
          </h2>
          <p className="auth-subtitle">당근 마켓 교환소에 오신 것을 환영합니다</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* 아이디 필드 */}
          {(mode === 'login' || mode === 'register' || mode === 'findPw') && (
            <input type="text" placeholder="아이디 입력" value={id} onChange={(e)=>setId(e.target.value)} required />
          )}

          {/* 비밀번호 필드 */}
          {(mode === 'login' || mode === 'register') && (
            <input type="password" placeholder="비밀번호 입력" value={password} onChange={(e)=>setPassword(e.target.value)} required />
          )}

          {/* 이름 필드 */}
          {mode === 'register' && (
            <input type="text" placeholder="닉네임/이름 입력" value={name} onChange={(e)=>setName(e.target.value)} required />
          )}

          {/* 이메일 필드 */}
          {(mode === 'register' || mode === 'findId') && (
            <input type="email" placeholder="이메일 주소 입력" value={email} onChange={(e)=>setEmail(e.target.value)} required />
          )}

          {message && <div className="auth-message-box">{message}</div>}

          <button type="submit" className="auth-submit-btn">
            {mode === 'login' && '로그인'}
            {mode === 'register' && '가입 완료'}
            {mode === 'findId' && '아이디 조회'}
            {mode === 'findPw' && '비밀번호 재발급'}
          </button>
        </form>

        {/* 하단 메뉴 전환 링크 */}
        <div className="auth-footer-links">
          {mode === 'login' ? (
            <>
              <span onClick={() => { setMode('register'); setMessage(''); }}>회원가입</span>
              <span className="bar">|</span>
              <span onClick={() => { setMode('findId'); setMessage(''); }}>ID 찾기</span>
              <span className="bar">|</span>
              <span onClick={() => { setMode('findPw'); setMessage(''); }}>PW 찾기</span>
            </>
          ) : (
            <span className="back-to-login" onClick={() => { setMode('login'); setMessage(''); }}>
              ⬅️ 로그인 화면으로 돌아가기
            </span>
          )}
        </div>
      </div>
    </div>
  );
}