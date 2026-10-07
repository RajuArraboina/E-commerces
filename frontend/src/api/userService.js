import api from '../services/api';

/**
 * User Management API Service
 * Fully mapped to the actual backend Express API endpoints
 */
export const userService = {
  /**
   * Get all users with search, filtering (role, status, dates), and server-side pagination
   * Endpoint: GET /api/users
   */
  getUsers: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  /**
   * Get user management statistical summary
   * Endpoint: GET /api/users/stats
   */
  getUserStats: async () => {
    const response = await api.get('/users/stats');
    return response.data;
  },

  /**
   * Get single user by ID including order statistics, recent orders, and activity
   * Endpoint: GET /api/users/:id
   */
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  /**
   * Get all orders for a specific user
   * Endpoint: GET /api/users/:id/orders
   */
  getUserOrders: async (id) => {
    const response = await api.get(`/users/${id}/orders`);
    return response.data;
  },

  /**
   * Create a new user (customer or admin)
   * Endpoint: POST /api/users
   */
  createUser: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  /**
   * Update existing user details (name, email, phone, address, role, status)
   * Endpoint: PUT /api/users/:id
   */
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  /**
   * Update user account status (Activate / Block / Inactive)
   * Endpoint: PUT /api/users/:id/status
   */
  updateUserStatus: async (id, status) => {
    const response = await api.put(`/users/${id}/status`, { status });
    return response.data;
  },

  /**
   * Delete user by ID
   * Endpoint: DELETE /api/users/:id
   */
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  /**
   * Customer Self-Profile Endpoints
   */
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  changePassword: async (newPassword) => {
    const response = await api.put('/users/profile', { password: newPassword });
    return response.data;
  },
};

export default userService;
