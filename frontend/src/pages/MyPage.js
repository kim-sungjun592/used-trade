import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import "./MyPage.css";

const MENU_ITEMS = [
  { key: "info", icon: "👤", label: "회원정보 관리" },
  { key: "myItems", icon: "📦", label: "내 등록 상품" },
  { key: "likes", icon: "❤️", label: "찜 목록" },
  { key: "barter", icon: "🔄", label: "교환 내역" },
  { key: "review", icon: "⭐", label: "거래 후기" },
  { key: "support", icon: "💬", label: "고객지원" },
  { key: "settings", icon: "⚙️", label: "계정 설정" },
];

const FAQS = [
  {
    q: "거래 중 사기를 당했어요. 어떻게 하나요?",
    a: "즉시 거래를 중단하고 상대방을 차단한 뒤, 고객센터(1:1 문의)로 증거 자료(대화 캡처, 송금 내역)와 함께 신고해 주세요.",
  },
  {
    q: "상품 등록이 안 돼요.",
    a: "이미지 파일 크기(최대 10MB), 형식(JPG·PNG·WEBP), 제목·가격 필수 입력 여부를 확인해 주세요.",
  },
  {
    q: "포인트는 어디에 사용하나요?",
    a: "포인트는 상품 끌어올리기, 프리미엄 배지 구매, 제휴 이벤트 쿠폰 교환에 사용할 수 있습니다. 1P = 1원입니다.",
  },
  {
    q: "회원 탈퇴는 어떻게 하나요?",
    a: '계정 설정 탭 하단 "계정 탈퇴" 버튼을 누르면 탈퇴 절차가 시작됩니다. 탈퇴 후 30일 이내에는 복구 가능합니다.',
  },
  {
    q: "내 위치 정보는 어떻게 관리되나요?",
    a: "위치 정보는 거래 지역 필터링에만 사용되며 서버에 저장되지 않습니다. 브라우저 권한 설정에서 언제든지 철회할 수 있습니다.",
  },
];

const DUMMY_REVIEWS = [
  {
    id: 1,
    from: "행복한구매자",
    rating: 5,
    text: "상품 상태가 사진과 똑같았어요. 친절하게 응해주셔서 감사합니다!",
    date: "2025.05.12",
  },
  {
    id: 2,
    from: "빠른거래왕",
    rating: 4,
    text: "빠른 거래 감사해요. 다음에 또 거래해요!",
    date: "2025.04.28",
  },
];

