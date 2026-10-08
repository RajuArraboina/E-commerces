import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Flower2 } from 'lucide-react';
import ProductCarousel from './ProductCarousel';

const BEAUTY_PILLS = [
  'Skincare',
  'Haircare',
  'Grooming',
  'Fragrance',
  'Wellness',
];

const BeautySection = ({ products = [], loading = false, onQuickView }) => {
  return (
    <section className="section-beauty-showcase container" aria-label="Beauty Essentials">
      <div className="marketplace-section-card beauty-theme-card card">
        <div className="marketplace-section-header">
          <div className="section-title-group">
            <div className="section-title-icon-box bg-pink-soft">
              <Flower2 size={22} className="text-pink" />
            </div>
            <div>
              <div className="deals-title-row">
                <h2 className="section-heading-marketplace">Beauty Essentials</h2>
                <span className="section-badge-pill beauty-badge">
                  <Sparkles size={13} /> 100% Authentic
                </span>
              </div>
              <p className="section-subheading-marketplace">
                Dermatologist-tested skincare, luxury fragrances, grooming kits & daily care.
              </p>
            </div>
          </div>

          <Link to="/products?category=Beauty" className="btn btn-outline btn-sm">
            <span>Explore Beauty</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Beauty Subcategory Pills */}
        <div className="beauty-subcategories-bar">
          {BEAUTY_PILLS.map((pill) => (
            <Link
              key={pill}
              to={`/products?search=${encodeURIComponent(pill)}`}
              className="beauty-subcat-chip"
            >
              {pill}
            </Link>
          ))}
        </div>

        <ProductCarousel
          products={products}
          loading={loading}
          onQuickView={onQuickView}
          itemCount={5}
          emptyMessage="No beauty products available at the moment."
        />
      </div>
    </section>
  );
};

export default BeautySection;
