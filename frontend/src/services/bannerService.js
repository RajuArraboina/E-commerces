import api from './api';

export const bannerService = {
  // Get promotional banners tied dynamically to database products & categories
  getBanners: async () => {
    try {
      const [categoriesRes, productsRes] = await Promise.allSettled([
        api.get('/categories'),
        api.get('/products', { params: { limit: 8, sort: '-rating' } }),
      ]);

      const categories = categoriesRes.status === 'fulfilled' ? categoriesRes.value.data?.data || [] : [];
      const products = productsRes.status === 'fulfilled' ? productsRes.value.data?.data || [] : [];

      // Construct live marketplace banners with backend products and categories
      const banners = [
        {
          id: 'banner-electronics',
          badge: 'FLAGSHIP FESTIVAL',
          title: 'Electronics Mega Sale',
          subtitle: 'Pro Laptops, Flagship Mobiles & ANC Audio',
          discount: 'Up to 60% OFF',
          ctaText: 'Shop Electronics',
          link: '/products?category=Electronics',
          code: 'ELECTRO60',
          expiryTime: '12h 45m',
          bgGradient: 'linear-gradient(135deg, #090d16 0%, #151632 50%, #201a4e 100%)',
          image: products[0]?.image || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=900',
          product: products[0] || null,
        },
        {
          id: 'banner-fashion',
          badge: 'TRENDING FASHION',
          title: 'Premium Wardrobe Upgrade',
          subtitle: 'Trending Styles, Premium Footwear & Designer Fits',
          discount: 'Flat 50% OFF',
          ctaText: 'Explore Fashion',
          link: '/products?category=Fashion',
          code: 'STYLE50',
          expiryTime: '24h 00m',
          bgGradient: 'linear-gradient(135deg, #130a21 0%, #251341 50%, #3d1b66 100%)',
          image: products[1]?.image || 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=900',
          product: products[1] || null,
        },
        {
          id: 'banner-smart-home',
          badge: 'NEW ARRIVALS',
          title: 'Smart Home & Living Essentials',
          subtitle: 'Smart Kitchen, Luxury Decor & Ambient Lighting',
          discount: 'Up to 45% OFF',
          ctaText: 'Upgrade Home',
          link: '/products?category=Home',
          code: 'HOME45',
          expiryTime: '18h 30m',
          bgGradient: 'linear-gradient(135deg, #070f1e 0%, #0c1c38 50%, #162a56 100%)',
          image: products[2]?.image || 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=900',
          product: products[2] || null,
        },
        {
          id: 'banner-audio',
          badge: 'SPATIAL AUDIO BONANZA',
          title: 'Studio Hi-Res Audio & ANC',
          subtitle: 'Immerse Yourself in Pure Hi-Fi Acoustics & Spatial Sound',
          discount: 'Flat 40% OFF',
          ctaText: 'Listen Now',
          link: '/products?category=Audio',
          code: 'SOUND40',
          expiryTime: '08h 15m',
          bgGradient: 'linear-gradient(135deg, #031e1e 0%, #06393b 50%, #0e5b56 100%)',
          image: products[3]?.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900',
          product: products[3] || null,
        },
      ];

      return {
        success: true,
        data: banners,
        categories,
      };
    } catch (error) {
      console.error('Error in bannerService:', error);
      return { success: false, data: [] };
    }
  },
};

export default bannerService;
