import api from './api';

export const adminService = {
  // Get admin dashboard metrics (users, products, categories, orders, revenue)
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  // Get all registered users/customers with search and pagination
  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  // Update user role or details via PUT /api/users/:id
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // Delete user via DELETE /api/users/:id
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Get all orders across the system
  getOrders: async (params = {}) => {
    const response = await api.get('/admin/orders', { params });
    return response.data;
  },

  // Update order status (Placed, Confirmed, Processing, Shipped, Out for Delivery, Delivered, Cancelled)
  updateOrderStatus: async (id, status) => {
    const response = await api.put(`/admin/orders/${id}/status`, { status });
    return response.data;
  },

  // Update product stock directly
  updateProductStock: async (productId, stock) => {
    const response = await api.put(`/admin/products/${productId}/stock`, { stock });
    return response.data;
  },
};

export default adminService;
