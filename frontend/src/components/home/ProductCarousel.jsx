import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '../ProductCard';
import SkeletonCard from './SkeletonCard';

const ProductCarousel = ({
  products = [],
  loading = false,
  onQuickView,
  itemCount = 6,
  emptyMessage = 'No products available at the moment.',
}) => {
  const scrollContainerRef = useRef(null);

  const handleScroll = (direction) => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = scrollContainerRef.current.clientWidth * 0.75;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (loading) {
    return (
      <div className="marketplace-carousel-track">
        {Array.from({ length: itemCount }).map((_, idx) => (
          <div key={idx} className="carousel-slide-card">
            <SkeletonCard />
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="carousel-empty-state">
        <p className="text-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="marketplace-carousel-wrapper">
      <button
        type="button"
        className="carousel-nav-btn prev"
        onClick={() => handleScroll('left')}
        aria-label="Scroll left"
      >
        <ChevronLeft size={20} />
      </button>

      <div className="marketplace-carousel-track" ref={scrollContainerRef}>
        {products.map((product) => (
          <div key={product._id} className="carousel-slide-card">
            <ProductCard product={product} onQuickView={onQuickView} />
          </div>
        ))}
      </div>

      <button
        type="button"
        className="carousel-nav-btn next"
        onClick={() => handleScroll('right')}
        aria-label="Scroll right"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default ProductCarousel;
