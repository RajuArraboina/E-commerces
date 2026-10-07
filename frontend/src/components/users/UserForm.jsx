import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Phone, MapPin, Save, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const UserForm = ({
  initialData = {},
  isEdit = false,
  onSubmit,
  loading = false,
  error = '',
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'customer',
    status: 'active',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
    },
  });

  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        password: '', // Never pre-fill or store passwords
        phone: initialData.phone || '',
        role: initialData.role || 'customer',
        status: initialData.status || 'active',
        address: {
          street: initialData.address?.street || '',
          city: initialData.address?.city || '',
          state: initialData.address?.state || '',
          postalCode: initialData.address?.postalCode || '',
          country: initialData.address?.country || 'India',
        },
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear field-specific validation error
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    } else if (formData.name.trim().length > 60) {
      errors.name = 'Name cannot exceed 60 characters';
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!formData.email.trim()) {
      errors.email = 'Valid email address is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Please provide a valid email format (e.g. user@domain.com)';
    }

    if (!isEdit) {
      if (!formData.password) {
        errors.password = 'Password is required for new user creation';
      } else if (formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters long';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      role: formData.role,
      status: formData.status,
      address: {
        street: formData.address.street.trim(),
        city: formData.address.city.trim(),
        state: formData.address.state.trim(),
        postalCode: formData.address.postalCode.trim(),
        country: formData.address.country.trim() || 'India',
      },
    };

    // Only include password if creating a new user or explicitly updating
    if (!isEdit && formData.password) {
      payload.password = formData.password;
    }

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="user-form-layout" noValidate>
      {error && <div className="alert-danger user-form-alert">{error}</div>}

      <div className="card user-form-card">
        <h3 className="section-card-title">
          <User size={18} className="text-primary" />
          <span>{isEdit ? 'Edit Account Information' : 'New User Credentials'}</span>
        </h3>

        <div className="form-grid-2">
          {/* Name */}
          <div className="form-group">
            <label className="form-label">
              Full Name <span className="text-danger">*</span>
            </label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. John Doe"
                className={`form-control ${validationErrors.name ? 'is-invalid' : ''}`}
                required
                maxLength={60}
              />
            </div>
            {validationErrors.name && (
              <small className="form-error-text text-danger">{validationErrors.name}</small>
            )}
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">
              Email Address <span className="text-danger">*</span>
            </label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. user@shopsphere.com"
                className={`form-control ${validationErrors.email ? 'is-invalid' : ''}`}
                required
              />
            </div>
            {validationErrors.email && (
              <small className="form-error-text text-danger">{validationErrors.email}</small>
            )}
          </div>
        </div>

        {/* Password (Only required on Create; Never displays hash on edit) */}
        {!isEdit && (
          <div className="form-group">
            <label className="form-label">
              Temporary / Initial Password <span className="text-danger">*</span>
            </label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                className={`form-control ${validationErrors.password ? 'is-invalid' : ''}`}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            {validationErrors.password ? (
              <small className="form-error-text text-danger">{validationErrors.password}</small>
            ) : (
              <small className="form-help-text text-muted">
                The user can change this password after logging in. The password will be hashed with bcrypt.
              </small>
            )}
          </div>
        )}

        <div className="form-grid-3">
          {/* Phone */}
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <div className="input-with-icon">
              <Phone size={18} className="input-icon" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="form-control"
              />
            </div>
          </div>

          {/* Role */}
          <div className="form-group">
            <label className="form-label">Account Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="form-control"
            >
              <option value="customer">Customer (Store Shopper)</option>
              <option value="admin">Administrator (Admin Portal Access)</option>
            </select>
          </div>

          {/* Account Status */}
          <div className="form-group">
            <label className="form-label">Account Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="form-control"
            >
              <option value="active">Active (Normal Access)</option>
              <option value="blocked">Blocked (Login Denied)</option>
              <option value="inactive">Inactive (Dormant)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Primary Address Card */}
      <div className="card user-form-card" style={{ marginTop: '24px' }}>
        <h3 className="section-card-title">
          <MapPin size={18} className="text-primary" />
          <span>Postal / Delivery Address</span>
        </h3>

        <div className="form-group">
          <label className="form-label">Street Address</label>
          <input
            type="text"
            name="address.street"
            value={formData.address.street}
            onChange={handleChange}
            placeholder="e.g. Flat 402, Skyline Residency, MG Road"
            className="form-control"
          />
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">City</label>
            <input
              type="text"
              name="address.city"
              value={formData.address.city}
              onChange={handleChange}
              placeholder="e.g. Bengaluru"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label className="form-label">State / Province</label>
            <input
              type="text"
              name="address.state"
              value={formData.address.state}
              onChange={handleChange}
              placeholder="e.g. Karnataka"
              className="form-control"
            />
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Postal / ZIP Code</label>
            <input
              type="text"
              name="address.postalCode"
              value={formData.address.postalCode}
              onChange={handleChange}
              placeholder="e.g. 560001"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Country</label>
            <input
              type="text"
              name="address.country"
              value={formData.address.country}
              onChange={handleChange}
              placeholder="e.g. India"
              className="form-control"
            />
          </div>
        </div>
      </div>

      {/* Submit / Cancel Actions */}
      <div className="user-form-actions-row">
        <Link to="/admin/users" className="btn btn-outline">
          <ArrowLeft size={16} />
          <span>Cancel</span>
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary btn-lg"
        >
          <Save size={18} />
          <span>{loading ? 'Saving User...' : isEdit ? 'Update User Account' : 'Create User Account'}</span>
        </button>
      </div>
    </form>
  );
};

export default UserForm;
