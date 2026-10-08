import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, ArrowRight, RefreshCw } from 'lucide-react';
import ProductCard from '../ProductCard';
import { ProductSkeleton } from './SkeletonCard';

const FlashSale = ({ products = [], loading = false, error = null, onQuickView, onRetry }) => {
  // Real-time ticking countdown clock for Flash Sale
  const [countdown, setCountdown] = useState(() => {
    return { hours: 6, minutes: 28, seconds: 45 };
  });

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

  return (
    <section className="section-flash-sale container" aria-label="Flash Deals and Limited Discounts">
      <div className="flash-sale-wrapper card">
        <div className="flash-sale-header">
          <div className="flash-title-block">
            <span className="flash-live-pill">
              <Zap size={14} className="flash-zap" /> FLASH SALE
            </span>
            <h2 className="flash-title">Grab the deal before it disappears!</h2>
            <p className="flash-sub">
              Limited inventory at verified lowest seasonal prices across all categories
            </p>
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

            <Link to="/products?deal=flash" className="btn btn-primary flash-deals-btn">
              <span>View All Deals</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flash-products-grid">
          {loading ? (
            <>
              <ProductSkeleton />
              <ProductSkeleton />
              <ProductSkeleton />
              <ProductSkeleton />
            </>
          ) : error ? (
            <div className="section-error-box" style={{ gridColumn: '1 / -1' }}>
              <p>Unable to load flash sale products.</p>
              {onRetry && (
                <button type="button" onClick={onRetry} className="btn btn-outline btn-sm">
                  <RefreshCw size={14} />
                  <span>Try Again</span>
                </button>
              )}
            </div>
          ) : products.length === 0 ? (
            <div className="section-empty-box" style={{ gridColumn: '1 / -1' }}>
              <p>No active flash deals right now. Check back soon!</p>
            </div>
          ) : (
            products.slice(0, 4).map((product) => (
              <ProductCard
                key={product._id}
                product={{
                  ...product,
                  badge: 'FLASH DEAL',
                }}
                onQuickView={onQuickView}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default FlashSale;
