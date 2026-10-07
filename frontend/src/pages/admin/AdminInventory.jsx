import React, { useState, useEffect } from 'react';
import productService from '../../services/productService';
import adminService from '../../services/adminService';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import { Check, Search, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react';

const AdminInventory = () => {
  const [products, setProducts] = useState([]);
  const [stockInputs, setStockInputs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, low, out
  const [search, setSearch] = useState('');
  const [updatingStockId, setUpdatingStockId] = useState(null);
  const [updatingAvailId, setUpdatingAvailId] = useState(null);
  const [successStockId, setSuccessStockId] = useState(null);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await productService.getProducts({ limit: 100 });
      if (res.success && Array.isArray(res.data)) {
        setProducts(res.data);
        const inputs = {};
        res.data.forEach((p) => {
          inputs[p._id] = p.stock ?? 0;
        });
        setStockInputs(inputs);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch inventory from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleStockChange = (id, val) => {
    setStockInputs({ ...stockInputs, [id]: val });
  };

  // Admin updates stock via backend API: PUT /api/admin/products/:id/stock
  const handleUpdateStock = async (id) => {
    const val = Number(stockInputs[id]);
    if (isNaN(val) || val < 0) {
      alert('Please enter a valid non-negative number for stock.');
      return;
    }

    try {
      setUpdatingStockId(id);
      const res = await adminService.updateProductStock(id, val);
      if (res.success) {
        setProducts((prev) =>
          prev.map((p) =>
            p._id === id ? { ...p, stock: val, isAvailable: val > 0 } : p
          )
        );
        setSuccessStockId(id);
        setTimeout(() => setSuccessStockId(null), 2000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update stock in database');
    } finally {
      setUpdatingStockId(null);
    }
  };

  // Admin updates availability via backend API: PUT /api/products/:id
  const handleToggleAvailability = async (product) => {
    const newStatus = !product.isAvailable;
    try {
      setUpdatingAvailId(product._id);
      const res = await productService.updateProduct(product._id, {
        isAvailable: newStatus,
      });
      if (res.success) {
        setProducts((prev) =>
          prev.map((p) =>
            p._id === product._id ? { ...p, isAvailable: newStatus } : p
          )
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update product availability');
    } finally {
      setUpdatingAvailId(null);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'out') return p.stock === 0;
    if (filterType === 'low') return p.stock > 0 && p.stock <= 5;
    return true;
  });

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-title">Inventory Management</h1>
          <p className="admin-subtitle">
            Monitor and update live stock levels and availability status across MongoDB products
          </p>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchInventory} />}

      {/* Control Filter Bar */}
      <div className="admin-filter-bar card">
        <div className="inventory-tabs">
          <button
            onClick={() => setFilterType('all')}
            className={`tab-btn ${filterType === 'all' ? 'active' : ''}`}
          >
            All Products ({products.length})
          </button>
          <button
            onClick={() => setFilterType('low')}
            className={`tab-btn ${filterType === 'low' ? 'active' : ''}`}
          >
            Low Stock ({products.filter((p) => p.stock > 0 && p.stock <= 5).length})
          </button>
          <button
            onClick={() => setFilterType('out')}
            className={`tab-btn ${filterType === 'out' ? 'active' : ''}`}
          >
            Out of Stock ({products.filter((p) => p.stock === 0).length})
          </button>
        </div>

        <div className="admin-search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search inventory by product or brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-control"
          />
        </div>
      </div>

      <div className="card">
        {loading ? (
          <Loading message="Syncing live inventory from database..." />
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state-box" style={{ padding: '40px', textAlign: 'center' }}>
            <AlertCircle size={36} className="text-muted" style={{ margin: '0 auto 12px' }} />
            <p className="text-muted">No products found for the selected filter.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Current Stock</th>
                  <th>Availability</th>
                  <th>Update Stock</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p._id}>
                    {/* 1. Product */}
                    <td>
                      <div className="table-product-cell">
                        <img
                          src={p.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                          alt={p.name}
                          className="table-thumbnail"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100';
                          }}
                        />
                        <div>
                          <strong>{p.name}</strong>
                          <small className="text-muted block">{p.brand}</small>
                        </div>
                      </div>
                    </td>

                    {/* 2. Category */}
                    <td>
                      <span className="badge badge-primary">
                        {typeof p.category === 'object' ? p.category?.name : p.category || 'General'}
                      </span>
                    </td>

                    {/* 3. Price */}
                    <td>
                      <strong>₹{Number(p.price).toLocaleString('en-IN')}</strong>
                    </td>

                    {/* 4. Current Stock */}
                    <td>
                      <span className={`badge ${p.stock > 5 ? 'badge-success' : p.stock > 0 ? 'badge-warning' : 'badge-danger'}`}>
                        {p.stock} units
                      </span>
                    </td>

                    {/* 5. Availability (with toggle update action) */}
                    <td>
                      <button
                        onClick={() => handleToggleAvailability(p)}
                        disabled={updatingAvailId === p._id}
                        className={`badge ${p.isAvailable ? 'badge-success' : 'badge-danger'}`}
                        style={{ cursor: 'pointer', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        title="Click to toggle availability"
                      >
                        {updatingAvailId === p._id ? (
                          'Updating...'
                        ) : p.isAvailable ? (
                          <>
                            <ToggleRight size={16} />
                            <span>Available</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft size={16} />
                            <span>Unavailable</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* 6. Stock Update Input & Button */}
                    <td>
                      <div className="stock-update-input-group">
                        <input
                          type="number"
                          min="0"
                          value={stockInputs[p._id] ?? ''}
                          onChange={(e) => handleStockChange(p._id, e.target.value)}
                          className="form-control stock-input"
                        />
                        <button
                          onClick={() => handleUpdateStock(p._id)}
                          disabled={updatingStockId === p._id}
                          className={`btn ${successStockId === p._id ? 'btn-success' : 'btn-primary'} btn-sm`}
                        >
                          {successStockId === p._id ? (
                            <>
                              <Check size={14} />
                              <span>Saved</span>
                            </>
                          ) : updatingStockId === p._id ? (
                            'Saving...'
                          ) : (
                            'Update'
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInventory;
