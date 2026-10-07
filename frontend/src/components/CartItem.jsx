import React, { useState } from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartItem = ({ item }) => {
  const { updateQuantity, removeItem } = useCart();
  const [updating, setUpdating] = useState(false);

  if (!item || !item.product) return null;

  const product = item.product;
  const variant = item.variant;
  const productId = product._id;
  const variantId = variant?.variantId || null;
  const currentQty = item.quantity;
  const unitPrice = item.price;
  const itemTotal = unitPrice * currentQty;

  const handleIncrement = async () => {
    try {
      setUpdating(true);
      await updateQuantity(productId, currentQty + 1, variantId);
    } catch (err) {
      alert(err.response?.data?.message || 'Cannot increase quantity');
    } finally {
      setUpdating(false);
    }
  };

  const handleDecrement = async () => {
    if (currentQty <= 1) {
      handleRemove();
      return;
    }
    try {
      setUpdating(true);
      await updateQuantity(productId, currentQty - 1, variantId);
    } catch (err) {
      alert(err.response?.data?.message || 'Cannot decrease quantity');
    } finally {
      setUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (window.confirm(`Remove ${product.name} from your cart?`)) {
      try {
        setUpdating(true);
        await removeItem(productId, variantId);
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to remove item');
      } finally {
        setUpdating(false);
      }
    }
  };

  return (
    <div className={`cart-item-card ${updating ? 'item-updating' : ''}`}>
      <img
        src={product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300'}
        alt={product.name}
        className="cart-item-img"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300';
        }}
      />

      <div className="cart-item-details">
        <h4 className="cart-item-name">{product.name}</h4>

        {variant?.title && (
          <div className="cart-item-variant">
            <span>Variant: {variant.title}</span>
            {variant.sku && <small>({variant.sku})</small>}
          </div>
        )}

        <div className="cart-item-unit-price">₹{Number(unitPrice).toLocaleString('en-IN')}</div>
      </div>

      {/* Quantity Controls */}
      <div className="cart-item-qty-wrap">
        <div className="qty-counter">
          <button
            onClick={handleDecrement}
            disabled={updating}
            className="qty-btn"
            aria-label="Decrease quantity"
          >
            <Minus size={14} />
          </button>
          <span className="qty-number">{currentQty}</span>
          <button
            onClick={handleIncrement}
            disabled={updating}
            className="qty-btn"
            aria-label="Increase quantity"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Total & Remove */}
      <div className="cart-item-total-col">
        <span className="cart-item-subtotal">₹{Number(itemTotal).toLocaleString('en-IN')}</span>
        <button
          onClick={handleRemove}
          disabled={updating}
          className="btn-remove-item"
          title="Remove from cart"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
