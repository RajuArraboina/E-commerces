import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Award, ChevronLeft, ChevronRight, Search, ArrowRight } from 'lucide-react';

const BrandSection = ({ brands = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const scrollRef = useRef(null);

  // Filter brands dynamically
  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -280 : 280;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  if (!brands || brands.length === 0) return null;

  return (
    <section className="section-brands container" aria-label="Popular Brands">
      <div className="section-header">
        <div>
          <span className="section-tag">
            <Award size={14} className="text-primary" /> Verified Manufacturers
          </span>
          <h2 className="section-title">Popular Brands</h2>
          <p className="section-subtitle">
            Explore authentic official gear from certified global and domestic tech leaders
          </p>
        </div>

        {/* Brand Search & Arrow controls */}
        <div className="brand-controls-row">
          <div className="brand-search-mini">
            <Search size={14} className="text-muted" />
            <input
              type="text"
              placeholder="Filter brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="brand-search-input"
            />
          </div>

          <div className="carousel-arrow-buttons">
            <button
              type="button"
              className="carousel-arrow-btn"
              onClick={() => handleScroll('left')}
              aria-label="Scroll brands left"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              className="carousel-arrow-btn"
              onClick={() => handleScroll('right')}
              aria-label="Scroll brands right"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Brand Shelf */}
      <div className="brand-shelf-container" ref={scrollRef}>
        {filteredBrands.map((brand) => (
          <Link
            key={brand.name}
            to={`/products?brand=${encodeURIComponent(brand.name)}`}
            className="brand-card-item card"
            title={`Shop ${brand.name} products`}
          >
            <div className="brand-avatar-badge">
              <span className="brand-letter-badge">{brand.name.charAt(0).toUpperCase()}</span>
            </div>
            <div className="brand-meta">
              <h3 className="brand-name">{brand.name}</h3>
              <span className="brand-product-count">
                {brand.count} {brand.count === 1 ? 'Product' : 'Products'}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default BrandSection;
