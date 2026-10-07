import api from './api';

export const cartService = {
  // Get current user's shopping cart
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },

  // Add product or variant to cart
  addToCart: async (productId, variantId = null, quantity = 1) => {
    const payload = { productId, quantity };
    if (variantId) payload.variantId = variantId;
    const response = await api.post('/cart', payload);
    return response.data;
  },

  // Update cart item quantity
  updateCartItemQuantity: async (productId, quantity, variantId = null) => {
    const payload = { quantity };
    if (variantId) payload.variantId = variantId;
    const response = await api.put(`/cart/${productId}`, payload);
    return response.data;
  },

  // Remove specific item or variant from cart
  removeFromCart: async (productId, variantId = null) => {
    const params = variantId ? { variantId } : {};
    const response = await api.delete(`/cart/${productId}`, { params });
    return response.data;
  },

  // Clear all items from cart
  clearCart: async () => {
    const response = await api.delete('/cart/clear');
    return response.data;
  },
};

export default cartService;
