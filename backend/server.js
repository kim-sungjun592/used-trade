global.crypto = require('crypto');
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors'); // 👈 [추가] 브라우저 CORS 차단 문제를 해결할 정식 라이브러리

const app = express();
const PORT = 5002; // 👈 [수정] 프론트엔드가 요청 중인 5002 포트로 강제 고정합니다.

// 💡 [수정] 수동 헤더 설정 대신, Safari/Webkit의 Access Control 필터를 우회하는 정식 CORS 미들웨어 적용
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

app.use(express.json());

const MONGO_URI = 'mongodb+srv://rlatjdwns:1234@cluster0.b1wyqpf.mongodb.net/used_trade_v2?appName=Cluster0';
const JWT_SECRET = 'used_trade_secret_key_9999';
const KAKAO_REST_API_KEY = '43662cd5849fc5c0bd00b5e97efa2e97';
const KAKAO_REDIRECT_URI = 'http://localhost:5002/api/auth/kakao/callback';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('☁️ MongoDB Atlas 연결 성공!');
    const { fakerKO: faker } = await import('@faker-js/faker');
    await seedDatabase(faker);
  })
  .catch(err => console.error('❌ DB 연결 실패:', err));

// --- 스키마 정의 ---
const productSchema = new mongoose.Schema({
  id: Number, title: String, price: Number,
  category: String, location: String, date: String,
  image: String, description: String,
  exchangeItem: String, seller: String, sellerId: String
});
const Product = mongoose.model('Product', productSchema);

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nickname: { type: String, required: true },
  wishlist: { type: [Number], default: [] }
});
const User = mongoose.model('User', userSchema);

// --- 미들웨어: 토큰 인증 ---
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: '로그인이 필요합니다.' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) { res.status(401).json({ message: '토큰이 만료되었습니다.' }); }
};

// --- API 라우터 ---
app.post('/api/wishlist', authenticate, async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user.id);
    if (user.wishlist.includes(productId)) {
      user.wishlist = user.wishlist.filter(id => id !== productId);
    } else {
      user.wishlist.push(productId);
    }
    await user.save();
    res.json({ wishlist: user.wishlist });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/wishlist', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ wishlist: user.wishlist });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/products', async (req, res) => {
  try { const products = await Product.find().sort({ _id: -1 }); res.json(products); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, nickname } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: '이미 가입된 이메일입니다.' });
    const hashed = await bcrypt.hash(password, 10);
    await new User({ email, password: hashed, nickname }).save();
    res.status(201).json({ message: '가입 성공!' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: '가입되지 않은 이메일입니다.' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: '비밀번호 불일치' });
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, nickname: user.nickname });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/auth/kakao/callback', async (req, res) => {
  try {
    const { code } = req.query;
    const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'authorization_code', client_id: KAKAO_REST_API_KEY, redirect_uri: KAKAO_REDIRECT_URI, code })
    });
    const tokenData = await tokenRes.json();
    const userRes = await fetch('https://kapi.kakao.com/v2/user/me', { headers: { Authorization: `Bearer ${tokenData.access_token}` } });
    const kakaoUser = await userRes.json();
    const email = kakaoUser.kakao_account?.email || `kakao_${kakaoUser.id}@kakao.com`;
    let user = await User.findOne({ email });
    if (!user) {
      user = await new User({ email, password: await bcrypt.hash(String(kakaoUser.id), 10), nickname: kakaoUser.kakao_account?.profile?.nickname || '카카오유저' }).save();
    }
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });
    res.redirect(`http://localhost:3000?token=${token}&nickname=${encodeURIComponent(user.nickname)}`);
  } catch (err) { res.redirect('http://localhost:3000?error=kakao_failed'); }
});

async function seedDatabase(faker) {
  const count = await Product.countDocuments();
  if (count > 0) return;
  console.log('🌱 상품 데이터 생성 중...');
  const initialProducts = Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    title: `${faker.word.adjective()} ${faker.commerce.product()}`,
    price: Math.floor(Math.random() * 50000) + 1000,
    category: '기타', location: '서울', date: '2026-06-15',
    image: `https://picsum.photos/400?random=${i}`,
    description: '상태 좋아요!', seller: '판매자', sellerId: 'user1'
  }));
  await Product.insertMany(initialProducts);
}

app.post('/api/auth/verify-password', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: '토큰이 없습니다.' });
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: '유저를 찾을 수 없습니다.' });
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) return res.status(400).json({ message: '비밀번호가 일치하지 않습니다.' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: '서버 에러', error: err.message });
  }
});

app.put('/api/auth/update', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: '토큰이 없습니다.' });
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: '유저를 찾을 수 없습니다.' });
    if (req.body.nickname) user.nickname = req.body.nickname;
    if (req.body.email) user.email = req.body.email;
    if (req.body.password) user.password = await bcrypt.hash(req.body.password, 10);
    await user.save();
    res.json({ message: '회원정보가 수정되었습니다.' });
  } catch (err) {
    res.status(500).json({ message: '서버 에러', error: err.message });
  }
});

app.listen(PORT, () => console.log(`🚀 서버 포트 ${PORT} 실행 중!`));