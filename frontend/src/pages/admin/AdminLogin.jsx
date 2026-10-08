import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, ShieldCheck, Lock, Mail, ArrowRight, ArrowLeft, AlertTriangle, Eye, EyeOff, RotateCw, CheckCircle2 } from 'lucide-react';
import ErrorMessage from '../../components/ErrorMessage';
import authService from '../../services/authService';

const AdminLogin = () => {
  const { login, verifyLoginOtp, logout, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Step: 'credentials' | 'otp'
  const [step, setStep] = useState('credentials');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // 6-digit OTP state & refs
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // If already logged in as admin, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Resend Countdown Timer
  useEffect(() => {
    let interval = null;
    if (step === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, resendTimer]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!formData.email.trim() || !formData.password) {
      setError('Please provide both administrative email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await login(formData.email.trim(), formData.password);

      // If server requests 6-digit OTP verification
      if (res?.requireOtp) {
        setStep('otp');
        setSuccessMsg(res.message || `A 6-digit verification code has been sent to ${formData.email.trim()}`);
        setResendTimer(60);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);

        setTimeout(() => {
          if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
          }
        }, 150);
        return;
      }

      // Verify role
      if (res?.role !== 'admin') {
        await logout();
        setError('Access Denied: Your account role is "customer". Only administrator accounts can access the Admin Panel.');
        return;
      }

      navigate('/admin', { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Authentication failed. Please verify administrative credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    try {
      setLoading(true);
      setError('');
      const res = await authService.resendLoginOtp(formData.email.trim());
      setSuccessMsg(res.message || `New verification code sent to ${formData.email}!`);
      setResendTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');

    const fullOtp = otp.join('').trim();
    if (fullOtp.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    try {
      setLoading(true);
      const loggedUser = await verifyLoginOtp(formData.email.trim(), fullOtp);

      if (loggedUser?.role !== 'admin') {
        await logout();
        setError('Access Denied: Only administrator accounts can access the Admin Panel.');
        return;
      }

      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid verification code. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToCredentials = () => {
    setStep('credentials');
    setError('');
    setSuccessMsg('');
    setOtp(['', '', '', '', '', '']);
  };

  return (
    <div className="auth-page admin-login-page">
      <div className={`auth-card card admin-auth-card ${step === 'otp' ? 'auth-card-otp' : ''}`}>
        {step === 'credentials' && (
          <>
            <div className="auth-header">
              <div className="admin-login-icon-badge">
                <Shield size={36} className="text-primary" />
              </div>
              <h2>EShop Admin</h2>
              <p>Administrative Control Center & Management Portal</p>
            </div>

            {error && <ErrorMessage message={error} />}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label">Administrator Email</label>
                <div className="input-with-icon">
                  <Mail className="input-icon" size={18} />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="Enter administrator email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-control"
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-with-icon password-input-wrap">
                  <Lock className="input-icon" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-control"
                    autoComplete="new-password"
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

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-block btn-lg"
              >
                <span>{loading ? 'Verifying Admin Role...' : 'Authenticate & Enter Admin'}</span>
                <ArrowRight size={18} />
              </button>
            </form>

            <div className="auth-footer">
              <div className="admin-security-notice">
                <AlertTriangle size={15} className="text-warning" />
                <small>Restricted Area. All administrative actions and IP sessions are verified against MongoDB authorization roles.</small>
              </div>
              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <Link to="/" className="auth-link" style={{ fontSize: '0.85rem' }}>
                  &larr; Back to EShop Store
                </Link>
              </div>
            </div>
          </>
        )}

        {step === 'otp' && (
          <div className="otp-screen-wrapper">
            <div className="auth-header">
              <div className="otp-icon-badge">
                <ShieldCheck size={36} />
              </div>
              <h2>Admin 2FA Verification</h2>
              <p style={{ margin: '8px 0 0' }}>
                We've sent a 6-digit security code to
              </p>
              <div className="otp-email-pill">
                <Mail size={14} />
                <span>{formData.email.trim()}</span>
              </div>
            </div>

            {error && <ErrorMessage message={error} />}

            {successMsg && !error && (
              <div className="alert-success" style={{ marginBottom: '18px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="auth-form">
              <div className="otp-inputs-row" onPaste={handleOtpPaste}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className={`otp-digit-box ${digit ? 'filled' : ''}`}
                    autoComplete="one-time-code"
                  />
                ))}
              </div>

              <div className="otp-timer-row">
                {resendTimer > 0 ? (
                  <span>
                    Resend code in <strong style={{ color: 'var(--primary)' }}>{resendTimer}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading || !canResend}
                    className="otp-resend-btn"
                  >
                    <RotateCw size={14} />
                    <span>Resend Code</span>
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || otp.join('').length !== 6}
                className="btn btn-primary btn-block btn-lg"
              >
                <span>{loading ? 'Verifying...' : 'Verify & Enter Dashboard'}</span>
                <ArrowRight size={18} />
              </button>
            </form>

            <div className="auth-footer" style={{ marginTop: '20px', textAlign: 'center' }}>
              <button
                type="button"
                onClick={handleBackToCredentials}
                className="btn-link"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.88rem',
                }}
              >
                <ArrowLeft size={16} />
                <span>Back to credentials</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;
