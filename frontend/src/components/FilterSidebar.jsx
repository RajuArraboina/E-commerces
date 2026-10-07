import React, { useState, useEffect } from 'react';
import categoryService from '../services/categoryService';
import { Filter, RotateCcw, X } from 'lucide-react';

const FilterSidebar = ({ filters, onFilterChange, onReset, onClose }) => {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Load real categories dynamically from MongoDB
  useEffect(() => {
    const fetchCats = async () => {
      try {
        setLoadingCategories(true);
        const res = await categoryService.getCategories();
        if (res.success && Array.isArray(res.data)) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error('Failed to load categories for filter sidebar:', err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCats();
  }, []);

  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value, page: 1 });
  };

  return (
    <aside className="filter-sidebar card">
      <div className="filter-header">
        <div className="filter-title">
          <Filter size={18} />
          <span>Filters</span>
        </div>
        <div className="filter-header-actions">
          <button onClick={onReset} className="filter-reset-btn" title="Reset all filters">
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="filter-close-btn"
              title="Close filter panel"
              aria-label="Close filters"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div className="filter-section">
        <label className="filter-label">Category</label>
        {loadingCategories ? (
          <p className="text-muted text-sm">Loading categories...</p>
        ) : (
          <select
            value={filters.category || ''}
            onChange={(e) => handleChange('category', e.target.value)}
            className="form-control"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Brand Filter */}
      <div className="filter-section">
        <label className="filter-label">Brand</label>
        <input
          type="text"
          placeholder="e.g. Apple, Sony, Nike"
          value={filters.brand || ''}
          onChange={(e) => handleChange('brand', e.target.value)}
          className="form-control"
        />
      </div>

      {/* Price Range */}
      <div className="filter-section">
        <label className="filter-label">Price Range (₹)</label>
        <div className="price-inputs-row">
          <input
            type="number"
            placeholder="Min"
            min="0"
            value={filters.minPrice || ''}
            onChange={(e) => handleChange('minPrice', e.target.value)}
            className="form-control"
          />
          <span className="price-sep">-</span>
          <input
            type="number"
            placeholder="Max"
            min="0"
            value={filters.maxPrice || ''}
            onChange={(e) => handleChange('maxPrice', e.target.value)}
            className="form-control"
          />
        </div>
      </div>

      {/* Availability */}
      <div className="filter-section">
        <label className="filter-label">Availability</label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={filters.inStock === 'true' || filters.inStock === true}
            onChange={(e) => handleChange('inStock', e.target.checked ? 'true' : '')}
          />
          <span>In Stock Only</span>
        </label>
      </div>

      {/* Variant Color */}
      <div className="filter-section">
        <label className="filter-label">Variant Color</label>
        <input
          type="text"
          placeholder="e.g. Black, Silver, Blue"
          value={filters.color || ''}
          onChange={(e) => handleChange('color', e.target.value)}
          className="form-control"
        />
      </div>

      {/* Variant Storage / Size */}
      <div className="filter-section">
        <label className="filter-label">Storage / Size</label>
        <input
          type="text"
          placeholder="e.g. 128GB, 256GB, UK 9, M"
          value={filters.storage || filters.size || ''}
          onChange={(e) => handleChange('storage', e.target.value)}
          className="form-control"
        />
      </div>

      {/* Footer Actions */}
      <div className="filter-footer-actions">
        <button
          type="button"
          onClick={onReset}
          className="btn btn-outline btn-sm filter-footer-reset"
        >
          <RotateCcw size={14} />
          <span>Reset All</span>
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="btn btn-primary btn-sm filter-footer-done"
          >
            <span>Apply & Close</span>
          </button>
        )}
      </div>
    </aside>
  );
};

export default FilterSidebar;
