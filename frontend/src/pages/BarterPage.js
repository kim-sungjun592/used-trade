import React, { useState } from 'react';
import { RefreshCw, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './BarterPage.css';

const STATUS_CONFIG = {
  '대기중': { label: '대기 중',   color: 'yellow', icon: <Clock size={13} /> },
  pending:  { label: '대기 중',   color: 'yellow', icon: <Clock size={13} /> },
  accepted: { label: '교환 완료', color: 'green',  icon: <CheckCircle size={13} /> },
  rejected: { label: '거절됨',    color: 'navy',   icon: <XCircle size={13} /> },
};

export default function BarterPage() {
  const { barterRequests, updateBarterStatus, currentUser } = useApp();
  const [tab, setTab] = useState('received');

  // 💡 [핵심 교정] 로그인하지 않은 가상 게스트 상태('user_guest', '홍길동')에도 대응하도록 기본값 수정
  const myId   = currentUser?.id   || 'user_guest';
  const myName = currentUser?.name || '홍길동';

  // 💡 필터링 조건에 r.sender 조건도 안전하게 추가
  const received = barterRequests.filter(r => 
    (r.receiverId === myId || r.toUser === myName) && 
    r.senderId !== myId && r.sender !== myName
  );
  
  const sent = barterRequests.filter(r => 
    r.senderId === myId || r.fromUser === myName || r.sender === myName
  );

  // 💡 보낸 요청 탭일 때, 방금 보낸 요청 데이터를 유실하던 버그 원천 차단
  const displayed = tab === 'received'
    ? received
    : sent;

  const pendingCount = received.filter(r => r.status === 'pending' || r.status === '대기중').length;

  return (
    <div className="barter-page">
      <div className="container">
        <div className="barter-hero">
          <div className="barter-hero-icon"><RefreshCw size={28} /></div>
          <div>
            <h1>물물교환 센터</h1>
            <p>현금 없이 물건끼리 교환하세요. 포인트로 가치를 조율합니다.</p>
          </div>
        </div>

        <div className="how-it-works">
          {[
            { n: '1', title: '교환 제안', desc: '원하는 물건에 내 물건으로 교환 제안을 보냅니다' },
            { n: '2', title: '포인트 조율', desc: '가격 차이는 자체 포인트로 자동 계산됩니다' },
            { n: '3', title: '교환 성사', desc: '상대방이 수락하면 직거래로 교환합니다' },
          ].map(s => (
            <div key={s.n} className="how-step">
              <div className="how-num">{s.n}</div>
              <div><strong>{s.title}</strong><p>{s.desc}</p></div>
            </div>
          ))}
        </div>

        <div className="barter-tabs">
          <button className={`tab-btn ${tab === 'received' ? 'active' : ''}`} onClick={() => setTab('received')}>
            받은 요청 {pendingCount > 0 && <span className="nav-badge">{pendingCount}</span>}
          </button>
          <button className={`tab-btn ${tab === 'sent' ? 'active' : ''}`} onClick={() => setTab('sent')}>
            보낸 요청
          </button>
        </div>

        {displayed.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🔄</div>
            <p>{tab === 'received' ? '받은 교환 요청이 없습니다' : '보낸 교환 요청이 없습니다'}</p>
            <small>상품 상세 페이지에서 "교환 제안" 버튼을 눌러보세요</small>
          </div>
        ) : (
          <div className="barter-list">
            {/* 최신순으로 정렬하여 보여주기 위해 정렬 로직 적용 */}
            {[...displayed].reverse().map(req => (
              <BarterCard
                key={req.id}
                request={req}
                isReceived={tab === 'received'}
                onAccept={() => updateBarterStatus(req.id, 'accepted')}
                onReject={() => updateBarterStatus(req.id, 'rejected')}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BarterCard({ request, isReceived, onAccept, onReject }) {
  const st = STATUS_CONFIG[request.status] || STATUS_CONFIG['대기중'];
  const isPending = request.status === 'pending' || request.status === '대기중';
  const fromName = request.fromUser || request.sender || '알 수 없음';
  const toName   = request.toUser   || request.receiverId || '나';

  const hasItemObj = request.fromItem && request.toItem;
  const fallbackImg = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&h=80&fit=crop';

  return (
    <div className="barter-card card">
      <div className="barter-card-header">
        <div className="barter-card-user">
          <div className="mini-avatar">{fromName.charAt(0)}</div>
          <span><strong>{fromName}</strong> → <strong>{toName}</strong></span>
        </div>
        <div className="barter-status">
          <span className={`badge badge-${st.color}`}>{st.icon}{st.label}</span>
          {request.createdAt && <span className="barter-date">{request.createdAt}</span>}
        </div>
      </div>

      {hasItemObj ? (
        <div className="barter-items">
          <div className="barter-item-mini">
            <img src={request.fromItem.image || fallbackImg} alt={request.fromItem.title}
              onError={e => { e.target.src = fallbackImg; }} />
            <div>
              <div className="mini-item-name">{request.fromItem.title}</div>
              <div className="mini-item-points">{(request.fromItem.points ?? 0).toLocaleString()}P</div>
            </div>
          </div>
          <div className="barter-exchange-icon">
            <span style={{ fontSize: 20, color: 'var(--coral)' }}>⇄</span>
          </div>
          <div className="barter-item-mini">
            <img src={request.toItem.image || fallbackImg} alt={request.toItem.title}
              onError={e => { e.target.src = fallbackImg; }} />
            <div>
              <div className="mini-item-name">{request.toItem.title}</div>
              <div className="mini-item-points">{(request.toItem.points ?? 0).toLocaleString()}P</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="barter-items" style={{ flexDirection: 'column', gap: 8, padding: '10px 0' }}>
          {request.productTitle && (
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
              📦 요청 상품: {request.productTitle}
            </div>
          )}
          {request.proposedItem && (
            <div style={{ fontSize: 13, color: '#475569', background: '#f1f5f9', padding: '8px 12px', borderRadius: '8px', marginTop: '4px' }}>
              🔄 제안 물품: <b>{request.proposedItem}</b>
            </div>
          )}
        </div>
      )}

      {request.message && <div className="barter-message">💬 "{request.message}"</div>}

      {isReceived && isPending && (
        <div className="barter-card-actions">
          <button className="btn btn-ghost" onClick={onReject}><XCircle size={14} /> 거절</button>
          <button className="btn btn-primary" onClick={onAccept}><CheckCircle size={14} /> 수락</button>
        </div>
      )}
    </div>
  );
}