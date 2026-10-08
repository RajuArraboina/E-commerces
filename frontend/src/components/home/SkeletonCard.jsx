import React from 'react';

export const ProductSkeleton = () => {
  return (
    <div className="product-skeleton-card card">
      <div className="skeleton-media shimmer" />
      <div className="skeleton-body">
        <div className="skeleton-line shimmer sm" style={{ width: '40%' }} />
        <div className="skeleton-line shimmer md" style={{ width: '80%' }} />
        <div className="skeleton-line shimmer sm" style={{ width: '55%' }} />
        <div className="skeleton-line shimmer lg" style={{ width: '65%', marginTop: '12px' }} />
        <div className="skeleton-btn-row">
          <div className="skeleton-btn shimmer" />
          <div className="skeleton-btn shimmer" />
        </div>
      </div>
    </div>
  );
};

export const CategorySkeleton = () => {
  return (
    <div className="category-skeleton-card card">
      <div className="skeleton-circle shimmer" />
      <div className="skeleton-line shimmer sm" style={{ width: '60%', margin: '12px auto 6px' }} />
      <div className="skeleton-line shimmer sm" style={{ width: '40%', margin: '0 auto' }} />
    </div>
  );
};

export const BannerSkeleton = () => {
  return <div className="banner-skeleton card shimmer" />;
};

export default ProductSkeleton;
