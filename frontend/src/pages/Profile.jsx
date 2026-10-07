import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import userService from '../services/userService';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { User, Mail, Phone, MapPin, KeyRound, Check } from 'lucide-react';

const Profile = () => {
  const { updateUserState } = useAuth();
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await userService.getProfile();
      if (res.success && res.data) {
        setProfile(res.data);
        setFormData({
          name: res.data.name || '',
          phone: res.data.phone || '',
          street: res.data.address?.street || '',
          city: res.data.address?.city || '',
          state: res.data.address?.state || '',
          postalCode: res.data.address?.postalCode || '',
          country: res.data.address?.country || 'India',
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch user profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg('');

    const payload = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      address: {
        street: formData.street.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        postalCode: formData.postalCode.trim(),
        country: formData.country.trim() || 'India',
      },
    };

    try {
      setUpdating(true);
      const res = await userService.updateProfile(payload);
      if (res.success && res.data) {
        setProfile(res.data);
        updateUserState(res.data);
        setSuccessMsg('Profile updated successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <Loading message="Loading profile details..." />;

  return (
    <div className="profile-page container">
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your personal information and default delivery addresses</p>
      </div>

      {error && <ErrorMessage message={error} />}
      {successMsg && (
        <div className="alert-success">
          <Check size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="profile-layout">
        {/* Left: User Card Info */}
        <div className="profile-sidebar-col">
          <div className="user-profile-badge-card card">
            <div className="avatar-circle">
              {profile?.name ? profile.name[0].toUpperCase() : 'U'}
            </div>
            <h3 className="profile-user-name">{profile?.name}</h3>
            <p className="profile-user-email">{profile?.email}</p>
            <span className={`badge ${profile?.role === 'admin' ? 'badge-primary' : 'badge-info'}`}>
              {profile?.role === 'admin' ? 'Administrator' : 'Verified Customer'}
            </span>

            <div className="profile-sidebar-links">
              <Link to="/change-password" className="btn btn-outline btn-block">
                <KeyRound size={16} />
                <span>Change Password</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Right: Editable Form */}
        <div className="profile-form-col">
          <div className="card">
            <h3 className="section-card-title">Edit Personal Details</h3>

            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div className="input-with-icon">
                    <User className="input-icon" size={18} />
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address (Read-only)</label>
                  <div className="input-with-icon">
                    <Mail className="input-icon" size={18} />
                    <input
                      type="email"
                      value={profile?.email || ''}
                      disabled
                      className="form-control input-disabled"
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div className="input-with-icon">
                  <Phone className="input-icon" size={18} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 9876543210"
                    className="form-control"
                  />
                </div>
              </div>

              {/* Address Fields */}
              <h4 className="section-divider-title" style={{ marginTop: '20px' }}>
                <MapPin size={16} /> Default Shipping Address
              </h4>

              <div className="form-group">
                <label className="form-label">Street Address</label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  placeholder="Street and house number"
                  className="form-control"
                />
              </div>

              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    name="city"
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
                    value={formData.postalCode}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={updating}
                className="btn btn-primary btn-lg"
                style={{ marginTop: '15px' }}
              >
                <span>{updating ? 'Saving Changes...' : 'Save Profile Changes'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
