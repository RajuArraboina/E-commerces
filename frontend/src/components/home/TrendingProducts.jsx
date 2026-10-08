import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, ArrowRight, RefreshCw } from 'lucide-react';
import ProductCard from '../ProductCard';
import { ProductSkeleton } from './SkeletonCard';

const TrendingProducts = ({
  products = [],
  categories = [],
  loading = false,
  error = null,
  onQuickView,
  onRetry,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Filter products by active tab category if not 'ALL'
  const filteredProducts = selectedCategory === 'ALL'
    ? products
    : products.filter((p) => {
        const catName = typeof p.category === 'object' ? p.category?.name : p.category;
        return (catName || '').toLowerCase() === selectedCategory.toLowerCase();
      });

  return (
    <section className="section-trending-products container" aria-label="Trending Products">
      <div className="section-header">
        <div>
          <span className="section-tag">
            <Flame size={14} className="text-danger" /> Trending Now
          </span>
          <h2 className="section-title">Products Everyone is Talking About</h2>
          <p className="section-subtitle">
            Most viewed and highest rated customer favorites across India
          </p>
        </div>

        <Link to="/products?sort=-rating" className="btn btn-outline btn-sm">
          <span>View All Products</span>
          <ArrowRight size={15} />
        </Link>
      </div>

      {/* Category Filter Tabs */}
      {categories && categories.length > 0 && (
        <div className="trending-filter-tabs">
          <button
            type="button"
            className={`filter-tab-pill ${selectedCategory === 'ALL' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('ALL')}
          >
            All Trending
          </button>
          {categories.slice(0, 6).map((cat) => (
            <button
              key={cat._id || cat.name}
              type="button"
              className={`filter-tab-pill ${selectedCategory.toLowerCase() === cat.name.toLowerCase() ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.name)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="products-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="section-error-box card">
          <p>Unable to load trending products.</p>
          {onRetry && (
            <button type="button" onClick={onRetry} className="btn btn-outline btn-sm">
              <RefreshCw size={14} />
              <span>Try Again</span>
            </button>
          )}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="section-empty-box card">
          <p>No trending products found for this category.</p>
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.slice(0, 8).map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onQuickView={onQuickView}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default TrendingProducts;
