import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import orderService from '../services/orderService';
import OrderCard from '../components/OrderCard';
import ProductCard from '../components/ProductCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import {
  Package,
  ArrowRight,
  ShoppingBag,
  Truck,
  CheckCircle2,
  XCircle,
  Award,
  Search,
  Heart,
  Sparkles,
  Coins,
  Info,
  RotateCcw
} from 'lucide-react';

const Orders = () => {
  const { user } = useAuth();
  const { wishlist, wishlistCount } = useWishlist();
  const [searchParams, setSearchParams] = useSearchParams();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'orders'); // 'orders' | 'wishlist'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'delivered' | 'cancelled'
  const [searchQuery, setSearchQuery] = useState('');
  const [showRewardsInfo, setShowRewardsInfo] = useState(false);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams(tab === 'orders' ? {} : { tab });
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await orderService.getMyOrders();
      if (res.success && Array.isArray(res.data)) {
        setOrders(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve your order history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order? Product stock will be automatically restored.')) {
      try {
        const res = await orderService.cancelOrder(orderId);
        if (res.success) {
          alert('Order cancelled successfully.');
          fetchOrders();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Unable to cancel order.');
      }
    }
  };

  // Activity Stats Computations
  const stats = useMemo(() => {
    const totalCount = orders.length;
    const activeOrders = orders.filter((o) =>
      ['Placed', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery'].includes(o.orderStatus)
    );
    const deliveredOrders = orders.filter((o) => o.orderStatus === 'Delivered');
    const cancelledOrders = orders.filter((o) => o.orderStatus === 'Cancelled');
    const validOrders = orders.filter((o) => o.orderStatus !== 'Cancelled');
    const totalSpent = validOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

    // Reward points: 100 welcome bonus + 50 points per valid order + 1 point per ₹100 spent
    const rewardPoints = 100 + validOrders.length * 50 + Math.floor(totalSpent / 100);

    // Tier logic
    let tier = 'Bronze';
    let nextTier = 'Silver';
    let currentMin = 0;
    let targetPoints = 300;
    let badgeClass = 'tier-bronze';

    if (rewardPoints >= 1500) {
      tier = 'Platinum';
      nextTier = 'Max Tier';
      currentMin = 1500;
      targetPoints = 2500;
      badgeClass = 'tier-platinum';
    } else if (rewardPoints >= 750) {
      tier = 'Gold';
      nextTier = 'Platinum';
      currentMin = 750;
      targetPoints = 1500;
      badgeClass = 'tier-gold';
    } else if (rewardPoints >= 300) {
      tier = 'Silver';
      nextTier = 'Gold';
      currentMin = 300;
      targetPoints = 750;
      badgeClass = 'tier-silver';
    }

    const tierProgress =
      nextTier === 'Max Tier'
        ? 100
        : Math.min(100, Math.max(8, Math.round(((rewardPoints - currentMin) / (targetPoints - currentMin)) * 100)));

    return {
      totalCount,
      activeCount: activeOrders.length,
      deliveredCount: deliveredOrders.length,
      cancelledCount: cancelledOrders.length,
      totalSpent,
      rewardPoints,
      tier,
      nextTier,
      targetPoints,
      tierProgress,
      badgeClass,
      discountValue: Math.floor(rewardPoints / 10),
    };
  }, [orders]);

  // Filtered Orders List
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // 1. Status Filter
      if (statusFilter === 'active') {
        const isActive = ['Placed', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery'].includes(order.orderStatus);
        if (!isActive) return false;
      } else if (statusFilter === 'delivered') {
        if (order.orderStatus !== 'Delivered') return false;
      } else if (statusFilter === 'cancelled') {
        if (order.orderStatus !== 'Cancelled') return false;
      }

      // 2. Search Query (Order ID or item title)
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesId = order._id?.toLowerCase().includes(query);
        const matchesItem = order.items?.some((it) => it.name?.toLowerCase().includes(query));
        if (!matchesId && !matchesItem) return false;
      }

      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  return (
    <div className="orders-page container">
      {/* Page Header */}
      <div className="orders-header-row">
        <div>
          <h1 className="page-title">My Orders & Activities</h1>
          <p className="page-subtitle">
            Welcome back, <strong>{user?.name || 'Customer'}</strong>! Track live order deliveries, view receipts, and redeem reward points.
          </p>
        </div>
        <div className="orders-header-actions">
          <Link to="/products" className="btn btn-outline btn-sm">
            <span>Browse Catalog</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {/* Main Section Navigation Tabs (Orders vs Wishlist) */}
      <div className="orders-main-tabs-bar card">
        <button
          type="button"
          className={`orders-main-tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => handleTabChange('orders')}
        >
          <Package size={17} />
          <span>Orders & Activities ({orders.length})</span>
        </button>

        <button
          type="button"
          className={`orders-main-tab ${activeTab === 'wishlist' ? 'active' : ''}`}
          onClick={() => handleTabChange('wishlist')}
        >
          <Heart size={17} />
          <span>Saved Wishlist ({wishlistCount})</span>
        </button>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchOrders} />}

      {loading ? (
        <Loading message="Loading your orders, activities & reward points..." />
      ) : activeTab === 'wishlist' ? (
        /* Wishlist View */
        <div className="orders-wishlist-section">
          {wishlist.length === 0 ? (
            <div className="empty-state-box card">
              <Heart size={48} className="empty-icon text-muted" />
              <h3>Your wishlist is empty</h3>
              <p>Explore verified products and click the heart icon to save your favorites.</p>
              <Link to="/products" className="btn btn-primary" style={{ marginTop: '14px' }}>
                Explore Products
              </Link>
            </div>
          ) : (
            <div className="products-grid">
              {wishlist.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Orders & Activities View */
        <div className="orders-activities-container">
          {/* 1. Order Activity Metrics Grid */}
          <div className="orders-metrics-grid">
            <div className="order-metric-card card">
              <div className="metric-icon-wrap bg-primary-soft">
                <ShoppingBag size={22} className="text-primary" />
              </div>
              <div className="metric-data">
                <span className="metric-label">Total Orders</span>
                <span className="metric-value">{stats.totalCount}</span>
                <small className="metric-extra">Lifetime purchases</small>
              </div>
            </div>

            <div className="order-metric-card card">
              <div className="metric-icon-wrap bg-info-soft">
                <Truck size={22} className="text-info" />
              </div>
              <div className="metric-data">
                <span className="metric-label">Active Deliveries</span>
                <span className="metric-value">{stats.activeCount}</span>
                <small className="metric-extra">In transit / processing</small>
              </div>
            </div>

            <div className="order-metric-card card">
              <div className="metric-icon-wrap bg-success-soft">
                <CheckCircle2 size={22} className="text-success" />
              </div>
              <div className="metric-data">
                <span className="metric-label">Delivered Orders</span>
                <span className="metric-value">{stats.deliveredCount}</span>
                <small className="metric-extra">Successfully completed</small>
              </div>
            </div>

            <div className="order-metric-card card">
              <div className="metric-icon-wrap bg-warning-soft">
                <Coins size={22} className="text-warning" />
              </div>
              <div className="metric-data">
                <span className="metric-label">Total Spent</span>
                <span className="metric-value">₹{stats.totalSpent.toLocaleString('en-IN')}</span>
                <small className="metric-extra">Verified spend</small>
              </div>
            </div>
          </div>

          {/* 2. Rewards Points & VIP Tier Showcase Card */}
          <div className="reward-points-showcase-card card">
            <div className="rewards-card-header">
              <div className="rewards-title-wrap">
                <div className="rewards-icon-badge">
                  <Award size={24} className="text-warning" />
                </div>
                <div>
                  <div className="rewards-badge-row">
                    <h3 className="rewards-heading">ShopSphere Reward Points</h3>
                    <span className={`membership-tier-badge ${stats.badgeClass}`}>
                      <Sparkles size={13} /> {stats.tier} Member
                    </span>
                  </div>
                  <p className="rewards-sub">
                    Earn points on every order. Redeem for instant discounts at checkout!
                  </p>
                </div>
              </div>

              <div className="rewards-balance-pill">
                <span className="balance-pts-val">{stats.rewardPoints}</span>
                <span className="balance-pts-label">Points Available</span>
                <span className="balance-cash-val">≈ ₹{stats.discountValue} Discount</span>
              </div>
            </div>

            {/* Tier Progress Bar */}
            {stats.nextTier !== 'Max Tier' ? (
              <div className="tier-progress-section">
                <div className="tier-progress-meta">
                  <span>Current: <strong>{stats.tier}</strong></span>
                  <span>
                    Next: <strong>{stats.nextTier}</strong> (Need {Math.max(0, stats.targetPoints - stats.rewardPoints)} more pts)
                  </span>
                </div>
                <div className="tier-progress-bar-track">
                  <div
                    className="tier-progress-bar-fill"
                    style={{ width: `${stats.tierProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="tier-maxed-banner">
                <Sparkles size={16} className="text-accent" />
                <span>You've achieved top-tier <strong>Platinum VIP</strong> benefits with maximum discount rewards!</span>
              </div>
            )}

            {/* How to Earn Accordion / Info Toggle */}
            <div className="rewards-info-footer">
              <button
                type="button"
                className="rewards-info-toggle-btn"
                onClick={() => setShowRewardsInfo(!showRewardsInfo)}
              >
                <Info size={15} />
                <span>{showRewardsInfo ? 'Hide Rewards Policy' : 'How Do Reward Points Work?'}</span>
              </button>

              {showRewardsInfo && (
                <div className="rewards-rules-box">
                  <div className="reward-rule-item">
                    <span className="rule-bullet">📦</span>
                    <span><strong>50 Points</strong> automatically earned on every placed order</span>
                  </div>
                  <div className="reward-rule-item">
                    <span className="rule-bullet">💳</span>
                    <span><strong>1 Point</strong> earned for every <strong>₹100</strong> spent</span>
                  </div>
                  <div className="reward-rule-item">
                    <span className="rule-bullet">⚡</span>
                    <span><strong>10 Points = ₹1</strong> instant coupon deduction at checkout</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3. Orders Filter & Search Toolbar */}
          <div className="orders-toolbar card">
            {/* Status Filter Pills */}
            <div className="order-filter-pills">
              <button
                type="button"
                className={`order-filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                <span>All Orders ({stats.totalCount})</span>
              </button>

              <button
                type="button"
                className={`order-filter-btn ${statusFilter === 'active' ? 'active' : ''}`}
                onClick={() => setStatusFilter('active')}
              >
                <Truck size={14} />
                <span>Active ({stats.activeCount})</span>
              </button>

              <button
                type="button"
                className={`order-filter-btn ${statusFilter === 'delivered' ? 'active' : ''}`}
                onClick={() => setStatusFilter('delivered')}
              >
                <CheckCircle2 size={14} />
                <span>Delivered ({stats.deliveredCount})</span>
              </button>

              <button
                type="button"
                className={`order-filter-btn ${statusFilter === 'cancelled' ? 'active' : ''}`}
                onClick={() => setStatusFilter('cancelled')}
              >
                <XCircle size={14} />
                <span>Cancelled ({stats.cancelledCount})</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="order-search-box">
              <Search size={16} className="order-search-icon" />
              <input
                type="text"
                placeholder="Search by Order ID or item..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="order-search-clear"
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* 4. Orders List Display */}
          {filteredOrders.length === 0 ? (
            <div className="empty-state-box card">
              <Package size={52} className="empty-icon text-muted" />
              <h3>No matching orders found</h3>
              <p>
                {searchQuery || statusFilter !== 'all'
                  ? 'No orders match your current filters. Try changing or clearing filters.'
                  : "You haven't placed any orders yet. Discover our latest products and start shopping."}
              </p>
              {searchQuery || statusFilter !== 'all' ? (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setStatusFilter('all');
                    setSearchQuery('');
                  }}
                  style={{ marginTop: '14px' }}
                >
                  <RotateCcw size={15} />
                  <span>Reset Filters</span>
                </button>
              ) : (
                <Link to="/products" className="btn btn-primary" style={{ marginTop: '14px' }}>
                  <span>Explore Catalog</span>
                  <ArrowRight size={16} />
                </Link>
              )}
            </div>
          ) : (
            <div className="orders-list">
              {filteredOrders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onCancel={handleCancelOrder}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Orders;
