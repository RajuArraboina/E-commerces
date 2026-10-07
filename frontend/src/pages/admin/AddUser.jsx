import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import userService from '../../api/userService';
import UserForm from '../../components/users/UserForm';
import { ChevronRight, ShieldAlert, ArrowLeft } from 'lucide-react';

const AddUser = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (userData) => {
    try {
      setLoading(true);
      setError('');
      // Dynamic create user via backend Express API: POST /api/users
      const res = await userService.createUser(userData);

      if (res.success) {
        navigate('/admin/users', {
          state: { message: `User "${userData.name}" created successfully in MongoDB` },
        });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to create user account. Please verify input data and email uniqueness.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page add-user-page">
      {/* Breadcrumb Navigation */}
      <div className="admin-breadcrumbs">
        <Link to="/admin" className="breadcrumb-link">Admin</Link>
        <ChevronRight size={14} className="breadcrumb-separator" />
        <Link to="/admin/users" className="breadcrumb-link">Users</Link>
        <ChevronRight size={14} className="breadcrumb-separator" />
        <span className="breadcrumb-current">Add New User</span>
      </div>

      <div className="admin-page-header">
        <div>
          <h1 className="admin-title">Create User Account</h1>
          <p className="admin-subtitle">
            Register a new customer or administrative user directly into the MongoDB database
          </p>
        </div>

        <Link to="/admin/users" className="btn btn-outline">
          <ArrowLeft size={16} />
          <span>Back to Users</span>
        </Link>
      </div>

      {/* Security Banner (Requirement 15) */}
      <div className="admin-security-notice card" style={{ marginBottom: '24px' }}>
        <ShieldAlert size={20} className="text-warning" />
        <div>
          <strong>Security Notice:</strong> All created passwords are salted and hashed on the server using bcrypt before persisting to MongoDB. Plaintext passwords are never stored or displayed after creation.
        </div>
      </div>

      {/* User Creation Form */}
      <UserForm
        isEdit={false}
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
      />
    </div>
  );
};

export default AddUser;
