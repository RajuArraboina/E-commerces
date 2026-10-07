import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import {
  IndianRupee,
  ShoppingBag,
  Package,
  Users,
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  Archive,
  ClipboardList,
  Calendar,
  Check,
  TrendingUp,
  UserCheck,
  Info,
  RefreshCw,
  EyeOff
} from 'lucide-react';

const STATUS_COLORS = {
  Placed: '#f59e0b',
  Confirmed: '#3b82f6',
  Processing: '#8b5cf6',
  Shipped: '#06b6d4',
  'Out for Delivery': '#6366f1',
  Delivered: '#10b981',
  Cancelled: '#ef4444',
};

const AdminDashboard = () => {
  // Primary data states
  const [dashboardStats, setDashboardStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);

  // UI & loading states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Date Filter states: 'all' | 'today' | 'yesterday' | 'week' | 'month' | 'year' | 'custom'
  const [dateFilter, setDateFilter] = useState('month');
  const [customRange, setCustomRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  // Inline stock update state for Low Stock Alerts
  const [editingStockId, setEditingStockId] = useState(null);
  const [stockInputValue, setStockInputValue] = useState('');
  const [stockUpdateSuccess, setStockUpdateSuccess] = useState(null);

  // Chart hover point state
  const [hoveredChartPoint, setHoveredChartPoint] = useState(null);

  // Fetch live comprehensive data concurrently from MongoDB
  const fetchAllDashboardData = useCallback(async () => {
    try {
      setError(null);
      const [dashRes, ordersRes, productsRes, catsRes, usersRes] = await Promise.all([
        adminService.getDashboard(),
        adminService.getOrders({ limit: 100 }),
        productService.getProducts({ limit: 100 }),
        categoryService.getCategories(true),
        adminService.getUsers({ limit: 100 }),
      ]);

      if (dashRes?.success) setDashboardStats(dashRes.data);
      if (ordersRes?.success) setOrders(ordersRes.data || []);
      if (productsRes?.success) setProducts(productsRes.data || []);
      if (catsRes?.success) setCategories(catsRes.data || []);
      if (usersRes?.success) setUsers(usersRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard metrics from MongoDB');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAllDashboardData();
  }, [fetchAllDashboardData]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchAllDashboardData();
  };

  // 1. DATE FILTERING ENGINE
  const filteredOrders = useMemo(() => {
    if (!orders || orders.length === 0) return [];
    const now = new Date();

    return orders.filter((o) => {
      const orderDate = new Date(o.createdAt);
      if (isNaN(orderDate.getTime())) return true;

      switch (dateFilter) {
        case 'today': {
          const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          return orderDate >= startOfToday;
        }
        case 'yesterday': {
          const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
          const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          return orderDate >= startOfYesterday && orderDate < endOfYesterday;
        }
        case 'week': {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return orderDate >= sevenDaysAgo;
        }
        case 'month': {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          return orderDate >= startOfMonth;
        }
        case 'year': {
          const startOfYear = new Date(now.getFullYear(), 0, 1);
          return orderDate >= startOfYear;
        }
        case 'custom': {
          if (!customRange.startDate || !customRange.endDate) return true;
          const start = new Date(customRange.startDate + 'T00:00:00');
          const end = new Date(customRange.endDate + 'T23:59:59');
          return orderDate >= start && orderDate <= end;
        }
        case 'all':
        default:
          return true;
      }
    });
  }, [orders, dateFilter, customRange]);

  // 2. SALES ANALYTICS (Daily, Weekly, Monthly, Yearly)
  const salesAnalytics = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    let daily = 0;
    let weekly = 0;
    let monthly = 0;
    let yearly = 0;

    orders.forEach((o) => {
      // Exclude cancelled orders from revenue
      if (o.orderStatus === 'Cancelled') return;
      const orderDate = new Date(o.createdAt);
      const amount = Number(o.totalAmount || 0);

      if (orderDate >= startOfToday) daily += amount;
      if (orderDate >= sevenDaysAgo) weekly += amount;
      if (orderDate >= thirtyDaysAgo) monthly += amount;
      if (orderDate >= startOfYear) yearly += amount;
    });

    return { daily, weekly, monthly, yearly };
  }, [orders]);

  // 3. OVERVIEW METRICS (Live from MongoDB)
  const overviewMetrics = useMemo(() => {
    const backendData = dashboardStats || {};
    const totalSales = filteredOrders
      .filter((o) => o.orderStatus !== 'Cancelled')
      .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

    const totalOrders = filteredOrders.length;
    const totalProducts = products.length || backendData.products?.total || 0;
    const totalCustomers = users.filter((u) => u.role === 'customer').length || backendData.users?.customers || 0;
    const totalCategories = categories.length || backendData.categories?.total || 0;

    const pendingOrders = filteredOrders.filter((o) =>
      ['Placed', 'Confirmed', 'Processing'].includes(o.orderStatus)
    ).length;

    const deliveredOrders = filteredOrders.filter((o) => o.orderStatus === 'Delivered').length;
    const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= 5).length || backendData.products?.lowStockCount || 0;

    return {
      totalSales,
      totalOrders,
      totalProducts,
      totalCustomers,
      totalCategories,
      pendingOrders,
      deliveredOrders,
      lowStockProducts,
    };
  }, [dashboardStats, filteredOrders, products, users, categories]);

  // 4. ORDER STATUS BREAKDOWN
  const orderStatusBreakdown = useMemo(() => {
    const counts = {
      Placed: 0,
      Confirmed: 0,
      Processing: 0,
      Shipped: 0,
      'Out for Delivery': 0,
      Delivered: 0,
      Cancelled: 0,
    };

    filteredOrders.forEach((o) => {
      if (counts[o.orderStatus] !== undefined) {
        counts[o.orderStatus] += 1;
      }
    });

    const total = filteredOrders.length || 1;
    const percentages = {};
    Object.keys(counts).forEach((st) => {
      percentages[st] = ((counts[st] / total) * 100).toFixed(1);
    });

    return { counts, percentages, total: filteredOrders.length };
  }, [filteredOrders]);

  // 5. CATEGORY SALES & PRODUCT DISTRIBUTION
  const categoryAnalytics = useMemo(() => {
    const catMap = {};
    categories.forEach((cat) => {
      catMap[cat._id] = {
        name: cat.name,
        productsCount: 0,
        salesAmount: 0,
      };
    });

    // Count products per category
    products.forEach((p) => {
      const catId = typeof p.category === 'object' ? p.category?._id : p.category;
      if (catId && catMap[catId]) {
        catMap[catId].productsCount += 1;
      }
    });

    // Calculate sales per category from orders
    filteredOrders.forEach((o) => {
      if (o.orderStatus === 'Cancelled') return;
      (o.items || []).forEach((item) => {
        const matchingProduct = products.find((p) => p._id === item.product);
        if (matchingProduct) {
          const catId = typeof matchingProduct.category === 'object' ? matchingProduct.category?._id : matchingProduct.category;
          if (catId && catMap[catId]) {
            catMap[catId].salesAmount += Number(item.price || 0) * Number(item.quantity || 1);
          }
        }
      });
    });

    const list = Object.values(catMap);
    const maxSales = Math.max(...list.map((c) => c.salesAmount), 1);

    return {
      list,
      maxSales,
    };
  }, [categories, products, filteredOrders]);

  // 6. TOP-SELLING & OUT-OF-STOCK PRODUCTS
  const productAnalytics = useMemo(() => {
    const itemSalesMap = {};

    orders.forEach((o) => {
      if (o.orderStatus === 'Cancelled') return;
      (o.items || []).forEach((item) => {
        const id = item.product || item.name;
        if (!itemSalesMap[id]) {
          itemSalesMap[id] = {
            name: item.name,
            image: item.image,
            unitsSold: 0,
            revenue: 0,
          };
        }
        itemSalesMap[id].unitsSold += Number(item.quantity || 1);
        itemSalesMap[id].revenue += Number(item.price || 0) * Number(item.quantity || 1);
      });
    });

    const topSelling = Object.values(itemSalesMap)
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5);

    const outOfStock = products.filter((p) => p.stock === 0);
    const lowStockList = products.filter((p) => p.stock > 0 && p.stock <= 5);

    return {
      topSelling,
      outOfStockCount: outOfStock.length,
      outOfStockList: outOfStock,
      lowStockList,
    };
  }, [orders, products]);

  // 7. CUSTOMER ANALYTICS
  const customerAnalytics = useMemo(() => {
    const customers = users.filter((u) => u.role === 'customer');
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const newCustomers = customers.filter(
      (c) => c.createdAt && new Date(c.createdAt) >= thirtyDaysAgo
    ).length;

    // Top customers by order value
    const customerSpendMap = {};
    orders.forEach((o) => {
      if (o.orderStatus === 'Cancelled' || !o.user) return;
      const uid = o.user._id || o.user.email;
      if (!customerSpendMap[uid]) {
        customerSpendMap[uid] = {
          name: o.user.name || 'Customer',
          email: o.user.email || 'N/A',
          totalSpent: 0,
          orderCount: 0,
        };
      }
      customerSpendMap[uid].totalSpent += Number(o.totalAmount || 0);
      customerSpendMap[uid].orderCount += 1;
    });

    const topCustomers = Object.values(customerSpendMap)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);

    const growthRate =
      customers.length > 0 ? ((newCustomers / customers.length) * 100).toFixed(1) : 0;

    return {
      totalCustomers: customers.length,
      newCustomers,
      growthRate,
      topCustomers,
    };
  }, [users, orders]);

  // 8. RECENT CHRONOLOGICAL ACTIVITY FEED
  const recentActivities = useMemo(() => {
    const activities = [];

    // Order events
    orders.slice(0, 10).forEach((o) => {
      activities.push({
        id: `order_${o._id}`,
        type: 'order',
        title: `Order #${o._id.slice(-6).toUpperCase()} ${o.orderStatus}`,
        subtitle: `${o.user?.name || 'Customer'} · ₹${Number(o.totalAmount || 0).toLocaleString('en-IN')}`,
        date: new Date(o.createdAt || Date.now()),
        link: `/admin/orders/${o._id}`,
      });
    });

    // Customer registrations
    users.slice(0, 8).forEach((u) => {
      if (u.role === 'customer') {
        activities.push({
          id: `user_${u._id}`,
          type: 'customer',
          title: 'New Customer Registered',
          subtitle: `${u.name} (${u.email})`,
          date: new Date(u.createdAt || Date.now()),
          link: '/admin/customers',
        });
      }
    });

    // Product updates
    products.slice(0, 6).forEach((p) => {
      activities.push({
        id: `prod_${p._id}`,
        type: 'product',
        title: `Product in Catalog: ${p.name}`,
        subtitle: `${p.brand} · Stock: ${p.stock}`,
        date: new Date(p.updatedAt || p.createdAt || Date.now()),
        link: `/admin/products/edit/${p._id}`,
      });
    });

    return activities.sort((a, b) => b.date - a.date).slice(0, 7);
  }, [orders, users, products]);

  // Format relative time helper
  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  // 9. REVENUE TREND CHART DATA (SVG Points)
  const chartPoints = useMemo(() => {
    const validOrders = filteredOrders.filter((o) => o.orderStatus !== 'Cancelled');
    if (validOrders.length === 0) return [];

    // Group sales by date bucket
    const dateMap = {};
    validOrders.forEach((o) => {
      const d = new Date(o.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
      });
      dateMap[d] = (dateMap[d] || 0) + Number(o.totalAmount || 0);
    });

    const entries = Object.entries(dateMap);
    if (entries.length === 1) {
      // Add a baseline point if only 1 data point
      entries.unshift(['Start', 0]);
    }

    const maxVal = Math.max(...entries.map(([, v]) => v), 1000);
    const width = 800;
    const height = 180;
    const padding = 20;

    const points = entries.map(([label, val], idx) => {
      const x = padding + (idx / Math.max(1, entries.length - 1)) * (width - 2 * padding);
      const y = height - padding - (val / maxVal) * (height - 2 * padding);
      return { x, y, label, val };
    });

    const pathString = points.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x},${pt.y}`, '');
    const areaString = `${pathString} L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z`;

    return { points, pathString, areaString, maxVal, width, height };
  }, [filteredOrders]);

  // Quick Inline Stock Update Handler
  const handleInlineStockSave = async (productId) => {
    const parsed = Number(stockInputValue);
    if (isNaN(parsed) || parsed < 0) {
      alert('Please enter a valid non-negative number for stock.');
      return;
    }

    try {
      const res = await adminService.updateProductStock(productId, parsed);
      if (res.success) {
        setProducts((prev) =>
          prev.map((p) => (p._id === productId ? { ...p, stock: parsed, isAvailable: parsed > 0 } : p))
        );
        setStockUpdateSuccess(productId);
        setTimeout(() => setStockUpdateSuccess(null), 2500);
        setEditingStockId(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update stock');
    }
  };

  // ==========================================
  // DASHBOARD STATES RENDERING
  // ==========================================

  // Loading State
  if (loading) {
    return <Loading message="Loading MongoDB sales, orders, and inventory analytics..." />;
  }

  // API Error State
  if (error && !dashboardStats) {
    return (
      <div className="admin-page">
        <div className="admin-page-header">
          <h1 className="admin-title">Admin Dashboard</h1>
        </div>
        <ErrorMessage message={error} onRetry={fetchAllDashboardData} />
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* 1. Header with Notifications & Admin Profile */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-title">Admin Dashboard</h1>
          <p className="admin-subtitle">
            Comprehensive real-time telemetry, orders, and sales performance analytics
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="btn btn-outline btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Syncing...' : 'Sync Live Data'}</span>
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchAllDashboardData} />}

      {/* 2. Quick Actions Bar */}
      <div className="quick-actions-bar">
        <Link to="/admin/products/add" className="quick-action-btn btn-primary-action">
          <Plus size={16} />
          <span>Add Product</span>
        </Link>
        <Link to="/admin/categories" className="quick-action-btn">
          <Layers size={16} />
          <span>Add Category</span>
        </Link>
        <Link to="/admin/orders" className="quick-action-btn">
          <ClipboardList size={16} />
          <span>View Orders</span>
        </Link>
        <Link to="/admin/inventory" className="quick-action-btn">
          <Archive size={16} />
          <span>Manage Inventory</span>
        </Link>
      </div>

      {/* 3. Date Filters Bar */}
      <div className="dashboard-filter-header">
        <div className="filter-group-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <Calendar size={16} className="text-primary" />
            <span>Date Filter:</span>
          </div>

          <div className="date-pill-group">
            {[
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Yesterday' },
              { id: 'week', label: 'This Week' },
              { id: 'month', label: 'This Month' },
              { id: 'year', label: 'This Year' },
              { id: 'all', label: 'All Time' },
              { id: 'custom', label: 'Custom Range' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setDateFilter(f.id)}
                className={`date-pill ${dateFilter === f.id ? 'active' : ''}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Date Range Picker */}
        {dateFilter === 'custom' && (
          <div className="custom-date-inputs">
            <input
              type="date"
              value={customRange.startDate}
              onChange={(e) => setCustomRange({ ...customRange, startDate: e.target.value })}
              className="custom-date-input"
            />
            <span style={{ color: 'var(--text-muted)' }}>to</span>
            <input
              type="date"
              value={customRange.endDate}
              onChange={(e) => setCustomRange({ ...customRange, endDate: e.target.value })}
              className="custom-date-input"
            />
          </div>
        )}
      </div>

      {/* 4. 8 Dynamic Overview Cards */}
      <div className="metrics-grid">
        {/* Total Sales */}
        <div className="metric-card card">
          <div className="metric-icon-wrap bg-accent-soft">
            <IndianRupee size={22} className="text-accent" />
          </div>
          <div className="metric-data">
            <span className="metric-label">Total Sales</span>
            <span className="metric-value">
              ₹{Number(overviewMetrics.totalSales).toLocaleString('en-IN')}
            </span>
            <small className="metric-extra">Filtered period revenue</small>
          </div>
        </div>

        {/* Total Orders */}
        <div className="metric-card card">
          <div className="metric-icon-wrap bg-warning-soft">
            <ShoppingBag size={22} className="text-warning" />
          </div>
          <div className="metric-data">
            <span className="metric-label">Total Orders</span>
            <span className="metric-value">{overviewMetrics.totalOrders}</span>
            <small className="metric-extra">{orders.length} all-time orders</small>
          </div>
        </div>

        {/* Total Products */}
        <div className="metric-card card">
          <div className="metric-icon-wrap bg-success-soft">
            <Package size={22} className="text-success" />
          </div>
          <div className="metric-data">
            <span className="metric-label">Total Products</span>
            <span className="metric-value">{overviewMetrics.totalProducts}</span>
            <small className="metric-extra">
              {productAnalytics.outOfStockCount > 0 ? (
                <span className="text-danger">{productAnalytics.outOfStockCount} out of stock</span>
              ) : (
                <span className="text-success">In stock catalog</span>
              )}
            </small>
          </div>
        </div>

        {/* Total Customers */}
        <div className="metric-card card">
          <div className="metric-icon-wrap bg-primary-soft">
            <Users size={22} className="text-primary" />
          </div>
          <div className="metric-data">
            <span className="metric-label">Total Customers</span>
            <span className="metric-value">{overviewMetrics.totalCustomers}</span>
            <small className="metric-extra">+{customerAnalytics.newCustomers} new this month</small>
          </div>
        </div>

        {/* Total Categories */}
        <div className="metric-card card">
          <div className="metric-icon-wrap bg-info-soft">
            <Layers size={22} className="text-info" />
          </div>
          <div className="metric-data">
            <span className="metric-label">Total Categories</span>
            <span className="metric-value">{overviewMetrics.totalCategories}</span>
            <small className="metric-extra">Taxonomy collections</small>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="metric-card card">
          <div className="metric-icon-wrap bg-warning-soft">
            <Clock size={22} className="text-warning" />
          </div>
          <div className="metric-data">
            <span className="metric-label">Pending Orders</span>
            <span className="metric-value">{overviewMetrics.pendingOrders}</span>
            <small className="metric-extra">Placed / In Processing</small>
          </div>
        </div>

        {/* Delivered Orders */}
        <div className="metric-card card">
          <div className="metric-icon-wrap bg-success-soft">
            <CheckCircle2 size={22} className="text-success" />
          </div>
          <div className="metric-data">
            <span className="metric-label">Delivered Orders</span>
            <span className="metric-value">{overviewMetrics.deliveredOrders}</span>
            <small className="metric-extra">Completed fulfillment</small>
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="metric-card card">
          <div className="metric-icon-wrap bg-danger-soft">
            <AlertTriangle size={22} className="text-danger" />
          </div>
          <div className="metric-data">
            <span className="metric-label">Low Stock Products</span>
            <span className="metric-value">{overviewMetrics.lowStockProducts}</span>
            <small className="metric-extra">&le; 5 units left</small>
          </div>
        </div>
      </div>

      {/* 5. Sales Analytics & Interactive Revenue Trend Chart */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="section-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={20} className="text-accent" />
              <span>Sales Analytics & Revenue Overview</span>
            </h3>
            <p className="text-muted" style={{ fontSize: '0.84rem', margin: '4px 0 0' }}>
              Dynamic revenue trends calculated across all non-cancelled orders
            </p>
          </div>
          <span className="badge badge-primary">Currency: INR (₹)</span>
        </div>

        {/* Sales Submetrics: Daily, Weekly, Monthly, Yearly */}
        <div className="sales-submetrics-grid">
          <div className="sales-submetric-card">
            <div className="sales-submetric-label">Daily Sales (Today)</div>
            <div className="sales-submetric-val text-primary">
              ₹{salesAnalytics.daily.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="sales-submetric-card">
            <div className="sales-submetric-label">Weekly Sales (7 Days)</div>
            <div className="sales-submetric-val text-info">
              ₹{salesAnalytics.weekly.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="sales-submetric-card">
            <div className="sales-submetric-label">Monthly Sales (30 Days)</div>
            <div className="sales-submetric-val text-accent">
              ₹{salesAnalytics.monthly.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="sales-submetric-card">
            <div className="sales-submetric-label">Yearly Sales (Current Year)</div>
            <div className="sales-submetric-val text-success">
              ₹{salesAnalytics.yearly.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Revenue Trend SVG Chart */}
        {chartPoints.points && chartPoints.points.length > 0 ? (
          <div className="chart-container-box">
            <svg
              viewBox={`0 0 ${chartPoints.width} ${chartPoints.height}`}
              className="chart-svg"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="20" y1="30" x2="780" y2="30" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
              <line x1="20" y1="90" x2="780" y2="90" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
              <line x1="20" y1="150" x2="780" y2="150" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />

              {/* Area & Line */}
              <path d={chartPoints.areaString} fill="url(#salesGrad)" />
              <path d={chartPoints.pathString} fill="none" stroke="#6366f1" strokeWidth="3" />

              {/* Interactive Data Points */}
              {chartPoints.points.map((pt, i) => (
                <circle
                  key={i}
                  cx={pt.x}
                  cy={pt.y}
                  r="5"
                  fill="#fff"
                  stroke="#6366f1"
                  strokeWidth="2.5"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredChartPoint(pt)}
                  onMouseLeave={() => setHoveredChartPoint(null)}
                />
              ))}
            </svg>

            {/* Hover Tooltip */}
            {hoveredChartPoint && (
              <div className="chart-tooltip">
                <strong>{hoveredChartPoint.label}:</strong> ₹{Number(hoveredChartPoint.val).toLocaleString('en-IN')}
              </div>
            )}
          </div>
        ) : (
          <div className="dashboard-empty-box">
            <IndianRupee size={32} style={{ margin: '0 auto 8px', color: 'var(--text-muted)' }} />
            <p>No sales data recorded for the selected date filter range.</p>
          </div>
        )}
      </div>

      {/* 6. Order Analytics & Category Analytics (2 Columns matching diagram) */}
      <div className="dashboard-two-col">
        {/* Left: Order Status Chart & Distribution */}
        <div className="card">
          <div className="section-card-header" style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ClipboardList size={18} className="text-warning" />
              <span>Order Analytics & Status Distribution</span>
            </h3>
            <p className="text-muted" style={{ fontSize: '0.82rem', margin: '4px 0 0' }}>
              Total {orderStatusBreakdown.total} orders breakdown
            </p>
          </div>

          {orderStatusBreakdown.total === 0 ? (
            <div className="dashboard-empty-box">
              <ShoppingBag size={32} style={{ margin: '0 auto 8px' }} />
              <p>No orders recorded in this date range.</p>
            </div>
          ) : (
            <>
              {/* Segmented Color Bar */}
              <div className="order-status-dist-bar">
                {Object.entries(orderStatusBreakdown.counts).map(([st, count]) => {
                  const pct = orderStatusBreakdown.percentages[st];
                  if (count === 0) return null;
                  return (
                    <div
                      key={st}
                      className="status-dist-segment"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: STATUS_COLORS[st] || '#6366f1',
                      }}
                      title={`${st}: ${count} (${pct}%)`}
                    />
                  );
                })}
              </div>

              {/* Status Legend Grid */}
              <div className="status-legend-list">
                {Object.entries(orderStatusBreakdown.counts).map(([st, count]) => (
                  <div key={st} className="status-legend-item">
                    <span
                      className="status-dot"
                      style={{ backgroundColor: STATUS_COLORS[st] || '#6366f1' }}
                    />
                    <div>
                      <strong style={{ fontSize: '0.88rem' }}>{st}</strong>
                      <span className="text-muted block" style={{ fontSize: '0.78rem' }}>
                        {count} ({orderStatusBreakdown.percentages[st]}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right: Category Analytics Chart */}
        <div className="card">
          <div className="section-card-header" style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} className="text-info" />
              <span>Category Analytics & Performance</span>
            </h3>
            <p className="text-muted" style={{ fontSize: '0.82rem', margin: '4px 0 0' }}>
              Products and sales distribution by taxonomy
            </p>
          </div>

          {categoryAnalytics.list.length === 0 ? (
            <div className="dashboard-empty-box">
              <Layers size={32} style={{ margin: '0 auto 8px' }} />
              <p>No categories found in MongoDB database.</p>
            </div>
          ) : (
            <div className="category-perf-list">
              {categoryAnalytics.list.map((cat, idx) => {
                const fillPct = Math.round((cat.salesAmount / categoryAnalytics.maxSales) * 100);
                return (
                  <div key={idx} className="category-perf-item">
                    <div className="category-perf-header">
                      <div>
                        <strong>{cat.name}</strong>
                        <span className="text-muted" style={{ fontSize: '0.8rem', marginLeft: '6px' }}>
                          ({cat.productsCount} products)
                        </span>
                      </div>
                      <span className="text-accent" style={{ fontWeight: 700 }}>
                        ₹{cat.salesAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="category-perf-bar-track">
                      <div
                        className="category-perf-bar-fill"
                        style={{ width: `${Math.max(8, fillPct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 7. Product & Customer Analytics (2 Columns) */}
      <div className="dashboard-two-col">
        {/* Top-Selling Products */}
        <div className="card">
          <div className="section-card-header" style={{ marginBottom: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={18} className="text-success" />
              <span>Top-Selling Products</span>
            </h3>
            <p className="text-muted" style={{ fontSize: '0.82rem', margin: '4px 0 0' }}>
              Highest volume catalog items by order count
            </p>
          </div>

          {productAnalytics.topSelling.length === 0 ? (
            <div className="dashboard-empty-box">
              <Package size={28} style={{ margin: '0 auto 8px' }} />
              <p>No product sales recorded yet.</p>
            </div>
          ) : (
            <div>
              {productAnalytics.topSelling.map((prod, idx) => (
                <div key={idx} className="ranked-item-row">
                  <div className="ranked-item-info">
                    <span className="ranked-badge-num">#{idx + 1}</span>
                    {prod.image && (
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="table-thumbnail"
                        style={{ width: '36px', height: '36px' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <div>
                      <strong>{prod.name}</strong>
                      <small className="text-muted block">{prod.unitsSold} units ordered</small>
                    </div>
                  </div>
                  <strong className="text-success">₹{prod.revenue.toLocaleString('en-IN')}</strong>
                </div>
              ))}
            </div>
          )}

          {/* Missing view tracking notice */}
          <div className="notice-pill-box">
            <EyeOff size={16} style={{ flexShrink: 0 }} />
            <span>
              <strong>Note:</strong> Most-viewed products metric requires page-view tracking counters in the schema. Order sales metrics above are live.
            </span>
          </div>
        </div>

        {/* Customer Analytics */}
        <div className="card">
          <div className="section-card-header" style={{ marginBottom: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck size={18} className="text-primary" />
              <span>Customer Growth & Top Spenders</span>
            </h3>
            <p className="text-muted" style={{ fontSize: '0.82rem', margin: '4px 0 0' }}>
              Client retention and customer acquisition
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>New Customers</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>
                {customerAnalytics.newCustomers}
              </div>
            </div>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Growth Rate</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)' }}>
                {customerAnalytics.growthRate}%
              </div>
            </div>
          </div>

          <h4 style={{ fontSize: '0.88rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Top Customers by Order Value
          </h4>

          {customerAnalytics.topCustomers.length === 0 ? (
            <div className="dashboard-empty-box" style={{ padding: '16px' }}>
              <p>No customer purchase histories found.</p>
            </div>
          ) : (
            <div>
              {customerAnalytics.topCustomers.map((cust, idx) => (
                <div key={idx} className="ranked-item-row">
                  <div className="ranked-item-info">
                    <span className="ranked-badge-num">#{idx + 1}</span>
                    <div>
                      <strong>{cust.name}</strong>
                      <small className="text-muted block">{cust.orderCount} order(s)</small>
                    </div>
                  </div>
                  <strong className="text-primary">₹{cust.totalSpent.toLocaleString('en-IN')}</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 8. Recent Orders (Matching ASCII diagram) */}
      <div className="admin-table-section card" style={{ marginBottom: '24px' }}>
        <div className="section-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Recent Orders</h3>
            <p className="text-muted" style={{ fontSize: '0.82rem', margin: '2px 0 0' }}>
              Latest customer purchases synchronized from MongoDB
            </p>
          </div>
          <Link to="/admin/orders" className="view-more-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span>View All Orders</span>
            <ArrowUpRight size={16} />
          </Link>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="dashboard-empty-box">
            <ClipboardList size={32} style={{ margin: '0 auto 8px' }} />
            <p>No orders found for the current date selection.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Payment Status</th>
                  <th>Order Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.slice(0, 6).map((ord) => (
                  <tr key={ord._id}>
                    <td>
                      <code>#{ord._id.slice(-8).toUpperCase()}</code>
                    </td>
                    <td>
                      <div className="customer-cell">
                        <strong>{ord.user?.name || 'Customer'}</strong>
                        <small className="text-muted block">{ord.user?.email}</small>
                      </div>
                    </td>
                    <td>
                      <strong>₹{Number(ord.totalAmount).toLocaleString('en-IN')}</strong>
                    </td>
                    <td>
                      <span
                        className={`badge ${ord.paymentStatus === 'Completed' ? 'badge-success' : ord.paymentStatus === 'Failed' ? 'badge-danger' : 'badge-warning'}`}
                      >
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: `${STATUS_COLORS[ord.orderStatus] || '#6366f1'}25`,
                          color: STATUS_COLORS[ord.orderStatus] || '#6366f1',
                          border: `1px solid ${STATUS_COLORS[ord.orderStatus] || '#6366f1'}50`,
                        }}
                      >
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td>
                      {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td>
                      <Link to={`/admin/orders/${ord._id}`} className="btn btn-outline btn-xs">
                        View Order
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 9. Low Stock Alert & Recent Activity (2 Columns matching diagram) */}
      <div className="dashboard-two-col">
        {/* Left: Low Stock Products Alert */}
        <div className="card">
          <div className="section-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} className="text-danger" />
              <span>Low Stock Inventory Alert</span>
            </h3>
            <Link to="/admin/inventory" className="btn btn-outline btn-xs">
              Manage All Stock
            </Link>
          </div>

          {productAnalytics.lowStockList.length === 0 && productAnalytics.outOfStockList.length === 0 ? (
            <div className="dashboard-empty-box" style={{ padding: '24px' }}>
              <CheckCircle2 size={32} className="text-success" style={{ margin: '0 auto 8px' }} />
              <p className="text-success">All products in MongoDB catalog are adequately stocked!</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Current Stock</th>
                    <th>Stock Status</th>
                    <th>Quick Update</th>
                  </tr>
                </thead>
                <tbody>
                  {[...productAnalytics.outOfStockList, ...productAnalytics.lowStockList].slice(0, 6).map((item) => (
                    <tr key={item._id}>
                      <td>
                        <div className="table-product-cell">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="table-thumbnail"
                              style={{ width: '32px', height: '32px' }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          )}
                          <strong style={{ fontSize: '0.86rem' }}>{item.name}</strong>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-primary">
                          {typeof item.category === 'object' ? item.category?.name : item.category || 'General'}
                        </span>
                      </td>
                      <td>
                        <strong>{item.stock}</strong> units
                      </td>
                      <td>
                        <span className={`badge ${item.stock === 0 ? 'badge-danger' : 'badge-warning'}`}>
                          {item.stock === 0 ? 'Out of Stock' : 'Low Stock'}
                        </span>
                      </td>
                      <td>
                        {editingStockId === item._id ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <input
                              type="number"
                              min="0"
                              value={stockInputValue}
                              onChange={(e) => setStockInputValue(e.target.value)}
                              className="form-control stock-input"
                              style={{ width: '60px', padding: '3px 6px' }}
                              autoFocus
                            />
                            <button
                              onClick={() => handleInlineStockSave(item._id)}
                              className="btn btn-primary btn-xs"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingStockId(null)}
                              className="btn btn-outline btn-xs"
                            >
                              X
                            </button>
                          </div>
                        ) : stockUpdateSuccess === item._id ? (
                          <span className="text-success" style={{ fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Check size={14} /> Updated
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingStockId(item._id);
                              setStockInputValue(item.stock.toString());
                            }}
                            className="btn btn-outline btn-xs"
                          >
                            Update
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: Recent Activity Feed */}
        <div className="card">
          <div className="section-card-header" style={{ marginBottom: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} className="text-primary" />
              <span>Recent Activity Feed</span>
            </h3>
            <p className="text-muted" style={{ fontSize: '0.82rem', margin: '4px 0 0' }}>
              Chronological log of orders, users, and catalog updates
            </p>
          </div>

          {recentActivities.length === 0 ? (
            <div className="dashboard-empty-box" style={{ padding: '24px' }}>
              <Info size={28} style={{ margin: '0 auto 8px' }} />
              <p>No recent activity events recorded.</p>
            </div>
          ) : (
            <div className="activity-feed-list">
              {recentActivities.map((act) => (
                <div key={act.id} className="activity-feed-item">
                  <div
                    className="activity-icon-bubble"
                    style={{
                      backgroundColor:
                        act.type === 'order'
                          ? 'rgba(245, 158, 11, 0.15)'
                          : act.type === 'customer'
                          ? 'rgba(99, 102, 241, 0.15)'
                          : 'rgba(16, 185, 129, 0.15)',
                      color:
                        act.type === 'order'
                          ? '#f59e0b'
                          : act.type === 'customer'
                          ? '#6366f1'
                          : '#10b981',
                    }}
                  >
                    {act.type === 'order' && <ShoppingBag size={16} />}
                    {act.type === 'customer' && <Users size={16} />}
                    {act.type === 'product' && <Package size={16} />}
                  </div>

                  <div className="activity-text-wrap">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span className="activity-title">{act.title}</span>
                      <span className="activity-time">{formatTimeAgo(act.date)}</span>
                    </div>
                    <div className="activity-subtitle">{act.subtitle}</div>
                    {act.link && (
                      <Link
                        to={act.link}
                        style={{ fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'underline', marginTop: '2px', display: 'inline-block' }}
                      >
                        Inspect &rarr;
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
