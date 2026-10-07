const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

// All cart operations require authentication
router.use(protect);

router.route('/')
  .get(getCart)
  .post(addToCart);

// Order is important: /clear must precede /:productId
router.delete('/clear', clearCart);

router.route('/:productId')
  .put(updateCartItemQuantity)
  .delete(removeFromCart);

module.exports = router;
