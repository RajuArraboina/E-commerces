import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Clock,
  Tag,
  Copy,
  Check,
  ShieldCheck,
  Flame,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import bannerService from '../../services/bannerService';

const FALLBACK_SLIDES = [
  {
    id: 'laptops-fest',
    badge: 'LIMITED TIME OFFER',
    title: 'Supercharged Developer Laptops',
    subtitle: 'ThinkPad, Pavilion & MacBook Creator Editions',
    description: 'Ultra-fast NVMe storage, OLED displays, and dedicated AI accelerators with instant bank discount.',
    discount: 'Up to 45% OFF',
    code: 'AIFEST45',
    link: '/products?category=Laptops',
    bgGradient: 'linear-gradient(135deg, #090d16 0%, #151632 50%, #201a4e 100%)',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=900',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-shopping-online-with-a-credit-card-and-laptop-42966-large.mp4',
  },
  {
    id: 'flagship-mobiles',
    badge: 'FLAGSHIP FESTIVAL',
    title: '5G Pro Camera Smartphones',
    subtitle: 'Sony IMX Sensors, AMOLED Displays & Snapdragon 8 Gen 3',
    description: 'Experience pro mobile photography, all-day battery life, and rapid 100W SuperVOOC charging.',
    discount: 'Flat ₹4,000 OFF',
    code: 'PHONEAI',
    link: '/products?category=Smartphones',
    bgGradient: 'linear-gradient(135deg, #070f1e 0%, #0c1c38 50%, #162a56 100%)',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-smartphone-with-a-green-screen-41223-large.mp4',
  },
  {
    id: 'studio-audio',
    badge: 'SPATIAL AUDIO BONANZA',
    title: 'Active Noise Cancelling Studio Audio',
    subtitle: 'Hi-Res Wireless LDAC, 40-Hour Battery & Spatial Audio',
    description: 'Immerse yourself in crystal clear studio acoustics, multi-point Bluetooth 5.3, and ultra-plush comfort.',
    discount: 'Flat 40% OFF',
    code: 'SOUND40',
    link: '/products?category=Audio',
    bgGradient: 'linear-gradient(135deg, #130a21 0%, #251341 50%, #3d1b66 100%)',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-unpacking-a-box-bought-online-42866-large.mp4',
  },
  {
    id: 'smart-wearables',
    badge: 'SMART WEARABLES SPECIAL',
    title: 'Next-Gen Smartwatches & Fitness Bands',
    subtitle: 'AMOLED Always-On, GPS Tracking & Heart-Rate BioSensors',
    description: 'Track workouts, monitor health metrics, and stay connected with Bluetooth calling and 10-day battery.',
    discount: 'Flat 20% OFF',
    code: 'AIACCESS20',
    link: '/products?category=Accessories',
    bgGradient: 'linear-gradient(135deg, #031e1e 0%, #06393b 50%, #0e5b56 100%)',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-shopping-online-with-a-credit-card-and-laptop-42966-large.mp4',
  },
];

