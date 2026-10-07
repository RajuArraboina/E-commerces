import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/orderService';
import userService from '../api/userService';
import ErrorMessage from '../components/ErrorMessage';
import { ShieldCheck, MapPin, CreditCard, Banknote, ArrowRight, Tag, BookmarkCheck, CheckCircle2, Loader2 } from 'lucide-react';

const Checkout = () => {
  const {
    cart,
    subtotal,
    fetchCart,
    appliedCoupon,
    discountAmount,
    removeCoupon
  } = useCart();
  const { user, updateUserState } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    postalCode: user?.address?.postalCode || '',
    country: user?.address?.country || 'India',
    phone: user?.phone || '',
  });

  const [savingAddress, setSavingAddress] = useState(false);
  const [addressSaveStatus, setAddressSaveStatus] = useState({ type: '', message: '' });

  // Sync address from profile once user is fetched from /api/auth/me
  useEffect(() => {
    if (user?.address) {
      setAddress((prev) => ({
        street: prev.street || user.address.street || '',
        city: prev.city || user.address.city || '',
        state: prev.state || user.address.state || '',
        postalCode: prev.postalCode || user.address.postalCode || '',
        country: prev.country || user.address.country || 'India',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user]);

  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [deliverySpeed, setDeliverySpeed] = useState('Standard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const shipping = deliverySpeed === 'Express' ? 99 : (subtotal >= 999 || subtotal === 0 ? 0 : 49);
  const grandTotal = Math.max(0, subtotal - discountAmount) + (subtotal > 0 ? shipping : 0);

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleSaveAddress = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setAddressSaveStatus({ type: '', message: '' });

    if (!address.street?.trim() || !address.city?.trim() || !address.state?.trim() || !address.postalCode?.trim()) {
      setAddressSaveStatus({
        type: 'error',
        message: 'Please provide Street, City, State, and Pincode before saving.',
      });
      return;
    }

    const sanitize = (str) => (str || '').replace(/[\r\n\t]+/g, ' ').trim();

    const payload = {
      address: {
        street: sanitize(address.street),
        city: sanitize(address.city),
        state: sanitize(address.state),
        postalCode: sanitize(address.postalCode),
        country: sanitize(address.country) || 'India',
      },
      phone: sanitize(address.phone),
    };

    try {
      setSavingAddress(true);
      const res = await userService.updateProfile(payload);
      if (res && (res.success || res.data)) {
        const updatedUser = res.data || res;
        if (updateUserState) {
          updateUserState(updatedUser);
        }
        setAddressSaveStatus({
          type: 'success',
          message: 'Address saved to your profile successfully!',
        });
        setTimeout(() => {
          setAddressSaveStatus((prev) => (prev.type === 'success' ? { type: '', message: '' } : prev));
        }, 4000);
      } else {
        throw new Error(res?.message || 'Failed to save address');
      }
    } catch (err) {
      setAddressSaveStatus({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Failed to save address to profile.',
      });
    } finally {
      setSavingAddress(false);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');

    if (!address.street || !address.city || !address.state || !address.postalCode) {
      setError('Please provide complete shipping address details (Street, City, State, Postal Code).');
      return;
    }

    if (!cart?.items || cart.items.length === 0) {
      setError('Your shopping cart is empty.');
      return;
    }

    const sanitize = (str) => (str || '').replace(/[\r\n\t]+/g, ' ').trim();

    const payload = {
      shippingAddress: {
        street: sanitize(address.street),
        city: sanitize(address.city),
        state: sanitize(address.state),
        postalCode: sanitize(address.postalCode),
        country: sanitize(address.country) || 'India',
        phone: sanitize(address.phone),
      },
      paymentMethod,
      couponCode: appliedCoupon?.code || undefined,
      discountAmount: discountAmount || 0,
    };

    try {
      setLoading(true);
      const res = await orderService.createOrder(payload);
      if (res.success && res.data) {
        if (appliedCoupon) {
          removeCoupon();
        }
        // Backend empties cart upon order placement - refresh local context
        await fetchCart();
        navigate('/order-success', { state: { order: res.data } });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2>No items in checkout</h2>
        <p>Please add products to your cart before proceeding.</p>
        <Link to="/products" className="btn btn-primary" style={{ marginTop: '15px' }}>
          Browse Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="checkout-page container">
      {/* 5-Step Progress Stepper (Section 11) */}
      <div className="checkout-stepper-wrap card">
        <div className="checkout-step completed">
          <span className="step-num">✓</span>
          <span className="step-label">1. Address</span>
        </div>
        <div className="stepper-connector active"></div>
        <div className="checkout-step active">
          <span className="step-num">2</span>
          <span className="step-label">2. Delivery</span>
        </div>
        <div className="stepper-connector active"></div>
        <div className="checkout-step active">
          <span className="step-num">3</span>
          <span className="step-label">3. Payment</span>
        </div>
        <div className="stepper-connector"></div>
        <div className="checkout-step">
          <span className="step-num">4</span>
          <span className="step-label">4. Review</span>
        </div>
        <div className="stepper-connector"></div>
        <div className="checkout-step">
          <span className="step-num">5</span>
          <span className="step-label">5. Confirmation</span>
        </div>
      </div>

      <h1 className="page-title">Checkout</h1>
      <p className="page-subtitle">Review shipping address, select delivery speed & payment method</p>

      {error && <ErrorMessage message={error} />}

      <form onSubmit={handlePlaceOrder} className="checkout-layout">
        {/* Left: Shipping Address & Payment Form */}
        <div className="checkout-form-col">
          {/* Section 1: Delivery Address */}
          <div className="checkout-card card">
            <div className="card-section-header">
              <MapPin size={20} className="text-primary" />
              <h3>1. Shipping Delivery Address</h3>
            </div>

            <div className="form-group">
              <label className="form-label">Street Address *</label>
              <input
                type="text"
                name="street"
                required
                placeholder="Flat / House No., Building Name, Street Road"
                value={address.street}
                onChange={handleAddressChange}
                className="form-control"
              />
            </div>

            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label">City *</label>
                <input
                  type="text"
                  name="city"
                  required
                  placeholder="e.g. Hyderabad"
                  value={address.city}
                  onChange={handleAddressChange}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">State *</label>
                <input
                  type="text"
                  name="state"
                  required
                  placeholder="e.g. Telangana"
                  value={address.state}
                  onChange={handleAddressChange}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Pincode / Postal *</label>
                <input
                  type="text"
                  name="postalCode"
                  required
                  placeholder="e.g. 500001"
                  value={address.postalCode}
                  onChange={handleAddressChange}
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Contact Phone</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+91 9876543210"
                  value={address.phone}
                  onChange={handleAddressChange}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Country</label>
                <input
                  type="text"
                  name="country"
                  value={address.country}
                  onChange={handleAddressChange}
                  className="form-control"
                />
              </div>
            </div>

            {/* Save Address Button */}
            <div className="address-save-action-row">
              <button
                type="button"
                id="save-address-btn"
                onClick={handleSaveAddress}
                disabled={savingAddress}
                className="btn-save-address"
                title="Save this address as your default profile address"
              >
                {savingAddress ? (
                  <>
                    <Loader2 size={16} className="spin-animate" />
                    <span>Saving Address...</span>
                  </>
                ) : (
                  <>
                    <BookmarkCheck size={16} />
                    <span>Save Address</span>
                  </>
                )}
              </button>

              <span className="address-save-hint">
                Save to your profile for faster checkout next time
              </span>

              {addressSaveStatus.message && (
                <div className={`address-save-badge ${addressSaveStatus.type}`}>
                  {addressSaveStatus.type === 'success' ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <span>⚠️</span>
                  )}
                  <span>{addressSaveStatus.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Delivery Speed Option */}
          <div className="checkout-card card">
            <div className="card-section-header">
              <ShieldCheck size={20} className="text-primary" />
              <h3>2. Select Delivery Speed</h3>
            </div>

            <div className="payment-options-list">
              <label className={`payment-option-card ${deliverySpeed === 'Standard' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="deliverySpeed"
                  value="Standard"
                  checked={deliverySpeed === 'Standard'}
                  onChange={(e) => setDeliverySpeed(e.target.value)}
                />
                <div className="payment-text">
                  <strong>Standard Surface Delivery (3-5 Business Days)</strong>
                  <span>{subtotal >= 999 ? 'FREE (Orders above ₹999)' : '₹49 Standard Transit'}</span>
                </div>
              </label>

              <label className={`payment-option-card ${deliverySpeed === 'Express' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="deliverySpeed"
                  value="Express"
                  checked={deliverySpeed === 'Express'}
                  onChange={(e) => setDeliverySpeed(e.target.value)}
                />
                <div className="payment-text">
                  <strong>Priority Air Express (1-2 Business Days)</strong>
                  <span>₹99 Flat priority dispatch & SMS delivery tracking</span>
                </div>
              </label>
            </div>
          </div>

          {/* Section 3: Payment Mode */}
          <div className="checkout-card card">
            <div className="card-section-header">
              <CreditCard size={20} className="text-primary" />
              <h3>3. Select Payment Method</h3>
            </div>

            <div className="payment-options-list">
              <label className={`payment-option-card ${paymentMethod === 'Cash on Delivery' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Cash on Delivery"
                  checked={paymentMethod === 'Cash on Delivery'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <Banknote size={22} className="payment-icon" />
                <div className="payment-text">
                  <strong>Cash on Delivery (COD)</strong>
                  <span>Pay comfortably in cash or UPI upon package arrival</span>
                </div>
              </label>

              <label className={`payment-option-card ${paymentMethod === 'UPI' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="UPI"
                  checked={paymentMethod === 'UPI'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div className="upi-badge">UPI</div>
                <div className="payment-text">
                  <strong>Instant UPI (Google Pay, PhonePe, Paytm)</strong>
                  <span>Fast and secure one-click simulated transaction</span>
                </div>
              </label>

              <label className={`payment-option-card ${paymentMethod === 'Card' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Card"
                  checked={paymentMethod === 'Card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <CreditCard size={22} className="payment-icon" />
                <div className="payment-text">
                  <strong>Debit / Credit Card</strong>
                  <span>Safe simulated payment without storing card details</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Checkout Order Review */}
        <div className="checkout-summary-col">
          <div className="summary-card card">
            <h3 className="summary-title">Review Order Items</h3>

            <div className="checkout-items-list">
              {cart.items.map((item) => (
                <div key={item._id} className="checkout-item-row">
                  <div className="checkout-item-meta">
                    <span className="checkout-item-name">{item.product?.name}</span>
                    {item.variant?.title && (
                      <small className="checkout-variant-tag">{item.variant.title}</small>
                    )}
                    <span className="checkout-item-qty">Qty: {item.quantity}</span>
                  </div>
                  <span className="checkout-item-price">
                    ₹{Number(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row">
              <span>Subtotal</span>
              <span className="summary-val">₹{Number(subtotal).toLocaleString('en-IN')}</span>
            </div>

            {appliedCoupon && discountAmount > 0 && (
              <div className="summary-row discount-row" style={{ color: 'var(--success, #10b981)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Tag size={14} />
                  <span>Offer Discount ({appliedCoupon.code})</span>
                </span>
                <span className="summary-val font-bold">
                  -₹{Number(discountAmount).toLocaleString('en-IN')}
                </span>
              </div>
            )}

            <div className="summary-row">
              <span>Delivery</span>
              <span className="summary-val text-success">
                {shipping === 0 ? 'FREE' : `₹${shipping}`}
              </span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row total-row">
              <span>Total Payable</span>
              <span className="total-val">₹{Number(grandTotal).toLocaleString('en-IN')}</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-block btn-lg place-order-btn"
            >
              <span>{loading ? 'Processing Order...' : 'Place Order Now'}</span>
              <ArrowRight size={18} />
            </button>

            <div className="summary-reassurance">
              <ShieldCheck size={16} className="text-primary" />
              <span>Real-time stock deduction verified by backend</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
