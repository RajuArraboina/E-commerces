import React from 'react';
import { Check, Info, AlertCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
  if (!message) return null;

  const Icon = type === 'success' ? Check : type === 'error' ? AlertCircle : Info;

  return (
    <div className={`shop-toast-notification toast-${type}`} role="status">
      <div className="toast-icon">
        <Icon size={16} />
      </div>
      <span className="toast-message">{message}</span>
      {onClose && (
        <button
          type="button"
          className="toast-close-btn"
          onClick={onClose}
          aria-label="Close notification"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default Toast;
