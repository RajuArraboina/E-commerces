import React from 'react';
import { CheckCircle2, Clock, Truck, Package, XCircle, Check } from 'lucide-react';

const STEPS = [
  { key: 'Placed', label: 'Placed', icon: Clock },
  { key: 'Confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'Processing', label: 'Processing', icon: Package },
  { key: 'Shipped', label: 'Shipped', icon: Truck },
  { key: 'Out for Delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'Delivered', label: 'Delivered', icon: Check },
];

const OrderStatus = ({ status = 'Placed' }) => {
  if (status === 'Cancelled') {
    return (
      <div className="order-status-cancelled">
        <XCircle size={22} className="text-danger" />
        <span className="cancelled-text">Order Cancelled</span>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.key === status);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className="order-status-stepper">
      {STEPS.map((step, index) => {
        const isCompleted = index <= activeIndex;
        const isCurrent = index === activeIndex;
        const IconComponent = step.icon;

        return (
          <div
            key={step.key}
            className={`stepper-step ${isCompleted ? 'step-completed' : ''} ${isCurrent ? 'step-current' : ''}`}
          >
            <div className="step-circle">
              <IconComponent size={14} />
            </div>
            <span className="step-label">{step.label}</span>
            {index < STEPS.length - 1 && <div className="step-line" />}
          </div>
        );
      })}
    </div>
  );
};

export default OrderStatus;
