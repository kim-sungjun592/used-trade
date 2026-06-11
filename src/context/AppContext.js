import React, { createContext, useContext, useState } from 'react';
// 🔥 기존 상품 공장 데이터 그대로 유지
import { mockProducts } from '../data/mockData';

const AppContext = createContext();

// 🗺️ 대한민국 3단계 계층형 트리 데이터 (그대로 유지)
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
  },
  '인천': {
    '연수구': ['송도동', '연수동', '동춘동'],
    '남동구': ['구월동', '간석동', '논현동']
  },
  '부산': {
    '해운대구': ['우동', '중동', '좌동', '재송동'],
    '진구': ['부전동', '전포동', '양정동']
  }
};

export function AppProvider({ children }) {
  // 1. 현재 로그인 유저 정보 (처음엔 로그인 안 된 null 상태로 시작!)
  const [currentUser, setCurrentUser] = useState(null);

  // 👤 [로그인용 추가 상태] 회원가입한 유저들을 기억할 로컬 데이터 저장소
  const [usersList, setUsersList] = useState([
    { id: 'user123', name: '도봉러', email: 'dobong@example.com', password: '123' }
  ]);

  // 2. 기본 상태 관리 (그대로 유지)
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const [myPoints, setMyPoints] = useState(50000);
  
  // 💡 찜한 상품 ID를 저장하는 Set 상태 (그대로 유지)
  const [likedItems, setLikedItems] = useState(new Set());

  // 3. 3단계 지역 필터 상태 (그대로 유지)
  const [regionFilter, setRegionFilter] = useState({
    sido: '전국',
    sigungu: '전체',
    dong: '전체'
  });

  // 4. 상품 데이터 상태 (그대로 유지)
  const [products, setProducts] = useState(mockProducts);

  // 📝 [기능 추가] 새로운 상품을 등록하는 함수 (이전 에러 해결용)
  const addProduct = (newProduct) => {
    const productWithId = {
      ...newProduct,
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
    };
    setProducts(prev => [productWithId, ...prev]); 
  };

  // 5. 물물교환 요청 데이터 상태 (그대로 유지)
  const [barterRequests, setBarterRequests] = useState([
    {
      id: 1,
      productId: 1,
      productTitle: '나이키 에어맥스 270 (265mm)',
      senderId: 'user999',
      sender: '교환매니아',
      receiverId: 'user123',
      proposedItem: '아디다스 가젤 265mm',
      status: '대기중',
      createdAt: '2026-06-11'
    }
  ]);

  // 채팅방 상태 (그대로 유지)
  const [chatRooms, setChatRooms] = useState([]);
  
  // 6. 편의 기능 함수들 (그대로 유지)
  const toggleHeaderMenu = () => setIsHeaderMenuOpen(!isHeaderMenuOpen);
  
  const toggleLike = (id) => {
    setLikedItems(prev => { 
      const next = new Set(prev); 
      const strId = String(id);
      
      let found = false;
      for (const item of next) {
        if (String(item) === strId) {
          next.delete(item);
          found = true;
          break;
        }
      }
      
      if (!found) {
        next.add(strId);
      }
      return next; 
    });
  };

  const startChat = (product) => {
    const existingRoom = chatRooms.find(room => room.id === product.id);
    if (existingRoom) return existingRoom.id;
    const newRoom = { id: product.id, sellerName: product.seller, productTitle: product.title, messages: [] };
    setChatRooms(prev => [newRoom, ...prev]); 
    return product.id;
  };

  const addBarterRequest = (request) => {
    setBarterRequests(prev => [
      { id: Date.now(), status: '대기중', createdAt: '2026-06-11', ...request },
      ...prev
    ]);
  };

  const updateBarterStatus = (requestId, newStatus) => {
    setBarterRequests(prev => 
      prev.map(req => req.id === requestId ? { ...req, status: newStatus } : req)
    );
  };

  // 🔑 [로그인용 추가 함수 1] 로그인 확인
  const login = (id, password) => {
    const user = usersList.find(u => u.id === id && u.password === password);
    if (user) {
      setCurrentUser(user);
      return { success: true };
    }
    return { success: false, message: '아이디 또는 비밀번호가 일치하지 않습니다.' };
  };

  // 🔑 [로그인용 추가 함수 2] 로그아웃
  const logout = () => setCurrentUser(null);

  // 🔑 [로그인용 추가 함수 3] 회원가입 (중복 아이디 체크 포함)
  const register = (newUser) => {
    if (usersList.some(u => u.id === newUser.id)) {
      return { success: false, message: '이미 존재하는 아이디입니다.' };
    }
    setUsersList(prev => [...prev, newUser]);
    return { success: true };
  };

  // ⚙️ [마이페이지 회원정보 수정용 기능 추가] 
  const updateUserInfo = (updatedData) => {
    if (!currentUser) return { success: false, message: '로그인이 필요합니다.' };

    // 1. 가입된 전체 회원 명부(usersList)에서 내 정보를 찾아 수정합니다.
    setUsersList(prev => prev.map(user => 
      user.id === currentUser.id ? { ...user, ...updatedData } : user
    ));

    // 2. 현재 로그인 세션 상태(currentUser)도 똑같이 동기화해 줍니다.
    setCurrentUser(prev => ({ ...prev, ...updatedData }));

    return { success: true };
  };

  // 7. 계층형 지역 + 카테고리 + 검색 필터링 파이프라인 (그대로 유지)
  const filteredProducts = products.filter(product => {
    const matchCategory = selectedCategory === '전체' || product.category === selectedCategory;
    const matchSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchRegion = true;
    if (regionFilter.sido !== '전국') {
      if (regionFilter.sigungu === '전체') {
        matchRegion = product.location.startsWith(regionFilter.sido);
      } else if (regionFilter.dong === '전체') {
        matchRegion = product.location.startsWith(`${regionFilter.sido} ${regionFilter.sigungu}`);
      } else {
        matchRegion = product.location.includes(regionFilter.dong);
      }
    }
    return matchCategory && matchSearch && matchRegion;
  });

  // 💡 찜한 상품들만 모은 배열 (그대로 유지)
  const likedProducts = products.filter(product => {
    const targetId = String(product.id);
    const likedArray = Array.from(likedItems).map(String);
    return likedArray.includes(targetId);
  });

  return (
    // 🔥기존 가치들에 더해 'updateUserInfo'까지 확실하게 추가 완료!
    <AppContext.Provider value={{
      currentUser, setCurrentUser,
      login, logout, register, 
      updateUserInfo, // <--- ⚙️ 마이페이지 수정 함수 주입!
      products, filteredProducts, addProduct, 
      selectedCategory, setSelectedCategory,
      regionFilter, setRegionFilter,
      searchQuery, setSearchQuery,
      isHeaderMenuOpen, toggleHeaderMenu,
      myPoints, likedItems, toggleLike,
      chatRooms, startChat,
      barterRequests, addBarterRequest, updateBarterStatus,
      likedProducts 
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);