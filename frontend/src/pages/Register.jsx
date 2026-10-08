import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import {
  ShoppingBag,
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  ShieldCheck,
  RotateCw,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import ErrorMessage from '../components/ErrorMessage';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  // Wizard Step: 'form' | 'otp'
  const [step, setStep] = useState('form');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // 6-digit OTP State & Refs
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  // Resend Timer State
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Success Celebration Modal States
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [redirectTimer, setRedirectTimer] = useState(4);

  // Countdown timer for resending OTP
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

  // Automatic redirect timer when success modal opens
  useEffect(() => {
    let timer = null;
    if (showSuccessModal && redirectTimer > 0) {
      timer = setTimeout(() => {
        setRedirectTimer((prev) => prev - 1);
      }, 1000);
    } else if (showSuccessModal && redirectTimer === 0) {
      navigate('/', { replace: true });
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showSuccessModal, redirectTimer, navigate]);

  // Handle Form Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Step 1: Submit Details & Request 6-digit OTP
  const handleInitiateSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setError('Please provide Name, Email, and Password.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      // Call backend to send 6-digit OTP to the entered email
      const res = await authService.sendSignupOtp(
        formData.email.trim(),
        formData.name.trim()
      );

      setSuccessMsg(res.message || `Verification code sent to ${formData.email}`);
      setStep('otp');
      setResendTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);

      // Focus first input box on next tick
      setTimeout(() => {
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }, 150);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to send verification code. Please check your email.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Handle Individual OTP Digit Change
  const handleOtpChange = (index, value) => {
    // Only accept numeric digit
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Take the latest typed digit
    setOtp(newOtp);

    // Auto-focus next input box if a digit was entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Keyboard Navigation (Backspace, Arrow keys)
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Clipboard Paste (e.g. user pastes full 6 digits)
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      inputRefs.current[5]?.focus();
    }
  };

  // Resend 6-Digit OTP Code
  const handleResendOtp = async () => {
    if (!canResend) return;

    try {
      setLoading(true);
      setError('');
      const res = await authService.sendSignupOtp(
        formData.email.trim(),
        formData.name.trim()
      );
      setSuccessMsg(res.message || `New code sent to ${formData.email}!`);
      setResendTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to resend code. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and Trigger Innovative Celebration Modal
  const handleVerifyAndRegister = async (e) => {
    if (e) e.preventDefault();
    setError('');

    const fullOtp = otp.join('').trim();
    if (fullOtp.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      phone: formData.phone.trim(),
      address: {
        street: formData.street.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        postalCode: formData.postalCode.trim(),
        country: formData.country.trim() || 'India',
      },
      role: 'customer',
      otp: fullOtp,
    };

    try {
      setLoading(true);
      await register(payload);
      // Open the innovative success celebration popup modal!
      setShowSuccessModal(true);
      setRedirectTimer(4);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Verification failed. Please check the code and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className={`auth-card ${step === 'form' ? 'auth-card-wide' : 'auth-card-otp'} card`}>
        {/* ================= STEP 1: INITIAL DETAILS FORM ================= */}
        {step === 'form' && (
          <>
            <div className="auth-header">
              <Link to="/" className="auth-logo">
                <ShoppingBag size={32} />
              </Link>
              <h2>Create Your Account</h2>
              <p>Join EShop for seamless shopping and exclusive rewards</p>
            </div>

            {error && <ErrorMessage message={error} />}

            <form onSubmit={handleInitiateSignup} className="auth-form">
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <div className="input-with-icon">
                    <User className="input-icon" size={18} />
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. Raju Arraboina"
                      value={formData.name}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <div className="input-with-icon">
                    <Mail className="input-icon" size={18} />
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Password * (min 6 chars)</label>
                  <div className="input-with-icon password-input-wrap">
                    <Lock className="input-icon" size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      required
                      minLength={6}
                      placeholder="Create a strong password"
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

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <div className="input-with-icon">
                    <Phone className="input-icon" size={18} />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="+91 9876543210"
                      value={formData.phone}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <h4 className="section-divider-title">
                <MapPin size={16} /> Default Shipping Address
              </h4>

              <div className="form-group">
                <label className="form-label">Street Address</label>
                <input
                  type="text"
                  name="street"
                  placeholder="e.g. 12 MG Road, Flat 402"
                  value={formData.street}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="Hyderabad"
                    value={formData.city}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    name="state"
                    placeholder="Telangana"
                    value={formData.state}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Postal / Pincode</label>
                  <input
                    type="text"
                    name="postalCode"
                    placeholder="500001"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-block btn-lg"
                style={{ marginTop: '14px' }}
              >
                <span>{loading ? 'Sending Code...' : 'Continue to Verification'}</span>
                <ArrowRight size={18} />
              </button>
            </form>

            <div className="auth-footer">
              <p>
                Already have an account?{' '}
                <Link to="/login" className="auth-link">
                  Sign In here
                </Link>
              </p>
            </div>
          </>
        )}

        {/* ================= STEP 2: ENTER OTP SCREEN ================= */}
        {step === 'otp' && (
          <div className="otp-screen-wrapper">
            <div className="auth-header">
              <div className="otp-icon-badge">
                <ShieldCheck size={36} />
              </div>
              <h2>Enter Verification Code</h2>
              <p style={{ margin: '8px 0 0' }}>
                We've sent a 6-digit verification code to
              </p>
              <div className="otp-email-pill">
                <Mail size={14} />
                <span>{formData.email}</span>
              </div>
            </div>

            {error && <ErrorMessage message={error} />}

            {successMsg && !error && (
              <div className="alert alert-success" style={{ marginBottom: '18px', textAlign: 'center' }}>
                <CheckCircle2 size={16} style={{ display: 'inline', marginRight: '6px' }} />
                {successMsg}
              </div>
            )}

            <form onSubmit={handleVerifyAndRegister} className="auth-form">
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
                    <span>Resend Verification Code</span>
                  </button>
                )}
              </div>

              {/* Verify & Signup Button */}
              <button
                type="submit"
                disabled={loading || otp.join('').length !== 6}
                className="btn btn-primary btn-block btn-lg"
              >
                <span>{loading ? 'Verifying & Creating Account...' : 'Verify & Complete Signup'}</span>
                <CheckCircle2 size={18} />
              </button>

              {/* Go Back / Change Email */}
              <div style={{ textAlign: 'center', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setStep('form');
                    setError('');
                    setSuccessMsg('');
                  }}
                  className="otp-back-btn"
                >
                  <ArrowLeft size={16} />
                  <span>Change Email / Back to Details</span>
                </button>
              </div>
            </form>

            <div className="auth-footer" style={{ marginTop: '20px' }}>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Didn't receive an email? Check your spam/junk folder or click Resend.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ================= INNOVATIVE REGISTRATION SUCCESS CELEBRATION MODAL ================= */}
      {showSuccessModal && (
        <div className="success-modal-overlay">
          <div className="success-modal-card card" onClick={(e) => e.stopPropagation()}>
            {/* Ambient Confetti Float Particles */}
            <div className="confetti-container" aria-hidden="true">
              {[...Array(14)].map((_, i) => (
                <span key={i} className={`confetti-piece c-${(i % 5) + 1}`} />
              ))}
            </div>

            {/* Glowing Pulsing Celebration Badge */}
            <div className="celebration-badge-wrap">
              <div className="celebration-badge-ring" />
              <div className="celebration-badge-core">
                <CheckCircle2 size={44} className="celebration-check-icon" />
              </div>
            </div>

            {/* Header Content */}
            <div className="success-modal-header">
              <span className="success-pill-badge">
                <Sparkles size={14} /> Account Verified & Active
              </span>
              <h2 className="success-celebration-title">Registration Successful! 🎉</h2>
              <p className="success-celebration-desc">
                Welcome aboard, <strong>{formData.name}</strong>! Your email address has been verified and your account is ready.
              </p>
            </div>

            {/* Verified Email Confirmation Tag */}
            <div className="verified-account-pill">
              <span className="verified-pulse-dot" />
              <span>Verified Account: <strong>{formData.email}</strong></span>
            </div>

            {/* Account Status Info Box */}
            <div className="success-status-box">
              <div className="status-item">
                <span className="status-label">Account Role</span>
                <span className="status-value">Customer</span>
              </div>
              <div className="status-divider" />
              <div className="status-item">
                <span className="status-label">Email Status</span>
                <span className="status-value text-success">Verified ✓</span>
              </div>
              <div className="status-divider" />
              <div className="status-item">
                <span className="status-label">Session</span>
                <span className="status-value text-success">Active</span>
              </div>
            </div>

            {/* Animated Redirect Countdown & Progress Track */}
            <div className="redirect-countdown-wrap">
              <div className="redirect-text-row">
                <span>Redirecting to marketplace in <strong>{redirectTimer}s</strong></span>
                <span className="redirect-status-sub">Ready to shop!</span>
              </div>
              <div className="redirect-progress-track">
                <div
                  className="redirect-progress-bar"
                  style={{ width: `${((4 - redirectTimer) / 4) * 100}%` }}
                />
              </div>
            </div>

            {/* Instant Action CTA */}
            <div className="success-modal-actions">
              <button
                type="button"
                className="btn btn-primary btn-block btn-lg success-cta-btn"
                onClick={() => navigate('/', { replace: true })}
              >
                <span>Start Exploring Now</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
