import React from 'react';
import { Clock, Trash2 } from 'lucide-react';
import ProductCard from '../ProductCard';

const RecentlyViewed = ({
  products = [],
  onRemoveItem,
  onClearAll,
  onQuickView,
}) => {
  if (!products || products.length === 0) return null;

  return (
    <section className="section-recently-viewed container" aria-label="Recently Viewed Products">
      <div className="section-header">
        <div>
          <span className="section-tag">
            <Clock size={14} className="text-primary" /> Browsing History
          </span>
          <h2 className="section-title">Recently Viewed</h2>
          <p className="section-subtitle">
            Products you checked out during your current or previous visits
          </p>
        </div>

        {onClearAll && (
          <button
            type="button"
            onClick={onClearAll}
            className="btn btn-outline btn-sm clear-history-btn"
            title="Clear all recently viewed products"
          >
            <Trash2 size={14} />
            <span>Clear History</span>
          </button>
        )}
      </div>

      <div className="products-grid">
        {products.slice(0, 4).map((product) => (
          <div key={product._id} className="recent-product-wrapper">
            {onRemoveItem && (
              <button
                type="button"
                className="recent-remove-btn"
                onClick={() => onRemoveItem(product._id)}
                title="Remove from history"
                aria-label="Remove from browsing history"
              >
                ×
              </button>
            )}
            <ProductCard
              product={product}
              onQuickView={onQuickView}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecentlyViewed;
