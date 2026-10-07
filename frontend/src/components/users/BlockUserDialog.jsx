import React from 'react';
import { Ban, CheckCircle2, X } from 'lucide-react';

const BlockUserDialog = ({
  isOpen,
  user,
  actionType = 'block', // 'block' or 'activate'
  loading = false,
  onConfirm,
  onClose,
}) => {
  if (!isOpen || !user) return null;

  const isBlockAction = actionType === 'block';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content card user-dialog-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="block-dialog-title"
      >
        <button
          className="modal-close-btn"
          onClick={onClose}
          disabled={loading}
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        <div className="dialog-header">
          <div className={`dialog-icon-wrap ${isBlockAction ? 'dialog-icon-danger' : 'dialog-icon-success'}`}>
            {isBlockAction ? <Ban size={28} /> : <CheckCircle2 size={28} />}
          </div>
          <h3 id="block-dialog-title" className="dialog-title">
            {isBlockAction ? 'Block User Account?' : 'Activate User Account?'}
          </h3>
          <p className="dialog-desc">
            {isBlockAction
              ? `Are you sure you want to block this user? ${user.name} (${user.email}) will immediately be prevented from logging in and placing new orders.`
              : `Are you sure you want to activate this user? ${user.name} (${user.email}) will regain full access to their account and store services.`}
          </p>
        </div>

        <div className="dialog-user-summary">
          <div className="summary-row-item">
            <span className="summary-key">User Name:</span>
            <strong className="summary-val">{user.name}</strong>
          </div>
          <div className="summary-row-item">
            <span className="summary-key">Email:</span>
            <span className="summary-val">{user.email}</span>
          </div>
          <div className="summary-row-item">
            <span className="summary-key">Current Role:</span>
            <span className="badge badge-primary">{user.role}</span>
          </div>
        </div>

        <div className="dialog-actions-row">
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`btn ${isBlockAction ? 'btn-danger' : 'btn-success'}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading
              ? isBlockAction ? 'Blocking...' : 'Activating...'
              : isBlockAction ? 'Yes, Block User' : 'Yes, Activate User'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlockUserDialog;
