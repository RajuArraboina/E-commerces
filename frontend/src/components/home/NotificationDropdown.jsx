import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Sparkles, Tag, Truck, Check, X } from 'lucide-react';

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    title: '⚡ Mega AI Fest is Live!',
    body: 'Flat 45% OFF on developer laptops & workstations. Use code AIFEST45.',
    time: '10m ago',
    unread: true,
    link: '/products?category=Laptops',
    icon: Sparkles,
    color: '#6366f1',
  },
  {
    id: 2,
    title: '🎁 Instant Coupon Activated',
    body: 'Get ₹250 instant discount on purchase of ₹5,000 or more with code SHOP5000.',
    time: '1h ago',
    unread: true,
    link: '/products',
    icon: Tag,
    color: '#8b5cf6',
  },
  {
    id: 3,
    title: '🚚 Express Delivery Available',
    body: 'Same-day and next-day express delivery enabled for all verified electronics.',
    time: '3h ago',
    unread: false,
    link: '/products',
    icon: Truck,
    color: '#10b981',
  },
];

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const markSingleRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  };

  return (
    <div className="notification-dropdown-wrapper" ref={dropdownRef}>
      <button
        type="button"
        className="notification-trigger-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View notifications"
        title="Notifications"
      >
        <Bell size={21} />
        {unreadCount > 0 && <span className="notification-badge-count">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notification-dropdown-menu card" role="menu">
          <div className="notification-header">
            <div className="notification-title-wrap">
              <Bell size={16} className="text-primary" />
              <span className="notif-title">Notifications</span>
              {unreadCount > 0 && <span className="notif-unread-tag">{unreadCount} new</span>}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                className="mark-all-read-btn"
                onClick={markAllRead}
              >
                Mark all read
              </button>
            )}
          </div>

          <ul className="notification-list">
            {notifications.map((item) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.id}
                  className={`notification-item ${item.unread ? 'unread' : ''}`}
                  onClick={() => markSingleRead(item.id)}
                >
                  <Link to={item.link} className="notification-link" onClick={() => setIsOpen(false)}>
                    <div className="notif-icon-box" style={{ color: item.color }}>
                      <Icon size={16} />
                    </div>
                    <div className="notif-content">
                      <strong className="notif-item-title">{item.title}</strong>
                      <p className="notif-item-body">{item.body}</p>
                      <span className="notif-item-time">{item.time}</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
