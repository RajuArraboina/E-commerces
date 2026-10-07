import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import aiService from '../../services/aiService';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import { ArrowLeft, Save, Sparkles } from 'lucide-react';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingDesc, setGeneratingDesc] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    brand: '',
    stock: '',
    image: '',
    rating: '4.5',
    isAvailable: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const [prodRes, catRes] = await Promise.all([
          productService.getProductById(id),
          categoryService.getCategories(),
        ]);

        if (catRes.success && Array.isArray(catRes.data)) {
          setCategories(catRes.data);
        }

        if (prodRes.success && prodRes.data) {
          const p = prodRes.data;
          setFormData({
            name: p.name || '',
            description: p.description || '',
            price: p.price ?? '',
            category: typeof p.category === 'object' ? p.category?._id || '' : p.category || '',
            brand: p.brand || '',
            stock: p.stock ?? '',
            image: p.image || '',
            rating: p.rating ?? 4.5,
            isAvailable: p.isAvailable ?? true,
          });
        } else {
          setError('Product not found on server');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load product from server');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleGenerateAiDescription = async () => {
    if (!formData.name.trim()) {
      alert('Please enter a Product Name first to generate an AI description.');
      return;
    }
    try {
      setGeneratingDesc(true);
      const res = await aiService.generateDescription({
        name: formData.name,
        brand: formData.brand,
        category: formData.category,
        price: formData.price,
      });
      if (res.success && res.description) {
        setFormData((prev) => ({ ...prev, description: res.description }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate AI description');
    } finally {
      setGeneratingDesc(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      formData.price === '' ||
      !formData.brand.trim() ||
      !formData.category
    ) {
      setError('Please provide Product Name, Description, Price, Brand, and Category.');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      category: formData.category,
      brand: formData.brand.trim(),
      stock: Number(formData.stock) || 0,
      image: formData.image.trim() || undefined,
      rating: Number(formData.rating) || 0,
      isAvailable: formData.isAvailable,
    };

    try {
      setSaving(true);
      // Actual backend PUT endpoint: PUT /api/products/:id
      const res = await productService.updateProduct(id, payload);
      if (res.success) {
        navigate('/admin/products');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading message="Loading product data from MongoDB..." />;

  return (
    <div className="admin-page">
      <Link to="/admin/products" className="back-link">
        <ArrowLeft size={16} />
        <span>Back to Product Management</span>
      </Link>

      <div className="admin-page-header">
        <div>
          <h1 className="admin-title">Edit Product</h1>
          <p className="admin-subtitle">Update catalog product details directly in MongoDB</p>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="card" style={{ maxWidth: '800px' }}>
        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Description *</label>
              <button
                type="button"
                onClick={handleGenerateAiDescription}
                disabled={generatingDesc || !formData.name.trim()}
                className="btn btn-outline btn-xs"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                title="Auto-generate description using AI"
              >
                <Sparkles size={13} className="text-accent" />
                <span>{generatingDesc ? 'Generating...' : '✨ Generate Description'}</span>
              </button>
            </div>
            <textarea
              name="description"
              required
              rows="4"
              value={formData.description}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="form-row-2">
            {/* Price */}
            <div className="form-group">
              <label className="form-label">Price (₹) *</label>
              <input
                type="number"
                name="price"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            {/* Brand */}
            <div className="form-group">
              <label className="form-label">Brand *</label>
              <input
                type="text"
                name="brand"
                required
                value={formData.brand}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>

          <div className="form-row-2">
            {/* Category */}
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="form-control"
              >
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Stock */}
            <div className="form-group">
              <label className="form-label">Stock Units *</label>
              <input
                type="number"
                name="stock"
                required
                min="0"
                value={formData.stock}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>

          <div className="form-row-2">
            {/* Image URL */}
            <div className="form-group">
              <label className="form-label">Image URL</label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            {/* Rating */}
            <div className="form-group">
              <label className="form-label">Rating (0 to 5)</label>
              <input
                type="number"
                name="rating"
                min="0"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>

          {/* Availability */}
          <div className="form-group" style={{ marginTop: '10px' }}>
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleChange}
              />
              <span>Availability: Item is active and available in catalog</span>
            </label>
          </div>

          <div style={{ marginTop: '25px', display: 'flex', gap: '12px' }}>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <Save size={16} />
              <span>{saving ? 'Updating...' : 'Update Product'}</span>
            </button>
            <Link to="/admin/products" className="btn btn-outline">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
