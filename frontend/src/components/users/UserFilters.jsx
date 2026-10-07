import React from 'react';
import { RotateCcw } from 'lucide-react';

const UserFilters = ({
  filters,
  onChange,
  onReset,
}) => {
  const { role = '', status = '', period = '', startDate = '', endDate = '' } = filters;

  const handleFieldChange = (field, value) => {
    onChange({ ...filters, [field]: value });
  };

  const hasActiveFilters = Boolean(role || status || period || startDate || endDate);

  return (
    <div className="user-filters-bar">
      <div className="filters-group-row">
        {/* Role Filter */}
        <div className="filter-select-wrap">
          <label className="filter-field-label">Role</label>
          <select
            value={role}
            onChange={(e) => handleFieldChange('role', e.target.value)}
            className="form-control filter-select"
          >
            <option value="">All Roles</option>
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Account Status Filter */}
        <div className="filter-select-wrap">
          <label className="filter-field-label">Account Status</label>
          <select
            value={status}
            onChange={(e) => handleFieldChange('status', e.target.value)}
            className="form-control filter-select"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Registration Date Filter */}
        <div className="filter-select-wrap">
          <label className="filter-field-label">Registration Date</label>
          <select
            value={period}
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'custom') {
                onChange({ ...filters, period: 'custom' });
              } else {
                onChange({ ...filters, period: val, startDate: '', endDate: '' });
              }
            }}
            className="form-control filter-select"
          >
            <option value="">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="custom">Custom Date Range</option>
          </select>
        </div>

        {/* Custom Date Range Inputs */}
        {period === 'custom' && (
          <div className="custom-date-group">
            <div className="custom-date-field">
              <label className="filter-field-label">From</label>
              <input
                type="date"
                className="form-control custom-date-input"
                value={startDate}
                onChange={(e) => handleFieldChange('startDate', e.target.value)}
              />
            </div>
            <div className="custom-date-field">
              <label className="filter-field-label">To</label>
              <input
                type="date"
                className="form-control custom-date-input"
                value={endDate}
                onChange={(e) => handleFieldChange('endDate', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Reset Action */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="btn btn-outline btn-sm reset-filters-btn"
            title="Reset all filters to default"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default UserFilters;
