const express = require('express');
const router = express.Router();

// Import all sub-routes
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const adminRoutes = require('./adminRoutes');
const productRoutes = require('./productRoutes');
const categoryRoutes = require('./categoryRoutes');
const cartRoutes = require('./cartRoutes');
const orderRoutes = require('./orderRoutes');
const aiRoutes = require('./aiRoutes');

// Mount sub-routes onto the central API router
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/ai', aiRoutes);

// Health check / API status endpoint for /api
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'EShop Backend API Gateway is online and healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    availableRoutes: {
      auth: '/api/auth',
      users: '/api/users',
      admin: '/api/admin',
      products: '/api/products',
      categories: '/api/categories',
      cart: '/api/cart',
      orders: '/api/orders',
      ai: '/api/ai',
    },
  });
});

module.exports = router;
module.exports.authRoutes = authRoutes;
module.exports.userRoutes = userRoutes;
module.exports.adminRoutes = adminRoutes;
module.exports.productRoutes = productRoutes;
module.exports.categoryRoutes = categoryRoutes;
module.exports.cartRoutes = cartRoutes;
module.exports.orderRoutes = orderRoutes;
module.exports.aiRoutes = aiRoutes;
