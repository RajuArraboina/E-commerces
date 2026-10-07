import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

const UserSearch = ({ value = '', onSearch, placeholder = 'Search by Name, Email, Phone, or User ID...' }) => {
  const [searchTerm, setSearchTerm] = useState(value);

  // Sync internal state if external value changes
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  // Debounce search input by 350ms
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== value) {
        onSearch(searchTerm);
      }
    }, 350);

    return () => clearTimeout(handler);
  }, [searchTerm, value, onSearch]);

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <div className="user-search-wrapper">
      <Search size={18} className="user-search-icon" />
      <input
        type="text"
        className="form-control user-search-input"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        aria-label="Search users"
      />
      {searchTerm && (
        <button
          type="button"
          onClick={handleClear}
          className="user-search-clear-btn"
          title="Clear search"
          aria-label="Clear search input"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default UserSearch;
