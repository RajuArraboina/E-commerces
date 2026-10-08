import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Check, Heart, Eye, RotateCcw, Truck, ArrowRight } from 'lucide-react';
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

const ProductCard = ({ product, onQuickView }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  // Active variant state (for color switching & prices)
  const [selectedVariant, setSelectedVariant] = useState(() => {
    return product?.variants && product.variants.length > 0 ? product.variants[0] : null;
  });

  if (!product) return null;

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
  } = product;

  const categoryName = typeof category === 'object' ? category?.name : category;
  const inStock = isAvailable && stock > 0;
  const isWishlisted = isInWishlist(_id);

  // Active price & image considering selected variant
  const activePrice = selectedVariant?.price !== undefined ? selectedVariant.price : price;
  const activeImage = selectedVariant?.image || image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500';

  // Calculate realistic original price and discount percentage
  const originalPrice = product.originalPrice || Math.round(activePrice * 1.25);
  const discountPercent = Math.max(10, Math.round(((originalPrice - activePrice) / originalPrice) * 100));

  const handleCardTap = () => {
    // Allows tapping the card background to flip on touch/mobile
    setIsFlipped((prev) => !prev);
  };

  const handleFlipToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFlipped((prev) => !prev);
  };

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!inStock) return;

    try {
      setAdding(true);
      await addToCart(_id, selectedVariant?._id || null, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add item to cart');
    } finally {
      setAdding(false);
    }
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleQuickViewClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView({ ...product, selectedVariant });
    } else {
      navigate(`/products/${_id}`);
    }
  };

  // Determine dynamic badge
  const getDynamicBadge = () => {
    if (product.badge) return product.badge;
    if (stock > 0 && stock <= 8) return 'LIMITED STOCK';
    if (rating >= 4.7 && numReviews >= 20) return 'BEST SELLER';
    if (product.createdAt && Date.now() - new Date(product.createdAt).getTime() < 14 * 24 * 60 * 60 * 1000) {
      return 'NEW';
    }
    if (rating >= 4.5) return 'TRENDING';
    return null;
  };

  const dynamicBadge = getDynamicBadge();

  return (
    <div
      className={`flip-card ${isFlipped ? 'is-flipped' : ''}`}
      onClick={handleCardTap}
      tabIndex={0}
      role="region"
      aria-label={`Product card for ${name}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if (e.target === e.currentTarget) {
            e.preventDefault();
            setIsFlipped((prev) => !prev);
          }
        }
      }}
    >
      <div className="flip-card-inner">
        {/* =========================================================
            FRONT SIDE OF FLIPCARD
            Card image, Product name, Rating, Price, Discount, Wishlist
           ========================================================= */}
        <div className="flip-card-front card">
          {/* Thumbnail Image & Floating Badges */}
          <div className="product-image-wrap">
            <img
              src={activeImage}
              alt={name}
              className="product-image"
              loading="lazy"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500';
              }}
            />

            {/* Floating Badges */}
            <div className="card-floating-badges">
              {dynamicBadge && (
                <span className={`product-status-badge badge-${dynamicBadge.toLowerCase().replace(/\s+/g, '-')}`}>
                  {dynamicBadge}
                </span>
              )}
              {discountPercent > 0 && inStock && (
                <span className="product-card-discount-badge">{discountPercent}% OFF</span>
              )}
            </div>

            {!inStock && <span className="badge-out-of-stock">Out of Stock</span>}

            {/* Top Floating Action Buttons: Wishlist & Quick View */}
            <div className="card-top-actions">
              <button
                type="button"
                className={`card-action-btn ${isWishlisted ? 'active' : ''}`}
                onClick={handleWishlistClick}
                title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                aria-label="Wishlist"
              >
                <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
              <button
                type="button"
                className="card-action-btn"
                onClick={handleQuickViewClick}
                title="Quick View"
                aria-label="Quick View"
              >
                <Eye size={16} />
              </button>
            </div>

            {/* Quick Flip Button Badge */}
            <button
              type="button"
              className="card-flip-btn"
              onClick={handleFlipToggle}
              title="Tap to Flip for Specs & Description"
              aria-label="Flip card for details"
            >
              <RotateCcw size={13} />
              <span>Specs</span>
            </button>
          </div>

          {/* Front Body */}
          <div className="product-card-body">
            <div className="product-meta-row">
              <span className="product-brand">{brand}</span>
              {categoryName && <span className="product-category-tag">{categoryName}</span>}
            </div>

            <Link
              to={`/products/${_id}`}
              className="product-title-link"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="product-title" title={name}>
                {name}
              </h3>
            </Link>

            {/* Rating & Stock */}
            <div className="product-rating">
              <div className="stars-wrap">
                <Star size={14} className="star-filled" />
                <span>{rating ? rating.toFixed(1) : '4.5'}</span>
                {numReviews > 0 && <span className="text-muted text-xs">({numReviews})</span>}
              </div>
              <span className="stock-info">
                {inStock ? (
                  stock <= 8 ? (
                    <span className="text-warning-bold">Only {stock} left</span>
                  ) : (
                    <span className="text-success">In Stock</span>
                  )
                ) : (
                  <span className="text-danger">Sold Out</span>
                )}
              </span>
            </div>

            {/* Color Swatches if available */}
            {variants && variants.length > 1 && variants.some((v) => v.color) && (
              <div className="product-color-options">
                <div className="color-swatches-row">
                  {variants.slice(0, 5).map((v, i) => {
                    const isCurActive =
                      (selectedVariant?._id && selectedVariant._id === v._id) ||
                      (selectedVariant?.sku && selectedVariant.sku === v.sku) ||
                      (!selectedVariant && i === 0);
                    return (
                      <button
                        key={v._id || v.sku || i}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedVariant(v);
                        }}
                        onMouseEnter={() => setSelectedVariant(v)}
                        className={`card-color-swatch ${isCurActive ? 'active' : ''}`}
                        title={v.color || v.title}
                        style={{ backgroundColor: getColorCode(v.color) }}
                        aria-label={v.color || v.title}
                      />
                    );
                  })}
                </div>
                <span className="color-label-preview">
                  {selectedVariant?.color || `${variants.length} colors`}
                </span>
              </div>
            )}

            {/* Price with Original Price */}
            <div className="product-price-row">
              <div className="product-price-stack">
                <span className="product-price">₹{Number(activePrice).toLocaleString('en-IN')}</span>
                <span className="product-original-price">₹{Number(originalPrice).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Actions: Add to Cart & Tap for Details */}
            <div className="product-card-cta-group">
              <button
                type="button"
                onClick={handleQuickAdd}
                disabled={!inStock || adding}
                className={`btn-card-add-cart ${added ? 'btn-added' : ''}`}
                title={inStock ? 'Add to cart' : 'Out of stock'}
              >
                {added ? (
                  <>
                    <Check size={14} />
                    <span>Added</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={14} />
                    <span>{adding ? 'Adding...' : 'Add to Cart'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleFlipToggle}
                className="btn-flip-trigger"
                title="Tap to Flip for Details"
              >
                <RotateCcw size={14} />
                <span>Details</span>
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================
            BACK SIDE OF FLIPCARD
            Description, Brand, Stock, Delivery, Add to Cart, View Details
           ========================================================= */}
        <div className="flip-card-back card">
          <div className="flip-card-back-header">
            <div className="back-header-info">
              <span className="back-brand">{brand}</span>
              <h4 className="back-product-title" title={name}>{name}</h4>
            </div>
            <button
              type="button"
              onClick={handleFlipToggle}
              className="btn-flip-back"
              title="Flip back to front"
              aria-label="Flip back to front"
            >
              <RotateCcw size={15} />
            </button>
          </div>

          <div className="flip-card-back-body">
            {/* Rating & Stock */}
            <div className="back-spec-row">
              <div className="stars-wrap">
                <Star size={13} className="star-filled" />
                <span>{rating ? rating.toFixed(1) : '4.5'}</span>
                <span className="text-muted text-xs">({numReviews || 0} reviews)</span>
              </div>
              <span className={`stock-info ${inStock ? 'text-success' : 'text-danger'}`}>
                {inStock ? `${stock} in stock` : 'Out of stock'}
              </span>
            </div>

            {/* Delivery Info */}
            <div className="back-delivery-pill">
              <Truck size={14} className="text-primary" />
              <span>Free Express Delivery across India</span>
            </div>

            {/* Description */}
            <div className="back-description-box">
              <p className="back-description-text">
                {description ||
                  'Authentic, factory-sealed product with 1-year brand warranty, verified customer ratings, express delivery, and hassle-free returns.'}
              </p>
            </div>

            {/* Price Preview on Back */}
            <div className="back-price-row">
              <span className="product-price">₹{Number(activePrice).toLocaleString('en-IN')}</span>
              {discountPercent > 0 && (
                <span className="product-card-discount-badge">{discountPercent}% OFF</span>
              )}
            </div>
          </div>

          {/* Action Buttons on Back: Add to Cart & View Details */}
          <div className="flip-card-back-actions">
            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={!inStock || adding}
              className={`btn-card-add-cart ${added ? 'btn-added' : ''}`}
            >
              {added ? (
                <>
                  <Check size={14} />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingCart size={14} />
                  <span>{adding ? 'Adding...' : 'Add to Cart'}</span>
                </>
              )}
            </button>

            <Link
              to={`/products/${_id}`}
              onClick={(e) => e.stopPropagation()}
              className="btn-card-view-details"
            >
              <span>View Details</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
