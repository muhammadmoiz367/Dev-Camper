const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const advancedResults = require('../middleware/advanceResult');

//@desc         get all users
//@route        GET /api/v1/users
//@access       Private
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

//@desc         create new user
//@route        POST /api/v1/users
//@access       Private
exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);
  res.status(201).json({
    success: true,
    data: user,
  });
});

//@desc         get specific user
//@route        GET /api/v1/users/:id
//@access       Private
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(
      new ErrorResponse(404, `User not found with id ${req.params.id}`)
    );
  }
  res.status(200).json({
    success: true,
    data: user,
  });
});

//@desc         update specific user
//@route        PUT /api/v1/users/:id
//@access       Private
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data: user });
});

//@desc         delete specific user
//@route        DELETE /api/v1/users/:id
//@access       Private
exports.deleteUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, data: {} });
});
