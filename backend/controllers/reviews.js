const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

const Bootcamp = require('../models/Bootcamp');
const Review = require('../models/Review');
const advancedResults = require('../middleware/advanceResult');

//@desc         get all reviews
//@route        GET /api/v1/bootcamps/:bootcampId/reviews
//@route        GET /api/v1/reviews
//@access       Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const reviews = await Review.find({ bootcamp: req.params.bootcampId });
    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

//@desc         get specific review
//@route        GET /api/v1/reviews/:id
//@access       Public
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description',
  });

  if (!review) {
    return next(
      new ErrorResponse(404, `review not found with id ${req.params.id}`)
    );
  }
  res.status(200).json({
    success: true,
    data: review,
  });
});

//@desc         create new review
//@route        POST /api/v1/bootcamps/:bootcampId/reviews
//@access       Private
exports.createReview = asyncHandler(async (req, res, next) => {
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
  // if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
  //   return next(
  //     new ErrorResponse(
  //       401,
  //       `The user with id ${req.user.id} is not authorized to add review to this bootcamp ${bootcamp._id}`
  //     )
  //   );
  // }
  const review = await Review.create(req.body);
  res.status(200).json({
    success: true,
    data: review,
  });
});

//@desc         update specific review
//@route        PUT /api/v1/reviews/:id
//@access       Private
exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);
  if (!review) {
    return next(
      new ErrorResponse(404, `Review not found with id ${req.params.id}`)
    );
  }
  // //check if the review updation is done by same user or admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        401,
        `The user with id ${req.user.id} is not authorized to update review ${review._id} to this bootcamp`
      )
    );
  }

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: review });
});

//@desc         delete specific review
//@route        DELETE /api/v1/reviews/:id
//@access       Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    return next(
      new ErrorResponse(404, `review not found with id ${req.params.id}`)
    );
  }
  // //check if the review deletion is done by same user or admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        401,
        `The user with id ${req.user.id} is not authorized to update review ${review._id} to this bootcamp`
      )
    );
  }

  await review.remove();
  res.status(200).json({ success: true, data: {} });
});
