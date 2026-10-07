const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  simulatePayment,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// All order operations for customers require authentication
router.use(protect);

router.route('/')
  .post(createOrder)
  .get(getMyOrders);

router.route('/:id')
  .get(getOrderById);

router.put('/:id/cancel', cancelOrder);
router.put('/:id/pay', simulatePayment);

module.exports = router;
