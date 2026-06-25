import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp, KOREA_REGION_TREE } from "../context/AppContext";
import "./Home.css";

const CATEGORIES = [
  { label: "전체", icon: "🏠" },
  { label: "디지털기기", icon: "💻" },
  { label: "생활가전", icon: "🖨️" },
  { label: "가구/인테리어", icon: "🛋️" },
  { label: "생활/주방", icon: "🍳" },
  { label: "유아동", icon: "🧸" },
  { label: "유아도서", icon: "📖" },
  { label: "여성의류", icon: "👗" },
  { label: "여성잡화", icon: "👜" },
  { label: "남성패션/잡화", icon: "🧥" },
  { label: "뷰티/미용", icon: "💄" },
  { label: "스포츠/레저", icon: "⚽" },
  { label: "취미/게임/음반", icon: "🎮" },
  { label: "도서", icon: "📚" },
  { label: "티켓/교환권", icon: "🎟️" },
  { label: "e쿠폰", icon: "🎁" },
  { label: "가공식품", icon: "🍜" },
  { label: "건강기능식품", icon: "💊" },
  { label: "반려동물용품", icon: "🐾" },
  { label: "식물", icon: "🌿" },
  { label: "기타 중고물품", icon: "📦" },
  { label: "삽니다", icon: "🛒" },
];

// 인기 검색어 (실제 서비스에서는 API에서 받아옴)
const HOT_KEYWORDS = [
  "아이폰15",
  "갤럭시S24",
  "닌텐도스위치",
  "에어팟",
  "다이슨",
  "러닝화",
  "레고",
  "캠핑의자",
  "전동킥보드",
  "미러리스카메라",
];

// 거래 활성 지역 (예시 데이터)
const ACTIVE_REGIONS = [
  { name: "서울 강남구", count: 128, temp: 98 },
  { name: "서울 마포구", count: 94, temp: 87 },
  { name: "경기 성남시 분당구", count: 81, temp: 83 },
  { name: "서울 송파구", count: 76, temp: 79 },
  { name: "부산 해운대구", count: 61, temp: 71 },
];

