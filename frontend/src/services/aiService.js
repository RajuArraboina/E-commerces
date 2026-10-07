import api from './api';

export const aiService = {
  // Natural Language AI Search
  aiSearch: async (query) => {
    const response = await api.post('/ai/search', { query });
    return response.data;
  },

  // Customer Shopping Assistant Chat
  aiChat: async (message, history = []) => {
    const response = await api.post('/ai/chat', { message, history });
    return response.data;
  },

  // Product Recommendations
  getRecommendations: async (productId = null, categoryId = null) => {
    const params = {};
    if (productId) params.productId = productId;
    if (categoryId) params.categoryId = categoryId;
    const response = await api.get('/ai/recommendations', { params });
    return response.data;
  },

  // AI Review Summary
  getReviewSummary: async (productId) => {
    const response = await api.get(`/ai/review-summary/${productId}`);
    return response.data;
  },

  // Side-by-side Product Comparison
  compareProducts: async (productIds) => {
    const response = await api.post('/ai/compare', { productIds });
    return response.data;
  },

  // Admin AI Description Generator
  generateDescription: async (productData) => {
    const response = await api.post('/ai/generate-description', productData);
    return response.data;
  },

  // Admin AI Assistant Chat
  adminChat: async (message) => {
    const response = await api.post('/ai/admin-chat', { message });
    return response.data;
  },

  // Admin AI Sales Insights
  getSalesInsights: async () => {
    const response = await api.get('/ai/admin/sales-insights');
    return response.data;
  },
};

export default aiService;
