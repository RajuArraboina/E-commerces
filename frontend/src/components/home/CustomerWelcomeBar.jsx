import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import {
  Sparkles,
  ShoppingBag,
  Heart,
  Package,
  Tag,
  ArrowRight,
  Clock,
} from 'lucide-react';

const CustomerWelcomeBar = ({ recentCount = 0 }) => {
  const { user, isAuthenticated } = useAuth();
  const { cartCount, appliedCoupon } = useCart();
  const { wishlistCount } = useWishlist();

  if (!isAuthenticated) return null;

  const firstName = user?.name ? user.name.split(' ')[0] : 'Shopper';

  return (
    <section className="customer-welcome-section container" aria-label="Customer Profile Greeting">
      <div className="customer-welcome-card card">
        <div className="welcome-greeting-left">
          <div className="greeting-badge">
            <Sparkles size={14} className="text-accent" />
            <span>Customer Portal</span>
          </div>
          <h2 className="welcome-heading">Welcome back, {firstName} 👋</h2>
          <p className="welcome-subtext">
            Here is your dynamic shopping hub, active discounts, and personalized recommendations.
          </p>
        </div>

        <div className="welcome-quick-chips">
          <Link to="/orders" className="welcome-chip">
            <Package size={16} className="text-primary" />
            <div className="chip-text">
              <span className="chip-label">Orders</span>
              <strong className="chip-val">Track & View</strong>
            </div>
          </Link>

          <Link to="/orders?tab=wishlist" className="welcome-chip">
            <Heart size={16} className="text-danger" />
            <div className="chip-text">
              <span className="chip-label">Wishlist</span>
              <strong className="chip-val">{wishlistCount} Saved</strong>
            </div>
          </Link>

          <Link to="/cart" className="welcome-chip">
            <ShoppingBag size={16} className="text-success" />
            <div className="chip-text">
              <span className="chip-label">Cart</span>
              <strong className="chip-val">{cartCount} Items</strong>
            </div>
          </Link>

          <a href="#special-offers" className="welcome-chip highlight-chip">
            <Tag size={16} className="text-warning" />
            <div className="chip-text">
              <span className="chip-label">Active Offer</span>
              <strong className="chip-val">{appliedCoupon?.code || 'SHOP5000'}</strong>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
};

export default CustomerWelcomeBar;
