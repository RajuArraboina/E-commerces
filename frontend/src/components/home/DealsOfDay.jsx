import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Clock, ArrowRight } from 'lucide-react';
import ProductCarousel from './ProductCarousel';

const DealsOfDay = ({ products = [], loading = false, onQuickView }) => {
  const [countdown, setCountdown] = useState({
    hours: 14,
    minutes: 36,
    seconds: 42,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="section-deals-of-the-day container" aria-label="Deals of the Day">
      <div className="marketplace-section-card card">
        <div className="marketplace-section-header">
          <div className="section-title-group">
            <div className="section-title-icon-box bg-warning-soft">
              <Zap size={22} className="text-warning" />
            </div>
            <div>
              <div className="deals-title-row">
                <h2 className="section-heading-marketplace">Deals of the Day</h2>
                <div className="deals-countdown-badge">
                  <Clock size={15} className="text-warning" />
                  <span className="countdown-label">Ends in:</span>
                  <span className="countdown-digits">
                    {String(countdown.hours).padStart(2, '0')}:
                    {String(countdown.minutes).padStart(2, '0')}:
                    {String(countdown.seconds).padStart(2, '0')}
                  </span>
                </div>
              </div>
              <p className="section-subheading-marketplace">
                Hand-picked discounts refreshed every 24 hours. Limited inventory available.
              </p>
            </div>
          </div>

          <Link to="/products?sort=-discount" className="btn btn-outline btn-sm view-all-deals-btn">
            <span>View All Deals</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        <ProductCarousel
          products={products}
          loading={loading}
          onQuickView={onQuickView}
          itemCount={5}
          emptyMessage="No deals active right now. Check back shortly!"
        />
      </div>
    </section>
  );
};

export default DealsOfDay;
