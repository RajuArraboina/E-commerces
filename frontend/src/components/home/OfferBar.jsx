import React, { useState, useEffect } from 'react';
import { Sparkles, Copy, Check, Clock, X, Tag } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const OfferBar = ({ onDismiss }) => {
  const { appliedCoupon, applyCoupon, availableCoupons } = useCart();
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(() => {
    return sessionStorage.getItem('shopsphere_offer_bar_dismissed') !== 'true';
  });

  // Dynamic active promotional offer from available coupons list
  const activeOffer = availableCoupons?.find((c) => c.code === 'SHOP5000') ||
    availableCoupons?.[0] || {
      code: 'SHOP5000',
      title: 'Flat ₹250 Off on ₹5,000+ Shopping',
      discountFlat: 250,
      description: '✨ Limited Time Offer — Shop for ₹5,000 & Get ₹250 OFF',
    };

  // Live countdown timer ticker (Dynamic countdown from current time to end of day)
  const [timeLeft, setTimeLeft] = useState(() => {
    const now = new Date();
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const diff = Math.max(0, Math.floor((endOfDay - now) / 1000));
    return {
      hours: Math.floor(diff / 3600),
      minutes: Math.floor((diff % 3600) / 60),
      seconds: diff % 60,
    };
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 11, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(activeOffer.code);
    }
    applyCoupon(activeOffer.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleClose = () => {
    setVisible(false);
    sessionStorage.setItem('shopsphere_offer_bar_dismissed', 'true');
    if (onDismiss) onDismiss();
  };

  if (!visible) return null;

  const isApplied = appliedCoupon?.code === activeOffer.code;

  return (
    <div className="top-offer-bar">
      <div className="top-offer-container">
        <div className="offer-pill-group">
          <span className="offer-icon-pulse">
            <Sparkles size={14} className="text-warning" />
          </span>
          <span className="offer-main-text">
            {activeOffer.description || `Limited Time Offer — Shop for ₹5,000 & Get ₹${activeOffer.discountFlat || 250} OFF`}
          </span>
        </div>

        <div className="offer-actions-group">
          {/* Coupon Code Pill */}
          <div className="offer-coupon-block">
            <Tag size={13} className="text-accent" />
            <span className="offer-code-label">CODE:</span>
            <strong className="offer-code-val">{activeOffer.code}</strong>
            <button
              type="button"
              className={`offer-copy-btn ${isApplied || copied ? 'applied' : ''}`}
              onClick={handleCopy}
              title="Click to copy & apply code"
              aria-label="Copy coupon code"
            >
              {copied || isApplied ? (
                <>
                  <Check size={13} />
                  <span>{copied ? 'Copied!' : 'Active'}</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Real-time Countdown Timer */}
          <div className="offer-timer-block">
            <Clock size={13} className="text-muted" />
            <span className="timer-label">ENDS IN:</span>
            <span className="timer-digits">
              {String(timeLeft.hours).padStart(2, '0')}:
              {String(timeLeft.minutes).padStart(2, '0')}:
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
          </div>

          {/* Dismiss button */}
          <button
            type="button"
            className="offer-close-btn"
            onClick={handleClose}
            aria-label="Close offer banner"
            title="Dismiss offer"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfferBar;
