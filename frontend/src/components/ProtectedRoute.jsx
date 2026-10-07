import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from './Loading';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading message="Checking authorization..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '500px', margin: '0 auto', padding: '30px' }}>
          <h2 style={{ color: '#ef4444' }}>Access Denied</h2>
          <p style={{ margin: '15px 0' }}>You do not have administrator permissions to view this page.</p>
          <a href="/" className="btn btn-primary">Return to Store</a>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
