const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');
const advancedResults = require('../middleware/advanceResult');

//@desc         get all bootcamps
//@route        GET /api/v1/bootcamps/:bootcampId/courses
//@route        GET /api/v1/courses
//@access       Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const courses = await Course.find({ bootcamp: req.params.bootcampId });
    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

//@desc         get specific course
//@route        GET /api/v1/courses/:id
//@access       Public
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    return next(
      new ErrorResponse(404, `course not found with id ${req.params.id}`)
    );
  }
  res.status(200).json({
    success: true,
    data: course,
  });
});

//@desc         create new course
//@route        POST /api/v1/bootcamps/:bootcampId/courses
//@access       Private
exports.createCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  //add user to body from auth middleware
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);
  if (!bootcamp) {
    return next(
      new ErrorResponse(
        404,
        `bootcamp not found with id ${req.params.bootcampId}`
      )
    );
  }
  //check if the user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        401,
        `The user with id ${req.user.id} is not authorized to add course to this bootcamp ${bootcamp._id}`
      )
    );
  }
  const course = await Course.create(req.body);
  res.status(200).json({
    success: true,
    data: course,
  });
});

//@desc         update specific course
//@route        PUT /api/v1/courses/:id
//@access       Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);
  if (!course) {
    return next(
      new ErrorResponse(404, `Course not found with id ${req.params.id}`)
    );
  }
  //check if the user is bootcamp owner
  if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        401,
        `The user with id ${req.user.id} is not authorized to update course ${course._id} to this bootcamp`
      )
    );
  }
  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: course });
});

//@desc         delete specific course
//@route        DELETE /api/v1/courses/:id
//@access       Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    return next(
      new ErrorResponse(404, `Course not found with id ${req.params.id}`)
    );
  }
  //check if the user is bootcamp owner
  if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        401,
        `The user with id ${req.user.id} is not authorized to delete course ${course._id} to this bootcamp`
      )
    );
  }
  await course.remove();
  res.status(200).json({ success: true, data: {} });
});
