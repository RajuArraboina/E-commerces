import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import {
  LayoutDashboard,
  Package,
  Layers,
  Archive,
  Users,
  ClipboardList,
  LogOut,
  Shield,
  Menu,
  X,
  User as UserIcon,
  LineChart,
  Bot,
  Settings
} from 'lucide-react';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="admin-app-layout">
      {/* Top Header */}
      <header className="admin-top-header">
        <div className="admin-header-container">
          <div className="admin-header-left">
            <button
              className="admin-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <div className="admin-brand">
              <Shield className="admin-brand-icon" size={24} />
              <div className="admin-brand-text">
                <span className="brand-name">EShop</span>
                <span className="brand-badge">Admin</span>
              </div>
            </div>
          </div>

          <div className="admin-header-right">
            <ThemeToggle />

            <div className="admin-user-profile">
              <div className="admin-avatar">
                <UserIcon size={16} />
              </div>
              <div className="admin-user-info">
                <span className="admin-user-name">{user?.name || 'Administrator'}</span>
                <span className="admin-user-role">Super Admin</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="btn btn-outline admin-header-logout"
              title="Logout from Admin Panel"
            >
              <LogOut size={16} />
              <span className="hide-on-mobile">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Workspace (Sidebar + Dynamic Subview) */}
      <div className="admin-workspace">
        {/* Overlay for mobile drawer */}
        {mobileMenuOpen && (
          <div className="admin-mobile-overlay" onClick={closeMobileMenu} />
        )}

        {/* Sidebar Navigation */}
        <aside className={`admin-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <div className="admin-sidebar-content">
            <div className="sidebar-section-title">Navigation</div>
            <nav className="admin-nav-menu">
              <NavLink
                to="/admin"
                end
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  isActive ? 'admin-nav-item active' : 'admin-nav-item'
                }
              >
                <LayoutDashboard size={19} />
                <span>Dashboard</span>
              </NavLink>

              <NavLink
                to="/admin/products"
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  isActive ? 'admin-nav-item active' : 'admin-nav-item'
                }
              >
                <Package size={19} />
                <span>Products</span>
              </NavLink>

              <NavLink
                to="/admin/categories"
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  isActive ? 'admin-nav-item active' : 'admin-nav-item'
                }
              >
                <Layers size={19} />
                <span>Categories</span>
              </NavLink>

              <NavLink
                to="/admin/inventory"
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  isActive ? 'admin-nav-item active' : 'admin-nav-item'
                }
              >
                <Archive size={19} />
                <span>Inventory</span>
              </NavLink>

              <NavLink
                to="/admin/users"
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  isActive ? 'admin-nav-item active' : 'admin-nav-item'
                }
              >
                <Users size={19} />
                <span>Users</span>
              </NavLink>

              <NavLink
                to="/admin/customers"
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  isActive ? 'admin-nav-item active' : 'admin-nav-item'
                }
              >
                <Users size={19} />
                <span>Customers</span>
              </NavLink>

              <NavLink
                to="/admin/orders"
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  isActive ? 'admin-nav-item active' : 'admin-nav-item'
                }
              >
                <ClipboardList size={19} />
                <span>Orders</span>
              </NavLink>

              <div className="sidebar-section-title" style={{ marginTop: '16px' }}>AI Intelligence</div>

              <NavLink
                to="/admin/insights"
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  isActive ? 'admin-nav-item active' : 'admin-nav-item'
                }
              >
                <LineChart size={19} />
                <span>AI Sales Insights</span>
              </NavLink>

              <NavLink
                to="/admin/ai-assistant"
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  isActive ? 'admin-nav-item active' : 'admin-nav-item'
                }
              >
                <Bot size={19} />
                <span>AI Assistant</span>
              </NavLink>

              <div className="sidebar-section-title" style={{ marginTop: '16px' }}>System</div>

              <NavLink
                to="/admin/settings"
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  isActive ? 'admin-nav-item active' : 'admin-nav-item'
                }
              >
                <Settings size={19} />
                <span>Settings</span>
              </NavLink>
            </nav>

            <div className="admin-sidebar-footer">
              <button
                onClick={handleLogout}
                className="admin-nav-item admin-logout-btn"
              >
                <LogOut size={19} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Dynamic Content Panel */}
        <main className="admin-main-panel">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
