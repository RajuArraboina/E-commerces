import React from 'react';
import { Truck, ShieldCheck, RotateCcw, Headphones, Sparkles } from 'lucide-react';

const DEFAULT_FEATURES = [
  {
    id: 'delivery',
    icon: Truck,
    title: 'Fast Delivery',
    subtitle: 'Express delivery across India',
    accentColor: '#6366f1',
    bgColor: 'rgba(99, 102, 241, 0.12)',
  },
  {
    id: 'payments',
    icon: ShieldCheck,
    title: 'Secure Payments',
    subtitle: '100% secure UPI, Cards & NetBanking',
    accentColor: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.12)',
  },
  {
    id: 'returns',
    icon: RotateCcw,
    title: 'Easy Returns',
    subtitle: '7-day hassle-free replacement',
    accentColor: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.12)',
  },
  {
    id: 'support',
    icon: Headphones,
    title: '24/7 Customer Support',
    subtitle: 'Smart customer assistance & AI concierge',
    accentColor: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.12)',
  },
];

const ServiceFeatures = ({ features = DEFAULT_FEATURES }) => {
  return (
    <section className="section-service-features container" aria-label="Store Benefits & Trust">
      <div className="service-features-grid">
        {features.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="service-feature-card card">
              <div
                className="service-feature-icon-box"
                style={{
                  backgroundColor: item.bgColor,
                  color: item.accentColor,
                }}
              >
                <Icon size={24} />
              </div>
              <div className="service-feature-text">
                <h3 className="service-feature-title">{item.title}</h3>
                <p className="service-feature-subtitle">{item.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ServiceFeatures;
