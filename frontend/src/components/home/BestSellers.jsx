import React from 'react';
import { Link } from 'react-router-dom';
import { Award, ArrowRight, RefreshCw } from 'lucide-react';
import ProductCard from '../ProductCard';
import { ProductSkeleton } from './SkeletonCard';

const BestSellers = ({ products = [], loading = false, error = null, onQuickView, onRetry }) => {
  return (
    <section className="section-bestsellers container" aria-label="Best Sellers">
      <div className="section-header">
        <div>
          <span className="section-tag">
            <Award size={14} className="text-warning" /> Top Performing
          </span>
          <h2 className="section-title">Best Sellers</h2>
          <p className="section-subtitle">
            Most popular customer purchases calculated from real store orders and reviews
          </p>
        </div>

        <Link to="/products?sort=-rating" className="btn btn-outline btn-sm">
          <span>View All Best Sellers</span>
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
          <p>Unable to load best sellers.</p>
          {onRetry && (
            <button type="button" onClick={onRetry} className="btn btn-outline btn-sm">
              <RefreshCw size={14} />
              <span>Try Again</span>
            </button>
          )}
        </div>
      ) : products.length === 0 ? (
        <div className="section-empty-box card">
          <p>No best sellers calculated yet.</p>
        </div>
      ) : (
        <div className="products-grid bestsellers-grid">
          {products.slice(0, 4).map((product, idx) => (
            <ProductCard
              key={product._id}
              product={{
                ...product,
                badge: `#${idx + 1} BEST SELLER`,
              }}
              onQuickView={onQuickView}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default BestSellers;
