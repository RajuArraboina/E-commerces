import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ThemeToggle from './ThemeToggle';
import OfferBar from './home/OfferBar';
import SearchSuggestions from './home/SearchSuggestions';
import NotificationDropdown from './home/NotificationDropdown';
import MiniCartDrawer from './home/MiniCartDrawer';
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
  Archive,
  ClipboardList,
  Heart,
  ChevronDown,
  Shield,
  MapPin,
  Sparkles,
  Zap,
  Flame,
  Award,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [userLocation, setUserLocation] = useState(() => {
    return localStorage.getItem('shopsphere_user_location') || 'Mumbai, 400001';
  });
  const [tempPincode, setTempPincode] = useState('');

  const accountDropdownRef = useRef(null);
  const searchContainerRef = useRef(null);

  const handleSaveLocation = (loc) => {
    const newLoc = loc || (tempPincode.trim() ? `India, ${tempPincode.trim()}` : 'India');
    setUserLocation(newLoc);
    localStorage.setItem('shopsphere_user_location', newLoc);
    setLocationModalOpen(false);
    setTempPincode('');
  };

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target)) {
        setAccountDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen for global mini-cart open events
  useEffect(() => {
    const handleOpenMiniCart = () => setIsMiniCartOpen(true);
    window.addEventListener('shopsphere:open-minicart', handleOpenMiniCart);
    return () => window.removeEventListener('shopsphere:open-minicart', handleOpenMiniCart);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchFocused(false);
  }, [location.pathname, location.search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchFocused(false);
      setMobileMenuOpen(false);
    }
  };

  const handleSelectSearchTerm = (term) => {
    setSearchQuery(term);
    navigate(`/products?search=${encodeURIComponent(term)}`);
    setSearchFocused(false);
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleOpenAIChat = () => {
    const btn = document.querySelector('.ai-floating-btn');
    if (btn) btn.click();
  };

  return (
    <>
      {/* 3. Dynamic Top Offer Bar (for Customers) */}
      {!isAdmin && <OfferBar />}

      <header className="navbar-header sticky-header">
        {/* Vibrant Multi-Color Top Accent Line */}
        <div className="navbar-top-accent-line" />

        {/* Main Header Row */}
        <div className="navbar-container">
          {/* Brand Logo & Location Selector */}
          <div className="navbar-brand-group">
            <Link to="/" className="navbar-brand" aria-label="EShop Home">
              <div className="brand-logo-icon">
                <ShoppingBag size={22} />
              </div>
              <span className="brand-name">EShop</span>
              <span className="brand-dot-pulse" />
            </Link>

            {!isAdmin && (
              <button
                type="button"
                className="navbar-location-btn hide-on-mobile"
                onClick={() => setLocationModalOpen(true)}
                title="Select Delivery Location"
                aria-label="Delivery Location"
              >
                <MapPin size={16} className="location-icon" />
                <div className="location-text">
                  <span className="location-hint">Deliver to</span>
                  <span className="location-city">{userLocation}</span>
                </div>
              </button>
            )}
          </div>

          {/* Global Search Bar with Live Suggestions Dropdown */}
          {!isAdmin ? (
            <div className="navbar-search-wrapper" ref={searchContainerRef}>
              <form onSubmit={handleSearchSubmit} className="navbar-search-form">
                <div className="search-input-inner">
                  <Search size={18} className="search-icon-left text-muted" />
                  <input
                    type="text"
                    placeholder="Search for products, brands and more"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (!searchFocused) setSearchFocused(true);
                    }}
                    onFocus={() => setSearchFocused(true)}
                    className="header-search-input"
                    aria-label="Global product search"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="search-clear-cross"
                      aria-label="Clear query"
                    >
                      <X size={15} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleOpenAIChat}
                    className="search-ai-assistant-btn"
                    title="Ask EShop AI"
                    aria-label="Ask AI"
                  >
                    <Sparkles size={16} className="text-accent" />
                  </button>
                </div>
                <button type="submit" className="search-submit-action" aria-label="Submit Search">
                  <Search size={16} />
                </button>
              </form>

              {/* Live Search Suggestions Dropdown Overlay */}
              <SearchSuggestions
                query={searchQuery}
                isOpen={searchFocused}
                onClose={() => setSearchFocused(false)}
                onSelectTerm={handleSelectSearchTerm}
              />
            </div>
          ) : (
            // Admin Mode Navigation Pill
            <div className="admin-status-pill">
              <Shield size={16} className="text-warning" />
              <span>Admin Management Mode</span>
            </div>
          )}

          {/* Admin Navigation (Desktop) */}
          {isAdmin && (
            <nav className="navbar-links admin-nav-links">
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
              <NavLink to="/admin/orders" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                <ClipboardList size={16} />
                <span>Orders</span>
              </NavLink>
            </nav>
          )}

          {/* Right Action Icons & Auth Controls */}
          <div className="navbar-actions">
            <ThemeToggle />

            {!isAdmin && (
              <>
                {/* Notifications Dropdown */}
                <NotificationDropdown />

                {/* Orders Shortcut */}
                {isAuthenticated && (
                  <Link
                    to="/orders"
                    className="cart-badge-btn nav-action-btn nav-action-orders hide-on-mobile"
                    aria-label="My Orders"
                    title="My Orders"
                  >
                    <Package size={20} />
                  </Link>
                )}

                {/* Wishlist Icon */}
                <Link
                  to={isAuthenticated ? '/orders?tab=wishlist' : '/login'}
                  className="cart-badge-btn nav-action-btn nav-action-wishlist"
                  aria-label="Wishlist"
                  title="My Wishlist"
                >
                  <Heart size={20} />
                  {wishlistCount > 0 && <span className="badge-count wishlist-badge">{wishlistCount}</span>}
                </Link>

                {/* Cart Icon (opens MiniCart Drawer) */}
                <button
                  type="button"
                  onClick={() => setIsMiniCartOpen(true)}
                  className="cart-badge-btn nav-action-btn nav-action-cart"
                  aria-label="Shopping Cart"
                  title="View Shopping Cart"
                >
                  <ShoppingCart size={20} />
                  {cartCount > 0 && <span className="badge-count cart-pulse-badge">{cartCount}</span>}
                </button>
              </>
            )}

            {/* User Account / Profile Controls */}
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
                  <span className="account-name">Hi, {user?.name?.split(' ')[0] || 'Customer'}</span>
                  {isAdmin && <span className="admin-tag">Admin</span>}
                  <ChevronDown size={14} className={`dropdown-chevron ${accountDropdownOpen ? 'rotate' : ''}`} />
                </button>

                {accountDropdownOpen && (
                  <div className="account-dropdown-menu card" role="menu">
                    <div className="account-dropdown-header">
                      <div className="account-user-name">{user?.name || 'Customer'}</div>
                      <div className="account-user-email">{user?.email}</div>
                      <span className="account-badge">{isAdmin ? 'Store Administrator' : 'Verified Customer'}</span>
                    </div>

                    <div className="account-dropdown-divider" />

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
                          <span className="account-item-sub">Track purchases & activity</span>
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
                          <span className="account-item-sub">Address & security</span>
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
                            <span className="account-item-sub">Analytics & catalog</span>
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
                <Link to="/login" className="btn btn-primary btn-sm guest-login-btn">
                  Login / Register
                </Link>
              </div>
            )}

            {/* Mobile menu hamburger toggle */}
            <button
              className="mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Secondary Navigation Menu for Customers */}
        {!isAdmin && (
          <div className="navbar-secondary-menu">
            <div className="navbar-secondary-container">
              <nav className="secondary-nav-links">
                <NavLink to="/" end className={({ isActive }) => (isActive ? 'sec-nav-link active sec-nav-home' : 'sec-nav-link sec-nav-home')}>
                  Home
                </NavLink>
                <NavLink to="/products" className={({ isActive }) => (isActive ? 'sec-nav-link active sec-nav-shop' : 'sec-nav-link sec-nav-shop')}>
                  Shop
                </NavLink>
                <NavLink to="/categories" className={({ isActive }) => (isActive ? 'sec-nav-link active sec-nav-categories' : 'sec-nav-link sec-nav-categories')}>
                  Categories
                </NavLink>
                <a href="#special-offers" className="sec-nav-link sec-nav-deals">
                  <span className="sec-nav-icon"><Zap size={14} className="icon-deals" /></span>
                  <span>Deals</span>
                  <span className="nav-micro-badge badge-deals">HOT</span>
                </a>
                <Link to="/products?sort=newest" className="sec-nav-link sec-nav-new">
                  <span className="sec-nav-icon"><Sparkles size={14} className="icon-new" /></span>
                  <span>New Arrivals</span>
                  <span className="nav-micro-badge badge-new">NEW</span>
                </Link>
                <Link to="/products?sort=-rating" className="sec-nav-link sec-nav-trending">
                  <span className="sec-nav-icon"><Flame size={14} className="icon-trending" /></span>
                  <span>Trending</span>
                  <span className="nav-micro-badge badge-trending">POPULAR</span>
                </Link>
                <Link to="/products?sort=-rating" className="sec-nav-link sec-nav-bestseller">
                  <span className="sec-nav-icon"><Award size={14} className="icon-bestseller" /></span>
                  <span>Best Sellers</span>
                  <span className="nav-micro-badge badge-bestseller">TOP</span>
                </Link>
              </nav>

              <button
                type="button"
                onClick={handleOpenAIChat}
                className="ai-concierge-quick-trigger"
                title="Launch EShop AI Shopping Concierge"
              >
                <Sparkles size={14} className="ai-concierge-sparkle" />
                <span>EShop AI Concierge</span>
              </button>
            </div>
          </div>
        )}

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-nav-drawer">
            {!isAdmin && (
              <form onSubmit={handleSearchSubmit} className="mobile-search-form">
                <input
                  type="text"
                  placeholder="Search products, brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" aria-label="Search">
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
                  <Link to="/products" onClick={() => setMobileMenuOpen(false)}>Shop Products</Link>
                  <Link to="/categories" onClick={() => setMobileMenuOpen(false)}>Categories</Link>
                  <Link to="/products?deal=flash" onClick={() => setMobileMenuOpen(false)} className="mobile-link-deals">
                    <span>⚡ Deals & Flash Sale</span>
                    <span className="nav-micro-badge badge-deals">HOT</span>
                  </Link>
                  <Link to="/products?sort=newest" onClick={() => setMobileMenuOpen(false)} className="mobile-link-new">
                    <span>✨ New Arrivals</span>
                    <span className="nav-micro-badge badge-new">NEW</span>
                  </Link>
                  <Link to="/products?sort=-rating" onClick={() => setMobileMenuOpen(false)} className="mobile-link-trending">
                    <span>🔥 Trending Products</span>
                    <span className="nav-micro-badge badge-trending">POPULAR</span>
                  </Link>
                  <Link to="/products?sort=-rating" onClick={() => setMobileMenuOpen(false)} className="mobile-link-bestseller">
                    <span>🏆 Best Sellers</span>
                    <span className="nav-micro-badge badge-bestseller">TOP</span>
                  </Link>
                  {isAuthenticated && (
                    <Link to="/orders" onClick={() => setMobileMenuOpen(false)}>My Orders</Link>
                  )}
                  <Link to="/cart" onClick={() => setMobileMenuOpen(false)}>Shopping Cart ({cartCount})</Link>
                </>
              )}

              {isAuthenticated ? (
                <>
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>Profile Settings</Link>
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

      {/* Mini Cart Slide-Out Drawer */}
      <MiniCartDrawer isOpen={isMiniCartOpen} onClose={() => setIsMiniCartOpen(false)} />
    </>
  );
};

export default Navbar;
