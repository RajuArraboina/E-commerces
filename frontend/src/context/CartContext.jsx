import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import cartService from '../services/cartService';
import { useAuth } from './AuthContext';

export const AVAILABLE_COUPONS = [
  {
    code: 'SAVE25',
    title: '25% Exclusive Season Offer',
    discountPercent: 25,
    minOrder: 0,
    description: 'Save 25% on flagship electronics, audio & creator gear',
  },
  {
    code: 'AIFEST45',
    title: '45% Mega AI Fest',
    discountPercent: 45,
    minOrder: 0,
    description: 'Up to 45% discount on laptops & developer setups',
  },
  {
    code: 'SOUND40',
    title: 'Flat 40% Off Audio Bonanza',
    discountPercent: 40,
    minOrder: 0,
    description: 'Flat 40% off on studio headphones & Bluetooth speakers',
  },
  {
    code: 'PHONEAI',
    title: '₹4,000 Off Flagship Festival',
    discountFlat: 4000,
    minOrder: 15000,
    description: 'Flat ₹4,000 discount on flagship smartphones (min. ₹15,000)',
  },
  {
    code: 'AIACCESS20',
    title: '20% Off Smart Wearables',
    discountPercent: 20,
    minOrder: 0,
    description: '20% discount on all smart wearables & accessories',
  },
  {
    code: 'SHOP5000',
    title: 'Flat ₹250 Off on ₹5,000+ Shopping',
    discountFlat: 250,
    minOrder: 5000,
    description: 'Flat ₹250 instant discount on any purchase of ₹5,000 or more',
  },
];

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], subtotal: 0, totalItems: 0 });
  const [loading, setLoading] = useState(false);

  // Persistent Applied Coupon
  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem('shopsphere_applied_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Fetch real cart from MongoDB
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart({ items: [], subtotal: 0, totalItems: 0 });
      return;
    }

    try {
      setLoading(true);
      const response = await cartService.getCart();
      if (response && response.success && response.data) {
        setCart(response.data);
      }
    } catch {
      setCart({ items: [], subtotal: 0, totalItems: 0 });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Track if user explicitly clicked remove on the auto-applied offer
  const [dismissedAutoOffer, setDismissedAutoOffer] = useState(false);

  // Compute discount amount based on subtotal and active coupon
  const subtotal = cart?.subtotal || 0;

  // Auto-apply ₹250 discount whenever cart shopping value reaches ₹5,000 or more
  useEffect(() => {
    if (subtotal >= 5000) {
      if (!appliedCoupon && !dismissedAutoOffer) {
        const autoOffer = AVAILABLE_COUPONS.find((c) => c.code === 'SHOP5000');
        if (autoOffer) {
          const autoApplied = { ...autoOffer, isAutoApplied: true };
          setAppliedCoupon(autoApplied);
          localStorage.setItem('shopsphere_applied_coupon', JSON.stringify(autoApplied));
        }
      }
    } else if (appliedCoupon?.isAutoApplied && subtotal < 5000) {
      // Revert auto-applied offer if cart subtotal drops below ₹5,000 threshold
      setAppliedCoupon(null);
      localStorage.removeItem('shopsphere_applied_coupon');
      setDismissedAutoOffer(false);
    }
  }, [subtotal, appliedCoupon, dismissedAutoOffer]);

  const discountAmount = useMemo(() => {
    if (!appliedCoupon || subtotal <= 0) return 0;

    // Check minimum order requirement
    if (appliedCoupon.minOrder && subtotal < appliedCoupon.minOrder) {
      return 0;
    }

    if (appliedCoupon.discountPercent) {
      return Math.round((subtotal * appliedCoupon.discountPercent) / 100);
    }

    if (appliedCoupon.discountFlat) {
      return Math.min(appliedCoupon.discountFlat, subtotal);
    }

    return 0;
  }, [appliedCoupon, subtotal]);

  // Apply a coupon code
  const applyCoupon = (couponCode) => {
    if (!couponCode) {
      return { success: false, message: 'Please enter a coupon code.' };
    }

    let cleanCode = couponCode.trim().toUpperCase();
    if (cleanCode === 'OFFER250' || cleanCode === 'GET250' || cleanCode === '250OFF') {
      cleanCode = 'SHOP5000';
    }

    const found = AVAILABLE_COUPONS.find((c) => c.code.toUpperCase() === cleanCode);

    if (!found) {
      return { success: false, message: `Coupon code "${cleanCode}" is invalid.` };
    }

    if (found.minOrder && subtotal > 0 && subtotal < found.minOrder) {
      return {
        success: false,
        message: `Coupon "${cleanCode}" requires a minimum cart value of ₹${found.minOrder.toLocaleString('en-IN')}.`,
      };
    }

    setDismissedAutoOffer(false);
    setAppliedCoupon(found);
    localStorage.setItem('shopsphere_applied_coupon', JSON.stringify(found));

    return {
      success: true,
      message: `Coupon "${found.code}" applied! ${found.discountPercent ? `${found.discountPercent}% discount active.` : `₹${found.discountFlat} discount active.`}`,
    };
  };

  // Remove active coupon
  const removeCoupon = () => {
    if (appliedCoupon?.code === 'SHOP5000' || appliedCoupon?.isAutoApplied) {
      setDismissedAutoOffer(true);
    }
    setAppliedCoupon(null);
    localStorage.removeItem('shopsphere_applied_coupon');
  };

  // Add item / variant to cart
  const addToCart = async (productId, variantId = null, quantity = 1) => {
    const response = await cartService.addToCart(productId, variantId, quantity);
    await fetchCart();
    return response;
  };

  // Update item quantity
  const updateQuantity = async (productId, quantity, variantId = null) => {
    const response = await cartService.updateCartItemQuantity(productId, quantity, variantId);
    await fetchCart();
    return response;
  };

  // Remove specific item from cart
  const removeItem = async (productId, variantId = null) => {
    const response = await cartService.removeFromCart(productId, variantId);
    await fetchCart();
    return response;
  };

  // Clear entire cart
  const clearCart = async () => {
    const response = await cartService.clearCart();
    setCart({ items: [], subtotal: 0, totalItems: 0 });
    return response;
  };

  const value = {
    cart,
    cartCount: cart?.totalItems || 0,
    subtotal,
    discountAmount,
    grandSubtotal: Math.max(0, subtotal - discountAmount),
    appliedCoupon,
    availableCoupons: AVAILABLE_COUPONS,
    applyCoupon,
    removeCoupon,
    loading,
    fetchCart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
