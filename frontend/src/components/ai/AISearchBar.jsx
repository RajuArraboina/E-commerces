import React, { useState } from 'react';
import aiService from '../../services/aiService';
import { Sparkles, Search, ArrowRight, X, Loader2, Tag } from 'lucide-react';
import ProductCard from '../ProductCard';

const SAMPLE_PROMPTS = [
  'Show me a laptop for programming under ₹70000',
  'Find phones under ₹50000 with a good camera',
  'Show me running shoes below ₹5000',
  'I need a gift for my brother under ₹3000',
];

const AISearchBar = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async (searchQuery) => {
    const q = searchQuery !== undefined ? searchQuery : query;
    if (!q || !q.trim()) return;

    try {
      setLoading(true);
      setError('');
      const res = await aiService.aiSearch(q.trim());
      if (res.success) {
        setResults(res);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not interpret query. Please try another prompt.');
    } finally {
      setLoading(false);
    }
  };

  const handlePromptClick = (p) => {
    setQuery(p);
    handleSearch(p);
  };

  const clearResults = () => {
    setResults(null);
    setQuery('');
  };

  return (
    <div className="ai-search-widget">
      <div className="ai-search-card card">
        <div className="ai-search-header">
          <div className="ai-badge">
            <Sparkles size={16} className="text-accent" />
            <span>AI Natural Language Search</span>
          </div>
          <p className="ai-search-sub">
            Type anything in plain English — budgets, specs, or gift ideas. Our AI finds the perfect match.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="ai-search-form"
        >
          <div className="ai-input-wrap">
            <Sparkles className="ai-input-icon text-accent" size={20} />
            <input
              type="text"
              className="ai-input-field"
              placeholder="e.g. Show me a laptop for programming under ₹70000..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                type="button"
                onClick={clearResults}
                className="ai-clear-btn"
                title="Clear input"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="btn btn-primary ai-submit-btn"
          >
            {loading ? <Loader2 size={18} className="spin-animation" /> : <Search size={18} />}
            <span>{loading ? 'Analyzing...' : 'Search with AI'}</span>
          </button>
        </form>

        {/* Suggested Quick Prompts */}
        <div className="ai-prompts-row">
          <span className="ai-prompts-label">Try asking:</span>
          <div className="ai-prompts-chips">
            {SAMPLE_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                className="ai-prompt-chip"
                onClick={() => handlePromptClick(prompt)}
              >
                <span>{prompt}</span>
                <ArrowRight size={12} />
              </button>
            ))}
          </div>
        </div>

        {error && <div className="ai-error-banner">{error}</div>}

        {/* AI Results Display */}
        {results && (
          <div className="ai-results-container">
            <div className="ai-explanation-box">
              <div className="ai-explanation-title">
                <Sparkles size={16} className="text-accent" />
                <strong>ShopSphere AI Insight:</strong>
              </div>
              <p className="ai-explanation-text">{results.explanation}</p>

              {/* Extracted Entity Tags */}
              <div className="ai-tags-row">
                {results.extracted?.category && (
                  <span className="badge badge-primary">
                    <Tag size={12} style={{ marginRight: '4px' }} />
                    Category: {results.extracted.category}
                  </span>
                )}
                {results.extracted?.maxPrice && (
                  <span className="badge badge-info">
                    Max: ₹{results.extracted.maxPrice.toLocaleString('en-IN')}
                  </span>
                )}
                {results.extracted?.keywords?.length > 0 &&
                  results.extracted.keywords.map((kw, i) => (
                    <span key={i} className="badge badge-muted">
                      #{kw}
                    </span>
                  ))}
              </div>
            </div>

            {results.data && results.data.length > 0 ? (
              <div className="products-grid ai-matched-grid">
                {results.data.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="ai-no-matches">
                <p>No products strictly matched those parameters. Try increasing the budget or adjusting keywords.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AISearchBar;
