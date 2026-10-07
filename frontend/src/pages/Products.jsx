import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import productService from '../services/productService';
import ProductGrid from '../components/ProductGrid';
import FilterSidebar from '../components/FilterSidebar';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse filters from URL
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    inStock: searchParams.get('inStock') || '',
    color: searchParams.get('color') || '',
    size: searchParams.get('size') || '',
    storage: searchParams.get('storage') || '',
    sort: searchParams.get('sort') || 'newest',
    page: parseInt(searchParams.get('page'), 10) || 1,
    limit: 12,
  });

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Count active filters to display in the toggle badge
  const activeFilterCount = [
    filters.category,
    filters.brand,
    filters.minPrice,
    filters.maxPrice,
    filters.inStock,
    filters.color,
    filters.storage || filters.size,
  ].filter(Boolean).length;

  // Sync state when URL params change externally (e.g. from navbar search)
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || '',
      sort: searchParams.get('sort') || prev.sort,
      page: parseInt(searchParams.get('page'), 10) || 1,
    }));
  }, [searchParams]);

  // Fetch products from backend
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Reflect current filters in browser URL
      const currentParams = {};
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) {
          currentParams[key] = filters[key];
        }
      });
      setSearchParams(currentParams, { replace: true });

      const res = await productService.getProducts(filters);
      if (res.success) {
        setProducts(res.data || []);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filters, setSearchParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSearch = (query) => {
    setFilters((prev) => ({ ...prev, search: query, page: 1 }));
  };

  const handleSortChange = (e) => {
    setFilters((prev) => ({ ...prev, sort: e.target.value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      inStock: '',
      color: '',
      size: '',
      storage: '',
      sort: 'newest',
      page: 1,
      limit: 12,
    });
  };

  return (
    <div className="products-page full-width-catalog">
      {/* Header */}
      <div className="catalog-header">
        <div>
          <h1 className="page-title">Explore Catalog</h1>
          <p className="page-subtitle">
            Showing {total} product{total === 1 ? '' : 's'} dynamically from MongoDB
          </p>
        </div>

        {/* Search input in catalog */}
        <div className="catalog-search-wrap">
          <SearchBar
            initialValue={filters.search}
            onSearch={handleSearch}
            placeholder="Search by title, brand, specs..."
          />
        </div>
      </div>

      {/* Control Bar: Filter Toggle + Active Filters + Sort */}
      <div className="catalog-control-bar">
        <div className="catalog-control-left">
          <button
            type="button"
            onClick={() => setShowFilters((prev) => !prev)}
            className={`btn ${showFilters ? 'btn-primary' : 'btn-outline'} filter-toggle-btn`}
            aria-expanded={showFilters}
            aria-label={showFilters ? 'Hide filters' : 'Show filters'}
          >
            <SlidersHorizontal size={16} />
            <span>{showFilters ? 'Hide Filters' : 'Filters'}</span>
            {activeFilterCount > 0 && (
              <span className="filter-badge">{activeFilterCount}</span>
            )}
          </button>

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="filter-quick-reset"
              title="Reset all active filters"
            >
              Clear filters ({activeFilterCount})
            </button>
          )}
        </div>

        <div className="sort-dropdown-wrap">
          <ArrowUpDown size={16} className="sort-icon" />
          <select value={filters.sort} onChange={handleSortChange} className="form-control sort-select">
            <option value="newest">Sort by: Newest First</option>
            <option value="price">Price: Low to High</option>
            <option value="-price">Price: High to Low</option>
            <option value="-rating">Top Customer Rating</option>
            <option value="name">Alphabetical (A - Z)</option>
          </select>
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && (
        <div className="active-filter-chips">
          <span className="active-filter-label">Active:</span>
          {filters.category && (
            <span className="filter-chip">
              Category: {filters.category}
              <button
                type="button"
                onClick={() => handleFilterChange({ ...filters, category: '', page: 1 })}
                aria-label="Remove category filter"
              >
                <X size={12} />
              </button>
            </span>
          )}
          {filters.brand && (
            <span className="filter-chip">
              Brand: {filters.brand}
              <button
                type="button"
                onClick={() => handleFilterChange({ ...filters, brand: '', page: 1 })}
                aria-label="Remove brand filter"
              >
                <X size={12} />
              </button>
            </span>
          )}
          {(filters.minPrice || filters.maxPrice) && (
            <span className="filter-chip">
              Price: ₹{filters.minPrice || '0'} - ₹{filters.maxPrice || '∞'}
              <button
                type="button"
                onClick={() => handleFilterChange({ ...filters, minPrice: '', maxPrice: '', page: 1 })}
                aria-label="Remove price filter"
              >
                <X size={12} />
              </button>
            </span>
          )}
          {(filters.inStock === 'true' || filters.inStock === true) && (
            <span className="filter-chip">
              In Stock Only
              <button
                type="button"
                onClick={() => handleFilterChange({ ...filters, inStock: '', page: 1 })}
                aria-label="Remove in stock filter"
              >
                <X size={12} />
              </button>
            </span>
          )}
          {filters.color && (
            <span className="filter-chip">
              Color: {filters.color}
              <button
                type="button"
                onClick={() => handleFilterChange({ ...filters, color: '', page: 1 })}
                aria-label="Remove color filter"
              >
                <X size={12} />
              </button>
            </span>
          )}
          {(filters.storage || filters.size) && (
            <span className="filter-chip">
              Size/Storage: {filters.storage || filters.size}
              <button
                type="button"
                onClick={() => handleFilterChange({ ...filters, storage: '', size: '', page: 1 })}
                aria-label="Remove size/storage filter"
              >
                <X size={12} />
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={handleResetFilters}
            className="filter-clear-all-chip"
          >
            Clear all
          </button>
        </div>
      )}

      {error && <ErrorMessage message={error} onRetry={fetchProducts} />}

      {/* Catalog Layout: Sidebar + Grid */}
      <div className={`catalog-layout ${showFilters ? 'filters-open' : 'filters-closed'}`}>
        {/* Filter Sidebar Desktop & Mobile (only mounted when toggled open) */}
        {showFilters && (
          <div className="catalog-sidebar-col open">
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
              onClose={() => setShowFilters(false)}
            />
          </div>
        )}

        {/* Products Grid Area */}
        <div className="catalog-content-col">
          {loading ? (
            <Loading message="Filtering live products from database..." />
          ) : (
            <>
              <ProductGrid products={products} emptyMessage="No products match your active search filters." />
              <Pagination
                currentPage={filters.page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
