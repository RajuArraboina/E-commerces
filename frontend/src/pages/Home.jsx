import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import productService from '../services/productService';
import aiService from '../services/aiService';
import ProductCard from '../components/ProductCard';
import QuickViewModal from '../components/QuickViewModal';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  ArrowRight,
  Clock,
  ShieldCheck,
  Truck,
  RotateCcw,
  Percent,
  Flame,
  Tag,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Headphones,
  Shirt,
  Home as HomeIcon,
  Activity,
  Watch,
  ShoppingBag,
  Smartphone,
  Zap,
} from 'lucide-react';

// Popular 8 Categories specified in user requirements
const POPULAR_CATEGORIES = [
  {
    id: 'electronics',
    name: 'Electronics',
    tagline: 'Audio, Headphones & Laptops',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
    icon: Headphones,
    count: '140+ Items',
    accent: '#6366f1'
  },
  {
    id: 'fashion',
    name: 'Fashion',
    tagline: 'Trending Styles & Apparel',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600',
    icon: Shirt,
    count: '280+ Items',
    accent: '#ec4899'
  },
  {
    id: 'home-kitchen',
    name: 'Home & Kitchen',
    tagline: 'Smart Living & Cookware',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600',
    icon: HomeIcon,
    count: '190+ Items',
    accent: '#f59e0b'
  },
  {
    id: 'beauty',
    name: 'Beauty',
    tagline: 'Skincare, Scents & Grooming',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600',
    icon: Sparkles,
    count: '95+ Items',
    accent: '#a855f7'
  },
  {
    id: 'sports',
    name: 'Sports',
    tagline: 'Fitness, Activewear & Gear',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600',
    icon: Activity,
    count: '110+ Items',
    accent: '#10b981'
  },
  {
    id: 'accessories',
    name: 'Accessories',
    tagline: 'Smartwatches, Bags & Glass',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
    icon: Watch,
    count: '160+ Items',
    accent: '#3b82f6'
  },
  {
    id: 'grocery',
    name: 'Grocery',
    tagline: 'Daily Essentials & Pantry',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600',
    icon: ShoppingBag,
    count: '320+ Items',
    accent: '#84cc16'
  },
  {
    id: 'mobiles',
    name: 'Mobiles',
    tagline: '5G Pro Camera Smartphones',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600',
    icon: Smartphone,
    count: '85+ Items',
    accent: '#06b6d4'
  }
];

// Curated Seasonal Promotion Hero Slides
const HERO_SLIDES = [
  {
    id: 1,
    tag: '⚡ Mega AI Fest • Up to 45% OFF',
    title: 'Supercharged Developer Laptops & Gear',
    subtitle: 'Featuring Lenovo ThinkPad & HP Pavilion Coding editions with instant bank cashback.',
    code: 'AIFEST45',
    discount: '45% OFF',
    bgGradient: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
    poster: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-shopping-online-with-a-credit-card-and-laptop-42966-large.mp4',
    link: '/products?category=Laptops',
  },
  {
    id: 2,
    tag: '📱 5G Flagship Festival • Save ₹4,000',
    title: 'Pro Camera Smartphones with 50MP Sony Sensors',
    subtitle: 'OnePlus 12R & Galaxy S23 FE with high-speed Snapdragon performance & no-cost EMI.',
    code: 'PHONEAI',
    discount: 'Flat ₹4,000 Off',
    bgGradient: 'linear-gradient(135deg, #0f172a 0%, #172554 50%, #1e3a8a 100%)',
    poster: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-smartphone-with-a-green-screen-41223-large.mp4',
    link: '/products?category=Smartphones',
  },
  {
    id: 3,
    tag: '🎧 Spatial Audio Bonanza • Flat 40% Off',
    title: 'Active Noise Cancelling & Studio Wireless Audio',
    subtitle: 'Sony WH-1000XM5 and smart lifestyle tech with 30-hour battery & instant express delivery.',
    code: 'SOUND40',
    discount: 'Flat 40% Off',
    bgGradient: 'linear-gradient(135deg, #18052e 0%, #3b0764 50%, #581c87 100%)',
    poster: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-unpacking-a-box-bought-online-42866-large.mp4',
    link: '/products?category=Audio',
  },
  {
    id: 4,
    tag: '🎁 AI Wearables Specials • Buy 1 Get 1',
    title: 'Smart Tech Wearables & Accessories Festival',
    subtitle: 'Upgrade your productivity setup with curated fitness bands, watches and 1-year official brand warranty.',
    code: 'AIACCESS20',
    discount: '20% OFF',
    bgGradient: 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #0f766e 100%)',
    poster: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-shopping-online-with-a-credit-card-and-laptop-42966-large.mp4',
    link: '/products',
  }
];

