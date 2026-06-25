import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp, KOREA_REGION_TREE } from "../context/AppContext";
import {
  Camera,
  X,
  MapPin,
  Tag,
  RefreshCw,
  ChevronDown,
  Plus,
  Check,
} from "lucide-react";
import "./SellPage.css";

// ── Home.jsx와 동일한 카테고리 목록 ──────────────────
const CATEGORIES = [
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

export default function SellPage() {
  const { addProduct, currentUser } = useApp();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // ── 폼 상태 ────────────────────────────────────────
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [isBarterEnabled, setIsBarterEnabled] = useState(false);
  const [exchangeItem, setExchangeItem] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  // ── 카테고리 드롭다운 상태 ─────────────────────────
  const [category, setCategory] = useState("");
  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef(null);

  // ── 지역 드롭다운 상태 (복수 선택 가능) ────────────
  const [regionOpen, setRegionOpen] = useState(false);
  const [tmpSido, setTmpSido] = useState("");
  const [tmpSigungu, setTmpSigungu] = useState("");
  const [selectedRegions, setSelectedRegions] = useState([]); // ['서울 강남구 역삼동', ...]
  const regionRef = useRef(null);

  // 드롭다운 외부 클릭 닫기
  useEffect(() => {
    const handler = (e) => {
      if (catRef.current && !catRef.current.contains(e.target))
        setCatOpen(false);
      if (regionRef.current && !regionRef.current.contains(e.target))
        setRegionOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── 이미지 처리 ────────────────────────────────────
  const handleTriggerFileInput = () => fileInputRef.current?.click();
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };
  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── 지역 추가/제거 ─────────────────────────────────
  const addRegion = (regionStr) => {
    if (!selectedRegions.includes(regionStr)) {
      setSelectedRegions((prev) => [...prev, regionStr]);
    }
  };
  const removeRegion = (regionStr) => {
    setSelectedRegions((prev) => prev.filter((r) => r !== regionStr));
  };

  // ── 제출 ───────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !price) {
      alert("글 제목과 가격은 필수 입력 항목입니다.");
      return;
    }
    if (!category) {
      alert("카테고리를 선택해 주세요.");
      return;
    }
    if (selectedRegions.length === 0) {
      alert("거래 희망 지역을 최소 1개 선택해 주세요.");
      return;
    }
    if (!currentUser) {
      alert("로그인 후 상품을 등록할 수 있습니다.");
      return;
    }

    const newProduct = {
      title,
      price: Number(price),
      category,
      location: selectedRegions[0], // 첫 번째 지역을 대표 location으로
      locations: selectedRegions, // 전체 지역 배열
      exchangeItem:
        isBarterEnabled && exchangeItem ? exchangeItem : "없음 (판매만 가능)",
      description: description || "등록된 상세 설명이 없습니다.",
      image:
        imagePreview ||
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
      seller: currentUser.name,
      sellerId: currentUser.id || currentUser.email,
      status: "판매중",
    };

    if (addProduct) addProduct(newProduct);
    alert("상품 등록이 완료되었습니다!");
    navigate("/");
  };

  const selectedCat = CATEGORIES.find((c) => c.label === category);

  return (
    <div className="sell-page-wrap">
      {/* ── 페이지 헤더 ── */}
      <div className="sell-hero">
        <div className="sell-hero-inner">
          <p className="sell-hero-eyebrow">🥕 내 물건 팔기</p>
          <h1 className="sell-hero-title">판매할 물건을 등록해요</h1>
          <p className="sell-hero-sub">
            정확한 정보와 사진으로 빠른 거래를 만들어보세요
          </p>
        </div>
      </div>

      {/* ── 폼 카드 ── */}
      <div className="sell-form-outer">
        <form onSubmit={handleSubmit} className="sell-form-card">
          {/* 1. 이미지 업로드 */}
          <section className="sell-section">
            <label className="sell-label">
              <span className="label-num">01</span> 상품 이미지
            </label>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <div className="image-row">
              <div className="upload-trigger" onClick={handleTriggerFileInput}>
                <Camera size={26} color="#FF6F61" />
                <span>사진 추가</span>
                <span className="img-count-hint">
                  {imagePreview ? "1/1" : "0/1"}
                </span>
              </div>
              {imagePreview && (
                <div className="img-preview-wrap">
                  <img src={imagePreview} alt="미리보기" />
                  <button
                    type="button"
                    className="img-remove-btn"
                    onClick={handleRemoveImage}
                  >
                    <X size={13} />
                  </button>
                  <span className="img-main-badge">대표</span>
                </div>
              )}
            </div>
            <p className="field-hint">
              첫 번째 사진이 대표 이미지로 사용됩니다.
            </p>
          </section>

          {/* 2. 글 제목 */}
          <section className="sell-section">
            <label className="sell-label">
              <span className="label-num">02</span> 글 제목{" "}
              <span className="required">*</span>
            </label>
            <div className="input-wrap">
              <Tag size={16} className="input-icon" />
              <input
                type="text"
                placeholder="어떤 물건을 파시나요?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
          </section>

          {/* 3. 카테고리 드롭다운 */}
          <section className="sell-section" ref={catRef}>
            <label className="sell-label">
              <span className="label-num">03</span> 카테고리{" "}
              <span className="required">*</span>
            </label>
            <button
              type="button"
              className={`dropdown-trigger ${catOpen ? "open" : ""} ${category ? "selected" : ""}`}
              onClick={() => setCatOpen((p) => !p)}
            >
              <span className="dropdown-value">
                {selectedCat ? (
                  <>
                    <span className="drop-icon">{selectedCat.icon}</span>
                    {selectedCat.label}
                  </>
                ) : (
                  "카테고리를 선택하세요"
                )}
              </span>
              <ChevronDown
                size={16}
                className={`chevron ${catOpen ? "rotated" : ""}`}
              />
            </button>

            {catOpen && (
              <div className="cat-panel">
                <p className="panel-hint">카테고리를 선택해 주세요</p>
                <div className="cat-grid">
                  {CATEGORIES.map(({ label, icon }) => (
                    <button
                      key={label}
                      type="button"
                      className={`cat-item ${category === label ? "active" : ""}`}
                      onClick={() => {
                        setCategory(label);
                        setCatOpen(false);
                      }}
                    >
                      <span className="cat-item-icon">{icon}</span>
                      <span className="cat-item-label">{label}</span>
                      {category === label && (
                        <Check size={12} className="cat-check" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* 4. 가격 */}
          <section className="sell-section">
            <label className="sell-label">
              <span className="label-num">04</span> 가격{" "}
              <span className="required">*</span>
            </label>
            <div className="input-wrap">
              <span className="won-sign">₩</span>
              <input
                type="number"
                placeholder="가격을 입력하세요"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
              {price && (
                <span className="price-preview">
                  {Number(price).toLocaleString()}원
                </span>
              )}
            </div>
          </section>

          {/* 5. 거래 희망 지역 (복수 선택) */}
          <section className="sell-section" ref={regionRef}>
            <label className="sell-label">
              <span className="label-num">05</span> 거래 희망 지역{" "}
              <span className="required">*</span>
            </label>
            <p className="field-hint">여러 지역을 추가할 수 있어요.</p>

            {/* 선택된 지역 태그 */}
            {selectedRegions.length > 0 && (
              <div className="region-tags">
                {selectedRegions.map((r) => (
                  <span key={r} className="region-tag">
                    <MapPin size={11} />
                    {r}
                    <button type="button" onClick={() => removeRegion(r)}>
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* 지역 추가 버튼 */}
            <button
              type="button"
              className={`dropdown-trigger region-add-btn ${regionOpen ? "open" : ""}`}
              onClick={() => setRegionOpen((p) => !p)}
            >
              <MapPin size={15} style={{ color: "#FF6F61" }} />
              <span>지역 추가하기</span>
              <Plus
                size={15}
                className={`chevron ${regionOpen ? "rotated" : ""}`}
              />
            </button>

            {/* 지역 3단 패널 */}
            {regionOpen && (
              <div className="region-panel">
                <div className="region-panel-header">
                  <span>시/도 선택</span>
                  <span>시/군/구 선택</span>
                  <span>읍/면/동 선택</span>
                </div>
                <div className="region-triple">
                  {/* 1열: 시/도 */}
                  <div className="region-col">
                    {Object.keys(KOREA_REGION_TREE).map((sido) => (
                      <div
                        key={sido}
                        className={`region-col-item ${tmpSido === sido ? "active" : ""}`}
                        onClick={() => {
                          setTmpSido(sido);
                          setTmpSigungu("");
                        }}
                      >
                        {sido}
                      </div>
                    ))}
                  </div>

                  {/* 2열: 시/군/구 */}
                  <div className="region-col">
                    {tmpSido && KOREA_REGION_TREE[tmpSido] ? (
                      <>
                        <div
                          className="region-col-all"
                          onClick={() => {
                            addRegion(`${tmpSido}`);
                          }}
                        >
                          {tmpSido} 전체 추가 <Plus size={12} />
                        </div>
                        {Object.keys(KOREA_REGION_TREE[tmpSido]).map((sg) => (
                          <div
                            key={sg}
                            className={`region-col-item ${tmpSigungu === sg ? "active" : ""}`}
                            onClick={() => setTmpSigungu(sg)}
                          >
                            {sg}
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="region-empty">
                        시/도를 먼저 선택하세요
                      </div>
                    )}
                  </div>

                  {/* 3열: 읍/면/동 */}
                  <div className="region-col">
                    {tmpSido &&
                    tmpSigungu &&
                    KOREA_REGION_TREE[tmpSido]?.[tmpSigungu] ? (
                      <>
                        <div
                          className="region-col-all"
                          onClick={() => addRegion(`${tmpSido} ${tmpSigungu}`)}
                        >
                          {tmpSigungu} 전체 추가 <Plus size={12} />
                        </div>
                        {KOREA_REGION_TREE[tmpSido][tmpSigungu].map((dong) => (
                          <div
                            key={dong}
                            className={`region-col-item ${selectedRegions.includes(`${tmpSido} ${tmpSigungu} ${dong}`) ? "checked" : ""}`}
                            onClick={() =>
                              addRegion(`${tmpSido} ${tmpSigungu} ${dong}`)
                            }
                          >
                            {dong}
                            {selectedRegions.includes(
                              `${tmpSido} ${tmpSigungu} ${dong}`,
                            ) && (
                              <Check
                                size={12}
                                style={{ color: "#FF6F61", marginLeft: "auto" }}
                              />
                            )}
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="region-empty">시/군/구를 선택하세요</div>
                    )}
                  </div>
                </div>

                <div className="region-panel-footer">
                  <span>{selectedRegions.length}개 지역 선택됨</span>
                  <button
                    type="button"
                    className="panel-done-btn"
                    onClick={() => setRegionOpen(false)}
                  >
                    완료
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* 6. 교환 토글 */}
          <section className="sell-section">
            <label className="sell-label">
              <span className="label-num">06</span> 교환 가능 여부
            </label>
            <div className="barter-row">
              <div className="barter-text">
                <p className="barter-title">다른 물건과 교환도 원해요</p>
                <p className="barter-sub">
                  돈 대신 다른 물품으로 교환 신청을 받을 수 있습니다.
                </p>
              </div>
              <button
                type="button"
                className={`toggle-switch ${isBarterEnabled ? "on" : ""}`}
                onClick={() => setIsBarterEnabled((p) => !p)}
              >
                <span className="toggle-knob" />
              </button>
            </div>
            {isBarterEnabled && (
              <div className="input-wrap animated-in">
                <RefreshCw size={16} className="input-icon spin-slow" />
                <input
                  type="text"
                  placeholder="원하는 교환 물건을 입력하세요 (예: 아이패드, 에어팟)"
                  value={exchangeItem}
                  onChange={(e) => setExchangeItem(e.target.value)}
                  required={isBarterEnabled}
                />
              </div>
            )}
          </section>

          {/* 7. 상세 설명 */}
          <section className="sell-section">
            <label className="sell-label">
              <span className="label-num">07</span> 상세 설명
            </label>
            <textarea
              rows="6"
              placeholder={`브랜드, 구매 시기, 사용감, 하자 여부 등을 솔직하게 적어주세요.\n\n구체적인 설명이 있으면 훨씬 빠르게 거래돼요!`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <p className="char-count">{description.length}자</p>
          </section>

          {/* ── 등록 버튼 ── */}
          <button type="submit" className="sell-submit-btn">
            <span>상품 등록하기</span>
          </button>
        </form>
      </div>
    </div>
  );
}
