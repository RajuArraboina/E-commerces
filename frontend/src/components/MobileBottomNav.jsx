import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Layers, Search, Heart, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

const MobileBottomNav = () => {
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { isAuthenticated, isAdmin } = useAuth();

  // If user is admin, don't show customer bottom nav
  if (isAdmin) return null;

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Bottom Navigation">
      <NavLink
        to="/"
        end
        className={({ isActive }) => (isActive ? 'mobile-tab active' : 'mobile-tab')}
      >
        <Home size={20} />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/categories"
        className={({ isActive }) => (isActive ? 'mobile-tab active' : 'mobile-tab')}
      >
        <Layers size={20} />
        <span>Categories</span>
      </NavLink>

      <NavLink
        to="/products"
        className={({ isActive }) => (isActive ? 'mobile-tab active' : 'mobile-tab')}
      >
        <Search size={20} />
        <span>Search</span>
      </NavLink>

      <NavLink
        to={isAuthenticated ? '/orders?tab=wishlist' : '/login'}
        className={({ isActive }) => (isActive ? 'mobile-tab active' : 'mobile-tab')}
      >
        <div className="tab-icon-wrap">
          <Heart size={20} />
          {wishlistCount > 0 && <span className="tab-badge wishlist-tab-badge">{wishlistCount}</span>}
        </div>
        <span>Wishlist</span>
      </NavLink>

      <NavLink
        to="/cart"
        className={({ isActive }) => (isActive ? 'mobile-tab active' : 'mobile-tab')}
      >
        <div className="tab-icon-wrap">
          <ShoppingCart size={20} />
          {cartCount > 0 && <span className="tab-badge">{cartCount}</span>}
        </div>
        <span>Cart</span>
      </NavLink>
    </nav>
  );
};

export default MobileBottomNav;
