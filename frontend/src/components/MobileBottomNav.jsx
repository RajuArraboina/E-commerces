import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, ShoppingCart, Package, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const MobileBottomNav = () => {
  const { cartCount } = useCart();
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
        to="/products"
        className={({ isActive }) => (isActive ? 'mobile-tab active' : 'mobile-tab')}
      >
        <Search size={20} />
        <span>Search</span>
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

      <NavLink
        to={isAuthenticated ? '/orders' : '/login'}
        className={({ isActive }) => (isActive ? 'mobile-tab active' : 'mobile-tab')}
      >
        <Package size={20} />
        <span>Orders</span>
      </NavLink>

      <NavLink
        to={isAuthenticated ? '/profile' : '/login'}
        className={({ isActive }) => (isActive ? 'mobile-tab active' : 'mobile-tab')}
      >
        <User size={20} />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
};

export default MobileBottomNav;
