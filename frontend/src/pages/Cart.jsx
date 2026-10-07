import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';
import ProductCard from '../components/ProductCard';
import aiService from '../services/aiService';
import {
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Trash2,
  ShieldCheck,
  Truck,
  Sparkles,
  Tag,
  Check,
  X,
  Gift,
  Percent
} from 'lucide-react';

const Cart = () => {
  const {
    cart,
    subtotal,
    cartCount,
    clearCart,
    loading,
    appliedCoupon,
    discountAmount,
    availableCoupons,
    applyCoupon,
    removeCoupon
  } = useCart();
  const navigate = useNavigate();

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState(null);
  const [crossSellProducts, setCrossSellProducts] = useState([]);
  const [frequentlyBought, setFrequentlyBought] = useState([]);

  const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 99;
  const grandTotal = Math.max(0, subtotal - discountAmount) + (subtotal > 0 ? shipping : 0);

  const handleApplyCode = (customCode) => {
    const code = customCode || couponInput;
    if (!code || !code.trim()) {
      setCouponFeedback({ type: 'error', message: 'Please enter a coupon code.' });
      return;
    }
    const res = applyCoupon(code);
    setCouponFeedback({
      type: res.success ? 'success' : 'error',
      message: res.message
    });
    if (res.success) {
      setCouponInput('');
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponFeedback(null);
  };

  // Load smart cross-sells based on current items in cart
  useEffect(() => {
    const loadCrossSells = async () => {
      try {
        const firstProductId = cart?.items?.[0]?.product?._id || cart?.items?.[0]?.product;
        const res = await aiService.getRecommendations(firstProductId);
        if (res.success && res.data) {
          setCrossSellProducts(res.data.similarProducts || res.data.trending?.slice(0, 3) || []);
          setFrequentlyBought(res.data.frequentlyBoughtTogether || []);
        }
      } catch (err) {
        console.warn('Smart cart cross-sells failed to load:', err);
      }
    };

    if (cart?.items?.length > 0) {
      loadCrossSells();
    }
  }, [cart]);

  const handleClear = async () => {
    if (window.confirm('Are you sure you want to empty your entire cart?')) {
      await clearCart();
    }
  };

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="cart-page container">
        <div className="empty-cart-card card">
          <div className="empty-cart-icon">
            <ShoppingBag size={56} />
          </div>
          <h2>Your cart is empty.</h2>
          <p>Discover products you'll love with personalized AI suggestions.</p>
          <Link to="/products" className="btn btn-primary btn-lg" style={{ marginTop: '16px' }}>
            <span>Start Shopping</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page container">
      <div className="cart-header">
        <div>
          <h1 className="page-title">Shopping Cart</h1>
          <p className="page-subtitle">
            You have {cartCount} item{cartCount === 1 ? '' : 's'} in your cart
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link to="/products" className="btn btn-outline btn-sm">
            <ArrowLeft size={16} />
            <span>Continue Shopping</span>
          </Link>
          <button onClick={handleClear} className="btn btn-outline-danger btn-sm">
            <Trash2 size={16} />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      <div className="cart-layout">
        {/* Left: Cart Items List */}
        <div className="cart-items-col">
          {cart.items.map((item) => (
            <CartItem key={item._id} item={item} />
          ))}

          {/* Section 10: "✨ You may also need" */}
          {crossSellProducts.length > 0 && (
            <div className="cart-recommendations-section card" style={{ marginTop: '28px' }}>
              <div className="section-card-header">
                <div className="ai-badge">
                  <Sparkles size={16} className="text-accent" />
                  <span>✨ You may also need</span>
                </div>
              </div>
              <div className="cart-cross-sells-grid">
                {crossSellProducts.slice(0, 3).map((prod) => (
                  <ProductCard key={prod._id} product={prod} />
                ))}
              </div>
            </div>
          )}

          {/* Section 10: "Frequently bought together" */}
          {frequentlyBought.length > 0 && (
            <div className="cart-recommendations-section card" style={{ marginTop: '24px' }}>
              <div className="section-card-header">
                <div className="badge-tag">
                  Frequently bought together
                </div>
              </div>
              <div className="cart-cross-sells-grid">
                {frequentlyBought.slice(0, 2).map((prod) => (
                  <ProductCard key={prod._id} product={prod} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Order Summary Card */}
        <div className="cart-summary-col">
          <div className="summary-card card">
            <h3 className="summary-title">Order Summary</h3>

            {/* Direct ₹250 Offer Callout Banner */}
            {subtotal >= 5000 && appliedCoupon?.code === 'SHOP5000' && (
              <div className="cart-auto-offer-banner active">
                <Sparkles size={16} className="text-warning" />
                <div>
                  <strong>🎉 ₹250 Shopping Offer Applied!</strong>
                  <p>Directly applied flat ₹250 discount for shopping above ₹5,000.</p>
                </div>
              </div>
            )}
            {subtotal > 0 && subtotal < 5000 && (
              <div className="cart-auto-offer-banner hint">
                <Gift size={16} className="text-primary" />
                <div>
                  <strong>Shop for ₹{Number(5000 - subtotal).toLocaleString('en-IN')} more!</strong>
                  <p>Reach ₹5,000 cart value to get flat ₹250 OFF automatically.</p>
                </div>
              </div>
            )}

            <div className="summary-row">
              <span>Items Subtotal</span>
              <span className="summary-val">₹{Number(subtotal).toLocaleString('en-IN')}</span>
            </div>

            {appliedCoupon && discountAmount > 0 && (
              <div className="summary-row discount-row">
                <span className="discount-label">
                  <Tag size={14} className="text-success" />
                  <span>Offer ({appliedCoupon.code})</span>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="btn-remove-coupon"
                    title="Remove offer"
                  >
                    <X size={12} />
                  </button>
                </span>
                <span className="summary-val text-success font-bold">
                  -₹{Number(discountAmount).toLocaleString('en-IN')}
                </span>
              </div>
            )}

            <div className="summary-row">
              <span>Estimated Delivery</span>
              <span className="summary-val text-success">
                {shipping === 0 ? 'FREE' : `₹${shipping}`}
              </span>
            </div>

            {shipping > 0 && (
              <p className="free-shipping-hint">
                Add ₹{999 - subtotal} more to qualify for <strong>FREE Delivery</strong>!
              </p>
            )}

            {appliedCoupon && discountAmount > 0 && (
              <div className="savings-badge-callout">
                <Sparkles size={14} />
                <span>
                  You are saving <strong>₹{Number(discountAmount).toLocaleString('en-IN')}</strong> with code <strong>{appliedCoupon.code}</strong>!
                </span>
              </div>
            )}

            {/* Promotional Code / Offers Section */}
            <div className="coupon-box-section">
              <div className="coupon-box-header">
                <Percent size={14} className="text-primary" />
                <span>Offers & Coupons</span>
              </div>

              {appliedCoupon ? (
                <div className="applied-coupon-pill-card">
                  <div className="applied-coupon-info">
                    <Check size={14} className="text-success" />
                    <strong>{appliedCoupon.code} Applied</strong>
                    <small>({appliedCoupon.title})</small>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="btn-remove-coupon-text"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleApplyCode();
                  }}
                  className="coupon-form"
                >
                  <input
                    type="text"
                    placeholder="Enter code (e.g. SAVE25)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="form-control coupon-input"
                  />
                  <button type="submit" className="btn btn-outline btn-sm coupon-submit-btn">
                    Apply
                  </button>
                </form>
              )}

              {couponFeedback && (
                <div className={`coupon-feedback-msg ${couponFeedback.type}`}>
                  {couponFeedback.type === 'success' ? <Check size={13} /> : <X size={13} />}
                  <span>{couponFeedback.message}</span>
                </div>
              )}

              {/* Quick Select Offer Chips */}
              <div className="available-offers-wrap">
                <small className="offers-wrap-title">
                  <Gift size={12} /> Tap to Apply Available Offer:
                </small>
                <div className="offer-chips-list">
                  {availableCoupons.map((c) => {
                    const isSelected = appliedCoupon?.code === c.code;
                    return (
                      <button
                        key={c.code}
                        type="button"
                        className={`offer-chip-btn ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleApplyCode(c.code)}
                        title={c.description}
                      >
                        <strong>{c.code}</strong>
                        <span>{c.discountPercent ? `${c.discountPercent}% OFF` : `₹${c.discountFlat} OFF`}</span>
                        {isSelected && <Check size={11} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row total-row">
              <span>Cart Total</span>
              <span className="total-val">₹{Number(grandTotal).toLocaleString('en-IN')}</span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              disabled={loading}
              className="btn btn-primary btn-block btn-lg checkout-btn"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>

            <Link
              to="/products"
              className="btn btn-outline btn-block"
              style={{ marginTop: '12px' }}
            >
              Continue Shopping
            </Link>

            <div className="cart-perks-list">
              <div className="perk-item">
                <ShieldCheck size={16} className="text-success" />
                <span>SSL Encrypted Checkout</span>
              </div>
              <div className="perk-item">
                <Truck size={16} className="text-primary" />
                <span>Fast & Insured Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
