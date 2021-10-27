const express = require('express');
const router = express.Router({ mergeParams: true });

const Course = require('../models/Course');
const advancedResults = require('../middleware/advanceResult');

const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courses');
const { protectedRoute, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(
    advancedResults(Course, {
      path: 'bootcamp',
      select: 'name description',
    }),
    getCourses
  )
  .post(protectedRoute, authorize('publisher', 'admin'), createCourse);

router
  .route('/:id')
  .get(getCourse)
  .put(protectedRoute, authorize('publisher', 'admin'), updateCourse)
  .delete(protectedRoute, authorize('publisher', 'admin'), deleteCourse);

module.exports = router;