const Home = () => {
  const navigate = useNavigate();
  const { appliedCoupon, applyCoupon } = useCart();
  const { isAuthenticated, user } = useAuth();

  // Data states from MongoDB
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Quick View Modal State
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // Recommendation active tab
  const [activeRecTab, setActiveRecTab] = useState('recommended');

  // Hero carousel & deals state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [countdown, setCountdown] = useState({ hours: 7, minutes: 34, seconds: 28 });
  const [copiedCode, setCopiedCode] = useState('');
  const [offerNotification, setOfferNotification] = useState('');

  // Auto-scroll promotions slider every 5.5 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Live countdown timer ticker for Flash Sale
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopyCode = (code) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(code);
    }
    applyCoupon(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2500);
  };

  const handleClaimOffer = (couponCode = 'SAVE25') => {
    applyCoupon(couponCode);
    setOfferNotification(`🎉 "${couponCode}" offer activated! Flat 25% discount will be applied to your cart.`);
    setTimeout(() => {
      navigate('/products');
    }, 900);
  };

  const handleOpenQuickView = (product) => {
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  };

  const handleCloseQuickView = () => {
    setIsQuickViewOpen(false);
    setQuickViewProduct(null);
  };


  const loadHomeData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Concurrent live fetch from MongoDB
      const [featRes, newRes, aiRecRes] = await Promise.all([
        productService.getProducts({ limit: 8, sort: '-rating' }),
        productService.getProducts({ limit: 4, sort: 'newest' }),
        aiService.getRecommendations(),
      ]);

      if (featRes?.success) {
        setTrendingProducts(featRes.data || []);
        setFlashSaleProducts(featRes.data?.slice(0, 4) || []);
      }
      if (newRes?.success) setPopularProducts(newRes.data || []);
      if (aiRecRes?.success && aiRecRes.data) {
        setRecommendedProducts(aiRecRes.data.recommendedForYou || aiRecRes.data.trending || []);
      }

      // Load recently viewed from localStorage
      const savedRecent = localStorage.getItem('shopsphere_recently_viewed');
      if (savedRecent) {
        try {
          setRecentlyViewed(JSON.parse(savedRecent));
        } catch {
          setRecentlyViewed([]);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load store catalog from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHomeData();
  }, []);

  return (
    <div className="home-page">
      {/* =========================================================================
          2. HERO SECTION
          Modern lifestyle photography, gradient visuals, primary "Shop Now" and
          secondary "Explore Categories" CTAs, with seasonal highlight switcher
         ========================================================================= */}
      <section className="hero-banner section-promo-slider-wrapper full-screen-promo">
        <div
          className="promo-slider-container"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Slider Slides Track */}
          <div className="promo-slider-track">
            {HERO_SLIDES.map((slide, idx) => {
              const isActive = idx === currentSlide;
              return (
                <div
                  key={slide.id}
                  className={`promo-slide-item ${isActive ? 'active' : ''}`}
                  style={{
                    background: slide.bgGradient,
                    opacity: isActive ? 1 : 0,
                    pointerEvents: isActive ? 'auto' : 'none',
                    zIndex: isActive ? 2 : 1,
                  }}
                >
                  {/* Background Video / Media */}
                  <div className="promo-slide-media">
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      poster={slide.poster}
                      src={slide.videoUrl}
                      className="promo-slide-video"
                    />
                    <div className="promo-slide-gradient-overlay" />
                  </div>

                  {/* Slide Content Overlay */}
                  <div className="promo-slide-content">
                    <div className="hero-badge-row">
                      <span className="hero-badge hero-offer-badge">
                        <Sparkles size={15} className="text-accent" /> Offer: Shop for ₹5,000 & Get ₹250 OFF
                      </span>
                    </div>

                    <h1 className="hero-heading">Discover Products You'll Love</h1>
                    <p className="hero-subheading">Shop smarter. Live better.</p>
                    <p className="hero-description">{slide.subtitle}</p>

                    <div className="hero-actions-row">
                      {/* Primary CTA */}
                      <Link to="/products" className="btn btn-primary btn-lg hero-cta-btn">
                        <span>Shop Now</span>
                        <ArrowRight size={18} />
                      </Link>

                      {/* Secondary CTA */}
                      <a href="#categories" className="btn btn-outline-light hero-secondary-btn">
                        <span>Explore Categories</span>
                      </a>
                    </div>

                    <div className="hero-perks-row" style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      {/* Interactive Coupon Box */}
                      <button
                        type="button"
                        className={`promo-code-box ${appliedCoupon?.code === slide.code ? 'active-coupon' : ''}`}
                        onClick={() => handleCopyCode(slide.code)}
                        title="Click to copy & apply coupon code"
                      >
                        <Tag size={14} />
                        <span>Code: <strong>{slide.code}</strong></span>
                        {copiedCode === slide.code ? (
                          <span className="code-copied-tag"><Check size={12} /> Applied!</span>
                        ) : appliedCoupon?.code === slide.code ? (
                          <span className="code-copied-tag"><Check size={12} /> Active</span>
                        ) : (
                          <Copy size={12} className="copy-icon" />
                        )}
                      </button>

                      {/* Deal Timer */}
                      <div className="promo-timer-box">
                        <Clock size={14} />
                        <span>Ends in: {String(countdown.hours).padStart(2, '0')}h {String(countdown.minutes).padStart(2, '0')}m {String(countdown.seconds).padStart(2, '0')}s</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Slider Arrow Controls */}
          <button
            type="button"
            className="promo-nav-btn prev"
            onClick={() => setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
            aria-label="Previous Slide"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            type="button"
            className="promo-nav-btn next"
            onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
            aria-label="Next Slide"
          >
            <ChevronRight size={24} />
          </button>

          {/* Slide Indicator Dots */}
          <div className="promo-slider-dots">
            {HERO_SLIDES.map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                className={`promo-dot ${idx === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. TRUST & VALUE FEATURES SECTION (Immediate Trust & Reassurance)
         ========================================================================= */}
      <section className="section-trust container">
        <div className="trust-grid">
          <div className="trust-card card">
            <div className="trust-icon-box bg-primary-soft text-primary">
              <Truck size={24} />
            </div>
            <div className="trust-info">
              <h4>Fast Delivery</h4>
              <p>Express dispatch to all Indian pin codes</p>
            </div>
          </div>

          <div className="trust-card card">
            <div className="trust-icon-box bg-success-soft text-success">
              <ShieldCheck size={24} />
            </div>
            <div className="trust-info">
              <h4>Secure Payments</h4>
              <p>100% encrypted UPI, Cards & NetBanking</p>
            </div>
          </div>

          <div className="trust-card card">
            <div className="trust-icon-box bg-accent-soft text-accent">
              <RotateCcw size={24} />
            </div>
            <div className="trust-info">
              <h4>Easy Returns</h4>
              <p>Hassle-free 7-day replacement guarantee</p>
            </div>
          </div>

          <div className="trust-card card">
            <div className="trust-icon-box bg-warning-soft text-warning">
              <Sparkles size={24} />
            </div>
            <div className="trust-info">
              <h4>24/7 Customer Support</h4>
              <p>Dedicated assistance & AI smart concierge</p>
            </div>
          </div>
        </div>
      </section>

      {/* Offer Notification Toast */}
      {offerNotification && (
        <div className="container" style={{ margin: '10px auto 20px' }}>
          <div className="offer-notification-toast">
            <Check size={16} />
            <span>{offerNotification}</span>
          </div>
        </div>
      )}

      {/* =========================================================================
          3. CATEGORY SECTION
          Display popular categories using attractive cards with icon/image & hover:
          Electronics, Fashion, Home & Kitchen, Beauty, Sports, Accessories, Grocery, Mobiles
         ========================================================================= */}
      <section id="categories" className="section-categories container">
        <div className="section-header">
          <div>
            <span className="section-tag">
              <ShoppingBag size={14} className="text-primary" /> Curated Collections
            </span>
            <h2 className="section-title">Popular Categories</h2>
            <p className="section-subtitle">Explore handpicked products tailored to your lifestyle</p>
          </div>
          <Link to="/categories" className="btn btn-outline btn-sm">
            <span>View All Categories</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        <div className="categories-grid-modern">
          {POPULAR_CATEGORIES.map((cat) => {
            const IconComponent = cat.icon;
            return (
              <Link
                key={cat.id}
                to={`/products?category=${encodeURIComponent(cat.name)}`}
                className="category-card-modern card"
              >
                <div className="category-img-container">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="category-modern-img"
                    loading="lazy"
                  />
                  <div className="category-modern-overlay" />
                  <span className="category-icon-floating">
                    <IconComponent size={20} />
                  </span>
                </div>
                <div className="category-modern-body">
                  <h3 className="category-modern-name">{cat.name}</h3>
                  <span className="category-modern-tagline">{cat.tagline}</span>
                  <span className="category-modern-count">{cat.count}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          5. FLASH SALE SECTION
          Limited-time offers with live countdown timer, discount badges & product cards
         ========================================================================= */}
      <section className="section-flash-sale container">
        <div className="flash-sale-wrapper card">
          <div className="flash-sale-header">
            <div className="flash-title-block">
              <span className="flash-live-pill">
                <Zap size={14} className="flash-zap" /> FLASH SALE
              </span>
              <h2 className="flash-title">Limited-Time Exclusive Deals</h2>
              <p className="flash-sub">Massive savings on verified electronics & top-rated lifestyle tech</p>
            </div>

            <div className="flash-timer-block">
              <span className="timer-label">Ending in:</span>
              <div className="countdown-clock">
                <div className="clock-segment">
                  <span className="clock-digits">{String(countdown.hours).padStart(2, '0')}</span>
                  <small>Hours</small>
                </div>
                <span className="clock-colon">:</span>
                <div className="clock-segment">
                  <span className="clock-digits">{String(countdown.minutes).padStart(2, '0')}</span>
                  <small>Mins</small>
                </div>
                <span className="clock-colon">:</span>
                <div className="clock-segment">
                  <span className="clock-digits">{String(countdown.seconds).padStart(2, '0')}</span>
                  <small>Secs</small>
                </div>
              </div>

              <Link to="/products" className="btn btn-primary flash-deals-btn">
                <span>Shop Deals</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="flash-products-grid">
            {loading ? (
              <Loading />
            ) : flashSaleProducts.length > 0 ? (
              flashSaleProducts.map((p) => (
                <ProductCard key={p._id} product={p} onQuickView={handleOpenQuickView} />
              ))
            ) : error ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                <p>Unable to load live deals. Please ensure the backend server is running on port 5000.</p>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                <p>No active flash deals right now. Check back soon!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. TRENDING PRODUCTS
          Responsive product grid with image, name, brand, rating, reviews,
          current price, original price, discount %, wishlist, add to cart, quick view
         ========================================================================= */}
      <section className="section-trending-products container">
        <div className="section-header">
          <div>
            <span className="section-tag">
              <Flame size={14} className="text-danger" /> Trending Now
            </span>
            <h2 className="section-title">Trending Products</h2>
            <p className="section-subtitle">Top customer favorites selling fast across India</p>
          </div>
          <Link to="/products" className="btn btn-outline btn-sm">
            <span>View All Products</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : (
          <div className="products-grid">
            {trendingProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onQuickView={handleOpenQuickView}
              />
            ))}
          </div>
        )}
      </section>

      {/* =========================================================================
          7. SPECIAL OFFERS SECTION
          Promotional cards: Up to 50% Off, New Arrivals, Weekend Deals, Best Sellers
         ========================================================================= */}
      <section className="section-special-offers container">
        <div className="section-header">
          <div>
            <span className="section-tag">
              <Percent size={14} className="text-success" /> Handpicked Discounts
            </span>
            <h2 className="section-title">Special Offers & Season Deals</h2>
            <p className="section-subtitle">Unlock limited-time coupons and exclusive savings</p>
          </div>
        </div>

        <div className="special-offers-quad-grid">
          {/* Card 1: Up to 50% Off */}
          <div className="special-promo-card card offer-gradient-1">
            <div className="offer-card-content">
              <span className="offer-tag-badge">Exclusive Deal</span>
              <h3 className="offer-heading">Up to 50% Off</h3>
              <p className="offer-desc">Flagship studio headphones, noise-canceling earbuds & high-fidelity audio.</p>
              <div className="offer-coupon-chip-small">
                <span>Code: <strong>SOUND40</strong></span>
              </div>
              <button
                type="button"
                onClick={() => handleClaimOffer('SOUND40')}
                className="btn btn-primary btn-sm offer-cta-btn"
              >
                <span>Claim Offer</span>
                <ArrowRight size={14} />
              </button>
            </div>
            <div className="offer-card-media">
              <img
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"
                alt="Up to 50% Off Audio"
                loading="lazy"
              />
            </div>
          </div>

          {/* Card 2: New Arrivals */}
          <div className="special-promo-card card offer-gradient-2">
            <div className="offer-card-content">
              <span className="offer-tag-badge">Trending 2026</span>
              <h3 className="offer-heading">New Arrivals</h3>
              <p className="offer-desc">Next-Gen Ryzen 7 laptops, creator workstations & developer gear.</p>
              <div className="offer-coupon-chip-small">
                <span>Code: <strong>AIFEST45</strong></span>
              </div>
              <button
                type="button"
                onClick={() => handleClaimOffer('AIFEST45')}
                className="btn btn-primary btn-sm offer-cta-btn"
              >
                <span>Shop New Gear</span>
                <ArrowRight size={14} />
              </button>
            </div>
            <div className="offer-card-media">
              <img
                src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500"
                alt="New Arrivals Laptops"
                loading="lazy"
              />
            </div>
          </div>

          {/* Card 3: Weekend Deals */}
          <div className="special-promo-card card offer-gradient-3">
            <div className="offer-card-content">
              <span className="offer-tag-badge">Weekend Specials</span>
              <h3 className="offer-heading">Weekend Deals</h3>
              <p className="offer-desc">Flat ₹4,000 instant discount on 5G Pro smartphones & AMOLED flagships.</p>
              <div className="offer-coupon-chip-small">
                <span>Code: <strong>PHONEAI</strong></span>
              </div>
              <button
                type="button"
                onClick={() => handleClaimOffer('PHONEAI')}
                className="btn btn-primary btn-sm offer-cta-btn"
              >
                <span>Explore Deals</span>
                <ArrowRight size={14} />
              </button>
            </div>
            <div className="offer-card-media">
              <img
                src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500"
                alt="Weekend Smartphone Deals"
                loading="lazy"
              />
            </div>
          </div>

          {/* Card 4: Best Sellers */}
          <div className="special-promo-card card offer-gradient-4">
            <div className="offer-card-content">
              <span className="offer-tag-badge">Customer Favorites</span>
              <h3 className="offer-heading">Best Sellers</h3>
              <p className="offer-desc">Top rated smart wearables, watches, and smart lifestyle accessories.</p>
              <div className="offer-coupon-chip-small">
                <span>Code: <strong>AIACCESS20</strong></span>
              </div>
              <button
                type="button"
                onClick={() => handleClaimOffer('AIACCESS20')}
                className="btn btn-primary btn-sm offer-cta-btn"
              >
                <span>View Best Sellers</span>
                <ArrowRight size={14} />
              </button>
            </div>
            <div className="offer-card-media">
              <img
                src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"
                alt="Best Sellers Wearables"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. PERSONALIZED RECOMMENDATIONS SECTION
          For logged-in users and visitors:
          - "Recommended For You"
          - "Recently Viewed"
          - "Similar Products / Best Deals"
         ========================================================================= */}
      <section className="section-recommendations container">
        <div className="recommendations-box card">
          <div className="rec-header-row">
            <div>
              <div className="ai-badge">
                <Sparkles size={16} className="text-accent" />
                <span>AI Personalized Picks</span>
              </div>
              <h2 className="section-title">
                {isAuthenticated ? `Curated for You, ${user?.name || 'Shopper'}` : "Personalized Recommendations"}
              </h2>
              <p className="section-subtitle">
                Tailored based on your browsing preferences and trending store interests
              </p>
            </div>

            {/* Recommendation Tab Switches */}
            <div className="rec-tabs">
              <button
                type="button"
                className={`rec-tab-btn ${activeRecTab === 'recommended' ? 'active' : ''}`}
                onClick={() => setActiveRecTab('recommended')}
              >
                Recommended For You
              </button>
              {recentlyViewed.length > 0 && (
                <button
                  type="button"
                  className={`rec-tab-btn ${activeRecTab === 'recent' ? 'active' : ''}`}
                  onClick={() => setActiveRecTab('recent')}
                >
                  Recently Viewed ({recentlyViewed.length})
                </button>
              )}
              <button
                type="button"
                className={`rec-tab-btn ${activeRecTab === 'popular' ? 'active' : ''}`}
                onClick={() => setActiveRecTab('popular')}
              >
                Top Popular
              </button>
            </div>
          </div>

          {/* Active Tab Grid */}
          <div className="products-grid" style={{ marginTop: '24px' }}>
            {activeRecTab === 'recommended' &&
              (recommendedProducts.length > 0
                ? recommendedProducts.slice(0, 4).map((p) => (
                    <ProductCard key={p._id} product={p} onQuickView={handleOpenQuickView} />
                  ))
                : trendingProducts.slice(0, 4).map((p) => (
                    <ProductCard key={p._id} product={p} onQuickView={handleOpenQuickView} />
                  )))}

            {activeRecTab === 'recent' &&
              recentlyViewed.slice(0, 4).map((p) => (
                <ProductCard key={p._id} product={p} onQuickView={handleOpenQuickView} />
              ))}

            {activeRecTab === 'popular' &&
              (popularProducts.length > 0
                ? popularProducts.slice(0, 4).map((p) => (
                    <ProductCard key={p._id} product={p} onQuickView={handleOpenQuickView} />
                  ))
                : trendingProducts.slice(4, 8).map((p) => (
                    <ProductCard key={p._id} product={p} onQuickView={handleOpenQuickView} />
                  )))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          11. QUICK VIEW MODAL
          Instant modal preview with images, description, stock status & Add to Cart
         ========================================================================= */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={isQuickViewOpen}
        onClose={handleCloseQuickView}
      />
    </div>
  );
};

export default Home;
