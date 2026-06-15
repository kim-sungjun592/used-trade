import React, { useState } from 'react';
import { Send, MessageSquare, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './ChatPage.css';

export default function ChatPage() {
  const { chatRooms } = useApp();
  const [activeChatId, setActiveChatId] = useState(chatRooms[0]?.id || null);
  const [typedMessage, setTypedMessage] = useState('');
  
  const activeChat = chatRooms.find(room => room.id === activeChatId);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!typedMessage.trim() || !activeChat) return;

    activeChat.messages.push({
      sender: 'me',
      text: typedMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    setTypedMessage('');
  };

  return (
    <div className="chat-page container">
      <div className="chat-layout">
        <div className="chat-sidebar">
          <h3>채팅 목록</h3>
          <div className="chat-rooms-list">
            {chatRooms.length > 0 ? (
              chatRooms.map(room => (
                <div 
                  key={room.id} 
                  className={`chat-room-item ${activeChatId === room.id ? 'active' : ''}`}
                  onClick={() => setActiveChatId(room.id)}
                >
                  <div className="room-avatar"><User size={16} /></div>
                  <div className="room-details">
                    <span className="room-user">{room.sellerName}</span>
                    <span className="room-prod-title">{room.productTitle}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-chats"><MessageSquare size={32} /><p>진행 중인 대화가 없습니다.</p></div>
            )}
          </div>
        </div>

        <div className="chat-main-window">
          {activeChat ? (
            <>
              <div className="chat-window-header">
                <h4>{activeChat.sellerName}님과의 대화</h4>
                <p className="sub-tag">{activeChat.productTitle}</p>
              </div>

              <div className="chat-messages-body">
                {activeChat.messages.map((msg, index) => (
                  <div key={index} className={`msg-row ${msg.sender === 'me' ? 'msg-right' : msg.sender === 'system' ? 'msg-system' : 'msg-left'}`}>
                    {msg.sender !== 'system' && msg.sender !== 'me' && <div className="msg-avatar"><User size={12} /></div>}
                    <div className="msg-bubble-wrap">
                      <div className="msg-bubble">{msg.text}</div>
                      {msg.time && <span className="msg-time">{msg.time}</span>}
                    </div>
                  </div>
                ))}
              </div>

              <form className="chat-input-footer" onSubmit={handleSendMessage}>
                <input 
                  type="text" 
                  placeholder="메시지를 입력하세요..." 
                  value={typedMessage}
                  onChange={(e) => setTypedMessage(e.target.value)}
                />
                <button type="submit" className="send-btn"><Send size={18} /></button>
              </form>
            </>
          ) : (
            <div className="chat-window-empty">
              <p>대화방을 선택하시면 실시간 채팅이 가능합니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}