import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, ArrowRight } from 'lucide-react';
import ProductCarousel from './ProductCarousel';

const ElectronicsSection = ({ products = [], loading = false, onQuickView }) => {
  return (
    <section className="section-marketplace-category container" aria-label="Best of Electronics">
      <div className="marketplace-split-showcase card">
        {/* Left Side: Large Featured Category Promo Card */}
        <div className="category-featured-promo-panel electronics-promo-theme">
          <div className="promo-panel-content">
            <span className="promo-panel-badge">
              <Cpu size={14} className="text-accent" />
              <span>FLAGSHIP TECH</span>
            </span>

            <h2 className="promo-panel-title">Best of Electronics</h2>
            <p className="promo-panel-subtitle">
              Next-gen laptops, 5G smartphones, wireless audio & smart wearable tech.
            </p>

            <div className="promo-discount-callout">
              <span className="discount-tag-big">UP TO 60% OFF</span>
              <span className="discount-sub">Official Warranty Included</span>
            </div>

            <div className="promo-subcategories-chips">
              <Link to="/products?category=Laptops" className="subcat-chip">Laptops</Link>
              <Link to="/products?category=Smartphones" className="subcat-chip">Smartphones</Link>
              <Link to="/products?category=Audio" className="subcat-chip">Audio & ANC</Link>
              <Link to="/products?category=Accessories" className="subcat-chip">Wearables</Link>
            </div>

            <Link to="/products?category=Electronics" className="btn btn-primary promo-panel-cta">
              <span>Explore Electronics</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Right Side: Product Carousel */}
        <div className="category-products-carousel-panel">
          <div className="panel-carousel-header">
            <div>
              <h3 className="panel-sub-title">Top Electronics Deals</h3>
              <p className="panel-sub-desc text-muted">Curated from top technology brands</p>
            </div>
            <Link to="/products?category=Electronics" className="view-more-link">
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <ProductCarousel
            products={products}
            loading={loading}
            onQuickView={onQuickView}
            itemCount={4}
            emptyMessage="No electronics products loaded. Check back soon!"
          />
        </div>
      </div>
    </section>
  );
};

export default ElectronicsSection;
