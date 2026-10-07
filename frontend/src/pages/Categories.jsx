import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import categoryService from '../services/categoryService';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { Layers, ArrowRight } from 'lucide-react';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await categoryService.getCategories();
      if (res.success && Array.isArray(res.data)) {
        setCategories(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="categories-page container">
      <div className="catalog-header">
        <div>
          <div className="badge-tag">
            <Layers size={14} /> Catalog Taxonomy
          </div>
          <h1 className="page-title">Explore by Category</h1>
          <p className="page-subtitle">
            All collections are dynamically populated and maintained in MongoDB
          </p>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchCategories} />}

      {loading ? (
        <Loading message="Loading product categories from database..." />
      ) : categories.length === 0 ? (
        <div className="empty-state-box">
          <h3>No Categories Found</h3>
          <p>The store admin has not published any active categories yet.</p>
        </div>
      ) : (
        <div className="categories-full-grid">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              className="category-card-large card"
            >
              <div className="category-large-img-wrap">
                <img
                  src={cat.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500'}
                  alt={cat.name}
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500';
                  }}
                />
              </div>
              <div className="category-large-info">
                <h3>{cat.name}</h3>
                <p>{cat.description || 'Explore products in this category'}</p>
                <span className="category-browse-btn">
                  <span>Browse Products</span>
                  <ArrowRight size={16} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Categories;
