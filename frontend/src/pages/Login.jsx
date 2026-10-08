import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingBag,
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Check,
  X,
  KeyRound,
  ShieldCheck,
  RotateCw,
  CheckCircle2,
} from 'lucide-react';
import ErrorMessage from '../components/ErrorMessage';
import authService from '../services/authService';

const Login = () => {
  const { login, verifyLoginOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotData, setForgotData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showForgotPass, setShowForgotPass] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  const from = location.state?.from?.pathname || '/';

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

  // Step 1: Submit email & password
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!formData.email.trim() || !formData.password) {
      setError('Please provide both email and password.');
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

      // If direct login returned user
      if (res?.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Handle individual digit entry in OTP
  const handleOtpChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-advance to next box
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

  // Resend 6-Digit Login OTP
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

  // Step 2: Verify 6-digit OTP & Complete Login
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
      const user = await verifyLoginOtp(formData.email.trim(), fullOtp);

      if (user?.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid verification code. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  // Switch back to credentials screen
  const handleBackToCredentials = () => {
    setStep('credentials');
    setError('');
    setSuccessMsg('');
    setOtp(['', '', '', '', '', '']);
  };

  const handleOpenForgot = () => {
    setForgotData({
      email: formData.email || '',
      newPassword: '',
      confirmPassword: '',
    });
    setForgotError('');
    setForgotSuccess('');
    setShowForgotModal(true);
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (!forgotData.email || !forgotData.newPassword) {
      setForgotError('Please enter your email and a new password.');
      return;
    }

    if (forgotData.newPassword.length < 6) {
      setForgotError('Password must be at least 6 characters long.');
      return;
    }

    if (forgotData.newPassword !== forgotData.confirmPassword) {
      setForgotError('Passwords do not match. Please re-enter identical passwords.');
      return;
    }

    try {
      setForgotLoading(true);
      const res = await authService.resetPassword(forgotData.email.trim(), forgotData.newPassword);
      if (res.success) {
        setForgotSuccess(res.message || 'Password reset successful!');
        setFormData({
          email: forgotData.email.trim(),
          password: forgotData.newPassword,
        });
        setSuccessMsg('Password has been reset successfully! You can now sign in.');
        setTimeout(() => {
          setShowForgotModal(false);
        }, 1800);
      }
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Failed to reset password. Please check your email.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className={`auth-card card ${step === 'otp' ? 'auth-card-otp' : ''}`}>
        {/* ================= STEP 1: CREDENTIALS ================= */}
        {step === 'credentials' && (
          <>
            <div className="auth-header">
              <Link to="/" className="auth-logo">
                <ShoppingBag size={32} />
              </Link>
              <h2>Welcome Back</h2>
              <p>Sign in to your EShop account</p>
            </div>

            {successMsg && (
              <div className="alert-success" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={18} />
                <span>{successMsg}</span>
              </div>
            )}

            {error && <ErrorMessage message={error} />}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-with-icon">
                  <Mail className="input-icon" size={18} />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-control"
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                  <button
                    type="button"
                    onClick={handleOpenForgot}
                    className="auth-link"
                    style={{ background: 'none', border: 'none', padding: 0, fontSize: '0.82rem', cursor: 'pointer' }}
                  >
                    Forgot password?
                  </button>
                </div>
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
                    autoComplete="current-password"
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

              <button type="submit" disabled={loading} className="btn btn-primary btn-block btn-lg">
                <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                <ArrowRight size={18} />
              </button>
            </form>

            <div className="auth-footer">
              <p>
                Don't have an account? <Link to="/register" className="auth-link">Create one here</Link>
              </p>
            </div>
          </>
        )}

        {/* ================= STEP 2: 6-DIGIT OTP SCREEN ================= */}
        {step === 'otp' && (
          <div className="otp-screen-wrapper">
            <div className="auth-header">
              <div className="otp-icon-badge">
                <ShieldCheck size={36} />
              </div>
              <h2>Enter 6-Digit Code</h2>
              <p style={{ margin: '8px 0 0' }}>
                We've sent a 6-digit login verification code to
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
              {/* 6 Digit Input Boxes */}
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

              {/* Resend Code Section */}
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
                <span>{loading ? 'Verifying Code...' : 'Verify & Sign In'}</span>
                <ArrowRight size={18} />
              </button>
            </form>

            <div className="auth-footer" style={{ marginTop: '20px' }}>
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
                <span>Back to sign in</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="forgot-modal-overlay" onClick={() => setShowForgotModal(false)}>
          <div className="forgot-modal-content card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <KeyRound size={24} className="text-primary" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Reset Password</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Enter your email to set a new password
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {forgotError && <ErrorMessage message={forgotError} />}
            {forgotSuccess && (
              <div className="alert-success" style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={18} />
                <span>{forgotSuccess}</span>
              </div>
            )}

            <form onSubmit={handleResetSubmit}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Email Address</label>
                <div className="input-with-icon">
                  <Mail className="input-icon" size={18} />
                  <input
                    type="email"
                    required
                    placeholder="Enter registered email"
                    value={forgotData.email}
                    onChange={(e) => setForgotData({ ...forgotData, email: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">New Password (min 6 chars)</label>
                <div className="input-with-icon password-input-wrap">
                  <Lock className="input-icon" size={18} />
                  <input
                    type={showForgotPass ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Enter new password"
                    value={forgotData.newPassword}
                    onChange={(e) => setForgotData({ ...forgotData, newPassword: e.target.value })}
                    className="form-control"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowForgotPass(!showForgotPass)}
                    title={showForgotPass ? 'Hide password' : 'Show password'}
                  >
                    {showForgotPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Confirm New Password</label>
                <div className="input-with-icon password-input-wrap">
                  <Lock className="input-icon" size={18} />
                  <input
                    type={showForgotPass ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Re-enter new password"
                    value={forgotData.confirmPassword}
                    onChange={(e) => setForgotData({ ...forgotData, confirmPassword: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="btn btn-primary"
                  style={{ flex: 1.4 }}
                >
                  <span>{forgotLoading ? 'Resetting...' : 'Save New Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
