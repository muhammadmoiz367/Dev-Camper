const cookie = require('cookie-parser');
const crypto = require('crypto');

const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');

//@desc         register a new user
//@route        POST /api/v1/auth/register
//@access       Public
exports.registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  const user = await User.create({
    name,
    email,
    password,
    role,
  });
  sendTokenResponse(user, 200, res);
});

//@desc         login user
//@route        POST /api/v1/auth/login
//@access       Public
exports.loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  //validate fields
  if (!email || !password) {
    return next(
      new ErrorResponse(400, `Please enter email and password to login`)
    );
  }
  //check user
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(
      new ErrorResponse(401, `Invalid credentials. Please try again`)
    );
  }
  //match passwords
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next(
      new ErrorResponse(401, `Invalid credentials. Please try again`)
    );
  }

  sendTokenResponse(user, 200, res);
});

//@desc         get looged in user
//@route        GET /api/v1/auth/me
//@access       Private
exports.getCurrentUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    data: user,
  });
});

//@desc         update user details
//@route        PUT /api/v1/auth/updateuser
//@access       Private
exports.updateUser = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };
  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

//@desc         update password
//@route        PUT /api/v1/auth/updatepassword
//@access       Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  //match password
  if (!(await user.comparePassword(req.body.currentPassword))) {
    return next(new ErrorResponse(401, `Incorrect password`));
  }
  user.password = req.body.newPassword;
  user.save();

  sendTokenResponse(user, 200, res);
});

//@desc         forgot password
//@route        POST /api/v1/auth/forgotPassword
//@access       Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ErrorResponse(404, `User with email ${req.body.email} not found`)
    );
  }
  //generate token
  const resetToken = user.getResetPasswordToken();
  console.log('resetToken ', resetToken);
  await user.save({ validateBeforeSave: false });

  //create reset Url
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetpassword/${resetToken}`;

  //create message for email
  const message = `You are getting this email because you (or someone else) has request for reset password. Please make a PUT request to: /n/n ${resetUrl}`;
  try {
    await sendEmail({
      to: req.body.email,
      subject: 'Reset Password',
      message,
    });
    res.status(200).json({
      success: true,
      data: 'Email sent',
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorResponse(500, `Email not sent`));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

//@desc         seset password token
//@route        POST /api/v1/auth/resetpassword
//@access       Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  //get and get hashed password
  const resetToken = req.params.resetToken;
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  //find user
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ErrorResponse(401, `Invalid token`));
  }
  //create new password
  user.password = req.body.password;

  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

const sendTokenResponse = (model, statausCode, res) => {
  //create token
  const token = model.getSignedInToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }
  //send response
  res.status(statausCode).cookie('token', token).json({ success: true, token });
};
