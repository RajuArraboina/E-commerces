import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import ErrorMessage from '../components/ErrorMessage';
import { Lock, ArrowLeft, Check, ShieldCheck, Eye, EyeOff } from 'lucide-react';

const ChangePassword = () => {
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwords.newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('Passwords do not match. Please re-enter identical passwords.');
      return;
    }

    try {
      setLoading(true);
      const res = await userService.changePassword(passwords.newPassword);
      if (res.success) {
        setSuccess('Your password has been securely updated!');
        setPasswords({ newPassword: '', confirmPassword: '' });
        setTimeout(() => navigate('/profile'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: '600px' }}>
      <Link to="/profile" className="back-link">
        <ArrowLeft size={16} />
        <span>Back to Profile</span>
      </Link>

      <div className="card" style={{ marginTop: '15px' }}>
        <div className="card-section-header">
          <ShieldCheck size={22} className="text-primary" />
          <h2 style={{ fontSize: '1.4rem' }}>Update Account Password</h2>
        </div>
        <p className="text-muted" style={{ marginBottom: '20px' }}>
          Ensure your account stays secure by using a strong password of at least 6 characters.
        </p>

        {error && <ErrorMessage message={error} />}
        {success && (
          <div className="alert-success">
            <Check size={18} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <div className="input-with-icon password-input-wrap">
              <Lock className="input-icon" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="newPassword"
                required
                minLength={6}
                placeholder="Enter new password"
                value={passwords.newPassword}
                onChange={handleChange}
                className="form-control"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <div className="input-with-icon password-input-wrap">
              <Lock className="input-icon" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                required
                minLength={6}
                placeholder="Confirm your new password"
                value={passwords.confirmPassword}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-block btn-lg"
            style={{ marginTop: '20px' }}
          >
            <span>{loading ? 'Updating Security...' : 'Save New Password'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;

