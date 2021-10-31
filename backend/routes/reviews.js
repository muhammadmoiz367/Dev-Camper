const express = require('express');
const router = express.Router({ mergeParams: true });

const Review = require('../models/Review');
const advancedResults = require('../middleware/advanceResult');

const {
  getReviews,
  createReview,
  getReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviews');
const { protectedRoute, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(
    advancedResults(Review, {
      path: 'bootcamp',
      select: 'name description',
    }),
    getReviews
  )
  .post(protectedRoute, authorize('user', 'admin'), createReview);

router
  .route('/:id')
  .get(getReview)
  .put(protectedRoute, authorize('user', 'admin'), updateReview)
  .delete(protectedRoute, authorize('user', 'admin'), deleteReview);

module.exports = router;
