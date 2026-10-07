import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import productService from '../services/productService';
import aiService from '../services/aiService';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { Scale, Sparkles, Star, ShoppingCart, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Compare = () => {
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();

  const [allProducts, setAllProducts] = useState([]);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState('');

  // Initial load
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const res = await productService.getProducts({ limit: 40 });
        if (res.success && res.data) {
          setAllProducts(res.data);

          // Check URL query parameters for pre-selected product
          const p1 = searchParams.get('product1');
          const p2 = searchParams.get('product2');
          let initial = [];
          if (p1) initial.push(p1);
          if (p2) initial.push(p2);

          // If fewer than 2, pick top 2 defaults from catalog
          if (initial.length < 2 && res.data.length >= 2) {
            const defaults = res.data.slice(0, 2).map((p) => p._id);
            initial = Array.from(new Set([...initial, ...defaults])).slice(0, 2);
          }
          setSelectedProductIds(initial);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load catalog for comparison');
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, [searchParams]);

  // Run AI Comparison when selected products change
  useEffect(() => {
    const runComparison = async () => {
      if (selectedProductIds.length < 2) {
        setComparisonData(null);
        return;
      }

      try {
        setComparing(true);
        const res = await aiService.compareProducts(selectedProductIds);
        if (res.success) {
          setComparisonData(res);
        }
      } catch (err) {
        console.error('Comparison error:', err);
      } finally {
        setComparing(false);
      }
    };

    if (selectedProductIds.length >= 2) {
      runComparison();
    }
  }, [selectedProductIds]);

  const handleSelectProduct = (productId, slotIndex) => {
    const updated = [...selectedProductIds];
    updated[slotIndex] = productId;
    setSelectedProductIds(Array.from(new Set(updated)));
  };

  const handleRemoveSlot = (slotIndex) => {
    const updated = selectedProductIds.filter((_, i) => i !== slotIndex);
    setSelectedProductIds(updated);
  };

  if (loading) return <Loading message="Loading product comparison matrix..." />;

  const products = comparisonData?.products || [];
  const verdict = comparisonData?.verdict;

  return (
    <div className="compare-page container">
      {/* Page Header */}
      <div className="admin-page-header" style={{ marginBottom: '24px' }}>
        <div>
          <div className="badge-tag badge-tag-ai" style={{ marginBottom: '8px' }}>
            <Sparkles size={14} /> AI Product Comparison Engine
          </div>
          <h1 className="admin-title">Side-by-Side Product Comparison</h1>
          <p className="admin-subtitle">
            Evaluate key technical specifications, pricing, and customer ratings backed by ShopSphere AI analysis
          </p>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Selectors Bar */}
      <div className="card compare-selectors-card" style={{ marginBottom: '24px', padding: '20px' }}>
        <div className="selectors-grid">
          {[0, 1, 2].map((slotIdx) => {
            const currentId = selectedProductIds[slotIdx] || '';
            return (
              <div key={slotIdx} className="slot-select-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Product {slotIdx + 1}:</label>
                  {currentId && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSlot(slotIdx)}
                      className="btn btn-outline btn-xs"
                      style={{ padding: '2px 6px' }}
                      title="Remove product from slot"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
                <select
                  className="form-control"
                  value={currentId}
                  onChange={(e) => handleSelectProduct(e.target.value, slotIdx)}
                >
                  <option value="">-- Choose Product --</option>
                  {allProducts.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} (₹{p.price.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Comparison Verdict Card */}
      {verdict && (
        <div className="card ai-verdict-card" style={{ marginBottom: '32px' }}>
          <div className="ai-summary-header">
            <div className="ai-badge">
              <Sparkles size={18} className="text-accent" />
              <span>✨ ShopSphere AI Comparison Verdict</span>
            </div>
            <span className="badge badge-success">Live Analysis Complete</span>
          </div>

          <div
            className="verdict-recommendation-box"
            dangerouslySetInnerHTML={{
              __html: verdict.recommendation.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
            }}
          />

          <div className="verdict-highlights-row">
            {verdict.keyTakeaways?.map((item) => (
              <div key={item.id} className="verdict-takeaway-item">
                <strong className="takeaway-name">{item.name}</strong>
                <span className="takeaway-text">{item.highlight}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comparison Table */}
      {comparing ? (
        <Loading message="AI analyzing specifications and rating trends..." />
      ) : products.length >= 2 ? (
        <div className="card comparison-table-card">
          <div className="table-responsive">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th className="feature-col">Specification / Metric</th>
                  {products.map((p) => (
                    <th key={p._id} className="product-col">
                      <div className="compare-card-top">
                        <img src={p.image} alt={p.name} className="compare-img" />
                        <h4 className="compare-name">{p.name}</h4>
                        <div className="compare-price">₹{Number(p.price).toLocaleString('en-IN')}</div>
                        <button
                          type="button"
                          onClick={() => addToCart(p._id, null, 1)}
                          className="btn btn-primary btn-sm compare-add-btn"
                        >
                          <ShoppingCart size={14} />
                          <span>Add to Cart</span>
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="feature-label">Brand</td>
                  {products.map((p) => (
                    <td key={p._id} className="feature-val">{p.brand}</td>
                  ))}
                </tr>
                <tr>
                  <td className="feature-label">Customer Rating</td>
                  {products.map((p) => (
                    <td key={p._id} className="feature-val">
                      <div className="stars-wrap">
                        <Star size={15} className="star-filled" />
                        <strong>{p.rating ? p.rating.toFixed(1) : '4.5'}</strong> / 5
                      </div>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="feature-label">Stock Status</td>
                  {products.map((p) => (
                    <td key={p._id} className="feature-val">
                      <span className={`badge ${p.stock > 0 ? 'badge-success' : 'badge-danger'}`}>
                        {p.stock > 0 ? `In Stock (${p.stock})` : 'Out of Stock'}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="feature-label">Category</td>
                  {products.map((p) => (
                    <td key={p._id} className="feature-val">{p.category?.name || 'General'}</td>
                  ))}
                </tr>
                <tr>
                  <td className="feature-label">Warranty & Service</td>
                  {products.map((p) => (
                    <td key={p._id} className="feature-val">1 Year Official Brand Warranty</td>
                  ))}
                </tr>
                <tr>
                  <td className="feature-label">Key Specifications</td>
                  {products.map((p) => (
                    <td key={p._id} className="feature-val">
                      {p.specifications && p.specifications.length > 0 ? (
                        <ul className="spec-bullets-list">
                          {p.specifications.map((s, idx) => (
                            <li key={idx}>
                              <strong>{s.name}:</strong> {s.value}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-muted">Standard specifications</span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card text-center" style={{ padding: '40px 20px' }}>
          <Scale size={42} className="text-muted" style={{ margin: '0 auto 16px' }} />
          <h3>Select at least 2 products to compare</h3>
          <p className="text-muted">Choose products from the dropdown above to view an AI-powered side-by-side spec comparison.</p>
        </div>
      )}
    </div>
  );
};

export default Compare;
