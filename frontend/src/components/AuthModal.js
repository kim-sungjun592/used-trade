import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import './AuthModal.css';

export default function AuthModal({ onClose }) {
  const { login, register } = useApp();

  const [mode, setMode] = useState('login');
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    if (mode === 'login') {
      const res = await login(id, password);
      if (res.success) {
        onClose();
      } else {
        setMessage(res.message);
      }
    }

    else if (mode === 'register') {
      if (!id || !password || !name || !email) {
        setMessage('모든 항목을 입력해주세요.');
        setLoading(false);
        return;
      }
      const res = await register({ id, password, name, email });
      if (res.success) {
        alert('회원가입 성공! 로그인 해주세요.');
        setMode('login');
        setMessage('');
      } else {
        setMessage(res.message);
      }
    }

    else if (mode === 'findId') {
      setMessage(`입력하신 이메일(${email})로 가입된 아이디는 [ user123 ] 입니다.`);
    }

    else if (mode === 'findPw') {
      setMessage(`🦺 ${id}님 계정의 임시 비밀번호를 이메일로 발송했습니다!`);
    }

    setLoading(false);
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-window" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close-x" onClick={onClose}>&times;</button>

        <div className="auth-header">
          <h2>
            {mode === 'login'    && '반가워요! 로그인'}
            {mode === 'register' && '반가워요! 회원가입'}
            {mode === 'findId'   && '🔍 아이디 찾기'}
            {mode === 'findPw'   && '🔑 비밀번호 찾기'}
          </h2>
          <p className="auth-subtitle">동네장터에 오신 것을 환영합니다</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {(mode === 'login' || mode === 'register' || mode === 'findPw') && (
            <input
              type="text"
              placeholder="이메일 입력"
              value={id}
              onChange={(e) => setId(e.target.value)}
              required
            />
          )}

          {(mode === 'login' || mode === 'register') && (
            <input
              type="password"
              placeholder="비밀번호 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          )}

          {mode === 'register' && (
            <input
              type="text"
              placeholder="닉네임 입력"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}

          {(mode === 'register' || mode === 'findId') && (
            <input
              type="email"
              placeholder="이메일 주소 입력"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          )}

          {message && (
            <div className="auth-message-box" style={{ color: message.includes('성공') ? '#16a34a' : '#dc2626' }}>
              {message}
            </div>
          )}

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? '처리 중...' : (
              <>
                {mode === 'login'    && '로그인'}
                {mode === 'register' && '가입 완료'}
                {mode === 'findId'   && '아이디 조회'}
                {mode === 'findPw'   && '비밀번호 재발급'}
              </>
            )}
          </button>
        </form>

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
              이미 계정이 있나요? 로그인
            </span>
          )}
        </div>
      </div>
    </div>
  );
}