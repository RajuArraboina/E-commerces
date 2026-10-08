import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, RefreshCw } from 'lucide-react';
import CategoryCard from './CategoryCard';
import { CategorySkeleton } from './SkeletonCard';

const CategorySection = ({ categories = [], productCounts = {}, loading = false, error = null, onRetry }) => {
  return (
    <section id="categories" className="section-categories container" aria-label="Curated Categories">
      <div className="section-header">
        <div>
          <span className="section-tag">
            <ShoppingBag size={14} className="text-primary" /> Curated Collections
          </span>
          <h2 className="section-title">Popular Categories</h2>
          <p className="section-subtitle">Explore products tailored to your lifestyle</p>
        </div>
        <Link to="/categories" className="btn btn-outline btn-sm">
          <span>View All Categories</span>
          <ArrowRight size={15} />
        </Link>
      </div>

      {loading ? (
        <div className="categories-grid-modern">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CategorySkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="section-error-box card">
          <p>{error}</p>
          {onRetry && (
            <button type="button" onClick={onRetry} className="btn btn-outline btn-sm">
              <RefreshCw size={14} />
              <span>Try Again</span>
            </button>
          )}
        </div>
      ) : categories.length === 0 ? (
        <div className="section-empty-box card">
          <p>No categories available right now.</p>
        </div>
      ) : (
        <div className="categories-grid-modern">
          {categories.map((cat) => (
            <CategoryCard
              key={cat._id || cat.name}
              category={cat}
              productCount={productCounts[cat._id] || productCounts[cat.name] || cat.productCount || 0}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default CategorySection;
