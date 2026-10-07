import React from 'react';
import UserStatusBadge from './UserStatusBadge';
import {
  User as UserIcon,
  Calendar,
  MapPin,
  ShoppingBag,
  CheckCircle,
  XCircle,
  IndianRupee,
  Activity as ActivityIcon
} from 'lucide-react';

const UserDetails = ({ user }) => {
  if (!user) return null;

  const {
    name,
    email,
    phone,
    role,
    status = 'active',
    createdAt,
    lastLogin,
    address = {},
    orderStats = {},
    activity = [],
  } = user;

  const {
    totalOrders = 0,
    completedOrders = 0,
    cancelledOrders = 0,
    totalSpent = 0,
  } = orderStats;

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'Never';
    try {
      const d = new Date(dateStr);
      return `${d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })} at ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return 'Never';
    }
  };

  return (
    <div className="user-details-wrapper">
      {/* Top 4 Order Analytics Summary Cards */}
      <div className="user-order-stats-grid">
        <div className="metric-card card">
          <div className="metric-icon-wrap bg-primary-soft">
            <ShoppingBag size={22} className="text-primary" />
          </div>
          <div className="metric-data">
            <span className="metric-label">Total Orders</span>
            <span className="metric-value">{totalOrders}</span>
            <small className="metric-extra">Lifetime orders placed</small>
          </div>
        </div>

        <div className="metric-card card">
          <div className="metric-icon-wrap bg-success-soft">
            <CheckCircle size={22} className="text-success" />
          </div>
          <div className="metric-data">
            <span className="metric-label">Completed</span>
            <span className="metric-value">{completedOrders}</span>
            <small className="metric-extra">Delivered successfully</small>
          </div>
        </div>

        <div className="metric-card card">
          <div className="metric-icon-wrap bg-danger-soft">
            <XCircle size={22} className="text-danger" />
          </div>
          <div className="metric-data">
            <span className="metric-label">Cancelled</span>
            <span className="metric-value">{cancelledOrders}</span>
            <small className="metric-extra">Cancelled orders</small>
          </div>
        </div>

        <div className="metric-card card">
          <div className="metric-icon-wrap bg-accent-soft">
            <IndianRupee size={22} className="text-accent" />
          </div>
          <div className="metric-data">
            <span className="metric-label">Total Spent</span>
            <span className="metric-value">₹{Number(totalSpent || 0).toLocaleString('en-IN')}</span>
            <small className="metric-extra">Net paid volume</small>
          </div>
        </div>
      </div>

      <div className="user-info-two-col">
        {/* Basic Information Card */}
        <div className="card user-info-card">
          <div className="section-card-header">
            <h3 className="section-card-title">
              <UserIcon size={18} className="text-primary" />
              <span>Basic Information</span>
            </h3>
            <UserStatusBadge status={status} />
          </div>

          <div className="user-info-fields-grid">
            <div className="info-field-item">
              <span className="info-field-label">Full Name</span>
              <strong className="info-field-val">{name}</strong>
            </div>

            <div className="info-field-item">
              <span className="info-field-label">Email Address</span>
              <span className="info-field-val">{email}</span>
            </div>

            <div className="info-field-item">
              <span className="info-field-label">Phone Number</span>
              <span className="info-field-val">{phone || 'Not provided'}</span>
            </div>

            <div className="info-field-item">
              <span className="info-field-label">Account Role</span>
              <span className={`badge ${role === 'admin' ? 'badge-primary' : 'badge-info'}`}>
                {role === 'admin' ? 'Administrator' : 'Customer'}
              </span>
            </div>

            <div className="info-field-item">
              <span className="info-field-label">Account Status</span>
              <span className="text-capitalize font-medium">{status}</span>
            </div>

            <div className="info-field-item">
              <span className="info-field-label">Registration Date</span>
              <span className="info-field-val">{formatDateTime(createdAt)}</span>
            </div>

            <div className="info-field-item info-field-wide">
              <span className="info-field-label">Last Login</span>
              <span className="info-field-val">{formatDateTime(lastLogin)}</span>
            </div>
          </div>
        </div>

        {/* Address Card */}
        <div className="card user-info-card">
          <div className="section-card-header">
            <h3 className="section-card-title">
              <MapPin size={18} className="text-primary" />
              <span>Primary Address</span>
            </h3>
          </div>

          <div className="user-info-fields-grid">
            <div className="info-field-item info-field-wide">
              <span className="info-field-label">Street</span>
              <span className="info-field-val">{address.street || 'Not provided'}</span>
            </div>

            <div className="info-field-item">
              <span className="info-field-label">City</span>
              <span className="info-field-val">{address.city || '—'}</span>
            </div>

            <div className="info-field-item">
              <span className="info-field-label">State / Province</span>
              <span className="info-field-val">{address.state || '—'}</span>
            </div>

            <div className="info-field-item">
              <span className="info-field-label">ZIP / Postal Code</span>
              <span className="info-field-val">{address.postalCode || '—'}</span>
            </div>

            <div className="info-field-item">
              <span className="info-field-label">Country</span>
              <span className="info-field-val">{address.country || 'India'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* User Activity Timeline (Requirement 11) */}
      {activity && activity.length > 0 && (
        <div className="card user-activity-card" style={{ marginTop: '24px' }}>
          <div className="section-card-header">
            <h3 className="section-card-title">
              <ActivityIcon size={18} className="text-primary" />
              <span>User Activity History</span>
            </h3>
            <span className="text-muted text-sm">Chronological events from database</span>
          </div>

          <div className="activity-timeline-list">
            {activity.map((act, index) => {
              const dateObj = new Date(act.timestamp);
              const dateStr = dateObj.toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });
              const timeStr = dateObj.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div key={index} className="activity-timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-content">
                    <div className="timeline-header-row">
                      <strong className="timeline-action-title">{act.action}</strong>
                      <span className="timeline-datetime">
                        <Calendar size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                        {dateStr} at {timeStr}
                      </span>
                    </div>
                    {act.description && (
                      <p className="timeline-desc text-muted">{act.description}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetails;
