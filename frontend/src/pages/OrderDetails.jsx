import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import orderService from '../services/orderService';
import OrderStatus from '../components/OrderStatus';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import {
  Calendar,
  MapPin,
  CreditCard,
  ChevronLeft,
  XCircle,
  CheckCircle2
} from 'lucide-react';

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await orderService.getOrderById(id);
      if (res.success && res.data) {
        setOrder(res.data);
      } else {
        setError('Order not found');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleCancel = async () => {
    if (window.confirm('Cancel this order? All items will be restocked.')) {
      try {
        setActionLoading(true);
        await orderService.cancelOrder(id);
        alert('Order has been cancelled.');
        fetchOrder();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to cancel order');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleSimulatePayment = async () => {
    try {
      setActionLoading(true);
      await orderService.payOrder(id, order.paymentMethod);
      alert('Payment simulated successfully!');
      fetchOrder();
    } catch (err) {
      alert(err.response?.data?.message || 'Payment simulation failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Loading message="Retrieving order and tracking status..." />;
  if (error) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <ErrorMessage message={error} />
        <Link to="/orders" className="btn btn-primary" style={{ marginTop: '20px' }}>
          Back to My Orders
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
    items = [],
    paymentDetails,
  } = order;

  const canCancel = orderStatus === 'Placed' || orderStatus === 'Confirmed';
  const canSimulatePay = paymentStatus === 'Pending' && orderStatus !== 'Cancelled';

  const formattedDate = new Date(createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="order-details-page container">
      <Link to="/orders" className="back-link">
        <ChevronLeft size={16} />
        <span>Back to Orders List</span>
      </Link>

      <div className="order-details-header">
        <div>
          <div className="order-id-badge-row">
            <h1 className="page-title">Order #{_id.toUpperCase()}</h1>
            <span className="badge badge-primary">{orderStatus}</span>
          </div>
          <div className="order-meta-text">
            <Calendar size={14} />
            <span>Placed on {formattedDate}</span>
          </div>
        </div>

        {canCancel && (
          <button
            onClick={handleCancel}
            disabled={actionLoading}
            className="btn btn-outline-danger"
          >
            <XCircle size={16} />
            <span>Cancel Order</span>
          </button>
        )}
      </div>

      {/* Visual Tracking Stepper */}
      <div className="tracking-section card">
        <h3 className="section-card-title">Delivery Status Tracker</h3>
        <OrderStatus status={orderStatus} />
      </div>

      <div className="order-details-grid">
        {/* Left: Items list */}
        <div className="order-details-items-col">
          <div className="card">
            <h3 className="section-card-title">Ordered Items ({items.length})</h3>

            <div className="details-items-list">
              {items.map((item, idx) => (
                <div key={item._id || idx} className="details-item-row">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150'}
                    alt={item.name}
                    className="details-item-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150';
                    }}
                  />

                  <div className="details-item-content">
                    <h4 className="item-name">{item.name}</h4>
                    {item.variant?.title && (
                      <span className="item-variant-tag">Variant: {item.variant.title}</span>
                    )}
                    <span className="item-qty-price">
                      {item.quantity} × ₹{Number(item.price).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="details-item-subtotal">
                    ₹{Number(item.price * item.quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>

            <div className="summary-divider"></div>

            <div className="order-total-summary">
              <div className="summary-row total-row">
                <span>Total Amount</span>
                <span className="total-val">₹{Number(totalAmount).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Shipping & Payment Summary */}
        <div className="order-details-meta-col">
          {/* Shipping Address */}
          <div className="card">
            <div className="card-section-header">
              <MapPin size={18} className="text-primary" />
              <h3>Shipping Address</h3>
            </div>
            {shippingAddress ? (
              <div className="address-display">
                <p><strong>{shippingAddress.street}</strong></p>
                <p>{shippingAddress.city}, {shippingAddress.state} - {shippingAddress.postalCode}</p>
                <p>{shippingAddress.country}</p>
                {shippingAddress.phone && <p>Phone: {shippingAddress.phone}</p>}
              </div>
            ) : (
              <p>No address recorded</p>
            )}
          </div>

          {/* Payment Status Card */}
          <div className="card">
            <div className="card-section-header">
              <CreditCard size={18} className="text-primary" />
              <h3>Payment Summary</h3>
            </div>
            <div className="payment-display">
              <div className="summary-row">
                <span>Method:</span>
                <strong>{paymentMethod}</strong>
              </div>
              <div className="summary-row">
                <span>Status:</span>
                <span className={`badge ${paymentStatus === 'Completed' ? 'badge-success' : 'badge-warning'}`}>
                  {paymentStatus}
                </span>
              </div>
              {paymentDetails?.transactionId && (
                <div className="summary-row">
                  <span>Transaction ID:</span>
                  <code>{paymentDetails.transactionId}</code>
                </div>
              )}

              {canSimulatePay && (
                <button
                  onClick={handleSimulatePayment}
                  disabled={actionLoading}
                  className="btn btn-outline btn-block"
                  style={{ marginTop: '15px' }}
                >
                  <CheckCircle2 size={16} />
                  <span>Simulate Payment Completion</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