export default function MyPage() {
  const {
    currentUser,
    myPoints,
    barterRequests,
    updateUserInfo,
    verifyPassword,
    myProducts,
    likedProducts,
    logout,
  } = useApp();

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info");

  const user = currentUser || { name: "게스트", email: "", id: "guest" };
  const points = myPoints || 0;
  const requests = barterRequests || [];
  const likes = likedProducts || [];

  // ── 회원정보 수정 (기존 기능 100% 유지 + 비밀번호 확인 강화) ──
  const [isEditMode, setIsEditMode] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [editName, setEditName] = useState(user.name);
  const [editEmail, setEditEmail] = useState(user.email);
  const [editPassword, setEditPassword] = useState("");
  const [editConfirmPw, setEditConfirmPw] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [pwVerifying, setPwVerifying] = useState(false);

  // ── 계정 설정 토글 ──
  const [notiTrade, setNotiTrade] = useState(true);
  const [notiChat, setNotiChat] = useState(true);
  const [notiEvent, setNotiEvent] = useState(false);

  // ── 고객지원 ──
  const [openFaq, setOpenFaq] = useState(null);
  const [inquiryType, setInquiryType] = useState("거래 문제");
  const [inquiryText, setInquiryText] = useState("");
  const [inquirySent, setInquirySent] = useState(false);

  // ── 거래 후기 ──
  const avgRating =
    DUMMY_REVIEWS.reduce((s, r) => s + r.rating, 0) / DUMMY_REVIEWS.length;
  const tempDegree = (avgRating * 20).toFixed(1);
  const tempColor =
    avgRating >= 4.5 ? "#FF6F61" : avgRating >= 3.5 ? "#f59e0b" : "#64748b";
  const tempEmoji = avgRating >= 4.5 ? "🔥" : avgRating >= 3.5 ? "😊" : "🥶";

  // ── 비밀번호 인증 (기존 verifyPassword 함수 그대로 사용) ──
  const handleVerifyPassword = async (e) => {
    e.preventDefault();
    if (!confirmPassword) {
      setMessage("비밀번호를 입력해주세요.");
      setIsSuccess(false);
      return;
    }
    setPwVerifying(true);
    const res = await verifyPassword(confirmPassword);
    setPwVerifying(false);
    if (res.success) {
      setIsEditMode(true);
      setMessage("");
    } else {
      setMessage("비밀번호가 일치하지 않습니다.");
      setIsSuccess(false);
    }
  };

  // ── 회원정보 저장 (기존 updateUserInfo 함수 그대로 사용) ──
  const handleSaveInfo = async (e) => {
    e.preventDefault();
    if (!editName || !editEmail) {
      setMessage("빈칸을 모두 채워주세요.");
      return;
    }
    if (editPassword && editPassword !== editConfirmPw) {
      setMessage("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    const updateData = { nickname: editName, email: editEmail };
    if (editPassword) updateData.password = editPassword;
    const res = await updateUserInfo(updateData);
    if (res.success) {
      setMessage("회원정보가 변경되었습니다!");
      setIsSuccess(true);
      setIsEditMode(false);
      setConfirmPassword("");
      setEditPassword("");
      setEditConfirmPw("");
    } else {
      setMessage(res.message || "저장에 실패했습니다.");
      setIsSuccess(false);
    }
  };

  const handleInquirySubmit = (e) => {
    e.preventDefault();
    if (!inquiryText.trim()) return;
    setInquirySent(true);
    setInquiryText("");
  };

  const handleLogout = () => {
    if (window.confirm("로그아웃 하시겠어요?")) {
      logout();
      navigate("/");
    }
  };

  return (
    <div className="mp-wrap">
      {/* ════ 왼쪽 사이드 패널 ════ */}
      <aside className="mp-side">
        {/* 프로필 카드 */}
        <div className="mp-profile-card">
          <div className="mp-avatar">
            {user.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <p className="mp-uname">{user.name}</p>
          <p className="mp-uemail">{user.email || "이메일 없음"}</p>
          <div className="mp-point-pill">🏅 {points.toLocaleString()} P</div>
        </div>

        {/* 거래 온도 */}
        <div className="mp-temp-card">
          <div className="mp-temp-top">
            <p className="mp-temp-label">거래 온도</p>
            <span className="mp-temp-num" style={{ color: tempColor }}>
              {tempDegree}°C {tempEmoji}
            </span>
          </div>
          <div className="mp-temp-track">
            <div
              className="mp-temp-fill"
              style={{ width: `${avgRating * 20}%`, background: tempColor }}
            />
          </div>
          <p className="mp-temp-hint">후기 {DUMMY_REVIEWS.length}개 기준</p>
        </div>

        {/* 요약 통계 */}
        <div className="mp-stats">
          {[
            { n: myProducts?.length || 0, l: "판매중" },
            { n: likes?.length || 0, l: "찜" },
            { n: requests?.length || 0, l: "교환" },
          ].map((s) => (
            <div key={s.l} className="mp-stat">
              <span className="mp-stat-n">{s.n}</span>
              <span className="mp-stat-l">{s.l}</span>
            </div>
          ))}
        </div>

        {/* 네비 */}
        <nav className="mp-nav">
          {MENU_ITEMS.map((m) => (
            <button
              key={m.key}
              className={`mp-nav-btn ${activeTab === m.key ? "active" : ""}`}
              onClick={() => setActiveTab(m.key)}
            >
              <span>{m.icon}</span>
              <span>{m.label}</span>
              {m.key === "myItems" && myProducts?.length > 0 && (
                <span className="mp-nav-badge">{myProducts.length}</span>
              )}
              {m.key === "likes" && likes?.length > 0 && (
                <span className="mp-nav-badge">{likes.length}</span>
              )}
              {m.key === "barter" && requests?.length > 0 && (
                <span className="mp-nav-badge">{requests.length}</span>
              )}
            </button>
          ))}
        </nav>

        <button className="mp-logout" onClick={handleLogout}>
          🚪 로그아웃
        </button>
      </aside>

      {/* ════ 오른쪽 콘텐츠 ════ */}
      <main className="mp-main">
        {/* ──────────────────────────────────────────
            탭 A: 회원정보 관리
        ────────────────────────────────────────── */}
        {activeTab === "info" && (
          <div className="mp-pane">
            <div className="mp-pane-head">
              <h2>회원정보 관리</h2>
              <p>계정 정보를 확인하고 안전하게 수정할 수 있어요.</p>
            </div>

            {message && (
              <div className={`mp-msg ${isSuccess ? "ok" : "err"}`}>
                {isSuccess ? "✅" : "⚠️"} {message}
              </div>
            )}

            {!isEditMode ? (
              <div className="mp-cards-col">
                {/* 현재 정보 카드 */}
                <div className="mp-card">
                  <h3 className="mp-card-title">현재 정보</h3>
                  <div className="mp-info-table">
                    {[
                      { k: "닉네임", v: user.name },
                      { k: "이메일", v: user.email || "—" },
                      {
                        k: "계정 유형",
                        v: <span className="mp-tag coral">일반 회원</span>,
                      },
                      { k: "가입일", v: "2025.01.15" },
                      {
                        k: "포인트",
                        v: (
                          <span className="mp-tag gold">
                            🏅 {points.toLocaleString()} P
                          </span>
                        ),
                      },
                      {
                        k: "거래 온도",
                        v: (
                          <span
                            className="mp-tag"
                            style={{
                              background: `${tempColor}22`,
                              color: tempColor,
                            }}
                          >
                            {tempDegree}°C {tempEmoji}
                          </span>
                        ),
                      },
                    ].map((r) => (
                      <div key={r.k} className="mp-info-row">
                        <span className="mp-info-k">{r.k}</span>
                        <span className="mp-info-v">{r.v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 비밀번호 인증 카드 */}
                <div className="mp-card">
                  <h3 className="mp-card-title">정보 수정</h3>
                  <p className="mp-card-sub">
                    보안을 위해 <strong>로그인 시 사용한 비밀번호</strong>를
                    입력해야 정보 수정이 가능해요.
                  </p>
                  <form
                    onSubmit={handleVerifyPassword}
                    className="mp-verify-form"
                  >
                    <div className="mp-input-row">
                      <span className="mp-in-icon">🔒</span>
                      <input
                        type="password"
                        placeholder="현재 비밀번호 입력"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="mp-btn-primary"
                      disabled={pwVerifying}
                    >
                      {pwVerifying ? "확인 중..." : "인증하고 수정하기"}
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              /* 수정 폼 */
              <form onSubmit={handleSaveInfo} className="mp-card">
                <h3 className="mp-card-title">정보 수정</h3>
                <div className="mp-edit-grid">
                  <div className="mp-field">
                    <label>닉네임</label>
                    <div className="mp-input-row">
                      <span className="mp-in-icon">👤</span>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="mp-field">
                    <label>이메일</label>
                    <div className="mp-input-row">
                      <span className="mp-in-icon">✉️</span>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="mp-field">
                    <label>
                      새 비밀번호 <span className="mp-opt">(선택)</span>
                    </label>
                    <div className="mp-input-row">
                      <span className="mp-in-icon">🔑</span>
                      <input
                        type="password"
                        placeholder="변경할 경우에만 입력"
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="mp-field">
                    <label>새 비밀번호 확인</label>
                    <div
                      className={`mp-input-row ${editConfirmPw && editConfirmPw !== editPassword ? "err" : ""}`}
                    >
                      <span className="mp-in-icon">🔑</span>
                      <input
                        type="password"
                        placeholder="비밀번호 재입력"
                        value={editConfirmPw}
                        onChange={(e) => setEditConfirmPw(e.target.value)}
                      />
                    </div>
                    {editConfirmPw && editConfirmPw !== editPassword && (
                      <p className="mp-field-err">
                        비밀번호가 일치하지 않아요.
                      </p>
                    )}
                  </div>
                </div>
                <div className="mp-edit-btns">
                  <button type="submit" className="mp-btn-primary">
                    변경사항 저장
                  </button>
                  <button
                    type="button"
                    className="mp-btn-ghost"
                    onClick={() => {
                      setIsEditMode(false);
                      setMessage("");
                    }}
                  >
                    취소
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ──────────────────────────────────────────
            탭 B: 내 등록 상품
        ────────────────────────────────────────── */}
        {activeTab === "myItems" && (
          <div className="mp-pane">
            <div className="mp-pane-head">
              <h2>내 등록 상품</h2>
              <p>총 {myProducts?.length || 0}개의 상품을 등록했어요.</p>
            </div>
            {!myProducts || myProducts.length === 0 ? (
              <div className="mp-empty">
                <p className="mp-empty-ico">📦</p>
                <p className="mp-empty-ttl">아직 등록한 상품이 없어요</p>
                <p className="mp-empty-sub">
                  첫 상품을 등록하고 거래를 시작해보세요!
                </p>
                <button
                  className="mp-btn-primary"
                  onClick={() => navigate("/sell")}
                >
                  상품 등록하러 가기
                </button>
              </div>
            ) : (
              <div className="mp-product-grid">
                {myProducts.map((p) => (
                  <div
                    key={p.id}
                    className="mp-prod-card"
                    onClick={() => navigate(`/product/${p.id}`)}
                  >
                    <div className="mp-prod-img-wrap">
                      <img
                        src={p.image}
                        alt={p.title}
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200";
                        }}
                      />
                      <span className="mp-prod-status">판매중</span>
                    </div>
                    <div className="mp-prod-info">
                      <p className="mp-prod-cat">{p.category}</p>
                      <p className="mp-prod-title">{p.title}</p>
                      <p className="mp-prod-price">
                        {p.price?.toLocaleString()}원
                      </p>
                      <p className="mp-prod-loc">📍 {p.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ──────────────────────────────────────────
            탭 C: 찜 목록
        ────────────────────────────────────────── */}
        {activeTab === "likes" && (
          <div className="mp-pane">
            <div className="mp-pane-head">
              <h2>찜 목록</h2>
              <p>관심 상품 {likes.length}개</p>
            </div>
            {likes.length === 0 ? (
              <div className="mp-empty">
                <p className="mp-empty-ico">❤️</p>
                <p className="mp-empty-ttl">찜한 상품이 없어요</p>
                <p className="mp-empty-sub">
                  마음에 드는 상품에 하트를 눌러보세요!
                </p>
                <button
                  className="mp-btn-primary"
                  onClick={() => navigate("/")}
                >
                  쇼핑하러 가기
                </button>
              </div>
            ) : (
              <div className="mp-product-grid">
                {likes.map((p) => (
                  <div
                    key={p.id}
                    className="mp-prod-card"
                    onClick={() => navigate(`/product/${p.id}`)}
                  >
                    <div className="mp-prod-img-wrap">
                      <img
                        src={p.image}
                        alt={p.title}
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200";
                        }}
                      />
                      <span className="mp-prod-heart">❤️</span>
                    </div>
                    <div className="mp-prod-info">
                      <p className="mp-prod-cat">{p.category}</p>
                      <p className="mp-prod-title">{p.title}</p>
                      <p className="mp-prod-price">
                        {p.price?.toLocaleString()}원
                      </p>
                      <p className="mp-prod-loc">📍 {p.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ──────────────────────────────────────────
            탭 D: 교환 내역
        ────────────────────────────────────────── */}
        {activeTab === "barter" && (
          <div className="mp-pane">
            <div className="mp-pane-head">
              <h2>교환 내역</h2>
              <p>물물교환 요청 {requests.length}건</p>
            </div>
            {requests.length === 0 ? (
              <div className="mp-empty">
                <p className="mp-empty-ico">🔄</p>
                <p className="mp-empty-ttl">교환 내역이 없어요</p>
                <p className="mp-empty-sub">
                  상품 상세 페이지에서 교환을 제안해보세요!
                </p>
              </div>
            ) : (
              <div className="mp-barter-list">
                {[...requests].reverse().map((req) => {
                  const isMine =
                    req.senderId === currentUser?.id ||
                    req.sender === currentUser?.name;
                  const statusMap = {
                    완료: "#059669",
                    거절: "#dc2626",
                    대기중: "#f59e0b",
                  };
                  const sColor = statusMap[req.status] || "#64748b";
                  return (
                    <div
                      key={req.id}
                      className="mp-barter-card"
                      style={{
                        borderLeft: `4px solid ${isMine ? "#059669" : "#FF6F61"}`,
                      }}
                    >
                      <div className="mp-barter-top">
                        <div className="mp-barter-badges">
                          <span
                            className="mp-tag"
                            style={{
                              background: isMine ? "#e6f4ea" : "#fce8e6",
                              color: isMine ? "#137333" : "#c5221f",
                            }}
                          >
                            {isMine ? "📤 보낸 제안" : "📥 받은 제안"}
                          </span>
                          <span
                            className="mp-tag"
                            style={{ background: `${sColor}22`, color: sColor }}
                          >
                            {req.status}
                          </span>
                        </div>
                        <span className="mp-barter-date">
                          {req.createdAt || "방금 전"}
                        </span>
                      </div>
                      <p className="mp-barter-product">
                        🛍 상대 상품: <strong>{req.productTitle}</strong>
                      </p>
                      <p className="mp-barter-item">
                        🔄 제안 물건:{" "}
                        <strong
                          style={{ color: isMine ? "#059669" : "#1e293b" }}
                        >
                          {req.proposedItem}
                        </strong>
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ──────────────────────────────────────────
            탭 E: 거래 후기
        ────────────────────────────────────────── */}
        {activeTab === "review" && (
          <div className="mp-pane">
            <div className="mp-pane-head">
              <h2>거래 후기</h2>
              <p>다른 사용자가 남긴 후기예요.</p>
            </div>
            <div className="mp-review-summary">
              <div className="mp-review-left">
                <span className="mp-review-big">{avgRating.toFixed(1)}</span>
                <div className="mp-stars">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span
                      key={s}
                      style={{
                        color:
                          s <= Math.round(avgRating) ? "#FF6F61" : "#e2e8f0",
                        fontSize: 22,
                      }}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className="mp-review-cnt">후기 {DUMMY_REVIEWS.length}개</p>
              </div>
              <div className="mp-review-right">
                <span style={{ fontSize: 40 }}>{tempEmoji}</span>
                <span className="mp-temp-big" style={{ color: tempColor }}>
                  {tempDegree}°C
                </span>
                <p className="mp-temp-hint">거래 온도</p>
              </div>
            </div>
            <div className="mp-review-list">
              {DUMMY_REVIEWS.map((r) => (
                <div key={r.id} className="mp-review-card">
                  <div className="mp-review-top">
                    <div className="mp-reviewer-av">{r.from.charAt(0)}</div>
                    <div>
                      <p className="mp-reviewer-nm">{r.from}</p>
                      <div className="mp-stars sm">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <span
                            key={s}
                            style={{
                              color: s <= r.rating ? "#FF6F61" : "#e2e8f0",
                            }}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="mp-review-date">{r.date}</span>
                  </div>
                  <p className="mp-review-text">{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ──────────────────────────────────────────
            탭 F: 고객지원
        ────────────────────────────────────────── */}
        {activeTab === "support" && (
          <div className="mp-pane">
            <div className="mp-pane-head">
              <h2>고객지원</h2>
              <p>무엇이든 도와드릴게요.</p>
            </div>
            <div className="mp-support-row">
              {[
                {
                  icon: "📞",
                  title: "고객센터",
                  desc: "평일 09:00~18:00",
                  sub: "1588-0000",
                },
                {
                  icon: "📧",
                  title: "이메일 문의",
                  desc: "24시간 접수",
                  sub: "help@market.kr",
                },
                {
                  icon: "💬",
                  title: "카카오채널",
                  desc: "실시간 상담",
                  sub: "@secondhand",
                },
              ].map((c) => (
                <div key={c.title} className="mp-support-card">
                  <span className="mp-support-ico">{c.icon}</span>
                  <p className="mp-support-ttl">{c.title}</p>
                  <p className="mp-support-desc">{c.desc}</p>
                  <p className="mp-support-sub">{c.sub}</p>
                </div>
              ))}
            </div>

            <div className="mp-card" style={{ marginBottom: 20 }}>
              <h3 className="mp-card-title">자주 묻는 질문</h3>
              {FAQS.map((f, i) => (
                <div key={i} className="mp-faq">
                  <button
                    className={`mp-faq-q ${openFaq === i ? "open" : ""}`}
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span className="mp-faq-mark q">Q</span>
                    <span>{f.q}</span>
                    <span className={`mp-faq-arr ${openFaq === i ? "up" : ""}`}>
                      ▾
                    </span>
                  </button>
                  {openFaq === i && (
                    <div className="mp-faq-a">
                      <span className="mp-faq-mark a">A</span>
                      <p>{f.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mp-card">
              <h3 className="mp-card-title">1:1 문의</h3>
              {inquirySent ? (
                <div className="mp-inquiry-done">
                  <p style={{ fontSize: 36 }}>✅</p>
                  <p className="mp-inquiry-ttl">문의가 접수됐어요!</p>
                  <p className="mp-inquiry-sub">
                    영업일 기준 1~2일 내에 이메일로 답변 드릴게요.
                  </p>
                  <button
                    className="mp-btn-ghost"
                    onClick={() => setInquirySent(false)}
                  >
                    다시 문의하기
                  </button>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit}>
                  <div className="mp-field" style={{ marginBottom: 12 }}>
                    <label>문의 유형</label>
                    <div className="mp-type-chips">
                      {[
                        "거래 문제",
                        "계정/보안",
                        "사기 신고",
                        "앱 오류",
                        "기타",
                      ].map((t) => (
                        <button
                          key={t}
                          type="button"
                          className={`mp-type-chip ${inquiryType === t ? "active" : ""}`}
                          onClick={() => setInquiryType(t)}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mp-field">
                    <label>문의 내용</label>
                    <textarea
                      rows={5}
                      placeholder="문제 상황을 자세히 적어주세요."
                      value={inquiryText}
                      onChange={(e) => setInquiryText(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="mp-btn-primary">
                    문의 보내기
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ──────────────────────────────────────────
            탭 G: 계정 설정
        ────────────────────────────────────────── */}
        {activeTab === "settings" && (
          <div className="mp-pane">
            <div className="mp-pane-head">
              <h2>계정 설정</h2>
              <p>알림, 보안 등을 설정할 수 있어요.</p>
            </div>

            <div className="mp-card" style={{ marginBottom: 16 }}>
              <h3 className="mp-card-title">🔔 알림 설정</h3>
              {[
                {
                  l: "거래 알림",
                  s: "채팅, 입금, 배송 상태 변경",
                  v: notiTrade,
                  fn: setNotiTrade,
                },
                {
                  l: "채팅 알림",
                  s: "새 메시지 수신 시 알림",
                  v: notiChat,
                  fn: setNotiChat,
                },
                {
                  l: "이벤트/혜택 알림",
                  s: "할인, 쿠폰, 이벤트 소식",
                  v: notiEvent,
                  fn: setNotiEvent,
                },
              ].map((item) => (
                <div key={item.l} className="mp-setting-row">
                  <div>
                    <p className="mp-setting-lbl">{item.l}</p>
                    <p className="mp-setting-sub">{item.s}</p>
                  </div>
                  <button
                    className={`mp-toggle ${item.v ? "on" : ""}`}
                    onClick={() => item.fn((p) => !p)}
                  >
                    <span className="mp-toggle-knob" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mp-card" style={{ marginBottom: 16 }}>
              <h3 className="mp-card-title">🔐 보안</h3>
              {[
                {
                  ico: "🔑",
                  l: "비밀번호 변경",
                  d: "마지막 변경: 30일 전",
                  fn: () => setActiveTab("info"),
                },
                {
                  ico: "📱",
                  l: "2단계 인증",
                  d: "현재: 비활성화",
                  fn: () => alert("준비 중인 기능이에요."),
                },
                {
                  ico: "📋",
                  l: "로그인 기록 보기",
                  d: "최근: 방금 전",
                  fn: () => alert("준비 중인 기능이에요."),
                },
              ].map((item) => (
                <button key={item.l} className="mp-sec-row" onClick={item.fn}>
                  <span className="mp-sec-ico">{item.ico}</span>
                  <div className="mp-sec-info">
                    <p className="mp-sec-lbl">{item.l}</p>
                    <p className="mp-sec-sub">{item.d}</p>
                  </div>
                  <span className="mp-sec-arr">›</span>
                </button>
              ))}
            </div>

            <div className="mp-danger">
              <h3 className="mp-danger-ttl">⚠️ 위험 구역</h3>
              <p className="mp-danger-desc">
                계정을 삭제하면 모든 데이터가 영구 삭제돼요. 탈퇴 후 30일 내
                복구 가능해요.
              </p>
              <button
                className="mp-btn-danger"
                onClick={() => alert("탈퇴 기능은 준비 중이에요.")}
              >
                계정 탈퇴
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
