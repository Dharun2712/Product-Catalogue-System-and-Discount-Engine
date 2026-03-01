const express = require('express');
const router = express.Router();
const {
  getProductReviews,
  createReview,
  deleteReview,
  getReviewAnalytics,
  getAllReviews,
} = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/auth');

// Admin routes (must be before :productId route)
router.get('/analytics/summary', protect, admin, getReviewAnalytics);
router.get('/admin/all', protect, admin, getAllReviews);

// Public: get reviews for a product
router.get('/:productId', getProductReviews);

// Authenticated user: create/update review
router.post('/:productId', protect, createReview);

// Admin: delete a review
router.delete('/:id', protect, admin, deleteReview);

module.exports = router;
