const express = require('express');
const router = express.Router();
const {
  aiSearch,
  aiChat,
  aiRecommendations,
  aiReviewSummary,
  aiCompare,
  aiGenerateDescription,
  aiAdminChat,
  aiAdminSalesInsights,
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

// Public AI Routes (Customer & Storefront)
router.route('/search').get(aiSearch).post(aiSearch);
router.post('/chat', aiChat);
router.get('/recommendations', aiRecommendations);
router.get('/review-summary/:productId', aiReviewSummary);
router.route('/compare').get(aiCompare).post(aiCompare);

// Protected Admin AI Routes
router.post('/generate-description', protect, adminOnly, aiGenerateDescription);
router.post('/admin-chat', protect, adminOnly, aiAdminChat);
router.get('/admin/sales-insights', protect, adminOnly, aiAdminSalesInsights);

module.exports = router;
