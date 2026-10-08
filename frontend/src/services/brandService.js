import api from './api';

export const brandService = {
  // Extract unique brands dynamically with product counts from active catalog
  getBrands: async () => {
    try {
      const res = await api.get('/products', { params: { limit: 50 } });
      const products = res.data?.data || [];

      const brandMap = {};
      products.forEach((p) => {
        if (p.brand && typeof p.brand === 'string') {
          const b = p.brand.trim();
          if (b) {
            brandMap[b] = (brandMap[b] || 0) + 1;
          }
        }
      });

      const brands = Object.keys(brandMap).map((brandName) => ({
        name: brandName,
        count: brandMap[brandName],
        link: `/products?brand=${encodeURIComponent(brandName)}`,
      }));

      // Sort by count descending
      brands.sort((a, b) => b.count - a.count);

      return {
        success: true,
        data: brands,
      };
    } catch (error) {
      console.error('Error fetching brands in brandService:', error);
      return { success: false, data: [] };
    }
  },
};

export default brandService;
