import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import orderService from '../../services/orderService';
import adminService from '../../services/adminService';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import {
  ArrowLeft,
  User,
  MapPin,
  CreditCard,
  Save,
  Check,
  Calendar,
  PackageCheck
} from 'lucide-react';

const STATUS_OPTIONS = [
  'Placed',
  'Confirmed',
  'Processing',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
];

const AdminOrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch single order details using actual backend response: GET /api/orders/:id
  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await orderService.getOrderById(id);
      if (res.success && res.data) {
        setOrder(res.data);
        setSelectedStatus(res.data.orderStatus);
      } else {
        setError('Order not found on server');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // Update order status via existing backend API: PUT /api/admin/orders/:id/status
  // After updating -> Backend -> MongoDB -> Refresh Order
  const handleUpdateStatus = async () => {
    try {
      setUpdating(true);
      setSuccessMsg('');
      const res = await adminService.updateOrderStatus(id, selectedStatus);
      if (res.success) {
        // Refresh order from backend/MongoDB
        await fetchOrder();
        setSuccessMsg(`Order status successfully updated to '${selectedStatus}'`);
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <Loading message="Loading order details from MongoDB..." />;

  if (error) {
    return (
      <div className="admin-page">
        <ErrorMessage message={error} />
        <Link to="/admin/orders" className="btn btn-primary" style={{ marginTop: '16px' }}>
          Back to Orders
        </Link>
      </div>
    );
  }

  if (!order) return null;

  const {
    _id,
    orderStatus,
    paymentStatus,
    paymentMethod,
    totalAmount,
    createdAt,
    shippingAddress,
    user,
    items = [],
    paymentDetails,
  } = order;

  // Calculate subtotal from products
  const calculatedSubtotal = items.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );

  return (
    <div className="admin-page">
      <Link to="/admin/orders" className="back-link">
        <ArrowLeft size={16} />
        <span>Back to All Orders</span>
      </Link>

      <div className="admin-page-header">
        <div>
          {/* Display Order ID */}
          <h1 className="admin-title">Order #{_id.toUpperCase()}</h1>
          {/* Display Order Date */}
          <p className="admin-subtitle" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={15} />
            <span>Order Date: {new Date(createdAt).toLocaleString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}</span>
          </p>
        </div>

        {/* Update Order Status Header Panel */}
        <div className="admin-order-status-panel">
          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginRight: '6px' }}>
            Update Status:
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="form-control"
            style={{ minWidth: '170px' }}
          >
            {STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
          <button
            onClick={handleUpdateStatus}
            disabled={updating || selectedStatus === orderStatus}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Save size={16} />
            <span>{updating ? 'Updating...' : 'Save Status'}</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="alert-success" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="admin-order-details-grid">
        {/* Left Column: Products, Quantity, Price, Subtotal, Total */}
        <div className="admin-order-items-col card">
          <h3 className="section-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PackageCheck size={18} className="text-primary" />
            <span>Ordered Products ({items.length})</span>
          </h3>

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => {
                  const itemSubtotal = Number(item.price || 0) * Number(item.quantity || 1);
                  return (
                    <tr key={item._id || index}>
                      {/* Product */}
                      <td>
                        <div className="table-product-cell">
                          <img
                            src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                            alt={item.name}
                            className="table-thumbnail"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100';
                            }}
                          />
                          <div>
                            <strong>{item.name}</strong>
                            {item.variant?.title && (
                              <small className="text-muted block">
                                Variant: {item.variant.title}
                              </small>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Quantity */}
                      <td>
                        <span className="badge badge-info">{item.quantity}</span>
                      </td>

                      {/* Price */}
                      <td>
                        ₹{Number(item.price).toLocaleString('en-IN')}
                      </td>

                      {/* Subtotal */}
                      <td>
                        <strong>₹{itemSubtotal.toLocaleString('en-IN')}</strong>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pricing Summary: Subtotal, Total */}
          <div className="summary-divider" style={{ margin: '20px 0', borderTop: '1px solid rgba(255,255,255,0.08)' }}></div>
          <div className="order-total-summary">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#94a3b8' }}>
              <span>Items Subtotal:</span>
              <span>₹{calculatedSubtotal.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#94a3b8' }}>
              <span>Shipping & Taxes:</span>
              <span className="text-success">Free Delivery</span>
            </div>
            <div
              className="summary-row total-row"
              style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}
            >
              <span>Total Amount:</span>
              <span className="total-val text-primary">₹{Number(totalAmount).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Customer Information, Shipping Address, Payment Method, Payment Status, Order Status */}
        <div className="admin-order-meta-col">
          {/* Order Lifecycle Status Card */}
          <div className="card">
            <div className="card-section-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <PackageCheck size={18} className="text-primary" />
              <h3 style={{ margin: 0, fontSize: '1.05rem' }}>Order Status</h3>
            </div>
            <div>
              <span className={`badge badge-lg ${orderStatus === 'Delivered' ? 'badge-success' : orderStatus === 'Cancelled' ? 'badge-danger' : 'badge-primary'}`} style={{ fontSize: '1rem', padding: '6px 14px' }}>
                {orderStatus}
              </span>
            </div>
          </div>

          {/* Customer Information Card */}
          <div className="card">
            <div className="card-section-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <User size={18} className="text-primary" />
              <h3 style={{ margin: 0, fontSize: '1.05rem' }}>Customer Information</h3>
            </div>
            <div className="customer-info-box" style={{ lineHeight: '1.8' }}>
              <p><strong>Name:</strong> {user?.name || 'Customer'}</p>
              <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
              <p><strong>Phone:</strong> {user?.phone || shippingAddress?.phone || 'Not provided'}</p>
            </div>
          </div>

          {/* Shipping Address Card */}
          <div className="card">
            <div className="card-section-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <MapPin size={18} className="text-primary" />
              <h3 style={{ margin: 0, fontSize: '1.05rem' }}>Shipping Address</h3>
            </div>
            {shippingAddress ? (
              <div className="address-display" style={{ lineHeight: '1.8' }}>
                <p><strong>{shippingAddress.street}</strong></p>
                <p>{shippingAddress.city}, {shippingAddress.state} - {shippingAddress.postalCode}</p>
                <p>{shippingAddress.country || 'India'}</p>
                {shippingAddress.phone && <p>Contact: {shippingAddress.phone}</p>}
              </div>
            ) : (
              <p className="text-muted">No address provided</p>
            )}
          </div>

          {/* Payment Method & Status Card */}
          <div className="card">
            <div className="card-section-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <CreditCard size={18} className="text-primary" />
              <h3 style={{ margin: 0, fontSize: '1.05rem' }}>Payment Information</h3>
            </div>
            <div className="payment-display" style={{ lineHeight: '1.8' }}>
              <p>Payment Method: <strong>{paymentMethod || 'Cash On Delivery'}</strong></p>
              <p>
                Payment Status:{' '}
                <span className={`badge ${paymentStatus === 'Completed' ? 'badge-success' : paymentStatus === 'Failed' ? 'badge-danger' : 'badge-warning'}`}>
                  {paymentStatus}
                </span>
              </p>
              {paymentDetails?.transactionId && (
                <p>
                  Txn ID: <code>{paymentDetails.transactionId}</code>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetails;
