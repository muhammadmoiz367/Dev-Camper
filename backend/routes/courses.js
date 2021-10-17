const express = require('express');
const router = express.Router({ mergeParams: true });

const {
    getCourses, getCourse, createCourse, updateCourse, deleteCourse
} = require('../controllers/courses');

router.route('/')
    .get(getCourses)
    .post(createCourse)

router.route('/:id')
.get(getCourse)
.put(updateCourse)
.delete(deleteCourse)

module.exports = router;
