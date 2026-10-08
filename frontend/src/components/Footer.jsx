import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Zap,
  RotateCcw,
  Lock,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const YoutubeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
  </svg>
);

const LinkedinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const Footer = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setNewsletterEmail('');
      }, 3000);
    }
  };

  return (
    <footer className="footer-root" aria-label="Store Footer">
      {/* 1. Value Proposition Perks Strip */}
      <div className="footer-perks-strip">
        <div className="container footer-perks-inner">
          <div className="footer-perk-item">
            <div className="perk-icon-wrap icon-shield">
              <ShieldCheck size={22} />
            </div>
            <div className="perk-text">
              <h5>100% Genuine Products</h5>
              <p>Direct from verified manufacturers</p>
            </div>
          </div>

          <div className="footer-perk-item">
            <div className="perk-icon-wrap icon-zap">
              <Zap size={22} />
            </div>
            <div className="perk-text">
              <h5>Express Delivery</h5>
              <p>Fast track delivery across India</p>
            </div>
          </div>

          <div className="footer-perk-item">
            <div className="perk-icon-wrap icon-rotate">
              <RotateCcw size={22} />
            </div>
            <div className="perk-text">
              <h5>7 Days Easy Returns</h5>
              <p>Hassle-free doorstep pickup</p>
            </div>
          </div>

          <div className="footer-perk-item">
            <div className="perk-icon-wrap icon-lock">
              <Lock size={22} />
            </div>
            <div className="perk-text">
              <h5>Secure Transactions</h5>
              <p>256-bit SSL encrypted checkout</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer 5-Column Grid */}
      <div className="footer-main">
        <div className="container footer-grid">
          {/* Section 1: EShop Brand Info */}
          <div className="footer-col brand-col">
            <Link to="/" className="footer-logo">
              <div className="footer-logo-icon">
                <ShoppingBag size={22} />
              </div>
              <span className="footer-logo-text">EShop</span>
            </Link>
            <p className="footer-desc">
              Your premier destination for verified electronics, flagship smartphones, trending fashion, and smart home essentials with AI-powered recommendations.
            </p>

            <div className="footer-contact-info">
              <div className="contact-line">
                <Mail size={16} className="contact-icon icon-mail" />
                <span>support@eshop.com</span>
              </div>
              <div className="contact-line">
                <Phone size={16} className="contact-icon icon-phone" />
                <span>+91 (080) 4123-SHOP</span>
              </div>
              <div className="contact-line">
                <MapPin size={16} className="contact-icon icon-map" />
                <span>Tech Park, Outer Ring Road, Bengaluru, India</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="footer-social-row">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn social-instagram" aria-label="Instagram">
                <InstagramIcon />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn social-facebook" aria-label="Facebook">
                <FacebookIcon />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn social-youtube" aria-label="YouTube">
                <YoutubeIcon />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn social-linkedin" aria-label="LinkedIn">
                <LinkedinIcon />
              </a>
            </div>
          </div>

          {/* Section 2: Quick Links */}
          <div className="footer-col">
            <h4 className="footer-col-title">EShop</h4>
            <ul className="footer-nav-list">
              <li><Link to="/about">About EShop</Link></li>
              <li><Link to="/contact">Contact Support</Link></li>
              <li><Link to="/careers">Careers & Hiring</Link></li>
              <li><Link to="/products">All Products</Link></li>
              <li><Link to="/categories">Curated Collections</Link></li>
              <li><Link to="/compare">Compare Products</Link></li>
            </ul>
          </div>

          {/* Section 3: Customer Service */}
          <div className="footer-col">
            <h4 className="footer-col-title">Customer Care</h4>
            <ul className="footer-nav-list">
              <li><Link to="/orders?tab=tracking">Track Live Delivery</Link></li>
              <li><Link to="/orders">My Orders & Receipts</Link></li>
              <li><Link to="/orders?tab=wishlist">Saved Wishlist</Link></li>
              <li><Link to="/returns">Returns & Exchange</Link></li>
              <li><Link to="/refunds">Instant Refunds</Link></li>
              <li><Link to="/shipping">Shipping Policies</Link></li>
            </ul>
          </div>

          {/* Section 4: Shop Categories */}
          <div className="footer-col">
            <h4 className="footer-col-title">Top Categories</h4>
            <ul className="footer-nav-list">
              <li><Link to="/products?category=Smartphones">5G Smartphones</Link></li>
              <li><Link to="/products?category=Laptops">Coding & Pro Laptops</Link></li>
              <li><Link to="/products?category=Audio%20%26%20Wearables">Smartwatches & Audio</Link></li>
              <li><Link to="/products?category=Fashion">Premium Footwear</Link></li>
              <li><Link to="/products?category=Electronics">Home Electronics</Link></li>
              <li><Link to="/products">Flash Deals & Offers</Link></li>
            </ul>
          </div>

          {/* Section 5: Legal & Policies */}
          <div className="footer-col">
            <h4 className="footer-col-title">Policies</h4>
            <ul className="footer-nav-list">
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms & Conditions</Link></li>
              <li><Link to="/refund-policy">Refund Policy</Link></li>
              <li><Link to="/shipping-policy">Shipping Policy</Link></li>
              <li><Link to="/security">Security & Compliance</Link></li>
            </ul>

            {/* Micro Newsletter Subscribe Box */}
            <div className="footer-newsletter-box">
              <span className="newsletter-title">
                <Sparkles size={14} className="text-warning" />
                <span>Insider VIP Club</span>
              </span>
              {subscribed ? (
                <div className="newsletter-success">
                  <CheckCircle2 size={16} />
                  <span>Subscribed! Check your inbox.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="newsletter-form">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter email for 15% off"
                    required
                  />
                  <button type="submit" aria-label="Subscribe">
                    <ArrowRight size={15} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Footer Bottom Bar with Copyright & Payment Badges */}
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p className="footer-copy">© 2026 EShop Smart Commerce. All rights reserved.</p>

          <div className="footer-payment-tags">
            <span className="pay-badge">UPI</span>
            <span className="pay-badge">Visa</span>
            <span className="pay-badge">Mastercard</span>
            <span className="pay-badge">RuPay</span>
            <span className="pay-badge">NetBanking</span>
          </div>

          <p className="footer-tagline">Shop smarter. Live better.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
