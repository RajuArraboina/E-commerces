import React, { useState, useEffect, useCallback, useMemo } from 'react';
import productService from '../services/productService';
import categoryService from '../services/categoryService';
import recommendationService from '../services/recommendationService';
import brandService from '../services/brandService';

// Marketplace Home Components
import CategoryNavigation from '../components/home/CategoryNavigation';
import HeroCarousel from '../components/home/HeroCarousel';
import ServiceStrip from '../components/home/ServiceStrip';
import DealsOfDay from '../components/home/DealsOfDay';
import CategorySection from '../components/home/CategorySection';
import BestSellers from '../components/home/BestSellers';
import TrendingProducts from '../components/home/TrendingProducts';
import ElectronicsSection from '../components/home/ElectronicsSection';
import FashionSection from '../components/home/FashionSection';
import HomeKitchenSection from '../components/home/HomeKitchenSection';
import BeautySection from '../components/home/BeautySection';
import FlashSale from '../components/home/FlashSale';
import PersonalizedRecommendations from '../components/home/PersonalizedRecommendations';
import OfferSection from '../components/home/OfferSection';
import AISmartShopping from '../components/home/AISmartShopping';
import PromotionBanners from '../components/home/PromotionBanners';
import BrandSection from '../components/home/BrandSection';
import RecentlyViewed from '../components/home/RecentlyViewed';
import Toast from '../components/home/Toast';
import QuickViewModal from '../components/QuickViewModal';
import { RefreshCw } from 'lucide-react';

