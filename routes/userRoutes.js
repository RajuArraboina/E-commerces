const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  getUserStats,
  getUserById,
  getUserOrders,
  createUser,
  updateUser,
  updateUserStatus,
  deleteUser,
  getWishlist,
  toggleWishlist,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

// Customer profile routes
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Wishlist routes
router.route('/wishlist')
  .get(protect, getWishlist);
router.route('/wishlist/:productId')
  .post(protect, toggleWishlist)
  .delete(protect, toggleWishlist);

// Admin user statistical summary
router.get('/stats', protect, adminOnly, getUserStats);

// Admin user management routes
router.route('/')
  .get(protect, adminOnly, getAllUsers)
  .post(protect, adminOnly, createUser);

// User status toggle
router.route('/:id/status')
  .put(protect, adminOnly, updateUserStatus)
  .patch(protect, adminOnly, updateUserStatus);

// User order history
router.get('/:id/orders', protect, adminOnly, getUserOrders);

router.route('/:id')
  .get(protect, adminOnly, getUserById)
  .put(protect, adminOnly, updateUser)
  .delete(protect, adminOnly, deleteUser);

module.exports = router;
