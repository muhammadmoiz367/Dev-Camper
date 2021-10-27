const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');

const User = require('../models/User');

//protect route
exports.protectedRoute = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // else if(req.cookies.token){
  //     token=req.cookies.token
  // }
  console.log('token ', token);
  if (!token) {
    return next(
      new ErrorResponse(401, `You are not allowed to access this route`)
    );
  }

  try {
    const decodedUser = jwt.decode(token, process.env.JWT_SECURITY_KEY);
    console.log('decoded user ', decodedUser);
    const user = await User.findById(decodedUser.id);
    console.log('login ', user);
    req.user = user;
    next();
  } catch (error) {
    return next(
      new ErrorResponse(401, `You are not allowed to access this route`)
    );
  }
});

//check user authorization
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          403,
          `User role is not authorized to access this route`
        )
      );
    }
    next();
  };
};
