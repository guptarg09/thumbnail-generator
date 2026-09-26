import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration || 4500);

    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="toast-icon toast-icon--success" size={18} />;
      case 'warning':
        return <AlertTriangle className="toast-icon toast-icon--warning" size={18} />;
      case 'error':
        return <AlertCircle className="toast-icon toast-icon--error" size={18} />;
      default:
        return <Info className="toast-icon toast-icon--info" size={18} />;
    }
  };

  return (
    <div className={`toast toast--${toast.type || 'info'}`} role="alert" aria-live="assertive">
      <div className="toast-content">
        {getIcon()}
        <span className="toast-message">{toast.message}</span>
      </div>
      <button 
        type="button" 
        onClick={() => onDismiss(toast.id)} 
        className="toast-close-btn"
        aria-label="Dismiss notification"
      >
        <X size={15} />
      </button>
    </div>
  );
}
