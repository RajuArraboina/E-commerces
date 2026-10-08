import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Clock, TrendingUp, X, Sparkles, Tag, Layers, ArrowRight } from 'lucide-react';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';

const POPULAR_SEARCH_TERMS = [
  'Laptops',
  'Smartphones',
  'Noise Cancelling',
  'Headphones',
  'Smartwatches',
  'Shoes',
  'Audio',
  'Backpacks',
];

const SearchSuggestions = ({ query = '', isOpen, onClose, onSelectTerm }) => {
  const navigate = useNavigate();
  const [matchingProducts, setMatchingProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem('shopsphere_recent_searches');
      return saved ? JSON.parse(saved) : ['Sony headphones', 'ThinkPad laptop', 'Smartwatch'];
    } catch {
      return [];
    }
  });

  // Load categories once for instant category suggestion matching
  useEffect(() => {
    categoryService.getCategories().then((res) => {
      if (res?.success && Array.isArray(res.data)) {
        setAllCategories(res.data);
      }
    }).catch(() => {});
  }, []);

  // Debounced search to backend API
  useEffect(() => {
    if (!isOpen || !query || query.trim().length < 2) {
      setMatchingProducts([]);
      return;
    }

    const handler = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await productService.searchSuggestions(query.trim(), 5);
        if (res?.success && Array.isArray(res.data)) {
          setMatchingProducts(res.data);
        }
      } catch {
        setMatchingProducts([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(handler);
  }, [query, isOpen]);

  if (!isOpen) return null;

  const handleSelect = (term) => {
    // Save to recent searches in localStorage
    const updated = [term, ...recentSearches.filter((t) => t.toLowerCase() !== term.toLowerCase())].slice(0, 6);
    setRecentSearches(updated);
    localStorage.setItem('shopsphere_recent_searches', JSON.stringify(updated));

    if (onSelectTerm) {
      onSelectTerm(term);
    } else {
      navigate(`/products?search=${encodeURIComponent(term)}`);
      onClose();
    }
  };

  const handleRemoveRecent = (e, term) => {
    e.stopPropagation();
    const updated = recentSearches.filter((t) => t !== term);
    setRecentSearches(updated);
    localStorage.setItem('shopsphere_recent_searches', JSON.stringify(updated));
  };

  const cleanQuery = query.trim().toLowerCase();

  // Matched categories dynamically
  const matchingCategories = cleanQuery.length >= 2
    ? allCategories.filter((c) => c.name.toLowerCase().includes(cleanQuery)).slice(0, 3)
    : [];

  // Matched brands from matching products dynamically
  const matchingBrands = cleanQuery.length >= 2
    ? Array.from(new Set(
        matchingProducts
          .map((p) => p.brand)
          .filter((b) => b && b.toLowerCase().includes(cleanQuery))
      )).slice(0, 3)
    : [];

  // Dynamic suggestion phrases
  const suggestedPhrases = cleanQuery.length >= 2 ? [
    cleanQuery,
    `${cleanQuery} under ₹10,000`,
    `best ${cleanQuery}`,
    `${cleanQuery} in electronics`,
  ] : [];

  return (
    <div className="search-suggestions-dropdown card" onClick={(e) => e.stopPropagation()}>
      {/* 1. Category Suggestions */}
      {matchingCategories.length > 0 && (
        <div className="suggestions-section category-suggestions-section">
          <span className="suggestions-title">
            <Layers size={13} className="text-accent" /> In Categories
          </span>
          <div className="suggested-category-pills">
            {matchingCategories.map((cat) => (
              <Link
                key={cat._id}
                to={`/products?category=${encodeURIComponent(cat.name)}`}
                onClick={onClose}
                className="suggested-cat-chip"
              >
                <span>{cat.name}</span>
                <ArrowRight size={12} />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 2. Brand Suggestions */}
      {matchingBrands.length > 0 && (
        <div className="suggestions-section brand-suggestions-section">
          <span className="suggestions-title">
            <Tag size={13} className="text-warning" /> In Brands
          </span>
          <div className="suggested-brand-pills">
            {matchingBrands.map((brand) => (
              <Link
                key={brand}
                to={`/products?brand=${encodeURIComponent(brand)}`}
                onClick={onClose}
                className="suggested-brand-chip"
              >
                <span>{brand}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 3. Live matching products from backend */}
      {cleanQuery.length >= 2 && (
        <div className="suggestions-section products-section">
          <div className="suggestions-header-row">
            <span className="suggestions-title">
              <Sparkles size={13} className="text-primary" /> Products
            </span>
            {loading && <span className="suggestions-spinner">Searching...</span>}
          </div>

          {matchingProducts.length > 0 ? (
            <ul className="suggested-products-list">
              {matchingProducts.map((p) => (
                <li key={p._id}>
                  <Link
                    to={`/products/${p._id}`}
                    onClick={onClose}
                    className="suggested-product-item"
                  >
                    <img
                      src={p.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                      alt={p.name}
                      className="suggested-thumb"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100';
                      }}
                    />
                    <div className="suggested-info">
                      <span className="suggested-name">{p.name}</span>
                      <span className="suggested-meta">
                        {p.brand && <span>{p.brand} • </span>}
                        <strong className="text-primary">₹{Number(p.price).toLocaleString('en-IN')}</strong>
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : !loading ? (
            <p className="no-matches-text">No direct product matches found for "{query}".</p>
          ) : null}
        </div>
      )}

      {/* 4. Suggested search terms */}
      {suggestedPhrases.length > 0 && (
        <div className="suggestions-section">
          <span className="suggestions-title">
            <Search size={13} className="text-primary" /> Suggestions
          </span>
          <div className="suggested-terms-list">
            {suggestedPhrases.map((phrase, i) => (
              <button
                key={i}
                type="button"
                className="suggested-phrase-btn"
                onClick={() => handleSelect(phrase)}
              >
                <Search size={14} className="text-muted" />
                <span>{phrase}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 5. Recent Searches */}
      {recentSearches.length > 0 && (
        <div className="suggestions-section">
          <div className="suggestions-header-row">
            <span className="suggestions-title">
              <Clock size={13} className="text-muted" /> Recent Searches
            </span>
          </div>
          <div className="recent-chips-wrap">
            {recentSearches.map((term, i) => (
              <span
                key={i}
                className="recent-search-chip"
                onClick={() => handleSelect(term)}
              >
                <span>{term}</span>
                <button
                  type="button"
                  className="recent-chip-remove"
                  onClick={(e) => handleRemoveRecent(e, term)}
                  aria-label="Remove search"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 6. Popular Searches */}
      <div className="suggestions-section">
        <span className="suggestions-title">
          <TrendingUp size={13} className="text-danger" /> Trending Searches
        </span>
        <div className="popular-chips-wrap">
          {POPULAR_SEARCH_TERMS.map((term, i) => (
            <button
              key={i}
              type="button"
              className="popular-search-chip"
              onClick={() => handleSelect(term)}
            >
              <span>{term}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchSuggestions;
