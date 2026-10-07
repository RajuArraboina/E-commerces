import api from './api';

export const categoryService = {
  // Get all active categories (or all=true)
  getCategories: async (all = false) => {
    const response = await api.get('/categories', { params: { all } });
    return response.data;
  },

  // Get category by ID with product count
  getCategoryById: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  // Admin: Create category
  createCategory: async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  // Admin: Update category
  updateCategory: async (id, categoryData) => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  // Admin: Delete category
  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

export default categoryService;
