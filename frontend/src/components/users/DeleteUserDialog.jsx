import React from 'react';
import { Trash2, X } from 'lucide-react';

const DeleteUserDialog = ({
  isOpen,
  user,
  loading = false,
  onConfirm,
  onClose,
}) => {
  if (!isOpen || !user) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content card user-dialog-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
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
          <div className="dialog-icon-wrap dialog-icon-danger">
            <Trash2 size={28} />
          </div>
          <h3 id="delete-dialog-title" className="dialog-title">
            Delete User?
          </h3>
          <p className="dialog-desc danger-alert-text">
            This action cannot be undone.
          </p>
          <p className="dialog-desc">
            Are you sure you want to permanently delete user account <strong>{user.name}</strong> (<code>{user.email}</code>)? The account will be removed from MongoDB.
          </p>
        </div>

        <div className="dialog-user-summary">
          <div className="summary-row-item">
            <span className="summary-key">User ID:</span>
            <code>{user._id}</code>
          </div>
          <div className="summary-row-item">
            <span className="summary-key">User Name:</span>
            <strong>{user.name}</strong>
          </div>
          <div className="summary-row-item">
            <span className="summary-key">Email:</span>
            <span>{user.email}</span>
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
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserDialog;
