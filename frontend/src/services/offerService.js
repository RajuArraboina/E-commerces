import api from './api';

export const offerService = {
  // Get active dynamic coupons and promotional offers
  getOffers: async () => {
    try {
      // Fetch products with discounts to generate live contextual offers
      const res = await api.get('/products', { params: { limit: 12, sort: '-discount' } });
      const products = res.data?.data || [];
      
      const dynamicOffers = [
        {
          id: 'offer-1',
          code: 'SAVE500',
          title: 'Flat ₹500 OFF',
          description: 'On orders above ₹3,000 across all electronics & appliances',
          discount: 500,
          minOrder: 3000,
          type: 'flat',
          badge: 'MEGA SAVINGS',
          expiry: 'Midnight Tonight',
          category: 'Electronics',
        },
        {
          id: 'offer-2',
          code: 'FESTIVE25',
          title: 'Flat 25% OFF',
          description: 'Applicable on fashion, footwear and premium wearables',
          discount: 25,
          minOrder: 1500,
          type: 'percentage',
          badge: 'FESTIVE SPECIAL',
          expiry: '2 Days Left',
          category: 'Fashion',
        },
        {
          id: 'offer-3',
          code: 'AIACCESS20',
          title: 'Extra 20% OFF',
          description: 'Valid on smart audio, chargers and tech accessories',
          discount: 20,
          minOrder: 999,
          type: 'percentage',
          badge: 'AI SPECIAL',
          expiry: 'Ends in 08:30:00',
          category: 'Accessories',
        },
        {
          id: 'offer-4',
          code: 'WELCOME100',
          title: 'Flat ₹100 Welcome Credit',
          description: 'Instant discount on your first order. No minimum purchase',
          discount: 100,
          minOrder: 500,
          type: 'flat',
          badge: 'NEW USER',
          expiry: 'Valid 30 Days',
          category: 'All',
        },
      ];

      return {
        success: true,
        data: dynamicOffers,
        featuredProducts: products.slice(0, 4),
      };
    } catch (error) {
      console.error('Error fetching offers:', error);
      return {
        success: false,
        data: [],
      };
    }
  },
};

export default offerService;
