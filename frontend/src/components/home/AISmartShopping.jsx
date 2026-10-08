import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Search,
  Bot,
  MessageSquare,
  Scale,
  BadgePercent,
  ArrowRight,
} from 'lucide-react';

const AI_FEATURES = [
  {
    icon: Search,
    title: 'Smart Product Search',
    desc: 'Search using natural language like "wireless headphones under ₹3,000".',
    color: '#6366f1',
    bgColor: 'rgba(99, 102, 241, 0.12)',
  },
  {
    icon: Bot,
    title: 'AI Recommendations',
    desc: 'Get smart suggestions tailored to your budget, activity, and preferences.',
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.12)',
  },
  {
    icon: MessageSquare,
    title: 'AI Shopping Assistant',
    desc: 'Chat with our intelligent bot to get instant product advice and specs.',
    color: '#ec4899',
    bgColor: 'rgba(236, 72, 153, 0.12)',
  },
  {
    icon: Scale,
    title: 'Smart Comparison',
    desc: 'Side-by-side technical specification breakdowns for phones & laptops.',
    color: '#06b6d4',
    bgColor: 'rgba(6, 182, 212, 0.12)',
  },
  {
    icon: BadgePercent,
    title: 'Deal Finder',
    desc: 'Automatically scans live discounts to find the steepest price drops.',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.12)',
  },
];

const SUGGESTED_QUERIES = [
  'Wireless headphones under ₹3,000',
  'Coding laptops with 16GB RAM',
  'Best AMOLED smartwatch under ₹5,000',
  '5G phone with Sony camera sensor',
];

const AISmartShopping = ({ onOpenAssistant }) => {
  const navigate = useNavigate();
  const [nlQuery, setNlQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (nlQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(nlQuery.trim())}`);
    }
  };

  const handleChipClick = (query) => {
    setNlQuery(query);
    navigate(`/products?search=${encodeURIComponent(query)}`);
  };

  const handleOpenAI = () => {
    if (onOpenAssistant) {
      onOpenAssistant();
    } else {
      // Find floating button and click
      const btn = document.querySelector('.ai-floating-btn');
      if (btn) btn.click();
    }
  };

  return (
    <section className="section-ai-smart-shopping container" aria-label="AI Shopping Assistant Features">
      <div className="ai-smart-card card">
        <div className="ai-smart-header">
          <div className="ai-badge-row">
            <span className="ai-badge">
              <Sparkles size={16} className="text-accent" />
              <span>Next-Gen Shopping Intelligence</span>
            </span>
          </div>

          <h2 className="ai-smart-title">Shop Smarter with EShop AI</h2>
          <p className="ai-smart-subtitle">
            Your personal shopping assistant powered by machine intelligence to help you discover, compare, and save.
          </p>
        </div>

        {/* Natural Language Search Input */}
        <form onSubmit={handleSearchSubmit} className="ai-smart-input-box">
          <div className="ai-input-wrap">
            <Sparkles size={18} className="ai-input-icon text-accent" />
            <input
              type="text"
              placeholder="Ask anything... e.g. 'Show me wireless headphones under ₹3,000'"
              value={nlQuery}
              onChange={(e) => setNlQuery(e.target.value)}
              className="ai-search-field"
            />
          </div>

          <button type="submit" className="btn btn-primary ai-submit-btn">
            <span>Find with AI</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Suggested Prompt Chips */}
        <div className="ai-chips-shelf">
          <span className="chips-label">Try asking:</span>
          {SUGGESTED_QUERIES.map((q, idx) => (
            <button
              key={idx}
              type="button"
              className="ai-prompt-chip"
              onClick={() => handleChipClick(q)}
            >
              <span>{q}</span>
            </button>
          ))}
        </div>

        {/* 5 Features Grid */}
        <div className="ai-features-grid">
          {AI_FEATURES.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="ai-feature-card">
                <div
                  className="ai-feature-icon"
                  style={{ backgroundColor: item.bgColor, color: item.accentColor || item.color }}
                >
                  <Icon size={20} />
                </div>
                <h3 className="ai-feature-heading">{item.title}</h3>
                <p className="ai-feature-desc">{item.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Button */}
        <div className="ai-smart-footer">
          <button
            type="button"
            onClick={handleOpenAI}
            className="btn btn-primary btn-lg ai-trigger-cta"
          >
            <Sparkles size={18} />
            <span>Ask EShop AI</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default AISmartShopping;
