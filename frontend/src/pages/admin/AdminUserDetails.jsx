import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import userService from '../../api/userService';
import { useAuth } from '../../context/AuthContext';
import UserDetails from '../../components/users/UserDetails';
import UserOrderHistory from '../../components/users/UserOrderHistory';
import BlockUserDialog from '../../components/users/BlockUserDialog';
import DeleteUserDialog from '../../components/users/DeleteUserDialog';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import {
  ChevronRight,
  ArrowLeft,
  Edit2,
  Ban,
  CheckCircle2,
  Trash2,
  CheckCircle
} from 'lucide-react';

const AdminUserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentAdmin } = useAuth();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Dialog states
  const [blockDialogState, setBlockDialogState] = useState({
    isOpen: false,
    actionType: 'block',
    loading: false,
  });

  const [deleteDialogState, setDeleteDialogState] = useState({
    isOpen: false,
    loading: false,
  });

  const fetchUserDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      // Dynamic fetch user by ID: GET /api/users/:id
      const res = await userService.getUserById(id);
      if (res.success && res.data) {
        setUser(res.data);
      } else {
        setError('User not found on server');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load user details from server');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  const isSelf = currentAdmin && user && currentAdmin._id === user._id;
  const isBlocked = (user?.status || 'active').toLowerCase() === 'blocked';

  // Block / Activate Action
  const handleConfirmBlockAction = async () => {
    if (!user) return;
    try {
      setBlockDialogState((prev) => ({ ...prev, loading: true }));
      const newStatus = isBlocked ? 'active' : 'blocked';
      const res = await userService.updateUserStatus(user._id, newStatus);

      if (res.success) {
        setBlockDialogState({ isOpen: false, actionType: 'block', loading: false });
        setToastMessage(isBlocked ? 'User activated successfully' : 'User blocked successfully');
        setTimeout(() => setToastMessage(''), 4000);
        fetchUserDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status.');
      setBlockDialogState((prev) => ({ ...prev, loading: false }));
    }
  };

  // Delete Action
  const handleConfirmDelete = async () => {
    if (!user) return;
    try {
      setDeleteDialogState((prev) => ({ ...prev, loading: true }));
      const res = await userService.deleteUser(user._id);

      if (res.success) {
        setDeleteDialogState({ isOpen: false, loading: false });
        navigate('/admin/users', {
          state: { message: `User "${user.name}" has been permanently deleted.` },
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user.');
      setDeleteDialogState((prev) => ({ ...prev, loading: false }));
    }
  };

  if (loading) return <Loading message="Retrieving full user profile and order records..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchUserDetails} />;
  if (!user) return null;

  return (
    <div className="admin-page user-details-page">
      {/* Breadcrumb Navigation */}
      <div className="admin-breadcrumbs">
        <Link to="/admin" className="breadcrumb-link">Admin</Link>
        <ChevronRight size={14} className="breadcrumb-separator" />
        <Link to="/admin/users" className="breadcrumb-link">Users</Link>
        <ChevronRight size={14} className="breadcrumb-separator" />
        <span className="breadcrumb-current">{user.name}</span>
      </div>

      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-title">{user.name}</h1>
          <p className="admin-subtitle">
            User ID: <code>{user._id}</code> &bull; Registered on{' '}
            {new Date(user.createdAt).toLocaleDateString('en-IN', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>

        <div className="admin-header-actions">
          <Link to="/admin/users" className="btn btn-outline">
            <ArrowLeft size={16} />
            <span>Back</span>
          </Link>

          {/* Edit */}
          <Link to={`/admin/users/edit/${user._id}`} className="btn btn-outline">
            <Edit2 size={16} />
            <span>Edit Profile</span>
          </Link>

          {/* Block / Activate */}
          <button
            type="button"
            onClick={() =>
              setBlockDialogState({
                isOpen: true,
                actionType: isBlocked ? 'activate' : 'block',
                loading: false,
              })
            }
            disabled={isSelf}
            className={`btn ${isBlocked ? 'btn-success' : 'btn-outline'}`}
            title={isSelf ? 'Cannot block yourself' : ''}
          >
            {isBlocked ? <CheckCircle2 size={16} /> : <Ban size={16} />}
            <span>{isBlocked ? 'Activate User' : 'Block User'}</span>
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={() => setDeleteDialogState({ isOpen: true, loading: false })}
            disabled={isSelf}
            className="btn btn-danger"
            title={isSelf ? 'Cannot delete yourself' : ''}
          >
            <Trash2 size={16} />
            <span>Delete User</span>
          </button>
        </div>
      </div>

      {/* Toast notification */}
      {toastMessage && (
        <div className="alert-success user-mgmt-toast">
          <CheckCircle size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* User Information & Order Overview */}
      <UserDetails user={user} />

      {/* User Order History (Requirement 5) */}
      <div style={{ marginTop: '24px' }}>
        <UserOrderHistory orders={user.recentOrders} />
      </div>

      {/* Dialogs */}
      <BlockUserDialog
        isOpen={blockDialogState.isOpen}
        user={user}
        actionType={blockDialogState.actionType}
        loading={blockDialogState.loading}
        onConfirm={handleConfirmBlockAction}
        onClose={() => setBlockDialogState({ isOpen: false, actionType: 'block', loading: false })}
      />

      <DeleteUserDialog
        isOpen={deleteDialogState.isOpen}
        user={user}
        loading={deleteDialogState.loading}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteDialogState({ isOpen: false, loading: false })}
      />
    </div>
  );
};

export default AdminUserDetails;
