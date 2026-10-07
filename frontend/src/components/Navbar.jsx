import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ThemeToggle from './ThemeToggle';
import {
  ShoppingBag,
  ShoppingCart,
  User,
  LogOut,
  Search,
  Menu,
  X,
  LayoutDashboard,
  Package,
  Layers,
  Users,
  Archive,
  ClipboardList,
  Heart,
  ChevronDown,
  Shield,
  MapPin
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [userLocation, setUserLocation] = useState(() => {
    return localStorage.getItem('shopsphere_user_location') || 'Mumbai, 400001';
  });
  const [tempPincode, setTempPincode] = useState('');
  const accountDropdownRef = useRef(null);

  const handleSaveLocation = (loc) => {
    const newLoc = loc || (tempPincode.trim() ? `India, ${tempPincode.trim()}` : 'India');
    setUserLocation(newLoc);
    localStorage.setItem('shopsphere_user_location', newLoc);
    setLocationModalOpen(false);
    setTempPincode('');
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target)) {
        setAccountDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* Brand Logo & Location Selector */}
        <div className="navbar-brand-group">
          <Link to="/" className="navbar-brand">
            <ShoppingBag className="brand-icon" size={26} />
            <span className="brand-name">ShopSphere</span>
          </Link>

          {!isAdmin && (
            <button
              type="button"
              className="navbar-location-btn hide-on-mobile"
              onClick={() => setLocationModalOpen(true)}
              title="Select Delivery Location"
            >
              <MapPin size={16} className="location-icon text-primary" />
              <div className="location-text">
                <span className="location-hint">Deliver to</span>
                <span className="location-city">{userLocation}</span>
              </div>
            </button>
          )}
        </div>

        {/* Global Search Bar (Non-admin or shared) */}
        {!isAdmin && (
          <form onSubmit={handleSearchSubmit} className="navbar-search">
            <input
              type="text"
              placeholder="Search products, brands and categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" aria-label="Search">
              <Search size={18} />
            </button>
          </form>
        )}

        {/* Desktop Navigation Links */}
        <nav className="navbar-links">
          {isAdmin ? (
            // Admin Navigation
            <>
              <NavLink to="/admin" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </NavLink>
              <NavLink to="/admin/products" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                <Package size={16} />
                <span>Products</span>
              </NavLink>
              <NavLink to="/admin/categories" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                <Layers size={16} />
                <span>Categories</span>
              </NavLink>
              <NavLink to="/admin/inventory" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                <Archive size={16} />
                <span>Inventory</span>
              </NavLink>
              <NavLink to="/admin/customers" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                <Users size={16} />
                <span>Customers</span>
              </NavLink>
              <NavLink to="/admin/orders" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                <ClipboardList size={16} />
                <span>Orders</span>
              </NavLink>
            </>
          ) : (
            // Customer / Public Navigation
            <>
              <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                Home
              </NavLink>
              <NavLink to="/products" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                Products
              </NavLink>
              <NavLink to="/categories" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                Categories
              </NavLink>
              {isAuthenticated && (
                <NavLink to="/orders" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                  Orders
                </NavLink>
              )}
            </>
          )}
        </nav>

        {/* Right Action Icons & Auth Controls */}
        <div className="navbar-actions">
          <ThemeToggle />

          {!isAdmin && (
            <>
              <Link
                to={isAuthenticated ? '/dashboard?tab=wishlist' : '/login'}
                className="cart-badge-btn"
                aria-label="Wishlist"
                title="My Wishlist"
              >
                <Heart size={21} />
                {wishlistCount > 0 && <span className="badge-count wishlist-badge">{wishlistCount}</span>}
              </Link>
              <Link to="/cart" className="cart-badge-btn" aria-label="Shopping Cart">
                <ShoppingCart size={21} />
                {cartCount > 0 && <span className="badge-count">{cartCount}</span>}
              </Link>
            </>
          )}

          {isAuthenticated ? (
            <div className="account-dropdown-wrapper" ref={accountDropdownRef}>
              <button
                type="button"
                className={`account-trigger-btn ${accountDropdownOpen ? 'active' : ''}`}
                onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                aria-expanded={accountDropdownOpen}
                aria-label="My Account Menu"
              >
                <div className="account-avatar">
                  <User size={16} />
                </div>
                <span className="account-name">{user?.name?.split(' ')[0] || 'My Account'}</span>
                {isAdmin && <span className="admin-tag">Admin</span>}
                <ChevronDown size={14} className={`dropdown-chevron ${accountDropdownOpen ? 'rotate' : ''}`} />
              </button>

              {accountDropdownOpen && (
                <div className="account-dropdown-menu card" role="menu">
                  {/* Account Header */}
                  <div className="account-dropdown-header">
                    <div className="account-user-name">{user?.name || 'Customer'}</div>
                    <div className="account-user-email">{user?.email}</div>
                    <span className="account-badge">{isAdmin ? 'Store Administrator' : 'Verified Customer'}</span>
                  </div>

                  <div className="account-dropdown-divider" />

                  {/* Primary Action Buttons: My Orders */}
                  <div className="account-dropdown-links">
                    <Link
                      to="/orders"
                      className="account-menu-item highlight-item"
                      onClick={() => setAccountDropdownOpen(false)}
                      role="menuitem"
                    >
                      <div className="account-item-icon bg-primary-soft">
                        <Package size={17} className="text-primary" />
                      </div>
                      <div className="account-item-text">
                        <span className="account-item-title">My Orders</span>
                        <span className="account-item-sub">Orders, activity & reward points</span>
                      </div>
                    </Link>

                    <Link
                      to="/orders?tab=wishlist"
                      className="account-menu-item"
                      onClick={() => setAccountDropdownOpen(false)}
                      role="menuitem"
                    >
                      <div className="account-item-icon bg-danger-soft">
                        <Heart size={17} className="text-danger" />
                      </div>
                      <div className="account-item-text">
                        <span className="account-item-title">Wishlist</span>
                        <span className="account-item-sub">{wishlistCount} saved items</span>
                      </div>
                    </Link>

                    <Link
                      to="/profile"
                      className="account-menu-item"
                      onClick={() => setAccountDropdownOpen(false)}
                      role="menuitem"
                    >
                      <div className="account-item-icon">
                        <User size={17} />
                      </div>
                      <div className="account-item-text">
                        <span className="account-item-title">Profile Settings</span>
                        <span className="account-item-sub">Shipping address & security</span>
                      </div>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="account-menu-item"
                        onClick={() => setAccountDropdownOpen(false)}
                        role="menuitem"
                      >
                        <div className="account-item-icon bg-warning-soft">
                          <Shield size={17} className="text-warning" />
                        </div>
                        <div className="account-item-text">
                          <span className="account-item-title">Admin Console</span>
                          <span className="account-item-sub">Analytics & catalog management</span>
                        </div>
                      </Link>
                    )}
                  </div>

                  <div className="account-dropdown-divider" />

                  <button
                    type="button"
                    onClick={() => {
                      setAccountDropdownOpen(false);
                      handleLogout();
                    }}
                    className="account-menu-logout"
                    role="menuitem"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="guest-auth-btns">
              <Link to="/login" className="btn btn-outline btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            className="mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          {!isAdmin && (
            <form onSubmit={handleSearchSubmit} className="mobile-search-form">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit">
                <Search size={18} />
              </button>
            </form>
          )}

          <div className="mobile-links">
            {isAdmin ? (
              <>
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                <Link to="/admin/products" onClick={() => setMobileMenuOpen(false)}>Products</Link>
                <Link to="/admin/categories" onClick={() => setMobileMenuOpen(false)}>Categories</Link>
                <Link to="/admin/inventory" onClick={() => setMobileMenuOpen(false)}>Inventory</Link>
                <Link to="/admin/customers" onClick={() => setMobileMenuOpen(false)}>Customers</Link>
                <Link to="/admin/orders" onClick={() => setMobileMenuOpen(false)}>Orders</Link>
              </>
            ) : (
              <>
                <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                <Link to="/products" onClick={() => setMobileMenuOpen(false)}>Products</Link>
                <Link to="/categories" onClick={() => setMobileMenuOpen(false)}>Categories</Link>
                {isAuthenticated && (
                  <Link to="/orders" onClick={() => setMobileMenuOpen(false)}>My Orders</Link>
                )}
                <Link to="/cart" onClick={() => setMobileMenuOpen(false)}>Cart ({cartCount})</Link>
              </>
            )}

            {isAuthenticated ? (
              <>
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="mobile-logout-btn"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="mobile-auth-actions">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-outline">
                  Login
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Location Selector Modal */}
      {locationModalOpen && (
        <div className="location-modal-overlay" onClick={() => setLocationModalOpen(false)}>
          <div className="location-modal card" onClick={(e) => e.stopPropagation()}>
            <div className="location-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={20} className="text-primary" />
                <h3>Choose Delivery Location</h3>
              </div>
              <button
                type="button"
                className="close-icon-btn"
                onClick={() => setLocationModalOpen(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <p className="location-modal-sub">
              Enter your postal pincode or select a city to see real-time product stock and express delivery options.
            </p>
            <div className="location-pincode-input-row">
              <input
                type="text"
                placeholder="Enter 6-digit Pincode"
                maxLength={6}
                value={tempPincode}
                onChange={(e) => setTempPincode(e.target.value.replace(/\D/g, ''))}
                className="form-control"
              />
              <button
                type="button"
                onClick={() => handleSaveLocation()}
                className="btn btn-primary"
                disabled={!tempPincode.trim()}
              >
                Apply
              </button>
            </div>
            <div className="popular-cities-row">
              <small className="popular-cities-title">Popular Delivery Hubs:</small>
              <div className="cities-chips">
                {['Mumbai, 400001', 'Delhi, 110001', 'Bengaluru, 560001', 'Hyderabad, 500001', 'Chennai, 600001'].map((city) => (
                  <button
                    key={city}
                    type="button"
                    className={`city-chip ${userLocation === city ? 'active' : ''}`}
                    onClick={() => handleSaveLocation(city)}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
