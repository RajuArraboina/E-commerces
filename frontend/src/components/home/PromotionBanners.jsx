import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Tag, Percent } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const DEFAULT_BANNERS = [
  {
    id: 'electronics-sale',
    tag: 'Mega Electronics Fest',
    title: 'Flagship Audio & Laptops',
    discount: 'Up to 50% OFF',
    desc: 'Top noise-cancelling headphones, spatial earbuds and developer workstations.',
    code: 'SOUND40',
    link: '/products?category=Audio',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700',
    gradientClass: 'offer-gradient-1',
  },
  {
    id: 'smartphone-deals',
    tag: '5G Mobile Carnival',
    title: 'Next-Gen Smartphones',
    discount: 'Flat ₹4,000 OFF',
    desc: 'High refresh rate AMOLED screens, 50MP Sony sensors & rapid fast charging.',
    code: 'PHONEAI',
    link: '/products?category=Smartphones',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=700',
    gradientClass: 'offer-gradient-3',
  },
  {
    id: 'lifestyle-tech',
    tag: 'Smart Life Upgrade',
    title: 'Wearables & Smart Tech',
    discount: 'New Styles from ₹499',
    desc: 'Fitness trackers, smart watches and intelligent productivity essentials.',
    code: 'AIACCESS20',
    link: '/products?category=Accessories',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700',
    gradientClass: 'offer-gradient-4',
  },
];

const PromotionBanners = ({ banners = DEFAULT_BANNERS }) => {
  const { applyCoupon } = useCart();

  const handleClaim = (code) => {
    if (code) applyCoupon(code);
  };

  return (
    <section id="special-offers" className="section-promo-banners container" aria-label="Promotional Deals & Banners">
      <div className="section-header">
        <div>
          <span className="section-tag">
            <Percent size={14} className="text-success" /> Handpicked Discounts
          </span>
          <h2 className="section-title">Special Offers & Seasonal Deals</h2>
          <p className="section-subtitle">
            Curated discount campaigns and instant cashback coupons across trending categories
          </p>
        </div>
      </div>

      <div className="promo-banners-tri-grid">
        {banners.map((b) => (
          <div key={b.id} className={`special-promo-card card ${b.gradientClass}`}>
            <div className="offer-card-content">
              <span className="offer-tag-badge">{b.tag}</span>
              <h3 className="offer-heading">{b.title}</h3>
              <p className="offer-discount-lead">{b.discount}</p>
              <p className="offer-desc">{b.desc}</p>

              {b.code && (
                <div className="offer-coupon-chip-small">
                  <Tag size={12} className="text-accent" />
                  <span>Code: <strong>{b.code}</strong></span>
                </div>
              )}

              <div className="offer-card-actions">
                <Link
                  to={b.link}
                  onClick={() => handleClaim(b.code)}
                  className="btn btn-primary btn-sm offer-cta-btn"
                >
                  <span>Explore Deal</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            <div className="offer-card-media">
              <img
                src={b.image}
                alt={b.title}
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500';
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PromotionBanners;
