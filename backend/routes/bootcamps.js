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
const Bootcamp = require('../models/Bootcamp');

//Include other resources
const courseRouter = require('./courses');

//Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter);

router
  .route('/')
  .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
  .post(createBootcamp);

router
  .route('/:id')
  .get(getBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);

router.route('/radius/:zipcode/:distance/:unit').get(getBootcampByRadius);

router.route('/:id/photo').post(bootcampUploadPhoto);

module.exports = router;
