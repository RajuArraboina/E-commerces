import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, RefreshCw } from 'lucide-react';
import ProductCard from '../ProductCard';
import { ProductSkeleton } from './SkeletonCard';

const NewArrivals = ({ products = [], loading = false, error = null, onQuickView, onRetry }) => {
  return (
    <section className="section-new-arrivals container" aria-label="New Arrivals">
      <div className="section-header">
        <div>
          <span className="section-tag">
            <Sparkles size={14} className="text-accent" /> Just Launched
          </span>
          <h2 className="section-title">New Arrivals</h2>
          <p className="section-subtitle">
            Fresh products just added to EShop with latest specs & warranty
          </p>
        </div>

        <Link to="/products?sort=newest" className="btn btn-outline btn-sm">
          <span>View All New Arrivals</span>
          <ArrowRight size={15} />
        </Link>
      </div>

      {loading ? (
        <div className="products-grid">
          {[1, 2, 3, 4].map((i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="section-error-box card">
          <p>Unable to load new arrivals.</p>
          {onRetry && (
            <button type="button" onClick={onRetry} className="btn btn-outline btn-sm">
              <RefreshCw size={14} />
              <span>Try Again</span>
            </button>
          )}
        </div>
      ) : products.length === 0 ? (
        <div className="section-empty-box card">
          <p>No new arrivals at this time. Check back soon!</p>
        </div>
      ) : (
        <div className="products-grid">
          {products.slice(0, 4).map((product) => (
            <ProductCard
              key={product._id}
              product={{
                ...product,
                badge: 'NEW',
              }}
              onQuickView={onQuickView}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default NewArrivals;
