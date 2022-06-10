const AppError = require('../utils/appError');

const handleCastError = (error) => {
  const message = `Invalid ${error.path}: ${error.value}`;
  return new AppError(message, 400);
};

const handleDuplicateError = (error) => {
  const message = `Duplicate field value "${error.keyValue.name}". chose another value`;
  return new AppError(message, 400);
};

const handleValidatorError = (error) => {
  const errors = Object.values(error.errors).map((el) => el.message);
  const message = `${error._message}: ${errors.join(', ')}`;
  return new AppError(message, 400);
};

const handleTokenError = () =>
  new AppError('Invalid token, Please insert a valid one', 400);

const handleExpireError = () =>
  new AppError('Token expired, Please insert a valid one', 400);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational / trusted Error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    //programming or other unknown error: dont leak error information
  } else {
    //Log error
    console.log('ERROR ', err);

    // send generic error message
    res.status(500).json({
      status: 'Error',
      message: 'Something went wrong!',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };

    if (err.name === 'CastError') error = handleCastError(error);

    if (err.code === 11000) error = handleDuplicateError(error);

    if (err.name === 'ValidationError') error = handleValidatorError(error);

    if (err.name === 'JsonWebTokenError') error = handleTokenError();

    if (err.name === 'TokenExpiredError') error = handleExpireError();

    sendErrorProd(error, res);
  }
};
