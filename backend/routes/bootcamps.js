const express = require('express');
const router = express.Router();

const {
  getBootcamp,
  getBootcamps,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampByRadius,
} = require('../controllers/bootcamps');

//Include other resources
const courseRouter=require('./courses')

//Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter)

router.route('/')
    .get(getBootcamps)
    .post(createBootcamp);

router
  .route('/:id')
  .get(getBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);

router.route('/radius/:zipcode/:distance/:unit').get(getBootcampByRadius)

module.exports = router;
