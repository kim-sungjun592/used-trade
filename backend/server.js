global.crypto = require('crypto'); // 👈 [보안 연결 패치] 최상단 1번에 이 줄을 꼭 추가해 주세요!
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); 

// 💡 [Faker 호환성 패치] 에러가 나던 require 대신, 동적 import 방식으로 faker를 안전하게 데려옵니다.
let faker;
import('@faker-js/faker').then(module => {
  faker = module.fakerKO;
});

const app = express();

// 배포 서버용 포트 설정 수용
const PORT = process.env.PORT || 5000; 

app.use(cors());
app.use(express.json());

// ☁️ 1. 방금 조립한 클라우드 MongoDB Atlas 주소 입력
const MONGO_URI = 'mongodb+srv://rlatjdwns:1234@cluster0.b1wyqpf.mongodb.net/used_trade_v2?appName=Cluster0';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('☁️ 인터넷 클라우드 MongoDB Atlas 연결 대성공!!!');
    seedDatabase(); // DB 연결 성공 시 초기 데이터 체크 및 주입 함수 실행
  })
  .catch(err => console.error('❌ 클라우드 DB 연결 실패:', err));

// 📝 2. 데이터베이스에 저장할 '중고 상품 데이터'의 뼈대(Schema) 정의하기
const productSchema = new mongoose.Schema({
  id: Number,
  title: String,
  price: Number,
  category: String,
  location: String,
  date: String,
  image: String,
  description: String,
  exchangeItem: String,
  seller: String,
  sellerId: String
});

// 📦 데이터베이스 조작용 모델(Model) 생성
const Product = mongoose.model('Product', productSchema);

// 🏪 3. [초기 데이터 주입 함수] 클라우드 DB가 비어있을 때만 가짜 데이터 100개를 주입합니다.
async function seedDatabase() {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log('🌱 클라우드 DB가 비어있네요! 초기 가짜 데이터 100개를 생성 중...');
      
      const categories = ['디지털기기', '생활가구', '의류/잡화', '뷰티/미용', '도서/티켓', '스포츠/레저'];
      const locations = [
        '서울 도봉구 방학동', '서울 강남구 역삼동', '서울 마포구 서교동', 
        '경기 남양주시 다산동', '경기 성남시 분당구 정자동', '인천 연수구 송도동',
        '부산 해운대구 우동', '부산 진구 전포동'
      ];
      const itemNames = ['아이폰', '맥북', '에어팟', '캠핑 의자', '나이키 운동화', '무선 키보드', '가죽 자켓', '자전거'];
      const statusList = ['S급 상태 좋습니다.', '사용감 약간 있어요.', '풀박스 보관 중입니다.', '교환도 환영합니다.'];

      // 💡 키워드별 영문 Unsplash 매칭 맵 (상품명과 찰떡인 이미지를 매칭하기 위함)
      const imageKeywords = {
        '아이폰': 'iphone,smartphone',
        '맥북': 'macbook,laptop',
        '에어팟': 'airpods,earphones',
        '캠핑 의자': 'camping,chair',
        '나이키 운동화': 'sneakers,nike',
        '무선 키보드': 'keyboard,computer',
        '가죽 자켓': 'leather,jacket',
        '자전거': 'bicycle,bike'
      };

      let initialProducts = [];
      for (let i = 0; i < 100; i++) {
        const randomItem = faker.helpers.arrayElement(itemNames);
        const randomLocation = faker.helpers.arrayElement(locations);
        const randomCategory = faker.helpers.arrayElement(categories);
        
        // 해당 아이템에 맞는 영문 키워드 추출 (없으면 기본 object)
        const keyword = imageKeywords[randomItem] || 'object';

        initialProducts.push({
          id: i + 1,
          title: `${faker.word.adjective()} ${randomItem}`,
          price: Math.floor(faker.number.int({ min: 10, max: 800 }) * 1000),
          category: randomCategory,
          location: randomLocation,
          date: '2026-06-15',
          // 💡 Unsplash Source API를 이용해 해당 키워드에 맞는 고화질 중고 상품 느낌의 이미지를 매칭 (sig 값을 주어 각각 다르게 로드)
          image: `https://images.unsplash.com/featured/500x500/?${keyword}&sig=${i}`,
          description: faker.helpers.arrayElement(statusList) + ' 직거래 선호합니다.',
          exchangeItem: faker.helpers.arrayElement(itemNames) + '와 교환 원해요',
          seller: faker.person.fullName(),
          sellerId: `user_${faker.string.alphanumeric(5)}`
        });
      }
      
      await Product.insertMany(initialProducts);
      console.log('✅ 100개 상품 클라우드 DB 주입 완료!');
    } else {
      console.log(`📊 이미 클라우드 DB에 ${count}개의 상품이 존재하므로 가짜 데이터를 추가하지 않습니다.`);
    }
  } catch (err) {
    console.error('❌ 초기 데이터 주입 실패:', err);
  }
}

// 🌐 4. [GET] 전체 상품 리스트 가져오기 (클라우드 DB에서 조회!)
app.get('/api/products', async (req, res) => {
  try {
    const dbProducts = await Product.find().sort({ _id: -1 }); 
    res.json(dbProducts);
  } catch (err) {
    res.status(500).json({ message: "DB 조회 오류 발생", error: err.message });
  }
});

// 🌐 5. [POST] 새 상품 등록하기 (클라우드 DB에 영구 저장!)
app.post('/api/products', async (req, res) => {
  try {
    const newProduct = new Product({
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      ...req.body
    });
    
    const savedProduct = await newProduct.save(); 
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(500).json({ message: "DB 저장 오류 발생", error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 백엔드 API 서버가 포트 ${PORT} 에서 힘차게 달리는 중!`);
});