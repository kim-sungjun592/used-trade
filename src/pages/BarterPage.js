import React, { useState } from 'react';
import { RefreshCw, Coins, Clock, CheckCircle, XCircle, ArrowLeftRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './BarterPage.css';

const STATUS_CONFIG = {
  pending:  { label: '대기 중',  color: 'yellow', icon: <Clock size={13} /> },
  accepted: { label: '교환 완료', color: 'green',  icon: <CheckCircle size={13} /> },
  rejected: { label: '거절됨',   color: 'navy',   icon: <XCircle size={13} /> },
};

export default function BarterPage() {
  const { barterRequests, updateBarterStatus } = useApp();
  const [tab, setTab] = useState('received'); 

  // 기존 유저 구별 없이 전체 보낸/받은 목록을 온전히 필터링
  const received = barterRequests.filter(r => r.toUser === '박민준');
  const sent     = barterRequests.filter(r => r.fromUser !== '박민준');

  const displayed = tab === 'received' ? received : sent;

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
              <div>
                <strong>{s.title}</strong>
                <p>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="barter-tabs">
          <button className={`tab-btn ${tab === 'received' ? 'active' : ''}`} onClick={() => setTab('received')}>
            받은 요청 {received.filter(r => r.status === 'pending').length > 0 && (
              <span className="nav-badge">{received.filter(r => r.status === 'pending').length}</span>
            )}
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
            {displayed.map(req => (
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
  const st = STATUS_CONFIG[request.status];
  const pointDiff = request.toItem.points - request.fromItem.points;

  return (
    <div className="barter-card card">
      <div className="barter-card-header">
        <div className="barter-card-user">
          <div className="mini-avatar">{request.fromUser?.charAt(0)}</div>
          <span><strong>{request.fromUser}</strong> → <strong>{request.toUser}</strong></span>
        </div>
        <div className="barter-status">
          <span className={`badge badge-${st.color}`}>{st.icon}{st.label}</span>
          <span className="barter-date">{request.createdAt}</span>
        </div>
      </div>

      <div className="barter-items">
        <div className="barter-item-mini">
          <img src={request.fromItem.image} alt={request.fromItem.title}
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&h=80&fit=crop'; }} />
          <div>
            <div className="mini-item-name">{request.fromItem.title}</div>
            <div className="mini-item-points"><Coins size={10} />{request.fromItem.points?.toLocaleString()}P</div>
          </div>
        </div>

        <div className="barter-exchange-icon">
          <ArrowLeftRight size={18} color="var(--coral)" />
          {pointDiff !== 0 && (
            <div className={`point-gap ${pointDiff > 0 ? 'positive' : 'negative'}`}>
              {pointDiff > 0 ? `+${pointDiff.toLocaleString()}P 보정` : `${pointDiff.toLocaleString()}P 차이`}
            </div>
          )}
        </div>

        <div className="barter-item-mini">
          <img src={request.toItem.image} alt={request.toItem.title}
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&h=80&fit=crop'; }} />
          <div>
            <div className="mini-item-name">{request.toItem.title}</div>
            <div className="mini-item-points"><Coins size={10} />{request.toItem.points?.toLocaleString()}P</div>
          </div>
        </div>
      </div>

      {request.message && (
        <div className="barter-message">
          💬 "{request.message}"
        </div>
      )}

      {isReceived && request.status === 'pending' && (
        <div className="barter-card-actions">
          <button className="btn btn-ghost" onClick={onReject}><XCircle size={14} /> 거절</button>
          <button className="btn btn-primary" onClick={onAccept}><CheckCircle size={14} /> 수락</button>
        </div>
      )}
    </div>
  );
}