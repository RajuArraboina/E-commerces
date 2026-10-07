import React, { useState, useEffect } from 'react';
import categoryService from '../../services/categoryService';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import { Edit, Trash2, Save, X } from 'lucide-react';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Form state for creating / editing
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    isActive: true,
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');
      // Dynamic fetch from MongoDB: GET /api/categories?all=true
      const res = await categoryService.getCategories(true);
      if (res.success && Array.isArray(res.data)) {
        setCategories(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load categories from MongoDB');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEditClick = (cat) => {
    setEditingId(cat._id);
    setFormData({
      name: cat.name || '',
      description: cat.description || '',
      image: cat.image || '',
      isActive: cat.isActive ?? true,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', image: '', isActive: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Category name is required.');
      return;
    }

    try {
      setSaving(true);
      if (editingId) {
        // Edit category via PUT /api/categories/:id
        await categoryService.updateCategory(editingId, {
          name: formData.name.trim(),
          description: formData.description.trim(),
          image: formData.image.trim() || undefined,
          isActive: formData.isActive,
        });
      } else {
        // Add category via POST /api/categories
        await categoryService.createCategory({
          name: formData.name.trim(),
          description: formData.description.trim(),
          image: formData.image.trim() || undefined,
          isActive: formData.isActive,
        });
      }
      handleCancelEdit();
      await fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete category "${name}"?`)) {
      try {
        const res = await categoryService.deleteCategory(id);
        if (res.success) {
          fetchCategories();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Cannot delete category: products may still be assigned to it.');
      }
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-title">Category Management</h1>
          <p className="admin-subtitle">
            View, add, edit, and delete store taxonomy dynamically stored in MongoDB
          </p>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="admin-category-layout">
        {/* Form: Add or Edit Category */}
        <div className="category-form-col">
          <div className="card">
            <h3 className="section-card-title">
              {editingId ? 'Edit Category' : 'Add New Category'}
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter category name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  rows="3"
                  placeholder="Brief description of products in this category..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <span>Active & Visible in Catalog</span>
                </label>
              </div>

              <div className="category-btn-row" style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <Save size={16} />
                  <span>{saving ? 'Saving...' : editingId ? 'Update Category' : 'Add Category'}</span>
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="btn btn-outline"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    <X size={16} />
                    <span>Cancel</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Existing Categories List */}
        <div className="category-list-col">
          <div className="card">
            <h3 className="section-card-title">Dynamic Categories from MongoDB ({categories.length})</h3>

            {loading ? (
              <Loading message="Loading categories from MongoDB..." />
            ) : categories.length === 0 ? (
              <p className="text-muted text-center" style={{ padding: '30px' }}>
                No categories found in MongoDB. Create your first category using the form on the left.
              </p>
            ) : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((c) => (
                      <tr key={c._id}>
                        <td>
                          <img
                            src={c.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100'}
                            alt={c.name}
                            className="table-thumbnail"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100';
                            }}
                          />
                        </td>
                        <td>
                          <strong>{c.name}</strong>
                          {c.description && (
                            <small className="text-muted block" style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {c.description}
                            </small>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${c.isActive ? 'badge-success' : 'badge-danger'}`}>
                            {c.isActive ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td>
                          <div className="table-action-btns">
                            <button
                              onClick={() => handleEditClick(c)}
                              className="btn btn-outline btn-xs"
                              title="Edit category"
                            >
                              <Edit size={14} />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(c._id, c.name)}
                              className="btn btn-outline-danger btn-xs"
                              title="Delete category"
                            >
                              <Trash2 size={14} />
                              <span>Delete</span>
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
      </div>
    </div>
  );
};

export default AdminCategories;
