import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import userService from '../../api/userService';
import UserForm from '../../components/users/UserForm';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import { ChevronRight, ArrowLeft } from 'lucide-react';

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError('');
        // Fetch current user details: GET /api/users/:id
        const res = await userService.getUserById(id);
        if (res.success && res.data) {
          setInitialData(res.data);
        } else {
          setError('User not found on server');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load user information for editing');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleSubmit = async (updatedFields) => {
    try {
      setSaving(true);
      setError('');
      // Dynamic update user: PUT /api/users/:id
      const res = await userService.updateUser(id, updatedFields);

      if (res.success) {
        navigate(`/admin/users/${id}`, {
          state: { message: 'User profile updated successfully' },
        });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to save updated user details. Please verify email uniqueness.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading message="Loading user account for editing..." />;

  return (
    <div className="admin-page edit-user-page">
      {/* Breadcrumb Navigation */}
      <div className="admin-breadcrumbs">
        <Link to="/admin" className="breadcrumb-link">Admin</Link>
        <ChevronRight size={14} className="breadcrumb-separator" />
        <Link to="/admin/users" className="breadcrumb-link">Users</Link>
        <ChevronRight size={14} className="breadcrumb-separator" />
        <span className="breadcrumb-current">Edit: {initialData?.name || 'User'}</span>
      </div>

      <div className="admin-page-header">
        <div>
          <h1 className="admin-title">Edit User Account</h1>
          <p className="admin-subtitle">
            Update name, email, phone, role, status, and postal address for <strong>{initialData?.name}</strong>
          </p>
        </div>

        <Link to={`/admin/users/${id}`} className="btn btn-outline">
          <ArrowLeft size={16} />
          <span>Cancel & Back</span>
        </Link>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Edit Form */}
      <UserForm
        initialData={initialData}
        isEdit={true}
        onSubmit={handleSubmit}
        loading={saving}
        error={error}
      />
    </div>
  );
};

export default EditUser;
