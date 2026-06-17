import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockProducts } from '../data/mockData';

const AppContext = createContext();

export const KOREA_REGION_TREE = {
  '서울': {
    '도봉구': ['방학동', '쌍문동', '창동', '도봉동'],
    '강남구': ['역삼동', '삼성동', '청담동', '논현동'],
    '강북구': ['미아동', '번동', '수유동', '우이동'],
    '마포구': ['서교동', '연남동', '망원동', '상암동']
  },
  '경기': {
    '남양주시': ['다산동', '별내동', '와부읍', '진접읍'],
    '수원시 영통구': ['영통동', '매탄동', '원천동', '이의동'],
    '성남시 분당구': ['정자동', '삼평동', '백현동', '구미동']
  }
};

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedNickname = localStorage.getItem('nickname');
    const savedEmail = localStorage.getItem('email');
    return savedNickname ? { name: savedNickname, email: savedEmail || '' } : null;
  });

  // ✅ mockProducts는 초기값으로만 쓰고, 등록 상품은 별도 상태로 관리
  const [products, setProducts] = useState(mockProducts);
  const [myProducts, setMyProducts] = useState([]); // 내가 등록한 상품만 따로 관리

  const [likedItems, setLikedItems] = useState(() => {
    const savedLikes = localStorage.getItem('local_likes');
    return savedLikes ? JSON.parse(savedLikes) : [];
  });

  const [chatRooms, setChatRooms] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState({ sido: '전국', sigungu: '전체', dong: '전체' });
  const [barterRequests, setBarterRequests] = useState([]);
  const [myPoints] = useState(50000);
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('local_likes', JSON.stringify(likedItems));
  }, [likedItems]);

  // ✅ 상품 등록 함수 - myProducts에 추가하고 전체 products에도 추가
  const addProduct = (newProduct) => {
    const productWithId = {
      ...newProduct,
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      seller: currentUser?.name || '익명',
      sellerId: currentUser?.id || 'guest',
    };
    setMyProducts(prev => [productWithId, ...prev]);
    setProducts(prev => [productWithId, ...prev]);
  };

  const toggleLike = async (productId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인이 필요한 기능입니다.');
      return;
    }
    const strId = String(productId);
    setLikedItems(prev =>
      prev.includes(strId) ? prev.filter(id => id !== strId) : [...prev, strId]
    );
    try {
      await fetch('http://localhost:5002/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId: Number(productId) })
      });
    } catch (err) {
      console.log('백엔드 반영 안 됨 (로컬에만 저장)');
    }
  };

  const toggleHeaderMenu = () => setIsHeaderMenuOpen(prev => !prev);

  const startChat = (product) => {
    const existingRoom = chatRooms.find(room => room.id === product.id);
    if (existingRoom) return existingRoom.id;
    const newRoom = { id: product.id, sellerName: product.seller, productTitle: product.title, messages: [] };
    setChatRooms(prev => [newRoom, ...prev]);
    return product.id;
  };

  const addBarterRequest = (request) => {
    setBarterRequests(prev => [{
      id: Date.now(), status: '대기중',
      createdAt: new Date().toLocaleDateString(), ...request
    }, ...prev]);
  };

  const updateBarterStatus = (requestId, newStatus) => {
    setBarterRequests(prev =>
      prev.map(req => req.id === requestId ? { ...req, status: newStatus } : req)
    );
  };

  const login = async (id, password) => {
    try {
      const res = await fetch('http://localhost:5002/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: id, password })
      });
      const data = await res.json();
      if (!res.ok) return { success: false, message: data.message };
      localStorage.setItem('token', data.token);
      localStorage.setItem('nickname', data.nickname);
      localStorage.setItem('email', id);
      setCurrentUser({ name: data.nickname, email: id, id: data.userId || id });
      return { success: true };
    } catch (err) {
      return { success: false, message: '서버 연결 실패' };
    }
  };

  const register = async (newUser) => {
    try {
      const res = await fetch('http://localhost:5002/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newUser.email,
          password: newUser.password,
          nickname: newUser.name
        })
      });
      if (!res.ok) return { success: false, message: (await res.json()).message };
      return { success: true };
    } catch (err) {
      return { success: false, message: '서버 연결 실패' };
    }
  };

  // ✅ 회원정보 수정 - 백엔드 API 연동
  const updateUserInfo = async (updatedData) => {
    const token = localStorage.getItem('token');
    if (!token) return { success: false, message: '로그인이 필요합니다.' };
    try {
      const res = await fetch('http://localhost:5002/api/auth/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });
      if (!res.ok) return { success: false, message: (await res.json()).message };
      if (updatedData.nickname) {
        localStorage.setItem('nickname', updatedData.nickname);
        setCurrentUser(prev => ({ ...prev, name: updatedData.nickname }));
      }
      return { success: true };
    } catch (err) {
      return { success: false, message: '서버 연결 실패' };
    }
  };

  // ✅ 비밀번호 검증 - 백엔드 API 연동
  const verifyPassword = async (password) => {
    const token = localStorage.getItem('token');
    if (!token) return { success: false };
    try {
      const res = await fetch('http://localhost:5002/api/auth/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password })
      });
      return { success: res.ok };
    } catch (err) {
      return { success: false };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nickname');
    localStorage.removeItem('email');
    localStorage.removeItem('local_likes');
    setCurrentUser(null);
    setLikedItems([]);
    setMyProducts([]);
  };

  const filteredProducts = products.filter(product => {
    const matchCategory = selectedCategory === '전체' || product.category === selectedCategory;
    const matchSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());
    let matchRegion = true;
    if (regionFilter.sido !== '전국') {
      if (regionFilter.sigungu === '전체') matchRegion = product.location?.startsWith(regionFilter.sido);
      else if (regionFilter.dong === '전체') matchRegion = product.location?.startsWith(`${regionFilter.sido} ${regionFilter.sigungu}`);
      else matchRegion = product.location?.includes(regionFilter.dong);
    }
    return matchCategory && matchSearch && matchRegion;
  });

  const likedProducts = products.filter(p => likedItems.includes(String(p.id)));

  return (
    <AppContext.Provider value={{
      currentUser, setCurrentUser,
      login, logout, register, updateUserInfo, verifyPassword,
      products, filteredProducts,
      addProduct, myProducts,
      selectedCategory, setSelectedCategory,
      searchQuery, setSearchQuery,
      regionFilter, setRegionFilter,
      isHeaderMenuOpen, toggleHeaderMenu,
      myPoints,
      likedItems, toggleLike, likedProducts,
      chatRooms, startChat,
      barterRequests, addBarterRequest, updateBarterStatus,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);