import React, { useState, useEffect } from 'react';
import aiService from '../../services/aiService';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import {
  Sparkles,
  TrendingUp,
  Package,
  Users,
  AlertTriangle,
  RefreshCw,
  BarChart2,
  Info
} from 'lucide-react';

const AdminAISalesInsights = () => {
  const [insightsData, setInsightsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await aiService.getSalesInsights();
      if (res.success) {
        setInsightsData(res);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate AI sales insights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  if (loading) return <Loading message="AI synthesizing database sales data and inventory velocity..." />;

  const summary = insightsData?.summary || {};
  const observations = insightsData?.insights || [];

  return (
    <div className="admin-page admin-insights-page">
      <div className="admin-page-header">
        <div>
          <div className="badge-tag badge-tag-ai" style={{ marginBottom: '8px' }}>
            <Sparkles size={14} /> ✨ AI Sales & Demand Insights
          </div>
          <h1 className="admin-title">AI Sales Insights & Forecasts</h1>
          <p className="admin-subtitle">
            Dynamic strategic analysis synthesized from real MongoDB transactions, category volume, and catalog inventory
          </p>
        </div>

        <button onClick={fetchInsights} className="btn btn-outline" title="Re-run AI Synthesis">
          <RefreshCw size={16} />
          <span>Refresh Analysis</span>
        </button>
      </div>

      {/* Mandatory Disclaimer (Section 18) */}
      <div className="admin-security-notice card" style={{ marginBottom: '24px' }}>
        <Info size={18} className="text-primary" />
        <small>
          <strong>Notice:</strong> {insightsData?.disclaimer || 'AI-generated observations and demand forecasts are synthesized dynamically from current database activity. Projections are informational recommendations.'}
        </small>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Section 1: Sales Overview Metric Cards */}
      <div className="dashboard-stats-grid" style={{ marginBottom: '28px' }}>
        <div className="metric-card card">
          <div className="metric-icon-wrap bg-primary-soft">
            <TrendingUp size={22} className="text-primary" />
          </div>
          <div className="metric-data">
            <span className="metric-label">Total Gross Revenue</span>
            <span className="metric-value">₹{Number(summary.totalRevenue || 0).toLocaleString('en-IN')}</span>
            <small className="metric-extra">From non-cancelled orders</small>
          </div>
        </div>

        <div className="metric-card card">
          <div className="metric-icon-wrap bg-accent-soft">
            <BarChart2 size={22} className="text-accent" />
          </div>
          <div className="metric-data">
            <span className="metric-label">Average Order Value (AOV)</span>
            <span className="metric-value">₹{Number(summary.avgOrderValue || 0).toLocaleString('en-IN')}</span>
            <small className="metric-extra">Per checkout volume</small>
          </div>
        </div>

        <div className="metric-card card">
          <div className="metric-icon-wrap bg-success-soft">
            <Users size={22} className="text-success" />
          </div>
          <div className="metric-data">
            <span className="metric-label">Total Customers</span>
            <span className="metric-value">{summary.totalCustomers || 0}</span>
            <small className="metric-extra">Registered buyers</small>
          </div>
        </div>

        <div className="metric-card card">
          <div className="metric-icon-wrap bg-warning-soft">
            <AlertTriangle size={22} className="text-warning" />
          </div>
          <div className="metric-data">
            <span className="metric-label">Low Stock Items</span>
            <span className="metric-value">{summary.inventoryHealth?.lowStock || 0}</span>
            <small className="metric-extra">Reorder recommended</small>
          </div>
        </div>
      </div>

      {/* Section 2: AI Observations Grid */}
      <div className="insights-observations-section card" style={{ marginBottom: '32px' }}>
        <div className="section-card-header">
          <h3 className="section-card-title">
            <Sparkles size={18} className="text-accent" />
            <span>AI Analytical Observations & Actionable Insights</span>
          </h3>
        </div>

        <div className="observations-cards-grid">
          {observations.map((obs, idx) => (
            <div key={idx} className="observation-card card">
              <div className="obs-card-top">
                <span className="obs-type-tag">{obs.type?.toUpperCase()}</span>
                <span className={`badge ${obs.impact === 'Critical' ? 'badge-danger' : obs.impact === 'High' ? 'badge-warning' : 'badge-info'}`}>
                  {obs.impact} Impact
                </span>
              </div>
              <h4 className="obs-title">{obs.title}</h4>
              <p className="obs-text">{obs.observation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Inventory Health Breakdown */}
      <div className="card inventory-health-section">
        <div className="section-card-header">
          <h3 className="section-card-title">
            <Package size={18} className="text-primary" />
            <span>Catalog Inventory Status & Stock Distribution</span>
          </h3>
        </div>

        <div className="inventory-status-pills-row">
          <div className="health-pill healthy">
            <span className="pill-dot"></span>
            <strong>{summary.inventoryHealth?.healthyStock || 0} Healthy</strong>
            <small>(&gt; 10 units)</small>
          </div>
          <div className="health-pill low-stock">
            <span className="pill-dot"></span>
            <strong>{summary.inventoryHealth?.lowStock || 0} Low Stock</strong>
            <small>(1-10 units)</small>
          </div>
          <div className="health-pill out-of-stock">
            <span className="pill-dot"></span>
            <strong>{summary.inventoryHealth?.outOfStock || 0} Out of Stock</strong>
            <small>(0 units)</small>
          </div>
          <div className="health-pill total">
            <span className="pill-dot"></span>
            <strong>{summary.inventoryHealth?.totalProducts || 0} Total Catalog Items</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAISalesInsights;
