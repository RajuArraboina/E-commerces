import React, { useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import ProductCard from '../ProductCard';
import { ProductSkeleton } from './SkeletonCard';
import { useAuth } from '../../context/AuthContext';

const PersonalizedRecommendations = ({
  recommendedProducts = [],
  popularProducts = [],
  recentProducts = [],
  loading = false,
  error = null,
  onQuickView,
  onRetry,
}) => {
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState('recommended');

  const customerName = user?.name ? user.name.split(' ')[0] : 'You';

  // Choose products to show based on selected tab
  let displayProducts = [];
  let tabHint = '';

  if (activeTab === 'recommended') {
    displayProducts = recommendedProducts.length > 0 ? recommendedProducts : popularProducts;
    tabHint = isAuthenticated
      ? `Curated based on your interests and recent catalog searches, ${customerName}.`
      : 'Top-rated picks handpicked by EShop AI.';
  } else if (activeTab === 'recent') {
    displayProducts = recentProducts.length > 0 ? recentProducts : popularProducts;
    tabHint = 'Products you recently explored across the store.';
  } else {
    // 'similar' / 'popular'
    displayProducts = popularProducts.length > 0 ? popularProducts : recommendedProducts;
    tabHint = 'Customer favorites with verified 4.5+ star satisfaction.';
  }

  return (
    <section className="section-recommendations container" aria-label="Personalized Recommendations">
      <div className="recommendations-box card">
        <div className="rec-header-row">
          <div>
            <div className="ai-badge">
              <Sparkles size={15} className="text-accent" />
              <span>AI Personalized Picks</span>
            </div>
            <h2 className="section-title">
              {isAuthenticated ? `Recommended For You, ${customerName}` : 'Personalized Recommendations'}
            </h2>
            <p className="section-subtitle">{tabHint}</p>
          </div>

          {/* Sub-tab pills */}
          <div className="rec-tabs">
            <button
              type="button"
              className={`rec-tab-btn ${activeTab === 'recommended' ? 'active' : ''}`}
              onClick={() => setActiveTab('recommended')}
            >
              Recommended For You
            </button>

            {recentProducts.length > 0 && (
              <button
                type="button"
                className={`rec-tab-btn ${activeTab === 'recent' ? 'active' : ''}`}
                onClick={() => setActiveTab('recent')}
              >
                Because You Viewed ({recentProducts.length})
              </button>
            )}

            <button
              type="button"
              className={`rec-tab-btn ${activeTab === 'popular' ? 'active' : ''}`}
              onClick={() => setActiveTab('popular')}
            >
              You May Also Like
            </button>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="products-grid" style={{ marginTop: '24px' }}>
            <ProductSkeleton />
            <ProductSkeleton />
            <ProductSkeleton />
            <ProductSkeleton />
          </div>
        ) : error ? (
          <div className="section-error-box card" style={{ marginTop: '20px' }}>
            <p>Unable to load personalized recommendations.</p>
            {onRetry && (
              <button type="button" onClick={onRetry} className="btn btn-outline btn-sm">
                <RefreshCw size={14} />
                <span>Try Again</span>
              </button>
            )}
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="section-empty-box card" style={{ marginTop: '20px' }}>
            <p>Start exploring products to get personalized recommendations tailored to your taste.</p>
          </div>
        ) : (
          <div className="products-grid" style={{ marginTop: '24px' }}>
            {displayProducts.slice(0, 4).map((product) => (
              <ProductCard
                key={product._id}
                product={{
                  ...product,
                  badge: activeTab === 'recommended' ? 'AI PICK' : product.badge,
                }}
                onQuickView={onQuickView}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PersonalizedRecommendations;
