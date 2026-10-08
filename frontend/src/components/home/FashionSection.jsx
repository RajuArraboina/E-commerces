import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shirt, Sparkles, ArrowRight, Tag } from 'lucide-react';
import ProductCarousel from './ProductCarousel';

const FASHION_TABS = [
  { id: 'all', label: 'All Fashion', query: 'Fashion' },
  { id: 'men', label: 'Men', query: 'Men' },
  { id: 'women', label: 'Women', query: 'Women' },
  { id: 'shoes', label: 'Shoes', query: 'Shoes' },
  { id: 'accessories', label: 'Accessories', query: 'Accessories' },
];

const FashionSection = ({ products = [], loading = false, onQuickView }) => {
  const [activeTab, setActiveTab] = useState('all');

  // Filter products dynamically based on tab query keyword
  const filteredProducts = activeTab === 'all'
    ? products
    : products.filter((p) => {
        const query = FASHION_TABS.find((t) => t.id === activeTab)?.query.toLowerCase();
        const catName = (typeof p.category === 'object' ? p.category?.name : p.category) || '';
        const name = p.name || '';
        return (
          catName.toLowerCase().includes(query) ||
          name.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query))
        );
      });

  return (
    <section className="section-fashion-showcase container" aria-label="Fashion Picks">
      <div className="marketplace-section-card fashion-theme-card card">
        <div className="marketplace-section-header">
          <div className="section-title-group">
            <div className="section-title-icon-box bg-purple-soft">
              <Shirt size={22} className="text-accent" />
            </div>
            <div>
              <div className="deals-title-row">
                <h2 className="section-heading-marketplace">Fashion Picks</h2>
                <span className="section-badge-pill fashion-badge">
                  <Sparkles size={13} /> Trending Styles
                </span>
              </div>
              <p className="section-subheading-marketplace">
                Curated streetwear, designer footwear, everyday fits & statement accessories.
              </p>
            </div>
          </div>

          <Link to="/products?category=Fashion" className="btn btn-outline btn-sm">
            <span>Explore All Fashion</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Fashion Subcategory Filter Pills */}
        <div className="fashion-tab-filter-row">
          {FASHION_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`fashion-filter-pill ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <ProductCarousel
          products={filteredProducts.length > 0 ? filteredProducts : products}
          loading={loading}
          onQuickView={onQuickView}
          itemCount={5}
          emptyMessage="No fashion products found in this category."
        />
      </div>
    </section>
  );
};

export default FashionSection;
