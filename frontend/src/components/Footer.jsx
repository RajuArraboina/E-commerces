import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  ShieldCheck,
  Truck,
  RefreshCw,
  Headphones,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer-root">
      {/* 8. Trust & Features Section */}
      <div className="footer-features">
        <div className="container features-grid">
          <div className="feature-item">
            <Truck size={28} className="feature-icon text-primary" />
            <div>
              <h4>🚚 Fast Delivery</h4>
              <p>Express dispatch to all pin codes across India</p>
            </div>
          </div>
          <div className="feature-item">
            <ShieldCheck size={28} className="feature-icon text-success" />
            <div>
              <h4>🔒 Secure Payments</h4>
              <p>100% encrypted UPI, Cards, NetBanking & COD</p>
            </div>
          </div>
          <div className="feature-item">
            <RefreshCw size={28} className="feature-icon text-accent" />
            <div>
              <h4>↩️ Easy Returns</h4>
              <p>Hassle-free 7-day replacement guarantee</p>
            </div>
          </div>
          <div className="feature-item">
            <Headphones size={28} className="feature-icon text-warning" />
            <div>
              <h4>💬 24/7 Customer Support</h4>
              <p>Round-the-clock dedicated assistance & AI concierge</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="footer-main">
        <div className="container footer-grid">
          {/* Brand & About */}
          <div className="footer-col brand-col">
            <Link to="/" className="footer-logo">
              <ShoppingBag size={24} className="text-primary" />
              <span>ShopSphere</span>
            </Link>
            <p className="footer-desc">
              ShopSphere is your premier destination for verified electronics, flagship smartphones, trendy fashion, and smart home essentials with AI-powered recommendations.
            </p>
            <div className="footer-contact-info">
              <div className="contact-line">
                <Mail size={15} className="text-muted" />
                <span>support@shopsphere.com</span>
              </div>
              <div className="contact-line">
                <Phone size={15} className="text-muted" />
                <span>+91 (080) 4123-SHOP</span>
              </div>
              <div className="contact-line">
                <MapPin size={15} className="text-muted" />
                <span>Tech Park, Outer Ring Road, Bengaluru, India</span>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="footer-col">
            <h5>Popular Categories</h5>
            <ul>
              <li><Link to="/products?category=Electronics">Electronics & Audio</Link></li>
              <li><Link to="/products?category=Smartphones">5G Mobiles</Link></li>
              <li><Link to="/products?category=Laptops">Developer Laptops</Link></li>
              <li><Link to="/products?category=Fashion">Fashion & Apparel</Link></li>
              <li><Link to="/products?category=Accessories">Wearables & Watches</Link></li>
              <li><Link to="/products?category=Home">Home & Kitchen</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="footer-col">
            <h5>Customer Service</h5>
            <ul>
              <li><Link to="/orders">Track Your Order</Link></li>
              <li><Link to="/cart">Shopping Cart</Link></li>
              <li><Link to="/orders?tab=wishlist">My Wishlist</Link></li>
              <li><Link to="/profile">Profile Settings</Link></li>
              <li><Link to="/contact">Help Center & Support</Link></li>
              <li><Link to="/faq">Returns & Exchanges</Link></li>
            </ul>
          </div>

          {/* Policies & API */}
          <div className="footer-col">
            <h5>Policies & System</h5>
            <ul>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms & Conditions</Link></li>
              <li><Link to="/security">Security & Encryption</Link></li>
              <li><Link to="/shipping">Shipping Policy</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>© {new Date().getFullYear()} ShopSphere Inc. All rights reserved.</p>
          <div className="footer-payment-tags">
            <span className="pay-badge">UPI</span>
            <span className="pay-badge">Visa</span>
            <span className="pay-badge">Mastercard</span>
            <span className="pay-badge">RuPay</span>
            <span className="pay-badge">Net Banking</span>
            <span className="pay-badge">COD</span>
          </div>
          <p className="footer-meta">Full-Stack Production E-Commerce Platform</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
