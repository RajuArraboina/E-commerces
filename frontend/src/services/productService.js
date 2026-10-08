import api from './api';

export const productService = {
  // Get all products with dynamic search, filters, pagination, sort
  getProducts: async (params = {}) => {
    const cleanParams = {};
    Object.keys(params).forEach((key) => {
      if (params[key] !== '' && params[key] !== null && params[key] !== undefined) {
        cleanParams[key] = params[key];
      }
    });
    const response = await api.get('/products', { params: cleanParams });
    return response.data;
  },

  // Get single product by ID
  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Admin: Create product
  createProduct: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  // Admin: Update product
  updateProduct: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  // Admin: Delete product
  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // Dynamic homepage helper queries
  getTrending: async (limit = 8) => {
    return productService.getProducts({ limit, sort: '-rating' });
  },

  getNewArrivals: async (limit = 8) => {
    return productService.getProducts({ limit, sort: 'newest' });
  },

  getFlashSale: async (limit = 6) => {
    return productService.getProducts({ limit, sort: '-rating' });
  },

  getBestSellers: async (limit = 8) => {
    return productService.getProducts({ limit, sort: '-rating' });
  },

  searchSuggestions: async (query, limit = 5) => {
    if (!query || !query.trim()) return { success: true, data: [] };
    return productService.getProducts({ search: query.trim(), limit });
  },
};

export default productService;
