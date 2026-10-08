import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
  MapPin,
  CreditCard,
  ShoppingBag,
  ExternalLink,
  XCircle,
  X,
} from 'lucide-react';
import orderService from '../../services/orderService';
import { useAuth } from '../../context/AuthContext';

const STATUS_STEPS = [
  { key: 'Confirmed', label: 'Confirmed' },
  { key: 'Processing', label: 'Packed' },
  { key: 'Shipped', label: 'Shipped' },
  { key: 'Out for Delivery', label: 'Out for Delivery' },
  { key: 'Delivered', label: 'Delivered' },
];

const getStepIndex = (status) => {
  const norm = (status || '').toLowerCase();
  if (norm.includes('delivered')) return 4;
  if (norm.includes('out') || norm.includes('delivery')) return 3;
  if (norm.includes('ship')) return 2;
  if (norm.includes('pack') || norm.includes('process')) return 1;
  return 0; // Confirmed / Placed
};

const getStatusMessage = (status) => {
  const s = (status || '').toLowerCase();
  if (s.includes('delivered')) {
    return 'Your order has been safely delivered! Thank you for shopping with EShop.';
  }
  if (s.includes('out') || s.includes('delivery')) {
    return 'Out for delivery! Your delivery executive is on the way to your address today.';
  }
  if (s.includes('ship')) {
    return 'Shipped! Your package is currently in transit with express carrier.';
  }
  if (s.includes('pack') || s.includes('process')) {
    return 'Packed & verified. Handing over to logistics courier partner for dispatch.';
  }
  if (s.includes('cancel')) {
    return 'This order has been cancelled. Any pre-paid payments are initiated for refund.';
  }
  return 'Order confirmed and verified. Preparing your items at fulfilment center.';
};

