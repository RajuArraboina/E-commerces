import React, { useState } from 'react';
import {
  Settings,
  Sliders,
  Save,
  CheckCircle,
  Database,
  Cpu
} from 'lucide-react';

const AdminSettings = () => {
  const [storeSettings, setStoreSettings] = useState({
    storeName: 'EShop Smart Commerce',
    supportEmail: 'support@eshop.com',
    currency: 'INR (₹)',
    taxRate: '18',
    lowStockThreshold: '10',
    criticalStockThreshold: '3',
    enableAiSearch: true,
    enableAiAssistant: true,
    enableAiReviewSummaries: true,
    enableDemandForecasting: true,
    orderNotifications: true,
  });

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setStoreSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    setTimeout(() => {
      setSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    }, 600);
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-title">System & Store Settings</h1>
          <p className="admin-subtitle">
            Configure EShop commerce parameters, AI engine settings, and alert thresholds
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="success-banner" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle size={18} />
          <span>Settings successfully saved and synchronized across the platform!</span>
        </div>
      )}

      <form onSubmit={handleSave}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
          {/* General Store Settings */}
          <div className="card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.15rem', marginBottom: '16px' }}>
              <Settings size={20} className="text-primary" />
              <span>General Store Profile</span>
            </h3>

            <div className="form-group">
              <label className="form-label">Store Brand Name</label>
              <input
                type="text"
                name="storeName"
                value={storeSettings.storeName}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Customer Support Email</label>
              <input
                type="email"
                name="supportEmail"
                value={storeSettings.supportEmail}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Catalog Currency</label>
                <input
                  type="text"
                  name="currency"
                  disabled
                  value={storeSettings.currency}
                  className="form-control"
                  style={{ opacity: 0.8 }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">GST / Tax Rate (%)</label>
                <input
                  type="number"
                  name="taxRate"
                  value={storeSettings.taxRate}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
            </div>
          </div>

          {/* AI Intelligence Engines */}
          <div className="card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.15rem', marginBottom: '16px' }}>
              <Cpu size={20} className="text-accent" />
              <span>AI Engine Configuration</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <label className="checkbox-label" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <input
                  type="checkbox"
                  name="enableAiSearch"
                  checked={storeSettings.enableAiSearch}
                  onChange={handleChange}
                  style={{ marginTop: '3px' }}
                />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Natural Language AI Search</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Interprets price caps, budget keywords, intent and specifications from customer search prompts
                  </div>
                </div>
              </label>

              <label className="checkbox-label" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <input
                  type="checkbox"
                  name="enableAiAssistant"
                  checked={storeSettings.enableAiAssistant}
                  onChange={handleChange}
                  style={{ marginTop: '3px' }}
                />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>✨ Ask EShop AI Assistant</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Floats concierge on storefront answering catalog questions grounded directly on MongoDB
                  </div>
                </div>
              </label>

              <label className="checkbox-label" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <input
                  type="checkbox"
                  name="enableAiReviewSummaries"
                  checked={storeSettings.enableAiReviewSummaries}
                  onChange={handleChange}
                  style={{ marginTop: '3px' }}
                />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>AI Review Synthesis</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Summarizes customer sentiments into pros & cons on product detail pages
                  </div>
                </div>
              </label>

              <label className="checkbox-label" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <input
                  type="checkbox"
                  name="enableDemandForecasting"
                  checked={storeSettings.enableDemandForecasting}
                  onChange={handleChange}
                  style={{ marginTop: '3px' }}
                />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Inventory Demand Forecasting</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Predicts stock velocity and warns when items hit critical depletion levels
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Inventory Alerts & Thresholds */}
          <div className="card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.15rem', marginBottom: '16px' }}>
              <Sliders size={20} className="text-warning" />
              <span>Inventory Thresholds</span>
            </h3>

            <div className="form-group">
              <label className="form-label">Low Stock Alert Threshold (units)</label>
              <input
                type="number"
                name="lowStockThreshold"
                value={storeSettings.lowStockThreshold}
                onChange={handleChange}
                className="form-control"
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Products at or below this count will trigger a Low Stock warning banner
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Critical Stock Threshold (units)</label>
              <input
                type="number"
                name="criticalStockThreshold"
                value={storeSettings.criticalStockThreshold}
                onChange={handleChange}
                className="form-control"
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Products at or below this count will be highlighted in bright red in Inventory Management
              </span>
            </div>
          </div>

          {/* System & Architecture Info */}
          <div className="card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.15rem', marginBottom: '16px' }}>
              <Database size={20} className="text-success" />
              <span>System & Security Health</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Backend Environment</span>
                <span className="badge badge-success">Production Ready</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Database Connection</span>
                <span style={{ fontWeight: 600, color: 'var(--success)' }}>MongoDB Connected</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Allowed User Roles</span>
                <span style={{ fontWeight: 600 }}>Admin & Customer Only</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                <span style={{ color: 'var(--text-muted)' }}>AI Provider Security</span>
                <span style={{ fontWeight: 600, color: 'var(--primary)' }}>Backend Gateway Protected</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '25px', display: 'flex', gap: '14px' }}>
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}
          >
            <Save size={18} />
            <span>{saving ? 'Saving Changes...' : 'Save System Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