const Home = () => {
  // State from live MongoDB backend
  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [dynamicBrands, setDynamicBrands] = useState([]);

  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Quick View Modal State
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const showToast = useCallback((msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage('');
    }, 3200);
  }, []);

  // Fetch all dynamic data concurrently from backend
  const fetchHomeData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Concurrent fetch to backend APIs using centralized services
      const [categoriesRes, trendingRes, newArrivalsRes, recsRes, brandsRes] = await Promise.allSettled([
        categoryService.getCategories(),
        productService.getTrending(20),
        productService.getNewArrivals(12),
        recommendationService.getRecommendations(),
        brandService.getBrands(),
      ]);

      // 1. Categories
      if (categoriesRes.status === 'fulfilled' && categoriesRes.value?.success) {
        setCategories(categoriesRes.value.data || []);
      }

      // 2. Trending & Catalog Products
      if (trendingRes.status === 'fulfilled' && trendingRes.value?.success) {
        const prods = trendingRes.value.data || [];
        setAllProducts(prods);
        setTrendingProducts(prods.slice(0, 10));
        // Flash sale: slice items with high discount or rating
        setFlashSaleProducts(prods.slice(0, 5));
        // Best sellers: items ranked by numReviews or rating
        const sortedByReviews = [...prods].sort((a, b) => (b.numReviews || 0) - (a.numReviews || 0));
        setBestSellers(sortedByReviews.slice(0, 8));
        setPopularProducts(prods.slice(0, 8));
      }

      // 3. New Arrivals
      if (newArrivalsRes.status === 'fulfilled' && newArrivalsRes.value?.success) {
        setNewArrivals(newArrivalsRes.value.data || []);
      }

      // 4. AI Recommendations
      if (recsRes.status === 'fulfilled' && recsRes.value?.success) {
        const recData = recsRes.value.data;
        if (recData?.recommendedForYou && recData.recommendedForYou.length > 0) {
          setRecommendedProducts(recData.recommendedForYou);
        } else if (recData?.trending && recData.trending.length > 0) {
          setRecommendedProducts(recData.trending);
        }
      }

      // 5. Dynamic Brands
      if (brandsRes.status === 'fulfilled' && brandsRes.value?.success) {
        setDynamicBrands(brandsRes.value.data || []);
      }

      // 6. Load recently viewed from localStorage
      try {
        const savedRecent = localStorage.getItem('shopsphere_recently_viewed');
        if (savedRecent) {
          setRecentlyViewed(JSON.parse(savedRecent));
        }
      } catch {
        setRecentlyViewed([]);
      }
    } catch (err) {
      console.error('Failed to load store catalog:', err);
      setError('Unable to load products. Please ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHomeData();
  }, [fetchHomeData]);

  // Compute dynamic product count per category based on live catalog
  const productCountsByCategory = useMemo(() => {
    const counts = {};
    const allProds = [...allProducts, ...newArrivals];
    allProds.forEach((p) => {
      const catId = p.category?._id || p.category;
      const catName = p.category?.name || p.category;
      if (catId) counts[catId] = (counts[catId] || 0) + 1;
      if (catName) counts[catName] = (counts[catName] || 0) + 1;
    });
    return counts;
  }, [allProducts, newArrivals]);

  // Filter products by domain categories
  const electronicsProducts = useMemo(() => {
    const pool = [...allProducts, ...newArrivals];
    const filtered = pool.filter((p) => {
      const c = (typeof p.category === 'object' ? p.category?.name : p.category) || '';
      const n = p.name || '';
      return (
        /laptop|phone|mobile|audio|headphone|earbud|watch|tech|gadget|camera/i.test(c) ||
        /laptop|phone|iphone|galaxy|sony|thinkpad|macbook|headphone|airpods|pixel|audio/i.test(n)
      );
    });
    return filtered.length > 0 ? filtered : pool.slice(0, 6);
  }, [allProducts, newArrivals]);

  const fashionProducts = useMemo(() => {
    const pool = [...allProducts, ...newArrivals];
    const filtered = pool.filter((p) => {
      const c = (typeof p.category === 'object' ? p.category?.name : p.category) || '';
      const n = p.name || '';
      return (
        /fashion|cloth|shirt|pant|shoe|sneaker|dress|jacket|hoodie|jean/i.test(c) ||
        /shirt|shoe|sneaker|jacket|denim|hoodie|wear|t-shirt|pant/i.test(n)
      );
    });
    return filtered.length > 0 ? filtered : pool.slice(2, 8);
  }, [allProducts, newArrivals]);

  const homeKitchenProducts = useMemo(() => {
    const pool = [...allProducts, ...newArrivals];
    const filtered = pool.filter((p) => {
      const c = (typeof p.category === 'object' ? p.category?.name : p.category) || '';
      const n = p.name || '';
      return (
        /home|kitchen|furniture|decor|appliance|cookware|living/i.test(c) ||
        /pan|pot|blender|oven|lamp|chair|sofa|table|smart home|kettle/i.test(n)
      );
    });
    return filtered.length > 0 ? filtered : pool.slice(4, 10);
  }, [allProducts, newArrivals]);

  const beautyProducts = useMemo(() => {
    const pool = [...allProducts, ...newArrivals];
    const filtered = pool.filter((p) => {
      const c = (typeof p.category === 'object' ? p.category?.name : p.category) || '';
      const n = p.name || '';
      return (
        /beauty|skin|hair|perfume|fragrance|makeup|groom/i.test(c) ||
        /serum|cream|lotion|cologne|perfume|shampoo|trimmer|lipstick/i.test(n)
      );
    });
    return filtered.length > 0 ? filtered : pool.slice(1, 7);
  }, [allProducts, newArrivals]);

  // Deals of the day products (highest discount or top rated)
  const dealsOfDayProducts = useMemo(() => {
    const pool = [...allProducts, ...newArrivals];
    return pool.slice(0, 8);
  }, [allProducts, newArrivals]);

  // Quick View handlers & Recently Viewed tracking
  const handleOpenQuickView = (product) => {
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);

    try {
      const saved = localStorage.getItem('shopsphere_recently_viewed');
      const list = saved ? JSON.parse(saved) : [];
      const updated = [product, ...list.filter((p) => p._id !== product._id)].slice(0, 8);
      localStorage.setItem('shopsphere_recently_viewed', JSON.stringify(updated));
      setRecentlyViewed(updated);
    } catch (e) {
      console.error('Error saving recently viewed:', e);
    }
  };

  const handleCloseQuickView = () => {
    setIsQuickViewOpen(false);
    setQuickViewProduct(null);
  };

  // Remove single item from recently viewed
  const handleRemoveRecentItem = (productId) => {
    const updated = recentlyViewed.filter((p) => p._id !== productId);
    setRecentlyViewed(updated);
    localStorage.setItem('shopsphere_recently_viewed', JSON.stringify(updated));
    showToast('Product removed from history');
  };

  // Clear all recently viewed
  const handleClearRecent = () => {
    setRecentlyViewed([]);
    localStorage.removeItem('shopsphere_recently_viewed');
    showToast('Browsing history cleared');
  };

  // Trigger floating AI shopping concierge
  const handleOpenAIAssistant = () => {
    const btn = document.querySelector('.ai-floating-btn');
    if (btn) btn.click();
  };

  return (
    <div className="home-page-root marketplace-layout" id="main-content">
      {/* Toast Notification */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage('')}
        />
      )}

      {/* Global Error Banner if API completely unreachable */}
      {error && !loading && (
        <div className="container" style={{ margin: '20px auto' }}>
          <div className="store-global-error-card card">
            <p className="error-text">{error}</p>
            <button
              type="button"
              onClick={fetchHomeData}
              className="btn btn-primary btn-sm"
            >
              <RefreshCw size={14} />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          1 & 2. CATEGORY NAVIGATION STRIP
          Marketplace horizontal category strip immediately below header with icons,
          labels, hover animations & "View All"
         ========================================================================= */}
      <CategoryNavigation categories={categories} loading={loading} />

      {/* =========================================================================
          3. HERO BANNER CAROUSEL
          Large marketplace promotional carousel with dynamic backend banners,
          countdown clock, coupon codes & CTAs
         ========================================================================= */}
      <HeroCarousel />

      {/* =========================================================================
          4. QUICK SERVICE STRIP
          4 compact cards: Fast Delivery, Secure Payments, Easy Returns, 24/7 Support
         ========================================================================= */}
      <ServiceStrip />

      {/* =========================================================================
          5. DEALS OF THE DAY
          ⚡ Deals of the Day with live countdown, dynamic products & "View All Deals"
         ========================================================================= */}
      <DealsOfDay
        products={dealsOfDayProducts}
        loading={loading}
        onQuickView={handleOpenQuickView}
      />

      {/* =========================================================================
          6. TOP CATEGORIES (SHOP BY CATEGORY)
          Curated Collections with real categories from database, icons & counts
         ========================================================================= */}
      <CategorySection
        categories={categories}
        productCounts={productCountsByCategory}
        loading={loading}
        error={error}
        onRetry={fetchHomeData}
      />

      {/* =========================================================================
          7. BEST SELLERS
          🏆 Best Sellers with horizontally scrollable product cards & badges
         ========================================================================= */}
      <BestSellers
        products={bestSellers}
        loading={loading}
        error={error}
        onQuickView={handleOpenQuickView}
        onRetry={fetchHomeData}
      />

      {/* =========================================================================
          8. TRENDING PRODUCTS
          🔥 Trending Now based on views, purchases, and ratings
         ========================================================================= */}
      <TrendingProducts
        products={trendingProducts}
        categories={categories}
        loading={loading}
        error={error}
        onQuickView={handleOpenQuickView}
        onRetry={fetchHomeData}
      />

      {/* =========================================================================
          9. DEDICATED ELECTRONICS SECTION
          "Best of Electronics": Left promo banner card + right product carousel
         ========================================================================= */}
      <ElectronicsSection
        products={electronicsProducts}
        loading={loading}
        onQuickView={handleOpenQuickView}
      />

      {/* =========================================================================
          10. DEDICATED FASHION SECTION
          "Fashion Picks": Men, Women, Kids, Shoes, Accessories filter tabs & carousel
         ========================================================================= */}
      <FashionSection
        products={fashionProducts}
        loading={loading}
        onQuickView={handleOpenQuickView}
      />

      {/* =========================================================================
          11. HOME & KITCHEN SECTION
          "Upgrade Your Home": Smart appliances, cookware, decor & modular storage
         ========================================================================= */}
      <HomeKitchenSection
        products={homeKitchenProducts}
        loading={loading}
        onQuickView={handleOpenQuickView}
      />

      {/* =========================================================================
          12. BEAUTY & PERSONAL CARE SECTION
          "Beauty Essentials": Skincare, haircare, grooming & fragrance
         ========================================================================= */}
      <BeautySection
        products={beautyProducts}
        loading={loading}
        onQuickView={handleOpenQuickView}
      />

      {/* =========================================================================
          13. FLASH SALE
          🔥 Limited-time flash sale with countdown clock & progress bar ("Only 7 left")
         ========================================================================= */}
      <FlashSale
        products={flashSaleProducts}
        loading={loading}
        error={error}
        onQuickView={handleOpenQuickView}
        onRetry={fetchHomeData}
      />

      {/* =========================================================================
          14. PERSONALIZED RECOMMENDATIONS (RECOMMENDED FOR YOU)
          AI recommendations personalized to customer browsing history
         ========================================================================= */}
      <PersonalizedRecommendations
        recommendedProducts={recommendedProducts}
        popularProducts={popularProducts}
        recentProducts={recentlyViewed}
        loading={loading}
        error={error}
        onQuickView={handleOpenQuickView}
        onRetry={fetchHomeData}
      />

      {/* =========================================================================
          16. EXCLUSIVE OFFERS & COUPONS
          Dynamic verified promo codes with instant Copy Code & Auto-Apply
         ========================================================================= */}
      <OfferSection />

      {/* =========================================================================
          17. AI SMART SHOPPING SHOWCASE
          Natural language search, comparison, deal finder & concierge showcase
         ========================================================================= */}
      <AISmartShopping onOpenAssistant={handleOpenAIAssistant} />

      {/* =========================================================================
          PROMOTIONAL BANNERS
          3-column promotional banner strip
         ========================================================================= */}
      <PromotionBanners />

      {/* =========================================================================
          18. POPULAR BRANDS
          Dynamic brands queried from database with live count & links
         ========================================================================= */}
      <BrandSection brands={dynamicBrands} />

      {/* =========================================================================
          15. RECENTLY VIEWED
          Customer browsing history with quick view, remove item & clear all
         ========================================================================= */}
      <RecentlyViewed
        products={recentlyViewed}
        onRemoveItem={handleRemoveRecentItem}
        onClearAll={handleClearRecent}
        onQuickView={handleOpenQuickView}
      />

      {/* =========================================================================
          QUICK VIEW MODAL
         ========================================================================= */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={isQuickViewOpen}
        onClose={handleCloseQuickView}
      />
    </div>
  );
};

export default Home;
