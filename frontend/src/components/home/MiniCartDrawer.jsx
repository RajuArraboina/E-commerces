import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, X, Trash2, ArrowRight, Plus, Minus, Truck } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const FREE_SHIPPING_THRESHOLD = 999;

const MiniCartDrawer = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { cart, cartCount, subtotal, discountAmount, grandSubtotal, updateQuantity, removeItem } = useCart();

  if (!isOpen) return null;

  const items = cart?.items || [];
  const amountNeeded = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  const handleViewCart = () => {
    onClose();
    navigate('/cart');
  };

  return (
    <div className="mini-cart-backdrop" onClick={onClose} aria-label="Mini Cart Drawer">
      <div className="mini-cart-drawer card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="mini-cart-header">
          <div className="mini-cart-title-row">
            <ShoppingBag size={20} className="text-primary" />
            <h3 className="mini-cart-heading">Your Cart ({cartCount})</h3>
          </div>
          <button
            type="button"
            className="mini-cart-close-btn"
            onClick={onClose}
            aria-label="Close cart drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="free-shipping-bar-box">
          <div className="shipping-progress-text">
            <Truck size={15} className="text-primary" />
            {amountNeeded > 0 ? (
              <span>Add <strong>₹{amountNeeded.toLocaleString('en-IN')}</strong> more for <strong>FREE Delivery</strong></span>
            ) : (
              <span className="text-success font-semibold">🎉 You unlocked FREE Express Delivery!</span>
            )}
          </div>
          <div className="shipping-progress-track">
            <div
              className="shipping-progress-fill"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* Cart Items List */}
        <div className="mini-cart-items-body">
          {items.length === 0 ? (
            <div className="mini-cart-empty">
              <ShoppingBag size={48} className="text-muted" />
              <p className="empty-text">Your shopping cart is empty.</p>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-primary btn-sm"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <ul className="mini-cart-items-list">
              {items.map((item) => {
                const p = item.product || {};
                const variant = item.variant;
                const itemPrice = item.price || p.price || 0;
                const itemImg = variant?.image || p.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200';

                return (
                  <li key={item._id || `${p._id}-${variant?._id}`} className="mini-cart-item">
                    <img
                      src={itemImg}
                      alt={p.name || 'Product'}
                      className="mini-cart-thumb"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200';
                      }}
                    />

                    <div className="mini-cart-item-details">
                      <h4 className="mini-cart-item-name" title={p.name}>
                        {p.name}
                      </h4>
                      {variant?.color && (
                        <span className="mini-cart-item-variant">Color: {variant.color}</span>
                      )}

                      <div className="mini-cart-price-qty-row">
                        <span className="mini-cart-price">₹{Number(itemPrice).toLocaleString('en-IN')}</span>

                        {/* Qty Controls */}
                        <div className="mini-cart-qty-ctrls">
                          <button
                            type="button"
                            onClick={() => updateQuantity(p._id, Math.max(1, item.quantity - 1), variant?._id)}
                            className="qty-btn"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="qty-val">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(p._id, item.quantity + 1, variant?._id)}
                            className="qty-btn"
                            aria-label="Increase quantity"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="mini-cart-remove-btn"
                      onClick={() => removeItem(p._id, variant?._id)}
                      title="Remove item"
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer Summary & Checkout CTAs */}
        {items.length > 0 && (
          <div className="mini-cart-footer">
            <div className="mini-cart-subtotal-row">
              <span className="subtotal-label">Subtotal</span>
              <span className="subtotal-val">₹{Number(subtotal).toLocaleString('en-IN')}</span>
            </div>

            {discountAmount > 0 && (
              <div className="mini-cart-discount-row">
                <span>Discount</span>
                <span className="text-success">-₹{Number(discountAmount).toLocaleString('en-IN')}</span>
              </div>
            )}

            <div className="mini-cart-total-row">
              <span className="total-label">Total Amount</span>
              <strong className="total-val">₹{Number(grandSubtotal).toLocaleString('en-IN')}</strong>
            </div>

            <div className="mini-cart-action-buttons">
              <button
                type="button"
                onClick={handleViewCart}
                className="btn btn-outline mini-cart-btn"
              >
                View Cart
              </button>
              <button
                type="button"
                onClick={handleCheckout}
                className="btn btn-primary mini-cart-btn"
              >
                <span>Checkout</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MiniCartDrawer;
