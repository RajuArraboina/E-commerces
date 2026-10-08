import React from 'react';
import { Link } from 'react-router-dom';
import { Home as HomeIcon, ArrowRight, ShieldCheck, Lamp } from 'lucide-react';
import ProductCarousel from './ProductCarousel';

const HOME_PILLS = [
  'Kitchen',
  'Appliances',
  'Furniture',
  'Decor',
  'Storage',
  'Smart Living',
];

const HomeKitchenSection = ({ products = [], loading = false, onQuickView }) => {
  return (
    <section className="section-home-kitchen container" aria-label="Upgrade Your Home">
      <div className="marketplace-section-card card">
        <div className="marketplace-section-header">
          <div className="section-title-group">
            <div className="section-title-icon-box bg-primary-soft">
              <HomeIcon size={22} className="text-primary" />
            </div>
            <div>
              <div className="deals-title-row">
                <h2 className="section-heading-marketplace">Upgrade Your Home</h2>
                <span className="section-badge-pill home-badge">
                  <Lamp size={13} /> Modern Living
                </span>
              </div>
              <p className="section-subheading-marketplace">
                Smart appliances, luxury cookware, ambient decor and modular storage solutions.
              </p>
            </div>
          </div>

          <Link to="/products?category=Home" className="btn btn-outline btn-sm">
            <span>Explore Home & Kitchen</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Dynamic Category Shortcuts */}
        <div className="home-subcategories-bar">
          {HOME_PILLS.map((pill) => (
            <Link
              key={pill}
              to={`/products?search=${encodeURIComponent(pill)}`}
              className="home-subcat-chip"
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
          emptyMessage="Home & Kitchen essentials are being updated. Check back soon!"
        />
      </div>
    </section>
  );
};

export default HomeKitchenSection;