export default function Home() {
  const {
    filteredProducts,
    products,
    selectedCategory,
    setSelectedCategory,
    regionFilter,
    setRegionFilter,
    searchQuery,
    setSearchQuery,
    likedItems,
    toggleLike,
  } = useApp();

  const navigate = useNavigate();

  // 지역 모달
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [tmpSido, setTmpSido] = useState("");
  const [tmpSigungu, setTmpSigungu] = useState("");

  // 카테고리 드롭다운
  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef(null);

  // 최근 본 상품 (sessionStorage 기반)
  const [recentViewed, setRecentViewed] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("recentViewed") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const handler = (e) => {
      if (catRef.current && !catRef.current.contains(e.target))
        setCatOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const getRegionLabel = () => {
    if (!regionFilter || regionFilter.sido === "전국" || !regionFilter.sido)
      return "전국";
    if (regionFilter.sigungu === "전체" || !regionFilter.sigungu)
      return regionFilter.sido;
    if (regionFilter.dong === "전체" || !regionFilter.dong)
      return `${regionFilter.sido} ${regionFilter.sigungu}`;
    return `${regionFilter.sido} ${regionFilter.sigungu} ${regionFilter.dong}`;
  };

  const handleProductClick = (product) => {
    // 최근 본 상품 저장
    const updated = [
      product,
      ...recentViewed.filter((p) => p.id !== product.id),
    ].slice(0, 5);
    setRecentViewed(updated);
    sessionStorage.setItem("recentViewed", JSON.stringify(updated));
    navigate(`/product/${product.id}`);
  };

  const currentCat =
    CATEGORIES.find((c) => c.label === selectedCategory) || CATEGORIES[0];

  // 오늘의 추천 상품 (가격순 상위 3개 — 실서비스에서는 알고리즘 적용)
  const recommendedProducts = [...(products || [])]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  return (
    <div className="home-page">
      {/* ── 히어로 검색 배너 ── */}
      <div className="home-hero">
        <div className="hero-inner">
          <p className="hero-sub">우리 동네 중고거래, 더 쉽게</p>
          <h1 className="hero-title">무엇을 찾고 계세요?</h1>
          <div className="hero-search-wrap">
            <button
              className="region-pill"
              onClick={() => {
                setShowRegionModal(!showRegionModal);
                setCatOpen(false);
              }}
            >
              <span>📍</span>
              <span className="region-text">{getRegionLabel()}</span>
              <span className="region-arrow">▾</span>
            </button>
            <div className="hero-search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="상품명, 브랜드, 키워드 검색"
                value={searchQuery || ""}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {showRegionModal && (
          <div className="triple-modal">
            <div className="modal-top">
              <h5>📍 동네 선택</h5>
              <button
                className="reset-btn"
                onClick={() => {
                  setRegionFilter({
                    sido: "전국",
                    sigungu: "전체",
                    dong: "전체",
                  });
                  setTmpSido("");
                  setTmpSigungu("");
                  setShowRegionModal(false);
                }}
              >
                전국 초기화
              </button>
            </div>
            <div className="triple-box">
              <div className="col-box">
                {KOREA_REGION_TREE &&
                  Object.keys(KOREA_REGION_TREE).map((sido) => (
                    <div
                      key={sido}
                      className={`col-item ${tmpSido === sido ? "active" : ""}`}
                      onClick={() => {
                        setTmpSido(sido);
                        setTmpSigungu("");
                      }}
                    >
                      {sido}
                    </div>
                  ))}
              </div>
              <div className="col-box">
                {tmpSido && KOREA_REGION_TREE[tmpSido] ? (
                  <>
                    <div
                      className="col-item all-item"
                      onClick={() => {
                        setRegionFilter({
                          sido: tmpSido,
                          sigungu: "전체",
                          dong: "전체",
                        });
                        setShowRegionModal(false);
                      }}
                    >
                      {tmpSido} 전체
                    </div>
                    {Object.keys(KOREA_REGION_TREE[tmpSido]).map((sg) => (
                      <div
                        key={sg}
                        className={`col-item ${tmpSigungu === sg ? "active" : ""}`}
                        onClick={() => setTmpSigungu(sg)}
                      >
                        {sg}
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="col-empty">시/도 선택</div>
                )}
              </div>
              <div className="col-box">
                {tmpSido &&
                tmpSigungu &&
                KOREA_REGION_TREE[tmpSido][tmpSigungu] ? (
                  <>
                    <div
                      className="col-item all-item"
                      onClick={() => {
                        setRegionFilter({
                          sido: tmpSido,
                          sigungu: tmpSigungu,
                          dong: "전체",
                        });
                        setShowRegionModal(false);
                      }}
                    >
                      {tmpSigungu} 전체
                    </div>
                    {KOREA_REGION_TREE[tmpSido][tmpSigungu].map((dong) => (
                      <div
                        key={dong}
                        className="col-item"
                        onClick={() => {
                          setRegionFilter({
                            sido: tmpSido,
                            sigungu: tmpSigungu,
                            dong,
                          });
                          setShowRegionModal(false);
                        }}
                      >
                        {dong}
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="col-empty">구/군 선택</div>
                )}
              </div>
            </div>
            <button
              className="close-btn"
              onClick={() => setShowRegionModal(false)}
            >
              닫기
            </button>
          </div>
        )}
      </div>

      {/* ── 카테고리 드롭다운 바 ── */}
      <div className="category-section" ref={catRef}>
        <div className="category-bar">
          <button
            className="cat-toggle-btn"
            onClick={() => setCatOpen((p) => !p)}
            aria-expanded={catOpen}
          >
            <span className="cat-toggle-icon">{currentCat.icon}</span>
            <span className="cat-toggle-label">{currentCat.label}</span>
            <span className={`cat-toggle-arrow ${catOpen ? "open" : ""}`}>
              ▾
            </span>
          </button>
          <div className="cat-quick-row">
            {CATEGORIES.slice(0, 6).map(({ label, icon }) => (
              <button
                key={label}
                className={`cat-quick-chip ${selectedCategory === label ? "active" : ""}`}
                onClick={() => {
                  setSelectedCategory(label);
                  setCatOpen(false);
                }}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
        {catOpen && (
          <div className="cat-dropdown-panel">
            <p className="cat-dropdown-title">카테고리 전체 보기</p>
            <div className="cat-dropdown-grid">
              {CATEGORIES.map(({ label, icon }) => (
                <button
                  key={label}
                  className={`cat-dropdown-item ${selectedCategory === label ? "active" : ""}`}
                  onClick={() => {
                    setSelectedCategory(label);
                    setCatOpen(false);
                  }}
                >
                  <span className="cat-drop-icon">{icon}</span>
                  <span className="cat-drop-label">{label}</span>
                  {selectedCategory === label && (
                    <span className="cat-check">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════
          3단 레이아웃: 좌 사이드바 | 메인 | 우 사이드바
          ══════════════════════════════════════════ */}
      <div className="home-body">
        {/* ━━━━ 왼쪽 사이드바 ━━━━ */}
        <aside className="sidebar sidebar-left">
          {/* 카테고리 퀵 네비 */}
          <div className="side-card">
            <h3 className="side-title">📂 카테고리</h3>
            <ul className="side-cat-list">
              {CATEGORIES.map(({ label, icon }) => (
                <li key={label}>
                  <button
                    className={`side-cat-item ${selectedCategory === label ? "active" : ""}`}
                    onClick={() => setSelectedCategory(label)}
                  >
                    <span className="side-cat-icon">{icon}</span>
                    <span className="side-cat-label">{label}</span>
                    {selectedCategory === label && (
                      <span className="side-cat-dot" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* 최근 본 상품 */}
          {recentViewed.length > 0 && (
            <div className="side-card">
              <div className="side-title-row">
                <h3 className="side-title">👀 최근 본 상품</h3>
                <button
                  className="side-clear-btn"
                  onClick={() => {
                    setRecentViewed([]);
                    sessionStorage.removeItem("recentViewed");
                  }}
                >
                  지우기
                </button>
              </div>
              <ul className="recent-list">
                {recentViewed.map((p) => (
                  <li
                    key={p.id}
                    className="recent-item"
                    onClick={() => navigate(`/product/${p.id}`)}
                  >
                    <img src={p.image} alt={p.title} className="recent-img" />
                    <div className="recent-info">
                      <p className="recent-title">{p.title}</p>
                      <p className="recent-price">
                        {p.price?.toLocaleString()}원
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        {/* ━━━━ 메인 콘텐츠 ━━━━ */}
        <main className="home-main">
          {/* 결과 헤더 */}
          <div className="results-header">
            <span className="results-count">
              {filteredProducts?.length ?? 0}개의 상품
            </span>
            <span className="results-region-tag">
              📍 {getRegionLabel()} ·{" "}
              {selectedCategory === "전체" ? "전체 카테고리" : selectedCategory}
            </span>
          </div>

          {/* 상품 그리드 */}
          <div className="main-product-grid">
            {filteredProducts &&
              filteredProducts.map((product, idx) => {
                const isLiked =
                  likedItems &&
                  (Array.isArray(likedItems)
                    ? likedItems.includes(product.id) ||
                      likedItems.includes(String(product.id))
                    : typeof likedItems.has === "function"
                      ? likedItems.has(String(product.id))
                      : false);
                const isHot = idx < 3;

                return (
                  <div key={product.id} className="main-card">
                    <div
                      className="card-img-holder"
                      onClick={() => handleProductClick(product)}
                    >
                      <img src={product.image} alt={product.title} />
                      {isHot && <span className="hot-badge">🔥 인기</span>}
                      <button
                        className={`main-card-like-btn ${isLiked ? "liked" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(product.id);
                        }}
                        aria-label={isLiked ? "찜 해제" : "찜하기"}
                      >
                        {isLiked ? "❤️" : "🤍"}
                      </button>
                    </div>
                    <div
                      className="card-details"
                      onClick={() => handleProductClick(product)}
                    >
                      <span className="card-cat-badge">{product.category}</span>
                      <h4 className="card-title">{product.title}</h4>
                      <p className="card-meta">
                        <span className="card-location-icon">📍</span>
                        {product.location}
                      </p>
                      <div className="card-price-row">
                        <strong className="card-price">
                          {product.price.toLocaleString()}원
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {filteredProducts && filteredProducts.length === 0 && (
            <div className="empty-state">
              <p className="empty-icon">🔍</p>
              <p className="empty-title">검색 결과가 없어요</p>
              <p className="empty-desc">
                다른 키워드나 지역으로 다시 검색해 보세요.
              </p>
            </div>
          )}
        </main>

        {/* ━━━━ 오른쪽 사이드바 ━━━━ */}
        <aside className="sidebar sidebar-right">
          {/* 🔥 인기 검색어 */}
          <div className="side-card">
            <h3 className="side-title">🔥 인기 검색어</h3>
            <ol className="keyword-list">
              {HOT_KEYWORDS.map((kw, i) => (
                <li
                  key={kw}
                  className="keyword-item"
                  onClick={() => setSearchQuery(kw)}
                >
                  <span className={`kw-rank ${i < 3 ? "top" : ""}`}>
                    {i + 1}
                  </span>
                  <span className="kw-text">{kw}</span>
                  {i < 3 && <span className="kw-fire">🔥</span>}
                </li>
              ))}
            </ol>
          </div>

          {/* 📍 거래 활성 지역 */}
          <div className="side-card">
            <h3 className="side-title">📍 거래 활성 지역 TOP5</h3>
            <ul className="region-rank-list">
              {ACTIVE_REGIONS.map((r, i) => (
                <li
                  key={r.name}
                  className="region-rank-item"
                  onClick={() => {
                    const [sido, ...rest] = r.name.split(" ");
                    setRegionFilter({
                      sido,
                      sigungu: rest.join(" ") || "전체",
                      dong: "전체",
                    });
                  }}
                >
                  <span className="rr-rank">{i + 1}</span>
                  <div className="rr-info">
                    <p className="rr-name">{r.name}</p>
                    <div className="rr-bar-wrap">
                      <div className="rr-bar" style={{ width: `${r.temp}%` }} />
                    </div>
                  </div>
                  <span className="rr-count">{r.count}건</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ✨ 오늘의 추천 상품 */}
          <div className="side-card">
            <h3 className="side-title">✨ 오늘의 추천</h3>
            <ul className="recommend-list">
              {recommendedProducts.map((p) => (
                <li
                  key={p.id}
                  className="recommend-item"
                  onClick={() => handleProductClick(p)}
                >
                  <img src={p.image} alt={p.title} className="rec-img" />
                  <div className="rec-info">
                    <p className="rec-title">{p.title}</p>
                    <p className="rec-price">{p.price?.toLocaleString()}원</p>
                    <span className="rec-badge">{p.category}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* 💬 안전거래 배너 */}
          <div className="side-card safe-trade-banner">
            <p className="safe-icon">🛡️</p>
            <p className="safe-title">안전하게 거래하세요</p>
            <p className="safe-desc">
              직거래 시 공공장소에서 만나고, 송금 전 반드시 상품을 확인하세요.
            </p>
            <div className="safe-tips">
              <span>✅ 공공장소 거래</span>
              <span>✅ 현장 확인 후 결제</span>
              <span>✅ 영수증 보관</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
