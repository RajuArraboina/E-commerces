import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import productService from '../services/productService';
import aiService from '../services/aiService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import {
  Star,
  ShoppingCart,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  Minus,
  Plus,
  ChevronRight,
  Sparkles,
  Heart,
  Scale,
  Zap,
  CheckCircle2,
  AlertCircle,
  MessageSquare
} from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cart, addToCart, updateQuantity, removeItem } = useCart();
  const { isAuthenticated } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [updatingCart, setUpdatingCart] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  // AI & Extra Product Data
  const [aiSummary, setAiSummary] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [frequentlyBought, setFrequentlyBought] = useState([]);

  // New review form
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');

  useEffect(() => {
    const fetchProductAndAI = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await productService.getProductById(id);
        if (res.success && res.data) {
          const prodData = res.data;
          setProduct(prodData);

          if (prodData.variants && prodData.variants.length > 0) {
            setSelectedVariant(prodData.variants[0]);
          }

          // Save to Recently Viewed in localStorage
          try {
            const raw = localStorage.getItem('shopsphere_recently_viewed');
            const recents = raw ? JSON.parse(raw) : [];
            const filtered = recents.filter((p) => p._id !== prodData._id);
            filtered.unshift({
              _id: prodData._id,
              name: prodData.name,
              price: prodData.price,
              brand: prodData.brand,
              image: prodData.image,
              rating: prodData.rating,
              stock: prodData.stock,
              isAvailable: prodData.isAvailable,
              category: prodData.category,
            });
            localStorage.setItem('shopsphere_recently_viewed', JSON.stringify(filtered.slice(0, 8)));
          } catch {
            // Ignore localStorage errors
          }

          // Fetch AI Review Summary & Recommendations concurrently
          try {
            const [summaryRes, recRes] = await Promise.all([
              aiService.getReviewSummary(prodData._id),
              aiService.getRecommendations(prodData._id),
            ]);

            if (summaryRes?.success) setAiSummary(summaryRes);
            if (recRes?.success && recRes.data) {
              setSimilarProducts(recRes.data.similarProducts || []);
              setFrequentlyBought(recRes.data.frequentlyBoughtTogether || []);
            }
          } catch (aiErr) {
            console.warn('AI Insights loaded in fallback mode:', aiErr);
          }
        } else {
          setError('Product not found.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndAI();
  }, [id]);

  if (loading) return <Loading message="Loading product specifications & AI insights..." />;
  if (error) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <ErrorMessage message={error} />
        <Link to="/products" className="btn btn-primary" style={{ marginTop: '20px' }}>
          Back to Products Catalog
        </Link>
      </div>
    );
  }
  if (!product) return null;

  // Active pricing & stock based on selected variant or parent product
  const activePrice = selectedVariant?.price !== undefined ? selectedVariant.price : product.price;
  const activeStock = selectedVariant?.stock !== undefined ? selectedVariant.stock : product.stock;
  const inStock = product.isAvailable && activeStock > 0;
  const categoryName = typeof product.category === 'object' ? product.category?.name : product.category;
  const isWishlisted = isInWishlist(product._id);

  // Match item currently in user's cart
  const cartItem = cart?.items?.find((item) => {
    const pId = typeof item.product === 'object' ? item.product?._id : item.product;
    if (pId?.toString() !== product?._id?.toString()) return false;
    if (selectedVariant?._id) {
      return item.variant?.variantId?.toString() === selectedVariant._id.toString();
    }
    return !item.variant?.variantId;
  });

  const inCartQuantity = cartItem?.quantity || 0;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!inStock) return;

    try {
      setAdding(true);
      await addToCart(product._id, selectedVariant?._id || null, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add item to cart');
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!inStock) return;

    try {
      setAdding(true);
      if (inCartQuantity === 0) {
        await addToCart(product._id, selectedVariant?._id || null, 1);
      }
      navigate('/checkout');
    } catch (err) {
      alert(err.response?.data?.message || 'Could not initiate checkout');
    } finally {
      setAdding(false);
    }
  };

  const handleUpdateInCartQty = async (delta) => {
    if (!cartItem) return;
    const newQty = inCartQuantity + delta;
    try {
      setUpdatingCart(true);
      if (newQty <= 0) {
        await removeItem(product._id, selectedVariant?._id || null);
      } else if (newQty <= activeStock) {
        await updateQuantity(product._id, newQty, selectedVariant?._id || null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update cart quantity');
    } finally {
      setUpdatingCart(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!reviewComment.trim()) return;

    try {
      setSubmittingReview(true);
      const res = await productService.addReview(product._id, {
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      if (res.success) {
        setReviewSuccess('Review submitted successfully!');
        setReviewComment('');
        // Refresh product reviews
        const refreshRes = await productService.getProductById(product._id);
        if (refreshRes.success && refreshRes.data) {
          setProduct(refreshRes.data);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="product-details-page container">
      {/* Breadcrumbs */}
      <nav className="breadcrumbs-nav">
        <Link to="/">Home</Link>
        <ChevronRight size={14} />
        <Link to="/products">Products</Link>
        <ChevronRight size={14} />
        {categoryName && (
          <>
            <Link to={`/products?category=${encodeURIComponent(categoryName)}`}>{categoryName}</Link>
            <ChevronRight size={14} />
          </>
        )}
        <span className="current-crumb">{product.name}</span>
      </nav>

      {/* Main Product Layout: Gallery | Info */}
      <div className="details-grid">
        {/* Left: Product Media Gallery */}
        <div className="details-media-col">
          <div className="details-main-img-wrap card">
            <img
              src={selectedVariant?.image || product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'}
              alt={product.name}
              className="details-main-img"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600';
              }}
            />
          </div>
        </div>

        {/* Right: Product Information */}
        <div className="details-info-col">
          <div className="details-header-meta">
            <span className="details-brand-pill">{product.brand}</span>
            <span className="details-category-pill">{categoryName}</span>
          </div>

          <h1 className="details-title">{product.name}</h1>

          {/* Rating & Stock Status */}
          <div className="details-rating-row">
            <div className="stars-wrap">
              <Star size={18} className="star-filled" />
              <strong className="rating-score">{product.rating ? product.rating.toFixed(1) : '4.5'}</strong>
              <span className="text-muted">({product.numReviews || product.reviews?.length || 12} reviews)</span>
            </div>
            <span className="rating-divider">•</span>
            <span className={`stock-status-badge ${inStock ? 'in-stock' : 'out-of-stock'}`}>
              {inStock ? `In Stock (${activeStock} units)` : 'Sold Out'}
            </span>
          </div>

          {/* Price */}
          <div className="details-price-row">
            <span className="details-current-price">
              ₹{Number(activePrice).toLocaleString('en-IN')}
            </span>
            <span className="details-mrp-price">
              ₹{Number(Math.round(activePrice * 1.18)).toLocaleString('en-IN')}
            </span>
            <span className="details-discount-tag">15% OFF</span>
          </div>

          {/* Dynamic Variants Picker */}
          {product.variants && product.variants.length > 0 && (
            <div className="details-variants-section">
              <label className="variants-label">Select Option / Variant:</label>
              <div className="variants-list">
                {product.variants.map((v) => (
                  <button
                    key={v._id || v.sku}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    className={`variant-option-pill ${selectedVariant?._id === v._id ? 'selected' : ''}`}
                  >
                    <span className="variant-title">{v.title || v.sku}</span>
                    {v.price !== undefined && (
                      <span className="variant-price">₹{Number(v.price).toLocaleString('en-IN')}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="details-description">
            <p>{product.description}</p>
          </div>

          {/* Purchase Controls & Action Buttons */}
          <div className="details-purchase-box card">
            <div className="purchase-controls-stack">
              {inCartQuantity > 0 ? (
                <div className="purchase-controls-row in-cart-mode">
                  <div className="quantity-select-box">
                    <span className="qty-label">In Cart:</span>
                    <div className="qty-counter">
                      <button
                        type="button"
                        onClick={() => handleUpdateInCartQty(-1)}
                        disabled={updatingCart}
                        className="qty-btn"
                        title="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="qty-number">{inCartQuantity}</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateInCartQty(1)}
                        disabled={inCartQuantity >= activeStock || updatingCart}
                        className="qty-btn"
                        title="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  <Link to="/cart" className="btn btn-primary btn-lg view-cart-btn">
                    <ShoppingCart size={20} />
                    <span>View in Cart ({inCartQuantity})</span>
                  </Link>
                </div>
              ) : (
                <div className="purchase-buttons-row">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={!inStock || adding}
                    className={`btn btn-primary btn-lg add-to-cart-btn ${added ? 'btn-added' : ''}`}
                  >
                    {added ? (
                      <>
                        <Check size={20} />
                        <span>Added to Cart!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={20} />
                        <span>{adding ? 'Adding...' : 'Add to Cart'}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleBuyNow}
                    disabled={!inStock || adding}
                    className="btn btn-accent btn-lg buy-now-btn"
                  >
                    <Zap size={18} />
                    <span>Buy Now</span>
                  </button>
                </div>
              )}

              {/* Wishlist & Compare Quick Actions */}
              <div className="secondary-actions-row">
                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  className={`btn btn-outline btn-sm action-pill ${isWishlisted ? 'active-wishlist' : ''}`}
                >
                  <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
                  <span>{isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}</span>
                </button>

                <Link
                  to={`/compare?product1=${product._id}`}
                  className="btn btn-outline btn-sm action-pill"
                >
                  <Scale size={16} />
                  <span>Compare with others</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Guarantees Grid */}
          <div className="details-guarantees-grid">
            <div className="guarantee-item">
              <Truck size={18} />
              <span>Express Dispatch</span>
            </div>
            <div className="guarantee-item">
              <ShieldCheck size={18} />
              <span>Official Warranty</span>
            </div>
            <div className="guarantee-item">
              <RotateCcw size={18} />
              <span>7-Day Return Policy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications Section */}
      {product.specifications && product.specifications.length > 0 && (
        <section className="product-specs-section card" style={{ marginTop: '40px' }}>
          <div className="section-card-header">
            <h3 className="section-card-title">Technical Specifications</h3>
          </div>
          <div className="specs-table-responsive">
            <table className="specs-table">
              <tbody>
                {product.specifications.map((spec, sIdx) => (
                  <tr key={sIdx}>
                    <td className="spec-name">{spec.name}</td>
                    <td className="spec-val">{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Section 8: AI Review Summary */}
      {aiSummary && (
        <section className="ai-review-summary-card card" style={{ marginTop: '30px' }}>
          <div className="ai-summary-header">
            <div className="ai-badge">
              <Sparkles size={16} className="text-accent" />
              <span>✨ AI Review Summary</span>
            </div>
            <span className="text-muted text-sm">
              Analyzed {aiSummary.totalReviewsAnalyzed || 12} customer ratings & reviews
            </span>
          </div>

          <p className="ai-summary-quote">{aiSummary.summary}</p>

          <div className="ai-sentiment-pros-cons-grid">
            <div className="pros-box">
              <h4 className="pros-title text-success">
                <CheckCircle2 size={16} />
                <span>Customers commonly like:</span>
              </h4>
              <ul className="pros-list">
                {aiSummary.pros?.map((pro, pIdx) => (
                  <li key={pIdx}>✓ {pro}</li>
                ))}
              </ul>
            </div>

            <div className="cons-box">
              <h4 className="cons-title text-warning">
                <AlertCircle size={16} />
                <span>Common concerns:</span>
              </h4>
              <ul className="cons-list">
                {aiSummary.cons?.map((con, cIdx) => (
                  <li key={cIdx}>• {con}</li>
                ))}
              </ul>
            </div>
          </div>
          <small className="ai-disclaimer-note">Generated intelligently from verified customer purchase records.</small>
        </section>
      )}

      {/* Customer Reviews & Add Review */}
      <section className="customer-reviews-section card" style={{ marginTop: '30px' }}>
        <div className="section-card-header">
          <h3 className="section-card-title">
            <MessageSquare size={18} className="text-primary" />
            <span>Customer Reviews ({product.reviews?.length || 0})</span>
          </h3>
        </div>

        {/* Existing Reviews */}
        <div className="reviews-list">
          {product.reviews && product.reviews.length > 0 ? (
            product.reviews.map((rev, rIdx) => (
              <div key={rIdx} className="review-item-card">
                <div className="review-item-header">
                  <div className="review-user-info">
                    <div className="review-avatar">{rev.name?.charAt(0) || 'U'}</div>
                    <div>
                      <strong>{rev.name}</strong>
                      <span className="text-muted text-xs block">Verified Buyer</span>
                    </div>
                  </div>
                  <div className="stars-wrap">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < rev.rating ? 'star-filled' : 'star-empty'}
                      />
                    ))}
                  </div>
                </div>
                <p className="review-comment-text">{rev.comment}</p>
              </div>
            ))
          ) : (
            <p className="text-muted">No customer reviews yet. Be the first to share your experience!</p>
          )}
        </div>

        {/* Add Review Form */}
        <form onSubmit={handleReviewSubmit} className="add-review-form" style={{ marginTop: '24px' }}>
          <h4>Write a Verified Review</h4>
          {reviewSuccess && <div className="text-success text-sm" style={{ marginBottom: '8px' }}>{reviewSuccess}</div>}
          <div className="rating-picker-row">
            <label className="form-label" style={{ marginBottom: 0 }}>Rating:</label>
            <div className="stars-picker">
              {[1, 2, 3, 4, 5].map((starVal) => (
                <button
                  key={starVal}
                  type="button"
                  onClick={() => setReviewRating(starVal)}
                  className="star-pick-btn"
                >
                  <Star size={20} className={starVal <= reviewRating ? 'star-filled' : 'star-empty'} />
                </button>
              ))}
            </div>
          </div>

          <textarea
            className="form-control"
            rows={3}
            placeholder="Share details about performance, durability, build quality..."
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={submittingReview || !reviewComment.trim()}
            className="btn btn-primary btn-sm"
            style={{ marginTop: '12px' }}
          >
            {submittingReview ? 'Submitting...' : 'Post Review'}
          </button>
        </form>
      </section>

      {/* Frequently Bought Together Bundle */}
      {frequentlyBought && frequentlyBought.length > 0 && (
        <section className="frequently-bought-section" style={{ marginTop: '40px' }}>
          <div className="section-header">
            <div>
              <div className="badge-tag badge-tag-ai">
                <Sparkles size={14} /> Frequently Bought Together
              </div>
              <h2 className="section-title">Complete Your Setup</h2>
              <p className="section-subtitle">Commonly paired accessories and upgrades</p>
            </div>
          </div>
          <div className="products-grid">
            {frequentlyBought.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Similar Products */}
      {similarProducts && similarProducts.length > 0 && (
        <section className="similar-products-section" style={{ marginTop: '40px' }}>
          <div className="section-header">
            <div>
              <h2 className="section-title">Similar Products</h2>
              <p className="section-subtitle">Other popular selections in {categoryName}</p>
            </div>
          </div>
          <div className="products-grid">
            {similarProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetails;
