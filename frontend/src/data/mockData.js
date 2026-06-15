// 🔥 상품명과 그에 정확히 맞는 사진을 1:1로 짝지어둔 데이터베이스
const itemDB = {
  '전자기기': [
    { title: '아이폰 14 프로', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500' },
    { title: '맥북 에어 M2', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500' },
    { title: '에어팟 프로 2세대', image: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=500' },
    { title: '아이패드 에어 5', image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500' },
    { title: '닌텐도 스위치 OLED', image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500' },
    { title: '소니 헤드폰 WH-1000XM5', image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500' }
  ],
  '의류/패션': [
    { title: '나이키 스투시 후드티', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500' },
    { title: '아디다스 삼바', image: 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=500' },
    { title: '노스페이스 눕시 패딩', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500' },
    { title: '자라(ZARA) 레더 자켓', image: 'https://images.unsplash.com/photo-1520975954732-57dd22299614?w=500' },
    { title: '뉴발란스 992', image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=500' }
  ],
  '가구/인테리어': [
    { title: '이케아 마르쿠스 의자', image: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=500' },
    { title: '한샘 리클라이너 소파', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500' },
    { title: '원목 전신거울', image: 'https://images.unsplash.com/photo-1618220179428-22790b46a011?w=500' },
    { title: '무인양품 수납장', image: 'https://images.unsplash.com/photo-1595526114101-10ce5a1ac5e8?w=500' }
  ],
  '스포츠/레저': [
    { title: '브롬톤 자전거', image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500' },
    { title: '캠핑용 텐트', image: 'https://images.unsplash.com/photo-1504280390224-b1eb21cfa69c?w=500' },
    { title: '헬스장 양도', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500' },
    { title: '스노우보드 데크', image: 'https://images.unsplash.com/photo-1560264280-08b14610afce?w=500' }
  ],
  '취미/도서': [
    { title: '해리포터 전집', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500' },
    { title: '레고 포르쉐 911', image: 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=500' },
    { title: '필름카메라', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500' },
    { title: '기타(통기타)', image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=500' }
  ]
};

// 대한민국 대표 지역들
const locations = [
  '서울 강남구 역삼동', '서울 서초구 반포동', '서울 송파구 잠실동', '서울 마포구 연남동', 
  '서울 용산구 한남동', '서울 성동구 성수동', '서울 관악구 신림동', '서울 영등포구 여의도동',
  '경기 남양주시 다산동', '경기 성남시 분당구 정자동', '경기 수원시 영통구 광교동', 
  '경기 고양시 일산동구 마두동', '경기 용인시 수지구', '경기 화성시 동탄동',
  '부산 해운대구 우동', '부산 수영구 광안동', '대구 수성구 범어동', '인천 연수구 송도동', 
  '대전 서구 둔산동', '광주 서구 상무동', '제주 제주시 노형동'
];

const conditions = ['미개봉 새상품', '거의 새것', '사용감 약간 있음', '하자 있음(설명참조)'];
const exchanges = ['교환 안함', '비슷한 가격대 물건 찔러주세요', '커피 기프티콘', '사이즈 교환 원해요'];

// 무작위 뽑기 함수
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomPrice = (min, max) => Math.floor((Math.random() * (max - min) + min) / 1000) * 1000;

// 🔥 상품을 만들어내는 함수
export const generateProducts = (count = 300) => {
  const products = [];
  const categories = Object.keys(itemDB);

  for (let i = 1; i <= count; i++) {
    const category = getRandom(categories);
    
    // ✨ 이제 랜덤한 '상품 객체(제목 + 사진)'를 통째로 가져옵니다!
    const productItem = getRandom(itemDB[category]); 
    const isFree = Math.random() < 0.05;

    products.push({
      id: i, 
      title: productItem.title,     // 제목 꺼내기
      category: category,
      price: isFree ? 0 : getRandomPrice(10000, 1500000),
      location: getRandom(locations),
      status: getRandom(conditions),
      exchange: getRandom(exchanges),
      date: `2024-01-${Math.floor(Math.random() * 28 + 1).toString().padStart(2, '0')}`,
      description: `앱 런칭 기념으로 올립니다! \n\n${productItem.title} 판매합니다.\n직거래는 ${getRandom(locations)} 근처에서 가능합니다. \n\n네고는 정중히 사양합니다~ 득템하세요!`,
      image: productItem.image      // 제목에 딱 맞는 사진 꺼내기
    });
  }
  return products;
};

// 300개의 상품 내보내기
export const mockProducts = generateProducts(300);