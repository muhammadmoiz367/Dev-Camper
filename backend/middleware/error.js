const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  //log to console
  console.log(err.stack.red);

  let error = { ...err };
  error.message = err.message;
  // console.log(err)

  //mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id ${err.value}`;
    error = new ErrorResponse(404, message);
  }

  //mongoose bad ObjectId
  if (err.code === 11000) {
    const message = `Duplicate name field identified`;
    error = new ErrorResponse(400, message);
  }

  //mongoose bad ObjectId
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(400, message);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
  });
};

module.exports = errorHandler;
