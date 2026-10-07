import React from 'react';
import { CheckCircle2, Ban, Clock } from 'lucide-react';

const UserStatusBadge = ({ status = 'active' }) => {
  const normStatus = (status || 'active').toLowerCase();

  switch (normStatus) {
    case 'blocked':
      return (
        <span className="user-status-pill status-blocked">
          <Ban size={13} className="status-icon" />
          <span>Blocked</span>
        </span>
      );
    case 'inactive':
      return (
        <span className="user-status-pill status-inactive">
          <Clock size={13} className="status-icon" />
          <span>Inactive</span>
        </span>
      );
    case 'active':
    default:
      return (
        <span className="user-status-pill status-active">
          <CheckCircle2 size={13} className="status-icon" />
          <span>Active</span>
        </span>
      );
  }
};

export default UserStatusBadge;
