import api from './api';
import aiService from './aiService';

export const recommendationService = {
  // Get AI recommendations personalized to customer or fallback to trending
  getRecommendations: async (productId = null, categoryId = null) => {
    try {
      const res = await aiService.getRecommendations(productId, categoryId);
      if (res?.success && res?.data) {
        return res;
      }
      // Fallback to top-rated products if AI recommendations are empty
      const fallbackRes = await api.get('/products', { params: { limit: 8, sort: '-rating' } });
      return {
        success: true,
        data: {
          recommendedForYou: fallbackRes.data?.data || [],
          trending: fallbackRes.data?.data || [],
        },
      };
    } catch (error) {
      console.error('Error in recommendationService:', error);
      const fallbackRes = await api.get('/products', { params: { limit: 8, sort: '-rating' } });
      return {
        success: true,
        data: {
          recommendedForYou: fallbackRes.data?.data || [],
          trending: fallbackRes.data?.data || [],
        },
      };
    }
  },
};

export default recommendationService;
