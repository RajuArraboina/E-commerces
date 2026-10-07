import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AIShoppingAssistant from '../components/ai/AIShoppingAssistant';
import MobileBottomNav from '../components/MobileBottomNav';

const CustomerLayout = () => {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
      {/* Floating AI Shopping Assistant Concierge */}
      <AIShoppingAssistant />
      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav />
    </div>
  );
};

export default CustomerLayout;

