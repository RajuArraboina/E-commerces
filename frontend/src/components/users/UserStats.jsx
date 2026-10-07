import React from 'react';
import { Users, UserCheck, UserX, Shield, ShoppingBag, Sparkles } from 'lucide-react';

const UserStats = ({ stats, loading }) => {
  const {
    totalUsers = 0,
    activeUsers = 0,
    blockedUsers = 0,
    customers = 0,
    admins = 0,
    newUsers = 0,
  } = stats || {};

  const statCards = [
    {
      label: 'Total Users',
      value: totalUsers,
      subtext: 'Registered store accounts',
      icon: Users,
      colorClass: 'stat-indigo',
      iconBg: 'bg-primary-soft',
      iconColor: 'text-primary',
    },
    {
      label: 'Active Users',
      value: activeUsers,
      subtext: 'Verified & active accounts',
      icon: UserCheck,
      colorClass: 'stat-emerald',
      iconBg: 'bg-success-soft',
      iconColor: 'text-success',
    },
    {
      label: 'Blocked Users',
      value: blockedUsers,
      subtext: 'Access restricted by admin',
      icon: UserX,
      colorClass: 'stat-rose',
      iconBg: 'bg-danger-soft',
      iconColor: 'text-danger',
    },
    {
      label: 'Customers',
      value: customers,
      subtext: 'Regular shopper profiles',
      icon: ShoppingBag,
      colorClass: 'stat-cyan',
      iconBg: 'bg-info-soft',
      iconColor: 'text-info',
    },
    {
      label: 'Admins',
      value: admins,
      subtext: 'Administrative privilege',
      icon: Shield,
      colorClass: 'stat-amber',
      iconBg: 'bg-warning-soft',
      iconColor: 'text-warning',
    },
    {
      label: 'New Users',
      value: newUsers,
      subtext: 'Joined in past 30 days',
      icon: Sparkles,
      colorClass: 'stat-purple',
      iconBg: 'bg-accent-soft',
      iconColor: 'text-accent',
    },
  ];

  return (
    <div className="user-stats-grid">
      {statCards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div key={idx} className={`user-stat-card card ${card.colorClass}`}>
            <div className={`user-stat-icon-wrap ${card.iconBg}`}>
              <IconComponent size={22} className={card.iconColor} />
            </div>
            <div className="user-stat-body">
              <span className="user-stat-label">{card.label}</span>
              <span className="user-stat-value">
                {loading ? <span className="stat-loading-placeholder">&bull;&bull;&bull;</span> : card.value.toLocaleString()}
              </span>
              <small className="user-stat-subtext">{card.subtext}</small>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UserStats;
