import React, { useState, useEffect } from 'react';
import { Tag, Copy, Check, Sparkles, Percent } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import offerService from '../../services/offerService';

const OfferSection = () => {
  const { applyCoupon, appliedCoupon } = useCart();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState('');

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        const res = await offerService.getOffers();
        if (res?.success && Array.isArray(res.data)) {
          setOffers(res.data);
        }
      } catch (err) {
        console.error('Failed to load offers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);

  const handleCopy = (code) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(code);
    }
    applyCoupon(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2400);
  };

  if (!loading && offers.length === 0) return null;

  return (
    <section className="section-exclusive-offers container" aria-label="Exclusive Coupons and Offers">
      <div className="marketplace-section-card offers-theme-card card">
        <div className="marketplace-section-header">
          <div className="section-title-group">
            <div className="section-title-icon-box bg-accent-soft">
              <Percent size={22} className="text-accent" />
            </div>
            <div>
              <div className="deals-title-row">
                <h2 className="section-heading-marketplace">Exclusive Offers</h2>
                <span className="section-badge-pill offer-pill">
                  <Sparkles size={13} /> Instant Discounts
                </span>
              </div>
              <p className="section-subheading-marketplace">
                Apply verified promo codes at checkout for instant savings across your order.
              </p>
            </div>
          </div>
        </div>

        <div className="offers-grid-marketplace">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="offer-voucher-card skeleton-box" style={{ height: '140px' }} />
            ))
          ) : (
            offers.map((offer) => {
              const isApplied = appliedCoupon?.code === offer.code;
              const isCopied = copiedCode === offer.code;

              return (
                <div key={offer.id} className="offer-voucher-card card">
                  <div className="voucher-left-stub">
                    <span className="voucher-stub-badge">{offer.badge}</span>
                    <h3 className="voucher-title">{offer.title}</h3>
                    <p className="voucher-min-order">
                      Min order ₹{offer.minOrder?.toLocaleString('en-IN')}
                    </p>
                    <p className="voucher-desc text-muted text-xs">{offer.description}</p>
                  </div>

                  <div className="voucher-right-action">
                    <div className="voucher-code-display">
                      <Tag size={13} className="text-accent" />
                      <strong>{offer.code}</strong>
                    </div>

                    <button
                      type="button"
                      className={`btn btn-sm ${isApplied ? 'btn-success' : 'btn-outline'} voucher-btn`}
                      onClick={() => handleCopy(offer.code)}
                    >
                      {isCopied ? (
                        <>
                          <Check size={14} />
                          <span>Copied!</span>
                        </>
                      ) : isApplied ? (
                        <>
                          <Check size={14} />
                          <span>Applied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                    <span className="voucher-expiry text-xs text-muted">{offer.expiry}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

export default OfferSection;
