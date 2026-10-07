import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import userService from '../../api/userService';
import { useAuth } from '../../context/AuthContext';
import UserStats from '../../components/users/UserStats';
import UserSearch from '../../components/users/UserSearch';
import UserFilters from '../../components/users/UserFilters';
import UserTable from '../../components/users/UserTable';
import Pagination from '../../components/users/Pagination';
import BlockUserDialog from '../../components/users/BlockUserDialog';
import DeleteUserDialog from '../../components/users/DeleteUserDialog';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import { UserPlus, CheckCircle, RefreshCw } from 'lucide-react';

const AdminUsers = () => {
  const { user: currentAdmin } = useAuth();

  // State management
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    period: '',
    startDate: '',
    endDate: '',
  });

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Dialog state
  const [blockDialogState, setBlockDialogState] = useState({
    isOpen: false,
    user: null,
    actionType: 'block', // 'block' or 'activate'
    loading: false,
  });

  const [deleteDialogState, setDeleteDialogState] = useState({
    isOpen: false,
    user: null,
    loading: false,
  });

  // Fetch Stats from backend API: GET /api/users/stats
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const res = await userService.getUserStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load user stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch Users with Search, Filters, and Server-Side Pagination
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const params = {
        page,
        limit: 10,
      };

      if (search.trim()) params.search = search.trim();
      if (filters.role) params.role = filters.role;
      if (filters.status) params.status = filters.status;
      if (filters.period && filters.period !== 'custom') {
        params.period = filters.period;
      }
      if (filters.period === 'custom') {
        if (filters.startDate) params.startDate = filters.startDate;
        if (filters.endDate) params.endDate = filters.endDate;
      }

      const res = await userService.getUsers(params);

      if (res.success && Array.isArray(res.data)) {
        setUsers(res.data);
        setTotalUsers(res.total || 0);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve users from MongoDB');
    } finally {
      setLoading(false);
    }
  }, [page, search, filters]);

  // Initial load
  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Search handler (resets to page 1)
  const handleSearch = (term) => {
    setSearch(term);
    setPage(1);
  };

  // Filters handler (resets to page 1)
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      role: '',
      status: '',
      period: '',
      startDate: '',
      endDate: '',
    });
    setSearch('');
    setPage(1);
  };

  // Open Block / Activate Dialog
  const handleBlockToggleClick = (targetUser, actionType) => {
    setBlockDialogState({
      isOpen: true,
      user: targetUser,
      actionType,
      loading: false,
    });
  };

  // Execute Block / Activate via backend API: PUT /api/users/:id/status
  const handleConfirmBlockAction = async () => {
    const { user: targetUser, actionType } = blockDialogState;
    if (!targetUser) return;

    try {
      setBlockDialogState((prev) => ({ ...prev, loading: true }));
      const newStatus = actionType === 'block' ? 'blocked' : 'active';
      const res = await userService.updateUserStatus(targetUser._id, newStatus);

      if (res.success) {
        setBlockDialogState({ isOpen: false, user: null, actionType: 'block', loading: false });
        setSuccessMessage(actionType === 'block' ? 'User blocked successfully' : 'User activated successfully');
        setTimeout(() => setSuccessMessage(''), 4000);
        // Refresh users & stats
        fetchUsers();
        fetchStats();
      }
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${actionType} user.`);
      setBlockDialogState((prev) => ({ ...prev, loading: false }));
    }
  };

  // Open Delete Dialog
  const handleDeleteClick = (targetUser) => {
    setDeleteDialogState({
      isOpen: true,
      user: targetUser,
      loading: false,
    });
  };

  // Execute Delete via backend API: DELETE /api/users/:id
  const handleConfirmDelete = async () => {
    const { user: targetUser } = deleteDialogState;
    if (!targetUser) return;

    try {
      setDeleteDialogState((prev) => ({ ...prev, loading: true }));
      const res = await userService.deleteUser(targetUser._id);

      if (res.success) {
        setDeleteDialogState({ isOpen: false, user: null, loading: false });
        setSuccessMessage('User account deleted successfully from database');
        setTimeout(() => setSuccessMessage(''), 4000);
        fetchUsers();
        fetchStats();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user account');
      setDeleteDialogState((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="admin-page admin-users-page">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-title">
            User Management{' '}
            {totalUsers > 0 && (
              <span className="badge badge-primary user-count-badge">
                ({totalUsers.toLocaleString()})
              </span>
            )}
          </h1>
          <p className="admin-subtitle">
            Securely administer customer and administrator profiles, permissions, orders, and statuses
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            onClick={() => {
              fetchUsers();
              fetchStats();
            }}
            className="btn btn-outline"
            title="Refresh database records"
          >
            <RefreshCw size={16} />
            <span className="hide-on-mobile">Refresh</span>
          </button>

          <Link to="/admin/users/add" className="btn btn-primary">
            <UserPlus size={18} />
            <span>Add New User</span>
          </Link>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="alert-success user-mgmt-toast">
          <CheckCircle size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {error && <ErrorMessage message={error} onRetry={fetchUsers} />}

      {/* Dynamic Statistics Cards */}
      <UserStats stats={stats} loading={statsLoading} />

      {/* Control Bar: Search and Filters */}
      <div className="user-controls-panel card">
        <UserSearch value={search} onSearch={handleSearch} />
        <UserFilters
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
        />
      </div>

      {/* User Management Table */}
      <div className="card user-table-card">
        {loading ? (
          <Loading message="Fetching live user records from MongoDB..." />
        ) : (
          <>
            <UserTable
              users={users}
              currentAdminId={currentAdmin?._id}
              onBlockToggle={handleBlockToggleClick}
              onDeleteClick={handleDeleteClick}
            />

            {/* Server-Side Pagination */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(newPage) => setPage(newPage)}
            />
          </>
        )}
      </div>

      {/* Confirmation Dialogs */}
      <BlockUserDialog
        isOpen={blockDialogState.isOpen}
        user={blockDialogState.user}
        actionType={blockDialogState.actionType}
        loading={blockDialogState.loading}
        onConfirm={handleConfirmBlockAction}
        onClose={() => setBlockDialogState({ isOpen: false, user: null, actionType: 'block', loading: false })}
      />

      <DeleteUserDialog
        isOpen={deleteDialogState.isOpen}
        user={deleteDialogState.user}
        loading={deleteDialogState.loading}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteDialogState({ isOpen: false, user: null, loading: false })}
      />
    </div>
  );
};

export default AdminUsers;
