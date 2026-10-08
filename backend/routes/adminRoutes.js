const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  updateProductStock,
} = require('../controllers/adminController');
const {
  getAllUsers,
  getUserStats,
  getUserById,
  getUserOrders,
  createUser,
  updateUser,
  updateUserStatus,
  deleteUser,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

// Apply protect & adminOnly to all routes in this router
router.use(protect, adminOnly);

// Admin dashboard analytics
router.get('/dashboard', getDashboardStats);

// Admin user management
router.get('/users/stats', getUserStats);
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.get('/users/:id/orders', getUserOrders);
router.route('/users/:id/status')
  .put(updateUserStatus)
  .patch(updateUserStatus);
router.route('/users/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

// Admin order management
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

// Admin inventory / stock management
router.put('/products/:id/stock', updateProductStock);

module.exports = router;
