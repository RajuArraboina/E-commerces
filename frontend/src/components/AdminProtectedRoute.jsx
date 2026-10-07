import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from './Loading';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const AdminProtectedRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading message="Verifying administrator credentials..." />;
  }

  // If not authenticated with a valid JWT session, redirect to dedicated admin login
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // If authenticated but user role is not admin, show Access Denied
  if (user?.role !== 'admin') {
    return (
      <div className="container" style={{ padding: '80px 20px', display: 'flex', justifyContent: 'center' }}>
        <div className="card" style={{ maxWidth: '520px', width: '100%', textAlign: 'center', padding: '40px 30px' }}>
          <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', marginBottom: '20px' }}>
            <ShieldAlert size={42} />
          </div>
          <h2 style={{ color: '#ef4444', marginBottom: '12px' }}>Access Denied</h2>
          <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: '1.6', marginBottom: '25px' }}>
            You are authenticated as <strong>{user?.name || user?.email}</strong> (Role: <span className="badge badge-info">{user?.role || 'customer'}</span>), but this administrative portal is restricted to authorized Administrators only.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <a href="/" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <ArrowLeft size={16} />
              <span>Return to Store</span>
            </a>
            <a href="/admin/login" className="btn btn-outline">
              Sign In as Admin
            </a>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminProtectedRoute;
