import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import wishlistService from '../services/wishlistService';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load wishlist from MongoDB for authenticated users or localStorage for guests
  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      const saved = localStorage.getItem('shopsphere_guest_wishlist');
      try {
        setWishlist(saved ? JSON.parse(saved) : []);
      } catch {
        setWishlist([]);
      }
      return;
    }

    try {
      setLoading(true);
      const res = await wishlistService.getWishlist();
      if (res.success && Array.isArray(res.data)) {
        setWishlist(res.data);
      }
    } catch {
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isInWishlist = (productId) => {
    if (!productId) return false;
    return wishlist.some((item) => {
      const id = typeof item === 'object' ? item._id : item;
      return id?.toString() === productId.toString();
    });
  };

  const toggleWishlist = async (product) => {
    const productId = typeof product === 'object' ? product._id : product;
    if (!productId) return;

    if (!isAuthenticated) {
      // Local fallback for guest
      setWishlist((prev) => {
        const exists = prev.some((p) => (p._id || p).toString() === productId.toString());
        let updated;
        if (exists) {
          updated = prev.filter((p) => (p._id || p).toString() !== productId.toString());
        } else {
          updated = [...prev, product];
        }
        localStorage.setItem('shopsphere_guest_wishlist', JSON.stringify(updated));
        return updated;
      });
      return;
    }

    try {
      const res = await wishlistService.toggleWishlist(productId);
      if (res.success) {
        await fetchWishlist();
      }
    } catch (err) {
      console.error('Failed to toggle wishlist item:', err);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        isInWishlist,
        toggleWishlist,
        fetchWishlist,
        loading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export default WishlistContext;
