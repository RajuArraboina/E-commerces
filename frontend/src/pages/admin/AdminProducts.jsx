import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import Pagination from '../../components/Pagination';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import { Plus, Edit, Trash2, Search, Star } from 'lucide-react';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchCategories = async () => {
    try {
      const res = await categoryService.getCategories();
      if (res.success && Array.isArray(res.data)) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await productService.getProducts({
        search,
        category: selectedCategory,
        page,
        limit: 10,
        sort: 'newest',
      });
      if (res.success) {
        setProducts(res.data || []);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch products from server');
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, page]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const res = await productService.deleteProduct(id);
        if (res.success) {
          fetchProducts();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete product from server');
      }
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-title">
            Product Management {total > 0 && <span className="badge badge-primary" style={{ fontSize: '0.9rem', verticalAlign: 'middle' }}>({total})</span>}
          </h1>
          <p className="admin-subtitle">
            View, add, edit, search, and delete catalog products dynamically
          </p>
        </div>

        <Link to="/admin/products/add" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} />
          <span>Add Product</span>
        </Link>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchProducts} />}

      {/* Search and Category Filter */}
      <div className="admin-filter-bar card">
        <div className="admin-search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search products by name, description, brand..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="form-control"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setPage(1);
          }}
          className="form-control category-select"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="card">
        {loading ? (
          <Loading message="Loading product list from MongoDB..." />
        ) : (
          <>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Brand</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Rating</th>
                    <th>Availability</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center" style={{ padding: '30px' }}>
                        No products found matching your search. Click "Add Product" to create one.
                      </td>
                    </tr>
                  ) : (
                    products.map((prod) => (
                      <tr key={prod._id}>
                        <td>
                          <div className="table-product-cell">
                            <img
                              src={prod.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                              alt={prod.name}
                              className="table-thumbnail"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100';
                              }}
                            />
                            <div>
                              <strong>{prod.name}</strong>
                              <small className="text-muted block" style={{ maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {prod.description}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-primary">
                            {typeof prod.category === 'object' ? prod.category?.name : prod.category}
                          </span>
                        </td>
                        <td>{prod.brand}</td>
                        <td>
                          <strong>₹{Number(prod.price).toLocaleString('en-IN')}</strong>
                        </td>
                        <td>
                          <span className={`badge ${prod.stock > 5 ? 'badge-success' : prod.stock > 0 ? 'badge-warning' : 'badge-danger'}`}>
                            {prod.stock} units
                          </span>
                        </td>
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                            <Star size={14} className="text-warning" fill="currentColor" />
                            {prod.rating ?? 0}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${prod.isAvailable ? 'badge-success' : 'badge-danger'}`}>
                            {prod.isAvailable ? 'Available' : 'Unavailable'}
                          </span>
                        </td>
                        <td>
                          <div className="table-action-btns">
                            <Link
                              to={`/admin/products/edit/${prod._id}`}
                              className="btn btn-outline btn-xs"
                              title="Edit product"
                            >
                              <Edit size={14} />
                              <span>Edit</span>
                            </Link>
                            <button
                              onClick={() => handleDelete(prod._id)}
                              className="btn btn-outline-danger btn-xs"
                              title="Delete product"
                            >
                              <Trash2 size={14} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