const OrderTrackerWidget = ({
  order: propOrder,
  isInline = false,
  onClose,
  showDetailsLink = true,
}) => {
  const { isAuthenticated } = useAuth();
  const [fetchedOrder, setFetchedOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (propOrder) return;
    if (!isAuthenticated) {
      setFetchedOrder(null);
      return;
    }

    const fetchLatestOrder = async () => {
      try {
        setLoading(true);
        const res = await orderService.getMyOrders();
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          const sorted = [...res.data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          const active = sorted.find((o) => o.orderStatus !== 'Cancelled') || sorted[0];
          setFetchedOrder(active);
        }
      } catch (err) {
        setFetchedOrder(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestOrder();
  }, [propOrder, isAuthenticated]);

  const activeOrder = propOrder || fetchedOrder;

  const estimatedDeliveryText = useMemo(() => {
    if (!activeOrder?.createdAt) return 'Within 2-3 Business Days';
    const d = new Date(activeOrder.createdAt);
    d.setDate(d.getDate() + 3);
    return d.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }, [activeOrder?.createdAt]);

  if (!propOrder && (!isAuthenticated || !activeOrder)) {
    return null;
  }

  if (!activeOrder) {
    return null;
  }

  const isCancelled = activeOrder.orderStatus === 'Cancelled';
  const currentStep = getStepIndex(activeOrder.orderStatus);
  const orderIdShort =
    activeOrder.orderNumber ||
    (activeOrder._id ? activeOrder._id.substring(activeOrder._id.length - 8).toUpperCase() : 'ORD');
  const items = activeOrder.items || activeOrder.orderItems || [];
  const totalItemCount = items.reduce((acc, item) => acc + (item.quantity || 1), 0);

  return (
    <div
      className={`order-tracker-banner ${isInline ? 'order-tracker-inline' : ''}`}
      aria-label="Order Tracking"
    >
      <div className="order-tracker-card card">
        {/* Top Header Row */}
        <div className="order-tracker-header">
          <div className="order-tracker-meta">
            <span className="order-tracker-badge">
              <Truck size={14} className="text-primary" />
              <span>{isInline ? 'Live Tracking Option' : propOrder ? 'Tracking Status' : 'Latest Order Tracking'}</span>
            </span>
            <h3 className="order-tracker-title">Order #{orderIdShort}</h3>
            <p className="order-tracker-date">
              Placed on{' '}
              {new Date(activeOrder.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
              {' • '}
              {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
              {' • '}₹{Number(activeOrder.totalAmount).toLocaleString('en-IN')}
            </p>
          </div>

          <div className="order-tracker-top-actions">
            {showDetailsLink && activeOrder._id && (
              <Link to={`/orders/${activeOrder._id}`} className="btn btn-outline-primary btn-sm order-track-link">
                <span>View Details</span>
                <ArrowRight size={14} />
              </Link>
            )}

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline btn-sm order-track-close-btn"
                title="Close tracking view"
              >
                <X size={15} />
                <span>Close</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Status Message Alert */}
        <div className={`order-live-status-alert ${isCancelled ? 'alert-cancelled' : ''}`}>
          {isCancelled ? (
            <XCircle size={18} className="text-danger" style={{ flexShrink: 0 }} />
          ) : (
            <div className="status-pulse-dot" />
          )}
          <span className="status-alert-text">{getStatusMessage(activeOrder.orderStatus)}</span>
        </div>

        {/* INSIDE THIS ORDER: Products Showcase */}
        {items.length > 0 && (
          <div className="inside-order-showcase">
            <div className="inside-order-header-row">
              <span className="inside-order-heading">
                <ShoppingBag size={15} className="text-accent" />
                <span>Items Inside This Order</span>
              </span>
              <span className="inside-order-count-badge">
                {items.length} {items.length === 1 ? 'product' : 'products'}
              </span>
            </div>

            <div className="inside-order-items-grid">
              {items.map((item, idx) => {
                const itemImage =
                  item.image ||
                  item.product?.image ||
                  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200';
                const itemName = item.name || item.product?.name || 'EShop Product';
                const productId = item.product?._id || item.product;

                return (
                  <div key={item._id || idx} className="inside-order-item-card">
                    <div className="inside-order-img-wrapper">
                      <img
                        src={itemImage}
                        alt={itemName}
                        className="inside-order-img"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200';
                        }}
                      />
                    </div>

                    <div className="inside-order-item-info">
                      <Link
                        to={productId ? `/products/${productId}` : `/orders/${activeOrder._id}`}
                        className="inside-order-item-title"
                        title={itemName}
                      >
                        {itemName}
                      </Link>

                      {/* Variant chips if any */}
                      <div className="inside-order-variants-row">
                        {item.variant?.title && (
                          <span className="inside-order-chip">{item.variant.title}</span>
                        )}
                        {item.variant?.color && (
                          <span className="inside-order-chip">Color: {item.variant.color}</span>
                        )}
                        {item.variant?.storage && (
                          <span className="inside-order-chip">{item.variant.storage}</span>
                        )}
                      </div>

                      <div className="inside-order-price-row">
                        <span className="inside-order-qty">
                          Qty: <strong>{item.quantity || 1}</strong>
                        </span>
                        <span className="inside-order-dot">•</span>
                        <span className="inside-order-price">
                          ₹{Number(item.price).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Delivery & Address Summary Strip */}
            <div className="inside-order-footer-strip">
              <div className="footer-summary-chip">
                <Truck size={15} className="text-primary" />
                <span>
                  Estimated Delivery: <strong>{estimatedDeliveryText}</strong>
                </span>
              </div>

              {activeOrder.shippingAddress?.city && (
                <div className="footer-summary-chip">
                  <MapPin size={15} className="text-accent" />
                  <span>
                    Delivering to:{' '}
                    <strong>
                      {activeOrder.shippingAddress.city}
                      {activeOrder.shippingAddress.postalCode ? `, ${activeOrder.shippingAddress.postalCode}` : ''}
                    </strong>
                  </span>
                </div>
              )}

              <div className="footer-summary-chip">
                <CreditCard size={15} className="text-success" />
                <span>
                  Total Amount: <strong>₹{Number(activeOrder.totalAmount).toLocaleString('en-IN')}</strong>{' '}
                  ({activeOrder.paymentMethod || 'Paid'})
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Visual Progress Stepper (Only for Non-Cancelled Orders) */}
        {!isCancelled ? (
          <div className="order-stepper-progress">
            {STATUS_STEPS.map((step, idx) => {
              const isCompleted = idx <= currentStep;
              const isCurrent = idx === currentStep;
              return (
                <div
                  key={step.key}
                  className={`stepper-node ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                >
                  <div className="stepper-bullet">
                    {isCompleted ? <CheckCircle2 size={16} /> : <span className="bullet-dot" />}
                  </div>
                  <span className="stepper-label">{step.label}</span>
                  {idx < STATUS_STEPS.length - 1 && (
                    <div className={`stepper-connector ${idx < currentStep ? 'filled' : ''}`} />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="order-cancelled-notice">
            <span>Order Cancelled — Stock has been automatically returned to catalog</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTrackerWidget;
