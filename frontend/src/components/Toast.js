import React from 'react';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Toast() {
  const { toasts } = useApp();
  if (toasts.length === 0) return null;

  const icons = {
    success: <CheckCircle size={16} color="#2DBD87" />,
    error:   <AlertCircle size={16} color="#FF4757" />,
    info:    <Info size={16} color="#FF6B35" />,
  };

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {icons[t.type]}
          {t.message}
        </div>
      ))}
    </div>
  );
}
