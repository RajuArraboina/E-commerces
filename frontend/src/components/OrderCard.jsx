import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Calendar, ChevronRight, Truck, ChevronDown, ChevronUp } from 'lucide-react';
import OrderTrackerWidget from './home/OrderTrackerWidget';

const OrderCard = ({ order, onCancel, defaultTrackOpen = false }) => {
  const [showTracker, setShowTracker] = useState(defaultTrackOpen);

  if (!order) return null;

  const {
    _id,
    orderStatus,
    paymentStatus,
    paymentMethod,
    totalAmount,
    createdAt,
    items = [],
  } = order;

  const canCancel = orderStatus === 'Placed' || orderStatus === 'Confirmed';
  const formattedDate = new Date(createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Delivered':
        return 'badge-success';
      case 'Cancelled':
        return 'badge-danger';
      case 'Shipped':
      case 'Out for Delivery':
        return 'badge-info';
      case 'Processing':
      case 'Confirmed':
        return 'badge-primary';
      default:
        return 'badge-warning';
    }
  };

  return (
    <div className="order-card card">
      <div className="order-card-header">
        <div className="order-header-info">
          <div className="order-id-row">
            <Package size={18} className="text-primary" />
            <span className="order-id">Order #{_id.slice(-8).toUpperCase()}</span>
            <span className={`badge ${getStatusBadgeClass(orderStatus)}`}>{orderStatus}</span>
          </div>
          <div className="order-meta-text">
            <Calendar size={14} />
            <span>Placed on {formattedDate}</span>
          </div>
        </div>

        <div className="order-header-price">
          <span className="order-total-label">Total Amount</span>
          <span className="order-total-val">₹{Number(totalAmount).toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Items Preview */}
      <div className="order-items-preview">
        {items.map((item, index) => (
          <div key={item._id || index} className="order-preview-item">
            <img
              src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
              alt={item.name}
              className="preview-img"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100';
              }}
            />
            <div className="preview-details">
              <span className="preview-name">{item.name}</span>
              <span className="preview-qty">
                Qty: {item.quantity} × ₹{Number(item.price).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="order-card-footer">
        <div className="order-payment-info">
          <span>
            Payment: <strong>{paymentMethod}</strong> ({paymentStatus})
          </span>
        </div>

        <div className="order-card-actions">
          {canCancel && onCancel && (
            <button
              onClick={() => onCancel(_id)}
              className="btn btn-outline-danger btn-sm"
            >
              Cancel Order
            </button>
          )}

          {/* Dedicated Track Order Option */}
          <button
            type="button"
            onClick={() => setShowTracker((prev) => !prev)}
            className={`btn btn-sm ${showTracker ? 'btn-primary' : 'btn-outline-primary'} track-order-btn`}
            title="Track live delivery progress"
          >
            <Truck size={14} />
            <span>{showTracker ? 'Hide Tracking' : 'Track Order'}</span>
            {showTracker ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          <Link to={`/orders/${_id}`} className="btn btn-outline btn-sm view-details-btn">
            <span>View Details</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      {/* Expandable Order Tracking Panel */}
      {showTracker && (
        <div className="order-card-tracking-expanded">
          <OrderTrackerWidget
            order={order}
            isInline={true}
            onClose={() => setShowTracker(false)}
            showDetailsLink={false}
          />
        </div>
      )}
    </div>
  );
};

export default OrderCard;
