import React, { createContext, useContext, useState, useEffect } from 'react'; // 💡 useEffect 추가됨
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
  const [currentUser, setCurrentUser] = useState(null);
  const [usersList, setUsersList] = useState([
    { id: 'user123', name: '도봉러', email: 'dobong@example.com', password: '123' }
  ]);

  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const [myPoints, setMyPoints] = useState(50000);
  const [likedItems, setLikedItems] = useState([]);
  const [regionFilter, setRegionFilter] = useState({ sido: '전국', sigungu: '전체', dong: '전체' });
  
  // ⚡ 기존 하드코딩 mockProducts를 치우고 빈 배열로 초기화합니다.
  const [products, setProducts] = useState([]);
  
  const [chatRooms, setChatRooms] = useState([]);
  
  // 🔄 물물교환 요청 데이터 상태
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

  // 🌐 [추가] 앱이 켜질 때 백엔드 API에서 진짜 중고 상품 데이터를 읽어옵니다.
  useEffect(() => {
    fetch('http://localhost:5001/api/products')
      .then(response => {
        if (!response.ok) {
          throw new Error('서버 응답 상태 이상');
        }
        return response.json();
      })
      .then(data => {
        console.log("📦 백엔드에서 실시간 수신한 상품 리스트:", data);
        setProducts(data); // 상태 업데이트 완료
      })
      .catch(error => {
        console.error("❌ API 수신 실패! mockData로 대체 작동합니다:", error);
        setProducts(mockProducts); // 백엔드 점검 시 팅김 방지용 백업 대안
      });
  }, []);

  // ⚡ [수정] 내 서비스 안에서 상품 등록을 수행하면 백엔드 서버 DB(배열)로 POST 요청을 쏩니다.
  const addProduct = (newProduct) => {
    fetch('http://localhost:5001/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newProduct),
    })
      .then(response => response.json())
      .then(savedProduct => {
        // 서버에 성공적으로 데이터가 안착하면, 프론트 화면 상태창도 리렌더링 처리
        setProducts(prev => [savedProduct, ...prev]);
      })
      .catch(error => console.error("❌ 서버에 상품 등록 실패:", error));
  };

  const toggleHeaderMenu = () => setIsHeaderMenuOpen(prev => !prev);

  const toggleLike = (id) => {
    const strId = String(id);
    setLikedItems(prev =>
      prev.includes(strId) ? prev.filter(i => i !== strId) : [...prev, strId]
    );
  };

  const startChat = (product) => {
    const existingRoom = chatRooms.find(room => room.id === product.id);
    if (existingRoom) return existingRoom.id;
    const newRoom = { id: product.id, sellerName: product.seller, productTitle: product.title, messages: [] };
    setChatRooms(prev => [newRoom, ...prev]);
    return product.id;
  };

  const addBarterRequest = (request) => {
    const currentUserId = currentUser?.id || 'user_guest';
    const currentUserName = currentUser?.name || '홍길동';

    const cleanRequest = {
      id: Date.now(),
      productId: request.productId,
      productTitle: request.productTitle,
      senderId: currentUserId,
      sender: currentUserName,
      receiverId: request.receiverId || 'user123',
      proposedItem: request.proposedItem,
      status: '대기중',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setBarterRequests(prev => [cleanRequest, ...prev]);
  };

  const updateBarterStatus = (requestId, newStatus) => {
    setBarterRequests(prev => prev.map(req => req.id === requestId ? { ...req, status: newStatus } : req));
  };

  const login = (id, password) => {
    const user = usersList.find(u => u.id === id && u.password === password);
    if (user) { setCurrentUser(user); return { success: true }; }
    return { success: false, message: '아이디 또는 비밀번호가 일치하지 않습니다.' };
  };

  const logout = () => setCurrentUser(null);

  const register = (newUser) => {
    if (usersList.some(u => u.id === newUser.id)) return { success: false, message: '이미 존재하는 아이디입니다.' };
    setUsersList(prev => [...prev, newUser]);
    return { success: true };
  };

  const updateUserInfo = (updatedData) => {
    if (!currentUser) return { success: false, message: '로그인이 필요합니다.' };
    setUsersList(prev => prev.map(u => u.id === currentUser.id ? { ...u, ...updatedData } : u));
    setCurrentUser(prev => ({ ...prev, ...updatedData }));
    return { success: true };
  };

  const filteredProducts = products.filter(product => {
    const matchCategory = selectedCategory === '전체' || product.category === selectedCategory;
    const matchSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());
    let matchRegion = true;
    if (regionFilter.sido !== '전국') {
      if (regionFilter.sigungu === '전체') matchRegion = product.location.startsWith(regionFilter.sido);
      else if (regionFilter.dong === '전체') matchRegion = product.location.startsWith(`${regionFilter.sido} ${regionFilter.sigungu}`);
      else matchRegion = product.location.includes(regionFilter.dong);
    }
    return matchCategory && matchSearch && matchRegion;
  });

  const likedProducts = products.filter(p => likedItems.includes(String(p.id)));

  return (
    <AppContext.Provider value={{
      currentUser, setCurrentUser,
      login, logout, register, updateUserInfo,
      products, filteredProducts, addProduct,
      selectedCategory, setSelectedCategory,
      regionFilter, setRegionFilter,
      searchQuery, setSearchQuery,
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