import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight } from 'lucide-react';

const OrderSuccess = () => {
  const location = useLocation();
  const order = location.state?.order;

  if (!order) {
    return <Navigate to="/orders" replace />;
  }

  const { _id, totalAmount, paymentMethod, orderStatus, shippingAddress } = order;

  return (
    <div className="order-success-page container">
      <div className="order-success-card card">
        <div className="success-icon-wrap">
          <CheckCircle2 size={64} className="success-check-icon" />
        </div>

        <h1 className="success-title">Order Confirmed!</h1>
        <p className="success-subtitle">
          Thank you for your purchase. Your order has been registered in MongoDB and inventory has been deducted.
        </p>

        <div className="success-order-box">
          <div className="success-box-row">
            <span>Order Reference:</span>
            <strong>#{_id.toUpperCase()}</strong>
          </div>
          <div className="success-box-row">
            <span>Current Status:</span>
            <span className="badge badge-primary">{orderStatus}</span>
          </div>
          <div className="success-box-row">
            <span>Total Amount:</span>
            <strong className="text-primary">₹{Number(totalAmount).toLocaleString('en-IN')}</strong>
          </div>
          <div className="success-box-row">
            <span>Payment Method:</span>
            <span>{paymentMethod}</span>
          </div>
          {shippingAddress && (
            <div className="success-box-row">
              <span>Delivering to:</span>
              <span>
                {shippingAddress.street}, {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.postalCode}
              </span>
            </div>
          )}
        </div>

        <div className="success-actions">
          <Link to={`/orders/${_id}`} className="btn btn-primary btn-lg">
            <Package size={18} />
            <span>Track Order Details</span>
          </Link>
          <Link to="/products" className="btn btn-outline btn-lg">
            <span>Continue Shopping</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
