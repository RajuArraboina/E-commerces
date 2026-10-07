import React, { useState, useEffect, useCallback } from 'react';
import adminService from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import Pagination from '../../components/Pagination';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import { Search, Mail, Phone, Shield, Trash2, UserCheck } from 'lucide-react';

const AdminCustomers = () => {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      // Dynamic customer information from MongoDB: GET /api/admin/users
      const res = await adminService.getUsers({
        search,
        role: roleFilter,
        page,
        limit: 10,
      });

      if (res.success && Array.isArray(res.data)) {
        setUsers(res.data);
        setTotal(res.total || res.data.length);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve registered customers');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Customer Management Action: Delete User using existing DELETE /api/users/:id API
  const handleDeleteUser = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete customer account "${name}"?`)) {
      try {
        const res = await adminService.deleteUser(id);
        if (res.success) {
          fetchUsers();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete customer account');
      }
    }
  };

  // Customer Management Action: Toggle Role using existing PUT /api/users/:id API
  const handleToggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'customer' : 'admin';
    if (
      window.confirm(
        `Change role of "${user.name}" from ${user.role} to ${newRole}?`
      )
    ) {
      try {
        const res = await adminService.updateUser(user._id, { role: newRole });
        if (res.success) {
          fetchUsers();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to update user role');
      }
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return 'Not specified';
    const parts = [addr.street, addr.city, addr.state, addr.postalCode].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Not specified';
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-title">Customer Management</h1>
          <p className="admin-subtitle">
            Dynamic customer information ({total} registered accounts) loaded from MongoDB
          </p>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchUsers} />}

      {/* Filter and Search Bar */}
      <div className="admin-filter-bar card">
        <div className="admin-search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search customers by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="form-control"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="form-control category-select"
        >
          <option value="">All Roles</option>
          <option value="customer">Customers</option>
          <option value="admin">Administrators</option>
        </select>
      </div>

      <div className="card">
        {loading ? (
          <Loading message="Fetching customer accounts from MongoDB..." />
        ) : (
          <>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Address</th>
                    <th>Created Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center" style={{ padding: '30px' }}>
                        No customer accounts found matching your search.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u._id}>
                        {/* Name */}
                        <td>
                          <div className="customer-avatar-cell">
                            <div className="avatar-mini">
                              {u.name ? u.name[0].toUpperCase() : 'U'}
                            </div>
                            <strong>{u.name}</strong>
                          </div>
                        </td>

                        {/* Email */}
                        <td>
                          <div className="meta-icon-row">
                            <Mail size={14} className="text-muted" />
                            <span>{u.email}</span>
                          </div>
                        </td>

                        {/* Phone */}
                        <td>
                          {u.phone ? (
                            <div className="meta-icon-row">
                              <Phone size={14} className="text-muted" />
                              <span>{u.phone}</span>
                            </div>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>

                        {/* Role */}
                        <td>
                          <span className={`badge ${u.role === 'admin' ? 'badge-primary' : 'badge-info'}`}>
                            {u.role === 'admin' && <Shield size={12} style={{ marginRight: '4px' }} />}
                            {u.role}
                          </span>
                        </td>

                        {/* Address */}
                        <td>
                          <span style={{ fontSize: '0.85rem' }}>{formatAddress(u.address)}</span>
                        </td>

                        {/* Created Date */}
                        <td>
                          {u.createdAt ? (
                            new Date(u.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          ) : (
                            '—'
                          )}
                        </td>

                        {/* Actions */}
                        <td>
                          <div className="table-action-btns">
                            <button
                              onClick={() => handleToggleRole(u)}
                              className="btn btn-outline btn-xs"
                              title={`Switch to ${u.role === 'admin' ? 'customer' : 'admin'}`}
                            >
                              <UserCheck size={14} />
                              <span>Role</span>
                            </button>
                            {u._id !== currentAdmin?._id && (
                              <button
                                onClick={() => handleDeleteUser(u._id, u.name)}
                                className="btn btn-outline-danger btn-xs"
                                title="Delete user account"
                              >
                                <Trash2 size={14} />
                                <span>Delete</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default AdminCustomers;
