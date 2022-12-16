const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

// const handleDuplicateFieldDB = (err) => {
//   // const value=err.ermsg.match(//)
//   const message = `Duplicate field value : x. Please use another value ! `;
// };

// eslint-disable-next-line no-unused-vars
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);


  const message = `Invalid Input data. ${errors.join('. ')}`;

  return AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

//WHEN WE LAUNCH OOUR APP ON HEROKU THIS MESSAGE WILL BE SHOWN
const sendErrorProd = (err, res) => {
  console.error('ERROR ❌', err);

  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    //HANDLING THE ERRORS GIVEN BY MONGOOSE, LIKE FALSE ID,DUPLICATE NAME

    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    let error = { ...err };
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    // if (error.code === 11000) error = handleDuplicateFieldDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    sendErrorProd(err, res);
  }
};
