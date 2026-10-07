import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ initialValue = '', onSearch, placeholder = 'Search products, brands...' }) => {
  const [query, setQuery] = useState(initialValue);

  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query.trim());
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className="search-bar-component">
      <div className="search-input-wrapper">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="search-input"
        />
        {query && (
          <button type="button" onClick={handleClear} className="search-clear-btn" aria-label="Clear search">
            <X size={16} />
          </button>
        )}
      </div>
      <button type="submit" className="btn btn-primary search-submit-btn">
        Search
      </button>
    </form>
  );
};

export default SearchBar;
