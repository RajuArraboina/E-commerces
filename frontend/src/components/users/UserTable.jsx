import React from 'react';
import { Link } from 'react-router-dom';
import UserStatusBadge from './UserStatusBadge';
import { Eye, Edit2, Ban, CheckCircle2, Trash2, Shield } from 'lucide-react';

const UserTable = ({
  users = [],
  currentAdminId,
  onBlockToggle,
  onDeleteClick,
}) => {
  if (!users || users.length === 0) {
    return (
      <div className="table-empty-box">
        <p>No user accounts matched the search or filter criteria.</p>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'Never';
    try {
      const d = new Date(dateStr);
      return `${d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })} ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return 'Never';
    }
  };

  return (
    <div className="table-responsive user-table-responsive">
      <table className="admin-table user-management-table">
        <thead>
          <tr>
            <th>User ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Account Status</th>
            <th>Total Orders</th>
            <th>Total Spent</th>
            <th>Registration Date</th>
            <th>Last Login</th>
            <th className="text-right actions-col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isSelf = currentAdminId && user._id === currentAdminId;
            const isBlocked = (user.status || 'active').toLowerCase() === 'blocked';

            return (
              <tr key={user._id} className={isBlocked ? 'row-blocked' : ''}>
                {/* 1. User ID */}
                <td className="user-id-col">
                  <code title={`Full ID: ${user._id}`}>
                    #{user._id.slice(-6).toUpperCase()}
                  </code>
                </td>

                {/* 2. Name */}
                <td className="user-name-col">
                  <div className="user-name-cell">
                    <div className="user-avatar-circle">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <strong className="user-table-name">{user.name}</strong>
                      {isSelf && <span className="current-user-tag">(You)</span>}
                    </div>
                  </div>
                </td>

                {/* 3. Email */}
                <td>
                  <span className="user-email-text" title={user.email}>{user.email}</span>
                </td>

                {/* 4. Phone */}
                <td>
                  <span className="user-phone-text">{user.phone || '—'}</span>
                </td>

                {/* 5. Role */}
                <td>
                  <span className={`badge ${user.role === 'admin' ? 'badge-primary' : 'badge-info'}`}>
                    {user.role === 'admin' ? (
                      <>
                        <Shield size={11} style={{ marginRight: '4px' }} />
                        <span>Admin</span>
                      </>
                    ) : (
                      'Customer'
                    )}
                  </span>
                </td>

                {/* 6. Account Status */}
                <td>
                  <UserStatusBadge status={user.status} />
                </td>

                {/* 7. Total Orders */}
                <td className="text-center font-medium">
                  {user.totalOrders !== undefined ? (
                    <span className="orders-count-pill">{user.totalOrders}</span>
                  ) : (
                    '—'
                  )}
                </td>

                {/* 8. Total Spent */}
                <td className="font-semibold user-spent-col">
                  ₹{(user.totalSpent || 0).toLocaleString('en-IN')}
                </td>

                {/* 9. Registration Date */}
                <td className="text-muted text-nowrap">
                  {formatDate(user.createdAt)}
                </td>

                {/* 10. Last Login */}
                <td className="text-muted text-nowrap text-sm">
                  {formatDateTime(user.lastLogin)}
                </td>

                {/* 11. Actions */}
                <td className="text-right actions-col">
                  <div className="table-action-btns justify-end">
                    {/* View */}
                    <Link
                      to={`/admin/users/${user._id}`}
                      className="btn-icon-action btn-view"
                      title="View complete user profile & order history"
                    >
                      <Eye size={16} />
                    </Link>

                    {/* Edit */}
                    <Link
                      to={`/admin/users/edit/${user._id}`}
                      className="btn-icon-action btn-edit"
                      title="Edit user details"
                    >
                      <Edit2 size={16} />
                    </Link>

                    {/* Block / Activate */}
                    <button
                      type="button"
                      onClick={() => onBlockToggle(user, isBlocked ? 'activate' : 'block')}
                      disabled={isSelf}
                      className={`btn-icon-action ${isBlocked ? 'btn-activate' : 'btn-block-action'}`}
                      title={
                        isSelf
                          ? 'Cannot block your own account'
                          : isBlocked
                          ? 'Activate this user'
                          : 'Block this user'
                      }
                    >
                      {isBlocked ? <CheckCircle2 size={16} /> : <Ban size={16} />}
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => onDeleteClick(user)}
                      disabled={isSelf}
                      className="btn-icon-action btn-delete"
                      title={isSelf ? 'Cannot delete your own account' : 'Delete user permanently'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
