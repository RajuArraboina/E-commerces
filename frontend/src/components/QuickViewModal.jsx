import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Star, ShoppingCart, Check, Heart, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';

// Color map for swatch pills
const getColorCode = (colorName) => {
  if (!colorName) return '#94a3b8';
  const c = colorName.toLowerCase();
  if (c.includes('black') || c.includes('midnight') || c.includes('dark')) return '#18181b';
  if (c.includes('silver') || c.includes('chrome') || c.includes('white') || c.includes('starlight')) return '#e2e8f0';
  if (c.includes('red')) return '#ef4444';
  if (c.includes('blue') || c.includes('navy') || c.includes('sapphire') || c.includes('cyan') || c.includes('aqua')) return '#2563eb';
  if (c.includes('green') || c.includes('forest')) return '#15803d';
  if (c.includes('gold') || c.includes('cream')) return '#eab308';
  if (c.includes('pink') || c.includes('rose') || c.includes('cherry')) return '#f43f5e';
  if (c.includes('leather') || c.includes('brown')) return '#854d0e';
  if (c.includes('smoke') || c.includes('slate') || c.includes('grey') || c.includes('gray')) return '#64748b';
  return '#6366f1';
};

const QuickViewModal = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);

  // Sync selected variant on open or product change
  useEffect(() => {
    if (product) {
      if (product.selectedVariant) {
        setSelectedVariant(product.selectedVariant);
      } else if (product.variants && product.variants.length > 0) {
        setSelectedVariant(product.variants[0]);
      } else {
        setSelectedVariant(null);
      }
      setQuantity(1);
    }
  }, [product, isOpen]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const {
    _id,
    name,
    price,
    brand,
    category,
    image,
    description,
    rating = 0,
    numReviews = 0,
    stock = 0,
    isAvailable = true,
    variants = [],
    specifications = [],
  } = product;

  const categoryName = typeof category === 'object' ? category?.name : category;
  const inStock = isAvailable && stock > 0;
  const isWishlisted = isInWishlist(_id);

  const activePrice = selectedVariant?.price !== undefined ? selectedVariant.price : price;
  const activeImage = selectedVariant?.image || image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600';
  const originalPrice = product.originalPrice || Math.round(activePrice * 1.25);
  const discountPercent = Math.max(10, Math.round(((originalPrice - activePrice) / originalPrice) * 100));

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!inStock) return;

    try {
      setAdding(true);
      await addToCart(_id, selectedVariant?._id || null, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add item to cart');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="quickview-overlay" onClick={onClose}>
      <div className="quickview-modal card" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="quickview-close-btn"
          onClick={onClose}
          aria-label="Close Quick View"
        >
          <X size={20} />
        </button>

        <div className="quickview-grid">
          {/* Left: Product Image */}
          <div className="quickview-image-wrap">
            <img
              src={activeImage}
              alt={name}
              className="quickview-img"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600';
              }}
            />
            {discountPercent > 0 && inStock && (
              <span className="quickview-discount-pill">{discountPercent}% OFF</span>
            )}
          </div>

          {/* Right: Product Details */}
          <div className="quickview-info">
            <div className="quickview-meta-row">
              <span className="product-brand">{brand}</span>
              {categoryName && <span className="product-category-tag">{categoryName}</span>}
            </div>

            <h2 className="quickview-title">{name}</h2>

            <div className="quickview-rating-row">
              <div className="stars-wrap">
                <Star size={16} className="star-filled" />
                <strong>{rating ? rating.toFixed(1) : '4.5'}</strong>
                <span className="text-muted text-xs">({numReviews || 48} verified ratings)</span>
              </div>
              <span className="stock-info">
                {inStock ? (
                  <span className="text-success font-semibold">✓ In Stock ({stock} available)</span>
                ) : (
                  <span className="text-danger font-semibold">Out of Stock</span>
                )}
              </span>
            </div>

            {/* Price Section */}
            <div className="quickview-price-section">
              <span className="quickview-current-price">₹{Number(activePrice).toLocaleString('en-IN')}</span>
              <span className="quickview-original-price">₹{Number(originalPrice).toLocaleString('en-IN')}</span>
              <span className="quickview-savings-tag">Save ₹{Number(originalPrice - activePrice).toLocaleString('en-IN')}</span>
            </div>

            {/* Color & Variant Selection */}
            {variants && variants.length > 0 && (
              <div className="quickview-variants-block">
                <label className="quickview-variant-label">
                  Choose Color / Edition: <strong>{selectedVariant?.color || selectedVariant?.title}</strong>
                </label>
                <div className="quickview-variants-list">
                  {variants.map((v) => {
                    const isSelected =
                      (selectedVariant?._id && selectedVariant._id === v._id) ||
                      (selectedVariant?.sku && selectedVariant.sku === v.sku);
                    return (
                      <button
                        key={v._id || v.sku}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        className={`quickview-variant-chip ${isSelected ? 'active' : ''}`}
                      >
                        {v.color && (
                          <span
                            className="variant-swatch-dot"
                            style={{ backgroundColor: getColorCode(v.color) }}
                          />
                        )}
                        <span>{v.color || v.title}</span>
                        {v.price !== undefined && v.price !== price && (
                          <small>₹{Number(v.price).toLocaleString('en-IN')}</small>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <p className="quickview-description">
              {description ||
                'High-performance, officially certified product with manufacturer warranty, complimentary express shipping across India, and 7-day hassle-free replacement.'}
            </p>

            {/* Quantity Selector & Action Buttons */}
            {inStock && (
              <div className="quickview-action-row">
                <div className="quantity-counter">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span>{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                    disabled={quantity >= stock}
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={adding}
                  className={`btn btn-primary quickview-add-btn ${added ? 'btn-added' : ''}`}
                >
                  {added ? (
                    <>
                      <Check size={18} />
                      <span>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} />
                      <span>{adding ? 'Adding...' : 'Add to Cart'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className={`btn btn-outline quickview-wish-btn ${isWishlisted ? 'active' : ''}`}
                  onClick={() => toggleWishlist(product)}
                  title={isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}
                >
                  <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
                </button>
              </div>
            )}

            <div className="quickview-footer-link">
              <Link to={`/products/${_id}`} onClick={onClose}>
                <span>View Full Product Specifications</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
