import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Heart, RefreshCw, ShoppingBag, MessageSquare, ChevronDown } from 'lucide-react';
import axios from 'axios';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', nickname: '' });
  const [message, setMessage] = useState('');

  const savedNickname = localStorage.getItem('nickname');
  const user = savedNickname ? { nickname: savedNickname } : null;

  // 💛 [카카오 패치 1] 카카오 로그인 성공 후 주소창으로 돌아오는 토큰 감시 레이더
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const nickname = params.get('nickname');

    if (token && nickname) {
      // 카카오가 보내준 유저 정보를 로컬 스토리지에 세팅
      localStorage.setItem('token', token);
      localStorage.setItem('nickname', nickname);
      
      // 주소창의 쿼리스트링(?token=...)을 깔끔하게 지우기 위해 메인으로 리다이렉트
      window.location.href = '/'; 
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isSignup ? '/api/auth/signup' : '/api/auth/login';
    try {
      // 💡 도커 외부 포트 환경에 맞춰 5002번 포트로 정확히 요청을 보냅니다.
      const res = await axios.post(`http://localhost:5002${endpoint}`, formData);
      if (isSignup) {
        alert('회원가입 완료! 로그인해 주세요.');
        setIsSignup(false);
        setMessage('');
      } else {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('nickname', res.data.nickname);
        setIsModalOpen(false);
        setIsDropdownOpen(false);
        setFormData({ email: '', password: '', nickname: '' });
        window.location.reload();
      }
    } catch (err) {
      setMessage(err.response?.data?.message || '오류가 발생했습니다.');
    }
  };

  // 💛 [카카오 패치 2] 도커 환경(5002 포트)에 맞춘 카카오 로그인 요청 함수
  const handleKakaoLogin = () => {
    const REST_API_KEY = "43662cd5849fc5c0bd00b5e97efa2e97"; // 유저님의 카카오 REST API 키
    const REDIRECT_URI = "http://localhost:5002/api/auth/kakao/callback"; // 👈 5002 포트로 대치!
    
    window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nickname');
    setIsDropdownOpen(false);
    window.location.reload();
  };

  return (
    <nav className="app-navbar">
      <div className="container navbar-inner">
        <Link to="/" className="logo">
          <span>🥕 secondhand-market</span>
        </Link>

        <div className="navbar-links">
          <Link to="/sell" className="btn-sell-nav">물품 등록</Link>
          <Link to="/chat" className="nav-icon-link" title="채팅방">
            <MessageSquare size={22} />
          </Link>

          <div className="my-menu-wrapper">
            <button className="my-menu-btn" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              <div className="nav-avatar"><User size={18} /></div>
              <span className="nav-user-name">{user ? user.nickname : '내 메뉴'}</span>
              <ChevronDown size={14} className={`nav-arrow ${isDropdownOpen ? 'open' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="my-menu-popover">
                {user ? (
                  <>
                    <div className="popover-user">
                      <strong>{user.nickname}님</strong>
                    </div>
                    <hr />
                    <button onClick={() => { navigate('/barter'); setIsDropdownOpen(false); }} className="popover-item">
                      <RefreshCw size={16} /> 물물교환 내역
                    </button>
                    <button onClick={() => { navigate('/wishlist'); setIsDropdownOpen(false); }} className="popover-item">
                      <Heart size={16} /> 찜한 상품
                    </button>
                    <button onClick={() => { navigate('/mypage'); setIsDropdownOpen(false); }} className="popover-item">
                      <ShoppingBag size={16} /> 마이페이지
                    </button>
                    <hr />
                    <button onClick={handleLogout} className="popover-item" style={{ color: '#ef4444' }}>
                      로그아웃
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { setIsModalOpen(true); setIsSignup(false); setIsDropdownOpen(false); }} className="popover-item">
                      로그인
                    </button>
                    <button onClick={() => { setIsModalOpen(true); setIsSignup(true); setIsDropdownOpen(false); }} className="popover-item">
                      회원가입
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 로그인/회원가입 모달 */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{isSignup ? '반가워요! 회원가입' : '로그인하기'}</h2>
            {message && <p className="error-message">{message}</p>}
            <form onSubmit={handleSubmit}>
              {isSignup && (
                <input type="text" name="nickname" placeholder="닉네임"
                  value={formData.nickname} onChange={handleChange} required />
              )}
              <input type="email" name="email" placeholder="이메일 주소"
                value={formData.email} onChange={handleChange} required />
              <input type="password" name="password" placeholder="비밀번호"
                value={formData.password} onChange={handleChange} required />
              <button type="submit" className="btn-submit">
                {isSignup ? '가입 완료' : '로그인'}
              </button>

              {/* 💛 [카카오 패치 3] 기존 양식 밑에 간편 카카오 로그인 버튼 주입 */}
              <button 
                type="button" 
                onClick={handleKakaoLogin} 
                style={{
                  backgroundColor: '#FEE500',
                  color: '#191919',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '14.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  marginTop: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  width: '100%'
                }}
              >
                💛 카카오로 시작하기
              </button>
            </form>
            <div className="modal-footer">
              <span onClick={() => { setIsSignup(!isSignup); setMessage(''); }}>
                {isSignup ? '이미 계정이 있나요? 로그인' : '아직 회원이 아니신가요? 회원가입'}
              </span>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}>닫기</button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;