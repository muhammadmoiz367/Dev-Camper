const express = require('express');
const router = express.Router();

const {
  getBootcamp,
  getBootcamps,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampByRadius,
  bootcampUploadPhoto,
} = require('../controllers/bootcamps');

const advancedResults = require('../middleware/advanceResult');
const { protectedRoute, authorize } = require('../middleware/auth');
const Bootcamp = require('../models/Bootcamp');

//Include other resources
const courseRouter = require('./courses');
const reviewRouter = require('./reviews');

//Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewRouter);

router
  .route('/')
  .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
  .post(protectedRoute, authorize('publisher', 'admin'), createBootcamp);

router
  .route('/:id')
  .get(getBootcamp)
  .put(protectedRoute, authorize('publisher', 'admin'), updateBootcamp)
  .delete(protectedRoute, authorize('publisher', 'admin'), deleteBootcamp);

router.route('/radius/:zipcode/:distance/:unit').get(getBootcampByRadius);

router
  .route('/:id/photo')
  .post(protectedRoute, authorize('publisher', 'admin'), bootcampUploadPhoto);

module.exports = router;
