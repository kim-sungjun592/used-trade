import React, { useState } from 'react';
import { RefreshCw, Coins, ArrowLeftRight, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './BarterModal.css';

export default function BarterModal({ targetProduct, onClose }) {
  const { products, sendBarterRequest, currentUser, myPoints, showToast } = useApp();
  const [selectedMyItem, setSelectedMyItem] = useState(null);
  const [message, setMessage] = useState('');
  const [step, setStep] = useState('select'); // select | confirm | done

  // 내 물건 (샘플로 교환 가능한 물건 아무거나 선택)
  const myItems = products.filter(p => p.sellerId !== targetProduct.sellerId).slice(0, 4);

  const pointDiff = selectedMyItem
    ? targetProduct.points - (selectedMyItem.points || 0)
    : 0;

  const handleSend = () => {
    if (!selectedMyItem) { showToast('교환할 내 물건을 선택해주세요.', 'error'); return; }
    sendBarterRequest({
      fromItem: {
        title: selectedMyItem.title,
        points: selectedMyItem.points,
        image: selectedMyItem.image,
      },
      toUser: targetProduct.seller,
      toUserId: targetProduct.sellerId,
      toItem: {
        title: targetProduct.title,
        points: targetProduct.points,
        image: targetProduct.image,
      },
      pointAdjustment: pointDiff > 0 ? pointDiff : 0,
      message,
    });
    setStep('done');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box barter-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="barter-modal-title">
            <RefreshCw size={18} color="var(--coral)" />
            <h2>물물교환 제안</h2>
          </div>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: '6px 10px' }}>✕</button>
        </div>

        <div className="modal-body">
          {step === 'done' ? (
            <div className="barter-done">
              <CheckCircle size={52} color="var(--green)" />
              <h3>교환 요청 완료!</h3>
              <p><strong>{targetProduct.seller}</strong>님에게 교환 요청을 보냈습니다.</p>
              <p>상대방이 수락하면 교환이 성사됩니다.</p>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={onClose}>확인</button>
            </div>
          ) : (
            <>
              {/* Target item */}
              <div className="barter-section">
                <div className="barter-label">상대방 물건</div>
                <div className="barter-item-card target">
                  <img src={targetProduct.image} alt={targetProduct.title}
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&h=80&fit=crop'; }} />
                  <div className="barter-item-info">
                    <div className="barter-item-name">{targetProduct.title}</div>
                    <div className="barter-item-seller">판매자: {targetProduct.seller}</div>
                    <div className="barter-item-points"><Coins size={12} />{targetProduct.points?.toLocaleString()}P</div>
                  </div>
                </div>
              </div>

              <div className="barter-arrow"><ArrowLeftRight size={22} color="var(--coral)" /></div>

              {/* My items */}
              <div className="barter-section">
                <div className="barter-label">내 물건 선택</div>
                <div className="my-items-grid">
                  {myItems.length === 0 ? (
                    <div style={{ color: 'var(--text-3)', fontSize: 13 }}>등록된 상품이 없습니다.</div>
                  ) : myItems.map(item => (
                    <div
                      key={item.id}
                      className={`my-item-card ${selectedMyItem?.id === item.id ? 'selected' : ''}`}
                      onClick={() => setSelectedMyItem(item)}
                    >
                      <img src={item.image} alt={item.title}
                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&h=80&fit=crop'; }} />
                      <div className="my-item-name">{item.title}</div>
                      <div className="my-item-points"><Coins size={10} />{item.points?.toLocaleString()}P</div>
                      {selectedMyItem?.id === item.id && <div className="selected-check">✓</div>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Point Adjustment */}
              {selectedMyItem && (
                <div className={`point-adjust-box ${pointDiff > 0 ? 'need-pay' : pointDiff < 0 ? 'get-back' : 'even'}`}>
                  <div className="point-adjust-row">
                    <span>상대 물건 포인트</span>
                    <strong>{targetProduct.points?.toLocaleString()}P</strong>
                  </div>
                  <div className="point-adjust-row">
                    <span>내 물건 포인트</span>
                    <strong>{selectedMyItem.points?.toLocaleString()}P</strong>
                  </div>
                  <div className="point-adjust-divider" />
                  <div className="point-adjust-row result">
                    <span>{pointDiff > 0 ? '내가 추가 지급할 포인트' : pointDiff < 0 ? '내가 받을 포인트' : '포인트 동일 (공정 교환!)'}</span>
                    <strong className="point-diff">
                      {pointDiff !== 0 && (pointDiff > 0 ? '-' : '+')}
                      {Math.abs(pointDiff).toLocaleString()}P
                    </strong>
                  </div>
                  {pointDiff > 0 && (
                    <div className="my-points-info">
                      <Coins size={12} /> 내 포인트: {myPoints.toLocaleString()}P
                      {myPoints < pointDiff && <span className="warn-text"> ⚠ 포인트 부족</span>}
                    </div>
                  )}
                </div>
              )}

              {/* Message */}
              <div className="form-group">
                <label className="form-label">메시지 (선택)</label>
                <textarea
                  className="form-input"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={2}
                  placeholder="교환 제안 메시지를 남겨보세요"
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>취소</button>
                <button
                  className="btn btn-primary"
                  style={{ flex: 2 }}
                  onClick={handleSend}
                  disabled={!selectedMyItem}
                >
                  <RefreshCw size={15} /> 교환 제안 보내기
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
