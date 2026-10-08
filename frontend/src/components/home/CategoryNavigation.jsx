import React from 'react';
import { Link } from 'react-router-dom';
import {
  Laptop,
  Smartphone,
  Shirt,
  Sparkles,
  Home as HomeIcon,
  ShoppingBag,
  Headphones,
  Watch,
  Grid,
  ChevronRight,
} from 'lucide-react';

const CATEGORY_ICON_MAP = {
  electronics: Laptop,
  laptops: Laptop,
  mobiles: Smartphone,
  smartphones: Smartphone,
  fashion: Shirt,
  beauty: Sparkles,
  'home & kitchen': HomeIcon,
  home: HomeIcon,
  accessories: Watch,
  audio: Headphones,
  shoes: ShoppingBag,
};

const CategoryNavigation = ({ categories = [], loading = false }) => {
  const getCategoryIcon = (catName = '') => {
    const key = catName.toLowerCase().trim();
    for (const [pattern, IconComp] of Object.entries(CATEGORY_ICON_MAP)) {
      if (key.includes(pattern)) return IconComp;
    }
    return Grid;
  };

  return (
    <nav className="marketplace-category-strip" aria-label="Top Categories Navigation">
      <div className="container category-strip-container">
        <div className="category-strip-scroll">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="category-strip-item-skeleton">
                <div className="skeleton skeleton-circle category-strip-icon-skeleton" />
                <div className="skeleton skeleton-text category-strip-label-skeleton" />
              </div>
            ))
          ) : (
            <>
              {categories.map((cat) => {
                const IconComponent = getCategoryIcon(cat.name);
                const catLink = `/products?category=${encodeURIComponent(cat.name)}`;

                return (
                  <Link
                    key={cat._id}
                    to={catLink}
                    className="category-strip-item"
                    title={`Shop ${cat.name}`}
                  >
                    <div className="category-strip-icon-box">
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="category-strip-img"
                          loading="lazy"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className="category-strip-icon-fallback"
                        style={{ display: cat.image ? 'none' : 'flex' }}
                      >
                        <IconComponent size={20} />
                      </div>
                    </div>
                    <span className="category-strip-label">{cat.name}</span>
                  </Link>
                );
              })}

              {/* View All Categories shortcut */}
              <Link to="/categories" className="category-strip-item category-strip-view-all">
                <div className="category-strip-icon-box view-all-box">
                  <Grid size={18} />
                </div>
                <span className="category-strip-label">
                  View All <ChevronRight size={12} className="inline-icon" />
                </span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default CategoryNavigation;
