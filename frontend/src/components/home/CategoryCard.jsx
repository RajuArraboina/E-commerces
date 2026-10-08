import React from 'react';
import { Link } from 'react-router-dom';
import {
  Headphones,
  Laptop,
  Smartphone,
  Shirt,
  Home as HomeIcon,
  Sparkles,
  Watch,
  ShoppingBag,
  Layers,
  ArrowRight,
} from 'lucide-react';

const getCategoryIcon = (name = '') => {
  const n = name.toLowerCase();
  if (n.includes('audio') || n.includes('ear') || n.includes('headphone')) return Headphones;
  if (n.includes('laptop') || n.includes('computer')) return Laptop;
  if (n.includes('phone') || n.includes('mobile')) return Smartphone;
  if (n.includes('fashion') || n.includes('cloth') || n.includes('apparel')) return Shirt;
  if (n.includes('home') || n.includes('kitchen')) return HomeIcon;
  if (n.includes('beauty') || n.includes('skin')) return Sparkles;
  if (n.includes('watch') || n.includes('wearable') || n.includes('accessor')) return Watch;
  if (n.includes('grocer') || n.includes('food')) return ShoppingBag;
  if (n.includes('electron')) return Laptop;
  return Layers;
};

const CategoryCard = ({ category, productCount = 0 }) => {
  if (!category) return null;

  const Icon = getCategoryIcon(category.name);
  const countLabel = productCount > 0 ? `${productCount} Product${productCount === 1 ? '' : 's'}` : 'View Collection';
  const imgUrl = category.image || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=500';

  return (
    <Link
      to={`/products?category=${encodeURIComponent(category.name)}`}
      className="category-card-modern card"
      aria-label={`Explore ${category.name} category`}
    >
      <div className="category-img-container">
        <img
          src={imgUrl}
          alt={category.name}
          className="category-modern-img"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=500';
          }}
        />
        <div className="category-modern-overlay" />
        <span className="category-icon-floating">
          <Icon size={20} />
        </span>
      </div>

      <div className="category-modern-body">
        <h3 className="category-modern-name">{category.name}</h3>
        {category.description && (
          <p className="category-modern-tagline">{category.description}</p>
        )}
        <div className="category-footer-row">
          <span className="category-modern-count">{countLabel}</span>
          <span className="category-explore-link">
            <span>Explore</span>
            <ArrowRight size={14} className="explore-arrow" />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