const HeroCarousel = () => {
  const navigate = useNavigate();
  const { appliedCoupon, applyCoupon } = useCart();
  const [slides, setSlides] = useState(FALLBACK_SLIDES);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [copiedCode, setCopiedCode] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef(null);

  // Live countdown timer ticker (Dynamic hours/mins/secs)
  const [countdown, setCountdown] = useState({ hours: 7, minutes: 42, seconds: 15 });

  // Load dynamic banners from backend service
  useEffect(() => {
    bannerService.getBanners().then((res) => {
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        setSlides(res.data);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 11, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Autoplay with pause-on-hover
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handleCopyCode = (code) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(code);
    }
    applyCoupon(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2500);
  };

  // Touch swipe support for mobile
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;
    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    touchStartXRef.current = null;
  };

  return (
    <section
      className="hero-carousel-section marketplace-hero-container"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Promotional Hero Banners"
    >
      {/* Sleek Semi-Transparent Hover Arrows */}
      <button
        type="button"
        className="hero-carousel-arrow hero-arrow-left"
        onClick={handlePrev}
        aria-label="Previous banner"
      >
        <ChevronLeft size={24} />
      </button>

      <button
        type="button"
        className="hero-carousel-arrow hero-arrow-right"
        onClick={handleNext}
        aria-label="Next banner"
      >
        <ChevronRight size={24} />
      </button>

      <div className="hero-carousel-track">
        {slides.map((slide, idx) => {
          const isActive = idx === currentSlide;
          const isCouponApplied = appliedCoupon?.code === slide.code;
          const isCopied = copiedCode === slide.code;

          return (
            <div
              key={slide.id}
              className={`hero-slide-item ${isActive ? 'active' : ''}`}
              style={{
                background: slide.bgGradient,
                opacity: isActive ? 1 : 0,
                pointerEvents: isActive ? 'auto' : 'none',
              }}
            >
              {/* Media Backdrop (Video & Image Overlay) */}
              <div className="hero-slide-media">
                {slide.videoUrl ? (
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    poster={slide.image}
                    src={slide.videoUrl}
                    className="hero-slide-video"
                  />
                ) : (
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="hero-slide-video"
                    loading="lazy"
                  />
                )}
                <div className="hero-slide-vignette" />
              </div>

              {/* Slide Content Box */}
              <div className="container hero-slide-container">
                <div className="hero-slide-content">
                  {/* Badge Row */}
                  <div className="hero-badge-row">
                    <span className="hero-chip hero-badge-limited">
                      <Flame size={14} className="text-warning" />
                      {slide.badge}
                    </span>
                    <span className="hero-chip hero-badge-discount">
                      <Sparkles size={14} className="text-accent" />
                      {slide.discount}
                    </span>
                  </div>

                  <h1 className="hero-title hero-carousel-title">{slide.title}</h1>
                  <p className="hero-subtitle hero-carousel-subtitle">{slide.subtitle}</p>
                  <p className="hero-description hero-carousel-description">{slide.description}</p>

                  {/* Primary & Secondary CTA Buttons */}
                  <div className="hero-cta-row">
                    <Link to={slide.link} className="btn btn-primary btn-lg hero-btn-primary">
                      <span>{slide.ctaText || 'Shop Now'}</span>
                      <ArrowRight size={18} />
                    </Link>

                    <a href="#categories" className="btn btn-outline hero-btn-secondary">
                      <span>Explore Categories</span>
                    </a>
                  </div>

                  {/* Coupon & Live Countdown Box */}
                  <div className="hero-perks-bar">
                    <button
                      type="button"
                      className={`hero-coupon-pill ${isCouponApplied ? 'active' : ''}`}
                      onClick={() => handleCopyCode(slide.code)}
                      title="Click to copy & auto-apply coupon to cart"
                      aria-label="Copy coupon code"
                    >
                      <Tag size={14} className="text-accent" />
                      <span>CODE: <strong>{slide.code}</strong></span>
                      {isCopied ? (
                        <span className="hero-code-tag success"><Check size={12} /> Applied!</span>
                      ) : isCouponApplied ? (
                        <span className="hero-code-tag active"><Check size={12} /> Active</span>
                      ) : (
                        <Copy size={13} className="copy-icon" />
                      )}
                    </button>

                    <div className="hero-timer-pill">
                      <Clock size={14} className="text-warning" />
                      <span>ENDS IN:</span>
                      <strong>
                        {String(countdown.hours).padStart(2, '0')}:
                        {String(countdown.minutes).padStart(2, '0')}:
                        {String(countdown.seconds).padStart(2, '0')}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Floating Product Hero Showcase Image */}
                <div className="hero-slide-product-showcase hide-on-mobile">
                  <div className="showcase-card-wrapper">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="showcase-product-img"
                      loading="lazy"
                    />
                    <div className="showcase-floating-badge">
                      <ShieldCheck size={16} className="text-success" />
                      <span>Official Brand Warranty</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Dots */}
      <div className="hero-dots-indicator-row">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`hero-dot-indicator ${i === currentSlide ? 'active' : ''}`}
            onClick={() => setCurrentSlide(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroCarousel;
