import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import orderService from '../services/orderService';
import aiService from '../services/aiService';
import ProductCard from '../components/ProductCard';
import Loading from '../components/Loading';
import {
  ShoppingBag,
  Heart,
  Clock,
  Sparkles,
  Bell,
  User as UserIcon,
  Package,
  CheckCircle,
  Truck,
  Award
} from 'lucide-react';

const UserDashboard = () => {
  const { user } = useAuth();
  const { wishlist, wishlistCount } = useWishlist();

  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [ordersRes, recRes] = await Promise.all([
          orderService.getMyOrders(),
          aiService.getRecommendations(),
        ]);

        if (ordersRes?.success) setOrders(ordersRes.data || []);
        if (recRes?.success && recRes.data) {
          setRecommendations(recRes.data.recommendedForYou || recRes.data.trending || []);
        }

        // Recently viewed
        const savedRecent = localStorage.getItem('shopsphere_recently_viewed');
        if (savedRecent) {
          try {
            setRecentlyViewed(JSON.parse(savedRecent));
          } catch {
            setRecentlyViewed([]);
          }
        }
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalOrdersCount = orders.length;
  const activeOrdersCount = orders.filter((o) =>
    ['Placed', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery'].includes(o.orderStatus)
  ).length;

  if (loading) return <Loading message="Loading your personal dashboard & recommendations..." />;

  return (
    <div className="dashboard-page container">
      {/* Dashboard Top Header */}
      <div className="admin-page-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="admin-title">My Dashboard</h1>
          <p className="admin-subtitle">
            Welcome back, <strong>{user?.name || 'Customer'}</strong>! Manage your orders, wishlist, and recommendations.
          </p>
        </div>
      </div>

      {/* Useful Cards Grid (Section 13) */}
      <div className="dashboard-stats-grid">
        <div className="metric-card card">
          <div className="metric-icon-wrap bg-primary-soft">
            <ShoppingBag size={22} className="text-primary" />
          </div>
          <div className="metric-data">
            <span className="metric-label">Total Orders</span>
            <span className="metric-value">{totalOrdersCount}</span>
            <small className="metric-extra">Lifetime purchases</small>
          </div>
        </div>

        <div className="metric-card card">
          <div className="metric-icon-wrap bg-info-soft">
            <Truck size={22} className="text-info" />
          </div>
          <div className="metric-data">
            <span className="metric-label">Active Orders</span>
            <span className="metric-value">{activeOrdersCount}</span>
            <small className="metric-extra">In transit / processing</small>
          </div>
        </div>

        <div className="metric-card card">
          <div className="metric-icon-wrap bg-accent-soft">
            <Heart size={22} className="text-accent" />
          </div>
          <div className="metric-data">
            <span className="metric-label">Wishlist Items</span>
            <span className="metric-value">{wishlistCount}</span>
            <small className="metric-extra">Saved favorites</small>
          </div>
        </div>

        <div className="metric-card card">
          <div className="metric-icon-wrap bg-warning-soft">
            <Award size={22} className="text-warning" />
          </div>
          <div className="metric-data">
            <span className="metric-label">Reward Points</span>
            <span className="metric-value">{totalOrdersCount * 50 + 100}</span>
            <small className="metric-extra">Silver Tier Member</small>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="dashboard-tabs-bar card" style={{ margin: '28px 0', padding: '12px' }}>
        <div className="tabs-row">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <Package size={16} />
            <span>Orders ({orders.length})</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === 'wishlist' ? 'active' : ''}`}
            onClick={() => setActiveTab('wishlist')}
          >
            <Heart size={16} />
            <span>Wishlist ({wishlistCount})</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === 'recent' ? 'active' : ''}`}
            onClick={() => setActiveTab('recent')}
          >
            <Clock size={16} />
            <span>Recently Viewed</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === 'recommendations' ? 'active' : ''}`}
            onClick={() => setActiveTab('recommendations')}
          >
            <Sparkles size={16} />
            <span>Recommendations</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell size={16} />
            <span>Notifications</span>
          </button>

          <Link to="/profile" className="tab-btn" style={{ marginLeft: 'auto' }}>
            <UserIcon size={16} />
            <span>Edit Profile</span>
          </Link>
        </div>
      </div>

      {/* Tab 1: Orders */}
      {activeTab === 'orders' && (
        <div className="dashboard-tab-content">
          {orders.length === 0 ? (
            <div className="card text-center" style={{ padding: '40px 20px' }}>
              <Package size={42} className="text-muted" style={{ margin: '0 auto 12px' }} />
              <h3>No orders placed yet.</h3>
              <p className="text-muted">Start exploring our AI-powered recommendations.</p>
              <Link to="/products" className="btn btn-primary" style={{ marginTop: '16px' }}>
                Explore Products
              </Link>
            </div>
          ) : (
            <div className="orders-list-stack">
              {orders.map((order) => (
                <div key={order._id} className="order-summary-box card" style={{ marginBottom: '16px', padding: '20px' }}>
                  <div className="order-summary-header">
                    <div>
                      <strong>Order #{order._id.slice(-8).toUpperCase()}</strong>
                      <span className="text-muted text-xs block">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span className="badge badge-primary">{order.orderStatus}</span>
                      <Link to={`/orders/${order._id}`} className="btn btn-outline btn-xs">
                        View Tracking
                      </Link>
                    </div>
                  </div>
                  <div className="order-items-snippet" style={{ marginTop: '12px' }}>
                    {order.items?.map((it, idx) => (
                      <span key={idx} className="item-pill">
                        {it.name} (x{it.quantity})
                      </span>
                    ))}
                  </div>
                  <div className="order-amount-row" style={{ marginTop: '12px', fontWeight: 700 }}>
                    Total: ₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Wishlist */}
      {activeTab === 'wishlist' && (
        <div className="dashboard-tab-content">
          {wishlist.length === 0 ? (
            <div className="card text-center" style={{ padding: '40px 20px' }}>
              <Heart size={42} className="text-muted" style={{ margin: '0 auto 12px' }} />
              <h3>Your wishlist is empty.</h3>
              <p className="text-muted">Click the heart icon on any product card to save your favorite items.</p>
              <Link to="/products" className="btn btn-primary" style={{ marginTop: '16px' }}>
                Discover Products
              </Link>
            </div>
          ) : (
            <div className="products-grid">
              {wishlist.map((prod) => (
                <ProductCard key={prod._id} product={prod} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Recently Viewed */}
      {activeTab === 'recent' && (
        <div className="dashboard-tab-content">
          {recentlyViewed.length === 0 ? (
            <div className="card text-center" style={{ padding: '40px 20px' }}>
              <Clock size={42} className="text-muted" style={{ margin: '0 auto 12px' }} />
              <h3>No recently viewed products.</h3>
              <p className="text-muted">Browse items in the store to keep track of your history.</p>
            </div>
          ) : (
            <div className="products-grid">
              {recentlyViewed.map((prod) => (
                <ProductCard key={prod._id} product={prod} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: AI Recommendations */}
      {activeTab === 'recommendations' && (
        <div className="dashboard-tab-content">
          <div className="badge-tag badge-tag-ai" style={{ marginBottom: '16px' }}>
            <Sparkles size={14} /> ✨ Curated Just For You
          </div>
          <div className="products-grid">
            {recommendations.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Notifications */}
      {activeTab === 'notifications' && (
        <div className="dashboard-tab-content card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>Your Notifications</h3>
          <div className="notifications-list">
            <div className="notification-item">
              <CheckCircle size={18} className="text-success" />
              <div>
                <strong>Welcome to EShop AI Commerce!</strong>
                <p className="text-muted text-sm">Experience natural language product search and instant shopping assistant support.</p>
              </div>
            </div>
            {orders.length > 0 && (
              <div className="notification-item" style={{ marginTop: '12px' }}>
                <Package size={18} className="text-primary" />
                <div>
                  <strong>Order Status Update</strong>
                  <p className="text-muted text-sm">Order #{orders[0]._id.slice(-8).toUpperCase()} is currently marked as {orders[0].orderStatus}.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
